import React, { useEffect, useMemo, useState } from 'react';
import type { Item, Response, OrderItem, BowtieItem, HighlightItem, DragItem, MatrixItem, ClozeItem } from '../types';
import { emptyResponse } from '../engine/scoring';
import { rng } from '../engine/dosage';
import { shuffle } from '../engine/exam';

interface P<T extends Item = Item> { item: T; response?: Response; onChange: (r: Response) => void; reveal?: boolean; }
const L = 'ABCDEFGHIJ';
const mark = (reveal: boolean | undefined, ok: boolean | null) => (!reveal || ok === null ? '' : ok ? ' is-right' : ' is-wrong');

/** true when the viewport is phone-width; layouts that need columns switch to stacked forms */
export function useNarrow(px = 640) {
  const q = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(`(max-width: ${px}px)`) : null;
  const [narrow, setNarrow] = useState(() => !!q?.matches);
  useEffect(() => {
    if (!q) return;
    const h = () => setNarrow(q.matches);
    q.addEventListener ? q.addEventListener('change', h) : q.addListener(h);
    return () => { q.removeEventListener ? q.removeEventListener('change', h) : q.removeListener(h); };
    // eslint-disable-next-line
  }, []);
  return narrow;
}

/** what the student must do, shown with every question in the same place */
export function instructionFor(item: Item): string {
  switch (item.fmt) {
    case 'mc': return 'Select one answer.';
    case 'sata': return item.scoring === 'plusminus' ? 'Select all that apply. Each incorrect selection subtracts a point.' : 'Select all that apply. All correct choices, and only those, are needed for credit.';
    case 'order': return `Place all ${item.options.length} options in order, first to last.`;
    case 'numeric': return `Enter a number in ${item.unit}.`;
    case 'matrix': return 'Choose one option in every row.';
    case 'cloze': return `Choose an option for each of the ${item.blanks.length} blanks.`;
    case 'bowtie': return 'Choose 1 condition, 2 actions to take, and 2 parameters to monitor.';
    case 'highlight': return 'Tap each finding that applies. Each incorrect selection subtracts a point.';
    case 'drag': return `Fill all ${item.slots.length} blanks from the choices.`;
  }
}

export function ItemView(p: P) {
  const { item } = p;
  const r = p.response ?? emptyResponse(item);
  return (
    <div className="item" data-fmt={item.fmt} data-item-id={item.id}>
      <p className="stem">{item.stem}</p>
      <p className="instruction">{instructionFor(item)}</p>
      {item.fmt === 'mc' && <MC {...p} response={r} />}
      {item.fmt === 'sata' && <SATA {...p} response={r} />}
      {item.fmt === 'order' && <Order {...(p as P<OrderItem>)} response={r} />}
      {item.fmt === 'numeric' && <Numeric {...p} response={r} />}
      {item.fmt === 'matrix' && <Matrix {...(p as P<MatrixItem>)} response={r} />}
      {item.fmt === 'cloze' && <Cloze {...(p as P<ClozeItem>)} response={r} />}
      {item.fmt === 'bowtie' && <Bowtie {...(p as P<BowtieItem>)} response={r} />}
      {item.fmt === 'highlight' && <Highlight {...(p as P<HighlightItem>)} response={r} />}
      {item.fmt === 'drag' && <Drag {...(p as P<DragItem>)} response={r} />}
    </div>
  );
}

export const FMT_LABEL: Record<Item['fmt'], string> = {
  mc: 'Multiple choice', sata: 'Select all that apply', order: 'Ordered response', numeric: 'Numeric entry', matrix: 'Matrix / grid',
  cloze: 'Drop-down cloze', bowtie: 'Bow-tie', highlight: 'Highlight', drag: 'Extended drag and drop',
};
export function fmtLabel(i: Item): string {
  if (i.fmt === 'sata' && i.scoring === 'plusminus') return 'Extended multiple response';
  if (i.fmt === 'matrix' && i.exhibit?.entries.some(e => e.table && e.table.head.length > 3 && /Day|Time/.test(e.table.head.join(' '))) && i.cj === 'evaluate') return 'Trend (matrix)';
  if (i.fmt === 'matrix' && /Indicated/.test(i.columns.join(' '))) return 'Clinical decision table';
  return FMT_LABEL[i.fmt];
}

