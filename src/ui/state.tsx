import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Store } from '../types';
import { Cloud, defaultStore, loadLocal, mergeStores, saveLocal } from '../engine/storage';
import { registerGenerated } from '../data/bank';

export type View =
  | { name: 'dashboard' } | { name: 'setup' } | { name: 'exam' } | { name: 'results'; id: string }
  | { name: 'cases' } | { name: 'practice'; tab?: string } | { name: 'blueprint'; topic?: number }
  | { name: 'coverage' } | { name: 'missed' } | { name: 'dosage' } | { name: 'analytics' } | { name: 'plan' } | { name: 'settings' }
  | { name: 'growth' } | { name: 'sources' } | { name: 'vitals' };

interface Ctx {
  store: Store;
  update: (fn: (s: Store) => Store, opts?: { activeOnly?: boolean }) => void;
  view: View; go: (v: View) => void;
  cloud: Cloud['status'];
}
const C = createContext<Ctx | null>(null);
export const useApp = () => useContext(C)!;

const cloud = new Cloud();

export function AppProvider({ children, initial }: { children: React.ReactNode; initial?: Store }) {
  const [store, setStore] = useState<Store>(() => {
    const s = initial ?? loadLocal() ?? defaultStore();
    s.attempts.forEach(a => registerGenerated(a.generated)); registerGenerated(s.active?.generated);
    return s;
  });
  const [view, setView] = useState<View>({ name: 'dashboard' });
  const [cloudStatus, setCloudStatus] = useState<Cloud['status']>('off');
  const pending = useRef<{ t?: number; active: boolean }>({ active: true });
  const latest = useRef(store);
  latest.current = store;

  useEffect(() => {
    if (initial) return;
    let alive = true;
    cloud.init().then(async ok => {
      if (!alive) return;
      setCloudStatus(cloud.status);
      if (!ok) return;
      const remote = await cloud.load();
      if (!alive) return;
      if (remote) {
        remote.attempts.forEach(a => registerGenerated(a.generated)); registerGenerated(remote.active?.generated);
        const merged = mergeStores(latest.current, remote);
        setStore(merged); saveLocal(merged);
      } else if (latest.current.updatedAt > 0) cloud.save(latest.current);
      setCloudStatus(cloud.status);
    });
    return () => { alive = false; };
  }, [initial]);

  const update = useCallback((fn: (s: Store) => Store, opts: { activeOnly?: boolean } = {}) => {
    setStore(prev => {
      const next = { ...fn(prev), updatedAt: Date.now() };
      saveLocal(next);
      pending.current.active = pending.current.active && !!opts.activeOnly;
      window.clearTimeout(pending.current.t);
      pending.current.t = window.setTimeout(() => {
        const activeOnly = pending.current.active; pending.current.active = true;
        cloud.save(latest.current, { activeOnly }).then(() => setCloudStatus(cloud.status));
      }, opts.activeOnly ? 4000 : 800);
      return next;
    });
  }, []);

  const go = useCallback((v: View) => { setView(v); try { window.scrollTo({ top: 0 }); } catch { /* jsdom */ } }, []);
  return <C.Provider value={{ store, update, view, go, cloud: cloudStatus }}>{children}</C.Provider>;
}
