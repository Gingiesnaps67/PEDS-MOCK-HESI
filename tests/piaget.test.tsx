import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { explainWrong, STAGES, BANK, SCENARIOS, MATCH, CARDS, COMPARES, AGES, stageAt } from '../src/data/piagetData';
import { levelOf } from '../src/ui/Piaget';
import { defaultStore } from '../src/engine/storage';
import { App } from '../src/ui/App';

const open = () => { render(<App initial={defaultStore()} />); fireEvent.click(screen.getByText('💡 Piaget Cognitive Center')); expect(screen.getByRole('heading', { name: /Piaget’s Cognitive Development/ })).toBeTruthy(); };
const nav = (n: string) => fireEvent.click(within(screen.getByRole('tablist', { name: 'Piaget sections' })).getByRole('tab', { name: n }));
const answerFirstAndSubmit = () => { const g = screen.queryByRole('radiogroup', { name: 'Answer choices' }) ?? screen.getByRole('group', { name: 'Answer choices' }); fireEvent.click(g.querySelectorAll('button')[0]); fireEvent.click(screen.getByRole('button', { name: 'Submit' })); };

describe('Piaget data', () => {
  it('stages, ages and boundaries', () => {
    expect(STAGES.map(s => [s.name, s.ages])).toEqual([['Sensorimotor', 'Birth–2 years'], ['Preoperational', 'About 2–7 years'], ['Concrete Operational', 'About 7–11 years'], ['Formal Operational', 'About 11–12 years onward']]);
    expect(stageAt(0.75)).toBe('sensorimotor'); expect(stageAt(4)).toBe('preoperational'); expect(stageAt(5)).toBe('preoperational'); expect(stageAt(9)).toBe('concrete'); expect(stageAt(16)).toBe('formal');
    expect(AGES[0].label).toBe('Newborn'); expect(AGES[AGES.length - 1].label).toBe('17 years');
  });
  it('40-question bank with the requested distribution, formats and complete explanations', () => {
    const c = (st: string) => BANK.filter(b => b.stage === st).length;
    expect([c('sensorimotor'), c('preoperational'), c('concrete'), c('formal'), c('mixed')]).toEqual([8, 10, 8, 8, 6]);
    expect(new Set(BANK.map(b => b.id)).size).toBe(40);
    const app = BANK.filter(b => ['case', 'priority', 'correction', 'sata'].includes(b.fmt)).length;
    expect(app).toBeGreaterThanOrEqual(20);
    expect(new Set(BANK.map(b => b.fmt))).toEqual(new Set(['mc', 'sata', 'case', 'identify', 'priority', 'correction']));
    BANK.forEach(b => {
      b.answer.forEach(a => expect(a).toBeLessThan(b.options.length));
      b.options.forEach((o, i) => { if (!b.answer.includes(i) && b.fmt !== 'correction') expect(explainWrong(o[0], o[1]).length, b.id + i).toBeGreaterThan(12); });
      expect(b.rationale && b.memory && b.src.length).toBeTruthy();
    });
    expect(SCENARIOS).toHaveLength(12); expect(MATCH.length).toBeGreaterThanOrEqual(20); expect(CARDS).toHaveLength(12); expect(COMPARES).toHaveLength(6);
    SCENARIOS.forEach(s => expect(s.options).toHaveLength(4));
  });
  it('object permanence and conservation are never confused', () => {
    expect(CARDS.find(c => c.id === 'objectPermanence')!.stage).toBe('sensorimotor');
    expect(CARDS.find(c => c.id === 'conservation')!.stage).toBe('concrete');
  });
  it('mastery needs repeated correct answers across formats', () => {
    expect(levelOf({ n: 1, correct: 1, formats: 1 })).toBe('Developing');
    expect(levelOf({ n: 3, correct: 3, formats: 1 })).toBe('Developing');
    expect(levelOf({ n: 4, correct: 4, formats: 2 })).toBe('Mastered');
    expect(levelOf({ n: 5, correct: 1, formats: 1 })).toBe('Needs Review');
  });
});

describe('Piaget UI', () => {
  it('timeline slider and Test My Understanding', () => {
    open();
    fireEvent.change(screen.getByLabelText('Age slider'), { target: { value: String(AGES.findIndex(a => a.key === '9y')) } });
    expect(screen.getByText('AGE: 9 YEARS')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '5y' }));
    expect(screen.getByText(/still typically preschool/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Test My Understanding' }));
    answerFirstAndSubmit();
    expect(screen.getByRole('status')).toBeTruthy();
  });
  it('experiment lab: pour and answer conservation; try again resets', () => {
    open(); nav('🔬 Experiment lab');
    fireEvent.click(screen.getByRole('tab', { name: 'B · Conservation of liquid' }));
    fireEvent.click(screen.getByRole('button', { name: /Pour B/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Both contain the same' }));
    expect(screen.getByText(/Both contain the same amount/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(screen.queryByText(/Both contain the same amount/)).toBeNull();
  });
  it('practice bank, match, flashcards, simulator, crash course, mastery + weaknesses', () => {
    open(); nav('📝 40-Q bank');
    fireEvent.click(screen.getByRole('button', { name: /All 40/ }));
    answerFirstAndSubmit(); expect(screen.getByText(/Correct answer:/)).toBeTruthy();
    nav('🧩 Match');
    fireEvent.click(within(screen.getByRole('group', { name: 'Choose a stage' })).getAllByRole('button')[0]);
    expect(screen.getByRole('status')).toBeTruthy();
    nav('🃏 Flashcards');
    fireEvent.click(screen.getByRole('button', { name: /Card front/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Need Practice' }));
    nav('🩺 Clinical sim');
    fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Nursing actions' })).getAllByRole('radio')[0]);
    fireEvent.click(screen.getByRole('button', { name: /Challenge Me/ }));
    expect(screen.getByText('Challenge')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Two-Minute Crash Course/ }));
    expect(screen.getByText(/knowing the answer is different/)).toBeTruthy();
    nav('📊 Mastery');
    expect(screen.getByText(/By stage/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Study My Weaknesses/ }));
    expect(screen.getByText('Study My Weaknesses')).toBeTruthy();
  });
});
