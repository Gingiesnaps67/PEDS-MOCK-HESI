import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from './state';
import type { Store } from '../types';
import { SRS_DAYS } from '../engine/exam';
import { VITAL_TABLES, VITAL_TECHNIQUE, VITAL_RED_FLAGS, CAR_SEAT, SAFETY_BY_AGE, IMMUNIZATIONS, VACCINE_RULES, PRECAUTIONS, COMPARE, MED_CARDS, CURRENT_GUIDANCE } from '../data/rapid';
import type { Sourced } from '../data/rapid';
import { STAGES, CHECKPOINTS, GAMES, COACH_STEPS, DOMAINS } from '../data/growth';
import type { GameQ } from '../data/growth';
import { SOURCE_FILES, DISCREPANCIES } from '../data/sources';
import { EriksonGame } from './Erikson';
import { PiagetCenter } from './Piaget';
import { STAGES as STAGES_E } from '../data/eriksonData';
import { ALL_ITEMS } from '../data/bank';
import { verifyOf, UNVERIFIED, VERIFY_LABEL } from '../data/verify';

const DAY = 864e5;
/** spaced repetition for reference cards and game questions: 1 → 3 → 7 → 14 → 30 days */
export function srsUpdate(s: Store, key: string, correct: boolean): Store {
  const rapid = s.rapid ?? { games: {}, cards: {} };
  const c = rapid.cards[key] ?? { due: 0, step: -1, right: 0, wrong: 0 };
  const step = correct ? Math.min(c.step + 1, SRS_DAYS.length - 1) : 0;
  const due = Date.now() + SRS_DAYS[step] * DAY;
  return { ...s, rapid: { ...rapid, cards: { ...rapid.cards, [key]: { due, step, right: c.right + (correct ? 1 : 0), wrong: c.wrong + (correct ? 0 : 1) } } } };
}
function gameUpdate(s: Store, key: string, correct: boolean): Store {
  const rapid = s.rapid ?? { games: {}, cards: {} };
  const g = rapid.games[key] ?? { n: 0, correct: 0, last: 0 };
  return { ...s, rapid: { ...rapid, games: { ...rapid.games, [key]: { n: g.n + 1, correct: g.correct + (correct ? 1 : 0), last: Date.now() } } } };
}

export const SrcChip = ({ src, flag }: { src: string; flag?: string }) => (
  <span className="src-line"><span className="chip src-chip" title="Uploaded source">Source: {src}</span>{flag && <span className="chip trap-chip" title="Source conflict">⚠ {flag}</span>}</span>
);
const SList = ({ items }: { items: Sourced[] }) => (
  <ul className="s-list">{items.map((i, k) => <li key={k}>{i.text} <SrcChip src={i.src} flag={i.flag} /></li>)}</ul>
);

/* ================================================================ RAPID REVIEW OVERLAY */
const TABS = [['vitals', 'Vitals'], ['prec', 'Precautions'], ['compare', 'Compare'], ['meds', 'Med cards'], ['safety', 'Safety & car seats'], ['imm', 'Immunizations'], ['growth', 'Growth & Dev'], ['erikson', 'Erikson'], ['piaget', 'Piaget'], ['current', 'Source vs Current']] as const;
type Tab = typeof TABS[number][0];

export function RapidReviewButton() {
  const { view, store } = useApp();
  const [open, setOpen] = useState(false);
  const inExam = view.name === 'exam' && !!store.active;
  useEffect(() => {
    const h = () => setOpen(true); const c = () => setOpen(false);
    window.addEventListener('peds-open-ref', h); window.addEventListener('peds-close-ref', c);
    return () => { window.removeEventListener('peds-open-ref', h); window.removeEventListener('peds-close-ref', c); };
  }, []);
  return (
    <>
      <button type="button" className={'ref-fab' + (inExam ? ' in-exam' : '')} aria-haspopup="dialog" aria-label="Open Rapid Review reference" onClick={() => { setOpen(true); if (inExam) window.dispatchEvent(new CustomEvent('peds-ref-opened')); }}>
        <span aria-hidden>⚡</span><span className="ref-fab-t">Rapid Review</span>
      </button>
      {open && <RapidOverlay onClose={() => setOpen(false)} inExam={inExam} />}
    </>
  );
}

