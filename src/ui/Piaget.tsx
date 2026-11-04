import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from './state';
import type { Store } from '../types';
import { srsUpdate, SrcChip } from './Rapid';
import { STAGES, STAGE_BY, AGES, stageAt, transitionNote, ageDetail, BANK, SCENARIOS, MATCH, CARDS, COMPARES, TABLE_ROWS, CRASH_RAPID, CONCEPT_LABEL, PS, explainWrong } from '../data/piagetData';
import type { PStage, PQ, Concept, Fmt } from '../data/piagetData';

/* ================================================================ progress */
type G = Record<string, { n: number; correct: number; last: number }>;
const bump = (g: G, k: string, ok: boolean): G => { const x = g[k] ?? { n: 0, correct: 0, last: 0 }; return { ...g, [k]: { n: x.n + 1, correct: x.correct + (ok ? 1 : 0), last: Date.now() } }; };
export function recordP(s: Store, item: { id: string; stage: PStage | 'mixed'; concept: Concept; fmt: Fmt | 'match' | 'lab' | 'sim' }, ok: boolean): Store {
  const rapid = s.rapid ?? { games: {}, cards: {} };
  let games = bump(rapid.games, `pgc:${item.concept}:${item.fmt}`, ok);
  if (item.stage !== 'mixed') games = bump(games, 'pgs:' + item.stage, ok);
  games = bump(games, 'pg:all', ok);
  games = bump(games, 'gd:piaget', ok);
  return srsUpdate({ ...s, rapid: { ...rapid, games } }, 'pg:' + item.id, ok);
}
export function conceptStats(s: Store) {
  const g = s.rapid?.games ?? {};
  const out: Record<string, { n: number; correct: number; formats: number }> = {};
  Object.entries(g).forEach(([k, v]) => {
    if (!k.startsWith('pgc:')) return;
    const [, c] = k.split(':'); const o = out[c] ?? (out[c] = { n: 0, correct: 0, formats: 0 });
    o.n += v.n; o.correct += v.correct; if (v.correct > 0) o.formats++;
  });
  return out;
}
export type Level = 'Not started' | 'Needs Review' | 'Developing' | 'Mastered';
export function levelOf(x?: { n: number; correct: number; formats: number }): Level {
  if (!x || !x.n) return 'Not started';
  const acc = x.correct / x.n;
  if (x.correct >= 3 && acc >= 0.8 && x.formats >= 2) return 'Mastered';
  if (acc >= 0.6 || x.n < 3) return 'Developing';
  return 'Needs Review';
}
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const SBadge = ({ id }: { id: PStage }) => <span className={'ps-badge ps-' + id}>{STAGE_BY[id].icon} {STAGE_BY[id].name}</span>;

/* ================================================================ illustrations (inline SVG, no assets) */
export function ChildFig({ stage, size = 96 }: { stage: PStage; size?: number }) {
  const scale = { sensorimotor: 0.62, preoperational: 0.78, concrete: 0.9, formal: 1 }[stage];
  const h = 100 * scale;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={'ps-fig ps-' + stage} role="img" aria-label={`Illustration: ${STAGE_BY[stage].name} child`}>
      <circle cx="60" cy={118 - h} r={12 * (0.8 + scale * 0.25)} className="fig-skin" />
      <rect x={60 - 13 * scale} y={130 - h} width={26 * scale} height={h * 0.5} rx="8" className="fig-shirt" />
      <rect x={60 - 11 * scale} y={130 - h + h * 0.48} width={9 * scale} height={h * 0.32} rx="4" className="fig-leg" />
      <rect x={60 + 2 * scale} y={130 - h + h * 0.48} width={9 * scale} height={h * 0.32} rx="4" className="fig-leg" />
      {stage === 'sensorimotor' && <g><circle cx="88" cy="88" r="9" className="fig-toy" /><line x1="88" y1="97" x2="88" y2="110" className="fig-stroke" /><text x="20" y="40" className="fig-txt">👀 ✋</text></g>}
      {stage === 'preoperational' && <g><circle cx="90" cy="86" r="10" className="fig-toy" /><circle cx="84" cy="78" r="4" className="fig-toy" /><circle cx="96" cy="78" r="4" className="fig-toy" /><text x="12" y="34" className="fig-txt">✨</text></g>}
      {stage === 'concrete' && <g><rect x="80" y="92" width="10" height="16" className="fig-block" /><rect x="92" y="84" width="10" height="24" className="fig-block" /><rect x="104" y="76" width="10" height="32" className="fig-block" /></g>}
      {stage === 'formal' && <g><ellipse cx="92" cy="22" rx="24" ry="14" className="fig-bubble" /><circle cx="76" cy="40" r="3" className="fig-bubble" /><text x="80" y="27" className="fig-txt">?!</text></g>}
    </svg>
  );
}

