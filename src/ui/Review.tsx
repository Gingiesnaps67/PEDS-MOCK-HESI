import React, { useState } from 'react';
import type { Item, Response } from '../types';
import { scoreItem, keyText, responseText, SCORING_LABEL } from '../engine/scoring';
import { TOPIC_BY_N, CAT_NAME } from '../data/blueprint';
import { categoryOf } from '../data/bank';
import { cjLabel } from '../engine/exam';
import { ItemView, fmtLabel } from './ItemView';
import { Chart } from './Chart';
import { CASE_BY_ID } from '../data/bank';
import { verifyOf, UNVERIFIED, VERIFY_LABEL } from '../data/verify';
import type { MistakeType } from '../types';
import { MistakePicker } from './Coach';
import { useExamClean, cleanItem } from './examClean';

export function VerifyBadge({ id }: { id: string }) {
  const v = verifyOf(id);
  return <span className={'chip vbadge v-' + v.toLowerCase()} title={UNVERIFIED[id] ?? VERIFY_LABEL[v]}>{v === 'S' ? '✓ ' : v === 'D' ? '◐ ' : '⚠ '}{VERIFY_LABEL[v]}</span>;
}

const DIFF = ['', 'Recall', 'Application', 'Analysis / prioritization', 'Complex judgment'];

export function MetaChips({ item }: { item: Item }) {
  const clean = useExamClean();
  return (
    <div className="chips">
      {item.topics.map(t => <span key={t} className="chip topic">{clean ? '' : `#${t} `}{TOPIC_BY_N[t]?.title}</span>)}
      <span className="chip">{CAT_NAME[categoryOf(item)]}</span>
      <span className="chip">{cjLabel(item.cj)}</span>
      <span className="chip">{DIFF[item.diff]}</span>
      <span className="chip">{fmtLabel(item)}</span>
      {item.age && <span className="chip">Age: {item.age}</span>}
      {!clean && <VerifyBadge id={item.id} />}
    </div>
  );
}

/** per-option / per-row rationale notes aligned to what the student saw */
function ElementNotes({ item }: { item: Item }) {
  const notes = item.rationale.options;
  if (!notes || !notes.length) return null;
  let labels: string[] = [];
  let keyed: boolean[] = [];
  switch (item.fmt) {
    case 'mc': labels = item.options; keyed = item.options.map((_, i) => i === item.answer); break;
    case 'sata': labels = item.options; keyed = item.options.map((_, i) => item.answer.includes(i)); break;
    case 'order': labels = item.options.map((o, i) => `${i + 1}. ${o}`); keyed = labels.map(() => true); break;
    case 'matrix': labels = item.rows.map((r, i) => `${r} → ${item.columns[item.answer[i]]}`); keyed = labels.map(() => true); break;
    case 'cloze': labels = item.blanks.map((b, i) => `Blank ${i + 1}: ${b.options[b.answer]}`); keyed = labels.map(() => true); break;
    case 'highlight': { const k = item.segments.filter(s => s.key !== null); labels = k.map(s => s.text); keyed = k.map(s => s.key === true); break; }
    case 'drag': labels = item.slots.map((s, i) => `${s.replace('___', '')} ${item.pool[item.answer[i]]}`); keyed = labels.map(() => true); break;
    default: return null;
  }
  const isChoice = item.fmt === 'mc' || item.fmt === 'sata' || item.fmt === 'highlight';
  return (
    <div className="rat-block">
      <h5>{isChoice ? 'Why each choice is right or wrong' : 'Element-by-element'}</h5>
      <ul className="notes">
        {labels.map((l, i) => (notes[i] || isChoice) ? (
          <li key={i} className={isChoice ? (keyed[i] ? 'n-right' : 'n-wrong') : ''}>
            <strong>{isChoice ? (keyed[i] ? '✓ ' : '✗ ') : ''}{l}</strong>{notes[i] ? <span> — {notes[i]}</span> : keyed[i] && item.fmt === 'mc' ? <span> — keyed answer (see rationale above).</span> : null}
          </li>
        ) : null)}
      </ul>
    </div>
  );
}

