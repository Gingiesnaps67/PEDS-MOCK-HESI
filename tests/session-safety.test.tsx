import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/ui/App';
import { defaultStore, exportJson } from '../src/engine/storage';
import { buildPractice } from '../src/engine/exam';
import { generate } from '../src/engine/dosage';
import { getItem } from '../src/data/bank';

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('safe session entry points', () => {
  it('rejects empty and invalid tutor counts, then starts a valid session', () => {
    render(<App initial={defaultStore()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Practice' }));
    const count = screen.getByRole('spinbutton', { name: 'Questions' });
    const start = screen.getByRole('button', { name: 'Start tutor session' }) as HTMLButtonElement;
    for (const value of ['', '0', '-1', '5.5', '61']) {
      fireEvent.change(count, { target: { value } });
      expect(start.disabled, value).toBe(true);
      fireEvent.click(start);
      expect(screen.queryByText(/Item 1 of/)).toBeNull();
    }
    fireEvent.change(count, { target: { value: '5' } });
    expect(start.disabled).toBe(false);
    fireEvent.click(start);
    expect(screen.getByText('Item 1 of 5')).toBeTruthy();
  });

  it('rejects empty and invalid dosage counts, then starts a valid session', () => {
    render(<App initial={defaultStore()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dosage' }));
    const count = screen.getByRole('spinbutton', { name: 'Problems' });
    const start = screen.getByRole('button', { name: 'Generate set' }) as HTMLButtonElement;
    for (const value of ['', '0', '-1', '3.5', '41']) {
      fireEvent.change(count, { target: { value } });
      expect(start.disabled, value).toBe(true);
      fireEvent.click(start);
      expect(screen.queryByText(/Item 1 of/)).toBeNull();
    }
    fireEvent.change(count, { target: { value: '3' } });
    expect(start.disabled).toBe(false);
    fireEvent.click(start);
    expect(screen.getByText('Item 1 of 3')).toBeTruthy();
  });

  it('offers a complete case instead of an empty tutor session for case-only misses', () => {
    const store = defaultStore();
    store.missed['CA1-1'] = { at: Date.now(), topics: [1], retried: 0 };
    render(<App initial={store} />);
    fireEvent.click(screen.getByRole('button', { name: 'Missed' }));
    expect((screen.getByRole('button', { name: 'Retry in tutor mode' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Your open misses are case-study questions/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Redo case CA1' }));
    expect(screen.getByText('Item 1 of 6')).toBeTruthy();
    expect(screen.getByText('Question 1 of 6')).toBeTruthy();
  });

  it('resumes imported generated dosage questions immediately without a reload', async () => {
    const imported = defaultStore();
    const generated = generate('convert', 760193, 0);
    expect(getItem(generated.id)).toBeUndefined();
    imported.active = {
      ...buildPractice('dosage', 'Imported dosage session', [getItem('A41')!], imported.settings, { tutor: true, timed: false }),
      slots: [{ itemId: generated.id, scored: true }],
      generated: [generated],
      responses: { [generated.id]: { kind: 'numeric', value: '12.3' } },
    };
    const { container } = render(<App initial={defaultStore()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    const file = new File([exportJson(imported)], 'progress.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => exportJson(imported) });
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } });
    await waitFor(() => expect(screen.getByText('Imported 0 sessions.')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'PEDS HESI 2026 dashboard' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue exam' }));
    expect(screen.getByText(generated.stem)).toBeTruthy();
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('12.3');
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText('Correct answer rationale')).toBeTruthy();
  });
});
