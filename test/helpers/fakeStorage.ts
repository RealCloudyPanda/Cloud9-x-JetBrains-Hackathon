import type { KV } from '../../src/booth/storage';

export class FakeStorage implements KV {
  private map = new Map<string, string>();
  constructor(private quota = Infinity) {}
  get length() {
    return this.map.size;
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    let total = (k.length + v.length) * 2;
    for (const [kk, vv] of this.map) if (kk !== k) total += (kk.length + vv.length) * 2;
    if (total > this.quota) {
      const e = new Error('The quota has been exceeded.');
      e.name = 'QuotaExceededError';
      throw e;
    }
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}
