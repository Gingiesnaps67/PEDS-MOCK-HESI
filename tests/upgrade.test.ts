import { describe, it, expect } from 'vitest';
import { migrate, defaultStore, normConf, mergeStores, STORE_VERSION } from '../src/engine/storage';
import { applyAttempt, grade, buildPractice, suggestMistake, SRS_DAYS } from '../src/engine/exam';
import { getItem } from '../src/data/bank';
import type { Item, ExamSettings, Attempt } from '../src/types';

const S: ExamSettings = { navigation: 'free', minutes: 130, unscoredItems: false, confidence: true };

/** a store exactly as version 1 of the app saved it */
function v1Store() {
  return {
    version: 1, updatedAt: 1000,
    settings: { navigation: 'linear', minutes: 130, unscoredItems: true, confidence: true, examDate: '2026-11-13', weights: {} },
    itemStats: {
      A01: { seen: 1, correct: 1, lastFull: true, lastSeen: 900, avgMs: 40000, wrongHighConf: 0 },
      A02: { seen: 2, correct: 0, lastFull: false, lastSeen: 950, avgMs: 50000, wrongHighConf: 1 },
    },
    missed: { A02: { at: 950, topics: [2], retried: 0 } },
    attempts: [
      { id: 'x1', kind: 'tutor', title: 'old', startedAt: 800, finishedAt: 900, expired: false, items: [{ id: 'A01', earned: 1, possible: 1, full: true, scored: true, ms: 40000, conf: 'high' }, { id: 'A02', earned: 0, possible: 1, full: false, scored: true, ms: 50000, conf: 'high' }] },
    ],
    active: { id: 'act', kind: 'tutor', title: 'in progress', slots: [{ itemId: 'A03', scored: true }], responses: { A03: { kind: 'mc', choice: 1 } }, confidence: { A03: 'low' }, flags: [], timeSpent: {}, index: 0, remainingMs: null, startedAt: 1, settings: S, tutor: false, checked: [] },
    srs: { A02: { due: 2000, step: 0 } },
    formRotation: { lastForm: 'A', served: { formA: 1 } },
  };
}

describe('version-2 upgrade keeps existing progress', () => {
  it('maps old confidence words to the 1–5 scale', () => {
    expect([normConf('low'), normConf('med'), normConf('high'), normConf(4), normConf('x')]).toEqual([2, 3, 5, 4, undefined]);
  });
  it('migrates a version-1 store without losing ids, stats, misses, schedules, or the active exam', () => {
    const m = migrate(v1Store());
    expect(m.version).toBe(STORE_VERSION);
    expect(m.settings.examDate).toBe('2026-11-13');
    expect(Object.keys(m.itemStats)).toEqual(['A01', 'A02']);
    expect(m.itemStats.A02.seen).toBe(2);
    expect(m.missed.A02.topics).toEqual([2]);
    expect(m.srs.A02).toEqual({ due: 2000, step: 0 });
    expect(m.formRotation.served.formA).toBe(1);
    expect(m.attempts[0].items.map(i => i.conf)).toEqual([5, 5]);
    expect(m.active!.responses.A03).toEqual({ kind: 'mc', choice: 1 });
    expect(m.active!.confidence.A03).toBe(2);
    expect(m.mistakes).toEqual({});
    expect(m.rapid).toEqual({ games: {}, cards: {} });
    expect(m.upgradedAt).toBeGreaterThan(0); // old attempts are labelled historical
  });
  it('back-fills first-attempt results only when the stored history holds every exposure', () => {
    const m = migrate(v1Store());
    expect(m.itemStats.A01.firstFull).toBe(true); // seen once, in history
    expect(m.itemStats.A02.firstFull).toBeUndefined(); // seen twice, only one exposure in history
  });
  it('is idempotent and leaves a version-2 store unchanged', () => {
    const once = migrate(v1Store());
    const twice = migrate(JSON.parse(JSON.stringify(once)));
    expect(twice).toEqual(once);
  });
  it('a fresh store has no historical boundary', () => {
    expect(migrate(defaultStore()).upgradedAt).toBe(0);
  });
  it('merging two devices keeps mistake tags and game stats from both', () => {
    const a = { ...defaultStore(), updatedAt: 5, mistakes: { A01: { type: 'misread' as const, at: 1 } } };
    const b = { ...defaultStore(), updatedAt: 9, rapid: { games: { g: { n: 1, correct: 1, last: 1 } }, cards: {} } };
    const m = mergeStores(a, b);
    expect(m.mistakes.A01.type).toBe('misread');
    expect(m.rapid.games.g.n).toBe(1);
  });
});