/* ================================================================ 1. timeline */
function Timeline({ onTest }: { onTest: (s: PStage) => void }) {
  const [i, setI] = useState(AGES.findIndex(a => a.key === '4y'));
  const a = AGES[i]; const st = stageAt(a.years); const s = STAGE_BY[st]; const d = ageDetail(a.years); const note = transitionNote(a.years);
  return (
    <section className="ps-panel">
      <h3 className="ps-h">Cognitive development timeline · newborn to 17</h3>
      <div className="ps-bar" aria-hidden>{STAGES.map(x => <span key={x.id} className={'ps-seg ps-' + x.id} style={{ flex: Math.min(x.to, 17) - x.from }}>{x.icon} {x.name}</span>)}</div>
      <label className="ps-slider"><span className="small">Age: <strong>{a.label}</strong></span>
        <input type="range" min={0} max={AGES.length - 1} value={i} onChange={e => setI(Number(e.target.value))} aria-valuetext={a.label} aria-label="Age slider" />
      </label>
      <div className="ps-agechips" role="group" aria-label="Choose an age">{AGES.map((x, k) => <button key={x.key} className={'ps-chip ps-' + stageAt(x.years) + (k === i ? ' on' : '')} aria-pressed={k === i} onClick={() => setI(k)}>{x.label.replace(' years', 'y').replace(' months', 'mo')}</button>)}</div>
      <article className={'ps-agecard ps-' + st}>
        <div className="ps-agehead"><ChildFig stage={st} /><div><p className="ps-agelbl">AGE: {a.label.toUpperCase()}</p><h4>{s.icon} {s.name}</h4><p className="small">{s.ages} · {s.concept}</p></div></div>
        {note && <p className="ps-note">↔ {note}</p>}
        <div className="ps-cols">
          <div><h5>Can usually understand</h5><ul>{d.understands.map(x => <li key={x}>{x}</li>)}</ul></div>
          <div><h5>Still difficult</h5><ul>{d.hard.map(x => <li key={x}>{x}</li>)}</ul></div>
        </div>
        <p><strong>🏠 Everyday:</strong> {d.everyday}</p>
        <p className="ps-nurse"><strong>🩺 Nursing:</strong> {d.nursing}</p>
        <p className="ps-warn"><strong>⚠ HESI warning:</strong> {d.warning}</p>
        <button className="btn primary" onClick={() => onTest(st)}>Test My Understanding</button>
      </article>
    </section>
  );
}

/* ================================================================ shared quiz runner */
interface RunQ { id: string; stage: PStage | 'mixed'; concept: Concept; fmt: Fmt; prompt: string; options: [string, string][]; answer: number[]; rationale: string; clue: string; memory: string; src: string[] }
function prepQ(qq: RunQ) { const idx = shuffle(qq.options.map((_, i) => i)); return { ...qq, options: idx.map(i => qq.options[i]), answer: qq.answer.map(a => idx.indexOf(a)) }; }
export function Quiz({ title, pool, timed, onDone, recordAs }: { title: string; pool: RunQ[]; timed?: number; onDone?: (right: number, total: number) => void; recordAs?: (q: RunQ) => Fmt | 'sim' }) {
  const { update } = useApp();
  const [qs, setQs] = useState(() => shuffle(pool).map(prepQ));
  const [k, setK] = useState(0); const [sel, setSel] = useState<number[]>([]); const [done, setDone] = useState(false);
  const [res, setRes] = useState<{ q: RunQ; ok: boolean }[]>([]); const [left, setLeft] = useState(timed ?? 0);
  useEffect(() => { if (!timed) return; const t = window.setInterval(() => setLeft(l => Math.max(0, l - 1)), 1000); return () => window.clearInterval(t); }, [timed, qs]);
  const over = k >= qs.length || (!!timed && left === 0);
  useEffect(() => { if (over && res.length && onDone) onDone(res.filter(r => r.ok).length, timed ? qs.length : res.length); }, [over]); // eslint-disable-line react-hooks/exhaustive-deps
  const restart = (p: RunQ[]) => { setQs(shuffle(p).map(prepQ)); setK(0); setSel([]); setDone(false); setRes([]); setLeft(timed ?? 0); };
  if (!qs.length) return <p className="muted">No questions yet — answer some first.</p>;
  if (over) {
    const right = res.filter(r => r.ok).length; const missed = res.filter(r => !r.ok).map(r => r.q);
    return (
      <section className="ps-panel">
        <h3 className="ps-h">{title} — {right}/{timed ? qs.length : res.length}</h3>
        {timed && left === 0 && <p className="bad-t small">Time ran out — unanswered questions count as incorrect.</p>}
        {missed.length > 0 && <><h4>Missed-question review</h4><ul className="ps-missed">{missed.map(m => <li key={m.id}><strong>{m.prompt}</strong><br /><span className="good-t">✓ {m.answer.map(a => m.options[a][0]).join('; ')}</span><br /><span className="small">{m.rationale}</span></li>)}</ul></>}
        <div className="row gap wrap">{missed.length > 0 && <button className="btn primary" onClick={() => restart(missed)}>Retry incorrect ({missed.length})</button>}<button className="btn" onClick={() => restart(pool)}>New random order</button></div>
      </section>
    );
  }
  const qq = qs[k]; const multi = qq.answer.length > 1 || qq.fmt === 'sata';
  const ok = done && sel.length === qq.answer.length && qq.answer.every(a => sel.includes(a));
  const toggle = (i: number) => { if (done) return; setSel(multi ? (sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i]) : [i]); };
  const submit = () => { setDone(true); const good = sel.length === qq.answer.length && qq.answer.every(a => sel.includes(a)); setRes(r => [...r, { q: qq, ok: good }]); update(s => recordP(s, { ...qq, fmt: recordAs?.(qq) ?? qq.fmt }, good)); };
  const score = res.filter(r => r.ok).length;
  return (
    <section className="ps-panel">
      <div className="row between wrap"><h3 className="ps-h">{title}</h3><span className="mono">{timed ? `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} · ` : ''}Score {score}/{res.length} · {k + 1}/{qs.length}</span></div>
      <div className="ps-prog" aria-hidden><span style={{ width: `${(k / qs.length) * 100}%` }} /></div>
      <p className="ps-prompt">{qq.prompt}</p>
      {multi && <p className="small muted">Select all that apply.</p>}
      <div className="ps-opts" role={multi ? 'group' : 'radiogroup'} aria-label="Answer choices">
        {qq.options.map((o, i) => {
          const key = qq.answer.includes(i); const cls = done ? (key ? ' key' : sel.includes(i) ? ' wrong' : '') : sel.includes(i) ? ' picked' : '';
          return <div key={i} className={'ps-opt' + cls}><button type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={sel.includes(i)} disabled={done} onClick={() => toggle(i)}><span className="ps-l">{multi ? (sel.includes(i) ? '☑' : '☐') : String.fromCharCode(65 + i)}</span><span>{o[0]}</span></button>
            {done && <p className="small ps-why">{qq.fmt === 'correction' ? (key ? '✓ This is the statement that needs correcting.' : `✓ Accurate statement — no correction needed.${o[1] && o[1].length > 12 ? ' ' + o[1] : ''}`) : key ? '✓ Correct choice.' : `✗ ${explainWrong(o[0], o[1])}`}</p>}</div>;
        })}
      </div>
      {!done ? <button className="btn primary" disabled={!sel.length} onClick={submit}>Submit</button> : (
        <div role="status" className={'game-fb ' + (ok ? 'fb-ok' : 'fb-no')}>
          <p className={ok ? 'good-t' : 'bad-t'}><strong>{ok ? 'Correct!' : 'Not quite.'}</strong> Correct answer: {qq.answer.map(a => qq.options[a][0]).join('; ')}</p>
          <p>{qq.rationale}</p>
          <p className="small">{qq.stage !== 'mixed' ? <SBadge id={qq.stage} /> : <span className="chip">Mixed stages</span>} · Concept: {CONCEPT_LABEL[qq.concept]}</p>
          {qq.clue && <p className="small"><strong>Clue:</strong> {qq.clue}</p>}
          <p className="small ps-mem">🧠 {qq.memory}</p>
          <SrcChip src={qq.src.join(' · ')} />
          <button className="btn primary" onClick={() => { setK(k + 1); setSel([]); setDone(false); }}>{k + 1 < qs.length ? 'Next' : 'See results'}</button>
        </div>
      )}
    </section>
  );
}

