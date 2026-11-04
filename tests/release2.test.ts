import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_ITEMS, ALL_TRAD, ALL_NGN, CASES, POOL_C, getItem } from '../src/data/bank';
import { validateCase, validateItem } from '../src/engine/validate';
import { buildFresh, buildExtended, grade, applyAttempt, HESI_SPEC, pickStratified, scorable } from '../src/engine/exam';
import { defaultStore } from '../src/engine/storage';
import { rng } from '../src/engine/dosage';
import { buildPdf } from '../src/ui/pdf';
import type { ExamSettings, MCItem } from '../src/types';
// private names that must never ship (stored encoded so they never appear in the repo)
const NAME_GUARD = new RegExp(Buffer.from('bGlxdWV0ZXxub3J0aC0/d2VzdHxyaXZlcnNpZGV8cGF0cmljaw==', 'base64').toString(), 'i');

const S: ExamSettings = { navigation: 'linear', minutes: 130, unscoredItems: true, confidence: false };

describe('bank size and coverage targets', () => {
  it('has at least 300 reviewed items', () => {
    expect(ALL_ITEMS.length).toBeGreaterThanOrEqual(300);
    expect(ALL_ITEMS.every(i => i.qa === 'reviewed')).toBe(true);
  });
  it('every one of the 69 topics has at least 4 items', () => {
    for (let t = 1; t <= 69; t++) expect(ALL_ITEMS.filter(i => i.topics.includes(t)).length, `topic ${t}`).toBeGreaterThanOrEqual(4);
  });
  it('has 16 complete six-question cases that pass consistency checks', () => {
    expect(CASES).toHaveLength(16);
    CASES.forEach(c => expect(validateCase(c), c.id).toEqual([]));
  });
  it('every item passes schema validation', () => {
    expect(ALL_ITEMS.flatMap(i => validateItem(i))).toEqual([]);
  });
  it('difficulty mix sits near the design targets', () => {
    const n = ALL_ITEMS.length;
    const share = (d: number) => ALL_ITEMS.filter(i => i.diff === d).length / n;
    expect(share(1)).toBeGreaterThanOrEqual(0.09); expect(share(1)).toBeLessThanOrEqual(0.16);
    expect(share(2)).toBeGreaterThanOrEqual(0.28); expect(share(2)).toBeLessThanOrEqual(0.37);
    expect(share(3)).toBeGreaterThanOrEqual(0.33); expect(share(3)).toBeLessThanOrEqual(0.42);
    expect(share(4)).toBeGreaterThanOrEqual(0.13); expect(share(4)).toBeLessThanOrEqual(0.21);
  });
  it('rotation-pool answer keys are spread across positions and notes stay aligned', () => {
    const pos = [0, 0, 0, 0];
    POOL_C.filter(i => i.fmt === 'mc').forEach(i => { const m = i as MCItem; pos[m.answer]++; expect(m.rationale.options![m.answer]).toBe(''); });
    pos.forEach(p => expect(p).toBeGreaterThanOrEqual(15));
  });
});

describe('rotation', () => {
  it('a fresh simulation has the published structure', () => {
    const ex = buildFresh(defaultStore(), S, 3);
    const items = ex.slots.map(s => getItem(s.itemId)!);
    expect(ex.slots).toHaveLength(HESI_SPEC.total);
    expect(new Set(ex.slots.map(s => s.itemId)).size).toBe(60);
    expect(items.filter(i => !i.caseId && !i.ngn)).toHaveLength(44);
    expect(items.filter(i => i.caseId)).toHaveLength(12);
    expect(items.filter(i => i.ngn && !i.caseId)).toHaveLength(4);
    expect(ex.slots.filter(s => !s.scored)).toHaveLength(2);
    expect(new Set(items.filter(i => i.caseId).map(i => i.caseId)).size).toBe(2);
  });
  it('covers every body system in each simulation', () => {
    const ex = buildFresh(defaultStore(), S, 9);
    const cats = new Set(ex.slots.map(s => getItem(s.itemId)!).filter(i => !i.caseId && !i.ngn).map(i => i.topics[0]));
    expect(cats.size).toBeGreaterThan(30);
  });
  it('consecutive simulations use substantially new questions and different cases', () => {
    let store = defaultStore();
    const seen: Set<string>[] = [];
    const caseSets: string[][] = [];
    for (let k = 0; k < 5; k++) {
      const ex = buildFresh(store, S, 100 + k);
      seen.push(new Set(ex.slots.map(s => s.itemId)));
      caseSets.push([...new Set(ex.slots.map(s => getItem(s.itemId)!.caseId).filter(Boolean) as string[])]);
      const at = { ...grade(ex), finishedAt: Date.now() + k * 1000 };
      store = applyAttempt(store, at);
    }
    for (let k = 1; k < 5; k++) {
      const overlap = [...seen[k]].filter(id => seen[k - 1].has(id) && !getItem(id)!.caseId).length;
      expect(overlap, `exam ${k + 1} vs ${k}`).toBeLessThanOrEqual(4);
      expect(caseSets[k].filter(c => caseSets[k - 1].includes(c))).toEqual([]);
    }
    // Use the complete verified pool before repeating cases; mixed/unverified
    // cases are reserved for case practice and cannot fill the rotation quota.
    const eligibleCases = CASES.filter(c => c.items.every(scorable));
    expect(new Set(caseSets.flat()).size).toBe(Math.min(10, eligibleCases.length));
  });
  it('stratified picker returns unique items', () => {
    const p = pickStratified(ALL_TRAD, 44, null, rng(1));
    expect(new Set(p.map(i => i.id)).size).toBe(44);
  });
  it('extended exam: 4 cases, 8 NGN, count respected', () => {
    const ex = buildExtended(90, S, 5, defaultStore());
    const items = ex.slots.map(s => getItem(s.itemId)!);
    expect(ex.slots).toHaveLength(90);
    expect(items.filter(i => i.caseId)).toHaveLength(24);
    expect(items.filter(i => i.ngn && !i.caseId)).toHaveLength(8);
    expect(ALL_NGN.length).toBeGreaterThanOrEqual(20);
  });
});

describe('PDF report', () => {
  it('builds a valid multi-section PDF', async () => {
    const mod = await import('jspdf');
    (window as unknown as { jspdf: unknown }).jspdf = { jsPDF: mod.jsPDF };
    const ex = buildFresh(defaultStore(), S, 4);
    const blob = await buildPdf(grade(ex));
    const buf: ArrayBuffer = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result as ArrayBuffer); fr.onerror = rej; fr.readAsArrayBuffer(blob); });
    const head = String.fromCharCode(...new Uint8Array(buf).slice(0, 5));
    expect(head).toBe('%PDF-');
    expect(blob.size).toBeGreaterThan(5000);
  }, 20000);
});

describe('name removal', () => {
  const walk = (d: string): string[] => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  it('no instructor or school names anywhere in the app source', () => {
    const files = [...walk('src'), 'index.html'];
    const hits = files.filter(f => NAME_GUARD.test(readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });
});
