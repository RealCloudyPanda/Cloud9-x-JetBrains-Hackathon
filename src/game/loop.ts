export const TICK_MS = 1000 / 60;
export const MAX_TICKS_PER_FRAME = 5;

export function advanceAccumulator(acc: number, elapsedMs: number): { ticks: number; acc: number } {
  let next = acc + Math.max(0, elapsedMs);
  let ticks = Math.floor(next / TICK_MS);
  if (ticks > MAX_TICKS_PER_FRAME) {
    ticks = MAX_TICKS_PER_FRAME;
    next = 0;
  } else {
    next -= ticks * TICK_MS;
  }
  return { ticks, acc: next };
}

export interface LoopHandlers {
  tick(): void;
  frame(alpha: number, dtMs: number): void;
}

export function startLoop(h: LoopHandlers): () => void {
  let acc = 0;
  let last = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const dt = now - last;
    last = now;
    const r = advanceAccumulator(acc, dt);
    acc = r.acc;
    for (let i = 0; i < r.ticks; i++) h.tick();
    h.frame(acc / TICK_MS, Math.min(100, dt));
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