/* ================================================================ 2. stage cards */
function StageCards() {
  const [open, setOpen] = useState<PStage | null>('sensorimotor');
  const [ans, setAns] = useState<Record<string, number>>({});
  const { update } = useApp();
  const checks = useMemo(() => Object.fromEntries(STAGES.map(st => [st.id, prepQ(BANK.find(b => b.stage === st.id && b.fmt !== 'sata')!)])), []);
  const check = (st: PStage) => checks[st];
  return (
    <section className="ps-cards">{STAGES.map(s => {
      const isOpen = open === s.id; const c = check(s.id); const pick = ans[s.id];
      return (
        <article key={s.id} className={'ps-scard ps-' + s.id + (isOpen ? ' open' : '')}>
          <button className="ps-scard-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.id)}>
            <ChildFig stage={s.id} size={72} /><span><span className="ps-num">Stage {s.n}</span><strong>{s.name}</strong><span className="small">{s.ages}</span><span className="small ps-concept">{s.concept}</span></span><span aria-hidden className="ps-chev">{isOpen ? '−' : '+'}</span>
          </button>
          {isOpen && <div className="ps-scard-body">
            <p className="ps-mind">🧠 {s.mind}</p>
            <p className="small muted">Your sources: {s.srcAges}</p>
            <h5>5 key characteristics</h5><ol>{s.traits.map(t => <li key={t}>{t}</li>)}</ol>
            <div className="ps-cols"><div><h5>🏠 Everyday examples</h5><ul>{s.everyday.map(t => <li key={t}>{t}</li>)}</ul></div><div className="ps-nurse"><h5>🩺 Nursing examples</h5><ul>{s.nursing.map(t => <li key={t}>{t}</li>)}</ul></div></div>
            <div className="ps-warn"><h5>🪤 HESI/NCLEX traps</h5><ul>{s.traps.map(t => <li key={t}>{t}</li>)}</ul></div>
            <p className="ps-memory">🔑 {s.memory}</p>
            <div className="ps-check"><p><strong>Knowledge check:</strong> {c.prompt}</p>
              <div className="ps-mini">{c.options.map((o, i) => <button key={i} className={'btn' + (pick !== undefined && i === c.answer[0] ? ' good' : pick === i ? ' bad-b' : '')} disabled={pick !== undefined} onClick={() => { setAns({ ...ans, [s.id]: i }); update(st => recordP(st, c, i === c.answer[0])); }}>{o[0]}</button>)}</div>
              {pick !== undefined && <p role="status" className={pick === c.answer[0] ? 'good-t' : 'bad-t'}>{c.rationale} <button className="btn small" onClick={() => { const n = { ...ans }; delete n[s.id]; setAns(n); }}>Try again</button></p>}
            </div>
            <SrcChip src={s.src.join(' · ')} />
          </div>}
        </article>
      );
    })}</section>
  );
}

