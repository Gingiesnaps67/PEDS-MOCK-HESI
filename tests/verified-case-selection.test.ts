import { describe, expect, it } from 'vitest';
import { CASES, getItem } from '../src/data/bank';
import { defaultStore } from '../src/engine/storage';
import { applyAttempt, buildExtended, buildFresh, grade, pickCases, scorable } from '../src/engine/exam';
import { rng } from '../src/engine/dosage';
import type { ActiveExam } from '../src/types';

function expectCompleteVerifiedCases(exam: ActiveExam, expectedCases: number) {
  const items = exam.slots.map(s => getItem(s.itemId)!);
  expect(items.every(scorable)).toBe(true);
  const caseIds = [...new Set(items.map(i => i.caseId).filter(Boolean))];
  expect(caseIds).toHaveLength(expectedCases);
  for (const id of caseIds) {
    expect(items.filter(i => i.caseId === id).map(i => i.stage)).toEqual([1, 2, 3, 4, 5, 6]);
  }
}

describe('verified case selection', () => {
  it('has enough eligible complete cases and terminates when asked for more than exist', () => {
    const eligible = CASES.filter(c => c.items.every(scorable));
    expect(eligible.length).toBeGreaterThanOrEqual(4);
    const picked = pickCases(CASES.length + 1, defaultStore(), rng(50));
    expect(new Set(picked.map(c => c.id))).toEqual(new Set(eligible.map(c => c.id)));
    expect(picked).toHaveLength(eligible.length);
  });

  it('keeps rotation and extended cases verified after all eligible cases have been seen', () => {
    let store = defaultStore();
    for (let n = 0; n < 12; n++) {
      const exam = buildFresh(store, store.settings, 100 + n);
      expect(exam.slots).toHaveLength(60);
      expectCompleteVerifiedCases(exam, 2);
      store = applyAttempt(store, grade(exam));
    }
    for (const size of [75, 90, 100]) {
      const exam = buildExtended(size, store.settings, size, store);
      expect(exam.slots).toHaveLength(size);
      expectCompleteVerifiedCases(exam, 4);
      store = applyAttempt(store, grade(exam));
    }
  });
});
