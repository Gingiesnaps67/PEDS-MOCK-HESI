import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AGE_OPTIONS, WEIGHT_ROWS, ruleEstimate, groupOf, BP_AVG, GROUPS, lbToKg } from '../src/data/vitalsGrowth';
import { POOL_V } from '../src/data/poolV';
import { getItem } from '../src/data/bank';
import { verifyOf } from '../src/data/verify';
import { scoreItem } from '../src/engine/scoring';
import { defaultStore } from '../src/engine/storage';
import { recordVG } from '../src/ui/VitalsGrowth';
import { App } from '../src/ui/App';

describe('vital signs & growth data', () => {
  it('covers birth, every month to 12, 18 months, and each year to 17', () => {
    expect(AGE_OPTIONS.map(a => a.key)).toEqual(['birth', ...Array.from({ length: 12 }, (_, i) => `${i + 1}m`), '18m', ...Array.from({ length: 16 }, (_, i) => `${i + 2}y`)]);
    const want = ['birth', ...Array.from({ length: 12 }, (_, i) => `${i + 1}m`), '18m', ...Array.from({ length: 16 }, (_, i) => `${i + 2}y`)];
    expect(WEIGHT_ROWS.map(w => w.key)).toEqual(want);
  });
  it('age groups follow the requested bands and ATI HR/RR', () => {
    expect(groupOf(0).id).toBe('newborn'); expect(groupOf(11).id).toBe('infant'); expect(groupOf(24).id).toBe('toddler');
    expect(groupOf(48).id).toBe('preschool'); expect(groupOf(144).id).toBe('school'); expect(groupOf(15 * 12).id).toBe('adolescent');
    expect(GROUPS.map(g => g.hr)).toEqual(['110–160', '90–160', '80–140', '70–120', '60–110', '50–100']);
    expect(GROUPS.map(g => g.rr)).toEqual(['30–60', '25–60', '25–30', '20–25', '20–25', '16–20']);
    expect(BP_AVG.map(b => b.bp)).toEqual(['70/50', '90/60', '96/68', '100/70', '105/70', '108/70', '110/70', '120/70']);
  });
  it('rule estimates double by 6 months and triple by 12; none for older children', () => {
    expect(ruleEstimate(7, 6)!.high).toBe(16);
    expect(ruleEstimate(7, 6)!.low).toBe(16);
    expect(ruleEstimate(6, 12)!.low).toBeLessThanOrEqual(18); expect(ruleEstimate(6, 12)!.high).toBeGreaterThanOrEqual(18);
    expect(ruleEstimate(7, 60)).toBeNull();
    expect(lbToKg(22)).toBe(10);
  });
  it('no male/female numeric norms are invented', () => {
    WEIGHT_ROWS.forEach(w => expect(w.rule).not.toMatch(/median|boys? \d|girls? \d/i));
  });
});
describe('pool V questions', () => {
  it('are registered, keyed and fully explained', () => {
    POOL_V.forEach(i => {
      expect(getItem(i.id), i.id).toBeTruthy();
      expect(verifyOf(i.id)).not.toBe('U');
      expect(i.rationale.tempt && i.rationale.variation && i.rationale.physiology && i.rationale.memory, i.id).toBeTruthy();
    });
    const v9 = getItem('V09')!; expect(scoreItem(v9, { kind: 'numeric', value: '1' } as any).full).toBe(true);
    const v1 = getItem('V01')!; expect(scoreItem(v1, { kind: 'numeric', value: '9.6' } as any).full).toBe(true);
  });
});
describe('progress', () => {
  it('first attempts and retests are tracked separately', () => {
    let s = defaultStore();
    s = recordVG(s, 'x', 'hr', false); s = recordVG(s, 'x', 'hr', true);
    expect(s.rapid.games['vgf:hr']).toMatchObject({ n: 1, correct: 0 });
    expect(s.rapid.games['vgr:hr']).toMatchObject({ n: 1, correct: 1 });
    expect(s.rapid.cards['vg:x'].step).toBe(1);
  });
});
describe('UI', () => {
  it('opens the center, age view, weight chart and a game', () => {
    render(<App initial={defaultStore()} />);
    fireEvent.click(screen.getByText(/Vital Signs & Growth 0–17/));
    expect(screen.getByRole('heading', { name: /Peds Vital Signs & Growth/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Age view' }));
    fireEvent.change(screen.getByLabelText('Choose an age'), { target: { value: '29' } });
    expect(screen.getAllByText(/17 years/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('tab', { name: /Weight & growth/ }));
    expect(screen.getAllByText('Not in your sources').length).toBe(30);
    fireEvent.click(screen.getByRole('tab', { name: 'Games' }));
    fireEvent.click(screen.getByText('Peds Dosage Calculation'));
    const opts = screen.getByRole('group', { name: 'Answer choices' }).querySelectorAll('button');
    fireEvent.click(opts[0]);
    expect(screen.getByRole('status')).toBeTruthy();
  });
});