/* ================================================================ 3. experiment lab */
function Exp({ title, children }: { title: string; children: React.ReactNode }) { return <article className="ps-exp"><h4>{title}</h4>{children}</article>; }
function Choice({ q: question, options, answer, why, nurse, id, concept, stage }: { q: string; options: string[]; answer: number; why: string; nurse: string; id: string; concept: Concept; stage: PStage }) {
  const { update } = useApp(); const [p, setP] = useState<number | null>(null);
  return (
    <div className="ps-q"><p><strong>{question}</strong></p>
      <div className="ps-mini">{options.map((o, i) => <button key={o} className={'btn' + (p !== null && i === answer ? ' good' : p === i ? ' bad-b' : '')} disabled={p !== null} onClick={() => { setP(i); update(s => recordP(s, { id, stage, concept, fmt: 'lab' }, i === answer)); }}>{o}</button>)}</div>
      {p !== null && <div role="status" className="game-fb"><p className={p === answer ? 'good-t' : 'bad-t'}><strong>{p === answer ? 'Correct.' : 'Not quite.'}</strong> {why}</p><p className="small ps-nurse">🩺 {nurse}</p><button className="btn small" onClick={() => setP(null)}>Try Again</button></div>}
    </div>
  );
}
function Lab() {
  const [hidden, setHidden] = useState(false); const [peek, setPeek] = useState(false);
  const [poured, setPoured] = useState(false);
  const [labIdx, setLabIdx] = useState(0);
  const labs = ['A · Object permanence', 'B · Conservation of liquid', 'C · Egocentrism', 'D · Magical thinking', 'E · Concrete vs. abstract'];
  return (
    <section className="ps-panel">
      <h3 className="ps-h">🔬 Cognitive Experiment Lab</h3>
      <div className="seg" role="tablist" aria-label="Experiments">{labs.map((l, i) => <button key={l} role="tab" aria-selected={labIdx === i} className={labIdx === i ? 'on' : ''} onClick={() => setLabIdx(i)}>{l}</button>)}</div>
      {labIdx === 0 && <Exp title="A · Object permanence (sensorimotor)">
        <svg viewBox="0 0 300 140" className="ps-svg" role="img" aria-label={hidden ? (peek ? 'Blanket lifted: the ball is still there' : 'A blanket covers the ball') : 'A red ball on the floor'}>
          <rect x="0" y="118" width="300" height="22" className="lab-floor" />
          <circle cx="150" cy="100" r="18" className="lab-ball" />
          <g className={'lab-blanket' + (hidden && !peek ? ' down' : '')}><path d="M95 120 Q150 50 205 120 Z" /></g>
        </svg>
        <div className="row gap wrap"><button className="btn" onClick={() => { setHidden(!hidden); setPeek(false); }}>{hidden ? 'Remove blanket' : 'Hide the ball'}</button>{hidden && <button className="btn" onClick={() => setPeek(!peek)}>{peek ? 'Lower blanket' : 'Lift a corner'}</button>}</div>
        <Choice id="lab-a" concept="objectPermanence" stage="sensorimotor" q="A 10-month-old watched you hide the ball. Does she understand it still exists?" options={['Yes — she will search for it', 'No — out of sight is gone', 'Only if she can still see part of it']} answer={0} why="Object permanence — knowing objects exist when unseen — is highlighted at about 9 months in your course and develops gradually. A 3-month-old may lose interest when it disappears." nurse="Separation distress shows the infant knows the parent still exists: keep parents close." />
      </Exp>}
      {labIdx === 1 && <Exp title="B · Conservation of liquid (preoperational → concrete)">
        <svg viewBox="0 0 300 160" className="ps-svg" role="img" aria-label={poured ? 'Left: short wide glass. Right: tall thin glass with the same water, now higher.' : 'Two identical glasses with equal water'}>
          <rect x="40" y="60" width="70" height="90" className="lab-glass" /><rect x="41" y="105" width="68" height="44" className="lab-water" />
          {!poured ? <><rect x="190" y="60" width="70" height="90" className="lab-glass" /><rect x="191" y="105" width="68" height="44" className="lab-water lab-anim" /></>
            : <><rect x="205" y="10" width="40" height="140" className="lab-glass" /><rect x="206" y="72" width="38" height="77" className="lab-water lab-anim" /></>}
          <text x="75" y="158" className="fig-txt" textAnchor="middle">A</text><text x="225" y="158" className="fig-txt" textAnchor="middle">B</text>
        </svg>
        <button className="btn" onClick={() => setPoured(!poured)}>{poured ? 'Reset glasses' : 'Pour B into a tall, thin glass'}</button>
        {poured && <Choice id="lab-b" concept="conservation" stage="concrete" q="Which glass contains more water?" options={['A (short)', 'B (tall)', 'Both contain the same']} answer={2} why="Both contain the same amount. A preoperational child centers on the height of the water and says the tall glass has more. Conservation develops in concrete operations (ATI Ch6: mass, then weight, then volume)." nurse="Show a school-age child real medicine cups and syringes when explaining doses; for a preschooler, keep it simple." />}
      </Exp>}
      {labIdx === 2 && <Exp title="C · Egocentrism (preoperational)">
        <svg viewBox="0 0 300 170" className="ps-svg" role="img" aria-label="A table with a tall box. A teddy bear is on Maya’s side of the box; a ball is on Leo’s side. Maya sits at the front, Leo at the back.">
          <rect x="90" y="60" width="120" height="60" rx="6" className="lab-table" />
          <rect x="140" y="40" width="20" height="70" className="lab-box" />
          <text x="118" y="100" className="fig-txt" textAnchor="middle">🧸</text><text x="182" y="100" className="fig-txt" textAnchor="middle">⚽</text>
          <text x="118" y="150" className="fig-txt" textAnchor="middle">Maya (4) 👧</text><text x="190" y="30" className="fig-txt" textAnchor="middle">Leo 👦</text>
        </svg>
        <p className="small">The tall box blocks the view. Maya sees the teddy bear; the ball is on Leo’s side.</p>
        <Choice id="lab-c1" concept="egocentrism" stage="preoperational" q="What can Leo actually see?" options={['The ball', 'The teddy bear', 'Both']} answer={0} why="The box blocks the bear from Leo; he sees the ball." nurse="—" />
        <Choice id="lab-c2" concept="egocentrism" stage="preoperational" q="Asked what Leo sees, 4-year-old Maya will most likely say:" options={['“The teddy bear” — what she sees', '“The ball” — she takes Leo’s view', '“I don’t know”']} answer={0} why="Cognitive egocentrism = difficulty understanding another person’s viewpoint (review #25). It does NOT mean selfish." nurse="Explain procedures from the child’s own point of view; don’t expect a preschooler to imagine how others feel." />
      </Exp>}
      {labIdx === 3 && <Exp title="D · Magical thinking (preoperational)">
        <div className="ps-bubble">🧒 4-year-old: <em>“I got sick because I was bad yesterday.”</em></div>
        <Choice id="lab-d1" concept="magical" stage="preoperational" q="What type of thinking is this?" options={['Magical thinking', 'Egocentrism', 'Animism', 'Conservation']} answer={0} why="Believing a behavior caused an unrelated event — illness as punishment (review #25; textbook Ch31)." nurse="—" />
        <Choice id="lab-d2" concept="magical" stage="preoperational" q="What should the nurse say?" options={['“You didn’t get sick because of anything you did.”', '“Be good so you get better.”', '“You’ll understand when you’re older.”']} answer={0} why="Review #25: reassure that illness is not caused by being “bad,” with simple, concrete words." nurse="Your instructor emphasizes preschool magical thinking — always correct the punishment belief." />
      </Exp>}
      {labIdx === 4 && <Exp title="E · Concrete vs. abstract thinking">
        <div className="ps-cols"><div className="ps-mini-card ps-concrete">🧱 <strong>9-year-old</strong> learns diabetes with a real glucose meter and a step chart.</div><div className="ps-mini-card ps-formal">💭 <strong>16-year-old</strong> discusses how daily control affects long-term health.</div></div>
        <Choice id="lab-e1" concept="abstract" stage="concrete" q="Why does the 9-year-old need the meter in hand?" options={['Concrete thinkers reason best about what they can see and touch', 'He lacks object permanence', 'He is egocentric']} answer={0} why="Review #26: early school-age children understand concrete explanations and sequence; abstract reasoning remains limited." nurse="Use visible, practical examples and return demonstration." />
        <Choice id="lab-e2" concept="hypothetical" stage="formal" q="Why can the 16-year-old handle a “what if” conversation?" options={['Formal operational thinking allows abstract and hypothetical reasoning', 'Teens are concrete thinkers', 'Teens are preoperational']} answer={0} why="ATI: adolescents show abstract, adult-level thinking — but check understanding with teach-back." nurse="Discuss options and future consequences; include the teen in decisions." />
      </Exp>}
    </section>
  );
}

