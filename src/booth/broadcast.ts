/** Live hints to the Leaderboard Monitor. Messages are hints; the monitor always re-reads storage. */
export type BoardMessage =
  | { type: 'run-started'; rivalInitials: string; rivalSplits: number[] }
  | { type: 'split'; gateIndex: number; tick: number; delta: number | null }
  | { type: 'run-finished'; id: string }
  | { type: 'board-changed' }
  | { type: 'board-reset' };

export const CHANNEL = 'ghost-relay';

export function openChannel(): BroadcastChannel | null {
  try {
    return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
}
