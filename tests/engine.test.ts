import { describe, it, expect, beforeEach } from 'vitest';
import { scoreItem, emptyResponse, isAnswered } from '../src/engine/scoring';
import { validateItem, validateCase, findDuplicates } from '../src/engine/validate';
import { buildHesi, buildExtended, tick, grade, applyAttempt, summarize, adaptivePick, topicMastery, HESI_SPEC } from '../src/engine/exam';
import { generate, generateSet, maintenanceDaily, DOSAGE_KINDS, DRUGS } from '../src/engine/dosage';
import { defaultStore, migrate, mergeStores, exportJson, importJson, saveLocal, loadLocal } from '../src/engine/storage';
import { ALL_ITEMS, CASES, TRAD, NGN_FORM, getItem } from '../src/data/bank';
import { TOPICS, CATEGORIES } from '../src/data/blueprint';
import type { Item, MCItem, SATAItem, MatrixItem, ClozeItem, BowtieItem, HighlightItem, DragItem, OrderItem, NumericItem, ExamSettings } from '../src/types';

const settings: ExamSettings = { navigation: 'linear', minutes: 130, unscoredItems: true, confidence: true };
const find = <T extends Item>(id: string) => getItem(id) as T;

describe('blueprint (Phase 1 audit)', () => {
  it('contains topics 1–69 exactly once', () => {
    const ns = TOPICS.map(t => t.n).sort((a, b) => a - b);
    expect(ns).toEqual(Array.from({ length: 69 }, (_, i) => i + 1));
  });
  it('11 categories hold every topic once, matching the review contents page', () => {
    expect(CATEGORIES).toHaveLength(11);
    const all = CATEGORIES.flatMap(c => c.topics).sort((a, b) => a - b);
    expect(all).toEqual(Array.from({ length: 69 }, (_, i) => i + 1));
    TOPICS.forEach(t => expect(CATEGORIES.find(c => c.id === t.cat)!.topics).toContain(t.n));
  });
});