/* ================================================================ 4. comparison center */
function Compare() {
  const [sel, setSel] = useState(0); const c = COMPARES[sel];
  return (
    <section className="ps-panel">
      <h3 className="ps-h">⚖️ Piaget comparison center</h3>
      <div className="ps-table" role="table" aria-label="Piaget stages compared">
        <div className="ps-tr ps-th" role="row"><span role="columnheader" />{STAGES.map(s => <span key={s.id} role="columnheader" className={'ps-' + s.id}>{s.icon} {s.name}</span>)}</div>
        {TABLE_ROWS.map(r => <div key={r.label} className="ps-tr" role="row"><span role="rowheader" className="ps-rl">{r.label}</span>{STAGES.map(s => <span key={s.id} role="cell" className={'ps-td ps-' + s.id}><span className="ps-tdl">{s.name}: </span>{r.v[s.id]}</span>)}</div>)}
      </div>
      <h4>Comparison lessons</h4>
      <div className="seg" role="tablist" aria-label="Comparison lessons">{COMPARES.map((x, i) => <button key={x.id} role="tab" aria-selected={sel === i} className={sel === i ? 'on' : ''} onClick={() => setSel(i)}>{x.title}</button>)}</div>
      <article className="ps-cmp"><div className="ps-cols"><div className="ps-mini-card">{c.a}</div><div className="ps-mini-card">{c.b}</div></div><p className="key-line">💡 {c.example}</p>
        <Quiz key={c.id} title="Quick practice" pool={[c.q]} /></article>
    </section>
  );
}

/* ================================================================ 5. clinical simulator */
function Simulator() {
  const { update } = useApp();
  const [k, setK] = useState(0); const [p, setP] = useState<number | null>(null); const [order, setOrder] = useState<number[]>(() => shuffle([0, 1, 2, 3]));
  const [challenge, setChallenge] = useState(false); const [score, setScore] = useState(0);
  const s = SCENARIOS[k % SCENARIOS.length];
  const next = () => { setK(k + 1); setP(null); setOrder(shuffle([0, 1, 2, 3])); setChallenge(false); };
  return (
    <section className="ps-panel">
      <div className="row between wrap"><h3 className="ps-h">🩺 Clinical decision simulator</h3><span className="mono">Scenario {(k % SCENARIOS.length) + 1}/12 · score {score}</span></div>
      <article className={'ps-scen ps-' + s.stage}>
        <p className="ps-agelbl">AGE: {s.age.toUpperCase()}</p>
        <p className="ps-prompt">{s.prompt}</p>
        <div className="ps-opts" role="radiogroup" aria-label="Nursing actions">{order.map(i => {
          const o = s.options[i]; const cls = p === null ? '' : i === s.answer ? ' key' : p === i ? ' wrong' : '';
          return <div key={i} className={'ps-opt' + cls}><button type="button" role="radio" aria-checked={p === i} disabled={p !== null} onClick={() => { setP(i); if (i === s.answer) setScore(score + 1); update(st => recordP(st, { id: s.id, stage: s.stage, concept: 'communication', fmt: 'sim' }, i === s.answer)); }}><span>{o[0]}</span></button>{p !== null && <p className="small ps-why">{i === s.answer ? '✓ ' : '✗ '}{o[1]}</p>}</div>;
        })}</div>
        {p !== null && <div role="status" className="game-fb">
          <p><SBadge id={s.stage} /> {s.why}</p>{s.priority && <p className="small"><strong>Priority:</strong> {s.priority}</p>}
          <SrcChip src={s.src.join(' · ')} />
          <div className="row gap wrap"><button className="btn" onClick={() => setChallenge(!challenge)}>{challenge ? 'Hide challenge' : '🔥 Challenge Me'}</button><button className="btn primary" onClick={next}>Next scenario</button></div>
          {challenge && <Quiz key={s.challenge.id} title="Challenge" pool={[s.challenge]} />}
        </div>}
      </article>
    </section>
  );
}

