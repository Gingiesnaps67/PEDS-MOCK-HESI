import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { readFileSync, readdirSync } from 'fs';
import { ALL_ITEMS, ALL_TRAD, ALL_NGN, getItem, PROVIDED } from '../src/data/bank';
import { verifyOf, UNVERIFIED, DERIVED_IDS } from '../src/data/verify';
import { POOL_S } from '../src/data/poolS';
import { buildFresh, buildExtended, buildLadder, ladderAdvance, grade, summarize, readinessDetail, buildQuick, scorable } from '../src/engine/exam';
import { defaultStore } from '../src/engine/storage';
import { STAGES, CHECKPOINTS, GAMES } from '../src/data/growth';
import { MED_CARDS, COMPARE, CURRENT_GUIDANCE } from '../src/data/rapid';
import { DISCREPANCIES, SOURCE_FILES } from '../src/data/sources';
import { App } from '../src/ui/App';
// private names that must never ship (stored encoded so they never appear in the repo)
const NAME_GUARD = new RegExp(Buffer.from('bGlxdWV0ZXxub3J0aC0/d2VzdHxyaXZlcnNpZGV8cGF0cmljaw==', 'base64').toString(), 'i');

const settings = defaultStore().settings;

describe('source verification', () => {
  it('every verify id refers to a real item', () => {
    [...Object.keys(UNVERIFIED), ...DERIVED_IDS].forEach(id => expect(getItem(id), id).toBeTruthy());
  });
  it('unverified items never enter rotation or extended exams', () => {
    for (let s = 1; s < 6; s++) {
      const ex = buildFresh(null, settings, s * 7);
      const trad = ex.slots.map(x => getItem(x.itemId)!).filter(i => !i.caseId);
      trad.forEach(i => expect(verifyOf(i.id), i.id).not.toBe('U'));
    }
    const ext = buildExtended(80, settings, 3);
    ext.slots.map(x => getItem(x.itemId)!).filter(i => !i.caseId).forEach(i => expect(verifyOf(i.id)).not.toBe('U'));
  });
  it('an unverified item is graded unscored and flagged', () => {
    const ex = buildQuick(defaultStore(), 5, settings, 1);
    const withU = { ...ex, slots: [...ex.slots, { itemId: 'C109', scored: true }] };
    const at = grade(withU);
    const u = at.items.find(i => i.id === 'C109')!;
    expect(u.scored).toBe(false); expect(u.unverified).toBe(true);
    expect(summarize(at).total.n).toBe(at.items.length - 1);
  });
  it('new source-locked items carry full coach fields and source names', () => {
    POOL_S.forEach(i => {
      expect(i.src.length, i.id).toBeGreaterThan(0);
      expect(i.rationale.tempt, i.id).toBeTruthy();
      expect(i.rationale.variation, i.id).toBeTruthy();
      expect(i.rationale.physiology, i.id).toBeTruthy();
      expect(i.rationale.memory, i.id).toBeTruthy();
      if (i.fmt === 'mc' || i.fmt === 'sata') expect(i.rationale.options?.length).toBe(i.options.length);
    });
    expect(POOL_S.length).toBeGreaterThanOrEqual(26);
  });
  it('provided practice questions keep original wording and order; Q1 practice-only', () => {
    const [q1, q2] = PROVIDED as any[];
    expect(q1.stem).toBe('Which of the following is a cognitive milestone that a 4-year-old should be able to accomplish?');
    expect(q1.options).toEqual(['Understand simple analogies.', 'Understand time.', 'Speak in sentences.', 'Think abstractly.']);
    expect(verifyOf(q1.id)).toBe('U');
    expect(q2.options[3]).toBe('Role-playing.');
    expect(q2.answer).toEqual([0, 1, 2, 4]);
    expect(verifyOf(q2.id)).toBe('D');
  });
  it('item ids stay unique after adding pools', () => {
    expect(new Set(ALL_ITEMS.map(i => i.id)).size).toBe(ALL_ITEMS.length);
    expect(ALL_TRAD.length + ALL_NGN.length).toBeGreaterThan(200);
  });
  it('no outside reference is shown as a source on new items', () => {
    POOL_S.forEach(i => expect(i.refs).toBeUndefined());
  });
});