function MC({ item, response, onChange, reveal }: P) {
  if (item.fmt !== 'mc' || response?.kind !== 'mc') return null;
  return (
    <div className="options" role="radiogroup" aria-label="Answer choices">
      {item.options.map((o, i) => {
        const sel = response.choice === i;
        const ok = reveal ? (i === item.answer ? true : sel ? false : null) : null;
        return (
          <label key={i} className={'opt' + (sel ? ' is-sel' : '') + mark(reveal, ok)}>
            <input type="radio" name={'mc-' + item.id} checked={sel} disabled={reveal} onChange={() => onChange({ kind: 'mc', choice: i })} />
            <span className="opt-key">{L[i]}</span><span className="opt-text">{o}</span>
          </label>
        );
      })}
    </div>
  );
}

function SATA({ item, response, onChange, reveal }: P) {
  if (item.fmt !== 'sata' || response?.kind !== 'sata') return null;
  const toggle = (i: number) => onChange({ kind: 'sata', choices: response.choices.includes(i) ? response.choices.filter(x => x !== i) : [...response.choices, i].sort((a, b) => a - b) });
  return (
    <div className="options" role="group" aria-label="Select all that apply">
      {item.options.map((o, i) => {
        const sel = response.choices.includes(i); const key = item.answer.includes(i);
        const ok = reveal ? (key ? true : sel ? false : null) : null;
        return (
          <label key={i} className={'opt' + (sel ? ' is-sel' : '') + mark(reveal, ok)}>
            <input type="checkbox" checked={sel} disabled={reveal} onChange={() => toggle(i)} />
            <span className="opt-key sq">{sel ? '✓' : ''}</span><span className="opt-text">{o}{reveal && key && !sel ? <em className="missed-tag"> — missed</em> : null}</span>
          </label>
        );
      })}
    </div>
  );
}

function Order({ item, response, onChange, reveal }: P<OrderItem>) {
  const shown = useMemo(() => shuffle(item.options.map((_, i) => i), rng(item.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0))), [item.id]);
  const [drag, setDrag] = useState<number | null>(null);
  if (response?.kind !== 'order') return null;
  const ord = response.order;
  const set = (o: number[]) => onChange({ kind: 'order', order: o });
  const move = (k: number, d: number) => { const o = [...ord]; const j = k + d; if (j < 0 || j >= o.length) return; [o[k], o[j]] = [o[j], o[k]]; set(o); };
  return (
    <div className="order">
      <div className="order-col">
        <h4 className="mini">Options</h4>
        {shown.filter(i => !ord.includes(i)).map(i => (
          <button key={i} type="button" className="chip-btn" disabled={reveal} onClick={() => set([...ord, i])}>{item.options[i]}<span aria-hidden> →</span></button>
        ))}
        {shown.every(i => ord.includes(i)) && <p className="muted small">All options placed.</p>}
      </div>
      <div className="order-col">
        <h4 className="mini">Your order (drag or use arrows)</h4>
        <ol className="order-list">
          {ord.map((i, k) => (
            <li key={i} draggable={!reveal} onDragStart={() => setDrag(k)} onDragOver={e => e.preventDefault()}
              onDrop={() => { if (drag === null) return; const o = [...ord]; const [x] = o.splice(drag, 1); o.splice(k, 0, x); set(o); setDrag(null); }}
              className={'order-row' + mark(reveal, reveal ? item.answer[k] === i : null)}>
              <span className="num">{k + 1}</span><span className="grow">{item.options[i]}</span>
              {!reveal && <span className="row-tools">
                <button type="button" aria-label="Move up" onClick={() => move(k, -1)}>↑</button>
                <button type="button" aria-label="Move down" onClick={() => move(k, 1)}>↓</button>
                <button type="button" aria-label="Remove" onClick={() => set(ord.filter(x => x !== i))}>×</button>
              </span>}
            </li>
          ))}
        </ol>
        {!ord.length && <p className="dropzone muted small">Tap an option to place it here.</p>}
      </div>
    </div>
  );
}

