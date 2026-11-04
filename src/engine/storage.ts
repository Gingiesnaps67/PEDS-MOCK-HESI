// Persistence: browser storage (always) + the artifact's private per-user database (when available).
import type { Store, Attempt, ActiveExam, Conf, ItemStat } from '../types';

/** v1 → original release; v2 → 1–5 confidence, mistake tags, first-attempt tracking, rapid-review stats */
export const STORE_VERSION = 2;
export const LS_KEY = 'pedsHesi2026:store';

export function defaultStore(): Store {
  return {
    version: STORE_VERSION, updatedAt: 0,
    settings: { navigation: 'linear', minutes: 130, unscoredItems: true, confidence: true, examDate: '', weights: {} },
    itemStats: {}, missed: {}, attempts: [], active: null, srs: {},
    formRotation: { lastForm: null, served: {} },
    mistakes: {}, rapid: { games: {}, cards: {} }, upgradedAt: 0,
  };
}

/** version-1 confidence words → 1–5 scale (low 2, medium 3, high 5); numbers pass through */
export function normConf(c: unknown): Conf | undefined {
  if (typeof c === 'number' && c >= 1 && c <= 5) return Math.round(c) as Conf;
  if (c === 'low') return 2;
  if (c === 'med') return 3;
  if (c === 'high') return 5;
  return undefined;
}
const confMap = (m: unknown): Record<string, Conf> => {
  const out: Record<string, Conf> = {};
  if (m && typeof m === 'object') Object.entries(m as Record<string, unknown>).forEach(([k, v]) => { const c = normConf(v); if (c) out[k] = c; });
  return out;
};
function upgradeAttempts(list: unknown): Attempt[] {
  if (!Array.isArray(list)) return [];
  return list.filter(a => a && typeof a === 'object' && Array.isArray((a as Attempt).items)).map(a => ({
    ...(a as Attempt),
    items: (a as Attempt).items.map(i => { const conf = normConf(i.conf); const { conf: _drop, ...rest } = i; void _drop; return conf ? { ...rest, conf } : rest; }),
  }));
}
/** first-attempt result per item, reconstructed from stored history (oldest attempt wins) */
function backfillFirst(stats: Record<string, ItemStat>, attempts: Attempt[]): Record<string, ItemStat> {
  const out: Record<string, ItemStat> = {};
  Object.entries(stats).forEach(([k, v]) => { out[k] = { ...v }; });
  [...attempts].sort((x, y) => x.finishedAt - y.finishedAt).forEach(a => a.items.forEach(i => {
    const st = out[i.id];
    if (st && st.firstFull === undefined) {
      // only trust the history when it holds every exposure of this item
      const exposures = attempts.reduce((n, at) => n + at.items.filter(x => x.id === i.id).length, 0);
      if (exposures >= st.seen) { st.firstFull = i.full; st.firstAt = a.finishedAt; }
    }
  }));
  return out;
}

/** upgrade older shapes; unknown/invalid input falls back to defaults */
export function migrate(raw: unknown): Store {
  const d = defaultStore();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Partial<Store> & { version?: number };
  if (typeof r.version === 'number' && r.version > STORE_VERSION) return { ...d, ...r } as Store; // newer app wrote it; keep as-is
  const fromV1 = !(typeof r.version === 'number' && r.version >= 2);
  const attempts = upgradeAttempts(r.attempts);
  const itemStats = fromV1 ? backfillFirst(r.itemStats ?? {}, attempts) : (r.itemStats ?? {});
  const active = r.active ? { ...r.active, confidence: confMap(r.active.confidence) } : null;
  const rapid = r.rapid && typeof r.rapid === 'object' ? { games: r.rapid.games ?? {}, cards: r.rapid.cards ?? {} } : d.rapid;
  return {
    ...d, ...r,
    version: STORE_VERSION,
    settings: { ...d.settings, ...(r.settings ?? {}) },
    formRotation: { ...d.formRotation, ...(r.formRotation ?? {}) },
    itemStats, missed: r.missed ?? {}, srs: r.srs ?? {},
    attempts, active,
    mistakes: r.mistakes ?? {}, rapid,
    // everything recorded before this upgrade is labelled "historical"
    upgradedAt: fromV1 ? (attempts.length ? Date.now() : 0) : (r.upgradedAt ?? 0),
  };
}

export function loadLocal(): Store | null {
  try { const s = localStorage.getItem(LS_KEY); return s ? migrate(JSON.parse(s)) : null; } catch { return null; }
}
export function saveLocal(s: Store) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
}

