import React, { useMemo, useState } from 'react';
import { useApp } from './state';
import { buildQuick, buildLadder, missedRescueItems, nightBeforeItems, readinessDetail, scorable } from '../engine/exam';
import { buildHesi, buildFresh, buildExtended, buildCase, buildPractice, adaptivePick, PRIORITY_SETS, rapidReviewPick, pct, summarize, topicMastery, cjLabel, interleave, HESI_SPEC } from '../engine/exam';
import { rng, generateSet, DOSAGE_KINDS } from '../engine/dosage';
import type { DosageKind } from '../engine/dosage';
import { CASES, ALL_ITEMS, ALL_TRAD, getItem, categoryOf } from '../data/bank';
import { CATEGORIES, TOPIC_BY_N, CAT_NAME } from '../data/blueprint';
import type { ActiveExam, CategoryId, CJ, Item, Store } from '../types';
import { Bar } from './Results';
import { fmtTime } from './Exam';
import { ItemReview } from './Review';

const daysUntil = (d: string) => { if (!d) return null; const t = new Date(d + 'T08:00:00').getTime(); return Math.ceil((t - Date.now()) / 864e5); };
export function useStart() {
  const { update, go } = useApp();
  return (ex: ActiveExam) => { update(s => ({ ...s, active: ex })); go({ name: 'exam' }); };
}

function ActiveWarning() {
  const { store, go } = useApp();
  if (!store.active) return null;
  return <div className="notice"><span>You have an unfinished session: <strong>{store.active.title}</strong>. Starting a new one replaces it.</span><button className="btn small primary" onClick={() => go({ name: 'exam' })}>Continue it</button></div>;
}