/* ================================================================ 6. practice bank */
function Bank({ preset }: { preset?: PQ[] }) {
  const { update } = useApp();
  const [mode, setMode] = useState<'all' | 'timed' | PStage | 'mixed' | null>(preset ? 'all' : null);
  const save = (right: number, total: number, label: string) => update(s => ({ ...s, rapid: { ...s.rapid, games: { ...s.rapid.games, ['pgh:' + Date.now()]: { n: total, correct: right, last: Date.now(), ...({ label } as object) } as { n: number; correct: number; last: number } } } }));
  if (preset) return <Quiz title="Study My Weaknesses" pool={preset} onDone={(r, t) => save(r, t, 'Weakness review')} />;
  if (!mode) return (
    <section className="ps-panel">
      <h3 className="ps-h">📝 40-question Piaget practice bank</h3>
      <p className="small">Original practice questions in HESI/NCLEX style — not official or previously administered items. 34 of 40 are application, case, priority, or “requires correction” questions.</p>
      <div className="quick-grid">
        <button className="qbtn" onClick={() => setMode('all')}><strong>All 40 · random order</strong><span className="small">Running score, review, retry</span></button>
        <button className="qbtn q-red" onClick={() => setMode('timed')}><strong>⏱ 10-question timed quiz</strong><span className="small">10 minutes</span></button>
        {STAGES.map(s => <button key={s.id} className={'qbtn ps-q-' + s.id} onClick={() => setMode(s.id)}><strong>{s.icon} {s.name}</strong><span className="small">{BANK.filter(b => b.stage === s.id).length} questions</span></button>)}
        <button className="qbtn" onClick={() => setMode('mixed')}><strong>Mixed application</strong><span className="small">6 questions</span></button>
      </div>
    </section>
  );
  const pool = mode === 'all' ? BANK : mode === 'timed' ? shuffle(BANK).slice(0, 10) : BANK.filter(b => b.stage === mode);
  return <div><button className="btn small" onClick={() => setMode(null)}>← Practice menu</button>
    <Quiz key={mode} title={mode === 'timed' ? '10-question timed quiz' : mode === 'all' ? 'Practice bank' : `${mode === 'mixed' ? 'Mixed' : STAGE_BY[mode as PStage].name} questions`} pool={pool} timed={mode === 'timed' ? 600 : undefined} onDone={(r, t) => save(r, t, mode === 'timed' ? 'Timed quiz' : 'Practice bank')} /></div>;
}

/* ================================================================ 7. match */
function Match() {
  const { update } = useApp();
  const [items, setItems] = useState(() => shuffle(MATCH));
  const [k, setK] = useState(0); const [p, setP] = useState<PStage | null>(null); const [score, setScore] = useState(0);
  if (k >= items.length) return <section className="ps-panel"><h3 className="ps-h">Match the child — {score}/{items.length}</h3><button className="btn primary" onClick={() => { setItems(shuffle(MATCH)); setK(0); setScore(0); setP(null); }}>Replay</button></section>;
  const it = items[k];
  return (
    <section className="ps-panel">
      <div className="row between"><h3 className="ps-h">🧩 Match the child to the stage</h3><span className="mono">{k + 1}/{items.length} · {score} correct</span></div>
      <p className="ps-prompt ps-behavior">{it.text}</p>
      <div className="ps-stagebtns" role="group" aria-label="Choose a stage">{STAGES.map(s => <button key={s.id} className={'ps-sbtn ps-' + s.id + (p && s.id === it.stage ? ' good' : p === s.id ? ' bad-b' : '')} disabled={!!p} onClick={() => { setP(s.id); const ok = s.id === it.stage; if (ok) setScore(score + 1); update(st => recordP(st, { id: it.id, stage: it.stage, concept: 'communication', fmt: 'match' }, ok)); }}><span className="ps-sbtn-ic">{s.icon}</span>{s.name}</button>)}</div>
      {p && <div role="status" className="game-fb"><p className={p === it.stage ? 'good-t' : 'bad-t'}><strong>{p === it.stage ? 'Match!' : `It’s ${STAGE_BY[it.stage].name}.`}</strong> {it.why}</p><button className="btn primary" onClick={() => { setK(k + 1); setP(null); }}>Next</button></div>}
    </section>
  );
}

