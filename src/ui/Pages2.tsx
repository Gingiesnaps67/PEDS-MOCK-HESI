import { MISTAKES } from './Coach';
import type { MistakeType } from '../types';
import React, { useMemo, useRef, useState } from 'react';
import { useApp } from './state';
import { useStart } from './Pages';
import { Bar } from './Results';
import { buildPractice, pct, summarize, topicMastery, cjLabel, interleave } from '../engine/exam';
import { rng } from '../engine/dosage';
import { ALL_ITEMS, registerGenerated } from '../data/bank';
import { CATEGORIES, TOPICS, TOPIC_BY_N, CONFLICTS, CAT_NAME, SOURCE_NAMES } from '../data/blueprint';
import { exportJson, importJson, defaultStore } from '../engine/storage';
import { saveFile } from './util';
import type { CJ, Store } from '../types';
import { fmtTime } from './Exam';

/** classify where a supplemental point comes from, so instructor teaching, textbook content, and current guidance are never blended */
function srcKind(src: string): { label: string; cls: string } {
  if (/lecture|PowerPoint|PPT|review/i.test(src)) return { label: 'Instructor course material', cls: 'review' };
  if (/Chapter|textbook/i.test(src)) return { label: 'Textbook', cls: 'text' };
  if (/CDC|AAP|AHA|NHLBI|ISPAD|KDIGO|guideline/i.test(src)) return { label: 'Current guideline', cls: 'guide' };
  return { label: 'Needs verification', cls: 'verify' };
}

