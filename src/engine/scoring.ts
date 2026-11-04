import type { Item, Response, Score } from '../types';

export function emptyResponse(item: Item): Response {
  switch (item.fmt) {
    case 'mc': return { kind: 'mc', choice: null };
    case 'sata': return { kind: 'sata', choices: [] };
    case 'order': return { kind: 'order', order: [] };
    case 'numeric': return { kind: 'numeric', value: '' };
    case 'matrix': return { kind: 'matrix', rows: item.rows.map(() => null) };
    case 'cloze': return { kind: 'cloze', blanks: item.blanks.map(() => null) };
    case 'bowtie': return { kind: 'bowtie', condition: null, actions: [], params: [] };
    case 'highlight': return { kind: 'highlight', selected: [] };
    case 'drag': return { kind: 'drag', slots: item.slots.map(() => null) };
  }
}

/** true when the student has given a complete answer (used for linear navigation and "unanswered" counts) */
export function isAnswered(item: Item, r: Response | undefined): boolean {
  if (!r) return false;
  switch (r.kind) {
    case 'mc': return r.choice !== null;
    case 'sata': return r.choices.length > 0;
    case 'order': return item.fmt === 'order' && r.order.length === item.options.length;
    case 'numeric': return r.value.trim() !== '' && !Number.isNaN(Number(r.value));
    case 'matrix': return r.rows.every(x => x !== null);
    case 'cloze': return r.blanks.every(x => x !== null);
    case 'bowtie': return r.condition !== null && r.actions.length === 2 && r.params.length === 2;
    case 'highlight': return r.selected.length > 0;
    case 'drag': return r.slots.every(x => x !== null);
  }
}

export const SCORING_LABEL: Record<string, string> = {
  dichotomous: 'All-or-nothing (1 point only when the whole answer is correct)',
  plusminus: 'Plus/minus (+1 for each correct choice, −1 for each incorrect choice, never below 0)',
  perElement: 'Per element (1 point for each row, blank, slot, or bow-tie box answered correctly)',
};

export function scoringRuleOf(item: Item): Score['rule'] {
  switch (item.fmt) {
    case 'mc': case 'order': case 'numeric': return 'dichotomous';
    case 'sata': return item.scoring;
    case 'highlight': return 'plusminus';
    default: return 'perElement';
  }
}

export function possiblePoints(item: Item): number {
  switch (item.fmt) {
    case 'mc': case 'order': case 'numeric': return 1;
    case 'sata': return item.scoring === 'plusminus' ? item.answer.length : 1;
    case 'matrix': return item.rows.length;
    case 'cloze': return item.blanks.length;
    case 'bowtie': return 5;
    case 'highlight': return item.segments.filter(s => s.key === true).length;
    case 'drag': return item.slots.length;
  }
}

const sameSet = (a: number[], b: number[]) => a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);

export function scoreItem(item: Item, r: Response | undefined): Score {
  const possible = possiblePoints(item);
  const rule = scoringRuleOf(item);
  let earned = 0;
  if (r) {
    switch (item.fmt) {
      case 'mc':
        if (r.kind === 'mc') earned = r.choice === item.answer ? 1 : 0; break;
      case 'sata':
        if (r.kind === 'sata') {
          if (item.scoring === 'dichotomous') earned = sameSet(r.choices, item.answer) ? 1 : 0;
          else {
            const plus = r.choices.filter(c => item.answer.includes(c)).length;
            const minus = r.choices.filter(c => !item.answer.includes(c)).length;
            earned = Math.max(0, plus - minus);
          }
        }
        break;
      case 'order':
        if (r.kind === 'order') earned = r.order.length === item.answer.length && r.order.every((v, i) => v === item.answer[i]) ? 1 : 0; break;
      case 'numeric':
        if (r.kind === 'numeric' && r.value.trim() !== '') {
          const v = Number(r.value.replace(/,/g, ''));
          earned = Number.isFinite(v) && Math.abs(v - item.answer) <= item.tolerance + 1e-9 ? 1 : 0;
        }
        break;
      case 'matrix':
        if (r.kind === 'matrix') earned = item.answer.filter((a, i) => r.rows[i] === a).length; break;
      case 'cloze':
        if (r.kind === 'cloze') earned = item.blanks.filter((b, i) => r.blanks[i] === b.answer).length; break;
      case 'bowtie':
        if (r.kind === 'bowtie') {
          earned = (r.condition === item.condition ? 1 : 0)
            + r.actions.slice(0, 2).filter(a => item.actionAnswer.includes(a)).length
            + r.params.slice(0, 2).filter(p => item.paramAnswer.includes(p)).length;
        }
        break;
      case 'highlight':
        if (r.kind === 'highlight') {
          const plus = r.selected.filter(i => item.segments[i]?.key === true).length;
          const minus = r.selected.filter(i => item.segments[i]?.key === false).length;
          earned = Math.max(0, plus - minus);
        }
        break;
      case 'drag':
        if (r.kind === 'drag') earned = item.answer.filter((a, i) => r.slots[i] === a).length; break;
    }
  }
  return { earned, possible, rule, full: earned === possible };
}

