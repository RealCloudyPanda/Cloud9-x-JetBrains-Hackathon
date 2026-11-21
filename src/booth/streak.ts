export function nextStreak(prev: number, beatRival: boolean): number {
  return beatRival ? prev + 1 : 0;
}
