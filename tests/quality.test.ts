import { it, expect } from 'vitest';
import { ALL_ITEMS, TRAD } from '../src/data/bank';

it('every MC distractor has a "why not" note', () => {
  const bad = ALL_ITEMS.filter(i => i.fmt === 'mc' && i.rationale.options && i.rationale.options.some((n, k) => k !== i.answer && !n.trim())).map(i => i.id);
  expect(bad).toEqual([]);
});
it('correct-answer positions are spread across A–D in each form', () => {
  for (const f of ['A', 'B'] as const) {
    const pos = [0, 0, 0, 0];
    TRAD[f].forEach(i => { if (i.fmt === 'mc') pos[i.answer]++; });
    pos.forEach(p => expect(p).toBeGreaterThanOrEqual(4));
  }
});
it('difficulty mix approximates the design targets', () => {
  const n = ALL_ITEMS.length;
  const share = (d: number) => ALL_ITEMS.filter(i => i.diff === d).length / n;
  expect(share(1)).toBeLessThan(0.16);
  expect(share(3) + share(4)).toBeGreaterThan(0.45);
});