/** text form of the keyed answer, for review screens */
export function keyText(item: Item): string[] {
  switch (item.fmt) {
    case 'mc': return [item.options[item.answer]];
    case 'sata': return item.answer.map(i => item.options[i]);
    case 'order': return item.answer.map((i, n) => `${n + 1}. ${item.options[i]}`);
    case 'numeric': return [`${item.answer} ${item.unit}`];
    case 'matrix': return item.rows.map((row, i) => `${row} → ${item.columns[item.answer[i]]}`);
    case 'cloze': return item.blanks.map((b, i) => `Blank ${i + 1}: ${b.options[b.answer]}`);
    case 'bowtie': return [`Condition: ${item.conditions[item.condition]}`, ...item.actionAnswer.map(a => `Action: ${item.actions[a]}`), ...item.paramAnswer.map(p => `Monitor: ${item.params[p]}`)];
    case 'highlight': return item.segments.filter(s => s.key === true).map(s => s.text);
    case 'drag': return item.slots.map((s, i) => `${s} → ${item.pool[item.answer[i]]}`);
  }
}

export function responseText(item: Item, r: Response | undefined): string[] {
  if (!r) return ['(no answer)'];
  if (r.kind === 'order' && r.order.length === 0) return ['(no answer)'];
  if (r.kind === 'numeric' && r.value.trim() === '') return ['(no answer)'];
  switch (item.fmt) {
    case 'mc': return r.kind === 'mc' && r.choice !== null ? [item.options[r.choice]] : ['(no answer)'];
    case 'sata': return r.kind === 'sata' && r.choices.length ? r.choices.map(i => item.options[i]) : ['(no answer)'];
    case 'order': return r.kind === 'order' ? r.order.map((i, n) => `${n + 1}. ${item.options[i]}`) : [];
    case 'numeric': return r.kind === 'numeric' ? [`${r.value} ${item.unit}`] : [];
    case 'matrix': return r.kind === 'matrix' ? item.rows.map((row, i) => `${row} → ${r.rows[i] === null ? '—' : item.columns[r.rows[i] as number]}`) : [];
    case 'cloze': return r.kind === 'cloze' ? item.blanks.map((b, i) => `Blank ${i + 1}: ${r.blanks[i] === null ? '—' : b.options[r.blanks[i] as number]}`) : [];
    case 'bowtie': return r.kind === 'bowtie' ? [`Condition: ${r.condition === null ? '—' : item.conditions[r.condition]}`, ...r.actions.map(a => `Action: ${item.actions[a]}`), ...r.params.map(p => `Monitor: ${item.params[p]}`)] : [];
    case 'highlight': return r.kind === 'highlight' && r.selected.length ? r.selected.map(i => item.segments[i]?.text ?? '') : ['(nothing highlighted)'];
    case 'drag': return r.kind === 'drag' ? item.slots.map((s, i) => `${s} → ${r.slots[i] === null ? '—' : item.pool[r.slots[i] as number]}`) : [];
  }
}
