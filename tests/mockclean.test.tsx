import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from '../src/ui/App';
import { defaultStore } from '../src/engine/storage';
import { buildPractice, buildFresh, grade, summarize } from '../src/engine/exam';
import { getItem, ALL_ITEMS, CASES } from '../src/data/bank';
import { cleanText, cleanItem, isMock } from '../src/ui/examClean';
import type { Store, Item, ExamSettings } from '../src/types';

// 11/03 Mock Exam cleanup: no citations or lecture attributions on mock-exam screens; everything else unchanged
const S: ExamSettings = { navigation: 'free', minutes: 130, unscoredItems: false, confidence: false };
const IDS = ['A05', 'V04', 'V12', 'A01', 'NA1'];
const BAD = /lecture|instructor|professor|textbook|\bATI\b|PowerPoint|review #|Source mapping|Sources:|\bCh\d\d\b|course sources|Table 31\.3/i;
function withKind(kind: string): Store {
  const s = defaultStore();
  s.active = { ...buildPractice('tutor', 'Mock exam', IDS.map(id => getItem(id) as Item), S, { timed: false }), kind } as Store['active'];
  return s;
}
const openExam = () => fireEvent.click(screen.getAllByRole('button', { name: /continue exam/i })[0]);
function finishAndOpenAll() {
  fireEvent.click(screen.getByRole('button', { name: 'Submit…' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit exam' }));
  fireEvent.click(screen.getByRole('tab', { name: 'All' }));
}
/** expands each question review in turn (one opens at a time) and returns all text seen */
function eachReview(): string[] {
  const out: string[] = [];
  const n = document.querySelectorAll('.qrow-head').length;
  for (let i = 0; i < n; i++) {
    const b = document.querySelectorAll('.qrow-head')[i];
    if (b.getAttribute('aria-expanded') !== 'true') fireEvent.click(b);
    out.push(document.querySelector('main')!.textContent!);
  }
  return out;
}
beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe('mock exam presentation cleanup', () => {
  it('fixture items really do carry citations in the raw data', () => {
    expect(getItem('A05')!.stem).toMatch(/instructor/);
    expect(getItem('V12')!.stem).toMatch(/Textbook/);
  });
  it('active mock exam screens show no citations', () => {
    render(<App initial={withKind('hesi')} />); openExam();
    for (let i = 0; i < IDS.length; i++) {
      expect(document.querySelector('main')!.textContent!, IDS[i]).not.toMatch(BAD);
      if (i < IDS.length - 1) fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
  });
  it('results and every expanded question review show no citations, but keep answers and rationales', () => {
    render(<App initial={withKind('formA')} />); openExam();
    finishAndOpenAll();
    const all = eachReview();
    expect(all.length).toBe(IDS.length);
    all.forEach((t, i) => { expect(t, IDS[i]).not.toMatch(BAD); expect(t).toContain('Correct answer rationale'); });
    const txt = all.join(' ');
    expect(txt).toContain('Correct answer rationale');
    expect(txt).toContain('Your answer');
    expect(txt).toContain('Correct answer');
    expect(txt).toContain('Why each choice is right or wrong');
    expect(screen.getByText('Practice percentage')).toBeTruthy();
    expect(document.querySelector('.vbadge')).toBeNull();
  });
  it('non-mock sessions still show the source mapping', () => {
    render(<App initial={withKind('tutor')} />); openExam();
    finishAndOpenAll();
    const all = eachReview().join(' ');
    expect(all).toContain('Source mapping');
    expect(all).toMatch(/Instructor review #/);
  });
  it('cleaning never changes ids, keys, scoring or the item count', () => {
    ALL_ITEMS.forEach(raw => {
      const c = cleanItem(raw) as any, r = raw as any;
      ['id', 'fmt', 'answer', 'condition', 'actionAnswer', 'paramAnswer', 'tolerance', 'decimals', 'scoring', 'topics', 'diff', 'cj', 'src', 'caseId', 'stage'].forEach(k => expect(c[k], raw.id + k).toEqual(r[k]));
      ['options', 'rows', 'columns', 'pool', 'slots', 'segments', 'blanks'].forEach(k => r[k] && expect(c[k].length, raw.id + k).toBe(r[k].length));
      if (r.segments) r.segments.forEach((s: any, i: number) => expect(c.segments[i].key).toBe(s.key));
      if (r.blanks) r.blanks.forEach((b: any, i: number) => expect(c.blanks[i].answer).toBe(b.answer));
      expect(raw.rationale.correct.length).toBeGreaterThan(0);
      expect(c.rationale.correct.length, raw.id).toBeGreaterThan(0);
    });
    const ex = buildFresh(null, S, 11);
    expect(isMock(ex.kind)).toBe(true);
    expect(ex.slots.length).toBe(60);
    const at = grade(ex);
    expect(summarize(at).total.possible).toBeGreaterThan(0);
  });
  it('no displayed mock-exam text keeps a lecture or source attribution', () => {
    const bad = /lecture|instructor|professor|textbook|\bATI\b|PowerPoint|review #|\bCh\d\d\b|your sources/i;
    const left: string[] = [];
    const walk = (v: unknown, id: string, k = '') => {
      if (['src', 'refs', 'id', 'qa'].includes(k)) return;
      if (typeof v === 'string') { if (bad.test(v)) left.push(id + ': ' + v); }
      else if (Array.isArray(v)) v.forEach(x => walk(x, id));
      else if (v && typeof v === 'object') Object.entries(v).forEach(([kk, x]) => walk(x, id, kk));
    };
    ALL_ITEMS.forEach(i => walk(cleanItem(i), i.id));
    CASES.forEach(c => walk(cleanItem(c), c.id));
    expect(left).toEqual([]);
  });
  it('rewrites read naturally', () => {
    expect(cleanText('Lecture 9/30: give oxygen first.')).toBe('Give oxygen first.');
    expect(cleanText('Keep the HOB up (ATI Ch9).')).toBe('Keep the HOB up.');
    expect(cleanText('No citation here.')).toBe('No citation here.');
    expect(cleanText('  spacing ')).toBe('  spacing ');
  });
});
