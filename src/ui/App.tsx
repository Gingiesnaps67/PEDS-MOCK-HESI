import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './state';
import type { View } from './state';
import { Dashboard, Setup, Cases, Practice, Missed, Dosage } from './Pages';
import { Blueprint, Coverage, Analytics, Plan, Settings } from './Pages2';
import { ExamRunner } from './Exam';
import { Results } from './Results';
import { RapidReviewButton, GrowthPage, SourcesPage } from './Rapid';
import { VitalsGrowthPage } from './VitalsGrowth';
import type { Store } from '../types';

const NAV: [View['name'], string][] = [
  ['dashboard', 'Dashboard'], ['setup', 'Mock exam'], ['cases', 'Cases'], ['practice', 'Practice'], ['vitals', 'Vitals & Growth'], ['growth', 'Growth & Dev'], ['blueprint', 'Blueprint'],
  ['missed', 'Missed'], ['dosage', 'Dosage'], ['analytics', 'Analytics'], ['plan', 'Study plan'], ['sources', 'Sources'], ['settings', 'Settings'],
];

function Shell() {
  const { view, go, store, cloud } = useApp();
  const [menu, setMenu] = useState(false);
  const [exp, setExp] = useState<{ filename: string; text: string } | null>(null);
  useEffect(() => {
    const h = (e: Event) => setExp((e as CustomEvent).detail);
    window.addEventListener('peds-export', h);
    return () => window.removeEventListener('peds-export', h);
  }, []);
  const inExam = view.name === 'exam' && !!store.active;
  return (
    <div className="app">
      {!inExam && (
        <header className="topbar">
          <button className="brand" onClick={() => go({ name: 'dashboard' })} aria-label="PEDS HESI 2026 dashboard">
            <span className="brand-mark" aria-hidden>PH</span><span className="brand-t">PEDS HESI 2026</span><span className="brand-s">Clinical Judgment Simulator</span>
          </button>
          <button className="menu-btn" aria-expanded={menu} aria-controls="mainnav" onClick={() => setMenu(!menu)}>Menu</button>
          <nav id="mainnav" className={'mainnav' + (menu ? ' open' : '')} aria-label="Main">
            {NAV.map(([n, l]) => <button key={n} aria-current={view.name === n ? 'page' : undefined} className={view.name === n ? 'on' : ''} onClick={() => { go({ name: n } as View); setMenu(false); }}>{l}</button>)}
          </nav>
          <span className={'sync ' + cloud} title={cloud === 'on' ? 'Progress syncs to your Claude account' : 'Progress saved in this browser'}>{cloud === 'on' ? 'Synced' : cloud === 'connecting' ? 'Connecting' : 'Saved locally'}</span>
        </header>
      )}
      {view.name === 'dashboard' && <Dashboard />}
      {view.name === 'setup' && <Setup />}
      {view.name === 'exam' && (store.active ? <ExamRunner key={store.active.id} /> : <main className="page"><p>No exam in progress.</p><button className="btn primary" onClick={() => go({ name: 'setup' })}>Start one</button></main>)}
      {view.name === 'results' && <Results id={view.id} />}
      {view.name === 'cases' && <Cases />}
      {view.name === 'practice' && <Practice tab={view.tab} key={view.tab} />}
      {view.name === 'blueprint' && <Blueprint topic={view.topic} key={view.topic ?? 0} />}
      {view.name === 'coverage' && <Coverage />}
      {view.name === 'missed' && <Missed />}
      {view.name === 'dosage' && <Dosage />}
      {view.name === 'analytics' && <Analytics />}
      {view.name === 'plan' && <Plan />}
      {view.name === 'settings' && <Settings />}
      {view.name === 'growth' && <GrowthPage />}
      {view.name === 'sources' && <SourcesPage />}
      {view.name === 'vitals' && <VitalsGrowthPage />}
      <RapidReviewButton />
      {exp && (
        <div className="modal-back" role="dialog" aria-modal="true" aria-labelledby="exp-h">
          <div className="modal">
            <h2 id="exp-h">Save {exp.filename}</h2>
            <p className="small">Downloads aren’t available here, so copy this text and paste it into a file named <span className="mono">{exp.filename}</span>.</p>
            <textarea readOnly value={exp.text} rows={10} onFocus={e => e.currentTarget.select()} aria-label="Export contents" />
            <div className="row gap">
              <button className="btn primary" onClick={() => { navigator.clipboard?.writeText(exp.text).catch(() => undefined); }}>Copy</button>
              <button className="btn" onClick={() => setExp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function App({ initial }: { initial?: Store }) {
  return <AppProvider initial={initial}><Shell /></AppProvider>;
}