describe('version-2 tracking', () => {
  const items = ['A01', 'A12', 'A02'].map(id => getItem(id) as Item);
  function run(resp: Record<string, unknown>, conf: Record<string, number>, extra: Record<string, unknown> = {}): Attempt {
    const ex = { ...buildPractice('tutor', 't', items, S), responses: resp, confidence: conf, ...extra } as never;
    return grade(ex);
  }
  it('records first-attempt accuracy and does not overwrite it later', () => {
    const it = getItem('A01') as Extract<Item, { fmt: 'mc' }>;
    const wrong = (it.answer + 1) % it.options.length;
    let s = applyAttempt(defaultStore(), run({ A01: { kind: 'mc', choice: wrong } }, {}));
    expect(s.itemStats.A01.firstFull).toBe(false);
    expect(s.attempts[0].items.find(i => i.id === 'A01')!.first).toBe(true);
    s = applyAttempt(s, run({ A01: { kind: 'mc', choice: it.answer } }, {}));
    expect(s.itemStats.A01.firstFull).toBe(false);
    expect(s.itemStats.A01.lastFull).toBe(true);
    expect(s.attempts[1].items.find(i => i.id === 'A01')!.first).toBeUndefined();
  });
  it('confident-but-wrong comes back sooner than an ordinary miss', () => {
    const a = getItem('A01') as Extract<Item, { fmt: 'mc' }>;
    const b = getItem('A02') as Extract<Item, { fmt: 'mc' }>;
    const at = run({ A01: { kind: 'mc', choice: (a.answer + 1) % 4 }, A02: { kind: 'mc', choice: (b.answer + 1) % 4 } }, { A01: 5, A02: 1 });
    const s = applyAttempt(defaultStore(), at);
    expect(s.srs.A01.due - at.finishedAt).toBe(0.5 * 864e5);
    expect(s.srs.A02.due - at.finishedAt).toBe(SRS_DAYS[0] * 864e5);
    expect(s.itemStats.A01.wrongHighConf).toBe(1);
  });
  it('a right answer given with low confidence is scheduled for a check instead of being treated as mastered', () => {
    const a = getItem('A01') as Extract<Item, { fmt: 'mc' }>;
    const at = run({ A01: { kind: 'mc', choice: a.answer } }, { A01: 1 });
    const s = applyAttempt(defaultStore(), at);
    expect(s.srs.A01.step).toBe(1);
  });
  it('auto-detects a right-to-wrong answer change and an incomplete SATA', () => {
    const a = getItem('A01') as Extract<Item, { fmt: 'mc' }>;
    const sata = getItem('A12') as Extract<Item, { fmt: 'sata' }>;
    const at = run(
      { A01: { kind: 'mc', choice: (a.answer + 1) % 4 }, A12: { kind: 'sata', choices: [sata.answer[0]] } },
      {},
      { changes: { A01: 1 }, initial: { A01: { kind: 'mc', choice: a.answer } } },
    );
    expect(at.items.find(i => i.id === 'A01')!.initialFull).toBe(true);
    const s = applyAttempt(defaultStore(), at);
    expect(s.mistakes.A01).toMatchObject({ type: 'changed', auto: true });
    if (sata.answer.length > 1) expect(s.mistakes.A12.type).toBe('sataIncomplete');
    expect(suggestMistake(a, { id: 'A01', earned: 1, possible: 1, full: true, scored: true, ms: 0 })).toBeUndefined();
  });
});
