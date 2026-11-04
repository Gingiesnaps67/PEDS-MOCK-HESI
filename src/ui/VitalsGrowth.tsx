import React, { useMemo, useState } from 'react';
import { useApp } from './state';
import type { Store } from '../types';
import { srsUpdate, SrcChip } from './Rapid';
import { GROUPS, AGE_OPTIONS, groupOf, BP_AVG, BP_ATI, TEMP_AVG, TEMP_REFS, TEMP_ROUTES, SPO2, WEIGHT_RULES, HEIGHT_RULES, HEAD_RULES, WEIGHT_ROWS, ruleEstimate, lbToKg, kgToLb, GAPS, BMI, CHART_LESSON, MEASURE, cToF, MS } from '../data/vitalsGrowth';
import type { Rule, GroupId } from '../data/vitalsGrowth';
import { VITAL_TECHNIQUE, VITAL_RED_FLAGS, S } from '../data/rapid';

type Dom = 'hr' | 'rr' | 'bp' | 'temp' | 'spo2' | 'infant' | 'toddler' | 'preschool' | 'school' | 'adolescent' | 'percentile' | 'bmi' | 'calc' | 'priority';
export const VG_DOMAINS: [Dom, string][] = [['hr', 'Heart rate'], ['rr', 'Respiratory rate'], ['bp', 'Blood pressure'], ['temp', 'Temperature'], ['spo2', 'Oxygen saturation'], ['infant', 'Infant growth'], ['toddler', 'Toddler growth'], ['preschool', 'Preschool growth'], ['school', 'School-age growth'], ['adolescent', 'Adolescent growth'], ['percentile', 'Growth-percentile interpretation'], ['bmi', 'BMI-for-age'], ['calc', 'Weight-based calculations'], ['priority', 'Clinical prioritization']];

/** records a game answer: spaced repetition card + first-attempt vs retest statistics per domain */
export function recordVG(s: Store, qid: string, dom: Dom, ok: boolean): Store {
  const first = !s.rapid?.cards?.['vg:' + qid];
  const rapid = s.rapid ?? { games: {}, cards: {} };
  const k = (first ? 'vgf:' : 'vgr:') + dom;
  const g = rapid.games[k] ?? { n: 0, correct: 0, last: 0 };
  const s2 = { ...s, rapid: { ...rapid, games: { ...rapid.games, [k]: { n: g.n + 1, correct: g.correct + (ok ? 1 : 0), last: Date.now() } } } };
  return srsUpdate(s2, 'vg:' + qid, ok);
}

const RuleList = ({ rules }: { rules: Rule[] }) => (
  <dl className="rule-dl">{rules.map(r => <React.Fragment key={r.age + r.text}><dt>{r.age}</dt><dd>{r.text} <SrcChip src={r.src} flag={r.flag} /></dd></React.Fragment>)}</dl>
);

const TABS = [['glance', 'Quick-Glance chart'], ['age', 'Age view'], ['weight', '⚖️ Weight & growth'], ['charts', '📈 Growth charts & BMI'], ['bp', 'Blood pressure'], ['temp', 'Temp & SpO₂'], ['games', 'Games'], ['mastery', 'Mastery']] as const;
type Tab = typeof TABS[number][0];

export function VitalsGrowthPage() {
  const [tab, setTab] = useState<Tab>('glance');
  return (
    <main className="page vg-page">
      <header className="page-head">
        <p className="eyebrow vg-eyebrow">❤️ Rapid Review</p>
        <h1>Peds Vital Signs & Growth — Birth to 17</h1>
        <p className="muted">From your uploaded sources and your master sheet only. Group ranges are never turned into invented single-age values.</p>
      </header>
      <div className="seg big vg-tabs" role="tablist" aria-label="Vital signs and growth sections">
        {TABS.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{l}</button>)}
      </div>
      {tab === 'glance' && <Glance />}
      {tab === 'age' && <AgeView />}
      {tab === 'weight' && <Weight />}
      {tab === 'charts' && <Charts />}
      {tab === 'bp' && <BP />}
      {tab === 'temp' && <Temp />}
      {tab === 'games' && <VGGames />}
      {tab === 'mastery' && <VGMastery />}
    </main>
  );
}

