import type { Item, CaseStudy, CategoryId } from '../types';
import { FORM_A } from './formA';
import { FORM_B } from './formB';
import { NGN } from './ngn';
import { CASES as CASES1, FORM_CASES } from './cases';
import { CASES2 } from './cases2';
const CASES = [...CASES1, ...CASES2];
import { TOPIC_BY_N } from './blueprint';
import { POOL_C1 } from './poolC1';
import { POOL_C2 } from './poolC2';
import { POOL_C3 } from './poolC3';
import { NGN_C as NGN_C0, PRIORITY_C } from './poolC4';
import { POOL_S, PROVIDED } from './poolS';
import { POOL_V } from './poolV';
const NGN_C = [...NGN_C0, ...POOL_S.filter(i => i.ngn)];

/** Spread keyed answer positions in the rotation pool so the key is never predictable.
 *  Swapping moves each option together with its rationale note, so explanations stay aligned. */
const PATTERN = [2, 0, 3, 1, 1, 3, 0, 2, 3, 2, 0, 1];
function rebalance(items: Item[]): Item[] {
  let k = 0;
  return items.map(it => {
    if (it.fmt !== 'mc') return it;
    const target = PATTERN[k++ % PATTERN.length] % it.options.length;
    if (target === it.answer) return it;
    const options = [...it.options];
    const notes = it.rationale.options ? [...it.rationale.options] : undefined;
    [options[target], options[it.answer]] = [options[it.answer], options[target]];
    if (notes) [notes[target], notes[it.answer]] = [notes[it.answer], notes[target]];
    return { ...it, options, answer: target, rationale: { ...it.rationale, options: notes } };
  });
}
/** rotation pool: traditional items not tied to a fixed form */
export const POOL_C: Item[] = rebalance([...POOL_C1, ...POOL_C2, ...POOL_C3, ...PRIORITY_C, ...POOL_S.filter(i => !i.ngn), ...POOL_V]);
/** the student's own practice questions (wording and option order preserved, never rebalanced) */
export { PROVIDED };
export { NGN_C };

export { CASES, FORM_CASES };
export const CASE_BY_ID: Record<string, CaseStudy> = Object.fromEntries(CASES.map(c => [c.id, c]));

/** traditional items per form */
export const TRAD: Record<'A' | 'B', Item[]> = { A: FORM_A, B: FORM_B };
/** standalone NGN per form */
export const NGN_FORM: Record<'A' | 'B', Item[]> = {
  A: NGN.filter(i => i.id.startsWith('NA')),
  B: NGN.filter(i => i.id.startsWith('NB')),
};

export const ALL_ITEMS: Item[] = [
  ...FORM_A, ...FORM_B, ...POOL_C, ...PROVIDED, ...NGN, ...NGN_C, ...CASES.flatMap(c => c.items),
];
/** every traditional (non-NGN) item, and every standalone NGN item */
export const ALL_TRAD: Item[] = [...FORM_A, ...FORM_B, ...POOL_C, ...PROVIDED];
export const ALL_NGN: Item[] = [...NGN, ...NGN_C];
const BY_ID = new Map<string, Item>(ALL_ITEMS.map(i => [i.id, i]));
const extra = new Map<string, Item>();

/** register generated items (dosage lab) so lookups work */
export function registerGenerated(items: Item[] | undefined) {
  items?.forEach(i => extra.set(i.id, i));
}
export function getItem(id: string): Item | undefined {
  return BY_ID.get(id) ?? extra.get(id);
}

export const isNGN = (i: Item) => !!i.ngn || !!i.caseId;

export function categoryOf(i: Item): CategoryId {
  return TOPIC_BY_N[i.topics[0]]?.cat ?? 'meds';
}

/** every item's form ('A' | 'B'), used for rotation and labelling */
export function formOf(id: string): 'A' | 'B' | null {
  if (/^(A\d|NA|CA)/.test(id)) return 'A';
  if (/^(B\d|NB|CB)/.test(id)) return 'B';
  return null;
}
