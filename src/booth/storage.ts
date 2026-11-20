import type { GhostRecord } from './record';

/** The subset of the Web Storage API we use (so tests can pass a fake). */
export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}

export const PREFIX = 'ghostrelay:v1:';
export const META_KEY = `${PREFIX}meta`;
export const RUNS_PREFIX = `${PREFIX}runs:`;
export const KEEP_INPUTS_LATEST = 30;
export const KEEP_INPUTS_TOP = 10;
export const MAX_RECORDS = 500;

export interface Settings {
  sound: boolean;
  shake: boolean;
  forceHouse: boolean;
}

export interface Meta {
  /** Board id: a calendar date, plus "~N" if the Operator started a new day on the same date. */
  currentDay: string;
  runCounter: number;
  relayStreak: number;
  bestStreak: number;
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = { sound: true, shake: true, forceHouse: false };

export function dateKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function freshMeta(today: string): Meta {
  return { currentDay: today, runCounter: 0, relayStreak: 0, bestStreak: 0, settings: { ...DEFAULT_SETTINGS } };
}

function safeParse<T>(text: string | null): T | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Read meta, rolling over to a fresh board if the calendar date changed. */
export function loadMeta(kv: KV, today: string): Meta {
  const m = safeParse<Meta>(kv.getItem(META_KEY));
  if (!m || typeof m.currentDay !== 'string') return freshMeta(today);
  const settings = { ...DEFAULT_SETTINGS, ...(m.settings ?? {}) };
  if (!m.currentDay.startsWith(today)) {
    return { ...freshMeta(today), settings };
  }
  return { ...freshMeta(today), ...m, settings };
}

/** Operator "Start new day": a new, empty board even if the date is unchanged. */
export function startNewDay(kv: KV, meta: Meta, today: string): Meta {
  let id = today;
  for (let n = 2; kv.getItem(RUNS_PREFIX + id) !== null || id === meta.currentDay; n++) id = `${today}~${n}`;
  const next: Meta = { ...freshMeta(id), settings: meta.settings };
  saveMeta(kv, next);
  return next;
}

export function loadRuns(kv: KV, day: string): GhostRecord[] {
  const runs = safeParse<GhostRecord[]>(kv.getItem(RUNS_PREFIX + day));
  return Array.isArray(runs) ? runs : [];
}

/** Today's top runs, fastest first (DNFs excluded). */
export function topRuns(runs: GhostRecord[], n: number): GhostRecord[] {
  return runs
    .filter((r) => !r.dnf)
    .slice()
    .sort((a, b) => a.finishTick - b.finishTick || a.createdAt - b.createdAt)
    .slice(0, n);
}

/** Drop inputs from anything that is neither recent nor top; cap the record count. */
export function trimRuns(runs: GhostRecord[]): GhostRecord[] {
  let out = runs.length > MAX_RECORDS ? runs.slice(runs.length - MAX_RECORDS) : runs.slice();
  const keep = new Set<string>(out.slice(-KEEP_INPUTS_LATEST).map((r) => r.id));
  for (const r of topRuns(out, KEEP_INPUTS_TOP)) keep.add(r.id);
  out = out.map((r) => (keep.has(r.id) || r.inputs === null ? r : { ...r, inputs: null }));
  return out;
}

function isQuota(e: unknown): boolean {
  return e instanceof Error && /quota/i.test(`${e.name} ${e.message}`);
}

/** Delete the oldest runs key that isn't `keepDay`. Returns true if something was deleted. */
export function dropOldestDay(kv: KV, keepDay: string): boolean {
  const days: string[] = [];
  for (let i = 0; i < kv.length; i++) {
    const k = kv.key(i);
    if (k && k.startsWith(RUNS_PREFIX) && k !== RUNS_PREFIX + keepDay) days.push(k);
  }
  days.sort();
  if (!days.length) return false;
  kv.removeItem(days[0]);
  return true;
}

/** setItem with one retry after freeing the oldest day on quota errors. */
export function safeSet(kv: KV, key: string, value: string, keepDay: string): boolean {
  try {
    kv.setItem(key, value);
    return true;
  } catch (e) {
    if (!isQuota(e) || !dropOldestDay(kv, keepDay)) return false;
    try {
      kv.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

export function saveMeta(kv: KV, meta: Meta): boolean {
  return safeSet(kv, META_KEY, JSON.stringify(meta), meta.currentDay);
}

export function appendRun(kv: KV, day: string, record: GhostRecord): GhostRecord[] {
  const runs = trimRuns([...loadRuns(kv, day), record]);
  safeSet(kv, RUNS_PREFIX + day, JSON.stringify(runs), day);
  return runs;
}

/** Replace a stored record (used when Initials are entered after the Run was saved). */
export function updateRun(kv: KV, day: string, id: string, patch: Partial<GhostRecord>): GhostRecord[] {
  const runs = loadRuns(kv, day).map((r) => (r.id === id ? { ...r, ...patch } : r));
  safeSet(kv, RUNS_PREFIX + day, JSON.stringify(runs), day);
  return runs;
}

/** Bytes used by this app's keys (UTF-16 length, as browsers count it). */
export function storedBytes(kv: KV): number {
  let n = 0;
  for (let i = 0; i < kv.length; i++) {
    const k = kv.key(i);
    if (k && k.startsWith(PREFIX)) n += (k.length + (kv.getItem(k)?.length ?? 0)) * 2;
  }
  return n;
}
