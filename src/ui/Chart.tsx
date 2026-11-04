import React, { useEffect, useMemo, useState } from 'react';
import type { ChartEntry } from '../types';

const TAB_LABEL: Record<ChartEntry['tab'], string> = {
  profile: 'Patient', history: 'History', notes: 'Nurses’ notes', vitals: 'Vital signs', labs: 'Labs',
  diagnostics: 'Diagnostics', orders: 'Orders', mar: 'MAR', io: 'I&O', progress: 'Progress',
};
const ORDER: ChartEntry['tab'][] = ['profile', 'history', 'notes', 'vitals', 'labs', 'diagnostics', 'io', 'orders', 'mar', 'progress'];

/**
 * EHR-style chart. Only entries up to the current stage are shown (later findings stay hidden);
 * entries new at this stage are marked NEW, and earlier entries stay available for review.
 * Tables reflow into labelled rows on narrow screens, so no value is ever hidden off-screen.
 */
export function Chart({ title, entries, stage, totalStages }: { title: string; entries: ChartEntry[]; stage: number; totalStages?: number }) {
  const visible = useMemo(() => entries.filter(e => e.stage <= stage), [entries, stage]);
  const tabs = ORDER.filter(t => visible.some(e => e.tab === t));
  const newTabs = new Set(visible.filter(e => e.stage === stage && stage > 1).map(e => e.tab));
  const [tab, setTab] = useState(tabs[0]);
  useEffect(() => { const firstNew = tabs.find(t => newTabs.has(t)); setTab(firstNew ?? tabs[0]); /* eslint-disable-next-line */ }, [stage, title]);
  const shown = visible.filter(e => e.tab === (tabs.includes(tab) ? tab : tabs[0]));
  return (
    <section className="chart" aria-label={`Patient chart: ${title}`}>
      <header className="chart-head">
        <span className="chart-title">{title}</span>
        <span className="chart-sub">Electronic health record · read only{totalStages ? ` · showing information through stage ${stage} of ${totalStages}` : ''}</span>
      </header>
      <div className="chart-tabs" role="tablist" aria-label="Chart sections">
        {tabs.map(t => (
          <button key={t} role="tab" aria-selected={tab === t} className={'chart-tab' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>
            {TAB_LABEL[t]}{newTabs.has(t) && <span className="new-dot">NEW</span>}
          </button>
        ))}
      </div>
      <div className="chart-body" role="tabpanel">
        {shown.map((e, i) => (
          <div key={i} className={'entry' + (e.stage === stage && stage > 1 ? ' is-new' : '')}>
            <div className="entry-meta">
              {e.time && <span className="entry-time">{e.time}</span>}
              {totalStages && totalStages > 1 && <span className="entry-stage">{e.stage === stage && stage > 1 ? 'New at this stage' : `Stage ${e.stage}`}</span>}
            </div>
            {e.text && <p className="entry-text">{e.text}</p>}
            {e.table && (
              <div className="ehr-wrap">
                <table className="ehr">
                  {e.table.title && <caption>{e.table.title}</caption>}
                  <thead><tr>{e.table.head.map((h, k) => <th key={k} scope="col">{h}</th>)}</tr></thead>
                  <tbody>{e.table.rows.map((row, r) => (
                    <tr key={r}>{row.map((c, k) => k === 0
                      ? <th key={k} scope="row" data-label={e.table!.head[0]}>{c}</th>
                      : <td key={k} data-label={e.table!.head[k]}>{c}</td>)}</tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
