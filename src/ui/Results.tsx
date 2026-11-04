import React, { useMemo, useState } from 'react';
import { useApp } from './state';
import { summarize, pct, cjLabel, buildPractice } from '../engine/exam';
import type { Breakdown } from '../engine/exam';
import { getItem, ALL_ITEMS } from '../data/bank';
import { CATEGORIES, TOPIC_BY_N } from '../data/blueprint';
import { ItemReview } from './Review';
import { fmtLabel } from './ItemView';
import { fmtTime } from './Exam';
import type { Attempt, CJ, Item } from '../types';
import { saveFile } from './util';
import { downloadPdf } from './pdf';
import { ExamCleanCtx, cleanItem } from './examClean';

export function Bar({ value, label, sub }: { value: number; label: string; sub?: string }) {
  const tone = value >= 80 ? 'good' : value >= 65 ? 'warn' : 'bad';
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <span className="bar"><span className={'bar-fill ' + tone} style={{ width: `${value}%` }} /></span>
      <span className="bar-val mono">{value}%{sub ? <span className="muted"> {sub}</span> : null}</span>
    </div>
  );
}

const CJS: CJ[] = ['recognize', 'analyze', 'prioritize', 'generate', 'act', 'evaluate'];

export function Results({ id }: { id: string }) {
  const { store, go, update } = useApp();
  const at = store.attempts.find(a => a.id === id);
  const [filter, setFilter] = useState<'all' | 'wrong' | 'partial' | 'right' | 'unscored'>('wrong');
  const [open, setOpen] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfMsg, setPdfMsg] = useState('');
  const s = useMemo(() => (at ? summarize(at) : null), [at]);
  if (!at || !s) return <main className="page"><p>Result not found.</p></main>;

  const weakTopics = Object.entries(s.byTopic).map(([t, b]) => ({ t: Number(t), p: pct(b), b })).filter(x => x.p < 80).sort((a, b) => a.p - b.p).slice(0, 6);
  const practiceTopics = (topics: number[]) => {
    const items = topics.flatMap(t => topicItems(t)).filter((x, i, a) => a.indexOf(x) === i);
    const ex = buildPractice('tutor', 'Remediation — weak topics', items.slice(0, 20), store.settings, { tutor: true, timed: false });
    update(st => ({ ...st, active: ex })); go({ name: 'exam' });
  };
  const rows = at.items.filter(a => {
    if (filter === 'unscored') return !a.scored;
    if (!a.scored) return filter === 'all';
    if (filter === 'wrong') return a.earned === 0;
    if (filter === 'partial') return a.earned > 0 && !a.full;
    if (filter === 'right') return a.full;
    return true;
  });
  const total = pct(s.total);
  const isSim = ['hesi', 'formA', 'formB', 'extended'].includes(at.kind);
  // the Mock Exam results and review show no citations; other sessions keep their source mapping
  const view = (i: Item | undefined) => (i && isSim ? cleanItem(i) : i);

  return (
    <ExamCleanCtx.Provider value={isSim}>
    <main className="page">
      <header className="page-head">
        <div><p className="eyebrow">Results · {new Date(at.finishedAt).toLocaleString()}</p><h1>{at.title}</h1>
          {at.expired && <p className="warn-t">Time expired — the exam was submitted automatically.</p>}</div>
        <div className="row gap wrap">
          <button className="btn" disabled={pdfBusy} onClick={async () => { setPdfBusy(true); setPdfMsg(''); try { setPdfMsg(await downloadPdf(at)); } catch (e) { setPdfMsg((e as Error).message + ' — use the HTML report instead.'); } setPdfBusy(false); }}>{pdfBusy ? 'Building PDF…' : 'Download PDF report'}</button>
          <button className="btn ghost" onClick={() => exportReport(at)}>HTML report</button>
          <button className="btn primary" onClick={() => go({ name: 'dashboard' })}>Dashboard</button>
        </div>
      </header>

      {pdfMsg && <p className="notice small" role="status">{pdfMsg}</p>}
      <section className="stat-strip">
        <div className="stat big"><span className="stat-n">{total}%</span><span className="stat-l">Practice percentage</span></div>
        <div className="stat"><span className="stat-n mono">{round1(s.total.earned)}/{s.total.possible}</span><span className="stat-l">Points earned</span></div>
        <div className="stat"><span className="stat-n">{s.total.full}</span><span className="stat-l">Fully correct</span></div>
        <div className="stat"><span className="stat-n">{s.partial}</span><span className="stat-l">Partially correct</span></div>
        <div className="stat"><span className="stat-n">{s.wrong}</span><span className="stat-l">Incorrect (0 pts)</span></div>
        <div className="stat"><span className="stat-n mono">{fmtTime(s.avgMs)}</span><span className="stat-l">Avg time / item</span></div>
      </section>
      <p className="muted small disclaimer">This is a practice percentage from this simulator’s transparent scoring. It is not a HESI score and cannot be converted to one — Elsevier’s scoring is proprietary and weights items by difficulty.{s.unscored.length ? ` ${s.unscored.length} items were simulated unscored (pilot) items and are excluded from the totals, as on the real exam.` : ''}</p>

      <div className="grid-2">
        <section className="panel">
          <h2>By item type</h2>
          {(['traditional', 'ngn', 'case'] as const).map(k => s.byType[k] ? <Bar key={k} label={k === 'traditional' ? 'Traditional items' : k === 'ngn' ? 'Standalone NGN' : 'Unfolding cases'} value={pct(s.byType[k])} sub={`(${round1(s.byType[k].earned)}/${s.byType[k].possible})`} /> : null)}
          {s.med.n > 0 && <Bar label="Medication calculations" value={pct(s.med)} sub={`(${s.med.full}/${s.med.n} items)`} />}
          <h3 className="mt">Clinical judgment (NCJMM)</h3>
          {CJS.map(c => s.byCj[c] ? <Bar key={c} label={cjLabel(c)} value={pct(s.byCj[c])} /> : null)}
          <h3 className="mt">By difficulty</h3>
          {['1', '2', '3', '4'].map(d => s.byDiff[d] ? <Bar key={d} label={['', 'Recall', 'Application', 'Analysis', 'Complex judgment'][Number(d)]} value={pct(s.byDiff[d])} sub={`(${s.byDiff[d].n})`} /> : null)}
        </section>
        <section className="panel">
          <h2>By content area</h2>
          {CATEGORIES.map(c => s.byCat[c.id] ? <Bar key={c.id} label={c.name} value={pct(s.byCat[c.id])} sub={`(${s.byCat[c.id].n})`} /> : <div key={c.id} className="bar-row muted small"><span className="bar-label">{c.name}</span><span>not tested in this set</span></div>)}
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2>Personalized remediation plan</h2>
          {weakTopics.length ? (
            <>
              <ol className="plan">
                {weakTopics.map(w => (
                  <li key={w.t}><button className="linkish" onClick={() => go({ name: 'blueprint', topic: w.t })}>{isSim ? '' : `#${w.t} `}{TOPIC_BY_N[w.t].title}</button> <span className="mono muted">{w.p}%</span>
                    <div className="small muted">Exam trap: {TOPIC_BY_N[w.t].traps[0]}</div></li>
                ))}
              </ol>
              <button className="btn primary" onClick={() => practiceTopics(weakTopics.map(w => w.t))}>Practice these topics in tutor mode</button>
            </>
          ) : <p>No topic scored below 80% in this set.</p>}
          {s.highConfWrong.length > 0 && <>
            <h3 className="mt">High-confidence misses ({s.highConfWrong.length})</h3>
            <p className="small muted">You felt sure and were wrong — these are the misconceptions to fix first.</p>
            <ul className="tight">{s.highConfWrong.map(i => <li key={i}><button className="linkish" onClick={() => { setFilter('all'); setOpen(i); }}>{view(getItem(i))?.stem.slice(0, 90)}…</button></li>)}</ul>
          </>}
        </section>
        <section className="panel">
          <h2>Frequently missed nursing priorities</h2>
          {Object.keys(s.priorities).length ? <ul className="tight">{Object.entries(s.priorities).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([p, n]) => <li key={p}><span className="mono">{n}×</span> {p}</li>)}</ul> : <p>None — every priority was identified.</p>}
          <h3 className="mt">Topics tested</h3>
          <div className="topic-dots">{Object.entries(s.byTopic).sort((a, b) => Number(a[0]) - Number(b[0])).map(([t, b]) => <span key={t} title={`${isSim ? '' : `#${t} `}${TOPIC_BY_N[Number(t)].title}: ${pct(b)}%`} className={'tdot ' + tone(pct(b))}>{t}</span>)}</div>
        </section>
      </div>

      <section className="panel">
        <div className="row between wrap"><h2>Question-by-question review</h2>
          <div className="seg" role="tablist">
            {(['wrong', 'partial', 'right', 'all', ...(s.unscored.length ? ['unscored' as const] : [])] as const).map(f => <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{{ wrong: 'Incorrect', partial: 'Partial', right: 'Correct', all: 'All', unscored: 'Unscored' }[f]}</button>)}
          </div>
        </div>
        <ul className="qlist">
          {rows.map(a => {
            const it = view(getItem(a.id)) as Item; const n = at.items.indexOf(a) + 1;
            return (
              <li key={a.id} className="qrow">
                <button className="qrow-head" aria-expanded={open === a.id} onClick={() => setOpen(open === a.id ? null : a.id)}>
                  <span className="mono qn">{n}</span>
                  <span className={'dot ' + (!a.scored ? 'muted-d' : a.full ? 'ok' : a.earned > 0 ? 'part' : 'bad')} aria-hidden />
                  <span className="grow qtxt">{it.stem}</span>
                  <span className="muted small nowrap">{fmtLabel(it)} · {round1(a.earned)}/{a.possible} · {fmtTime(a.ms)}{a.conf ? ` · confidence ${a.conf}/5` : ''}{!a.scored ? ' · unscored' : ''}</span>
                </button>
                {open === a.id && <ItemReview item={it} response={a.response} onTopic={t => go({ name: 'blueprint', topic: t })} mistake={store.mistakes?.[a.id]} onMistake={m => update(s => ({ ...s, mistakes: { ...(s.mistakes ?? {}), [a.id]: { type: m, at: Date.now() } } }))} />}
              </li>
            );
          })}
          {!rows.length && <li className="muted">No items in this group.</li>}
        </ul>
      </section>
      {isSim && <p className="muted small">Content-area balance follows a 69-topic pediatric blueprint. It does not reflect Elsevier’s confidential item distribution.</p>}
    </main>
    </ExamCleanCtx.Provider>
  );
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const tone = (p: number) => (p >= 80 ? 'good' : p >= 65 ? 'warn' : 'bad');
function topicItems(t: number): Item[] {
  return ALL_ITEMS.filter(i => i.topics.includes(t) && !i.caseId);
}

function exportReport(at: Attempt) {
  const s = summarize(at);
  const mock = ['hesi', 'formA', 'formB', 'extended'].includes(at.kind);
  const esc = (x: string) => x.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
  const line = (l: string, b: Breakdown) => `<tr><td>${esc(l)}</td><td>${pct(b)}%</td><td>${round1(b.earned)}/${b.possible}</td></tr>`;
  const html = `<!doctype html><meta charset="utf-8"><title>${esc(at.title)}</title><style>body{font:14px/1.5 system-ui;max-width:800px;margin:24px auto;padding:0 16px}table{border-collapse:collapse;width:100%;margin:8px 0 20px}td,th{border:1px solid #ccc;padding:4px 8px;text-align:left}h1{font-size:20px}</style>
<h1>${esc(at.title)}</h1><p>${new Date(at.finishedAt).toLocaleString()} · Practice percentage <b>${pct(s.total)}%</b> (${round1(s.total.earned)}/${s.total.possible} points). Not a HESI score.</p>
<h2>Content areas</h2><table>${CATEGORIES.filter(c => s.byCat[c.id]).map(c => line(c.name, s.byCat[c.id])).join('')}</table>
<h2>Clinical judgment</h2><table>${CJS.filter(c => s.byCj[c]).map(c => line(cjLabel(c), s.byCj[c])).join('')}</table>
<h2>Topics</h2><table>${Object.entries(s.byTopic).map(([t, b]) => line(`${mock ? '' : `#${t} `}${TOPIC_BY_N[Number(t)].title}`, b)).join('')}</table>
<h2>Items</h2><table><tr><th>#</th><th>Item</th><th>Points</th></tr>${at.items.map((a, i) => `<tr><td>${i + 1}</td><td>${esc((mock ? cleanItem(getItem(a.id)) : getItem(a.id))?.stem ?? a.id)}</td><td>${a.scored ? `${round1(a.earned)}/${a.possible}` : 'unscored'}</td></tr>`).join('')}</table>`;
  saveFile(`peds-hesi-report-${new Date(at.finishedAt).toISOString().slice(0, 10)}.html`, html, 'text/html');
}