/* ================= Dashboard ================= */
export function Dashboard() {
  const { store, go, update } = useApp();
  const days = daysUntil(store.settings.examDate);
  const sims = store.attempts.filter(a => ['hesi', 'formA', 'formB', 'extended'].includes(a.kind));
  const last = store.attempts[store.attempts.length - 1];
  const tm = useMemo(() => topicMastery(store), [store]);
  const seenTopics = Object.values(tm).filter(x => x.seen > 0).length;
  const strong = Object.values(tm).filter(x => x.acc !== null && x.acc >= 0.8).length;
  const missedOpen = Object.values(store.missed).filter(m => !m.masteredBy).length;
  const due = Object.values(store.srs).filter(v => v.due <= Date.now()).length;
  const tiles: { label: string; desc: string; v: Parameters<typeof go>[0]; erikson?: boolean; piaget?: boolean }[] = [
    { label: 'Unfolding Cases', desc: `${CASES.length} six-question cases with a live chart`, v: { name: 'cases' } },
    { label: 'Adaptive Practice', desc: 'Targets your weakest topics', v: { name: 'practice', tab: 'adaptive' } },
    { label: 'Instructor Blueprint', desc: 'All 69 topics from your instructor’s review', v: { name: 'blueprint' } },
    { label: 'Missed Questions', desc: `${missedOpen} not yet re-mastered`, v: { name: 'missed' } },
    { label: 'Dosage Calculations', desc: 'Generated weight-based math', v: { name: 'dosage' } },
    { label: 'Performance Analytics', desc: `${store.attempts.length} sessions recorded`, v: { name: 'analytics' } },
    { label: 'Topic Mastery', desc: `${strong} of 69 topics at 80%+`, v: { name: 'coverage' } },
    { label: 'Study Plan', desc: days !== null ? `${days} days to go` : 'Set your exam date', v: { name: 'plan' } },
    { label: 'Clinical Priority Training', desc: 'ABCs, first actions, escalation', v: { name: 'practice', tab: 'priority' } },
    { label: 'Rapid Review', desc: `${due} spaced-review items due`, v: { name: 'practice', tab: 'rapid' } },
    { label: '❤️ Vital Signs & Growth 0–17', desc: 'Master chart, age view, weight & growth charts, 7 games', v: { name: 'vitals' } },
    { label: '🧠 Erikson Mastery Center', desc: '5 stages · 6 games · final 15-question test', v: { name: 'growth' }, erikson: true },
    { label: '💡 Piaget Cognitive Center', desc: 'Timeline 0–17 · experiment lab · 40-Q bank', v: { name: 'growth' }, piaget: true },
    { label: '🧠 Growth & Development', desc: 'Stage cards, timeline, theorists, 6 games', v: { name: 'growth' } },
    { label: 'Sources & Conflicts', desc: 'Coverage, verification, discrepancy log', v: { name: 'sources' } },
  ];
  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Vocational Nursing · Pediatrics</p>
          <h1>PEDS HESI 2026</h1>
          <p className="lede">Clinical Judgment Simulator — original HESI-style items mapped to all 69 topics in your instructor’s 2026 Pediatric HESI Review.</p>
          <div className="row gap wrap">
            {store.active && <button className="btn primary lg" onClick={() => go({ name: 'exam' })}>Continue exam</button>}
            <button className={'btn lg ' + (store.active ? '' : 'primary')} onClick={() => go({ name: 'setup' })}>Start mock exam</button>
          </div>
          {store.active && <p className="small muted">Unfinished: {store.active.title} · item {store.active.index + 1} of {store.active.slots.length}{store.active.remainingMs !== null ? ` · ${fmtTime(store.active.remainingMs)} left` : ''}</p>}
        </div>
        <div className="countdown" aria-label="Exam countdown">
          {days !== null ? (<><span className="cd-n">{Math.max(0, days)}</span><span className="cd-l">{days === 1 ? 'day' : 'days'} until your PEDS HESI</span><span className="cd-d mono">{new Date(store.settings.examDate + 'T08:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span></>)
            : (<><label htmlFor="exam-date" className="cd-l">Set your exam date</label><input id="exam-date" type="date" onChange={e => update(s => ({ ...s, settings: { ...s.settings, examDate: e.target.value } }))} /></>)}
        </div>
      </section>

      <section className="stat-strip">
        <div className="stat"><span className="stat-n">{sims.length}</span><span className="stat-l">Full simulations taken</span></div>
        <div className="stat"><span className="stat-n">{last ? pct(summarize(last).total) + '%' : '—'}</span><span className="stat-l">Last session</span></div>
        <div className="stat"><span className="stat-n">{seenTopics}/69</span><span className="stat-l">Topics practiced</span></div>
        <div className="stat"><span className="stat-n">{missedOpen}</span><span className="stat-l">Open missed items</span></div>
      </section>

      <QuickModes />
      <ReadinessPanel />

      <section className="tiles">
        {tiles.map(t => <button key={t.label} className="tile" onClick={() => { if (t.erikson || t.piaget) { try { sessionStorage.setItem('peds-gd-tab', t.piaget ? 'piaget' : 'erikson'); } catch { /* */ } } go(t.v); }}><span className="tile-l">{t.label}</span><span className="tile-d">{t.desc}</span></button>)}
      </section>

      {store.attempts.length > 0 && (
        <section className="panel">
          <h2>Recent sessions</h2>
          <ul className="sessions">
            {[...store.attempts].reverse().slice(0, 6).map(a => (
              <li key={a.id}><button className="linkish" onClick={() => go({ name: 'results', id: a.id })}>{a.title}</button><span className="muted small">{new Date(a.finishedAt).toLocaleDateString()}</span><span className="mono">{pct(summarize(a).total)}%</span></li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

/* ================= Exam setup ================= */
export function Setup() {
  const { store, update } = useApp();
  const start = useStart();
  const [n, setN] = useState(90);
  const st = store.settings;
  const set = (k: keyof Store['settings'], v: unknown) => update(s => ({ ...s, settings: { ...s.settings, [k]: v } }));
  const eligibleCases = CASES.filter(c => c.items.every(scorable));
  const unseen = ALL_TRAD.filter(i => scorable(i) && !store.itemStats[i.id]).length;
  const unseenCases = eligibleCases.filter(c => c.items.every(i => !store.itemStats[i.id])).length;
  return (
    <main className="page narrow">
      <h1>Start a mock exam</h1>
      <ActiveWarning />
      <section className="panel">
        <h2>A · HESI Specialty Simulation <span className="chip accent">default</span></h2>
        <p>{HESI_SPEC.total} items · {HESI_SPEC.minutes} minutes · {HESI_SPEC.traditional} traditional items ({HESI_SPEC.unscored} unscored) · two 6-item unfolding cases · {HESI_SPEC.standaloneNgn} standalone NGN items.</p>
        <p className="small muted">Built from Elsevier’s published 2023 HESI PN specialty specifications. Your school’s 2026 settings are not confirmed, so timing and navigation are adjustable below.</p>
        <p className="small">Each simulation uses source-verified questions, balances all 11 body systems, and picks the questions and cases you have seen least. You have <strong>{unseen}</strong> eligible traditional questions and <strong>{unseenCases}</strong> of {eligibleCases.length} eligible cases still unseen.</p>
        <button className="btn primary" onClick={() => start(buildFresh(store, { ...st }))}>Begin simulation</button>
      </section>
      <section className="panel">
        <h2>B · Extended Challenge Exam <span className="chip">supplemental practice</span></h2>
        <p>75–100 items weighted toward analysis and complex judgment, with four unfolding cases and eight standalone NGN items you have seen least. This is not the published specialty format.</p>
        <div className="row gap wrap">
          <label className="field-inline" htmlFor="ext-n">Items <input id="ext-n" type="number" min={75} max={100} value={n} onChange={e => setN(Number(e.target.value))} /></label>
          <span className="muted small">≈ {Math.round(Math.max(75, Math.min(100, n)) * 130 / 60)} minutes</span>
          <button className="btn" onClick={() => start(buildExtended(n, { ...st }, Date.now(), store))}>Begin extended exam</button>
        </div>
      </section>
      <section className="panel">
        <h2>C · HESI 1 and HESI 2 practice forms</h2>
        <p>Two fixed original forms if you want a repeatable benchmark: Form A (HESI 1 practice) and Form B (HESI 2 practice) share no questions and use different cases. Retake the same form later to measure improvement on identical items. They are not copies of your school’s actual HESI forms.</p>
        <div className="row gap wrap">
          <button className="btn" onClick={() => start(buildHesi('A', { ...st }))}>HESI 1 practice (Form A)</button>
          <button className="btn" onClick={() => start(buildHesi('B', { ...st }))}>HESI 2 practice (Form B)</button>
        </div>
      </section>
      <section className="panel">
        <h2>Test settings</h2>
        <div className="settings-grid">
          <fieldset><legend>Navigation</legend>
            <label className="radio"><input type="radio" name="nav" checked={st.navigation === 'linear'} onChange={() => set('navigation', 'linear')} /> One way — answer before moving on, no going back (commonly reported for HESI)</label>
            <label className="radio"><input type="radio" name="nav" checked={st.navigation === 'free'} onChange={() => set('navigation', 'free')} /> Free — previous/next, flags, and a question navigator</label>
          </fieldset>
          <label className="field" htmlFor="mins">Time limit for 60-item simulations (minutes)<input id="mins" type="number" min={30} max={240} value={st.minutes} onChange={e => set('minutes', Number(e.target.value) || 130)} /></label>
          <label className="check"><input type="checkbox" checked={st.unscoredItems} onChange={e => set('unscoredItems', e.target.checked)} /> Simulate 2 unscored (pilot) items</label>
          <label className="check"><input type="checkbox" checked={st.confidence} onChange={e => set('confidence', e.target.checked)} /> Ask my confidence on each item (finds high-confidence errors)</label>
        </div>
        <p className="small muted">Real-exam mode never shows hints, rationales, or answers until you submit. Progress saves automatically; if the app closes, choose Continue exam. The timer keeps running while the app is open, even in another tab, and pauses only when the app is closed.</p>
      </section>
    </main>
  );
}

/* ================= Cases ================= */
export function Cases() {
  const { store } = useApp();
  const start = useStart();
  const [cat, setCat] = useState<'all' | CategoryId>('all');
  const [skill, setSkill] = useState<'all' | CJ>('all');
  const [tutor, setTutor] = useState(true);
  const list = CASES.filter(c => (cat === 'all' || c.cat === cat));
  const best = (id: string) => {
    const ats = store.attempts.filter(a => a.items.some(i => i.id.startsWith(id + '-')));
    if (!ats.length) return null;
    return Math.max(...ats.map(a => { const its = a.items.filter(i => i.id.startsWith(id + '-')); const e = its.reduce((s, i) => s + i.earned, 0), p = its.reduce((s, i) => s + i.possible, 0); return Math.round(e / p * 100); }));
  };
  return (
    <main className="page">
      <h1>Unfolding Case Mode</h1>
      <p className="lede">Each case follows one child through six connected questions — recognize cues, analyze cues, prioritize hypotheses, generate solutions, take action, evaluate outcomes. The chart updates as the case unfolds; later information stays hidden until you reach it.</p>
      <ActiveWarning />
      <div className="filters row gap wrap">
        <label className="field-inline">Body system<select value={cat} onChange={e => setCat(e.target.value as never)}><option value="all">All</option>{CATEGORIES.filter(c => CASES.some(x => x.cat === c.id)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="field-inline">Focus skill<select value={skill} onChange={e => setSkill(e.target.value as never)}><option value="all">Whole case</option>{(['recognize', 'analyze', 'prioritize', 'generate', 'act', 'evaluate'] as CJ[]).map(c => <option key={c} value={c}>{cjLabel(c)}</option>)}</select></label>
        <label className="check"><input type="checkbox" checked={tutor} onChange={e => setTutor(e.target.checked)} /> Tutor mode (rationale after each question)</label>
      </div>
      <div className="case-grid">
        {list.map(c => {
          const b = best(c.id);
          return (
            <article key={c.id} className="case-card">
              <p className="eyebrow">{CAT_NAME[c.cat]} · {['', '', 'Moderate', 'Challenging', 'Advanced'][c.diff]}</p>
              <h3>{c.title}</h3>
              <p className="mono small">{c.patient}</p>
              <p className="small">{c.items.map(i => i.fmt).join(' · ')}</p>
              <p className="small muted">Topics: {c.topics.map(t => `#${t}`).join(', ')}{b !== null ? ` · Best: ${b}%` : ''}</p>
              <button className="btn primary" onClick={() => {
                if (skill === 'all') start(buildCase(c.id, store.settings, tutor));
                else start(buildPractice('case', `${c.title} — ${cjLabel(skill)} (with prior stages)`, c.items.slice(0, c.items.findIndex(i => i.cj === skill) + 1), store.settings, { tutor: true, timed: false }));
              }}>{skill === 'all' ? 'Start case' : `Practice through "${cjLabel(skill)}"`}</button>
            </article>
          );
        })}
      </div>
      <p className="small muted">Library: {CASES.length} complete cases, each with six linked questions and a chart that updates as the case unfolds.</p>
    </main>
  );
}

/* ================= Practice hub ================= */
export function Practice({ tab: initial }: { tab?: string }) {
  const { store } = useApp();
  const start = useStart();
  const [tab, setTab] = useState(initial ?? 'tutor');
  const [cats, setCats] = useState<CategoryId[]>([]);
  const [count, setCount] = useState(15);
  const validCount = Number.isInteger(count) && count >= 5 && count <= 60;
  const [ngn, setNgn] = useState(true);
  const st = store.settings;
  const pool = ALL_ITEMS.filter(i => !i.caseId && (cats.length === 0 || cats.includes(categoryOf(i))) && (ngn || !i.ngn));
  const rand = rng(Date.now());
  const tabs = [['tutor', 'Tutor mode'], ['adaptive', 'Adaptive'], ['priority', 'Clinical priority'], ['rapid', 'Rapid review']];
  return (
    <main className="page">
      <h1>Practice</h1>
      <ActiveWarning />
      <div className="seg big" role="tablist">{tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>

      {tab === 'tutor' && <section className="panel">
        <h2>Tutor mode</h2>
        <p>Immediate feedback after each question with the full rationale and a WHY? button for a plain-language explanation. Untimed.</p>
        <fieldset className="cat-pick"><legend>Body systems <span className="muted small">(none selected = all)</span></legend>
          {CATEGORIES.map(c => <label key={c.id} className="check"><input type="checkbox" checked={cats.includes(c.id)} onChange={e => setCats(e.target.checked ? [...cats, c.id] : cats.filter(x => x !== c.id))} /> {c.name}</label>)}
        </fieldset>
        <div className="row gap wrap">
          <label className="field-inline">Questions<input type="number" min={5} max={60} value={count} onChange={e => setCount(Number(e.target.value))} /></label>
          <label className="check"><input type="checkbox" checked={ngn} onChange={e => setNgn(e.target.checked)} /> Include standalone NGN items</label>
          <span className="muted small">{pool.length} available</span>
          <button className="btn primary" disabled={!pool.length || !validCount} onClick={() => start(buildPractice('tutor', 'Tutor practice', interleave(pool, rand).slice(0, count), st, { tutor: true, timed: false }))}>Start tutor session</button>
          {!validCount && <span className="warn-t small" role="status">Choose a whole number from 5 to 60 questions.</span>}
        </div>
      </section>}

      {tab === 'adaptive' && <section className="panel">
        <h2>Weakness-based adaptive practice</h2>
        <p>Selection weighs topic accuracy, items never seen, last result, high-confidence errors, slow responses, recency, difficulty, and your category weights. About 20% of each set revisits material you have mastered.</p>
        <p className="small muted">This is a study heuristic. It is not Elsevier’s or NCSBN’s adaptive algorithm.</p>
        <div className="row gap wrap">
          {[10, 20, 30].map(n => <button key={n} className="btn" onClick={() => start(buildPractice('adaptive', `Adaptive practice — ${n}`, adaptivePick(store, n), st, { tutor: false, timed: true }))}>{n} questions, timed</button>)}
          <button className="btn primary" onClick={() => start(buildPractice('adaptive', 'Adaptive practice — tutor', adaptivePick(store, 15), st, { tutor: true, timed: false }))}>15 questions, tutor mode</button>
        </div>
      </section>}

      {tab === 'priority' && <section className="panel">
        <h2>Clinical priority training</h2>
        <p>Focused sets drawn from the bank by the kind of decision each question tests.</p>
        <div className="prio-grid">
          {PRIORITY_SETS.map(ps => {
            const items = ALL_ITEMS.filter(i => !i.caseId && ps.test(i));
            return <button key={ps.id} className="tile" disabled={!items.length} onClick={() => start(buildPractice('priority', `Priority training — ${ps.label}`, interleave(items, rand).slice(0, 15), st, { tutor: true, timed: false }))}>
              <span className="tile-l">{ps.label}</span><span className="tile-d">{ps.desc} · {items.length} items</span></button>;
          })}
        </div>
      </section>}

      {tab === 'rapid' && <RapidReview />}
    </main>
  );
}

function RapidReview() {
  const { store } = useApp();
  const start = useStart();
  const items = rapidReviewPick(store, 10);
  const due = Object.values(store.srs).filter(v => v.due <= Date.now()).length;
  return (
    <section className="panel">
      <h2>Rapid review</h2>
      <p>Short active-recall sessions from your own missed items, scheduled by spaced repetition (1 → 3 → 7 → 14 → 30 days). Getting an item right pushes it further out; missing it resets the schedule.</p>
      <p><strong>{due}</strong> items due now · {Object.keys(store.missed).length} missed items on file.</p>
      {items.length ? <button className="btn primary" onClick={() => start(buildPractice('missed', 'Rapid review', items, store.settings, { tutor: true, timed: false }))}>Start a {items.length}-question rapid review</button>
        : <p className="muted">Nothing to review yet. Missed questions from any session land here automatically.</p>}
    </section>
  );
}

/* ================= Missed questions ================= */
export function Missed() {
  const { store, go } = useApp();
  const start = useStart();
  const [open, setOpen] = useState<string | null>(null);
  const list = Object.entries(store.missed).sort((a, b) => b[1].at - a[1].at);
  const openItems = list.filter(([, m]) => !m.masteredBy).map(([id]) => getItem(id)).filter(Boolean) as Item[];
  const standaloneItems = openItems.filter(i => !i.caseId);
  const caseIds = new Set(openItems.filter(i => i.caseId).map(i => i.caseId!));
  return (
    <main className="page">
      <h1>Missed questions</h1>
      <p className="lede">Every incorrect or partially correct answer is saved here. Retry them with answers hidden. An item counts as independently mastered when you later answer a <em>different</em> question on the same topic fully correctly.</p>
      <ActiveWarning />
      <div className="row gap wrap">
        <button className="btn primary" disabled={!standaloneItems.length} onClick={() => start(buildPractice('missed', 'Missed-question retry', standaloneItems, store.settings, { tutor: false, timed: false }))}>Retry open items (answers hidden)</button>
        <button className="btn" disabled={!standaloneItems.length} onClick={() => start(buildPractice('missed', 'Missed-question retry — tutor', standaloneItems, store.settings, { tutor: true, timed: false }))}>Retry in tutor mode</button>
        {[...caseIds].map(id => <button key={id} className="btn ghost" onClick={() => start(buildCase(id, store.settings, false))}>Redo case {id}</button>)}
      </div>
      {!standaloneItems.length && caseIds.size > 0 && <p className="small muted">Your open misses are case-study questions. Use a Redo case button to review them with the complete chart.</p>}
      {!list.length && <p className="muted mt">No missed questions yet.</p>}
      <ul className="qlist mt">
        {list.map(([id, m]) => {
          const it = getItem(id); if (!it) return null;
          const status = m.masteredBy ? 'Mastered with a new question' : store.itemStats[id]?.lastFull ? 'Retried correctly — needs a new question on this topic' : 'Open';
          return (
            <li key={id} className="qrow">
              <button className="qrow-head" aria-expanded={open === id} onClick={() => setOpen(open === id ? null : id)}>
                <span className={'dot ' + (m.masteredBy ? 'ok' : store.itemStats[id]?.lastFull ? 'part' : 'bad')} aria-hidden />
                <span className="grow qtxt">{it.stem}</span>
                <span className="muted small nowrap">{it.topics.map(t => '#' + t).join(' ')} · {status} · missed {new Date(m.at).toLocaleDateString()}</span>
              </button>
              {open === id && <div className="pad"><p className="small muted">Open the rationale only after you have retried the question.</p><details><summary>Show answer and rationale</summary><ItemReview item={it} onTopic={t => go({ name: 'blueprint', topic: t })} /></details></div>}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

/* ================= Dosage lab ================= */
export function Dosage() {
  const { store } = useApp();
  const start = useStart();
  const [kinds, setKinds] = useState<DosageKind[]>(DOSAGE_KINDS.map(k => k.id));
  const [count, setCount] = useState(10);
  const validCount = Number.isInteger(count) && count >= 3 && count <= 40;
  const [tutor, setTutor] = useState(true);
  const medAts = store.attempts.flatMap(a => a.items).filter(i => i.id.startsWith('G-'));
  return (
    <main className="page narrow">
      <h1>Pediatric dosage calculation lab</h1>
      <p className="lede">Freshly generated problems every session, with dimensional-analysis steps. Drug values are common published pediatric doses (each problem cites its reference) and are for practicing math only — always use your facility’s references in practice.</p>
      <ActiveWarning />
      <section className="panel">
        <fieldset className="cat-pick"><legend>Problem types</legend>
          {DOSAGE_KINDS.map(k => <label key={k.id} className="check"><input type="checkbox" checked={kinds.includes(k.id)} onChange={e => setKinds(e.target.checked ? [...kinds, k.id] : kinds.filter(x => x !== k.id))} /> {k.label}</label>)}
        </fieldset>
        <div className="row gap wrap">
          <label className="field-inline">Problems<input type="number" min={3} max={40} value={count} onChange={e => setCount(Number(e.target.value))} /></label>
          <label className="check"><input type="checkbox" checked={tutor} onChange={e => setTutor(e.target.checked)} /> Show steps after each problem</label>
          <button className="btn primary" disabled={!kinds.length || !validCount} onClick={() => { const g = generateSet(kinds, count, Date.now() % 1e9); start(buildPractice('dosage', 'Dosage calculation lab', g, store.settings, { tutor, timed: !tutor, generated: g })); }}>Generate set</button>
          {!validCount && <span className="warn-t small" role="status">Choose a whole number from 3 to 40 problems.</span>}
        </div>
      </section>
      <section className="panel">
        <h2>Worked method (from your instructor’s review, topic #34)</h2>
        <ol className="steps">
          <li><strong>Kilograms:</strong> lb ÷ 2.2</li>
          <li><strong>Dose:</strong> mg/kg/<em>dose</em> → multiply by weight. mg/kg/<em>day</em> → multiply, then divide by doses per day.</li>
          <li><strong>Volume:</strong> mL = (required mg ÷ available mg) × available mL</li>
          <li><strong>Safety:</strong> compare with the safe range and maximum before giving.</li>
        </ol>
        <p className="small muted">Example: 22 lb → 10 kg · 5 mg/kg/dose → 50 mg · 100 mg/2 mL → 1 mL. Mnemonic: <strong>K-D-V</strong> — Kilograms, Dose, Volume.</p>
        <p className="small">Lab history: {medAts.length ? `${medAts.filter(i => i.full).length}/${medAts.length} correct (${Math.round(medAts.filter(i => i.full).length / medAts.length * 100)}%)` : 'no problems attempted yet'}.</p>
      </section>
    </main>
  );
}


/* ================= Quick modes & readiness ================= */
function QuickModes() {
  const { store } = useApp();
  const start = useStart();
  const st = store.settings;
  const missed = missedRescueItems(store);
  const night = nightBeforeItems(store);
  return (
    <section className="panel quick">
      <h2>Quick study modes</h2>
      <div className="quick-grid">
        {([5, 10, 20] as const).map(m => <button key={m} className="qbtn" onClick={() => start(buildQuick(store, m, st))}><strong>{m}-min sprint</strong><span className="small">{m === 5 ? 4 : m === 10 ? 8 : 16} adaptive questions, timed</span></button>)}
        <button className="qbtn q-orange" disabled={!missed.length} onClick={() => start(buildPractice('missed', 'Missed Question Rescue', missed, st, { tutor: true, timed: false }))}><strong>Missed Rescue</strong><span className="small">{missed.length ? `${missed.length} open misses, tutor mode` : 'No open misses yet'}</span></button>
        <button className="qbtn" onClick={() => start(buildLadder(store, st))}><strong>Difficulty Ladder</strong><span className="small">5 levels; 2 right in a row moves you up</span></button>
        <button className="qbtn q-red" onClick={() => start(buildPractice('missed', 'Night-Before Review', night, st, { tutor: true, timed: false }))}><strong>Night-Before</strong><span className="small">Confident-wrong first, then due & high-yield</span></button>
        <button className="qbtn" onClick={() => window.dispatchEvent(new CustomEvent('peds-open-ref'))}><strong>⚡ Rapid Review</strong><span className="small">Vitals, precautions, meds, safety</span></button>
      </div>
    </section>
  );
}
function ReadinessPanel() {
  const { store } = useApp();
  const r = useMemo(() => readinessDetail(store), [store]);
  const p = (x: number | null) => (x === null ? '—' : Math.round(x * 100) + '%');
  return (
    <section className="panel readiness-panel">
      <h2>Unofficial readiness estimate</h2>
      {r.estimate === null ? <p className="muted">Answer at least 20 never-seen questions or take a full simulation to see an estimate.</p> : (
        <p><span className="stat-n">{r.estimate}%</span> <span className="muted">likely range {r.low}–{r.high}%</span></p>
      )}
      <ul className="small rd-list">
        <li>Fresh (first-time) questions: <strong>{p(r.fresh.acc)}</strong> on {r.fresh.n} — first attempts before repeat practice</li>
        <li>Repeated questions: {p(r.repeat.acc)} on {r.repeat.n} (memory can inflate these)</li>
        <li>Correct but guessed (confidence 1–2): {r.luckyGuesses} · Wrong but confident (4–5): <strong>{r.confidentWrong}</strong></li>
        {r.excludedRef > 0 && <li>{r.excludedRef} session{r.excludedRef === 1 ? '' : 's'} excluded because Rapid Review was opened during them</li>}
      </ul>
      <p className="small muted">Practice-only estimate built from source-verified questions. It is not a HESI score and does not convert to the 850/900 scale.</p>
    </section>
  );
}