function Glance() {
  return (
    <section className="panel c-vitals">
      <h2>Quick-glance master chart</h2>
      <p className="small">Heart and respiratory rates: <SrcChip src={S.ATIV} /> — resting reference ranges, NOT emergency thresholds (your sources give no numeric emergency cut-offs). <strong>Rule: the younger the child, the faster the heart and breathing.</strong></p>
      <div className="glance">{GROUPS.map(g => (
        <article key={g.id} className={'gl-card ' + g.color}>
          <h3>{g.name}<span className="gl-age">{g.ages}</span></h3>
          <div className="gl-nums"><div><span className="gl-n">{g.hr}</span><span className="gl-u">HR /min</span></div><div><span className="gl-n">{g.rr}</span><span className="gl-u">RR /min</span></div></div>
          <p className="small gl-bp">BP: {g.bpNote}</p>
        </article>
      ))}</div>
      <div className="gl-strip">
        <p><strong>SpO₂</strong> ≥95% <SrcChip src={S.ATIV} /></p>
        <p><strong>Temp</strong> 36.1–37.2 °C (97–99 °F) general · newborn 36.5–37.5 °C <SrcChip src={S.ATIV + ' · ' + S.ATI27} flag="Route-dependent" /></p>
        <p><strong>BP</strong> routine from age 3 <SrcChip src={S.PPTB} /></p>
      </div>
      <details className="why-age"><summary>Why do heart and breathing rates fall with age?</summary>
        <p className="small">Small bodies have a higher metabolic rate per kilogram (textbook Ch31: about 108 kcal/kg/day at 0–6 months vs 71 at 7–10 years), so they need more oxygen and blood flow per kilogram. Analogy: a hummingbird’s heart races; an elephant’s is slow. Infants are also abdominal breathers with small airways.</p>
        <p className="small">Fever, pain, crying, and activity raise HR and RR temporarily — always recheck when calm (ATI notes) before deciding a value is abnormal.</p>
      </details>
      <h3 className="h-critical">Red flags your sources state</h3>
      <ul className="s-list">{VITAL_RED_FLAGS.map(r => <li key={r.text}>{r.text} <SrcChip src={r.src} /></li>)}</ul>
      <h3>Technique by area</h3>
      {VITAL_TECHNIQUE.filter(a => a.area !== 'Blood pressure' && a.area !== 'Temperature').map(a => <div key={a.area}><h4>{a.area}</h4><ul className="s-list">{a.items.map(i => <li key={i.text}>{i.text} <SrcChip src={i.src} flag={i.flag} /></li>)}</ul></div>)}
    </section>
  );
}

function AgeView() {
  const [k, setK] = useState(0);
  const a = AGE_OPTIONS[k];
  const g = groupOf(a.months);
  const bp = BP_AVG.find(b => b.months === a.months || (a.months > 0 && a.months < 12 && b.months === 6));
  const tmp = TEMP_AVG.find(t => t.age === a.label || (a.months === 12 && t.age === '1 year'));
  const wr = WEIGHT_ROWS.find(w => w.key === a.key);
  const grRule: Record<GroupId, number[]> = { newborn: [0], infant: [0, 1, 2], toddler: [3, 4], preschool: [5], school: [6], adolescent: [7] };
  const hRules = a.months < 6 ? [HEIGHT_RULES[0]] : a.months < 12 ? [HEIGHT_RULES[1]] : a.months < 24 ? [HEIGHT_RULES[2], HEIGHT_RULES[3]] : a.months < 36 ? [HEIGHT_RULES[4]] : a.months < 72 ? [HEIGHT_RULES[5]] : a.months < 156 ? [HEIGHT_RULES[6]] : [HEIGHT_RULES[7]];
  return (
    <section className="panel">
      <h2>Detailed age view</h2>
      <div className="age-pick">
        <button className="btn" disabled={k === 0} onClick={() => setK(k - 1)} aria-label="Previous age">←</button>
        <label className="sr-only" htmlFor="age-sel">Choose an age</label>
        <select id="age-sel" value={k} onChange={e => setK(Number(e.target.value))}>{AGE_OPTIONS.map((o, i) => <option key={o.key} value={i}>{o.label}</option>)}</select>
        <button className="btn" disabled={k === AGE_OPTIONS.length - 1} onClick={() => setK(k + 1)} aria-label="Next age">→</button>
      </div>
      <article className={'age-card ' + g.color}>
        <h3>{a.label} <span className="chip">{g.name} · {g.ages}</span></h3>
        <div className="gl-nums big"><div><span className="gl-n">{g.hr}</span><span className="gl-u">HR /min</span></div><div><span className="gl-n">{g.rr}</span><span className="gl-u">RR /min</span></div></div>
        <p className="small muted">These are the {g.name.toLowerCase()} GROUP ranges (ATI notes). Your sources give no exact value for {a.label}.</p>
        <dl className="rule-dl">
          <dt>Blood pressure</dt><dd>{a.months < 36 ? 'Not routinely measured before age 3 unless cardiac/critical concerns. ' : 'Routine. '}{bp ? `Textbook average for ${bp.age}: ${bp.bp} (average, not a limit).` : `No textbook average listed for exactly ${a.label}; see the group row: ${g.bpNote}.`} <SrcChip src={S.T31} /></dd>
          <dt>Temperature</dt><dd>{tmp ? `Textbook average ${tmp.c} °C (${cToF(tmp.c)} °F).` : 'No age-specific average listed in your sources; general 36.1–37.2 °C (route-dependent).'} <SrcChip src={tmp ? tmp.src : S.ATIV} /></dd>
          <dt>Weight</dt><dd>{wr ? wr.rule : '—'} <SrcChip src={wr?.src ?? S.ATIM} /></dd>
          {grRule[g.id].map(i => <React.Fragment key={i}><dt>Growth rule</dt><dd>{WEIGHT_RULES[i].text} <SrcChip src={WEIGHT_RULES[i].src} flag={WEIGHT_RULES[i].flag} /></dd></React.Fragment>)}
          {hRules.map(h => <React.Fragment key={h.text}><dt>Length / height</dt><dd>{h.text} <SrcChip src={h.src} /></dd></React.Fragment>)}
          {a.months <= 36 && <><dt>Head</dt><dd>{a.months <= 6 ? HEAD_RULES[0].text + ' ' : ''}{HEAD_RULES[2].text} <SrcChip src={S.ATIM + ' · ' + S.PPTB} /></dd></>}
          <dt>Pulse technique</dt><dd>{a.months < 60 ? 'Apical pulse, full minute (preferred under 5).' : 'Radial pulse acceptable (often ≥5 y); full minute if irregular.'} <SrcChip src={a.months < 60 ? S.PPTB : S.T31} /></dd>
          <dt>Respirations</dt><dd>{a.months < 84 ? 'Watch the abdomen (diaphragmatic breathers under ~7 y); full minute; ' : 'Thoracic breathing; '}{a.months < 12 ? 'irregular rhythm is normal.' : 'rhythm regular.'} <SrcChip src={S.T31} /></dd>
          <dt>Temperature route</dt><dd>{a.months < 1 ? 'Axillary/non-contact; NO rectal under 1 month.' : a.months <= 6 ? 'Axillary/non-contact; no tympanic at 6 months or younger.' : a.months < 48 ? 'Axillary or tympanic (pinna down & back under 3 y).' : 'Oral if cooperative (ATI >4 y; textbook ~5–6 y).'} <SrcChip src={S.ATI27} /></dd>
        </dl>
      </article>
    </section>
  );
}

