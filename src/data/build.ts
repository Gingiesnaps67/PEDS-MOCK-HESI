// Compact authoring helpers. Each option is written as [text, why-note] so a
// rationale can never drift out of alignment with its option.
import type { CJ, Difficulty, MCItem, SATAItem, OrderItem, NumericItem, Rationale } from '../types';

type Opt = [string, string];
interface Common {
  topics: number[]; cj: CJ; diff: Difficulty; age?: string; stem: string;
  correct: string; priority: string; clue: string; memory?: string; simple?: string;
  tempt?: string; variation?: string; physiology?: string;
  src?: string[]; refs?: string[];
}
const R = (c: Common, options?: string[]): Rationale => ({
  correct: c.correct, options, priority: c.priority, clue: c.clue, memory: c.memory, simple: c.simple,
  ...(c.tempt ? { tempt: c.tempt } : {}), ...(c.variation ? { variation: c.variation } : {}), ...(c.physiology ? { physiology: c.physiology } : {}),
});
const SRC = (c: Common) => c.src ?? c.topics.map(n => `Instructor HESI Review #${n}`);

export function mc(id: string, c: Common & { options: Opt[]; answer: number }): MCItem {
  return { id, fmt: 'mc', topics: c.topics, cj: c.cj, diff: c.diff, age: c.age, stem: c.stem,
    options: c.options.map(o => o[0]), answer: c.answer, rationale: R(c, c.options.map(o => o[1])),
    src: SRC(c), refs: c.refs, qa: 'reviewed' };
}
export function sata(id: string, c: Common & { options: Opt[]; answer: number[]; scoring?: 'dichotomous' | 'plusminus' }): SATAItem {
  return { id, fmt: 'sata', topics: c.topics, cj: c.cj, diff: c.diff, age: c.age, stem: c.stem,
    options: c.options.map(o => o[0]), answer: [...c.answer].sort((a, b) => a - b), scoring: c.scoring ?? 'dichotomous',
    rationale: R(c, c.options.map(o => o[1])), src: SRC(c), refs: c.refs, qa: 'reviewed' };
}
/** options listed in the CORRECT order; they are shuffled for display at render time */
export function order(id: string, c: Common & { steps: Opt[] }): OrderItem {
  return { id, fmt: 'order', topics: c.topics, cj: c.cj, diff: c.diff, age: c.age, stem: c.stem,
    options: c.steps.map(s => s[0]), answer: c.steps.map((_, i) => i),
    rationale: R(c, c.steps.map(s => s[1])), src: SRC(c), refs: c.refs, qa: 'reviewed' };
}
export function num(id: string, c: Common & { unit: string; answer: number; tolerance?: number; decimals?: number; steps: string[] }): NumericItem {
  return { id, fmt: 'numeric', topics: c.topics, cj: c.cj, diff: c.diff, age: c.age, stem: c.stem,
    unit: c.unit, answer: c.answer, tolerance: c.tolerance ?? 0, decimals: c.decimals ?? 1, steps: c.steps,
    rationale: R(c), src: SRC(c), refs: c.refs, qa: 'reviewed' };
}
