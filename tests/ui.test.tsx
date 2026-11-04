import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within, cleanup, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { App } from '../src/ui/App';
import { defaultStore } from '../src/engine/storage';
import { buildPractice, buildCase } from '../src/engine/exam';
import { getItem } from '../src/data/bank';
import type { Store, Item, ExamSettings } from '../src/types';

const S: ExamSettings = { navigation: 'free', minutes: 130, unscoredItems: false, confidence: false };
function withExam(items: string[], opts: { tutor?: boolean; timed?: boolean; nav?: 'free' | 'linear' } = {}): Store {
  const s = defaultStore();
  s.active = buildPractice('tutor', 'Test session', items.map(id => getItem(id) as Item), { ...S, navigation: opts.nav ?? 'free' }, { tutor: opts.tutor, timed: opts.timed ?? false });
  return s;
}
const openExam = () => fireEvent.click(screen.getAllByRole('button', { name: /continue exam/i })[0]);

beforeEach(() => { localStorage.clear(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('app shell', () => {
  it('renders the dashboard with the required entry points', () => {
    render(<App initial={defaultStore()} />);
    expect(screen.getByRole('heading', { name: 'PEDS HESI 2026' })).toBeTruthy();
    ['Start mock exam', 'Unfolding Cases', 'Adaptive Practice', 'Instructor Blueprint', 'Missed Questions', 'Dosage Calculations', 'Performance Analytics', 'Topic Mastery', 'Study Plan']
      .forEach(t => expect(screen.getAllByText(t).length).toBeGreaterThan(0));
  });
  it('starts a 60-item, 130-minute HESI simulation from setup', () => {
    render(<App initial={defaultStore()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start mock exam' }));
    fireEvent.click(screen.getByRole('button', { name: /HESI 1 practice \(Form A\)/ }));
    expect(screen.getByText('Item 1 of 60')).toBeTruthy();
    expect(screen.getByRole('timer').textContent).toContain('2:10:00');
  });
  it('blueprint lists all 69 topics', () => {
    render(<App initial={defaultStore()} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Blueprint' })[0]);
    const cards = document.querySelectorAll('.topic-card');
    expect(cards.length).toBe(69);
  });
});

describe('interactive question types', () => {
  it('MC: linear navigation requires an answer before Next', () => {
    render(<App initial={withExam(['A01', 'A02'], { nav: 'linear' })} />); openExam();
    const next = screen.getByRole('button', { name: /next/i }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.click(screen.getAllByRole('radio')[2]);
    expect(next.disabled).toBe(false);
  });
  it('5. drag and drop: tap a token then a blank places it; tapping a filled blank clears it', () => {
    render(<App initial={withExam(['NB3'])} />); openExam();
    fireEvent.click(screen.getByText('Low'));
    const blank = screen.getByRole('button', { name: /sodium is/ });
    fireEvent.click(blank);
    expect(blank.textContent).toBe('Low');
    fireEvent.click(blank);
    expect(blank.textContent).not.toBe('Low');
  });
  it('5b. ordered response: options move into the answer list and can be reordered', () => {
    render(<App initial={withExam(['A05'])} />); openExam();
    fireEvent.click(screen.getByRole('button', { name: /knee-chest position/ }));
    fireEvent.click(screen.getByRole('button', { name: /Call for assistance/ }));
    const rows = document.querySelectorAll('.order-row');
    expect(rows.length).toBe(2);
    fireEvent.click(within(rows[1] as HTMLElement).getByRole('button', { name: 'Move up' }));
    expect(document.querySelectorAll('.order-row')[0].textContent).toContain('Call for assistance');
  });
  it('6. highlight: clicking chart text toggles selection', () => {
    render(<App initial={withExam(['NA3'])} />); openExam();
    const seg = screen.getByRole('button', { name: /Swallowing about every 20 seconds/ });
    expect(seg.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(seg); expect(seg.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(seg); expect(seg.getAttribute('aria-pressed')).toBe('false');
  });
  it('7. bow-tie: one condition, at most two actions and two parameters', () => {
    render(<App initial={withExam(['NB2'])} />); openExam();
    fireEvent.click(screen.getByRole('button', { name: 'Autonomic dysreflexia' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sit the teen upright' }));
    fireEvent.click(screen.getByRole('button', { name: /Catheterize the bladder/ }));
    expect((screen.getByRole('button', { name: 'Lay flat and elevate the legs' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Autonomic dysreflexia' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('3. matrix: each row is independently selectable', () => {
    render(<App initial={withExam(['NA1'])} />); openExam();
    const a = screen.getByRole('radio', { name: /Fever for 6 days.*: Consistent/ });
    const b = screen.getByRole('radio', { name: /Thick yellow eye drainage: Not consistent/ });
    fireEvent.click(a); fireEvent.click(b);
    expect((a as HTMLInputElement).checked && (b as HTMLInputElement).checked).toBe(true);
  });
  it('4. cloze: blank opens a wrapping option list and records the choice', () => {
    render(<App initial={withExam(['NA4'])} />); openExam();
    const blank = screen.getByRole('button', { name: /Blank 1: not answered/ });
    fireEvent.click(blank);
    const list = screen.getByRole('listbox', { name: 'Options for blank 1' });
    fireEvent.click(within(list).getByRole('option', { name: 'shunt malfunction' }));
    expect(screen.getByRole('button', { name: /Blank 1: shunt malfunction/ })).toBeTruthy();
    expect(screen.queryByRole('listbox')).toBeNull();
  });
  it('every question shows a format instruction and an answer-status label', () => {
    render(<App initial={withExam(['A12', 'NB2'])} />); openExam();
    expect(document.querySelector('.instruction')!.textContent).toMatch(/Select all that apply/);
    expect(screen.getByRole('status').textContent).toBe('Not answered yet');
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(screen.getByRole('status').textContent).toBe('Answer saved');
  });
  it('tutor mode shows the rationale with a WHY? button after checking', () => {
    render(<App initial={withExam(['A11'], { tutor: true })} />); openExam();
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText('Correct answer rationale')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /WHY\?/ }));
    expect(document.querySelector('.why-box')).toBeTruthy();
  });
});

describe('unfolding case behaviour', () => {
  it('8. chart reveals later-stage data only when that stage is reached', () => {
    const s = defaultStore(); s.active = buildCase('CA1', S, false);
    render(<App initial={s} />); openExam();
    expect(screen.getByText('Question 1 of 6')).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: /Nurses/ }));
    expect(document.body.textContent).not.toContain('She stopped breathing');
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Question 3 of 6')).toBeTruthy();
    expect(document.body.textContent).toContain('She stopped breathing');
    expect(screen.getAllByText('NEW').length).toBeGreaterThan(0);
  });
});

describe('submission, results, timer', () => {
  it('10. submit shows a confirmation and then results with points', () => {
    render(<App initial={withExam(['A01', 'NA1'])} />); openExam();
    fireEvent.click(screen.getAllByRole('radio')[2]);
    fireEvent.click(screen.getByRole('button', { name: 'Submit…' }));
    expect(screen.getByText('Submit this exam?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Submit exam' }));
    expect(screen.getByText('Practice percentage')).toBeTruthy();
    expect(screen.getByText('1/8')).toBeTruthy();
  });
  it('9. timer expiry submits automatically (real clock)', async () => {
    const st = withExam(['A01', 'A02'], { timed: true });
    st.active!.remainingMs = 1500;
    render(<App initial={st} />); openExam();
    expect(screen.getByRole('timer').textContent).toContain('0:02');
    await waitFor(() => expect(screen.getByText(/Time expired/)).toBeTruthy(), { timeout: 5000 });
  }, 10000);
  it('11. answers persist to storage while the exam is running', () => {
    render(<App initial={withExam(['A01', 'A02'])} />); openExam();
    fireEvent.click(screen.getAllByRole('radio')[1]);
    fireEvent.click(screen.getByRole('button', { name: /Save and exit/ }));
    const saved = JSON.parse(localStorage.getItem('pedsHesi2026:store')!);
    expect(saved.active.responses.A01).toEqual({ kind: 'mc', choice: 1 });
  });
});

describe('15. basic accessibility and responsiveness', () => {
  it('every form control in each item type has an accessible name', () => {
    for (const id of ['A01', 'A12', 'A05', 'A41', 'NA1', 'NA2', 'NA3', 'NA4', 'NB3']) {
      cleanup();
      render(<App initial={withExam([id])} />); openExam();
      document.querySelectorAll('input, select, textarea').forEach(el => {
        const labelled = el.getAttribute('aria-label') || el.closest('label') || (el.id && document.querySelector(`label[for="${el.id}"]`));
        expect(labelled, `${id}: ${el.outerHTML.slice(0, 80)}`).toBeTruthy();
      });
      document.querySelectorAll('button').forEach(b => expect((b.textContent || b.getAttribute('aria-label') || '').trim().length, `${id} button`).toBeGreaterThan(0));
    }
  });
  it('stylesheet defines phone layouts, themes, reduced motion, and focus styles', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    expect(css).toMatch(/@media \(max-width: 980px\)/);
    expect(css).toMatch(/@media \(max-width: 640px\)/);
    expect(css).toMatch(/prefers-color-scheme: dark/);
    expect(css).toMatch(/prefers-reduced-motion/);
    expect(css).toMatch(/:focus-visible/);
    // only tables and charts (always inside .scroll-x containers) may be wider than a phone
    const wide = css.split('}').filter((r: string) => /min-width:\s*(4[1-9]\d|[5-9]\d\d|\d{4,})px/.test(r));
    wide.forEach((r: string) => expect(r.trim()).toMatch(/^(table|svg)\./));
  });
});