function Weight() {
  const [unit, setUnit] = useState<'lb' | 'kg'>('lb');
  const [val, setVal] = useState('7');
  const birthLb = unit === 'lb' ? Number(val) : kgToLb(Number(val));
  const ok = birthLb > 2 && birthLb < 15;
  return (
    <section className="panel c-growth">
      <h2>⚖️ Pediatric weight & growth — birth to 17</h2>
      <div className="gap-box" role="note">
        <h3>What your sources do NOT contain</h3>
        <ul className="small">{GAPS.map(g => <li key={g}>{g}</li>)}</ul>
        <p className="small">So this chart shows the <strong>growth rules</strong> your sources teach, not median weights. Male/female columns are marked "not in sources" rather than invented. Ask me if you want official WHO/CDC charts added as a separately labeled outside reference.</p>
      </div>
      <div className="bw-input">
        <label htmlFor="bw">Try a birth weight:</label>
        <input id="bw" inputMode="decimal" value={val} onChange={e => setVal(e.target.value)} />
        <div className="seg" role="radiogroup" aria-label="Unit">{(['lb', 'kg'] as const).map(u => <button key={u} role="radio" aria-checked={unit === u} className={unit === u ? 'on' : ''} onClick={() => setUnit(u)}>{u}</button>)}</div>
        <span className="small muted">{ok ? `= ${unit === 'lb' ? lbToKg(birthLb) + ' kg' : Math.round(birthLb * 10) / 10 + ' lb'}` : 'Enter a birth weight between 2 and 15 lb.'}</span>
      </div>
      <p className="small trap-note">Rule-based estimates are a hypothetical exam-calculation aid from your milestone notes — not growth-chart values and not an ideal weight.</p>
      <div className="wt">
        <div className="wt-row wt-h"><span>Age</span><span>Source growth rule</span><span>Rule-based estimate</span><span>Boys / girls percentiles</span></div>
        {WEIGHT_ROWS.map(w => {
          const e = ok ? ruleEstimate(birthLb, w.months) : null;
          const txt = e ? (Math.abs(e.high - e.low) < 0.05 ? `≈ ${e.low.toFixed(1)} lb (${lbToKg(e.low)} kg)` : `≈ ${e.low.toFixed(1)}–${e.high.toFixed(1)} lb (${lbToKg(e.low)}–${lbToKg(e.high)} kg)`) : w.months > 36 ? 'Depends on the child’s own curve, height, and puberty' : '—';
          return <div key={w.key} className={'wt-row ' + groupOf(w.months).color}><span className="wt-age">{w.label}</span><span>{w.rule} <SrcChip src={w.src} /></span><span className="mono">{txt}</span><span className="muted small">Not in your sources</span></div>;
        })}
      </div>
      <h3>Growth rules</h3>
      <h4>Weight</h4><RuleList rules={WEIGHT_RULES} />
      <h4>Length / height</h4><RuleList rules={HEIGHT_RULES} />
      <h4>Head circumference</h4><RuleList rules={HEAD_RULES} />
      <details><summary>Why does infant weight rise so fast, then slow?</summary><p className="small">Infants have the highest energy needs per kilogram (textbook Ch31: ~108 kcal/kg/day at 0–6 months, 100 at 1–3 y, 90 at 4–6 y, 71 at 7–10 y). Analogy: infancy is the "construction boom"; toddler and school-age years are "renovation" — steady, smaller additions. Toddlers also show physiologic anorexia (review #31), so trends matter more than one meal or one weight.</p></details>
      <h3 className="c-safety-h">Measuring accurately</h3><RuleList rules={MEASURE} />
      <p className="small key-line">Exam trap: tripling means birth weight × 3 — not the 6-month weight × 3. And medication doses use the MEASURED weight in kg, not an estimate.</p>
    </section>
  );
}

/** schematic percentile chart — shapes only, no real values */
function GrowthSchematic({ mode }: { mode: 'follow' | 'drop' | 'jump' }) {
  const W = 320, H = 180, curves = [{ p: '95th', o: 40 }, { p: '50th', o: 80 }, { p: '5th', o: 120 }];
  const pathFor = (o: number) => Array.from({ length: 11 }, (_, i) => `${i ? 'L' : 'M'}${30 + i * 27},${o + 30 - Math.sqrt(i) * 14}`).join(' ');
  const child = Array.from({ length: 8 }, (_, i) => {
    const base = 80 + 30 - Math.sqrt(i) * 14 - 18;
    const y = mode === 'follow' ? base : mode === 'drop' ? base + (i > 3 ? (i - 3) * 13 : 0) : base - (i > 4 ? (i - 4) * 12 : 0);
    return { x: 30 + i * 27, y };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="gschem" role="img" aria-label={`Schematic growth chart showing a child who ${mode === 'follow' ? 'follows one percentile curve' : mode === 'drop' ? 'drops across percentile lines' : 'rises across percentile lines'}`}>
      {curves.map(c => <g key={c.p}><path d={pathFor(c.o)} className={'gc-line ' + (c.p === '50th' ? 'gc-mid' : '')} /><text x={W - 30} y={c.o + 30 - Math.sqrt(10) * 14 + 4} className="gc-lbl">{c.p}</text></g>)}
      <polyline points={child.map(p => `${p.x},${p.y}`).join(' ')} className="gc-child" />
      {child.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.5} className="gc-dot" />)}
      <text x={30} y={H - 6} className="gc-ax">age →</text><text x={4} y={14} className="gc-ax">weight</text>
    </svg>
  );
}
function Charts() {
  const [mode, setMode] = useState<'follow' | 'drop' | 'jump'>('follow');
  const msg = { follow: 'Follows the same channel (here, between the 5th and 50th): expected pattern, even though below the median.', drop: 'Crosses DOWN through percentile lines: failure to follow expected growth → report and assess nutrition, illness, possible neglect (textbook Ch31; lecture 9/30).', jump: 'Climbs UP across lines: rapid gain → assess intake and activity; for head circumference this pattern suggests hydrocephalus (textbook Ch32).' };
  return (
    <section className="panel c-growth">
      <h2>📈 Understanding pediatric growth charts</h2>
      <div className="seg" role="radiogroup" aria-label="Growth pattern">{([['follow', 'Follows a curve'], ['drop', 'Crosses down'], ['jump', 'Crosses up']] as const).map(([m, l]) => <button key={m} role="radio" aria-checked={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{l}</button>)}</div>
      <GrowthSchematic mode={mode} />
      <p className="small muted">Schematic illustration only — the curves show shapes, not real growth-chart values (those are not in your sources).</p>
      <p className={mode === 'follow' ? 'good-t' : 'bad-t'}>{msg[mode]}</p>
      <RuleList rules={CHART_LESSON} />
      <h3>BMI-for-age</h3>
      <RuleList rules={BMI} />
    </section>
  );
}
function BP() {
  return (
    <section className="panel c-vitals">
      <h2>Blood pressure</h2>
      <h3>Textbook averages (Ch31 Table 31.3) — NOT normal limits</h3>
      <table className="vt"><thead><tr><th scope="col">Age</th><th scope="col">Average BP (mm Hg)</th></tr></thead><tbody>{BP_AVG.map(b => <tr key={b.age}><th scope="row">{b.age}</th><td className="big-n">{b.bp}</td></tr>)}</tbody></table>
      <SrcChip src={S.T31} />
      <h3>ATI vital-sign notes — percentile columns</h3>
      <table className="vt"><thead><tr><th scope="col">Age</th><th scope="col">50th percentile</th><th scope="col">95th percentile</th></tr></thead><tbody>{BP_ATI.map(b => <tr key={b.age}><th scope="row">{b.age}</th><td>{b.p50}</td><td>{b.p95}</td></tr>)}</tbody></table>
      <SrcChip src={S.ATIV} flag='Header says "BP Average (95th percentile)" — a 95th percentile is not an average (D9).' />
      <p className="small">Sources differ (e.g., newborn 70/50 average vs 64/41 50th percentile): different measures, both shown. BP is interpreted by age, sex, and height percentiles — the ATI table splits by sex; height tables are not in your sources.</p>
      <h3>Technique</h3>
      <ul className="s-list">{VITAL_TECHNIQUE.find(a => a.area === 'Blood pressure')!.items.map(i => <li key={i.text}>{i.text} <SrcChip src={i.src} flag={i.flag} /></li>)}
        <li>Bladder encircles about 80% of an adult arm and the WHOLE arm of a child; your master sheet lists bladder length 80–100% of arm circumference. <SrcChip src={S.ATI27 + ' · ' + MS} /></li>
        <li>Crying, pain, anxiety, and movement alter readings; deflate fully and wait 1 minute before repeating. <SrcChip src={S.ATI27} /></li></ul>
      <p className="key-line">Exam trap: an AVERAGE is not the upper limit. The "hypertension after three readings above the 90th percentile" statement is flagged (D8) and never used in a scored question. Adolescent BP categories are not in your sources.</p>
    </section>
  );
}
function Temp() {
  return (
    <section className="panel">
      <h2>Temperature</h2>
      <ul className="s-list">{TEMP_REFS.map(t => <li key={t.ref}><strong>{t.ref}:</strong> {t.value} <SrcChip src={t.src} flag={t.flag} /></li>)}</ul>
      <h3>Textbook averages by age (Ch31)</h3>
      <table className="vt"><thead><tr><th scope="col">Age</th><th scope="col">°C</th><th scope="col">°F</th></tr></thead><tbody>{TEMP_AVG.map(t => <tr key={t.age}><th scope="row">{t.age}</th><td>{t.c.toFixed(1)}</td><td>{cToF(t.c)}</td></tr>)}</tbody></table>
      <p className="small muted">Averages, not limits. Values for 7, 9, and 11 years come from your master sheet’s transcription of the textbook table.</p>
      <h3>Routes</h3>
      <ul className="s-list">{TEMP_ROUTES.map(r => <li key={r.route}><strong>{r.route}:</strong> {r.text} <SrcChip src={r.src} flag={r.flag} /></li>)}</ul>
      <p className="small">Young infants: newborns can’t dissipate heat well (textbook Ch31), and fever without a source may be the only sign of a UTI in an infant (course PowerPoint) — so an infant with fever needs prompt assessment. <SrcChip src={S.T31 + ' · ' + S.PPTP} /></p>
      <h2>Oxygen saturation</h2>
      <ul className="s-list">{SPO2.map(t => <li key={t.text}>{t.text} <SrcChip src={t.src} flag={t.flag} /></li>)}</ul>
      <p className="key-line">Exam trap: a normal SpO₂ does not rule out respiratory distress — look at work of breathing.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ GAMES */
interface GQ { id: string; dom: Dom; prompt: string; options: string[]; answer: number; why: string; src: string }
const q = (id: string, dom: Dom, prompt: string, options: string[], answer: number, why: string, src: string): GQ => ({ id, dom, prompt, options, answer, why, src });
const NC = ['Normal — document', 'Concerning — follow up'];
const STATIC: Record<string, GQ[]> = {
  normal: [
    q('n1', 'hr', 'Calm 2-month-old, HR 148/min', NC, 0, 'Infant 90–160 (ATI).', S.ATIV),
    q('n2', 'rr', 'Calm 10-year-old, RR 34/min', NC, 1, 'School-age 20–25 (ATI) — 34 is above range.', S.ATIV),
    q('n3', 'spo2', 'Well 6-year-old, SpO₂ 91%', NC, 1, 'Expected ≥95% (ATI).', S.ATIV),
    q('n4', 'percentile', 'Child steady on the 15th percentile for 3 years', NC, 0, 'Following a curve is the expected pattern (lecture 9/30; Ch31).', S.T31),
    q('n5', 'infant', '6-month-old, birth weight 8 lb, now 11 lb', NC, 1, 'Expected ≈16 lb (×2) — far below.', S.PPTB),
    q('n6', 'temp', 'Newborn axillary 36.8 °C', NC, 0, 'Newborn 36.5–37.5 °C (ATI Ch27).', S.ATI27),
    q('n7', 'rr', 'Sleeping 2-week-old with irregular breathing, one 8-second pause, pink', NC, 0, 'Irregular rhythm normal; apnea <15 s in REM can be normal.', S.ATI27),
    q('n8', 'toddler', '20-month-old eats less than last year, weight still on his curve', NC, 0, 'Physiologic anorexia (review #31).', S.REV),
    q('n9', 'hr', 'Calm 16-year-old athlete, HR 56/min', NC, 0, 'Adolescent 50–100 (ATI).', S.ATIV),
  ],
  error: [
    q('e1', 'bp', 'Nurse uses a cuff labeled "child" that covers half the upper arm. Error?', ['Cuff too small → falsely high', 'No error', 'Cuff too large → falsely low', 'Should use the leg always'], 0, 'Cover ~2/3 of upper arm; too small = falsely high (Ch31; ATI Ch27).', S.T31),
    q('e2', 'rr', 'Nurse counts an infant’s chest movements for 15 seconds × 4. Error?', ['Count a full minute and watch the abdomen', 'No error', 'Count 30 seconds only', 'Count while the infant cries'], 0, 'Full minute; abdominal breathers (lecture 9/30).', S.L930),
    q('e3', 'infant', 'Infant weighed in a wet diaper and sleeper on a different scale than yesterday. Error?', ['Weigh naked/clean diaper on the same, zeroed scale', 'No error', 'Only the scale matters', 'Weigh only weekly'], 0, 'Textbook Ch31; lecture 9/30.', S.T31),
    q('e4', 'temp', 'Rectal temperature taken on a 2-week-old. Error?', ['No rectal temps under 1 month', 'No error', 'Should be tympanic', 'Should be oral'], 0, 'ATI Ch27.', S.ATI27),
    q('e5', 'hr', 'Vital signs on an infant taken in order: temperature, pulse, respirations. Error?', ['Respirations first, temperature last', 'No error', 'Pulse should be last', 'BP should be first'], 0, 'Textbook Ch31 infant order.', S.T31),
    q('e6', 'calc', 'Nurse records weight 44 lb and doses 10 mg/kg as 440 mg. Error?', ['Forgot lb → kg: 20 kg × 10 = 200 mg', 'No error', 'Should multiply by 2.2', 'Dose by age instead'], 0, 'kg = lb ÷ 2.2 (review #34).', S.REV),
  ],
  first: [
    q('f1', 'priority', '4-month-old: RR 70, retractions, grunting, SpO₂ 95%. First?', ['Report respiratory distress now', 'Offer a bottle', 'Recheck in 4 h', 'Document normal SpO₂'], 0, 'Work of breathing outranks one normal number (lecture 10/07).', S.L107),
    q('f2', 'priority', 'Toddler HR 170 while screaming during an IV start. First?', ['Comfort, then recheck when calm', 'Call a rapid response', 'Give oxygen', 'Document tachycardia'], 0, 'Crying raises pulse; assess calm (ATI notes).', S.ATIV),
    q('f3', 'priority', '7-y-old automated BP 150/98 after a correct cuff and calm rest. First?', ['Confirm by auscultation', 'Document hypertension', 'Give an antihypertensive', 'Ignore it'], 0, 'Confirm extreme automated readings (ATI notes).', S.ATIV),
    q('f4', 'percentile', 'Head circumference crossed 2 lines in 3 weeks; fontanel bulging. First?', ['Report possible increased ICP/hydrocephalus', 'Recheck next visit', 'Reassure the parent', 'Plot weight instead'], 0, 'Textbook Ch32.', S.T32),
    q('f5', 'priority', 'Infant SpO₂ reads 82% but the infant is pink, active, and the probe is loose and moving. First?', ['Reposition the sensor and recheck while assessing the infant', 'Start CPR', 'Document 82%', 'Remove oximetry'], 0, 'Motion/placement affect readings; assess the child (ATI).', S.ATI27),
  ],
};
function rand(seed: number) { let s = seed % 2147483647; return () => (s = (s * 48271) % 2147483647) / 2147483647; }
function shuffleOpts(g: GQ, r: () => number): GQ {
  const idx = g.options.map((_, i) => i).sort(() => r() - 0.5);
  return { ...g, options: idx.map(i => g.options[i]), answer: idx.indexOf(g.answer) };
}
function genAge(r: () => number): GQ[] {
  return GROUPS.map(g => shuffleOpts(q('age-' + g.id, (['newborn', 'infant'].includes(g.id) ? 'infant' : g.id) as Dom, `Expected resting HR ${g.hr} and RR ${g.rr}. Which age group?`, GROUPS.map(x => x.name), GROUPS.indexOf(g), `${g.name} (${g.ages}) — ATI notes.`, S.ATIV), r));
}
function genWeight(r: () => number): GQ[] {
  return [6, 12, 36, 30].map((m, k) => {
    const bw = Math.round((6 + r() * 3) * 2) / 2;
    const mult = m === 6 ? 2 : m === 12 ? 3 : 4;
    const ans = bw * mult; const opts = [ans, bw * (mult - 1), bw * (mult + 1), bw + 1.5 * m].map(v => `${v.toFixed(1)} lb`);
    const uniq = [...new Set(opts)];
    return shuffleOpts(q('w' + k + '-' + bw, m === 6 || m === 12 ? 'infant' : 'toddler', `Birth weight ${bw} lb. Expected weight at ${m === 36 ? '3 years (textbook)' : m === 30 ? '30 months (ATI)' : m + ' months'}?`, uniq, 0, `×${mult} birth weight: ${bw} × ${mult} = ${ans.toFixed(1)} lb (${lbToKg(ans)} kg).`, m >= 30 ? (m === 30 ? S.ATIM : S.T31) : S.PPTB), r);
  }).concat([shuffleOpts(q('w-pre', 'preschool', 'A 3-year-old weighs 30 lb. Using the preschool rule, about how much at 4?', ['35 lb', '60 lb', '31.5 lb', '45 lb'], 0, 'About 5 lb/yr (ATI).', S.ATIM), r),
    shuffleOpts(q('w-sch', 'school', 'Which yearly gain fits BOTH school-age sources (4.4–6.6 and 4.4–8.8 lb)?', ['5 lb', '8 lb', '12 lb', '1 lb'], 0, 'Only 5 lb fits both ranges (ATI Ch6, ATI milestones).', S.ATI6), r),
    shuffleOpts(q('w-ado', 'adolescent', 'What is the expected weight of a 15-year-old?', ['No single value — interpret on the teen’s own curve with height and puberty', '120 lb', '50 kg for everyone', 'Adult BMI 22'], 0, 'Your sources give no adolescent weight norm; percentiles and trends decide.', S.ATIM), r)]);
}
function genChart(r: () => number): GQ[] {
  return [
    q('c1', 'percentile', 'A child on the 50th percentile is:', ['At the median — half of peers are above, half below', 'The only healthy weight', 'Overweight', 'Underweight'], 0, 'Percentile basics.', S.L930),
    q('c2', 'percentile', 'Weight 90th percentile, height 10th percentile in a 9-year-old:', ['Widely disparate — investigate', 'Expected', 'Only height matters', 'Only weight matters'], 0, 'Textbook Ch31.', S.T31),
    q('c3', 'bmi', 'A 12-year-old’s BMI is at the 90th percentile. Your sources classify this as:', ['Overweight (85th–95th)', 'Obese', 'Healthy weight', 'Underweight'], 0, 'Textbook Ch30.', S.T30),
    q('c4', 'bmi', 'BMI at the 97th percentile in a 10-year-old:', ['Obese (>95th)', 'Overweight', 'Extremely obese', 'Healthy'], 0, 'Textbook Ch30: obese >95th; extremely obese 99th.', S.T30),
    q('c5', 'bmi', 'Should adult BMI categories be applied to a 14-year-old?', ['No — use BMI percentiles for age', 'Yes, always', 'Only for boys', 'Only after puberty starts'], 0, 'Sources classify children by percentile.', S.T30),
    q('c6', 'percentile', 'Weight drops from the 75th to the 25th percentile over 4 months:', ['Crossing lines — report and assess', 'Expected', 'Celebrate weight loss', 'Ignore until next year'], 0, 'Sudden change → investigate (Ch31).', S.T31),
  ].map(x => shuffleOpts(x, r));
}
function genDose(r: () => number): GQ[] {
  const out: GQ[] = [shuffleOpts(q('d0', 'calc', 'Instructor example: 22 lb child, 5 mg/kg, supplied 100 mg/2 mL. Volume?', ['1 mL', '2.2 mL', '0.5 mL', '10 mL'], 0, '22 ÷ 2.2 = 10 kg; 50 mg; 50 × 2/100 = 1 mL (review #34).', S.REV), r)];
  for (let k = 0; k < 4; k++) {
    const kg = [8, 10, 12, 15, 18, 20, 25][Math.floor(r() * 7)]; const lb = Math.round(kg * 2.2 * 10) / 10;
    const mgkg = [2, 5, 10, 15][Math.floor(r() * 4)]; const conc = [50, 100, 125, 250][Math.floor(r() * 4)];
    const mg = kg * mgkg; const ml = Math.round((mg / conc) * 5 * 10) / 10;
    const wrong = Math.round((lb * mgkg / conc) * 5 * 10) / 10;
    const opts = [...new Set([ml, wrong, Math.round(ml * 2 * 10) / 10, Math.round(ml / 2 * 10) / 10].map(v => `${v} mL`))];
    out.push(shuffleOpts(q(`d${k}-${kg}-${mgkg}-${conc}`, 'calc', `Child weighs ${lb} lb. Order: ${mgkg} mg/kg. Supplied: ${conc} mg/5 mL. How many mL?`, opts, 0, `${lb} ÷ 2.2 = ${kg} kg; ${kg} × ${mgkg} = ${mg} mg; ${mg} × 5/${conc} = ${ml} mL. (Using pounds by mistake gives ${wrong} mL.)`, S.REV), r));
  }
  return out;
}
const GAME_LIST: { id: string; title: string; blurb: string; make: (r: () => number) => GQ[] }[] = [
  { id: 'normal', title: 'Normal or Concerning?', blurb: 'Vital signs and growth trends', make: r => STATIC.normal.map(x => shuffleOpts(x, () => 0.5 + 0 * r())) },
  { id: 'age', title: 'How Old Am I?', blurb: 'Match the vital-sign profile to the age group', make: genAge },
  { id: 'weight', title: 'Weight Gain Challenge', blurb: 'Doubling, tripling, ×4, yearly gains', make: genWeight },
  { id: 'chart', title: 'Read the Growth Chart', blurb: 'Percentiles, trends, BMI-for-age', make: genChart },
  { id: 'dose', title: 'Peds Dosage Calculation', blurb: 'lb → kg → mg → mL', make: genDose },
  { id: 'error', title: 'Find the Assessment Error', blurb: 'Technique mistakes', make: r => STATIC.error.map(x => shuffleOpts(x, r)) },
  { id: 'first', title: 'What Would You Do First?', blurb: 'Priority with the whole picture', make: r => STATIC.first.map(x => shuffleOpts(x, r)) },
];
const COACH = ['Identify exactly what the question asks.', 'Find the age and the relevant clinical details.', 'Recall the expected value or pattern (and which source it comes from).', 'Consider symptoms, trends, and risk factors — not one number alone.', 'Eliminate wrong or lower-priority answers.', 'Select the best answer.', 'Say why it beats the second-best choice.'];

function VGGames() {
  const { store, update } = useApp();
  const [gid, setGid] = useState<string | null>(null);
  const [seed, setSeed] = useState(1);
  const [k, setK] = useState(0); const [pick, setPick] = useState<number | null>(null); const [score, setScore] = useState(0); const [coach, setCoach] = useState(false);
  const game = GAME_LIST.find(g => g.id === gid);
  const qs = useMemo(() => {
    if (!game) return [];
    const cards = store.rapid?.cards ?? {};
    return game.make(rand(seed * 7919 + Date.now() % 1000)).sort((a, b) => (cards['vg:' + a.id]?.due ?? 0) - (cards['vg:' + b.id]?.due ?? 0));
  }, [gid, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!game) return (
    <section className="panel"><h2>Vital-sign & growth games</h2>
      <div className="game-grid">{GAME_LIST.map(g => <button key={g.id} className="game-tile vg-tile" onClick={() => { setGid(g.id); setK(0); setPick(null); setScore(0); setSeed(seed + 1); }}><strong>{g.title}</strong><span className="small">{g.blurb}</span></button>)}</div>
      <p className="small muted">Missed cards return in 1 day; correct ones in 3, then 7 days. First attempts and retests are tracked separately in Mastery.</p></section>
  );
  if (k >= qs.length) return <section className="panel"><h2>{game.title} — {score}/{qs.length}</h2><div className="row gap"><button className="btn primary" onClick={() => { setK(0); setPick(null); setScore(0); setSeed(seed + 1); }}>Play again (new numbers)</button><button className="btn" onClick={() => setGid(null)}>All games</button></div></section>;
  const g = qs[k];
  return (
    <section className="panel game">
      <div className="row between"><h2>{game.title}</h2><span className="mono">{k + 1}/{qs.length}</span></div>
      <p className="game-prompt">{g.prompt}</p>
      <button type="button" className="btn small ghost" aria-expanded={coach} onClick={() => setCoach(!coach)}>🧭 Reasoning coach</button>
      {coach && <ol className="coach-steps">{COACH.map(c => <li key={c}>{c}</li>)}</ol>}
      <div className="mq-opts" role="group" aria-label="Answer choices">{g.options.map((o, i) => <button key={o + i} className={'btn' + (pick !== null && i === g.answer ? ' good' : pick === i ? ' bad-b' : '')} disabled={pick !== null} onClick={() => { setPick(i); const ok = i === g.answer; if (ok) setScore(score + 1); update(s => recordVG(s, g.id, g.dom, ok)); }}>{o}</button>)}</div>
      {pick !== null && <div role="status" className="game-fb"><p className={pick === g.answer ? 'good-t' : 'bad-t'}><strong>{pick === g.answer ? 'Correct.' : 'Not quite.'}</strong> {g.why}</p><SrcChip src={g.src} /><button className="btn primary" onClick={() => { setK(k + 1); setPick(null); setCoach(false); }}>Next</button></div>}
    </section>
  );
}
function VGMastery() {
  const { store } = useApp();
  const gm = store.rapid?.games ?? {};
  const p = (x?: { n: number; correct: number }) => (x && x.n ? `${Math.round((x.correct / x.n) * 100)}% (${x.n})` : '—');
  return (
    <section className="panel">
      <h2>Vital signs & growth mastery</h2>
      <p className="small muted">Mastered = 80%+ on first attempts with at least 5 answers. Retests show how well missed concepts stuck.</p>
      <div className="vgm"><div className="vgm-row vgm-h"><span>Area</span><span>First attempt</span><span>Retest</span></div>
        {VG_DOMAINS.map(([d, l]) => { const f = gm['vgf:' + d]; const good = f && f.n >= 5 && f.correct / f.n >= 0.8; return <div key={d} className={'vgm-row' + (good ? ' m-good' : '')}><span>{good ? '✓ ' : ''}{l}</span><span className="mono">{p(f)}</span><span className="mono">{p(gm['vgr:' + d])}</span></div>; })}
      </div>
    </section>
  );
}
