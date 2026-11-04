import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ActiveExam, Conf, Response } from '../types';
import { useApp } from './state';
import { getItem, CASE_BY_ID } from '../data/bank';
import { tick, grade, applyAttempt, ladderAdvance } from '../engine/exam';
import { isAnswered } from '../engine/scoring';
import { ItemView, fmtLabel } from './ItemView';
import { Chart } from './Chart';
import { ItemReview } from './Review';
import { CoachPanel } from './Coach';
import { scoreItem } from '../engine/scoring';
import { ExamCleanCtx, isMock, cleanItem } from './examClean';

export const CONF_LABELS = ['Guessing', 'Unsure', 'Somewhat sure', 'Confident', 'Certain'];

export const fmtTime = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(x).padStart(2, '0');
};

export function ExamRunner() {
  const { store, update, go } = useApp();
  const [ex, setEx] = useState<ActiveExam>(() => store.active!);
  const [confirm, setConfirm] = useState(false);
  const [mobile, setMobile] = useState<'q' | 'chart'>('q');
  const [navOpen, setNavOpen] = useState(false);
  const exRef = useRef(ex); exRef.current = ex;
  const done = useRef(false);

  const flush = useCallback(() => { if (!done.current) update(s => ({ ...s, active: exRef.current }), { activeOnly: true }); }, [update]);

  const submit = useCallback((expired: boolean) => {
    if (done.current) return;
    done.current = true;
    const at = grade(exRef.current, expired);
    update(s => applyAttempt({ ...s, active: exRef.current }, at));
    go({ name: 'results', id: at.id });
  }, [update, go]);

  // opening Rapid Review mid-exam keeps the question in place but marks the session (excluded from readiness)
  useEffect(() => {
    const h = () => { setEx(e => ({ ...e, refOpened: true })); window.setTimeout(flush, 50); };
    window.addEventListener('peds-ref-opened', h);
    return () => window.removeEventListener('peds-ref-opened', h);
  }, [flush]);

  // timer + time-on-item
  useEffect(() => {
    let last = performance.now();
    const t = window.setInterval(() => {
      // keeps running in background tabs (as a real exam would); large gaps from device sleep are capped
      const now = performance.now(); const d = Math.min(now - last, 65_000); last = now;
      const res = tick(exRef.current, d);
      setEx(res.exam);
      if (res.expired) submit(true);
    }, 1000);
    return () => window.clearInterval(t);
  }, [submit]);

  // periodic and on-hide saving
  useEffect(() => {
    const t = window.setInterval(flush, 5000);
    const vis = () => { if (document.hidden) flush(); };
    document.addEventListener('visibilitychange', vis);
    window.addEventListener('pagehide', flush);
    return () => { window.clearInterval(t); document.removeEventListener('visibilitychange', vis); window.removeEventListener('pagehide', flush); flush(); };
  }, [flush]);

  const [coachFor, setCoachFor] = useState<string | null>(null);
  const slot = ex.slots[ex.index];
  const mock = isMock(ex.kind); // PEDS HESI 2026 Mock Exam: presentation shows no citations
  const rawItem = getItem(slot.itemId)!;
  const item = mock ? cleanItem(rawItem) : rawItem;
  const resp = ex.responses[item.id];
  const answered = isAnswered(item, resp);
  const checked = ex.checked.includes(item.id);
  const rawCase = item.caseId ? CASE_BY_ID[item.caseId] : null;
  const cs = rawCase && mock ? cleanItem(rawCase) : rawCase;
  const chart = cs ? { title: cs.patient, entries: cs.chart, stage: item.stage ?? 1, totalStages: 6 } : item.exhibit ? { title: item.exhibit.title, entries: item.exhibit.entries, stage: 1 } : null;
  const linear = ex.settings.navigation === 'linear';
  const last = ex.index === ex.slots.length - 1;
  const canNext = ex.tutor ? checked : linear ? answered : true;

  const setResp = (r: Response) => {
    if (checked) return;
    setEx(e => {
      const prev = e.responses[item.id];
      // answer changes are tracked for single-choice items, where "first answer" is unambiguous
      const had = item.fmt === 'mc' && isAnswered(item, prev);
      const changes = had && JSON.stringify(prev) !== JSON.stringify(r) && isAnswered(item, r) ? { ...(e.changes ?? {}), [item.id]: (e.changes?.[item.id] ?? 0) + 1 } : e.changes;
      const initial = !e.initial?.[item.id] && isAnswered(item, r) && item.fmt === 'mc' ? { ...(e.initial ?? {}), [item.id]: r } : e.initial;
      return { ...e, responses: { ...e.responses, [item.id]: r }, changes, initial };
    });
    window.setTimeout(flush, 300);
  };
  const goTo = (i: number) => { setEx(e => ({ ...e, index: i })); setMobile('q'); setNavOpen(false); window.setTimeout(flush, 50); try { window.scrollTo({ top: 0 }); } catch { /* */ } };
  const next = () => { if (!canNext) return; if (last) setConfirm(true); else goTo(ex.index + 1); };
  const toggleFlag = () => setEx(e => ({ ...e, flags: e.flags.includes(item.id) ? e.flags.filter(f => f !== item.id) : [...e.flags, item.id] }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (confirm || document.querySelector('.ref-back') || ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (item.fmt === 'mc' && !checked) {
        const k = e.key.toLowerCase(); const idx = '1234'.includes(k) ? Number(k) - 1 : 'abcd'.indexOf(k);
        if (idx >= 0 && idx < item.options.length) { setResp({ kind: 'mc', choice: idx }); e.preventDefault(); return; }
      }
      if (e.key === 'Enter' && tag !== 'BUTTON') { next(); e.preventDefault(); }
      if (e.key.toLowerCase() === 'f' && !linear) toggleFlag();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const unanswered = ex.slots.filter(s => !isAnswered(getItem(s.itemId)!, ex.responses[s.itemId])).length;
  const low = ex.remainingMs !== null && ex.remainingMs < 5 * 60_000;
  const caseIdx = cs ? [...new Set(ex.slots.map(s => getItem(s.itemId)?.caseId).filter(Boolean))].indexOf(cs.id) + 1 : 0;

  if (confirm) {
    const flagged = ex.flags.length;
    return (
      <main className="page narrow">
        <section className="panel confirm" aria-labelledby="sub-h">
          <h2 id="sub-h">Submit this exam?</h2>
          <dl className="kv">
            <dt>Items</dt><dd>{ex.slots.length}</dd>
            <dt>Answered</dt><dd>{ex.slots.length - unanswered}</dd>
            <dt>Unanswered</dt><dd className={unanswered ? 'warn-t' : ''}>{unanswered}</dd>
            {!linear && <><dt>Flagged for review</dt><dd>{flagged}</dd></>}
            {ex.remainingMs !== null && <><dt>Time remaining</dt><dd className="mono">{fmtTime(ex.remainingMs)}</dd></>}
          </dl>
          <p className="muted">After you submit, answers are locked and scored. Unanswered items earn 0 points.</p>
          <div className="row gap">
            <button className="btn" onClick={() => setConfirm(false)}>{linear ? 'Return to last item' : 'Return to exam'}</button>
            <button className="btn primary" onClick={() => submit(false)}>Submit exam</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <ExamCleanCtx.Provider value={mock}>
    <main className="exam">
      <div className="exam-bar">
        <div className="exam-title"><strong>{ex.title}</strong>{ex.tutor && <span className="chip accent">Tutor mode</span>}</div>
        <div className="exam-meta">
          {ex.tutor && <span className="chip accent phone-only">Tutor mode</span>}
          <span className="mono">Item {ex.index + 1} of {ex.slots.length}</span>
          {ex.remainingMs !== null && <span className={'timer mono' + (low ? ' low' : '')} role="timer" aria-label="Time remaining">⏱ {fmtTime(ex.remainingMs)}</span>}
          {!linear && <button className={'btn small' + (ex.flags.includes(item.id) ? ' flagged' : '')} aria-pressed={ex.flags.includes(item.id)} onClick={toggleFlag}>⚑ {ex.flags.includes(item.id) ? 'Flagged' : 'Flag'}</button>}
          {!linear && <button className="btn small" aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>Navigator</button>}
          <button className="btn small ghost" aria-label="Save and exit" onClick={() => { flush(); go({ name: 'dashboard' }); }}><span className="phone-hide">Save & exit</span><span className="phone-only">Exit</span></button>
        </div>
        <div className="progress" aria-hidden="true"><span style={{ width: `${((ex.index + 1) / ex.slots.length) * 100}%` }} /></div>
      </div>

      {navOpen && !linear && (
        <nav className="navigator" aria-label="Question navigator">
          {ex.slots.map((s, i) => {
            const it = getItem(s.itemId)!;
            const a = isAnswered(it, ex.responses[s.itemId]);
            return <button key={s.itemId} className={'nav-cell' + (a ? ' ans' : '') + (ex.flags.includes(s.itemId) ? ' flag' : '') + (i === ex.index ? ' cur' : '') + (it.caseId ? ' case' : '')} onClick={() => goTo(i)} aria-label={`Item ${i + 1}${a ? ', answered' : ', unanswered'}${ex.flags.includes(s.itemId) ? ', flagged' : ''}`}>{i + 1}</button>;
          })}
          <p className="muted small nav-key"><span className="nav-cell ans demo">✓</span> answered <span className="nav-cell flag demo">⚑</span> flagged <span className="nav-cell case demo">C</span> case-study item</p>
        </nav>
      )}

      {cs && (
        <div className="case-banner" aria-label={`Unfolding case, question ${item.stage} of 6`}>
          <div className="case-line">
            <span className="chip accent">Case{caseIdx ? ` ${caseIdx}` : ''} · {cs.title}</span>
            <span className="case-patient">{cs.patient}</span>
          </div>
          <ol className="stage-track" aria-label="Case progress">
            {cs.items.map((ci, k) => {
              const st = k + 1 < (item.stage ?? 1) ? 'done' : k + 1 === item.stage ? 'cur' : 'todo';
              return <li key={ci.id} className={'stage-dot ' + st} aria-current={st === 'cur' ? 'step' : undefined}><span className="sr-only">Stage {k + 1} {st === 'done' ? 'completed' : st === 'cur' ? 'current' : 'not yet reached'}</span><span aria-hidden="true">{k + 1}</span></li>;
            })}
            <li className="stage-label mono" aria-hidden="true">Question {item.stage} of 6</li>
          </ol>
          <p className="stage-note">{cs.stageNotes[(item.stage ?? 1) - 1]}</p>
        </div>
      )}

      {chart && (
        <div className="mobile-switch" role="tablist" aria-label="Show question or chart">
          <button role="tab" aria-selected={mobile === 'q'} className={mobile === 'q' ? 'on' : ''} onClick={() => setMobile('q')}>Question</button>
          <button role="tab" aria-selected={mobile === 'chart'} className={mobile === 'chart' ? 'on' : ''} onClick={() => setMobile('chart')}>Chart</button>
        </div>
      )}

      <div className={'workspace' + (chart ? ' split' : '') + ' show-' + mobile}>
        {chart && <div className="ws-chart"><Chart {...chart} /></div>}
        <div className="ws-q">
          <div className="q-head"><span className="chip">{fmtLabel(item)}</span><span className={'answer-state ' + (checked ? 'locked' : answered ? 'saved' : 'empty')} role="status">{checked ? 'Answer submitted' : answered ? 'Answer saved' : 'Not answered yet'}</span></div>
          <ItemView item={item} response={resp} onChange={setResp} reveal={checked} />
          {!['formA', 'formB', 'hesi', 'extended'].includes(ex.kind) && !checked && (
            <div className="coach-wrap">
              <button type="button" className="btn small ghost" aria-expanded={coachFor === item.id} onClick={() => {
                const open = coachFor !== item.id; setCoachFor(open ? item.id : null);
                if (open) setEx(e => (e.coached?.includes(item.id) ? e : { ...e, coached: [...(e.coached ?? []), item.id] }));
              }}>🧭 {coachFor === item.id ? 'Hide coach' : 'Reasoning coach'}</button>
              {coachFor === item.id && <CoachPanel item={item} eliminated={ex.eliminated?.[item.id] ?? []} onToggle={i => setEx(e => {
                const cur = e.eliminated?.[item.id] ?? [];
                return { ...e, eliminated: { ...(e.eliminated ?? {}), [item.id]: cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i] } };
              })} />}
            </div>
          )}
          {ex.settings.confidence && !ex.tutor && (
            <div className="confidence" role="radiogroup" aria-label="How confident are you? 1 guessing to 5 certain">
              <span className="muted small">Confidence:</span>
              {CONF_LABELS.map((lab, k) => {
                const c = (k + 1) as Conf;
                return (
                  <button key={c} type="button" role="radio" aria-checked={ex.confidence[item.id] === c} aria-label={`${c} — ${lab}`} title={lab} className={'conf-btn' + (ex.confidence[item.id] === c ? ' on' : '')}
                    onClick={() => setEx(e => ({ ...e, confidence: { ...e.confidence, [item.id]: c } }))}>{c}</button>
                );
              })}
              <span className="muted small conf-hint" aria-hidden="true">{ex.confidence[item.id] ? CONF_LABELS[ex.confidence[item.id] - 1] : '1 guessing · 5 certain'}</span>
            </div>
          )}
          {ex.tutor && checked && <ItemReview item={item} response={resp} showChart={false} onTopic={n => { flush(); go({ name: 'blueprint', topic: n }); }} />}
        </div>
      </div>

      <div className="exam-foot">
        {!linear && <button className="btn" disabled={ex.index === 0} onClick={() => goTo(ex.index - 1)}>← Previous</button>}
        <span className="grow muted small">{linear && !ex.tutor ? 'Answers are final when you move on.' : !linear ? 'Keys: A–D choose · Enter next · F flag' : ''}</span>
        {ex.tutor && !checked && <button className="btn primary" disabled={!answered} onClick={() => setEx(e => {
          const nx = { ...e, checked: [...e.checked, item.id] };
          return e.ladder ? ladderAdvance(nx, scoreItem(item, e.responses[item.id]).full, store) : nx;
        })}>Check answer</button>}
        {ex.ladder && <span className="chip ladder-chip" aria-live="polite">Ladder level {ex.ladder.level} of 5</span>}
        {(!ex.tutor || checked) && <button className="btn primary" disabled={!canNext} onClick={next}>{last ? 'Finish' : 'Next →'}</button>}
        {!linear && !last && <button className="btn ghost" onClick={() => setConfirm(true)}>Submit…</button>}
      </div>
    </main>
    </ExamCleanCtx.Provider>
  );
}
