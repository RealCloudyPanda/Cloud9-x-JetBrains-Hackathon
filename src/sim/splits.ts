
export function gateDelta(player: readonly number[], ghost: readonly number[], i: number): number | null {
  if (player[i] < 0 || ghost[i] < 0) return null;
  return player[i] - ghost[i];
}

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

export function formatDelta(ticks: number): string {
  const s = Math.abs(ticks) / 60;
  const sign = ticks < 0 ? '−' : '+';
  return `${sign}${s.toFixed(2)}`;
}

export function formatTime(ticks: number): string {
  return (ticks / 60).toFixed(2);
}
