import React from 'react';
import type { Item, MistakeType } from '../types';

/* ---------------- pre-submission Clinical Reasoning Coach (never reveals the answer) ---------------- */
const NEG = /further teaching|needs? (correction|follow-up)|requires? (intervention|correction|follow-up)|unsafe|contraindicated|should the nurse (question|clarify)|avoid/i;
const PRI = /\b(first|priority|most important|immediately|initial|most urgent|see first|assess first)\b/i;
export function questionType(it: Item): { type: string; how: string } {
  const s = it.stem;
  if (it.fmt === 'sata') return { type: 'Select all that apply', how: 'Treat every option as its own true/false question. Do not count how many you "should" pick.' };
  if (it.fmt === 'order') return { type: 'Ordered response', how: 'Find the step that must happen before all others (often safety or airway), then the last step (often documentation or evaluation).' };
  if (it.fmt === 'numeric') return { type: 'Dosage calculation', how: 'Convert lb → kg (÷ 2.2) first, set up dimensional analysis, check the safe range, round only at the end.' };
  if (NEG.test(s)) return { type: 'Negative wording — find the WRONG or unsafe choice', how: 'Three options are correct statements. You are hunting for the one that is unsafe or false.' };
  if (PRI.test(s)) return { type: 'Priority / first action', how: 'Rank by airway–breathing–circulation, then safety, then actual over potential problems. Assess first only if key data is missing.' };
  if (it.cj === 'evaluate' || /indicates|understanding|effective|improv/i.test(s)) return { type: 'Evaluation of outcome or teaching', how: 'Ask: does this choice show the problem is resolving or the teaching was understood?' };
  if (it.cj === 'generate' || /expect|anticipate|plan/i.test(s)) return { type: 'Generate solutions / planning', how: 'Pick actions that directly treat the identified problem and fit the child’s age and scope of care.' };
  if (it.cj === 'recognize' || /finding|sign|typical|suggest/i.test(s)) return { type: 'Recognize cues', how: 'Compare each finding to what is expected for this age; the answer is the finding that does NOT fit (or best fits) the condition.' };
  return { type: 'Analyze cues', how: 'Link the findings to the most likely problem before choosing an action.' };
}
const KW = /\b(first|best|priority|most|immediately|initial|further teaching|needs correction|requires (?:follow-up|intervention)|early|late|expected|unexpected|report|avoid|never|always|except|not|post-?op(?:erative)?|pre-?op(?:erative)?|\d+[- ](?:day|week|month|year)s?-old|\d+ (?:days|weeks|months|years))\b/gi;
export function keyWords(it: Item): string[] { return [...new Set((it.stem.match(KW) ?? []).map(w => w.toLowerCase()))].slice(0, 8); }
const PRINCIPLE: Record<string, string> = {
  recognize: 'Know the expected finding for the age first; abnormal = different from the age norm or the child’s baseline.',
  analyze: 'Cluster the cues: which single problem explains most of them?',
  prioritize: 'ABCs → safety → Maslow; acute/unstable before stable; actual before potential (ATI Leading & Managing).',
  generate: 'Choose interventions that address the cause, are safe, and are developmentally appropriate.',
  act: 'Act on the most dangerous problem first; don’t delay a needed intervention for documentation or teaching.',
  evaluate: 'Compare the new data with the goal: better, unchanged, or worse?',
};

export function CoachPanel({ item, eliminated, onToggle }: { item: Item; eliminated: number[]; onToggle: (i: number) => void }) {
  const t = questionType(item);
  const kws = keyWords(item);
  const opts = item.fmt === 'mc' || item.fmt === 'sata' ? item.options : null;
  return (
    <aside className="coach" aria-label="Clinical Reasoning Coach">
      <h4>🧭 Clinical Reasoning Coach <span className="muted small">(no answers shown)</span></h4>
      <ol className="coach-steps">
        <li><strong>Question type:</strong> {t.type}. {t.how}</li>
        <li><strong>Key words:</strong> {kws.length ? kws.map(k => <span key={k} className="chip kw">{k}</span>) : 'Read the last sentence of the stem twice — it tells you what is being asked.'}</li>
        <li><strong>Principle:</strong> {PRINCIPLE[item.cj]}</li>
        {opts && <li><strong>Eliminate:</strong> strike options you can rule out — your strikes are only a note to yourself.
          <ul className="elim">{opts.map((o, i) => <li key={i}><button type="button" className={'elim-btn' + (eliminated.includes(i) ? ' on' : '')} aria-pressed={eliminated.includes(i)} onClick={() => onToggle(i)}>{eliminated.includes(i) ? '✗ ' : ''}<span>{String.fromCharCode(65 + i)}. {o}</span></button></li>)}</ul></li>}
      </ol>
    </aside>
  );
}

/* ---------------- mistake classification ---------------- */
export const MISTAKES: Record<MistakeType, { label: string; fix: string }> = {
  content: { label: 'Didn’t know the content', fix: 'Re-read the topic card and do 5 tutor-mode questions on it.' },
  misread: { label: 'Misread the question', fix: 'Slow down: read the last sentence first, then the stem.' },
  priorityWord: { label: 'Missed a key word (first, best, further teaching)', fix: 'Use the Coach to circle key words before reading options.' },
  confused: { label: 'Confused two similar conditions', fix: 'Study the matching Compare card in Rapid Review.' },
  medMech: { label: 'Medication action / side effect', fix: 'Drill the Med cards in Rapid Review (spaced repetition).' },
  numeric: { label: 'Math or dosage error', fix: 'Do 5 Dosage Lab problems; convert lb→kg first.' },
  sataIncomplete: { label: 'SATA — picked too few or too many', fix: 'Judge each SATA option as its own true/false.' },
  changed: { label: 'Changed a right answer to a wrong one', fix: 'Change an answer only when you find a specific fact that proves the first choice wrong.' },
  prioritizing: { label: 'Prioritization error (ABC / safety)', fix: 'Practice Clinical Priority mode; say "airway, breathing, circulation, safety" before choosing.' },
};
export function MistakePicker({ value, auto, onPick }: { value?: MistakeType; auto?: boolean; onPick: (m: MistakeType) => void }) {
  return (
    <div className="mistake">
      <label className="small"><strong>Why did I miss this?</strong>{auto && value ? <span className="muted"> (suggested from your answer pattern — change it if needed)</span> : null}{' '}
        <select value={value ?? ''} onChange={e => onPick(e.target.value as MistakeType)}>
          <option value="" disabled>Choose a reason…</option>
          {(Object.keys(MISTAKES) as MistakeType[]).map(k => <option key={k} value={k}>{MISTAKES[k].label}</option>)}
        </select>
      </label>
      {value && <p className="small fix-line">Next step: {MISTAKES[value].fix}</p>}
    </div>
  );
}
