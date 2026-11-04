// PDF report built in the browser with jsPDF; the production build self-hosts the library.
import type { Attempt } from '../types';
import { summarize, pct, cjLabel } from '../engine/exam';
import { CATEGORIES, TOPIC_BY_N } from '../data/blueprint';
import { getItem } from '../data/bank';
import { keyText, responseText } from '../engine/scoring';
import { isMock, cleanItem } from './examClean';
import { saveBlob } from './util';

const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js';
type JsPDF = {
  setFont(f: string, s?: string): void; setFontSize(n: number): void; setTextColor(r: number, g?: number, b?: number): void;
  setFillColor(r: number, g: number, b: number): void; setDrawColor(r: number, g: number, b: number): void;
  text(t: string | string[], x: number, y: number): void; rect(x: number, y: number, w: number, h: number, s?: string): void;
  line(x1: number, y1: number, x2: number, y2: number): void; addPage(): void; splitTextToSize(t: string, w: number): string[];
  output(t: 'blob'): Blob; getNumberOfPages(): number; setPage(n: number): void;
};

let loading: Promise<new (o?: object) => JsPDF> | null = null;
function loadJsPdf(): Promise<new (o?: object) => JsPDF> {
  const w = window as unknown as { jspdf?: { jsPDF: new (o?: object) => JsPDF } };
  if (w.jspdf) return Promise.resolve(w.jspdf.jsPDF);
  if (!loading) loading = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = JSPDF_URL; s.async = true;
    s.onload = () => (w.jspdf ? res(w.jspdf.jsPDF) : rej(new Error('PDF library did not load')));
    s.onerror = () => { loading = null; rej(new Error('PDF library could not be loaded')); };
    document.head.appendChild(s);
  });
  return loading;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
/** ASCII-safe text for the built-in PDF fonts */
const clean = (t: string) => t
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
  .replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/→/g, '->').replace(/×/g, 'x').replace(/÷/g, '/')
  .replace(/₂/g, '2').replace(/⁺/g, '+').replace(/⁻/g, '-').replace(/₃/g, '3').replace(/°/g, ' deg')
  .replace(/✓/g, 'v').replace(/✗/g, 'x').replace(/…/g, '...').replace(/·/g, '-').replace(/♥/g, 'H')
  .replace(/[^\x20-\x7E\n]/g, '');

