import { MemoryKV } from './memoryKv';
import { PREFIX, type KV } from './storage';

export class SessionKV implements KV {
  private memory = new MemoryKV();
  persistent = true;
  constructor(private backing: KV | null) {
    if (!backing) { this.persistent = false; return; }
    try {
      for (let i = 0; i < backing.length; i++) {
        const key = backing.key(i);
        if (key?.startsWith(PREFIX)) {
          const value = backing.getItem(key);
          if (value !== null) this.memory.setItem(key, value);
        }
      }
      const probe = `${PREFIX}probe`;
      backing.setItem(probe, '1');
      backing.removeItem(probe);
    } catch { this.persistent = false; }
  }
  get length(): number { return this.memory.length; }
  key(i: number): string | null { return this.memory.key(i); }
  getItem(key: string): string | null { return this.memory.getItem(key); }
  setItem(key: string, value: string): void {
    this.memory.setItem(key, value);
    if (this.persistent) {
      try { this.backing!.setItem(key, value); }
      catch { this.persistent = false; }
    }
  }
  removeItem(key: string): void {
    this.memory.removeItem(key);
    if (this.persistent) {
      try { this.backing!.removeItem(key); }
      catch { this.persistent = false; }
    }
  }
}

export function browserStorage(): SessionKV {
  try { return new SessionKV(window.localStorage); }
  catch { return new SessionKV(null); }
}