function Numeric({ item, response, onChange, reveal }: P) {
  if (item.fmt !== 'numeric' || response?.kind !== 'numeric') return null;
  const id = 'num-' + item.id;
  return (
    <div className="numeric">
      <label htmlFor={id} className="mini">Your answer</label>
      <div className="num-row">
        <input id={id} inputMode="decimal" autoComplete="off" value={response.value} disabled={reveal}
          onChange={e => onChange({ kind: 'numeric', value: e.target.value.replace(/[^0-9.\-]/g, '') })} />
        <span className="unit">{item.unit}</span>
      </div>
      <p className="muted small">Enter a number only. Rounding: {item.decimals === 0 ? 'whole number' : `${item.decimals} decimal place`}.</p>
    </div>
  );
}

function Matrix({ item, response, onChange, reveal }: P<MatrixItem>) {
  const narrow = useNarrow(640);
  if (response?.kind !== 'matrix') return null;
  const set = (row: number, col: number) => { const rows = [...response.rows]; rows[row] = col; onChange({ kind: 'matrix', rows }); };
  if (narrow) {
    // phone layout: one card per row, every column choice is a full-width, wrapping option
    return (
      <div className="matrix-stack">
        {item.rows.map((row, ri) => (
          <fieldset key={ri} className={'mrow' + mark(reveal, reveal ? response.rows[ri] === item.answer[ri] : null)}>
            <legend><span className="mrow-n">{ri + 1}</span>{row}</legend>
            <div className="mrow-opts">
              {item.columns.map((c, ci) => (
                <label key={ci} className={'mopt' + (response.rows[ri] === ci ? ' is-sel' : '') + (reveal && item.answer[ri] === ci ? ' key' : '')}>
                  <input type="radio" name={`m-${item.id}-${ri}`} checked={response.rows[ri] === ci} disabled={reveal} onChange={() => set(ri, ci)} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    );
  }
  return (
    <div className="scroll-x">
      <table className="matrix">
        <thead><tr><th scope="col">Finding / action</th>{item.columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>
          {item.rows.map((row, ri) => (
            <tr key={ri} className={mark(reveal, reveal ? response.rows[ri] === item.answer[ri] : null)}>
              <th scope="row">{row}</th>
              {item.columns.map((c, ci) => (
                <td key={ci} className={reveal && item.answer[ri] === ci ? 'key-cell' : ''}>
                  <label className="cell-hit">
                    <input type="radio" name={`m-${item.id}-${ri}`} aria-label={`${row}: ${c}`} checked={response.rows[ri] === ci} disabled={reveal} onChange={() => set(ri, ci)} />
                  </label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cloze({ item, response, onChange, reveal }: P<ClozeItem>) {
  const [open, setOpen] = useState<number | null>(null);
  if (response?.kind !== 'cloze') return null;
  const parts = item.template.split(/(\{\d+\})/);
  const choose = (b: number, i: number) => { const bl = [...response.blanks]; bl[b] = i; onChange({ kind: 'cloze', blanks: bl }); setOpen(null); };
  return (
    <div className="cloze-wrap">
      <p className="cloze">
        {parts.map((part, k) => {
          const m = part.match(/^\{(\d+)\}$/);
          if (!m) return <span key={k}>{part}</span>;
          const b = Number(m[1]); const blank = item.blanks[b]; const val = response.blanks[b];
          return (
            <button type="button" key={k} aria-haspopup="listbox" aria-expanded={open === b} aria-label={`Blank ${b + 1}: ${val === null ? 'not answered' : blank.options[val]}`}
              disabled={reveal} onClick={() => setOpen(open === b ? null : b)}
              className={'blank' + (val === null ? ' empty' : '') + (open === b ? ' open' : '') + mark(reveal, reveal ? val === blank.answer : null)}>
              <span className="blank-n">{b + 1}</span>{val === null ? 'Select…' : blank.options[val]}<span className="blank-caret" aria-hidden="true">▾</span>
            </button>
          );
        })}
      </p>
      {open !== null && !reveal && (
        <div className="cloze-menu" role="listbox" aria-label={`Options for blank ${open + 1}`}
          onKeyDown={e => { if (e.key === 'Escape') setOpen(null); }}>
          <p className="mini">Blank {open + 1} — choose one</p>
          {item.blanks[open].options.map((o, i) => (
            <button type="button" role="option" aria-selected={response.blanks[open] === i} key={i}
              className={'cloze-opt' + (response.blanks[open] === i ? ' is-sel' : '')} onClick={() => choose(open, i)}>{o}</button>
          ))}
        </div>
      )}
      {reveal && <ol className="cloze-key small">{item.blanks.map((b, i) => <li key={i}><span className="muted">Blank {i + 1} correct answer:</span> {b.options[b.answer]}</li>)}</ol>}
    </div>
  );
}

function Bowtie({ item, response, onChange, reveal }: P<BowtieItem>) {
  if (response?.kind !== 'bowtie') return null;
  const r = response;
  const toggle = (field: 'actions' | 'params', i: number) => {
    const cur = r[field];
    const next = cur.includes(i) ? cur.filter(x => x !== i) : cur.length >= 2 ? cur : [...cur, i];
    onChange({ ...r, [field]: next });
  };
  const box = (text: string | undefined, ok: boolean | null, label: string) => (
    <div className={'bt-box' + (text ? ' filled' : '') + mark(reveal, ok)} aria-label={label}>{text ?? <span className="muted">{label}</span>}</div>
  );
  const okA = (i: number) => (reveal ? item.actionAnswer.includes(i) : null);
  const okP = (i: number) => (reveal ? item.paramAnswer.includes(i) : null);
  return (
    <div className="bowtie">
      <div className="bt-diagram" aria-hidden={false}>
        <div className="bt-side">{box(item.actions[r.actions[0]], r.actions[0] !== undefined ? okA(r.actions[0]) : null, 'Action to take')}{box(item.actions[r.actions[1]], r.actions[1] !== undefined ? okA(r.actions[1]) : null, 'Action to take')}</div>
        <svg className="bt-lines" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 25 L40 50 M0 75 L40 50" /></svg>
        <div className="bt-center">{box(r.condition !== null ? item.conditions[r.condition] : undefined, r.condition !== null && reveal ? r.condition === item.condition : null, 'Condition most likely experiencing')}</div>
        <svg className="bt-lines" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true"><path d="M40 25 L0 50 M40 75 L0 50" /></svg>
        <div className="bt-side">{box(item.params[r.params[0]], r.params[0] !== undefined ? okP(r.params[0]) : null, 'Parameter to monitor')}{box(item.params[r.params[1]], r.params[1] !== undefined ? okP(r.params[1]) : null, 'Parameter to monitor')}</div>
      </div>
      <div className="bt-banks">
        <fieldset><legend>Actions to take <span className="muted">(choose 2)</span></legend>
          {item.actions.map((a, i) => <button type="button" key={i} aria-pressed={r.actions.includes(i)} disabled={reveal || (!r.actions.includes(i) && r.actions.length >= 2)} className={'bank-btn' + (r.actions.includes(i) ? ' is-sel' : '') + (reveal && item.actionAnswer.includes(i) ? ' key' : '')} onClick={() => toggle('actions', i)}>{a}</button>)}
        </fieldset>
        <fieldset><legend>Potential conditions <span className="muted">(choose 1)</span></legend>
          {item.conditions.map((c, i) => <button type="button" key={i} aria-pressed={r.condition === i} disabled={reveal} className={'bank-btn' + (r.condition === i ? ' is-sel' : '') + (reveal && item.condition === i ? ' key' : '')} onClick={() => onChange({ ...r, condition: r.condition === i ? null : i })}>{c}</button>)}
        </fieldset>
        <fieldset><legend>Parameters to monitor <span className="muted">(choose 2)</span></legend>
          {item.params.map((a, i) => <button type="button" key={i} aria-pressed={r.params.includes(i)} disabled={reveal || (!r.params.includes(i) && r.params.length >= 2)} className={'bank-btn' + (r.params.includes(i) ? ' is-sel' : '') + (reveal && item.paramAnswer.includes(i) ? ' key' : '')} onClick={() => toggle('params', i)}>{a}</button>)}
        </fieldset>
      </div>
    </div>
  );
}

function Highlight({ item, response, onChange, reveal }: P<HighlightItem>) {
  if (response?.kind !== 'highlight') return null;
  const sel = response.selected;
  const toggle = (i: number) => onChange({ kind: 'highlight', selected: sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i].sort((a, b) => a - b) });
  return (
    <div className="highlight-wrap">
      <p className="highlight-text">
        {item.segments.map((s, i) => s.key === null ? <span key={i}>{s.text}</span> : (
          <button type="button" key={i} aria-pressed={sel.includes(i)} disabled={reveal}
            className={'hl' + (sel.includes(i) ? ' on' : '') + (reveal ? (s.key ? (sel.includes(i) ? ' is-right' : ' hl-missed') : sel.includes(i) ? ' is-wrong' : '') : '')}
            onClick={() => toggle(i)}>{s.text}</button>
        ))}
      </p>
    </div>
  );
}

function Drag({ item, response, onChange, reveal }: P<DragItem>) {
  const [held, setHeld] = useState<number | null>(null);
  if (response?.kind !== 'drag') return null;
  const slots = response.slots;
  const place = (slot: number, token: number | null) => {
    const s = slots.map(x => (x === token ? null : x)); s[slot] = token; onChange({ kind: 'drag', slots: s }); setHeld(null);
  };
  return (
    <div className="drag">
      <p className="muted small">Drag a choice onto a blank, or tap a choice and then tap the blank.</p>
      <div className="pool" role="list" aria-label="Choices">
        {item.pool.map((t, i) => {
          const used = slots.includes(i);
          return <button type="button" role="listitem" key={i} draggable={!reveal && !used} disabled={reveal || used}
            onDragStart={e => { e.dataTransfer.setData('text/plain', String(i)); setHeld(i); }}
            aria-pressed={held === i} className={'token' + (held === i ? ' held' : '') + (used ? ' used' : '')} onClick={() => setHeld(held === i ? null : i)}>{t}</button>;
        })}
      </div>
      <div className="slots">
        {item.slots.map((s, k) => (
          <div key={k} className="slot-row">
            <span className="slot-label">{s.replace('___', '').trim()}</span>
            <button type="button" className={'slot' + (slots[k] !== null ? ' filled' : '') + mark(reveal, reveal ? slots[k] === item.answer[k] : null)} disabled={reveal}
              aria-label={`Blank: ${s}`} onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const t = Number(e.dataTransfer.getData('text/plain')); if (!Number.isNaN(t)) place(k, t); }}
              onClick={() => { if (held !== null) place(k, held); else if (slots[k] !== null) place(k, null); }}>
              {slots[k] !== null ? item.pool[slots[k] as number] : held !== null ? 'Tap to place here' : 'Drop here'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
