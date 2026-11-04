import type { ActiveExam, Attempt, AttemptItem, ExamKind, ExamSettings, ExamSlot, Item, Store, CJ, MistakeType } from '../types';
import { verifyOf } from '../data/verify';
import { TRAD, NGN_FORM, FORM_CASES, CASE_BY_ID, ALL_ITEMS, ALL_TRAD, ALL_NGN, getItem, categoryOf, registerGenerated, CASES } from '../data/bank';
import { CATEGORIES } from '../data/blueprint';
import type { CaseStudy } from '../types';
import { emptyResponse, scoreItem } from './scoring';
import { rng } from './dosage';

export const HESI_SPEC = { total: 60, minutes: 130, traditional: 44, unscored: 2, caseItems: 12, standaloneNgn: 4 };

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** interleave items so the same body system rarely appears twice in a row */
export function interleave(items: Item[], rand: () => number): Item[] {
  const groups = new Map<string, Item[]>();
  shuffle(items, rand).forEach(i => { const c = categoryOf(i); groups.set(c, [...(groups.get(c) ?? []), i]); });
  const out: Item[] = [];
  let last = '';
  while (out.length < items.length) {
    const keys = [...groups.keys()].filter(k => groups.get(k)!.length).sort((a, b) => groups.get(b)!.length - groups.get(a)!.length);
    const k = keys.find(x => x !== last) ?? keys[0];
    out.push(groups.get(k)!.shift()!); last = k;
  }
  return out;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function newExam(kind: ExamKind, title: string, slots: ExamSlot[], settings: ExamSettings, opts: { tutor?: boolean; timed?: boolean; generated?: Item[] } = {}): ActiveExam {
  registerGenerated(opts.generated);
  return {
    id: uid(), kind, title, slots, responses: {}, confidence: {}, flags: [], timeSpent: {}, index: 0,
    remainingMs: opts.timed === false ? null : settings.minutes * 60_000,
    startedAt: Date.now(), settings, tutor: !!opts.tutor, checked: [], generated: opts.generated,
  };
}

/** choose the form the student has seen least, alternating otherwise */
export function pickForm(store: Store): 'A' | 'B' {
  const last = store.formRotation.lastForm;
  return last === 'A' ? 'B' : 'A';
}

/** Builds a 60-item HESI-style simulation: 44 traditional (2 unscored), 2 six-item cases, 4 standalone NGN */
export function buildHesi(form: 'A' | 'B', settings: ExamSettings, seed = Date.now()): ActiveExam {
  const r = rng(seed);
  const trad = interleave(TRAD[form], r);
  const [c1, c2] = shuffle(FORM_CASES[form], r).map(id => CASE_BY_ID[id].items);
  const ngn = shuffle(NGN_FORM[form], r);
  const seq: Item[] = [...trad.slice(0, 20), ...c1, ...ngn.slice(0, 2), ...trad.slice(20, 40), ...c2, ...ngn.slice(2, 4), ...trad.slice(40)];
  const unscored = new Set(settings.unscoredItems ? shuffle(trad.filter(i => i.fmt !== 'numeric'), r).slice(0, HESI_SPEC.unscored).map(i => i.id) : []);
  const slots = seq.map(i => ({ itemId: i.id, scored: !unscored.has(i.id) }));
  return newExam(form === 'A' ? 'formA' : 'formB', `HESI Specialty Simulation — Form ${form}`, slots, settings);
}

/* ---------------- rotation (least-recently-served selection) ---------------- */
/** only items verified in (or derived from) the uploaded sources may enter scored exams */
export const scorable = (i: Item) => verifyOf(i.id) !== 'U';
const exposure = (store: Store | null, id: string) => store?.itemStats[id]?.seen ?? 0;
const lastSeen = (store: Store | null, id: string) => store?.itemStats[id]?.lastSeen ?? 0;

/** rank items so never-seen come first, then least-seen, then least-recent; ties broken randomly */
function rankFresh<T extends { id: string }>(items: T[], store: Store | null, r: () => number, extra: (i: T) => number = () => 0): T[] {
  const keyed = items.map(i => ({ i, k: [exposure(store, i.id), lastSeen(store, i.id), extra(i), r()] }));
  keyed.sort((a, b) => a.k[0] - b.k[0] || a.k[1] - b.k[1] || a.k[2] - b.k[2] || a.k[3] - b.k[3]);
  return keyed.map(x => x.i);
}

/**
 * Pick n traditional items spread across the 11 body-system categories in proportion to how many
 * instructor topics each category holds, preferring items the student has seen least.
 */
export function pickStratified(pool: Item[], n: number, store: Store | null, r: () => number, extra?: (i: Item) => number): Item[] {
  const chosen: Item[] = [];
  const used = new Set<string>();
  const topicsUsed = new Set<number>();
  CATEGORIES.forEach(c => {
    const quota = Math.round((n * c.topics.length) / 69);
    const ranked = rankFresh(pool.filter(i => categoryOf(i) === c.id), store, r, extra);
    // spread across topics first: one item per topic before any topic repeats
    const ordered = [...ranked.filter((i, k) => ranked.findIndex(j => j.topics[0] === i.topics[0]) === k), ...ranked.filter((i, k) => ranked.findIndex(j => j.topics[0] === i.topics[0]) !== k)];
    let taken = 0;
    for (const i of ordered) { if (taken >= quota || chosen.length >= n) break; if (topicsUsed.has(i.topics[0]) && ordered.some(o => !used.has(o.id) && !topicsUsed.has(o.topics[0]) && o !== i)) continue; chosen.push(i); used.add(i.id); topicsUsed.add(i.topics[0]); taken++; }
    for (const i of ordered) { if (taken >= quota || chosen.length >= n) break; if (used.has(i.id)) continue; chosen.push(i); used.add(i.id); taken++; }
  });
  for (const i of rankFresh(pool.filter(i => !used.has(i.id)), store, r, extra)) { if (chosen.length >= n) break; chosen.push(i); }
  return chosen.slice(0, n);
}

const caseExposure = (store: Store | null, c: CaseStudy) => Math.min(...c.items.map(i => exposure(store, i.id)));
/** least-seen complete source-verified cases, preferring different body systems */
export function pickCases(n: number, store: Store | null, r: () => number): CaseStudy[] {
  // Keep all six linked steps together. Mixed/unverified cases remain available in
  // case practice and the fixed forms, but never enter rotation/extended exams.
  const eligible = CASES.filter(c => c.items.every(scorable));
  const ranked = shuffle(eligible, r).sort((a, b) => caseExposure(store, a) - caseExposure(store, b) || Math.min(...a.items.map(i => lastSeen(store, i.id))) - Math.min(...b.items.map(i => lastSeen(store, i.id))));
  const out: CaseStudy[] = [];
  for (const c of ranked) { if (out.length >= n) break; if (!out.some(o => o.cat === c.cat)) out.push(c); }
  for (const c of ranked) { if (out.length >= n) break; if (!out.includes(c)) out.push(c); }
  return out;
}
/** least-seen standalone NGN items, preferring different formats */
export function pickNgn(n: number, store: Store | null, r: () => number): Item[] {
  const ranked = rankFresh(ALL_NGN.filter(scorable), store, r);
  const out: Item[] = [];
  for (const i of ranked) { if (out.length >= n) break; if (!out.some(o => o.fmt === i.fmt)) out.push(i); }
  for (const i of ranked) { if (out.length >= n) break; if (!out.includes(i)) out.push(i); }
  return out;
}

function assemble(trad: Item[], cases: Item[][], ngn: Item[]): Item[] {
  const chunk = Math.ceil(trad.length / (cases.length + 1));
  const per = Math.ceil(ngn.length / Math.max(1, cases.length));
  const seq: Item[] = [];
  for (let k = 0; k <= cases.length; k++) {
    seq.push(...trad.slice(k * chunk, (k + 1) * chunk));
    if (k < cases.length) seq.push(...cases[k], ...ngn.slice(k * per, (k + 1) * per));
  }
  return seq;
}

/**
 * Fresh HESI-style form from the whole bank: 44 traditional (2 unscored), 2 six-item cases, 4 standalone NGN.
 * Items the student has seen least are chosen first, so repeat attempts get substantially new questions.
 */
export function buildFresh(store: Store | null, settings: ExamSettings, seed = Date.now()): ActiveExam {
  const r = rng(seed);
  const trad = interleave(pickStratified(ALL_TRAD.filter(scorable), HESI_SPEC.traditional, store, r), r);
  const cases = pickCases(2, store, r).map(c => c.items);
  const ngn = pickNgn(HESI_SPEC.standaloneNgn, store, r);
  const seq = assemble(trad, cases, ngn);
  const unscored = new Set(settings.unscoredItems ? shuffle(trad.filter(i => i.fmt !== 'numeric'), r).slice(0, HESI_SPEC.unscored).map(i => i.id) : []);
  const n = (store?.attempts.filter(a => a.kind === 'hesi').length ?? 0) + 1;
  return newExam('hesi', `HESI Specialty Simulation — Rotation form ${n}`, seq.map(i => ({ itemId: i.id, scored: !unscored.has(i.id) })), settings);
}

/** Extended challenge: 75–100 items emphasizing analysis and complex judgment, 4 cases and 8 standalone NGN */
export function buildExtended(n: number, settings: ExamSettings, seed = Date.now(), store: Store | null = null): ActiveExam {
  const r = rng(seed);
  const count = Math.max(75, Math.min(100, n));
  const cases = pickCases(4, store, r).map(c => c.items);
  const ngn = pickNgn(8, store, r);
  const tradNeeded = count - cases.length * 6 - ngn.length;
  // harder items rank ahead of easier ones at equal exposure
  const trad = interleave(pickStratified(ALL_TRAD.filter(scorable), tradNeeded, store, r, i => -i.diff), r);
  const minutes = Math.round(count * (130 / 60));
  return newExam('extended', `Extended Challenge Exam — ${count} items (supplemental practice)`, assemble(trad, cases, ngn).map(i => ({ itemId: i.id, scored: true })), { ...settings, minutes });
}

export function buildPractice(kind: ExamKind, title: string, items: Item[], settings: ExamSettings, opts: { tutor?: boolean; timed?: boolean; minutes?: number; generated?: Item[] } = {}): ActiveExam {
  return newExam(kind, title, items.map(i => ({ itemId: i.id, scored: true })), { ...settings, minutes: opts.minutes ?? Math.max(5, Math.round(items.length * 2.2)) }, opts);
}

export function buildCase(caseId: string, settings: ExamSettings, tutor: boolean): ActiveExam {
  const c = CASE_BY_ID[caseId];
  return buildPractice('case', `Unfolding Case — ${c.title}`, c.items, settings, { tutor, timed: !tutor, minutes: 15 });
}

/* ---------------- timer ---------------- */
export function tick(ex: ActiveExam, elapsedMs: number): { exam: ActiveExam; expired: boolean } {
  const cur = ex.slots[ex.index]?.itemId;
  const timeSpent = cur ? { ...ex.timeSpent, [cur]: (ex.timeSpent[cur] ?? 0) + elapsedMs } : ex.timeSpent;
  if (ex.remainingMs === null) return { exam: { ...ex, timeSpent }, expired: false };
  const remainingMs = Math.max(0, ex.remainingMs - elapsedMs);
  return { exam: { ...ex, timeSpent, remainingMs }, expired: remainingMs === 0 };
}

/* ---------------- grading ---------------- */
export function grade(ex: ActiveExam, expired = false): Attempt {
  const items: AttemptItem[] = ex.slots.map(s => {
    const item = getItem(s.itemId)!;
    const resp = ex.responses[s.itemId] ?? emptyResponse(item);
    const sc = scoreItem(item, resp);
    const unv = verifyOf(s.itemId) === 'U';
    const out: AttemptItem = { id: s.itemId, earned: sc.earned, possible: sc.possible, full: sc.full, scored: s.scored && !unv, ms: Math.round(ex.timeSpent[s.itemId] ?? 0), response: resp };
    const conf = ex.confidence[s.itemId]; if (conf) out.conf = conf;
    const ch = ex.changes?.[s.itemId]; if (ch) out.changed = ch;
    const init = ex.initial?.[s.itemId];
    if (ch && init && JSON.stringify(init) !== JSON.stringify(resp)) out.initialFull = scoreItem(item, init).full;
    if (ex.coached?.includes(s.itemId)) out.coached = true;
    if (unv) out.unverified = true;
    return out;
  });
  const at: Attempt = { id: ex.id, kind: ex.kind, title: ex.title, startedAt: ex.startedAt, finishedAt: Date.now(), items, expired, generated: ex.generated };
  if (ex.refOpened) at.refUsed = true;
  if (ex.mode) at.mode = ex.mode;
  if (ex.ladder) at.ladderLevels = ex.ladder.history;
  return at;
}

export interface Breakdown { earned: number; possible: number; n: number; full: number }
const add = (m: Record<string, Breakdown>, k: string, a: AttemptItem) => {
  const b = m[k] ?? (m[k] = { earned: 0, possible: 0, n: 0, full: 0 });
  b.earned += a.earned; b.possible += a.possible; b.n += 1; b.full += a.full ? 1 : 0;
};
export const pct = (b?: { earned: number; possible: number }) => (b && b.possible ? Math.round((b.earned / b.possible) * 100) : 0);

export function summarize(at: Attempt) {
  registerGenerated(at.generated);
  const scored = at.items.filter(i => i.scored);
  const total: Breakdown = { earned: 0, possible: 0, n: 0, full: 0 };
  const byCat: Record<string, Breakdown> = {}, byTopic: Record<string, Breakdown> = {}, byCj: Record<string, Breakdown> = {}, byDiff: Record<string, Breakdown> = {}, byFmt: Record<string, Breakdown> = {}, byType: Record<string, Breakdown> = {};
  for (const a of scored) {
    const it = getItem(a.id); if (!it) continue;
    total.earned += a.earned; total.possible += a.possible; total.n++; total.full += a.full ? 1 : 0;
    add(byCat, categoryOf(it), a);
    it.topics.forEach(t => add(byTopic, String(t), a));
    add(byCj, it.cj, a); add(byDiff, String(it.diff), a); add(byFmt, it.fmt, a);
    add(byType, it.caseId ? 'case' : it.ngn ? 'ngn' : 'traditional', a);
  }
  const partial = scored.filter(a => !a.full && a.earned > 0).length;
  const wrong = scored.filter(a => a.earned === 0).length;
  const avgMs = scored.length ? Math.round(scored.reduce((s, a) => s + a.ms, 0) / scored.length) : 0;
  const highConfWrong = scored.filter(a => (a.conf ?? 0) >= 4 && !a.full).map(a => a.id);
  const med = scored.filter(a => { const it = getItem(a.id); return it && (it.topics.includes(34) || it.fmt === 'numeric'); });
  const medB: Breakdown = { earned: med.reduce((s, a) => s + a.earned, 0), possible: med.reduce((s, a) => s + a.possible, 0), n: med.length, full: med.filter(a => a.full).length };
  const priorities: Record<string, number> = {};
  scored.filter(a => !a.full).forEach(a => { const p = getItem(a.id)?.rationale.priority; if (p) priorities[p] = (priorities[p] ?? 0) + 1; });
  return { total, byCat, byTopic, byCj, byDiff, byFmt, byType, partial, wrong, avgMs, highConfWrong, med: medB, priorities, unscored: at.items.filter(i => !i.scored) };
}

/* ---------------- updating progress after an attempt ---------------- */
/** spaced-repetition ladder in days (1 → 3 → 7, then 14 and 30 for long-term retention) */
export const SRS_DAYS = [1, 3, 7, 14, 30];
const DAY = 864e5;

/**
 * Suggest a mistake category from evidence in the attempt (the student can change it on the review screen).
 * Returns undefined when nothing in the data points to a specific cause.
 */
export function suggestMistake(it: Item, a: AttemptItem): MistakeType | undefined {
  if (a.full) return undefined;
  if (a.initialFull) return 'changed';
  if (it.fmt === 'numeric') return 'numeric';
  if (it.fmt === 'sata' && a.response?.kind === 'sata' && a.response.choices.length > 0 && a.response.choices.every(c => it.answer.includes(c)) && a.response.choices.length < it.answer.length) return 'sataIncomplete';
  return undefined;
}

export function applyAttempt(store: Store, at: Attempt): Store {
  const s: Store = structuredClone(store);
  s.mistakes = s.mistakes ?? {};
  const now = at.finishedAt;
  const items: AttemptItem[] = [];
  for (const a0 of at.items) {
    const a = { ...a0 };
    items.push(a);
    const it = getItem(a.id); if (!it) continue;
    const prior = s.itemStats[a.id];
    const st = prior ? { ...prior } : { seen: 0, correct: 0, lastFull: false, lastSeen: 0, avgMs: 0, wrongHighConf: 0 };
    if (!prior) { a.first = true; st.firstFull = a.full; st.firstAt = now; }
    st.avgMs = Math.round((st.avgMs * st.seen + a.ms) / (st.seen + 1));
    st.seen += 1; st.correct += a.full ? 1 : 0; st.lastFull = a.full; st.lastSeen = now;
    const confident = (a.conf ?? 0) >= 4, unsure = a.conf !== undefined && a.conf <= 2;
    if (confident && !a.full) st.wrongHighConf += 1;
    s.itemStats[a.id] = st;
    const isGen = a.id.startsWith('G-');
    if (!a.full && !isGen) {
      const prev = s.missed[a.id];
      s.missed[a.id] = { at: now, topics: it.topics, retried: prev?.retried ?? 0, masteredBy: undefined };
      // confident-but-wrong is the most dangerous pattern: bring it back sooner (12 h) than an ordinary miss (1 day)
      s.srs[a.id] = { due: now + (confident ? 0.5 : SRS_DAYS[0]) * DAY, step: 0 };
      const sug = suggestMistake(it, a);
      if (sug) s.mistakes[a.id] = { type: sug, at: now, auto: true };
    } else if (a.full) {
      if (s.missed[a.id]) s.missed[a.id].retried += 1;
      // independent mastery: a NEW item answered fully on a topic previously missed
      Object.entries(s.missed).forEach(([mid, m]) => {
        if (mid !== a.id && !m.masteredBy && m.topics.some(t => it.topics.includes(t)) && now > m.at) m.masteredBy = a.id;
      });
      if (s.srs[a.id]) {
        // a lucky guess (confidence 1–2) repeats the same interval instead of advancing
        const step = unsure ? s.srs[a.id].step : Math.min(s.srs[a.id].step + 1, SRS_DAYS.length - 1);
        s.srs[a.id] = { due: now + SRS_DAYS[step] * DAY, step };
      } else if (unsure && !isGen) {
        // right but unsure: schedule a check in 3 days so fragile knowledge is confirmed
        s.srs[a.id] = { due: now + SRS_DAYS[1] * DAY, step: 1 };
      }
    }
  }
  if (at.kind === 'formA' || at.kind === 'formB') {
    s.formRotation.lastForm = at.kind === 'formA' ? 'A' : 'B';
    s.formRotation.served[at.kind] = (s.formRotation.served[at.kind] ?? 0) + 1;
  }
  const saved: Attempt = { ...at, items };
  s.attempts = [...s.attempts.filter(x => x.id !== at.id), saved].slice(-60);
  s.active = null;
  s.updatedAt = Date.now();
  return s;
}

/* ---------------- adaptive selection ---------------- */
/** topic mastery 0..1 from item stats (null = never seen) */
export function topicMastery(store: Store): Record<number, { acc: number | null; seen: number }> {
  const out: Record<number, { e: number; p: number; seen: number }> = {};
  for (const at of store.attempts.slice(-20)) {
    registerGenerated(at.generated);
    for (const a of at.items) {
      const it = getItem(a.id); if (!it || !a.scored) continue;
      it.topics.forEach(t => { const o = out[t] ?? (out[t] = { e: 0, p: 0, seen: 0 }); o.e += a.earned; o.p += a.possible; o.seen += 1; });
    }
  }
  const res: Record<number, { acc: number | null; seen: number }> = {};
  for (let t = 1; t <= 69; t++) res[t] = out[t] ? { acc: out[t].p ? out[t].e / out[t].p : null, seen: out[t].seen } : { acc: null, seen: 0 };
  return res;
}

/**
 * Weakness-based selection (a practice heuristic — NOT a validated HESI adaptive algorithm).
 * weight = weakness (1 − accuracy) + unseen bonus + high-confidence-error bonus + slow-response bonus
 *          + recency of last miss + manual category weight; ~20% of picks revisit mastered material.
 */
export function adaptivePick(store: Store, n: number, seed = Date.now()): Item[] {
  const r = rng(seed);
  const tm = topicMastery(store);
  const pool = ALL_ITEMS.filter(i => !i.caseId);
  const scoreOf = (i: Item) => {
    const st = store.itemStats[i.id];
    const accs = i.topics.map(t => tm[t].acc).filter((x): x is number => x !== null);
    const topicAcc = accs.length ? Math.min(...accs) : 0.5;
    let w = (1 - topicAcc) * 3;
    if (!st) w += 1.2;
    else {
      if (!st.lastFull) w += 1.5;
      w += Math.min(st.wrongHighConf, 2) * 0.8;
      if (st.avgMs > 120_000) w += 0.5;
      w -= Math.min(st.seen, 4) * 0.2;
      const days = (Date.now() - st.lastSeen) / 864e5;
      if (days < 0.5 && st.lastFull) w -= 1.5;
    }
    w *= store.settings.weights[categoryOf(i)] ?? 1;
    w += i.diff >= 3 ? 0.3 : 0;
    return Math.max(0.05, w) * (0.7 + r() * 0.6);
  };
  const ranked = pool.map(i => ({ i, w: scoreOf(i) })).sort((a, b) => b.w - a.w);
  const weakCount = Math.ceil(n * 0.8);
  const weak = ranked.slice(0, weakCount).map(x => x.i);
  const mastered = shuffle(ranked.slice(weakCount).filter(x => store.itemStats[x.i.id]?.lastFull).map(x => x.i), r);
  const filler = shuffle(ranked.slice(weakCount).map(x => x.i), r);
  const chosen = [...weak];
  for (const i of [...mastered, ...filler]) { if (chosen.length >= n) break; if (!chosen.includes(i)) chosen.push(i); }
  return interleave(chosen.slice(0, n), r);
}

/* ---------------- clinical priority training sets ---------------- */
export const PRIORITY_SETS: { id: string; label: string; desc: string; test: (i: Item) => boolean }[] = [
  { id: 'abc', label: 'Airway, breathing & circulation', desc: 'Respiratory and perfusion threats', test: i => ['resp', 'cardio'].includes(categoryOf(i)) && ['prioritize', 'act', 'recognize'].includes(i.cj) },
  { id: 'first', label: 'First actions & next actions', desc: 'What to do first', test: i => /first|priority|immediate|ordered|order they/i.test(i.stem) || i.fmt === 'order' },
  { id: 'unstable', label: 'Stable vs unstable children', desc: 'Who to see first; deterioration', test: i => /assess first|which child|requires immediate|deteriorat|urgent/i.test(i.stem) || (i.cj === 'recognize' && i.diff >= 3) },
  { id: 'expected', label: 'Expected vs unexpected findings', desc: 'Sudden vs expected, acute vs chronic', test: i => /inconsistent|expected|requires follow-up|report|consistent/i.test(i.stem) },
  { id: 'meds', label: 'Medication safety', desc: 'Doses, clarifications, high-alert drugs', test: i => i.topics.some(t => [10, 19, 20, 34, 50, 65, 66].includes(t)) || /clarify|question|prescription/i.test(i.stem) },
  { id: 'escalate', label: 'Escalation to RN / provider / EMS', desc: 'When to report and to whom', test: i => /notify|report|call|provider|911|ems/i.test('options' in i ? i.options.join(' ') : '') || /report/i.test(i.stem) },
  { id: 'teach', label: 'Parent & child education', desc: 'Further teaching needed?', test: i => /teach|statement|parent asks|understanding/i.test(i.stem) },
];

export function cjLabel(cj: CJ): string {
  return { recognize: 'Recognize cues', analyze: 'Analyze cues', prioritize: 'Prioritize hypotheses', generate: 'Generate solutions', act: 'Take action', evaluate: 'Evaluate outcomes' }[cj];
}

/** items for rapid review: confident-but-wrong first, then due spaced-repetition items, then recent misses */
export function rapidReviewPick(store: Store, n: number): Item[] {
  const now = Date.now();
  const danger = (id: string) => { const st = store.itemStats[id]; return st && !st.lastFull && st.wrongHighConf > 0 ? 1 : 0; };
  const due = Object.entries(store.srs).filter(([, v]) => v.due <= now)
    .sort((a, b) => danger(b[0]) - danger(a[0]) || a[1].due - b[1].due).map(([id]) => getItem(id)).filter(Boolean) as Item[];
  const missed = Object.entries(store.missed).filter(([, m]) => !m.masteredBy).sort((a, b) => danger(b[0]) - danger(a[0]) || b[1].at - a[1].at).map(([id]) => getItem(id)).filter(Boolean) as Item[];
  const out: Item[] = [];
  for (const i of [...due, ...missed]) { if (out.length >= n) break; if (!out.includes(i) && !i.caseId) out.push(i); }
  return out;
}

/* ---------------- adaptive difficulty ladder (5 levels) ---------------- */
/** level 1–4 = item difficulty 1–4 (traditional); level 5 = difficulty-4 NGN items */
const atLevel = (lv: number) => (i: Item) => scorable(i) && !i.caseId && (lv === 5 ? (i.ngn === true && i.diff >= 3) : (!i.ngn && i.diff === lv));
function pickAtLevel(lv: number, exclude: Set<string>, store: Store | null, r: () => number): Item | undefined {
  for (let d = 0; d < 5; d++) {
    for (const l of [lv - d, lv + d]) {
      if (l < 1 || l > 5) continue;
      const pool = [...ALL_TRAD, ...ALL_NGN].filter(i => !exclude.has(i.id) && atLevel(l)(i));
      if (pool.length) return rankFresh(pool, store, r)[0];
    }
  }
  return undefined;
}
export function buildLadder(store: Store | null, settings: ExamSettings, n = 15, seed = Date.now()): ActiveExam {
  const r = rng(seed);
  const used = new Set<string>();
  const items: Item[] = [];
  for (let k = 0; k < n; k++) { const it = pickAtLevel(2, used, store, r); if (!it) break; used.add(it.id); items.push(it); }
  const ex = buildPractice('ladder', 'Adaptive Difficulty Ladder', items, settings, { tutor: true, timed: false });
  return { ...ex, ladder: { level: 2, streak: 0, target: n, history: [2] } };
}
/** after a ladder item is checked: 2 correct in a row → level up; a miss → level down; the next slot is re-picked */
export function ladderAdvance(ex: ActiveExam, correct: boolean, store: Store | null): ActiveExam {
  if (!ex.ladder) return ex;
  let { level, streak } = ex.ladder;
  if (correct) { streak++; if (streak >= 2) { level = Math.min(5, level + 1); streak = 0; } } else { level = Math.max(1, level - 1); streak = 0; }
  const ladder = { ...ex.ladder, level, streak, history: [...ex.ladder.history, level] };
  const nextIdx = ex.index + 1;
  if (nextIdx >= ex.slots.length || ex.responses[ex.slots[nextIdx].itemId]) return { ...ex, ladder };
  const used = new Set(ex.slots.map(s => s.itemId));
  const it = pickAtLevel(level, used, store, rng(ex.startedAt + nextIdx));
  if (!it) return { ...ex, ladder };
  const slots = ex.slots.map((s, k) => (k === nextIdx ? { itemId: it.id, scored: true } : s));
  return { ...ex, slots, ladder };
}

/* ---------------- quick modes ---------------- */
export function buildQuick(store: Store, minutes: 5 | 10 | 20, settings: ExamSettings, seed = Date.now()): ActiveExam {
  const n = minutes === 5 ? 4 : minutes === 10 ? 8 : 16;
  const items = adaptivePick(store, n * 2, seed).filter(i => scorable(i) && !i.caseId).slice(0, n);
  return buildPractice('quick', `${minutes}-minute sprint`, items, settings, { timed: true, minutes });
}
export function missedRescueItems(store: Store, n = 10): Item[] {
  return Object.entries(store.missed).filter(([, m]) => !m.masteredBy).sort((a, b) => b[1].at - a[1].at)
    .map(([id]) => getItem(id)).filter((i): i is Item => !!i && !i.caseId).slice(0, n);
}
/** night before: confident-wrong + due + recent misses, topped up with high-yield priority items */
export function nightBeforeItems(store: Store, n = 20): Item[] {
  const out = rapidReviewPick(store, n);
  if (out.length < n) {
    const extra = rankFresh(ALL_TRAD.filter(i => scorable(i) && i.diff >= 3 && !out.includes(i)), store, rng(Date.now()));
    for (const i of extra) { if (out.length >= n) break; out.push(i); }
  }
  return out;
}

/* ---------------- readiness (unofficial) ---------------- */
export interface Readiness { estimate: number | null; low: number; high: number; fresh: { n: number; acc: number | null }; repeat: { n: number; acc: number | null }; sims: number | null; luckyGuesses: number; confidentWrong: number; excludedRef: number }
export function readinessDetail(store: Store): Readiness {
  const usable = store.attempts.filter(a => !a.refUsed);
  const items = usable.flatMap(a => a.items.filter(i => i.scored));
  const fresh = items.filter(i => i.first), rep = items.filter(i => !i.first);
  const acc = (xs: AttemptItem[]) => (xs.length ? xs.reduce((s, i) => s + (i.possible ? i.earned / i.possible : 0), 0) / xs.length : null);
  const simAts = usable.filter(a => ['hesi', 'formA', 'formB', 'extended'].includes(a.kind)).slice(-3);
  const sims = simAts.length ? simAts.reduce((s, a) => s + pct(summarize(a).total), 0) / simAts.length : null;
  const fa = acc(fresh);
  const lucky = items.filter(i => i.full && (i.conf ?? 5) <= 2).length;
  const cw = items.filter(i => !i.full && (i.conf ?? 0) >= 4).length;
  // fresh-question accuracy is the best predictor of unseen exam items; repeats inflate scores
  let est: number | null = null;
  if (fa !== null && fresh.length >= 20) est = sims !== null ? 0.6 * fa * 100 + 0.4 * sims : fa * 100;
  else if (sims !== null) est = sims;
  // guessed-correct answers are discounted by half
  if (est !== null && items.length) est -= (lucky / items.length) * 50;
  const nEff = Math.max(fresh.length, simAts.length * 50, 1);
  const margin = Math.min(25, Math.round(100 / Math.sqrt(nEff)));
  const e = est === null ? null : Math.max(0, Math.min(100, Math.round(est)));
  return { estimate: e, low: e === null ? 0 : Math.max(0, e - margin), high: e === null ? 0 : Math.min(100, e + margin), fresh: { n: fresh.length, acc: fa }, repeat: { n: rep.length, acc: acc(rep) }, sims, luckyGuesses: lucky, confidentWrong: cw, excludedRef: store.attempts.length - usable.length };
}
