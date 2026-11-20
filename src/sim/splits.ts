/** Split and Delta math (SPEC §6.3). All values are Ticks; negative = player faster. */

/** Cumulative Delta at gate i, or null if either side never reached it. */
export function gateDelta(player: readonly number[], ghost: readonly number[], i: number): number | null {
  if (player[i] < 0 || ghost[i] < 0) return null;
  return player[i] - ghost[i];
}

/** Per-segment Deltas: (p_i − p_{i−1}) − (g_i − g_{i−1}). */
export function segmentDeltas(player: readonly number[], ghost: readonly number[]): (number | null)[] {
  return player.map((p, i) => {
    const g = ghost[i];
    if (p < 0 || g < 0) return null;
    const pPrev = i === 0 ? 0 : player[i - 1];
    const gPrev = i === 0 ? 0 : ghost[i - 1];
    if (pPrev < 0 || gPrev < 0) return null;
    return p - pPrev - (g - gPrev);
  });
}

/** Ticks → signed seconds text with two decimals, always with a sign ("−" is U+2212). */
export function formatDelta(ticks: number): string {
  const s = Math.abs(ticks) / 60;
  const sign = ticks < 0 ? '−' : '+';
  return `${sign}${s.toFixed(2)}`;
}

export function formatTime(ticks: number): string {
  return (ticks / 60).toFixed(2);
}