/* ================================================================ 8. flashcards */
const RATE = { know: 2, almost: 1, practice: 0 } as const;
function Flashcards() {
  const { store, update } = useApp();
  const rating = (id: Concept) => store.rapid?.games?.['pgfr:' + id];
  const deck = useMemo(() => [...CARDS].sort((a, b) => (rating(a.id)?.correct ?? -1) - (rating(b.id)?.correct ?? -1) || (store.rapid?.cards?.['pgf:' + a.id]?.due ?? 0) - (store.rapid?.cards?.['pgf:' + b.id]?.due ?? 0)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0); const [flip, setFlip] = useState(false); const [front, setFront] = useState<'term' | 'example'>('term');
  const c = deck[i % deck.length]; const s = STAGE_BY[c.stage];
  const rate = (r: keyof typeof RATE) => { update(st => { const s2 = srsUpdate(st, 'pgf:' + c.id, r === 'know'); return { ...s2, rapid: { ...s2.rapid, games: { ...s2.rapid.games, ['pgfr:' + c.id]: { n: (s2.rapid.games['pgfr:' + c.id]?.n ?? 0) + 1, correct: RATE[r], last: Date.now() } } } }; }); setFlip(false); setI(i + 1); };
  return (
    <section className="ps-panel">
      <div className="row between wrap"><h3 className="ps-h">🃏 Adaptive flashcards</h3><div className="seg" role="radiogroup" aria-label="Card front"><button role="radio" aria-checked={front === 'term'} className={front === 'term' ? 'on' : ''} onClick={() => setFront('term')}>Term</button><button role="radio" aria-checked={front === 'example'} className={front === 'example' ? 'on' : ''} onClick={() => setFront('example')}>Clinical example</button></div></div>
      <p className="small muted">Card {(i % deck.length) + 1}/{deck.length}. “Need Practice” cards come first next time.</p>
      <button className={'ps-flash ps-' + c.stage + (flip ? ' flipped' : '')} onClick={() => setFlip(!flip)} aria-label={flip ? 'Card back — tap to show front' : 'Card front — tap to flip'}>
        {!flip ? <span className="ps-flash-front">{front === 'term' ? c.term : `“${c.everyday}”`}<span className="small muted">Tap to flip</span></span> : (
          <span className="ps-flash-back">
            <strong className="ps-flash-term">{c.term}</strong>
            <span>{c.def}</span>
            <span><SBadge id={c.stage} /> · {c.ages}</span>
            <span><strong>Everyday:</strong> {c.everyday}</span>
            <span><strong>Nursing:</strong> {c.nursing}</span>
            <span className="ps-mem">🧠 {c.memory}</span>
            <span className="small muted">Source: {c.src}</span>
          </span>
        )}
      </button>
      {flip && <div className="row gap wrap ps-rate"><button className="btn good" onClick={() => rate('know')}>Know It</button><button className="btn" onClick={() => rate('almost')}>Almost</button><button className="btn bad-b" onClick={() => rate('practice')}>Need Practice</button></div>}
      <p className="small">{s.memory}</p>
    </section>
  );
}

/* ================================================================ 9. crash course */
function Crash({ onClose }: { onClose: () => void }) {
  return (
    <section className="ps-panel ps-crash">
      <div className="row between"><h3 className="ps-h">⚡ Two-minute Piaget crash course</h3><button className="btn small" onClick={onClose}>Close</button></div>
      <p className="ps-seq">{STAGES.map((s, i) => <React.Fragment key={s.id}><span className={'ps-seqw ps-' + s.id}>{['SENSE', 'PRETEND', 'CONCRETE', 'ABSTRACT'][i]}</span>{i < 3 && ' → '}</React.Fragment>)}</p>
      <ul className="ps-crash-list">
        <li className="ps-sensorimotor"><strong>Birth–2:</strong> senses and movement</li>
        <li className="ps-preoperational"><strong>2–7:</strong> imagination and symbolic thinking</li>
        <li className="ps-concrete"><strong>7–11:</strong> logic with real objects and examples</li>
        <li className="ps-formal"><strong>~11–12+:</strong> abstract and hypothetical reasoning</li>
      </ul>
      <p className="small muted">Your course sources group these by age group: 0–2 · preschool 3–6 · school-age 6–12 · adolescent 12–20. Edges overlap.</p>
      <div className="ps-assoc">
        <span>Object permanence → <b>Sensorimotor</b></span><span>Magical thinking → <b>Preoperational</b></span><span>Egocentrism → <b>Preoperational</b></span><span>Conservation → <b>Concrete</b></span><span>Abstract reasoning → <b>Formal</b></span>
      </div>
      <p className="key-line">💡 A child knowing the answer is different from understanding the reasoning behind it.</p>
      <Quiz title="5 rapid-fire questions" pool={CRASH_RAPID} />
    </section>
  );
}

/* ================================================================ 10. mastery */
function Mastery({ onWeak, go }: { onWeak: (qs: PQ[]) => void; go: (t: Tab) => void }) {
  const { store } = useApp();
  const g = store.rapid?.games ?? {};
  const cs = conceptStats(store);
  const all = g['pg:all'];
  const concepts = Object.keys(CONCEPT_LABEL) as Concept[];
  const weak = concepts.filter(c => ['Needs Review', 'Developing'].includes(levelOf(cs[c]))).sort((a, b) => (cs[a]?.correct ?? 0) / (cs[a]?.n || 1) - (cs[b]?.correct ?? 0) / (cs[b]?.n || 1));
  const hist = Object.entries(g).filter(([k]) => k.startsWith('pgh:')).sort((a, b) => b[1].last - a[1].last).slice(0, 6);
  const needCards = CARDS.filter(c => (g['pgfr:' + c.id]?.correct ?? 2) < 2 && g['pgfr:' + c.id]);
  const missed = BANK.filter(b => { const c = store.rapid?.cards?.['pg:' + b.id]; return c && c.wrong > 0 && c.step < 2; });
  const weakQs = () => { const pool = [...missed, ...BANK.filter(b => weak.includes(b.concept))]; return [...new Map(pool.map(x => [x.id, x])).values()].slice(0, 12); };
  const rec: [Tab, string] = !all ? ['timeline', 'Start with the timeline'] : weak[0] ? (['objectPermanence', 'conservation'].includes(weak[0]) ? ['lab', 'Experiment Lab'] : ['cards', 'Flashcards']) : ['bank', 'Timed quiz'];
  const pct = all?.n ? Math.round((all.correct / all.n) * 100) : null;
  return (
    <section className="ps-panel">
      <h3 className="ps-h">📊 Piaget mastery</h3>
      <div className="es-kpis"><div><span className="stat-n">{pct === null ? '—' : pct + '%'}</span><span className="small">overall ({all?.n ?? 0} answers)</span></div><div><span className="stat-n">{missed.length}</span><span className="small">questions to revisit</span></div><div><span className="stat-n">{needCards.length}</span><span className="small">flashcards needing practice</span></div></div>
      <h4>By stage</h4>
      <div className="vgm">{STAGES.map(s => { const x = g['pgs:' + s.id]; return <div key={s.id} className={'vgm-row ps-row ps-' + s.id}><span>{s.icon} {s.name}</span><span className="mono">{x?.n ? Math.round((x.correct / x.n) * 100) + '%' : '—'}</span><span className="mono muted">{x?.n ?? 0}</span></div>; })}</div>
      <h4>Concepts <span className="small muted">(Mastered = 3+ correct, ≥80%, in 2+ question formats)</span></h4>
      <ul className="ps-lvls">{concepts.map(c => { const l = levelOf(cs[c]); return <li key={c} className={'lv-' + l.replace(' ', '').toLowerCase()}><span>{CONCEPT_LABEL[c]}</span><span className="chip">{l}</span></li>; })}</ul>
      {hist.length > 0 && <><h4>Quiz history</h4><ul className="small">{hist.map(([k, v]) => <li key={k}>{new Date(v.last).toLocaleString()} — {(v as unknown as { label?: string }).label ?? 'Quiz'}: {v.correct}/{v.n}</li>)}</ul></>}
      <div className="row gap wrap"><button className="btn primary" disabled={!weakQs().length} onClick={() => onWeak(weakQs())}>🎯 Study My Weaknesses</button><button className="btn" onClick={() => go(rec[0])}>Recommended next: {rec[1]}</button></div>
      {!weakQs().length && <p className="small muted">Answer some questions first — the weakness review is built from your actual misses.</p>}
    </section>
  );
}

/* ================================================================ center */
type Tab = 'timeline' | 'cards' | 'lab' | 'compare' | 'sim' | 'bank' | 'match' | 'flash' | 'mastery' | 'weak' | 'test';
const TABS: [Tab, string][] = [['timeline', '🕰 Timeline'], ['cards', '🗂 Stage cards'], ['lab', '🔬 Experiment lab'], ['compare', '⚖️ Compare'], ['sim', '🩺 Clinical sim'], ['bank', '📝 40-Q bank'], ['match', '🧩 Match'], ['flash', '🃏 Flashcards'], ['mastery', '📊 Mastery']];
export function PiagetCenter() {
  const [tab, setTab] = useState<Tab>('timeline');
  const [crash, setCrash] = useState(false);
  const [weak, setWeak] = useState<PQ[] | null>(null);
  const [test, setTest] = useState<PStage | null>(null);
  return (
    <section className="piaget-center">
      <header className="ps-hero">
        <p className="ps-eyebrow">🧠 Growth & Development · Cognitive (Piaget)</p>
        <h2>Piaget’s Cognitive Development — Birth Through 17</h2>
        <p className="ps-lede">How children THINK at each age — and how that changes what the nurse says and does. Separate from Erikson’s psychosocial stages.</p>
        <div className="ps-herostages">{STAGES.map(s => <div key={s.id} className={'ps-hs ps-' + s.id}><ChildFig stage={s.id} size={56} /><strong>{s.name}</strong><span className="small">{s.ages}</span><span className="small ps-hsm">{s.memory.split('= ')[1]}</span></div>)}</div>
        <button className="btn ps-crashbtn" onClick={() => setCrash(true)}>⚡ Two-Minute Crash Course</button>
      </header>
      {crash && <Crash onClose={() => setCrash(false)} />}
      <nav className="es-nav ps-nav" role="tablist" aria-label="Piaget sections">{TABS.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => { setTab(id); setTest(null); }}>{l}</button>)}</nav>
      {tab === 'timeline' && !test && <Timeline onTest={st => setTest(st)} />}
      {tab === 'timeline' && test && <div><button className="btn small" onClick={() => setTest(null)}>← Back to timeline</button><Quiz key={test} title={`Test My Understanding — ${STAGE_BY[test].name}`} pool={shuffle(BANK.filter(b => b.stage === test)).slice(0, 4)} /></div>}
      {tab === 'cards' && <StageCards />}
      {tab === 'lab' && <Lab />}
      {tab === 'compare' && <Compare />}
      {tab === 'sim' && <Simulator />}
      {tab === 'bank' && <Bank />}
      {tab === 'match' && <Match />}
      {tab === 'flash' && <Flashcards />}
      {tab === 'mastery' && <Mastery onWeak={qs => { setWeak(qs); setTab('weak'); }} go={setTab} />}
      {tab === 'weak' && weak && <div><button className="btn small" onClick={() => setTab('mastery')}>← Mastery</button><Bank preset={weak} /></div>}
      <p className="small muted ps-foot">Sources: {PS.PPTB}; {PS.R25}; {PS.R26}; {PS.ATIM}; {PS.ATI6}; {PS.T31}. Items marked “your request” use standard Piaget terms or ages that are not in your uploaded files (centration, reversibility, seriation, hypothetical reasoning, the 2–7 / 7–11 / 11–12 age cut-offs).</p>
    </section>
  );
}