export function Rationale({ item, onTopic }: { item: Item; onTopic?: (n: number) => void }) {
  const [why, setWhy] = useState(false);
  const clean = useExamClean();
  const r = item.rationale;
  return (
    <div className="rationale">
      <div className="rat-block good"><h5>Correct answer rationale</h5><p>{r.correct}</p></div>
      {item.fmt === 'numeric' && <div className="rat-block"><h5>Step-by-step (dimensional analysis)</h5><ol className="steps">{item.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>}
      <ElementNotes item={item} />
      <div className="rat-grid">
        <div className="rat-block"><h5>Clinical priority</h5><p>{r.priority}</p></div>
        <div className="rat-block"><h5>Exam reasoning — the clue</h5><p>{r.clue}</p></div>
        {r.memory && <div className="rat-block mem"><h5>Memory connection</h5><p>{r.memory}</p></div>}
      </div>
      {(r.tempt || r.variation || r.physiology) && (
        <div className="rat-grid coach-post">
          {r.tempt && <div className="rat-block trap"><h5>Why the wrong answer was tempting</h5><p>{r.tempt}</p></div>}
          {r.variation && <div className="rat-block"><h5>What would change the answer</h5><p>{r.variation}</p></div>}
          {r.physiology && <div className="rat-block"><h5>The physiology underneath</h5><p>{r.physiology}</p></div>}
        </div>
      )}
      <button type="button" className="btn ghost small" aria-expanded={why} onClick={() => setWhy(!why)}>WHY? Explain it simply</button>
      {why && <div className="why-box"><p>{r.simple ?? `The most important thing here is: ${r.priority.replace(/\.$/, '').toLowerCase()}. ${r.clue} ${r.correct.split('. ')[0]}.`}</p></div>}
      {!clean && <div className="rat-block src">
        <h5>Source mapping</h5>
        <p>
          {item.topics.map(t => <button key={t} type="button" className="linkish" onClick={() => onTopic?.(t)}>Instructor review #{t}: {TOPIC_BY_N[t]?.title}</button>)}
        </p>
        <p className="muted small">Sources: {item.src.join(' · ')}</p>
        <p className="small"><VerifyBadge id={item.id} />{UNVERIFIED[item.id] ? ` ${UNVERIFIED[item.id]} This question is practice only and never counts toward your score.` : ''}</p>
      </div>}
    </div>
  );
}

export function ItemReview({ item: rawItem, response, onTopic, showChart = true, mistake, onMistake }: { item: Item; response?: Response; onTopic?: (n: number) => void; showChart?: boolean; mistake?: { type?: MistakeType; auto?: boolean }; onMistake?: (m: MistakeType) => void }) {
  const clean = useExamClean();
  const item = clean ? cleanItem(rawItem) : rawItem;
  const sc = scoreItem(item, response);
  const cs = item.caseId ? (clean ? cleanItem(CASE_BY_ID[item.caseId]) : CASE_BY_ID[item.caseId]) : null;
  return (
    <div className="review">
      <div className="review-head">
        <span className={'score-pill ' + (sc.full ? 'ok' : sc.earned > 0 ? 'part' : 'bad')}>{sc.full ? 'Correct' : sc.earned > 0 ? 'Partially correct' : 'Incorrect'} · {sc.earned}/{sc.possible} pts</span>
        <span className="muted small">Scoring: {SCORING_LABEL[sc.rule]}</span>
      </div>
      <MetaChips item={item} />
      {showChart && cs && <details className="review-chart"><summary>Chart at this stage ({cs.patient})</summary><Chart title={cs.patient} entries={cs.chart} stage={item.stage ?? 1} /></details>}
      {showChart && item.exhibit && <details className="review-chart"><summary>Exhibit: {item.exhibit.title}</summary><Chart title={item.exhibit.title} entries={item.exhibit.entries} stage={1} /></details>}
      <ItemView item={item} response={response} onChange={() => undefined} reveal />
      <div className="answer-compare">
        <div><h5>Your answer</h5><ul>{responseText(item, response).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
        <div><h5>Correct answer</h5><ul>{keyText(item).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
      </div>
      {onMistake && !sc.full && <MistakePicker value={mistake?.type} auto={mistake?.auto} onPick={onMistake} />}
      <Rationale item={item} onTopic={onTopic} />
    </div>
  );
}
