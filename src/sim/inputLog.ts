/** Input Log: change events [tick, mask]; a new event only when the mask changes (SPEC §6.1). */
export type InputLog = [number, number][];

export interface Recorder {
  log: InputLog;
  last: number;
}

export function createRecorder(): Recorder {
  return { log: [], last: 0 };
}

/** Record the mask used for the step that starts at `tick`. */
export function record(rec: Recorder, tick: number, mask: number): void {
  if (mask !== rec.last) {
    rec.log.push([tick, mask]);
    rec.last = mask;
  }
}

export interface Cursor {
  log: InputLog;
  i: number;
  mask: number;
}

export function createCursor(log: InputLog): Cursor {
  return { log, i: 0, mask: 0 };
}

/** Mask for `tick`. Ticks must be requested in non-decreasing order. */
export function maskAt(c: Cursor, tick: number): number {
  while (c.i < c.log.length && c.log[c.i][0] <= tick) {
    c.mask = c.log[c.i][1];
    c.i++;
  }
  return c.mask;
}

export function encodeLog(log: InputLog): string {
  return JSON.stringify(log);
}

export function decodeLog(text: string): InputLog {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('bad input log');
  return parsed.map((e) => {
    if (!Array.isArray(e) || e.length !== 2) throw new Error('bad input event');
    return [e[0] | 0, e[1] & 3] as [number, number];
  });
}
