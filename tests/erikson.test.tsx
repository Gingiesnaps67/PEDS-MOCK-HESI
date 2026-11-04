import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { STAGES, G3, G4, G5, ASSESS_EXTRA, rapidBank } from '../src/data/eriksonData';
import { defaultStore } from '../src/engine/storage';
import { App } from '../src/ui/App';

const openCenter = () => {
  render(<App initial={defaultStore()} />);
  fireEvent.click(screen.getByText('🧠 Erikson Mastery Center'));
  expect(screen.getByRole('heading', { name: /Erikson’s Psychosocial Development Mastery Center/ })).toBeTruthy();
};
const nav = (name: string) => fireEvent.click(within(screen.getByRole('tablist', { name: 'Erikson center sections' })).getByRole('tab', { name }));

describe('Erikson data', () => {
  it('five stages in order with source ages', () => {
    expect(STAGES.map(s => s.stage)).toEqual(['Trust vs. Mistrust', 'Autonomy vs. Shame and Doubt', 'Initiative vs. Guilt', 'Industry vs. Inferiority', 'Identity vs. Role Confusion']);
    expect(STAGES.map(s => s.ages)).toEqual(['Birth–1 year', '1–3 years', '3–6 years', '6–12 years', '12–18 years']);
    expect(STAGES[4].srcAges).toMatch(/12–20/);
  });
  it('every question has a key, an explanation for every option, a clue and a source', () => {
    [...G3, ...G4, ...G5, ...ASSESS_EXTRA].forEach(q => {
      expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(q.options.length);
      q.options.forEach(o => expect(o[1].length, q.id).toBeGreaterThan(5));
      expect(q.src.length, q.id).toBeGreaterThan(0); expect(q.clue).toBeTruthy();
    });
    expect(G4.every(q => !/erikson/i.test(q.prompt))).toBe(true);
    expect(new Set(G3.map(q => q.level))).toEqual(new Set([1, 2, 3]));
    expect(rapidBank().length).toBeGreaterThan(30);
  });
});

describe('Erikson games', () => {
  it('Game 1: arrange with buttons, check, correct, record progress', () => {
    openCenter(); nav('1 · Order');
    const list = () => screen.getByRole('list', { name: /current order/ });
    for (let target = 0; target < 5; target++) {
      const cards = within(list()).getAllByRole('listitem');
      const idx = cards.findIndex(li => li.textContent!.includes(STAGES[target].stage));
      for (let k = idx; k > target; k--) fireEvent.click(screen.getByRole('button', { name: `Move ${STAGES[target].stage} up` }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Check my order' }));
    expect(screen.getByText('Perfect order!')).toBeTruthy();
    nav('📊 Progress');
    expect(screen.getAllByText(/100%/).length).toBeGreaterThanOrEqual(5);
  });
  it('Game 2: tap-to-pair all five and get explanations', () => {
    openCenter(); nav('2 · Age match');
    STAGES.forEach(s => {
      fireEvent.click(within(screen.getByLabelText('Age groups')).getByText(s.group).closest('button')!);
      fireEvent.click(within(screen.getByLabelText('Erikson stages')).getByText(s.stage).closest('button')!);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check matches' }));
    expect(screen.getByText('5 of 5 correct.')).toBeTruthy();
  });
  it('Games 3–5: answers hidden until submit, then every option explained', () => {
    for (const g of ['3 · Conflict', '4 · Scenario', '5 · Intervention']) {
      openCenter(); nav(g);
      expect(screen.queryAllByText(/^✓ |^✗ /).length).toBe(0);
      const opts = within(screen.getByRole('radiogroup', { name: 'Answer choices' })).getAllByRole('radio');
      fireEvent.click(opts[0]);
      fireEvent.click(screen.getByRole('radio', { name: '4 — Confident' }));
      fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
      expect(screen.getAllByText(/^[✓✗] /).length).toBe(opts.length);
      expect(screen.getByText(/Key clue/)).toBeTruthy();
      document.body.innerHTML = '';
    }
  });
  it('Game 6 and final assessment run', () => {
    openCenter(); nav('6 · 60-sec recall');
    fireEvent.click(screen.getByRole('button', { name: 'Untimed practice' }));
    fireEvent.click(document.querySelector('.rr-btn') as HTMLElement);
    expect(screen.getByRole('status')).toBeTruthy();
    nav('🏁 Final 15');
    expect(screen.getByText('1/15')).toBeTruthy();
    for (let i = 0; i < 15; i++) {
      fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Answer choices' })).getAllByRole('radio')[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
      fireEvent.click(screen.getByRole('button', { name: i < 14 ? 'Next question' : 'See results' }));
    }
    expect(screen.getByText(/mastery target 85%/)).toBeTruthy();
  });
});