describe('question bank quality', () => {
  it('every built-in item passes schema validation', () => {
    const errors = ALL_ITEMS.flatMap(i => validateItem(i));
    expect(errors).toEqual([]);
  });
  it('every case has 6 linked items following the six NCJMM operations', () => {
    expect(CASES.length).toBeGreaterThanOrEqual(4);
    CASES.forEach(c => expect(validateCase(c)).toEqual([]));
  });
  it('ids are unique', () => {
    const ids = ALL_ITEMS.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('has no near-duplicate stems (duplicate prevention)', () => {
    expect(findDuplicates(ALL_ITEMS, 0.7)).toEqual([]);
  });
  it('detects a trivially rephrased duplicate', () => {
    const a = find<MCItem>('A01');
    const b = { ...a, id: 'X1', stem: a.stem.replace('7-year-old', 'seven-year-old') };
    expect(findDuplicates([a, b], 0.7).length).toBe(1);
  });
  it('rejects malformed items', () => {
    expect(validateItem({ ...find<MCItem>('A01'), answer: 9 })).not.toEqual([]);
    expect(validateItem({ ...find<MCItem>('A01'), topics: [70] })).not.toEqual([]);
    expect(validateItem({ ...find<MCItem>('A01'), options: ['a', 'b', 'all of the above'], answer: 0, rationale: { ...find<MCItem>('A01').rationale, options: undefined } })).not.toEqual([]);
  });
});

describe('topic coverage tracking', () => {
  it('the two forms together cover all 69 topics', () => {
    const covered = new Set(ALL_ITEMS.flatMap(i => i.topics));
    for (let t = 1; t <= 69; t++) expect(covered.has(t), `topic ${t}`).toBe(true);
  });
  it('every topic has at least one traditional item', () => {
    const covered = new Set([...TRAD.A, ...TRAD.B].flatMap(i => i.topics));
    for (let t = 1; t <= 69; t++) expect(covered.has(t), `topic ${t}`).toBe(true);
  });
  it('topicMastery reports every topic', () => {
    expect(Object.keys(topicMastery(defaultStore()))).toHaveLength(69);
  });
});

describe('scoring', () => {
  it('1. traditional single answer', () => {
    const it = find<MCItem>('A01');
    expect(scoreItem(it, { kind: 'mc', choice: it.answer })).toMatchObject({ earned: 1, possible: 1, full: true });
    expect(scoreItem(it, { kind: 'mc', choice: (it.answer + 1) % 4 })).toMatchObject({ earned: 0, full: false });
    expect(scoreItem(it, undefined).earned).toBe(0);
  });
  it('2a. traditional SATA is all-or-nothing', () => {
    const it = find<SATAItem>('A12');
    expect(scoreItem(it, { kind: 'sata', choices: [...it.answer] }).earned).toBe(1);
    expect(scoreItem(it, { kind: 'sata', choices: it.answer.slice(1) }).earned).toBe(0);
  });
  it('2b. NGN extended multiple response uses plus/minus with floor 0', () => {
    const it = find<SATAItem>('CA1-4'); // keys 0,2,3,5
    expect(scoreItem(it, { kind: 'sata', choices: [0, 2, 3, 5] })).toMatchObject({ earned: 4, possible: 4, full: true });
    expect(scoreItem(it, { kind: 'sata', choices: [0, 2, 1] }).earned).toBe(1);
    expect(scoreItem(it, { kind: 'sata', choices: [1, 4, 6] }).earned).toBe(0);
  });
  it('3. matrix scores each row independently', () => {
    const it = find<MatrixItem>('NA1');
    const allRight = { kind: 'matrix' as const, rows: [...it.answer] };
    expect(scoreItem(it, allRight)).toMatchObject({ earned: 7, possible: 7, full: true });
    const oneWrong = { kind: 'matrix' as const, rows: it.answer.map((a, i) => (i === 2 ? 1 - a : a)) };
    expect(scoreItem(it, oneWrong).earned).toBe(6);
  });
  it('4. cloze scores each blank', () => {
    const it = find<ClozeItem>('NA4');
    expect(scoreItem(it, { kind: 'cloze', blanks: it.blanks.map(b => b.answer) }).earned).toBe(3);
    expect(scoreItem(it, { kind: 'cloze', blanks: [it.blanks[0].answer, 0, null] }).earned).toBe(1);
  });
  it('5. drag-and-drop: ordered response all-or-nothing; extended drag per slot', () => {
    const o = find<OrderItem>('A05');
    expect(scoreItem(o, { kind: 'order', order: [...o.answer] }).earned).toBe(1);
    expect(scoreItem(o, { kind: 'order', order: [1, 0, 2, 3, 4] }).earned).toBe(0);
    const d = find<DragItem>('NB3');
    expect(scoreItem(d, { kind: 'drag', slots: [...d.answer] })).toMatchObject({ earned: 4, full: true });
    expect(scoreItem(d, { kind: 'drag', slots: [d.answer[1], d.answer[0], d.answer[2], null] }).earned).toBe(1);
  });
  it('6. highlight uses plus/minus on clicked segments', () => {
    const it = find<HighlightItem>('NA3');
    const keys = it.segments.map((s, i) => (s.key === true ? i : -1)).filter(i => i >= 0);
    const wrong = it.segments.map((s, i) => (s.key === false ? i : -1)).filter(i => i >= 0);
    expect(scoreItem(it, { kind: 'highlight', selected: keys })).toMatchObject({ earned: keys.length, possible: keys.length, full: true });
    expect(scoreItem(it, { kind: 'highlight', selected: [...keys.slice(0, 2), wrong[0]] }).earned).toBe(1);
    expect(scoreItem(it, { kind: 'highlight', selected: wrong }).earned).toBe(0);
  });
  it('7. bow-tie: 1 point each for condition, two actions, two parameters', () => {
    const it = find<BowtieItem>('NA2');
    const right = { kind: 'bowtie' as const, condition: it.condition, actions: [...it.actionAnswer], params: [...it.paramAnswer] };
    expect(scoreItem(it, right)).toMatchObject({ earned: 5, possible: 5, full: true });
    expect(scoreItem(it, { ...right, condition: 0, actions: [it.actionAnswer[0], 0] }).earned).toBe(3);
    expect(isAnswered(it, { ...right, actions: [1] })).toBe(false);
  });
  it('numeric entry respects tolerance', () => {
    const it = find<NumericItem>('A41');
    expect(scoreItem(it, { kind: 'numeric', value: '8.4' }).earned).toBe(1);
    expect(scoreItem(it, { kind: 'numeric', value: '8.44' }).earned).toBe(1);
    expect(scoreItem(it, { kind: 'numeric', value: '16.9' }).earned).toBe(0);
    expect(scoreItem(it, { kind: 'numeric', value: '' }).earned).toBe(0);
  });
});

describe('exam assembly', () => {
  it('HESI simulation has 60 items: 44 traditional (2 unscored), 2 full cases, 4 standalone NGN', () => {
    for (const form of ['A', 'B'] as const) {
      const ex = buildHesi(form, settings, 42);
      expect(ex.slots).toHaveLength(HESI_SPEC.total);
      const items = ex.slots.map(s => getItem(s.itemId)!);
      expect(items.filter(i => !i.caseId && !i.ngn)).toHaveLength(44);
      expect(items.filter(i => i.caseId)).toHaveLength(12);
      expect(items.filter(i => i.ngn && !i.caseId)).toHaveLength(4);
      expect(ex.slots.filter(s => !s.scored)).toHaveLength(2);
      expect(new Set(ex.slots.map(s => s.itemId)).size).toBe(60);
      expect(ex.remainingMs).toBe(130 * 60_000);
    }
  });
  it('Form A and Form B share no items', () => {
    const a = new Set(buildHesi('A', settings, 1).slots.map(s => s.itemId));
    const b = buildHesi('B', settings, 1).slots.map(s => s.itemId);
    expect(b.filter(id => a.has(id))).toEqual([]);
  });
  it('8. six-question case items stay together and in stage order', () => {
    const ex = buildHesi('A', settings, 7);
    for (const c of CASES.filter(c => c.id.startsWith('CA'))) {
      const pos = c.items.map(i => ex.slots.findIndex(s => s.itemId === i.id));
      pos.forEach((p, k) => expect(p).toBe(pos[0] + k));
    }
  });
  it('extended exam is 75–100 items and all unique', () => {
    const ex = buildExtended(90, settings, 3);
    expect(ex.slots).toHaveLength(90);
    expect(new Set(ex.slots.map(s => s.itemId)).size).toBe(90);
    expect(buildExtended(200, settings, 3).slots).toHaveLength(100);
  });
  it('unscored items can be turned off', () => {
    expect(buildHesi('A', { ...settings, unscoredItems: false }, 1).slots.every(s => s.scored)).toBe(true);
  });
});

describe('timer, submission, persistence', () => {
  it('9. timer expires at zero and never goes negative', () => {
    let ex = buildHesi('A', settings, 1);
    ex = { ...ex, remainingMs: 1500 };
    const a = tick(ex, 1000); expect(a.expired).toBe(false); expect(a.exam.remainingMs).toBe(500);
    const b = tick(a.exam, 5000); expect(b.expired).toBe(true); expect(b.exam.remainingMs).toBe(0);
    expect(b.exam.timeSpent[ex.slots[0].itemId]).toBe(6000);
  });
  it('10. submission grades every slot and summarizes results reproducibly', () => {
    const ex = buildHesi('B', settings, 11);
    ex.slots.forEach(s => {
      const it = getItem(s.itemId)!;
      if (it.fmt === 'mc') ex.responses[s.itemId] = { kind: 'mc', choice: it.answer };
      else ex.responses[s.itemId] = emptyResponse(it);
    });
    const at = grade(ex);
    expect(at.items).toHaveLength(60);
    const s1 = summarize(at), s2 = summarize(JSON.parse(JSON.stringify(at)));
    expect(s1.total).toEqual(s2.total);
    const mcScored = at.items.filter(i => i.scored && getItem(i.id)!.fmt === 'mc');
    expect(s1.total.earned).toBe(mcScored.length);
    expect(s1.total.possible).toBeGreaterThan(58);
    // 2 pretest items + any item not verified in the uploaded sources are unscored
    expect(s1.byType.case.n + s1.byType.ngn.n + s1.byType.traditional.n).toBe(at.items.filter(i => i.scored).length);
    expect(at.items.filter(i => i.unverified).every(i => !i.scored)).toBe(true);
  });
  it('11. save and resume keeps answers, flags, index, and remaining time', () => {
    const store = defaultStore();
    const ex = buildHesi('A', settings, 5);
    ex.responses[ex.slots[0].itemId] = { kind: 'mc', choice: 2 };
    ex.flags = [ex.slots[3].itemId]; ex.index = 4; ex.remainingMs = 4_000_000;
    store.active = ex; store.updatedAt = 10;
    saveLocal(store);
    const back = loadLocal()!;
    expect(back.active!.responses[ex.slots[0].itemId]).toEqual({ kind: 'mc', choice: 2 });
    expect(back.active!.flags).toEqual(ex.flags);
    expect(back.active!.index).toBe(4);
    expect(back.active!.remainingMs).toBe(4_000_000);
  });
  it('applyAttempt records misses, spaced review, rotation, and independent mastery', () => {
    let store = defaultStore();
    const ex = buildHesi('A', settings, 9);
    const at = grade(ex);
    store = applyAttempt(store, at);
    expect(store.formRotation.lastForm).toBe('A');
    expect(Object.keys(store.missed).length).toBeGreaterThan(50);
    expect(store.active).toBeNull();
    // a NEW item on topic 2 answered correctly marks topic-2 misses as independently mastered
    const b01 = find<MCItem>('B01');
    const at2 = { ...at, id: 'z', finishedAt: at.finishedAt + 1000, kind: 'tutor' as const, items: [{ id: 'B01', earned: 1, possible: 1, full: true, scored: true, ms: 1000 }] };
    store = applyAttempt(store, at2);
    expect(store.missed['A01'].masteredBy).toBe(b01.id);
  });
  it('export/import round-trips and migrates', () => {
    const s = defaultStore(); s.settings.examDate = '2026-11-20'; s.updatedAt = 5;
    expect(importJson(exportJson(s)).settings.examDate).toBe('2026-11-20');
    expect(() => importJson('{"hello":1}')).toThrow();
    expect(migrate({ version: 0, settings: { minutes: 90 } }).settings).toMatchObject({ minutes: 90, navigation: 'linear' });
    const a = { ...defaultStore(), updatedAt: 1, attempts: [{ id: 'x', finishedAt: 1 } as never] };
    const b = { ...defaultStore(), updatedAt: 2, attempts: [{ id: 'y', finishedAt: 2 } as never] };
    expect(mergeStores(a, b).attempts.map(x => x.id)).toEqual(['x', 'y']);
  });
  it('adaptive practice returns the requested count without duplicates and favors weak topics', () => {
    let store = defaultStore();
    const ex = buildHesi('A', settings, 9);
    ex.slots.forEach(s => { const it = getItem(s.itemId)!; if (it.fmt === 'mc' && !it.topics.includes(2) && !it.topics.includes(4)) ex.responses[s.itemId] = { kind: 'mc', choice: it.answer }; });
    store = applyAttempt(store, grade(ex));
    const pick = adaptivePick(store, 20, 1);
    expect(pick).toHaveLength(20);
    expect(new Set(pick.map(i => i.id)).size).toBe(20);
  });
});

describe('12. pediatric dosage calculations', () => {
  it('Holliday-Segar maintenance', () => {
    expect(maintenanceDaily(8)).toBe(800);
    expect(maintenanceDaily(15)).toBe(1250);
    expect(maintenanceDaily(30)).toBe(1700);
  });
  it('reproduces the instructor’s worked example', () => {
    const kg = 22 / 2.2; const mg = 5 * kg; const ml = (mg / 100) * 2;
    expect([kg, mg, ml]).toEqual([10, 50, 1]);
  });
  it('generated problems are valid, deterministic, and stay within maximum doses', () => {
    for (const k of DOSAGE_KINDS) for (let n = 0; n < 40; n++) {
      const it = generate(k.id, 123, n);
      expect(validateItem(it)).toEqual([]);
      expect(generate(k.id, 123, n)).toEqual(it);
    }
    for (let n = 0; n < 60; n++) {
      const it = generate('perDay', 9, n) as NumericItem;
      const drug = DRUGS.find(d => it.stem.toLowerCase().includes(d.name.toLowerCase()))!;
      const mg = it.answer / drug.concMl * drug.concMg;
      if (drug.maxDayMg) expect(mg * drug.dosesPerDay).toBeLessThanOrEqual(drug.maxDayMg * 1.02);
    }
  });
  it('mg/kg/day is divided and mg/kg/dose is not', () => {
    for (let n = 0; n < 30; n++) {
      const it = generate('perDay', 77, n) as NumericItem;
      expect(it.steps.some(s => /doses =/.test(s))).toBe(true);
      const d = generate('perDose', 77, n) as NumericItem;
      expect(d.steps.some(s => /doses =/.test(s))).toBe(false);
    }
  });
  it('safety-check keys agree with the stated range', () => {
    for (let n = 0; n < 80; n++) {
      const it = generate('safety', 5, n) as MCItem;
      const m = it.stem.match(/weighing (\d+) kg is prescribed .*? ([\d.]+) mg .*?range is ([\d.]+)–([\d.]+) mg\/kg (\/day|\/dose)/)!;
      const [kg, dose, lo, hi] = [m[1], m[2], m[3], m[4]].map(Number);
      const perDay = m[5] === '/day';
      const drug = DRUGS.find(d => it.stem.toLowerCase().includes(d.name.toLowerCase()))!;
      const total = perDay ? dose * drug.dosesPerDay : dose;
      const expected = total > hi * kg + 0.05 ? 2 : total < lo * kg - 0.05 ? 1 : 0;
      expect(it.answer).toBe(expected);
    }
  });
  it('generateSet cycles through chosen kinds', () => {
    expect(generateSet(['convert', 'urine'], 6, 1).map(i => i.id.split('-')[1])).toEqual(['convert', 'urine', 'convert', 'urine', 'convert', 'urine']);
  });
});

describe('NGN form composition', () => {
  it('each form has 4 standalone NGN items of varied formats', () => {
    for (const f of ['A', 'B'] as const) {
      expect(NGN_FORM[f]).toHaveLength(4);
      expect(new Set(NGN_FORM[f].map(i => i.fmt)).size).toBeGreaterThanOrEqual(3);
    }
  });
  it('all required interactive formats exist in the bank', () => {
    const fmts = new Set(ALL_ITEMS.map(i => i.fmt));
    ['mc', 'sata', 'order', 'numeric', 'matrix', 'cloze', 'bowtie', 'highlight', 'drag'].forEach(f => expect(fmts.has(f as never)).toBe(true));
    expect(ALL_ITEMS.some(i => i.fmt === 'sata' && i.scoring === 'plusminus')).toBe(true);
  });
});

beforeEach(() => { try { localStorage.clear(); } catch { /* */ } });
