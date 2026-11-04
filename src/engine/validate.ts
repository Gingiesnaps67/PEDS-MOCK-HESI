// Schema and quality validation for questions (built-in, generated, and imported).
import type { Item, CaseStudy } from '../types';

const FMTS = ['mc', 'sata', 'order', 'numeric', 'matrix', 'cloze', 'bowtie', 'highlight', 'drag'];
const CJS = ['recognize', 'analyze', 'prioritize', 'generate', 'act', 'evaluate'];

const inRange = (i: unknown, n: number) => Number.isInteger(i) && (i as number) >= 0 && (i as number) < n;
const distinct = (a: number[]) => new Set(a).size === a.length;

/** returns a list of problems; empty = valid */
export function validateItem(x: unknown): string[] {
  const e: string[] = [];
  const it = x as Item;
  if (!it || typeof it !== 'object') return ['not an object'];
  if (typeof it.id !== 'string' || !it.id) e.push('missing id');
  const p = (m: string) => e.push(`${it.id ?? '?'}: ${m}`);
  if (!FMTS.includes(it.fmt)) p(`unknown format ${it.fmt}`);
  if (!Array.isArray(it.topics) || !it.topics.length || it.topics.some(t => !Number.isInteger(t) || t < 1 || t > 69)) p('topics must reference blueprint topics 1–69');
  if (!CJS.includes(it.cj)) p('invalid clinical judgment category');
  if (![1, 2, 3, 4].includes(it.diff)) p('difficulty must be 1–4');
  if (typeof it.stem !== 'string' || it.stem.length < 10) p('stem too short');
  if (!it.rationale || typeof it.rationale.correct !== 'string' || !it.rationale.priority || !it.rationale.clue) p('rationale incomplete (correct, priority, clue required)');
  if (!Array.isArray(it.src) || !it.src.length) p('missing source mapping');
  if (e.length) return e;
  const notes = it.rationale.options;
  switch (it.fmt) {
    case 'mc':
      if (it.options.length < 3) p('needs at least 3 options');
      if (!inRange(it.answer, it.options.length)) p('answer out of range');
      if (notes && notes.length !== it.options.length) p('option notes misaligned');
      if (it.options.some(o => /all of the above|none of the above/i.test(o))) p('uses all/none of the above');
      break;
    case 'sata':
      if (!it.answer.length || it.answer.length >= it.options.length) p('SATA must have at least one correct and one incorrect option');
      if (!it.answer.every(a => inRange(a, it.options.length)) || !distinct(it.answer)) p('answer set invalid');
      if (notes && notes.length !== it.options.length) p('option notes misaligned');
      break;
    case 'order':
      if (it.answer.length !== it.options.length || !distinct(it.answer) || !it.answer.every(a => inRange(a, it.options.length))) p('order answer must be a permutation of options');
      break;
    case 'numeric':
      if (!Number.isFinite(it.answer) || it.tolerance < 0) p('numeric answer/tolerance invalid');
      if (!it.steps?.length) p('numeric item needs worked steps');
      break;
    case 'matrix':
      if (it.answer.length !== it.rows.length) p('matrix answer length must equal rows');
      if (!it.answer.every(a => inRange(a, it.columns.length))) p('matrix answer out of range');
      if (notes && notes.length !== it.rows.length) p('row notes misaligned');
      break;
    case 'cloze': {
      const holes = (it.template.match(/\{\d+\}/g) ?? []).length;
      if (holes !== it.blanks.length) p('template placeholders must match blanks');
      if (!it.blanks.every(b => inRange(b.answer, b.options.length))) p('cloze answer out of range');
      break;
    }
    case 'bowtie':
      if (!inRange(it.condition, it.conditions.length)) p('bowtie condition out of range');
      if (it.actionAnswer.length !== 2 || !distinct(it.actionAnswer) || !it.actionAnswer.every(a => inRange(a, it.actions.length))) p('bowtie needs two distinct actions');
      if (it.paramAnswer.length !== 2 || !distinct(it.paramAnswer) || !it.paramAnswer.every(a => inRange(a, it.params.length))) p('bowtie needs two distinct parameters');
      break;
    case 'highlight': {
      const keyed = it.segments.filter(s => s.key !== null);
      if (!keyed.some(s => s.key === true)) p('highlight needs at least one key');
      if (!keyed.some(s => s.key === false)) p('highlight needs at least one distractor');
      if (notes && notes.length !== keyed.length) p('highlight notes misaligned');
      break;
    }
    case 'drag':
      if (it.answer.length !== it.slots.length || !it.answer.every(a => inRange(a, it.pool.length)) || !distinct(it.answer)) p('drag answer invalid');
      if (it.pool.length <= it.slots.length) p('drag pool needs distractors');
      break;
  }
  return e;
}

export function validateCase(c: CaseStudy): string[] {
  const e: string[] = [];
  if (c.items.length !== 6) e.push(`${c.id}: must have exactly 6 items`);
  c.items.forEach((it, i) => {
    if (it.stage !== i + 1) e.push(`${c.id}: item ${it.id} stage should be ${i + 1}`);
    if (it.caseId !== c.id) e.push(`${c.id}: item ${it.id} caseId mismatch`);
    e.push(...validateItem(it));
  });
  const ops = c.items.map(i => i.cj);
  ['recognize', 'analyze', 'prioritize', 'generate', 'act', 'evaluate'].forEach((op, i) => {
    if (ops[i] !== op) e.push(`${c.id}: stage ${i + 1} should test "${op}"`);
  });
  if (c.chart.some(en => en.stage < 1 || en.stage > 6)) e.push(`${c.id}: chart entry stage out of range`);
  if (c.stageNotes.length !== 6) e.push(`${c.id}: needs 6 stage notes`);
  return e;
}

const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3));
/** Jaccard similarity of meaningful stem words */
export function similarity(a: string, b: string): number {
  const A = words(a), B = words(b);
  const inter = [...A].filter(w => B.has(w)).length;
  return inter / (A.size + B.size - inter || 1);
}
/** stem plus answer content — NGN items share generic instructions, so options must be compared too */
export function contentText(i: Item): string {
  const parts: string[] = [i.stem];
  switch (i.fmt) {
    case 'mc': case 'sata': case 'order': parts.push(...i.options); break;
    case 'matrix': parts.push(...i.rows); break;
    case 'cloze': parts.push(i.template, ...i.blanks.flatMap(b => b.options)); break;
    case 'bowtie': parts.push(...i.conditions, ...i.actions, ...i.params); break;
    case 'highlight': parts.push(...i.segments.map(s => s.text)); break;
    case 'drag': parts.push(...i.slots, ...i.pool); break;
  }
  return parts.join(' ');
}
/** pairs of items whose content is near-duplicate */
export function findDuplicates(items: Item[], threshold = 0.7): [string, string, number][] {
  const out: [string, string, number][] = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    if (items[i].id === items[j].id) { out.push([items[i].id, items[j].id, 1]); continue; }
    const s = similarity(contentText(items[i]), contentText(items[j]));
    if (s >= threshold) out.push([items[i].id, items[j].id, s]);
  }
  return out;
}
