import { saveLiveRun, type LiveRun } from './broadcast';
import type { KV } from './storage';

export class LiveFeed {
  private live: LiveRun | null = null;

  constructor(private kv: KV, private channel: BroadcastChannel | null, private now: () => number = Date.now) {}

  start(day: string, rival: string, gateCount: number): void {
    this.live = { day, rival, deltas: Array.from({ length: gateCount }, () => null), updatedAt: 0 };
    this.publish();
  }

  gate(index: number, delta: number | null): void {
    if (!this.live) return;
    this.live.deltas[index] = delta;
    this.publish();
  }

  clear(): void {
    this.live = null;
    this.publish();
  }

  notify(): void {
    try {
      this.channel?.postMessage('changed');
    } catch {
      return;
    }
  }

  private publish(): void {
    if (this.live) this.live.updatedAt = this.now();
    saveLiveRun(this.kv, this.live);
    this.notify();
  }
}
