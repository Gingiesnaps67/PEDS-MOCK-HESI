import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from './state';
import type { Store } from '../types';
import { srsUpdate, SrcChip } from './Rapid';
import { STAGES, STAGE_BY_ID, G3, G4, G5, ASSESS_EXTRA, rapidBank, MASTERY_TARGET, ES } from '../data/eriksonData';
import type { EQ, StageId, RQ } from '../data/eriksonData';

/** kept for older imports/tests */
export const ERIKSON = STAGES.map(s => ({ ...s, ages: s.id === 'identity' ? '12–18 years (game)' : s.ages }));

/* ------------------------------------------------------------------ progress helpers */
type GameKey = 'order' | 'match' | 'conflict' | 'scenario' | 'nursing' | 'rapid' | 'assess';
const bump = (g: Record<string, { n: number; correct: number; last: number }>, k: string, ok: boolean) => {
  const x = g[k] ?? { n: 0, correct: 0, last: 0 };
  return { ...g, [k]: { n: x.n + 1, correct: x.correct + (ok ? 1 : 0), last: Date.now() } };
};
/** first-attempt vs retry per stage, per game, Growth-center domain, confident-wrong, and 1-3-7 day spaced repetition */
export function recordE(s: Store, qid: string, stage: StageId | 'mixed', ok: boolean, game: GameKey, conf?: number): Store {
  const rapid = s.rapid ?? { games: {}, cards: {} };
  const first = !rapid.cards['er:' + qid];
  let games = rapid.games;
  if (stage !== 'mixed') games = bump(games, (first ? 'erf:' : 'err:') + stage, ok);
  games = bump(games, 'erg:' + game, ok);
  games = bump(games, 'gd:erikson', ok);
  if (!ok && (conf ?? 0) >= 4) games = bump(games, 'er:confwrong', true);
  if (conf) games = bump(games, conf >= 4 ? 'er:conf-hi' : conf <= 2 ? 'er:conf-lo' : 'er:conf-mid', ok);
  return srsUpdate({ ...s, rapid: { ...rapid, games } }, 'er:' + qid, ok);
}
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const dueFirst = (s: Store, qs: EQ[]) => [...qs].sort((a, b) => (s.rapid?.cards?.['er:' + a.id]?.due ?? 0) - (s.rapid?.cards?.['er:' + b.id]?.due ?? 0));
const Badge = ({ id, small }: { id: StageId; small?: boolean }) => { const s = STAGE_BY_ID[id]; return <span className={'es-badge es-' + id + (small ? ' sm' : '')} aria-hidden>{s.icon}</span>; };