function RapidOverlay({ onClose, inExam }: { onClose: () => void; inExam: boolean }) {
  const [tab, setTab] = useState<Tab>('vitals');
  const [q, setQ] = useState('');
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => { window.removeEventListener('keydown', k); prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="ref-back" role="presentation" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ref-panel" role="dialog" aria-modal="true" aria-labelledby="ref-h" tabIndex={-1} ref={box}>
        <div className="ref-head">
          <h2 id="ref-h">⚡ Rapid Review</h2>
          <input type="search" className="ref-search" placeholder="Search all reference cards…" aria-label="Search Rapid Review" value={q} onChange={e => setQ(e.target.value)} />
          <button type="button" className="btn small" onClick={onClose}>Close <span className="muted">(Esc)</span></button>
        </div>
        {inExam && <p className="ref-note">Your exam is paused in place — your answer and position are kept. Sessions where Rapid Review is opened are excluded from the readiness estimate.</p>}
        {q.trim() ? <SearchResults q={q.trim().toLowerCase()} /> : (
          <>
            <div className="ref-tabs" role="tablist" aria-label="Rapid Review sections">
              {TABS.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={'ref-tab t-' + id + (tab === id ? ' on' : '')} onClick={() => setTab(id)}>{label}</button>)}
            </div>
            <div className="ref-body" role="tabpanel">
              {tab === 'vitals' && <VitalsRef />}
              {tab === 'prec' && <PrecautionsRef />}
              {tab === 'compare' && <CompareRef />}
              {tab === 'meds' && <MedCards />}
              {tab === 'safety' && <SafetyRef />}
              {tab === 'imm' && <ImmRef />}
              {tab === 'growth' && <GrowthMini />}
              {tab === 'erikson' && <EriksonQuick />}
              {tab === 'piaget' && <PiagetQuick />}
              {tab === 'current' && <CurrentRef />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** flatten every reference entry for search */
function useIndex() {
  return useMemo(() => {
    const out: { where: string; text: string; src: string }[] = [];
    VITAL_TECHNIQUE.forEach(a => a.items.forEach(i => out.push({ where: 'Vitals · ' + a.area, text: i.text, src: i.src })));
    VITAL_RED_FLAGS.forEach(i => out.push({ where: 'Vitals · red flags', text: i.text, src: i.src }));
    PRECAUTIONS.forEach(p => out.push({ where: 'Precautions · ' + p.type, text: `${p.what} Examples: ${p.examples}`, src: p.src }));
    COMPARE.forEach(c => c.rows.forEach(r => out.push({ where: 'Compare · ' + c.title, text: `${r[0]}: ${c.a} — ${r[1]}; ${c.b} — ${r[2]}`, src: c.src.join(' · ') })));
    MED_CARDS.forEach(m => out.push({ where: 'Med card · ' + m.name, text: `${m.cls}. ${m.use}. ${m.key.join('. ')}. ${m.teach.join('. ')}`, src: m.src.join(' · ') }));
    SAFETY_BY_AGE.forEach(a => a.items.forEach(i => out.push({ where: 'Safety · ' + a.age, text: i.text, src: i.src })));
    CAR_SEAT.forEach(c => out.push({ where: 'Car seats', text: `${c.step}: ${c.detail}`, src: c.src }));
    IMMUNIZATIONS.forEach(i => out.push({ where: 'Immunizations · ' + i.age, text: i.vaccines + (i.note ? ' — ' + i.note : ''), src: i.src }));
    STAGES.forEach(s => s.rows.forEach(r => out.push({ where: `Growth · ${s.name} · ${r.label}`, text: r.text, src: r.src })));
    return out;
  }, []);
}
function SearchResults({ q }: { q: string }) {
  const idx = useIndex();
  const words = q.split(/\s+/).filter(Boolean);
  const hits = idx.filter(e => words.every(w => (e.text + ' ' + e.where).toLowerCase().includes(w))).slice(0, 40);
  return (
    <div className="ref-body" aria-live="polite">
      <p className="muted small">{hits.length ? `${hits.length} match${hits.length === 1 ? '' : 'es'}` : 'No matches in your uploaded sources.'}</p>
      <ul className="s-list">{hits.map((h, k) => <li key={k}><strong className="small">{h.where}</strong><br />{h.text} <SrcChip src={h.src} /></li>)}</ul>
    </div>
  );
}

function VitalsRef() {
  const { go } = useApp();
  const [t, setT] = useState(VITAL_TABLES[0].id);
  const tb = VITAL_TABLES.find(v => v.id === t)!;
  return (
    <div className="ref-sec c-vitals">
      <button className="btn primary" onClick={() => { window.dispatchEvent(new CustomEvent('peds-close-ref')); go({ name: 'vitals' }); }}>❤️ Open the full Vital Signs & Growth center (birth–17, ⚖️ weight, 📈 charts, games)</button>
      <h3>Vital signs by age — each source shown separately</h3>
      <p className="small muted">Your sources do not give numeric "concerning" or "emergency" cut-offs, so this card shows each source’s expected values plus the red flags the sources DO state. Differences are in the Discrepancy Log (D11).</p>
      <div className="seg" role="tablist" aria-label="Vital-sign source">{VITAL_TABLES.map(v => <button key={v.id} role="tab" aria-selected={t === v.id} className={t === v.id ? 'on' : ''} onClick={() => setT(v.id)}>{v.title}</button>)}</div>
      <table className="vt">
        <caption className="small"><SrcChip src={tb.src} />{tb.kind === 'average' && <span className="chip trap-chip">Averages, not ranges</span>}</caption>
        <thead><tr><th scope="col">Age</th><th scope="col">HR /min</th><th scope="col">RR /min</th><th scope="col">BP mm Hg</th></tr></thead>
        <tbody>{tb.rows.map(r => <tr key={r.age}><th scope="row">{r.age}</th><td>{r.hr ?? '—'}</td><td>{r.rr ?? '—'}</td><td>{r.bp ?? '—'}</td></tr>)}</tbody>
      </table>
      {tb.note && <p className="small muted">{tb.note}</p>}
      <h4 className="h-critical">Red flags stated in your sources</h4>
      <SList items={VITAL_RED_FLAGS} />
      {VITAL_TECHNIQUE.map(a => <div key={a.area}><h4>{a.area}</h4><SList items={a.items} /></div>)}
    </div>
  );
}
function PrecautionsRef() {
  return (
    <div className="ref-sec">
      <h3>Isolation precautions</h3>
      <p className="small">Memory: <strong>Contact = touch</strong>, <strong>Droplet = drops within 3 ft</strong>, <strong>Airborne = Alone</strong> (negative pressure). Airborne trio "MTV": Measles, TB, Varicella.</p>
      <div className="prec-grid">{PRECAUTIONS.map(p => (
        <article key={p.type} className={'prec-card pc-' + p.color}>
          <h4>{p.type}</h4><p>{p.what}</p><p className="small"><strong>Examples:</strong> {p.examples}</p><SrcChip src={p.src} flag={p.flag} />
        </article>
      ))}</div>
    </div>
  );
}
function CompareRef() {
  const [id, setId] = useState(COMPARE[0].id);
  const c = COMPARE.find(x => x.id === id)!;
  return (
    <div className="ref-sec">
      <h3>Look-alike conditions</h3>
      <label className="small">Compare: <select value={id} onChange={e => setId(e.target.value)}>{COMPARE.map(x => <option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
      <div className="cmp">
        <div className="cmp-row cmp-h"><span /><strong>{c.a}</strong><strong>{c.b}</strong></div>
        {c.rows.map(r => <div key={r[0]} className="cmp-row"><span className="cmp-k">{r[0]}</span><span><span className="cmp-mlabel">{c.a}: </span>{r[1]}</span><span><span className="cmp-mlabel">{c.b}: </span>{r[2]}</span></div>)}
      </div>
      <p className="key-line">🔑 {c.key}</p>
      <SrcChip src={c.src.join(' · ')} />
    </div>
  );
}
export function MedCards() {
  const { store, update } = useApp();
  const cards = store.rapid?.cards ?? {};
  const order = useMemo(() => [...MED_CARDS].sort((a, b) => (cards['m:' + a.id]?.due ?? 0) - (cards['m:' + b.id]?.due ?? 0)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const m = order[i % order.length];
  const st = cards['m:' + m.id];
  const due = order.filter(c => (cards['m:' + c.id]?.due ?? 0) <= Date.now()).length;
  const mark = (ok: boolean) => { update(s => srsUpdate(s, 'm:' + m.id, ok)); setFlip(false); setI(i + 1); };
  return (
    <div className="ref-sec">
      <h3>Medication flashcards</h3>
      <p className="small muted">{due} card{due === 1 ? '' : 's'} due · spaced repetition 1 → 3 → 7 days (then 14, 30). Card {(i % order.length) + 1} of {order.length}.</p>
      <div className={'flash' + (m.color ? ' fc-' + m.color : '')}>
        <p className="flash-name">{m.name}</p>
        {!flip ? <button className="btn primary" onClick={() => setFlip(true)}>Show the card</button> : (
          <div className="flash-back">
            <p><strong>{m.cls}</strong> — {m.use}</p>
            <h5>Know</h5><ul>{m.key.map(k => <li key={k}>{k}</li>)}</ul>
            <h5>Teach</h5><ul>{m.teach.map(k => <li key={k}>{k}</li>)}</ul>
            <SrcChip src={m.src.join(' · ')} />
            <div className="row gap"><button className="btn good" onClick={() => mark(true)}>I knew it</button><button className="btn" onClick={() => mark(false)}>Review again</button></div>
          </div>
        )}
        {st && <p className="small muted">Your record: {st.right} right · {st.wrong} to review · next in {Math.max(0, Math.round((st.due - Date.now()) / DAY))} d</p>}
      </div>
    </div>
  );
}
function SafetyRef() {
  return (
    <div className="ref-sec c-safety">
      <h3>Car-seat guide (instructor deck rules)</h3>
      <ol className="seat-steps">{CAR_SEAT.map(c => <li key={c.step}><strong>{c.step}</strong> — {c.detail} <SrcChip src={c.src} flag={c.flag} /></li>)}</ol>
      <h3>Safety by age — and WHY (the developmental reason)</h3>
      {SAFETY_BY_AGE.map(a => <div key={a.age} className="safe-age"><h4>{a.age}</h4><p className="small why-line">Why: {a.why}</p><SList items={a.items} /></div>)}
    </div>
  );
}
function ImmRef() {
  return (
    <div className="ref-sec">
      <h3>Immunization timeline (from your course sources)</h3>
      <ol className="imm-line">{IMMUNIZATIONS.map(i => <li key={i.age}><span className="imm-age">{i.age}</span><span>{i.vaccines}{i.note && <span className="small muted"> — {i.note}</span>} <SrcChip src={i.src} /></span></li>)}</ol>
      <h4>Rules from your sources</h4>
      <SList items={VACCINE_RULES} />
    </div>
  );
}
function GrowthMini() {
  const { go } = useApp();
  return (
    <div className="ref-sec c-growth">
      <h3>Theorist quick table</h3>
      <TheoristTable />
      <button className="btn primary" onClick={() => { window.dispatchEvent(new CustomEvent('peds-close-ref')); go({ name: 'growth' }); }}>Open the full Growth & Development Mastery Center</button>
      <button className="btn" onClick={() => { try { sessionStorage.setItem('peds-gd-tab', 'erikson'); } catch { /* */ } window.dispatchEvent(new CustomEvent('peds-close-ref')); go({ name: 'growth' }); }}>Play Erikson’s Stages — Match, Order & Master</button>
    </div>
  );
}
function EriksonQuick() {
  const { go } = useApp();
  const open = () => { try { sessionStorage.setItem('peds-gd-tab', 'erikson'); } catch { /* */ } window.dispatchEvent(new CustomEvent('peds-close-ref')); go({ name: 'growth' }); };
  return (
    <div className="ref-sec c-growth">
      <h3>Erikson in 10 seconds</h3>
      <p className="es-mnemonic">🔑 <strong>T</strong>rust <strong>A</strong>lways <strong>I</strong>nitiates <strong>I</strong>ndustrious <strong>I</strong>dentity</p>
      <ol className="eq-list">{STAGES_E.map(s => <li key={s.id} className={'es-' + s.id}><span aria-hidden>{s.icon}</span> <strong>{s.stage}</strong> — {s.group}, {s.ages} <em>{s.hook}</em></li>)}</ol>
      <SrcChip src="Lecture 09/30 · Course PowerPoint: Basic Peds Nursing Care · ATI reference (adolescence 12–20)" />
      <button className="btn primary" onClick={open}>Open the Erikson Mastery Center (6 games + final 15)</button>
    </div>
  );
}
function PiagetQuick() {
  const { go } = useApp();
  const open = () => { try { sessionStorage.setItem('peds-gd-tab', 'piaget'); } catch { /* */ } window.dispatchEvent(new CustomEvent('peds-close-ref')); go({ name: 'growth' }); };
  const rows: [string, string, string, string][] = [['ps-sensorimotor', 'Sensorimotor', 'Birth–2', 'SENSE it + MOVE it · object permanence (~9 mo)'], ['ps-preoperational', 'Preoperational', '~2–7', 'PRETEND + ME · magical thinking, egocentrism, animism'], ['ps-concrete', 'Concrete operational', '~7–11', 'I can SEE it · conservation, classification, rules'], ['ps-formal', 'Formal operational', '~11–12+', 'WHAT IF? · abstract, hypothetical']];
  return (
    <div className="ref-sec c-growth">
      <h3>Piaget in 10 seconds</h3>
      <p className="es-mnemonic">SENSE → PRETEND → CONCRETE → ABSTRACT</p>
      <ol className="eq-list">{rows.map(r => <li key={r[1]} className={r[0]}><strong>{r[1]}</strong> ({r[2]}) — {r[3]}</li>)}</ol>
      <SrcChip src="Course PowerPoint · Review #25/#26 · ATI · standard ages from your request" />
      <button className="btn primary" onClick={open}>Open the Piaget Center</button>
    </div>
  );
}
function CurrentRef() {
  return (
    <div className="ref-sec current-panel">
      <h3>Source vs. Current Guidance</h3>
      <p className="small"><strong>Separate panel.</strong> Information here came from outside your uploaded files (looked up before the source lock). It is NEVER used in lessons, answer keys, or scored questions. Your exam answers follow your course sources.</p>
      {CURRENT_GUIDANCE.map(c => (
        <article key={c.topic} className="cg-card">
          <h4>{c.topic}</h4>
          <p><span className="chip src-chip">Your sources</span> {c.source}</p>
          <p><span className="chip cg-chip">Current guidance (outside)</span> {c.current}</p>
          <p className="small muted">{c.asOf}</p>
        </article>
      ))}
    </div>
  );
}

/* ================================================================ THEORIST TABLE */
export function TheoristTable() {
  return (
    <div className="theory" role="table" aria-label="Erikson, Piaget, and Freud by age group">
      <div className="th-row th-head" role="row"><span role="columnheader">Age group</span><span role="columnheader">Erikson (psychosocial)</span><span role="columnheader">Piaget (cognitive)</span><span role="columnheader">Freud (psychosexual)</span></div>
      {STAGES.map(s => (
        <div key={s.id} className={'th-row st-' + s.id} role="row">
          <span role="rowheader"><strong>{s.name}</strong><br /><span className="small">{s.band}</span></span>
          <span role="cell"><span className="th-m">Erikson: </span>{s.erikson}</span>
          <span role="cell"><span className="th-m">Piaget: </span>{s.piaget}</span>
          <span role="cell"><span className="th-m">Freud: </span>{s.freud}</span>
        </div>
      ))}
      <p className="small muted">Source: ATI developmental milestone reference; lecture 09/30; course PowerPoint. ⚠ The ATI table labels the Freud row "psychosocial" — Freud’s stages are psychosexual (Discrepancy D1).</p>
    </div>
  );
}

/* ================================================================ GROWTH & DEVELOPMENT MASTERY CENTER */
export function GrowthPage() {
  const [sec, setSec] = useState<'stages' | 'table' | 'timeline' | 'erikson' | 'piaget' | 'games' | 'mastery'>(() => { try { const t = sessionStorage.getItem('peds-gd-tab'); sessionStorage.removeItem('peds-gd-tab'); return t === 'erikson' || t === 'piaget' ? t : 'stages'; } catch { return 'stages'; } });
  return (
    <main className="page growth-page">
      <header className="page-head">
        <p className="eyebrow">🧠 Growth & Development Mastery</p>
        <h1>Growth & Development Mastery Center</h1>
        <p className="muted">Built only from your uploaded sources. Where sources give ranges, ranges are kept.</p>
      </header>
      <div className="seg big" role="tablist" aria-label="Growth & Development sections">
        {([['stages', 'Stage cards'], ['table', 'Theorist table'], ['timeline', 'Timeline'], ['erikson', '🧠 Erikson Center'], ['piaget', '💡 Piaget Center'], ['games', 'Games'], ['mastery', 'My mastery']] as const).map(([id, l]) =>
          <button key={id} role="tab" aria-selected={sec === id} className={sec === id ? 'on' : ''} onClick={() => setSec(id)}>{l}</button>)}
      </div>
      {sec === 'stages' && <StageCards />}
      {sec === 'table' && <section className="panel"><h2>Theorists at a glance</h2><TheoristTable /><DomainTable /></section>}
      {sec === 'timeline' && <Timeline />}
      {sec === 'erikson' && <EriksonGame />}
      {sec === 'piaget' && <PiagetCenter />}
      {sec === 'games' && <Games />}
      {sec === 'mastery' && <Mastery />}
    </main>
  );
}
function StageCards() {
  const [id, setId] = useState(STAGES[0].id);
  const s = STAGES.find(x => x.id === id)!;
  return (
    <section className="panel">
      <div className="seg" role="tablist" aria-label="Age group">{STAGES.map(x => <button key={x.id} role="tab" aria-selected={id === x.id} className={'st-tab st-' + x.id + (id === x.id ? ' on' : '')} onClick={() => setId(x.id)}>{x.name}</button>)}</div>
      <article className={'stage-card st-' + s.id}>
        <h2>{s.name} <span className="muted small">{s.band}</span></h2>
        <p className="analogy">💡 {s.analogy}</p>
        <div className="theory-mini"><span><strong>Erikson</strong> {s.erikson}</span><span><strong>Piaget</strong> {s.piaget}</span><span><strong>Freud</strong> {s.freud}</span></div>
        <dl className="stage-dl">{s.rows.map(r => <React.Fragment key={r.label}><dt>{r.label}</dt><dd>{r.text} <SrcChip src={r.src} flag={r.flag} /></dd></React.Fragment>)}</dl>
      </article>
    </section>
  );
}
function DomainTable() {
  const labels = ['Physical growth', 'Play', 'Nutrition', 'Injury prevention'];
  return (
    <details className="domain-table">
      <summary>Expand: compare domains across ages</summary>
      {labels.map(l => (
        <div key={l} className="dt-block"><h4>{l}</h4>
          {STAGES.map(s => { const r = s.rows.find(x => x.label.startsWith(l.split(' ')[0])); return r ? <p key={s.id} className={'dt-line st-' + s.id}><strong>{s.name}:</strong> {r.text}</p> : null; })}
        </div>
      ))}
    </details>
  );
}
function Timeline() {
  const { update } = useApp();
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const c = CHECKPOINTS[i];
  return (
    <section className="panel">
      <h2>Developmental timeline</h2>
      <div className="tl-chips" role="tablist" aria-label="Age checkpoints">{CHECKPOINTS.map((x, k) => <button key={x.age} role="tab" aria-selected={k === i} className={'tl-chip st-' + x.stage + (k === i ? ' on' : '')} onClick={() => { setI(k); setPick(null); }}>{x.age}</button>)}</div>
      <article className={'tl-card st-' + c.stage}>
        <h3>{c.age} <span className="chip">{STAGES.find(s => s.id === c.stage)!.name}</span></h3>
        <div className="tl-grid">
          <div><h4>Milestones</h4><ul>{c.milestones.map(m => <li key={m}>{m}</li>)}</ul></div>
          <div className="c-safety"><h4>Safety</h4><p>{c.safety}</p><p className="small why-line">Why: {c.why}</p></div>
          <div><h4>Parent teaching</h4><p>{c.teaching}</p></div>
          <div><h4>Activities</h4><p>{c.activities}</p></div>
        </div>
        <SrcChip src={c.src.join(' · ')} />
        <div className="mini-q">
          <p><strong>Quick check:</strong> {c.q.stem}</p>
          <div className="mq-opts">{c.q.options.map((o, k) => (
            <button key={o} disabled={pick !== null} className={'btn' + (pick !== null && k === c.q.answer ? ' good' : pick === k ? ' bad-b' : '')}
              onClick={() => { setPick(k); update(s => gameUpdate(srsUpdate(s, 'tl:' + c.age, k === c.q.answer), 'gd:warning', k === c.q.answer)); }}>{o}</button>))}</div>
          {pick !== null && <p role="status" className={pick === c.q.answer ? 'good-t' : 'bad-t'}>{pick === c.q.answer ? 'Correct. ' : 'Not quite. '}{c.q.why}</p>}
        </div>
      </article>
      <div className="row gap"><button className="btn" disabled={i === 0} onClick={() => { setI(i - 1); setPick(null); }}>← Earlier</button><button className="btn" disabled={i === CHECKPOINTS.length - 1} onClick={() => { setI(i + 1); setPick(null); }}>Later →</button></div>
    </section>
  );
}
function Games() {
  const { store, update } = useApp();
  const [gid, setGid] = useState<string | null>(null);
  const [k, setK] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [coach, setCoach] = useState(false);
  const [score, setScore] = useState(0);
  const game = GAMES.find(g => g.id === gid);
  const qs: GameQ[] = useMemo(() => {
    if (!game) return [];
    const cards = store.rapid?.cards ?? {};
    // due or never-seen questions first (spaced repetition)
    return [...game.qs].sort((a, b) => (cards['g:' + a.id]?.due ?? 0) - (cards['g:' + b.id]?.due ?? 0));
  }, [gid]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!game) return (
    <section className="panel">
      <h2>Retention games</h2>
      <div className="game-grid">{GAMES.map(g => {
        const st = g.qs.reduce((a, q) => { const c = store.rapid?.cards?.['g:' + q.id]; return { n: a.n + (c ? 1 : 0), due: a.due + (!c || c.due <= Date.now() ? 1 : 0) }; }, { n: 0, due: 0 });
        return <button key={g.id} className="game-tile" onClick={() => { setGid(g.id); setK(0); setPick(null); setScore(0); }}><strong>{g.title}</strong><span className="small">{g.blurb}</span><span className="small muted">{st.due} due · {g.qs.length} cards</span></button>;
      })}</div>
    </section>
  );
  if (k >= qs.length) return (
    <section className="panel"><h2>{game.title} — done</h2><p className="stat-n">{score}/{qs.length}</p><p>Missed cards come back tomorrow; correct ones in 3, then 7 days.</p><button className="btn primary" onClick={() => setGid(null)}>Back to games</button></section>
  );
  const q = qs[k];
  const answer = (i: number) => {
    if (pick !== null) return;
    setPick(i); const ok = i === q.answer; if (ok) setScore(score + 1);
    update(s => gameUpdate(srsUpdate(s, 'g:' + q.id, ok), 'gd:' + q.domain, ok));
  };
  return (
    <section className="panel game">
      <div className="row between"><h2>{game.title}</h2><span className="mono">{k + 1}/{qs.length}</span></div>
      <p className="game-prompt">{q.prompt}</p>
      <button type="button" className="btn small ghost" aria-expanded={coach} onClick={() => setCoach(!coach)}>🧭 Milestone Reasoning Coach</button>
      {coach && <ol className="coach-steps">{COACH_STEPS.map(c => <li key={c.t}><strong>{c.t}.</strong> {c.d}</li>)}</ol>}
      <div className="mq-opts" role="group" aria-label="Answer choices">{q.options.map((o, i) => (
        <button key={o} className={'btn' + (pick !== null && i === q.answer ? ' good' : pick === i ? ' bad-b' : '')} disabled={pick !== null} onClick={() => answer(i)}>{o}</button>))}</div>
      {pick !== null && (
        <div role="status" className="game-fb">
          <p className={pick === q.answer ? 'good-t' : 'bad-t'}><strong>{pick === q.answer ? 'Correct.' : 'Not quite.'}</strong> {q.why}</p>
          <SrcChip src={q.src} />
          <button className="btn primary" onClick={() => { setK(k + 1); setPick(null); setCoach(false); }}>Next</button>
        </div>
      )}
    </section>
  );
}
function Mastery() {
  const { store } = useApp();
  const g = store.rapid?.games ?? {};
  return (
    <section className="panel">
      <h2>My Growth & Development mastery</h2>
      <p className="small muted">From your game and timeline answers. 80%+ with at least 5 answers = mastered.</p>
      <ul className="mastery">{DOMAINS.map(d => {
        const s = g['gd:' + d.id];
        const pct = s && s.n ? Math.round((s.correct / s.n) * 100) : null;
        const cls = pct === null ? 'm-none' : pct >= 80 && s!.n >= 5 ? 'm-good' : pct >= 60 ? 'm-mid' : 'm-low';
        return <li key={d.id} className={cls}><span>{d.label}</span><span className="bar" aria-hidden><span style={{ width: (pct ?? 0) + '%' }} /></span><span className="mono">{pct === null ? 'not yet' : `${pct}% (${s!.n})`}</span></li>;
      })}</ul>
    </section>
  );
}

/* ================================================================ SOURCES PAGE */
export function SourcesPage() {
  const counts = useMemo(() => {
    const c = { S: 0, D: 0, U: 0 };
    ALL_ITEMS.forEach(i => { c[verifyOf(i.id)]++; });
    return c;
  }, []);
  return (
    <main className="page">
      <header className="page-head"><p className="eyebrow">Source lock</p><h1>Sources, coverage & conflicts</h1>
        <p className="muted">Every lesson, card, and scored question is grounded in your uploaded files. Outside information appears only in the "Source vs Current Guidance" panel.</p></header>
      <section className="panel">
        <h2>Question verification</h2>
        <div className="tiles three">
          <div className="tile v-s"><span className="stat-n">{counts.S}</span><span>{VERIFY_LABEL.S}</span></div>
          <div className="tile v-d"><span className="stat-n">{counts.D}</span><span>{VERIFY_LABEL.D}</span></div>
          <div className="tile v-u"><span className="stat-n">{counts.U}</span><span>Not verified — practice only, never scored</span></div>
        </div>
        <details><summary>Why each held-out question could not be verified ({Object.keys(UNVERIFIED).length})</summary>
          <ul className="small">{Object.entries(UNVERIFIED).map(([id, why]) => <li key={id}><span className="mono">{id}</span> — {why}</li>)}</ul></details>
      </section>
      <section className="panel">
        <h2>Source inventory ({SOURCE_FILES.length} files)</h2>
        <div className="src-table">{SOURCE_FILES.map(f => <div key={f.name} className="src-row"><strong>{f.name}</strong><span className="chip">{f.type}</span><span className="chip v-s-chip">{f.status}</span><span className="small">{f.used}</span></div>)}</div>
      </section>
      <section className="panel">
        <h2>Source Discrepancy Log ({DISCREPANCIES.length})</h2>
        <p className="small muted">Where your sources disagree, the app shows each version and does not score the disputed detail.</p>
        <div className="disc">{DISCREPANCIES.map(d => <details key={d.id} className="disc-row"><summary><span className="mono">{d.id}</span> {d.topic}</summary><p><strong>Sources:</strong> {d.sources}</p>{d.conflict && <p><strong>Conflict:</strong> {d.conflict}</p>}<p><strong>Safe for scoring?</strong> {d.scoring}</p></details>)}</div>
      </section>
      <section className="panel"><CurrentRef /></section>
    </main>
  );
}