/** merge two stores: newest core wins, attempts are unioned by id */
export function mergeStores(a: Store | null, b: Store | null): Store {
  if (!a) return b ?? defaultStore();
  if (!b) return a;
  const [newer, older] = a.updatedAt >= b.updatedAt ? [a, b] : [b, a];
  const attempts = new Map<string, Attempt>();
  [...older.attempts, ...newer.attempts].forEach(x => attempts.set(x.id, x));
  const up = [a.upgradedAt, b.upgradedAt].filter(x => x > 0);
  return {
    ...newer,
    attempts: [...attempts.values()].sort((x, y) => x.finishedAt - y.finishedAt).slice(-60),
    mistakes: { ...older.mistakes, ...newer.mistakes },
    rapid: { games: { ...older.rapid.games, ...newer.rapid.games }, cards: { ...older.rapid.cards, ...newer.rapid.cards } },
    upgradedAt: up.length ? Math.min(...up) : 0,
  };
}

export function exportJson(s: Store): string {
  return JSON.stringify({ app: 'PEDS HESI 2026', exportedAt: new Date().toISOString(), store: s }, null, 1);
}
export function importJson(text: string): Store {
  const parsed = JSON.parse(text);
  const raw = parsed && parsed.store ? parsed.store : parsed;
  if (!raw || typeof raw !== 'object' || !('itemStats' in raw)) throw new Error('This file is not a PEDS HESI progress export.');
  return migrate(raw);
}

/* ---------------- cloud (artifact db capability) ---------------- */
type Db = { doc(path: string): { get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>; set(d: Record<string, unknown>): Promise<unknown> }; collection(path: string): { get?: unknown } };
interface Claude { use(name: string): Promise<unknown> }

export class Cloud {
  db: Db | null = null; uid: string | null = null; ready = false; status: 'off' | 'connecting' | 'on' | 'error' = 'off';
  async init(): Promise<boolean> {
    const c = (window as unknown as { claude?: Claude }).claude;
    if (!c?.use) { this.status = 'off'; return false; }
    this.status = 'connecting';
    try {
      const [db, user] = await Promise.all([c.use('db'), c.use('user')]) as [Db | null, { id(): Promise<string | null> } | null];
      if (!db || !user) { this.status = 'off'; return false; }
      const id = await user.id();
      if (!id) { this.status = 'off'; return false; }
      this.db = db; this.uid = id; this.ready = true; this.status = 'on';
      return true;
    } catch { this.status = 'error'; return false; }
  }
  private p(name: string) { return `data/users/${this.uid}/${name}`; }
  async load(): Promise<Store | null> {
    if (!this.ready || !this.db) return null;
    try {
      const [core, act, hist] = await Promise.all([this.db.doc(this.p('core')).get(), this.db.doc(this.p('active')).get(), this.db.doc(this.p('history')).get()]);
      if (!core.exists) return null;
      const c = core.data() as unknown as Store;
      const a = act.exists ? (act.data() as { exam: ActiveExam | null }).exam : null;
      const h = hist.exists ? (hist.data() as { attempts: Attempt[] }).attempts : [];
      return migrate({ ...c, active: a, attempts: h });
    } catch { this.status = 'error'; return null; }
  }
  private lastHist = '';
  async save(s: Store, opts: { activeOnly?: boolean } = {}) {
    if (!this.ready || !this.db) return;
    try {
      await this.db.doc(this.p('active')).set({ exam: s.active, updatedAt: s.updatedAt });
      if (opts.activeOnly) return;
      const { attempts, active, ...core } = s; void active;
      await this.db.doc(this.p('core')).set(core as unknown as Record<string, unknown>);
      // history: keep under the 256 KiB document limit by dropping responses from older attempts
      let trimmed = attempts.slice(-40);
      let json = JSON.stringify(trimmed);
      if (json.length > 230_000) {
        trimmed = trimmed.map((a, i) => (i < trimmed.length - 8 ? { ...a, items: a.items.map(({ response, ...x }) => { void response; return x; }) } : a));
        json = JSON.stringify(trimmed);
        while (json.length > 230_000 && trimmed.length > 5) { trimmed = trimmed.slice(1); json = JSON.stringify(trimmed); }
      }
      if (json !== this.lastHist) { await this.db.doc(this.p('history')).set({ attempts: trimmed }); this.lastHist = json; }
      this.status = 'on';
    } catch { this.status = 'error'; }
  }
}