/* ================= Instructor blueprint ================= */
export function Blueprint({ topic }: { topic?: number }) {
  const { go, store } = useApp();
  const start = useStart();
  const [q, setQ] = useState('');
  const tm = useMemo(() => topicMastery(store), [store]);
  if (topic) {
    const t = TOPIC_BY_N[topic];
    const items = ALL_ITEMS.filter(i => i.topics.includes(topic));
    const conflicts = CONFLICTS.filter(c => c.topic === topic);
    const m = tm[topic];
    const sec = (title: string, list: string[], cls = '') => list.length ? <div className={'bp-sec ' + cls}><h3>{title} <span className="src-tag review">Instructor review</span></h3><ul>{list.map((x, i) => <li key={i}>{x}</li>)}</ul></div> : null;
    return (
      <main className="page narrow">
        <button className="linkish" onClick={() => go({ name: 'blueprint' })}>← All 69 topics</button>
        <p className="eyebrow">{CAT_NAME[t.cat]} · Topic #{t.n}</p>
        <h1>{t.title}</h1>
        <p className="small muted">Your mastery: {m.acc === null ? 'not practiced yet' : `${Math.round(m.acc * 100)}% across ${m.seen} attempts`}</p>
        {t.mnemonic && <div className="mnemonic"><span className="eyebrow">Memory hook</span><p>{t.mnemonic}</p></div>}
        <div className="bp-grid">
          {sec('Essential findings', t.findings)}
          {sec('Immediate nursing priorities', t.priorities)}
          {sec('Patient & caregiver teaching', t.teaching)}
          {sec('High-risk complications', t.complications)}
          {sec('Exam traps', t.traps, 'trap')}
          {sec('Medication considerations', t.meds)}
        </div>
        {t.supplemental.length > 0 && <div className="bp-sec supp"><h3>From other course materials and guidelines</h3><ul>{t.supplemental.map((s, i) => { const k = srcKind(s.src); return <li key={i}><span className={'src-tag ' + k.cls}>{k.label}</span> {s.text} <span className="muted small">— {s.src}</span></li>; })}</ul></div>}
        {conflicts.map((c, i) => <div key={i} className="bp-sec conflict"><h3>Source difference: {c.issue}</h3><p>{c.sources}</p><p className="small"><strong>Used in this app:</strong> {c.used}</p></div>)}
        <section className="panel">
          <h2>Related practice questions ({items.length})</h2>
          <ul className="tight">{items.map(i => <li key={i.id}><span className="mono small">{i.id}</span> {i.stem.slice(0, 110)}{i.stem.length > 110 ? '…' : ''}</li>)}</ul>
          <button className="btn primary" disabled={!items.filter(i => !i.caseId).length} onClick={() => start(buildPractice('tutor', `Topic #${t.n} — ${t.title}`, items.filter(i => !i.caseId), store.settings, { tutor: true, timed: false }))}>Practice this topic (tutor mode)</button>
          <p className="small muted mt">Course files for this topic live in your PEDS Claude Project: {SOURCE_NAMES.REVIEW}; {SOURCE_NAMES.PPT_PHYS}; lectures 9/30, 10/7, 10/8; Chapters 30–32.</p>
        </section>
      </main>
    );
  }
  const ql = q.trim().toLowerCase();
  const match = (n: number) => { if (!ql) return true; const t = TOPIC_BY_N[n]; return [t.title, ...t.findings, ...t.priorities, ...t.traps, ...t.teaching, ...t.meds, String(n)].join(' ').toLowerCase().includes(ql); };
  return (
    <main className="page">
      <h1>Instructor Blueprint</h1>
      <p className="lede">All 69 numbered topics from your instructor’s <em>Pediatric HESI Review 2026</em>, grouped by the review’s 11 body-system categories. Original topic numbers are kept.</p>
      <label className="field search" htmlFor="bp-q">Search topics, traps, drugs<input id="bp-q" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. digoxin, knee-chest, aspirin" /></label>
      {CATEGORIES.map(c => {
        const list = c.topics.filter(match);
        if (!list.length) return null;
        return (
          <section key={c.id} className="bp-cat">
            <h2>{c.name} <span className="muted small">Topics {c.topics.join(', ')}</span></h2>
            <div className="topic-grid">
              {list.map(n => {
                const t = TOPIC_BY_N[n]; const m = tm[n];
                return <button key={n} className="topic-card" onClick={() => go({ name: 'blueprint', topic: n })}>
                  <span className="topic-n mono">#{n}</span><span className="topic-t">{t.title}</span>
                  <span className="topic-trap small">{t.traps[0]}</span>
                  <span className={'mastery ' + (m.acc === null ? 'none' : m.acc >= 0.8 ? 'good' : m.acc >= 0.65 ? 'warn' : 'bad')}>{m.acc === null ? 'Not practiced' : `${Math.round(m.acc * 100)}%`}</span>
                </button>;
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}

/* ================= Coverage & mastery matrix ================= */
export function Coverage() {
  const { store, go } = useApp();
  const tm = useMemo(() => topicMastery(store), [store]);
  const counts = (n: number) => {
    const its = ALL_ITEMS.filter(i => i.topics.includes(n));
    return { trad: its.filter(i => !i.ngn && !i.caseId).length, ngn: its.filter(i => i.ngn && !i.caseId).length, cs: its.filter(i => i.caseId).length, all: its.length };
  };
  const totals = TOPICS.map(t => counts(t.n));
  const deep = totals.filter(c => c.all >= 4).length;
  return (
    <main className="page">
      <h1>Topic coverage & mastery</h1>
      <p className="lede">Every one of the 69 instructor topics, with how many reviewed questions the bank holds and how you are doing on it.</p>
      <section className="stat-strip">
        <div className="stat"><span className="stat-n">{ALL_ITEMS.length}</span><span className="stat-l">Reviewed items in bank</span></div>
        <div className="stat"><span className="stat-n">69/69</span><span className="stat-l">Topics covered</span></div>
        <div className="stat"><span className="stat-n">{deep}/69</span><span className="stat-l">Topics with 4+ items</span></div>
        <div className="stat"><span className="stat-n">{Object.values(tm).filter(x => x.acc !== null && x.acc >= 0.8).length}</span><span className="stat-l">Topics you have at 80%+</span></div>
      </section>
      <p className="small muted">Bank depth key: <strong>Thin</strong> = 1 item, <strong>Adequate</strong> = 2–3, <strong>Strong</strong> = 4+. Every topic now has at least 4 reviewed items across traditional, NGN, and case questions.</p>
      <div className="scroll-x">
        <table className="cov">
          <thead><tr><th scope="col">#</th><th scope="col">Topic</th><th scope="col">Area</th><th scope="col">Trad.</th><th scope="col">NGN</th><th scope="col">Case</th><th scope="col">Bank depth</th><th scope="col">Your mastery</th></tr></thead>
          <tbody>
            {TOPICS.slice().sort((a, b) => a.n - b.n).map(t => {
              const c = counts(t.n); const m = tm[t.n];
              const depth = c.all >= 4 ? 'Strong' : c.all >= 2 ? 'Adequate' : 'Thin';
              return <tr key={t.n}>
                <td className="mono" data-label="#">{t.n}</td>
                <td data-label="Topic"><button className="linkish" onClick={() => go({ name: 'blueprint', topic: t.n })}>{t.title}</button></td>
                <td className="small" data-label="Area">{CAT_NAME[t.cat]}</td>
                <td className="mono" data-label="Traditional">{c.trad}</td><td className="mono" data-label="NGN">{c.ngn}</td><td className="mono" data-label="Case items">{c.cs}</td>
                <td data-label="Bank depth"><span className={'depth ' + depth.toLowerCase()}>{depth}</span></td>
                <td data-label="Your mastery"><span className={'mastery ' + (m.acc === null ? 'none' : m.acc >= 0.8 ? 'good' : m.acc >= 0.65 ? 'warn' : 'bad')}>{m.acc === null ? '—' : `${Math.round(m.acc * 100)}% (${m.seen})`}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

/* ================= Analytics ================= */
export function Analytics() {
  const { store, go } = useApp();
  const ats = store.attempts;
  const data = useMemo(() => {
    const sums = ats.map(a => ({ a, s: summarize(a) }));
    const agg = { cat: {} as Record<string, { e: number; p: number }>, cj: {} as Record<string, { e: number; p: number }>, ms: 0, n: 0, hc: { e: 0, n: 0 }, lc: { e: 0, n: 0 } };
    sums.slice(-10).forEach(({ a, s }) => {
      Object.entries(s.byCat).forEach(([k, b]) => { const o = agg.cat[k] ?? (agg.cat[k] = { e: 0, p: 0 }); o.e += b.earned; o.p += b.possible; });
      Object.entries(s.byCj).forEach(([k, b]) => { const o = agg.cj[k] ?? (agg.cj[k] = { e: 0, p: 0 }); o.e += b.earned; o.p += b.possible; });
      a.items.forEach(i => { agg.ms += i.ms; agg.n++; if ((i.conf ?? 0) >= 4) { agg.hc.n++; agg.hc.e += i.full ? 1 : 0; } if (i.conf !== undefined && i.conf <= 2) { agg.lc.n++; agg.lc.e += i.full ? 1 : 0; } });
    });
    return { sums, agg };
  }, [ats]);
  const tm = useMemo(() => topicMastery(store), [store]);
  const weakest = Object.entries(tm).filter(([, v]) => v.acc !== null).sort((a, b) => (a[1].acc! - b[1].acc!)).slice(0, 10);
  const sims = data.sums.filter(x => ['hesi', 'formA', 'formB', 'extended'].includes(x.a.kind));
  const readiness = sims.length ? Math.round(sims.slice(-3).reduce((s, x) => s + pct(x.s.total), 0) / Math.min(3, sims.length)) : null;
  if (!ats.length) return <main className="page"><h1>Performance analytics</h1><p className="muted">Complete a session to see analytics here.</p></main>;
  const W = 600, H = 160, pts = data.sums.slice(-15);
  const x = (i: number) => 30 + (i * (W - 50)) / Math.max(1, pts.length - 1);
  const y = (v: number) => H - 20 - (v / 100) * (H - 40);
  return (
    <main className="page">
      <h1>Performance analytics</h1>
      <div className="grid-2">
        <section className="panel">
          <h2>Practice percentage over time</h2>
          <div className="scroll-x"><svg viewBox={`0 0 ${W} ${H}`} className="trend" role="img" aria-label="Line chart of practice percentage by session">
            {[0, 50, 65, 80, 100].map(v => <g key={v}><line x1={30} x2={W - 20} y1={y(v)} y2={y(v)} className={v === 80 ? 'grid-80' : 'grid'} /><text x={4} y={y(v) + 4} className="axis">{v}</text></g>)}
            <polyline className="area-line" fill="none" points={pts.map((p, i) => `${x(i)},${y(pct(p.s.total))}`).join(' ')} />
            {pts.map((p, i) => <circle key={i} cx={x(i)} cy={y(pct(p.s.total))} r={i === pts.length - 1 ? 5 : 3.5} className={i === pts.length - 1 ? 'pt end' : 'pt'}><title>{p.a.title}: {pct(p.s.total)}%</title></circle>)}
          </svg></div>
          <p className="small muted">Dashed line = 80%, a common course pass mark. Last {pts.length} sessions.</p>
          {readiness !== null && <div className="readiness"><span className="eyebrow">Unofficial Practice Readiness Index</span><span className="stat-n">{readiness}%</span><p className="small muted">Average practice percentage of your last {Math.min(3, sims.length)} full simulations. It is not a HESI score, does not convert to an 850/900 scale, and does not predict NCLEX results.</p></div>}
        </section>
        <section className="panel">
          <h2>Content areas (last 10 sessions)</h2>
          {CATEGORIES.map(c => data.agg.cat[c.id] ? <Bar key={c.id} label={c.name} value={Math.round(data.agg.cat[c.id].e / data.agg.cat[c.id].p * 100)} /> : null)}
        </section>
      </div>
      <div className="grid-2">
        <section className="panel">
          <h2>Clinical judgment operations</h2>
          {(['recognize', 'analyze', 'prioritize', 'generate', 'act', 'evaluate'] as CJ[]).map(c => data.agg.cj[c] ? <Bar key={c} label={cjLabel(c)} value={Math.round(data.agg.cj[c].e / data.agg.cj[c].p * 100)} /> : null)}
          <h3 className="mt">Timing & confidence</h3>
          <p>Average time per item: <span className="mono">{fmtTime(data.agg.n ? data.agg.ms / data.agg.n : 0)}</span> (the HESI pace is about 2:10 per item).</p>
          {data.agg.hc.n > 0 && <p>When you rated confidence <strong>4–5</strong> you were fully correct {Math.round(data.agg.hc.e / data.agg.hc.n * 100)}% of the time ({data.agg.hc.n} items).</p>}
          {data.agg.lc.n > 0 && <p>When you rated confidence <strong>1–2</strong> you were fully correct {Math.round(data.agg.lc.e / data.agg.lc.n * 100)}% of the time.</p>}
        </section>
        <section className="panel">
          <h2>Weakest topics</h2>
          <ol className="plan">{weakest.map(([t, v]) => <li key={t}><button className="linkish" onClick={() => go({ name: 'blueprint', topic: Number(t) })}>#{t} {TOPIC_BY_N[Number(t)].title}</button> <span className="mono muted">{Math.round(v.acc! * 100)}% ({v.seen})</span></li>)}</ol>
          <button className="btn" onClick={() => go({ name: 'coverage' })}>See all 69 topics</button>
        </section>
      </div>
      <section className="panel">
        <h2>All sessions</h2>
        <ul className="sessions">{[...data.sums].reverse().map(({ a, s }) => <li key={a.id}><button className="linkish" onClick={() => go({ name: 'results', id: a.id })}>{a.title}</button><span className="muted small">{new Date(a.finishedAt).toLocaleString()}</span><span className="mono">{pct(s.total)}%</span></li>)}</ul>
      </section>
      <MistakeSummary />
    </main>
  );
}

/* ================= Study plan ================= */
export function Plan() {
  const { store, update, go } = useApp();
  const start = useStart();
  const tm = useMemo(() => topicMastery(store), [store]);
  const days = store.settings.examDate ? Math.ceil((new Date(store.settings.examDate + 'T08:00:00').getTime() - Date.now()) / 864e5) : null;
  const unseen = TOPICS.filter(t => tm[t.n].seen === 0).map(t => t.n);
  const weak = TOPICS.filter(t => tm[t.n].acc !== null && tm[t.n].acc! < 0.8).sort((a, b) => tm[a.n].acc! - tm[b.n].acc!).map(t => t.n);
  const queue = [...weak, ...unseen];
  const sims = store.attempts.filter(a => ['hesi', 'formA', 'formB'].includes(a.kind)).length;
  const nDays = Math.max(1, Math.min(14, days ?? 7));
  const plan = Array.from({ length: nDays }, (_, d) => {
    const topics = queue.slice(d * 3, d * 3 + 3);
    const last = d === nDays - 1;
    const task = last ? 'Light review only: Rapid Review + blueprint exam traps. Rest.'
      : d === 0 && sims === 0 ? 'Take a full HESI simulation under real-exam conditions (130 min).'
      : d === Math.floor(nDays / 2) && sims < 2 ? 'Take another full simulation — it will draw questions you have not seen.'
      : d % 3 === 1 ? 'One unfolding case + 20 adaptive questions.'
      : d % 3 === 2 ? 'Clinical priority training set + 10 dosage problems.'
      : '20 adaptive questions + rapid review.';
    return { d, topics, task };
  });
  return (
    <main className="page narrow">
      <h1>Study plan</h1>
      {days === null ? <p>Set your exam date to build a day-by-day plan. <label className="field-inline">Exam date<input type="date" onChange={e => update(s => ({ ...s, settings: { ...s.settings, examDate: e.target.value } }))} /></label></p>
        : <p className="lede">{days > 0 ? `${days} days until your exam.` : 'Exam day is here or has passed — update the date in Settings if needed.'} Each day pairs blueprint review of your weakest or unpracticed topics with a practice task.</p>}
      <ol className="day-plan">
        {plan.map(p => (
          <li key={p.d} className="day">
            <span className="day-n mono">Day {p.d + 1}{store.settings.examDate ? ` · ${new Date(Date.now() + p.d * 864e5).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}` : ''}</span>
            <p>{p.task}</p>
            {p.topics.length > 0 && <p className="small">Review: {p.topics.map(t => <button key={t} className="linkish" onClick={() => go({ name: 'blueprint', topic: t })}>#{t} {TOPIC_BY_N[t].title}</button>)}</p>}
            {p.topics.length > 0 && <button className="btn small" onClick={() => start(buildPractice('tutor', `Study plan — day ${p.d + 1}`, interleave(ALL_ITEMS.filter(i => !i.caseId && i.topics.some(t => p.topics.includes(t))), rng(p.d)), store.settings, { tutor: true, timed: false }))}>Practice today’s topics</button>}
          </li>
        ))}
      </ol>
      <p className="small muted">The plan updates automatically as your results change. {weak.length} topics below 80%, {unseen.length} not practiced yet.</p>
    </main>
  );
}

/* ================= Settings ================= */
export function Settings() {
  const { store, update, cloud } = useApp();
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const st = store.settings;
  const set = (k: keyof Store['settings'], v: unknown) => update(s => ({ ...s, settings: { ...s.settings, [k]: v } }));
  return (
    <main className="page narrow">
      <h1>Settings & data</h1>
      <section className="panel">
        <h2>Exam</h2>
        <div className="settings-grid">
          <label className="field" htmlFor="s-date">Exam date<input id="s-date" type="date" value={st.examDate} onChange={e => set('examDate', e.target.value)} /></label>
          <label className="field" htmlFor="s-min">Time limit for 60-item forms (minutes)<input id="s-min" type="number" min={30} max={240} value={st.minutes} onChange={e => set('minutes', Number(e.target.value) || 130)} /></label>
          <fieldset><legend>Navigation</legend>
            <label className="radio"><input type="radio" name="s-nav" checked={st.navigation === 'linear'} onChange={() => set('navigation', 'linear')} /> One way (no going back)</label>
            <label className="radio"><input type="radio" name="s-nav" checked={st.navigation === 'free'} onChange={() => set('navigation', 'free')} /> Free with flags</label>
          </fieldset>
          <label className="check"><input type="checkbox" checked={st.unscoredItems} onChange={e => set('unscoredItems', e.target.checked)} /> Simulate 2 unscored items</label>
          <label className="check"><input type="checkbox" checked={st.confidence} onChange={e => set('confidence', e.target.checked)} /> Confidence ratings</label>
        </div>
      </section>
      <section className="panel">
        <h2>Topic weighting for adaptive practice</h2>
        <p className="small muted">Raise a body system to see more of it. 1× is neutral. These weights do not claim to match the real exam’s distribution.</p>
        <div className="weights">
          {CATEGORIES.map(c => {
            const w = st.weights[c.id] ?? 1;
            return <label key={c.id} className="weight-row" htmlFor={'w-' + c.id}><span>{c.name}</span><input id={'w-' + c.id} type="range" min={0.5} max={2} step={0.25} value={w} onChange={e => set('weights', { ...st.weights, [c.id]: Number(e.target.value) })} /><span className="mono">{w}×</span></label>;
          })}
        </div>
      </section>
      <section className="panel">
        <h2>Your progress data</h2>
        <p>Saved {cloud === 'on' ? 'to your Claude account (private to you) and to this browser' : cloud === 'connecting' ? 'to this browser; connecting to your Claude account…' : 'to this browser only'}. {store.attempts.length} sessions, {Object.keys(store.itemStats).length} items answered.</p>
        <div className="row gap wrap">
          <button className="btn" onClick={() => saveFile(`peds-hesi-progress-${new Date().toISOString().slice(0, 10)}.json`, exportJson(store))}>Export progress (JSON)</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import progress…</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={async e => {
            const f = e.target.files?.[0]; if (!f) return;
            try {
              const s = importJson(await f.text());
              s.attempts.forEach(a => registerGenerated(a.generated));
              registerGenerated(s.active?.generated);
              update(() => s);
              setMsg(`Imported ${s.attempts.length} sessions.`);
            } catch (err) { setMsg((err as Error).message); }
            e.target.value = '';
          }} />
          {!confirmReset ? <button className="btn danger" onClick={() => setConfirmReset(true)}>Reset all progress…</button>
            : <span className="row gap"><span className="warn-t">This erases every session and statistic.</span><button className="btn danger" onClick={() => { update(() => ({ ...defaultStore(), settings: st })); setConfirmReset(false); setMsg('Progress reset.'); }}>Yes, erase</button><button className="btn" onClick={() => setConfirmReset(false)}>Cancel</button></span>}
        </div>
        {msg && <p className="notice small" role="status">{msg}</p>}
        <p className="small muted">Session reports download as PDF files from each results page (an HTML version is also available).</p>
      </section>
      <section className="panel">
        <h2>Source conflict log</h2>
        <p className="small muted">Where course materials disagree, the app does not silently pick one. Each difference and the version used:</p>
        <div className="scroll-x"><table className="cov"><thead><tr><th scope="col">Topic</th><th scope="col">Issue</th><th scope="col">What sources say</th><th scope="col">Used here</th></tr></thead>
          <tbody>{CONFLICTS.map((c, i) => <tr key={i}><td className="mono" data-label="Topic">#{c.topic}</td><td data-label="Issue">{c.issue}</td><td className="small" data-label="What sources say">{c.sources}</td><td className="small" data-label="Used here">{c.used}</td></tr>)}</tbody></table></div>
      </section>
      <section className="panel">
        <h2>About this simulator</h2>
        <ul className="tight small">
          <li>All questions are original, written for this app and mapped to the instructor’s 69-topic review. None are HESI or Elsevier questions.</li>
          <li>Exam structure follows Elsevier’s published 2023 HESI PN specialty specifications (60 items, 130 minutes, 44 traditional with 2 unscored, 12 case items, 4 standalone NGN). Your school’s 2026 settings may differ.</li>
          <li>Scores are transparent practice percentages. Elsevier’s HESI scoring is proprietary; no conversion to a HESI score is made.</li>
          <li>NGN scoring follows NCSBN-style rules: plus/minus for extended multiple response and highlight items, 0/1 per element for matrix, cloze, drag-and-drop, and bow-tie items, all-or-nothing for traditional items.</li>
          <li>Clinical content is grounded in the instructor’s HESI review and course materials and checked against AAP, AHA, CDC, ISPAD, and NHLBI guidance where cited. Follow your facility’s policies in practice.</li>
          <li>Not affiliated with or endorsed by Elsevier, HESI, or NCSBN.</li>
        </ul>
      </section>
    </main>
  );
}


function MistakeSummary() {
  const { store } = useApp();
  const counts: Partial<Record<MistakeType, number>> = {};
  Object.values(store.mistakes ?? {}).forEach(m => { counts[m.type] = (counts[m.type] ?? 0) + 1; });
  const rows = (Object.entries(counts) as [MistakeType, number][]).sort((a, b) => b[1] - a[1]);
  return (
    <section className="panel">
      <h2>Why I miss questions</h2>
      {!rows.length ? <p className="muted small">Open a missed question on a results page and choose why you missed it. Some reasons are suggested automatically (changed answers, math, incomplete SATA).</p> : (
        <ul className="mistake-sum">{rows.map(([k, n]) => <li key={k}><strong>{MISTAKES[k].label}</strong> <span className="mono">×{n}</span><br /><span className="small">Next step: {MISTAKES[k].fix}</span></li>)}</ul>
      )}
    </section>
  );
}