export async function buildPdf(at: Attempt): Promise<Blob> {
  const JsPDFCtor = await loadJsPdf();
  const doc = new JsPDFCtor({ unit: 'pt', format: 'letter' });
  const s = summarize(at);
  const W = 612, M = 48, maxW = W - M * 2;
  let y = M;
  const need = (h: number) => { if (y + h > 792 - M) { doc.addPage(); y = M; } };
  const para = (t: string, size = 10, bold = false, color: [number, number, number] = [20, 34, 51]) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(clean(t), maxW);
    lines.forEach(l => { need(size * 1.35); doc.text(l, M, y); y += size * 1.35; });
  };
  const h2 = (t: string) => { y += 8; need(30); doc.setDrawColor(11, 122, 117); doc.line(M, y, W - M, y); y += 16; para(t, 13, true); y += 2; };
  const bar = (label: string, v: number, sub = '') => {
    need(16);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(20, 34, 51);
    doc.text(clean(label).slice(0, 42), M, y);
    const bx = M + 230, bw = 200;
    doc.setFillColor(229, 236, 241); doc.rect(bx, y - 8, bw, 8, 'F');
    const c: [number, number, number] = v >= 80 ? [28, 122, 61] : v >= 65 ? [154, 91, 0] : [179, 38, 30];
    doc.setFillColor(...c); doc.rect(bx, y - 8, (bw * v) / 100, 8, 'F');
    doc.text(`${v}% ${clean(sub)}`, bx + bw + 8, y);
    y += 15;
  };

  doc.setFillColor(15, 42, 68); doc.rect(0, 0, W, 70, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('PEDS HESI 2026', M, 34);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text('Clinical Judgment Simulator - practice report', M, 52);
  y = 98;
  para(at.title, 14, true);
  para(`${new Date(at.finishedAt).toLocaleString()}${at.expired ? ' - time expired, submitted automatically' : ''}`, 9.5, false, [74, 93, 109]);
  y += 6;
  para(`Practice percentage: ${pct(s.total)}%   Points: ${r1(s.total.earned)}/${s.total.possible}   Fully correct: ${s.total.full}   Partial: ${s.partial}   Incorrect: ${s.wrong}`, 11, true);
  para('This is a transparent practice percentage. It is not a HESI score and cannot be converted to one.', 9, false, [74, 93, 109]);

  h2('By item type');
  (['traditional', 'ngn', 'case'] as const).forEach(k => s.byType[k] && bar(k === 'traditional' ? 'Traditional items' : k === 'ngn' ? 'Standalone NGN' : 'Unfolding cases', pct(s.byType[k]), `(${r1(s.byType[k].earned)}/${s.byType[k].possible})`));
  if (s.med.n) bar('Medication calculations', pct(s.med), `(${s.med.full}/${s.med.n})`);
  h2('Clinical judgment (NCJMM)');
  (['recognize', 'analyze', 'prioritize', 'generate', 'act', 'evaluate'] as const).forEach(c => s.byCj[c] && bar(cjLabel(c), pct(s.byCj[c])));
  h2('Content areas');
  CATEGORIES.forEach(c => s.byCat[c.id] && bar(c.name, pct(s.byCat[c.id]), `(${s.byCat[c.id].n})`));
  const mock = isMock(at.kind);
  h2('Topics below 80% - review first');
  const weak = Object.entries(s.byTopic).map(([t, b]) => ({ t: Number(t), p: pct(b) })).filter(x => x.p < 80).sort((a, b) => a.p - b.p);
  if (!weak.length) para('No topic scored below 80% in this set.');
  weak.forEach(w => { para(`${mock ? '' : `#${w.t} `}${TOPIC_BY_N[w.t].title} - ${w.p}%`, 10, true); para(`Exam trap: ${TOPIC_BY_N[w.t].traps[0]}`, 9, false, [74, 93, 109]); });

  h2('Question review (missed and partially correct)');
  const missed = at.items.filter(a => a.scored && !a.full);
  if (!missed.length) para('Every scored question was fully correct.');
  missed.forEach(a => {
    const raw = getItem(a.id); if (!raw) return;
    const it = mock ? cleanItem(raw) : raw;
    const n = at.items.indexOf(a) + 1;
    y += 4;
    para(`${n}. ${it.stem}`, 10, true);
    para(`Your answer: ${responseText(it, a.response).join('; ')}`, 9, false, [179, 38, 30]);
    para(`Correct answer: ${keyText(it).join('; ')}`, 9, false, [28, 122, 61]);
    para(`Why: ${it.rationale.correct}`, 9);
    para(`Clue: ${it.rationale.clue}   Points: ${r1(a.earned)}/${a.possible}   Topic: ${it.topics.map(t => (mock ? TOPIC_BY_N[t]?.title ?? '' : '#' + t)).join(', ')}`, 8.5, false, [74, 93, 109]);
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120, 130, 140);
    doc.text(`Page ${i} of ${pages}`, W - M - 50, 792 - 24);
  }
  return doc.output('blob');
}

/** returns a status message for the UI */
export async function downloadPdf(at: Attempt): Promise<string> {
  const blob = await buildPdf(at);
  const saved = await saveBlob(`peds-hesi-report-${new Date(at.finishedAt).toISOString().slice(0, 10)}.pdf`, blob);
  return saved ? 'PDF report ready.' : 'Downloads are not available in this view. Open the app in your browser to save PDFs.';
}