/* ------------------------------------------------------------------ hero staircase */
function Staircase() {
  return (
    <div className="es-stairs" role="list" aria-label="Erikson’s five stages in order">
      {STAGES.map(s => (
        <div key={s.id} role="listitem" className={'es-step es-' + s.id} style={{ ['--step' as string]: s.n } as React.CSSProperties}>
          <span className="es-n">{s.n}</span>
          <span className="es-ic" aria-hidden>{s.icon}</span>
          <span className="es-name"><strong>{s.positive}</strong> <span className="es-vs">vs. {s.negative}</span></span>
          <span className="es-age">{s.group} · {s.ages}</span>
          <span className="es-hook">{s.hook}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Learn */
function Learn() {
  const [open, setOpen] = useState<StageId>('trust');
  const s = STAGE_BY_ID[open];
  return (
    <section className="es-panel">
      <div className="es-memory">
        <p className="es-mnemonic">🔑 <strong>T</strong>rust <strong>A</strong>lways <strong>I</strong>nitiates <strong>I</strong>ndustrious <strong>I</strong>dentity <span className="muted">(T-A-I-I-I)</span></p>
        <p>🏠 <strong>Analogy — building a house.</strong> Trust is the foundation · Autonomy, the walls the toddler insists on building alone · Initiative, starting new rooms without being told · Industry, the craftsmanship · Identity, putting your own name on the door. Your lecture: “you’ve got to get through this stage in order to progress to the next” — no walls without a foundation.</p>
      </div>
      <div className="es-tabs" role="tablist" aria-label="Choose a stage">
        {STAGES.map(x => <button key={x.id} role="tab" aria-selected={open === x.id} className={'es-tab es-' + x.id + (open === x.id ? ' on' : '')} onClick={() => setOpen(x.id)}><span aria-hidden>{x.icon}</span> {x.n}. {x.positive}</button>)}
      </div>
      <article className={'es-card es-' + s.id}>
        <header><Badge id={s.id} /><div><h3>{s.n}. {s.stage}</h3><p className="es-sub">{s.group} · <strong>{s.ages}</strong> <span className="muted small">({s.srcAges})</span></p></div><span className="es-hookbig">{s.hook}</span></header>
        <p className="es-meaning">{s.meaning}</p>
        <div className="es-grid">
          <div><h4>👀 What you’ll see</h4><ul>{s.behaviors.map(b => <li key={b}>{b}</li>)}</ul></div>
          <div className="es-nurse"><h4>🩺 Nursing that supports it</h4><ul>{s.nursing.map(b => <li key={b}>{b}</li>)}</ul></div>
          <div><h4>🧸 Age-matched activities</h4><p>{s.play}</p></div>
          <div className="es-risk"><h4>⚠ If unresolved</h4><p>{s.ifUnresolved}</p></div>
        </div>
        <div className="es-traps"><h4>🪤 Common ATI/HESI distractors</h4><ul>{s.traps.map(t => <li key={t}>{t}</li>)}</ul></div>
        <SrcChip src={s.src.join(' · ')} />
      </article>
      <details className="es-map"><summary>Source map for this module</summary>
        <ul className="small">
          <li><strong>Stage names, order, ages:</strong> {ES.L930}; {ES.PPTB}; {ES.ATIM} (adolescence 12–20); {ES.ATI6} (industry).</li>
          <li><strong>Stage meanings and examples:</strong> {ES.L930} (trust with parent vs stranger; “I don’t need mommy”; picks own clothes; spilled-milk guilt; industry = creativeness, fridge art, team sports; cliques and fashion; intimacy next).</li>
          <li><strong>Nursing interventions:</strong> {ES.T31H}; {ES.T31C}; {ES.T31O}; {ES.REV} (#25, #26, #30); {ES.T32} (school avoidance); {ES.T30}.</li>
          <li><strong>Not found:</strong> Erikson stage names did not appear in the Ch30–32 documents; those chapters support the nursing actions only. Page numbers are not available in the text extraction.</li>
        </ul></details>
    </section>
  );
}

/* ------------------------------------------------------------------ Game 1: order */
function OrderGame() {
  const { update } = useApp();
  const fresh = () => { let o = shuffle(STAGES.map(e => e.id)); while (o.every((id, i) => id === STAGES[i].id)) o = shuffle(o); return o; };
  const [order, setOrder] = useState<StageId[]>(fresh);
  const [sel, setSel] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [tries, setTries] = useState(0);
  const move = (from: number, to: number) => { if (checked || to < 0 || to >= order.length || from === to) return; const o = [...order]; const [x] = o.splice(from, 1); o.splice(to, 0, x); setOrder(o); };
  const right = order.filter((id, i) => id === STAGES[i].id).length;
  const check = () => { setChecked(true); const t = tries; setTries(t + 1); update(s => { let st = s; order.forEach((id, i) => { st = recordE(st, t === 0 ? 'order-' + id : 'order-retry-' + id + '-' + Date.now(), id, id === STAGES[i].id, 'order'); }); return st; }); };
  return (
    <section className="es-panel">
      <h3 className="es-gtitle">Game 1 · Put Erikson’s stages in order</h3>
      <p className="small">Earliest (birth) at the top. <strong>Drag</strong> a card, <strong>tap</strong> a card then tap where it goes, or use <strong>↑ ↓</strong>.</p>
      <ol className="er-order" aria-label="Stage cards in your current order">
        {order.map((id, i) => {
          const e = STAGE_BY_ID[id]; const ok = checked && id === STAGES[i].id;
          return (
            <li key={id} draggable={!checked} onDragStart={() => setDrag(i)} onDragOver={ev => ev.preventDefault()} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
              className={'er-card es-' + id + ' ' + (checked ? (ok ? 'ok' : 'no') : '') + (sel === i ? ' sel' : '')}>
              <span className="er-pos">{i + 1}</span>
              <button type="button" className="er-main" disabled={checked} aria-pressed={sel === i} onClick={() => { if (sel === null) setSel(i); else { move(sel, i); setSel(null); } }}>
                {e.stage}{checked && <span className="er-ans small"> — {ok ? '✓ ' : `✗ belongs at #${e.n} · `}{e.group}, {e.ages}</span>}
              </button>
              {!checked && <span className="er-arrows"><button type="button" className="btn small" aria-label={`Move ${e.stage} up`} disabled={i === 0} onClick={() => move(i, i - 1)}>↑</button><button type="button" className="btn small" aria-label={`Move ${e.stage} down`} disabled={i === order.length - 1} onClick={() => move(i, i + 1)}>↓</button></span>}
            </li>
          );
        })}
      </ol>
      {!checked ? <button className="btn primary" onClick={check}>Check my order</button> : (
        <div role="status" className="game-fb">
          <p className={right === 5 ? 'good-t' : 'bad-t'}><strong>{right === 5 ? 'Perfect order!' : `${right} of 5 in the right place.`}</strong> {right < 5 && 'Fix the red cards and check again.'}</p>
          <p className="es-mnemonic">🔑 <strong>T-A-I-I-I</strong>: Trust Always Initiates Industrious Identity.</p>
          <div className="row gap wrap">
            {right < 5 && <button className="btn primary" onClick={() => setChecked(false)}>Correct my order</button>}
            <button className={'btn' + (right === 5 ? ' primary' : '')} onClick={() => { setOrder(fresh()); setChecked(false); setSel(null); setTries(0); }}>New shuffle</button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ Game 2: match age ↔ stage (tap to pair) */
function MatchGame() {
  const { update } = useApp();
  const [ages, setAges] = useState(() => shuffle(STAGES.map(s => s.id)));
  const [sts, setSts] = useState(() => shuffle(STAGES.map(s => s.id)));
  const [pairs, setPairs] = useState<Partial<Record<StageId, StageId>>>({});
  const [pickAge, setPickAge] = useState<StageId | null>(null);
  const [checked, setChecked] = useState(false);
  const pairedStage = (st: StageId) => (Object.entries(pairs) as [StageId, StageId][]).find(([, v]) => v === st)?.[0];
  const num = (a: StageId) => ages.indexOf(a) + 1;
  const tapAge = (a: StageId) => { if (checked) return; if (pairs[a]) { const p = { ...pairs }; delete p[a]; setPairs(p); } setPickAge(pickAge === a ? null : a); };
  const tapStage = (st: StageId) => {
    if (checked) return;
    const owner = pairedStage(st);
    if (!pickAge) { if (owner) { const p = { ...pairs }; delete p[owner]; setPairs(p); } return; }
    const p = { ...pairs }; if (owner) delete p[owner]; p[pickAge] = st; setPairs(p); setPickAge(null);
  };
  const done = Object.keys(pairs).length === 5;
  const score = ages.filter(a => pairs[a] === a).length;
  return (
    <section className="es-panel">
      <h3 className="es-gtitle">Game 2 · Match age group to stage</h3>
      <p className="small">Tap an <strong>age card</strong>, then its <strong>stage card</strong>. Tap a paired card to undo.</p>
      <div className="mg">
        <div className="mg-col" aria-label="Age groups">{ages.map(a => { const s = STAGE_BY_ID[a]; const st = pairs[a]; const ok = checked && st === a;
          return <button key={a} type="button" className={'mg-card age' + (pickAge === a ? ' sel' : '') + (st ? ' paired' : '') + (checked ? (ok ? ' ok' : ' no') : '')} aria-pressed={pickAge === a} onClick={() => tapAge(a)}>
            <span className="mg-num">{st || pickAge === a ? num(a) : ''}</span><strong>{s.group}</strong><span>{s.ages}</span></button>; })}
        </div>
        <div className="mg-col" aria-label="Erikson stages">{sts.map(st => { const owner = pairedStage(st);
          return <button key={st} type="button" className={'mg-card stage' + (owner ? ' paired' : '')} onClick={() => tapStage(st)}>
            <span className="mg-num">{owner ? num(owner) : ''}</span><strong>{STAGE_BY_ID[st].stage}</strong></button>; })}
        </div>
      </div>
      {!checked ? <button className="btn primary" disabled={!done} onClick={() => { setChecked(true); update(s => { let t = s; ages.forEach(a => { t = recordE(t, 'match-' + a, a, pairs[a] === a, 'match'); }); return t; }); }}>Check matches</button> : (
        <div role="status" className="game-fb">
          <p className={score === 5 ? 'good-t' : 'bad-t'}><strong>{score} of 5 correct.</strong></p>
          <ul className="mg-explain">{STAGES.map(s => <li key={s.id} className={pairs[s.id] === s.id ? 'ok' : 'no'}><Badge id={s.id} small /> <strong>{s.group} ({s.ages})</strong> → {s.stage}. <span className="small">{s.meaning}</span></li>)}</ul>
          <p className="small muted">Ages are approximate developmental periods (ATI places adolescence at 12–20).</p>
          <button className="btn primary" onClick={() => { setAges(shuffle(STAGES.map(s => s.id))); setSts(shuffle(STAGES.map(s => s.id))); setPairs({}); setChecked(false); }}>New round</button>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ question runner (Games 3–5 & final) */
const COACH = [
  ['Identify the age', 'Circle the exact age; 5 is still preschool, 12 is a boundary age — then judge by behavior.'],
  ['Recognize the developmental need', 'Consistency? Independence? Starting things? Mastery? Identity and peers?'],
  ['Name the stage', 'Trust · Autonomy · Initiative · Industry · Identity (T-A-I-I-I).'],
  ['Choose the intervention that supports it', 'Rooming-in/same nurse · real choices/routines · just-before prep/doll/correct guilt · school & friends/tasks · control, privacy, peers.'],
  ['Eliminate misleading answers', 'Cross out actions meant for a different age group, threats, false promises, and anything that shames.'],
];
const CONF = ['Guessing', 'Unsure', 'Somewhat sure', 'Confident', 'Certain'];
interface Prepared { q: EQ; opts: { text: string; why: string; key: boolean }[] }
const prep = (q: EQ): Prepared => ({ q, opts: shuffle(q.options.map((o, i) => ({ text: o[0], why: o[1], key: i === q.answer }))) });

function Runner({ title, intro, build, game, target, onFinish }: { title: string; intro: string; build: (s: Store) => EQ[]; game: GameKey; target?: number; onFinish?: (right: number, total: number, retry: boolean) => void }) {
  const { store, update } = useApp();
  const [round, setRound] = useState(0);
  const [only, setOnly] = useState<string[] | null>(null);
  const qs = useMemo(() => { const base = build(store); return (only ? base.filter(q => only.includes(q.id)) : base).map(prep); }, [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [k, setK] = useState(0); const [choice, setChoice] = useState<number | null>(null); const [conf, setConf] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false); const [results, setResults] = useState<{ id: string; ok: boolean; conf: number | null }[]>([]);
  const [coach, setCoach] = useState(false);
  const restart = (ids: string[] | null) => { setOnly(ids); setRound(r => r + 1); setK(0); setChoice(null); setConf(null); setSubmitted(false); setResults([]); };
  const finished = qs.length > 0 && k >= qs.length;
  useEffect(() => { if (finished && onFinish) onFinish(results.filter(r => r.ok).length, results.length, !!only); }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!qs.length) return <section className="es-panel"><p>No questions available.</p></section>;
  if (k >= qs.length) {
    const right = results.filter(r => r.ok).length; const pct = right / results.length;
    const missed = results.filter(r => !r.ok).map(r => r.id);
    const cw = results.filter(r => !r.ok && (r.conf ?? 0) >= 4).length;
    return (
      <section className="es-panel">
        <h3 className="es-gtitle">{title} — results</h3>
        <p className="es-score"><span className={target ? (pct >= target ? 'good-t' : 'bad-t') : ''}>{right}/{results.length}</span> <span className="muted">({Math.round(pct * 100)}%){target ? ` · mastery target ${Math.round(target * 100)}%` : ''}</span></p>
        {target && <p className={pct >= target ? 'good-t' : 'bad-t'}><strong>{pct >= target ? '🎉 Practice mastery reached.' : 'Not yet at the mastery target — review the missed items and retake.'}</strong></p>}
        {cw > 0 && <p className="bad-t small">⚠ {cw} answer{cw === 1 ? ' was' : 's were'} wrong while you felt confident — these come back first tomorrow.</p>}
        <p className="small muted">Missed items return in 1 day; correct ones in 3, then 7 days.</p>
        <div className="row gap wrap">{missed.length > 0 && <button className="btn primary" onClick={() => restart(missed)}>Retry the {missed.length} missed</button>}<button className="btn" onClick={() => restart(null)}>New round</button></div>
      </section>
    );
  }
  const p = qs[k]; const q = p.q; const correct = choice !== null && p.opts[choice].key;
  const submit = () => { if (choice === null) return; setSubmitted(true); const ok = p.opts[choice].key; setResults(r => [...r, { id: q.id, ok, conf }]); update(s => recordE(s, only ? q.id + '-retry-' + Date.now() : q.id, q.stage, ok, game, conf ?? undefined)); };
  const lvl = ['', 'Level 1 · Recall', 'Level 2 · Apply', 'Level 3 · Analyze'][q.level];
  return (
    <section className="es-panel es-run">
      <div className="row between wrap"><h3 className="es-gtitle">{title}</h3><span className="mono">{k + 1}/{qs.length}</span></div>
      {k === 0 && !submitted && <p className="small muted">{intro}</p>}
      <div className="es-progress" aria-hidden><span style={{ width: `${(k / qs.length) * 100}%` }} /></div>
      <span className={'chip lvl lvl' + q.level}>{lvl}</span>
      <p className="es-prompt">{q.prompt}</p>
      <button type="button" className="btn small ghost" aria-expanded={coach} onClick={() => setCoach(!coach)}>🧭 Clinical reasoning coach</button>
      {coach && <ol className="es-coach">{COACH.map(([t, d]) => <li key={t}><strong>{t}.</strong> {d}</li>)}</ol>}
      <div className="es-opts" role="radiogroup" aria-label="Answer choices">
        {p.opts.map((o, i) => {
          const cls = submitted ? (o.key ? ' key' : choice === i ? ' wrong' : ' dim') : choice === i ? ' picked' : '';
          return (
            <div key={i} className={'es-opt' + cls}>
              <button type="button" role="radio" aria-checked={choice === i} disabled={submitted} onClick={() => setChoice(i)}><span className="es-letter">{String.fromCharCode(65 + i)}</span><span>{o.text}</span></button>
              {submitted && <p className="es-why small">{o.key ? '✓ ' : '✗ '}{o.why}</p>}
            </div>
          );
        })}
      </div>
      {!submitted && (
        <div className="es-conf" role="radiogroup" aria-label="Confidence, 1 guessing to 5 certain">
          <span className="small">Confidence:</span>
          {CONF.map((c, i) => <button key={c} type="button" role="radio" aria-checked={conf === i + 1} title={c} aria-label={`${i + 1} — ${c}`} className={'conf-btn' + (conf === i + 1 ? ' on' : '')} onClick={() => setConf(i + 1)}>{i + 1}</button>)}
          <span className="small muted">{conf ? CONF[conf - 1] : 'optional'}</span>
        </div>
      )}
      {!submitted ? <button className="btn primary" disabled={choice === null} onClick={submit}>Submit answer</button> : (
        <div role="status" className={'game-fb ' + (correct ? 'fb-ok' : 'fb-no')}>
          <p className={correct ? 'good-t' : 'bad-t'}><strong>{correct ? 'Correct.' : 'Not quite.'}</strong> {q.stage !== 'mixed' && <>Stage: <Badge id={q.stage} small /> <strong>{STAGE_BY_ID[q.stage].stage}</strong>.</>}</p>
          <p className="small"><strong>Key clue:</strong> {q.clue}</p>
          {!correct && (conf ?? 0) >= 4 && <p className="small bad-t">You felt confident here — it will be scheduled for review first.</p>}
          <SrcChip src={q.src.join(' · ')} />
          <button className="btn primary" onClick={() => { setK(k + 1); setChoice(null); setConf(null); setSubmitted(false); setCoach(false); }}>{k + 1 < qs.length ? 'Next question' : 'See results'}</button>
        </div>
      )}
    </section>
  );
}
/** progressive: level 1 → 3, due/missed items first inside each level */
const progressive = (bank: EQ[]) => (s: Store) => [1, 2, 3].flatMap(l => dueFirst(s, shuffle(bank.filter(q => q.level === l))));
function buildAssessment(s: Store): EQ[] {
  const pick = (bank: EQ[], n: number, lv: number[]) => shuffle(dueFirst(s, bank.filter(q => lv.includes(q.level))).slice(0, n + 2)).slice(0, n);
  return shuffle([...pick(G3, 4, [2, 3]), ...pick(G4, 4, [1, 2, 3]), ...pick(G5, 4, [1, 2, 3]), ...ASSESS_EXTRA]);
}

/* ------------------------------------------------------------------ Game 6: 60-second rapid recall */
function RapidRecall() {
  const { store, update } = useApp();
  const [mode, setMode] = useState<'timed' | 'untimed' | null>(null);
  const [bank, setBank] = useState<RQ[]>([]);
  const [i, setI] = useState(0); const [score, setScore] = useState(0); const [left, setLeft] = useState(60); const [last, setLast] = useState<{ ok: boolean; why: string } | null>(null);
  const [opts, setOpts] = useState<{ t: string; key: boolean }[]>([]);
  const t = useRef<number>();
  const best = store.rapid?.games?.['er:rapid-best']?.correct ?? 0;
  const load = (b: RQ[], idx: number) => { const q = b[idx % b.length]; const sh = shuffle(q.options.map((o, k) => ({ t: o, key: k === q.answer }))); setOpts(q.options.length > 4 ? sh.filter(o => o.key).concat(sh.filter(o => !o.key).slice(0, 3)).sort(() => Math.random() - 0.5) : sh); };
  const start = (m: 'timed' | 'untimed') => { const b = shuffle(rapidBank()); setBank(b); setI(0); setScore(0); setLeft(60); setLast(null); setMode(m); load(b, 0); };
  useEffect(() => {
    if (mode !== 'timed') return;
    t.current = window.setInterval(() => setLeft(l => l - 1), 1000);
    return () => window.clearInterval(t.current);
  }, [mode]);
  const over = mode === 'timed' && left <= 0;
  useEffect(() => {
    if (over) { window.clearInterval(t.current); if (score > best) update(s => ({ ...s, rapid: { ...s.rapid, games: { ...s.rapid.games, 'er:rapid-best': { n: 60, correct: score, last: Date.now() } } } })); }
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!mode) return (
    <section className="es-panel">
      <h3 className="es-gtitle">Game 6 · 60-Second Rapid Recall</h3>
      <p>Stage order, age groups, hooks, activities, and nursing actions — as fast as you can.</p>
      <p className="small muted">Best timed score: <strong>{best}</strong></p>
      <div className="row gap wrap"><button className="btn primary" onClick={() => start('timed')}>⏱ Start 60-second round</button><button className="btn" onClick={() => start('untimed')}>Untimed practice</button></div>
    </section>
  );
  if (over) return (
    <section className="es-panel"><h3 className="es-gtitle">Time! {score} correct</h3><p>{score > best ? '🎉 New best score!' : `Best: ${best}`}</p><div className="row gap"><button className="btn primary" onClick={() => start('timed')}>Play again</button><button className="btn" onClick={() => setMode(null)}>Back</button></div></section>
  );
  const q = bank[i % bank.length];
  const answer = (o: { t: string; key: boolean }) => {
    setLast({ ok: o.key, why: q.why }); if (o.key) setScore(score + 1);
    update(s => recordE(s, q.id, q.stage, o.key, 'rapid'));
    const ni = i + 1; setI(ni); load(bank, ni);
  };
  return (
    <section className="es-panel rr">
      <div className="row between"><h3 className="es-gtitle">Rapid Recall</h3>{mode === 'timed' ? <span className={'rr-timer mono' + (left <= 10 ? ' low' : '')} role="timer">⏱ {left}s</span> : <button className="btn small" onClick={() => setMode(null)}>Stop</button>}</div>
      <p className="rr-score mono">Score {score}</p>
      <p className="es-prompt">{q.prompt}</p>
      <div className="rr-opts">{opts.map(o => <button key={o.t} className="btn rr-btn" onClick={() => answer(o)}>{o.t}</button>)}</div>
      {last && <p role="status" className={'small ' + (last.ok ? 'good-t' : 'bad-t')}>{last.ok ? '✓' : '✗'} {last.why}</p>}
    </section>
  );
}

/* ------------------------------------------------------------------ progress */
function Progress() {
  const { store } = useApp();
  const g = store.rapid?.games ?? {};
  const cards = store.rapid?.cards ?? {};
  const p = (x?: { n: number; correct: number }) => (x && x.n ? `${Math.round((x.correct / x.n) * 100)}%` : '—');
  const due = Object.entries(cards).filter(([k, v]) => k.startsWith('er:') && v.due <= Date.now()).length;
  const games: [GameKey, string][] = [['order', '1 Order'], ['match', '2 Age match'], ['conflict', '3 Conflict'], ['scenario', '4 Scenario'], ['nursing', '5 Intervention'], ['rapid', '6 Rapid recall'], ['assess', 'Final assessment']];
  const ab = g['er:assess-best'];
  return (
    <section className="es-panel">
      <h3 className="es-gtitle">My Erikson progress</h3>
      <div className="es-kpis">
        <div><span className="stat-n">{due}</span><span className="small">cards due now</span></div>
        <div><span className="stat-n">{ab ? `${Math.round((ab.correct / 15) * 100)}%` : '—'}</span><span className="small">best final assessment (target 85%)</span></div>
        <div><span className="stat-n">{g['er:confwrong']?.n ?? 0}</span><span className="small">confident-but-wrong</span></div>
      </div>
      <h4>By stage</h4>
      <div className="vgm"><div className="vgm-row vgm-h"><span>Stage</span><span>First attempt</span><span>Retry</span></div>
        {STAGES.map(s => { const f = g['erf:' + s.id]; const good = f && f.n >= 5 && f.correct / f.n >= 0.85; return <div key={s.id} className={'vgm-row es-row es-' + s.id + (good ? ' m-good' : '')}><span><Badge id={s.id} small /> {good ? '✓ ' : ''}{s.positive}</span><span className="mono">{p(f)} <span className="muted">({f?.n ?? 0})</span></span><span className="mono">{p(g['err:' + s.id])} <span className="muted">({g['err:' + s.id]?.n ?? 0})</span></span></div>; })}
      </div>
      <h4>By game</h4>
      <div className="vgm">{games.map(([k, l]) => <div key={k} className="vgm-row"><span>{l}</span><span className="mono">{p(g['erg:' + k])}</span><span className="mono muted">{g['erg:' + k]?.n ?? 0} answers</span></div>)}</div>
      <h4>Confidence calibration</h4>
      <p className="small">When certain (4–5): <strong>{p(g['er:conf-hi'])}</strong> · unsure (1–2): <strong>{p(g['er:conf-lo'])}</strong>. Mastered = 85%+ on 5 or more first attempts.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ center */
type Tab = 'learn' | 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'final' | 'progress';
const TABS: [Tab, string][] = [['learn', '📘 Learn'], ['g1', '1 · Order'], ['g2', '2 · Age match'], ['g3', '3 · Conflict'], ['g4', '4 · Scenario'], ['g5', '5 · Intervention'], ['g6', '6 · 60-sec recall'], ['final', '🏁 Final 15'], ['progress', '📊 Progress']];

export function EriksonGame() {
  const { update } = useApp();
  const [tab, setTab] = useState<Tab>('learn');
  return (
    <section className="erikson-center">
      <header className="es-hero">
        <p className="es-eyebrow">🧠 Growth & Development · Psychosocial</p>
        <h2>Erikson’s Psychosocial Development Mastery Center</h2>
        <p className="es-lede">Five stages, birth to 18 — memorize the order, know what each means, and apply it to HESI-style nursing questions. Built from your lecture 09/30, course PowerPoint, ATI readings, and textbook Ch30–32.</p>
        <Staircase />
      </header>
      <nav className="es-nav" role="tablist" aria-label="Erikson center sections">
        {TABS.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{l}</button>)}
      </nav>
      {tab === 'learn' && <Learn />}
      {tab === 'g1' && <OrderGame />}
      {tab === 'g2' && <MatchGame />}
      {tab === 'g3' && <Runner key="g3" title="Game 3 · Match the psychosocial conflict" intro="Needs and behaviors → stage. Questions get harder as you go (Level 1 → 3)." build={progressive(G3)} game="conflict" />}
      {tab === 'g4' && <Runner key="g4" title="Game 4 · Identify the stage from the scenario" intro="Realistic pediatric situations. Read the age and behavior, then name the stage." build={progressive(G4)} game="scenario" />}
      {tab === 'g5' && <Runner key="g5" title="Game 5 · Best nursing intervention" intro="Which action best supports the child’s psychosocial development? Every choice is explained after you submit." build={progressive(G5)} game="nursing" />}
      {tab === 'g6' && <RapidRecall />}
      {tab === 'final' && <Runner key="final" title="🏁 Final Erikson assessment (15 questions)" intro="Mixed ATI/HESI-style questions from all games. Practice mastery target: 85% (13 of 15)." build={buildAssessment} game="assess" target={MASTERY_TARGET}
        onFinish={(right, total, retry) => { if (retry || total !== 15) return; update(s => { const b = s.rapid.games['er:assess-best']; const hist = s.rapid.games['er:assess-taken'] ?? { n: 0, correct: 0, last: 0 }; const games: Record<string, { n: number; correct: number; last: number }> = { ...s.rapid.games, 'er:assess-taken': { n: hist.n + 1, correct: hist.correct + (right / total >= MASTERY_TARGET ? 1 : 0), last: Date.now() } }; if (right > (b?.correct ?? -1)) games['er:assess-best'] = { n: 15, correct: right, last: Date.now() }; return { ...s, rapid: { ...s.rapid, games } }; }); }} />}
      {tab === 'progress' && <Progress />}
    </section>
  );
}