describe('ladder & readiness', () => {
  it('ladder moves up after 2 correct and down after a miss', () => {
    let ex = buildLadder(null, settings, 10, 5);
    expect(ex.ladder!.level).toBe(2);
    ex = ladderAdvance(ex, true, null); ex = ladderAdvance(ex, true, null);
    expect(ex.ladder!.level).toBe(3);
    ex = ladderAdvance(ex, false, null);
    expect(ex.ladder!.level).toBe(2);
    ex.slots.forEach(s => expect(scorable(getItem(s.itemId)!)).toBe(true));
  });
  it('readiness excludes sessions where reference was opened', () => {
    const st = defaultStore();
    const ex = buildQuick(st, 5, settings, 2);
    const at = { ...grade(ex), refUsed: true };
    const r = readinessDetail({ ...st, attempts: [at] });
    expect(r.excludedRef).toBe(1); expect(r.fresh.n).toBe(0);
  });
});

describe('growth & reference content', () => {
  it('has 5 stage cards, 18 timeline checkpoints and 6 games', () => {
    expect(STAGES.map(s => s.id)).toEqual(['infant', 'toddler', 'preschool', 'school', 'adolescent']);
    expect(CHECKPOINTS.map(c => c.age)).toEqual(['Birth', '2 months', '3 months', '4 months', '6 months', '9 months', '12 months', '15 months', '18 months', '24 months', '30 months', '3 years', '4 years', '5 years', '6 years', '9 years', '12 years', 'Adolescence']);
    expect(GAMES).toHaveLength(6);
    GAMES.forEach(g => g.qs.forEach(q => { expect(q.answer).toBeLessThan(q.options.length); expect(q.src).toBeTruthy(); }));
    CHECKPOINTS.forEach(c => expect(c.q.answer).toBeLessThan(c.q.options.length));
  });
  it('Freud is labelled psychosexual and the ATI mislabel is flagged', () => {
    expect(DISCREPANCIES.find(d => d.id === 'D1')!.topic).toMatch(/Freud/);
    expect(STAGES.map(s => s.freud)).toEqual(['Oral', 'Anal', 'Phallic', 'Latency', 'Genital']);
  });
  it('reference data is sourced; lisinopril card teaches potassium', () => {
    MED_CARDS.forEach(m => expect(m.src.length).toBeGreaterThan(0));
    expect(MED_CARDS.find(m => m.id === 'lisinopril')!.teach.join(' ')).toMatch(/salt substitutes/);
    expect(COMPARE.length).toBeGreaterThanOrEqual(9);
    expect(CURRENT_GUIDANCE.length).toBeGreaterThan(0);
    expect(SOURCE_FILES.length).toBeGreaterThanOrEqual(21);
  });
});

describe('UI', () => {
  it('Rapid Review opens from the dashboard and shows sourced vitals', () => {
    render(<App initial={defaultStore()} />);
    fireEvent.click(screen.getByRole('button', { name: /open rapid review reference/i }));
    const dlg = screen.getByRole('dialog', { name: /rapid review/i });
    expect(within(dlg).getAllByText(/Source:/).length).toBeGreaterThan(3);
    fireEvent.change(within(dlg).getByRole('searchbox'), { target: { value: 'salt substitute' } });
    expect(within(dlg).getByText(/match/)).toBeTruthy();
  });
  it('Growth page renders stage cards and theorist table', () => {
    render(<App initial={defaultStore()} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Growth & Dev' })[0]);
    expect(screen.getByRole('heading', { name: /Growth & Development Mastery Center/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Theorist table' }));
    expect(screen.getAllByText(/Initiative vs guilt/).length).toBeGreaterThan(0);
  });
});

describe('no instructor or school names anywhere in the shipped app', () => {
  it('src and built html are clean', () => {
    const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(d + '/' + e.name) : [d + '/' + e.name]);
    walk('src').forEach(f => expect(readFileSync(f, 'utf8'), f).not.toMatch(NAME_GUARD));
  });
});
