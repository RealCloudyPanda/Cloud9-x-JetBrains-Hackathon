/**
 * Fixed-point helpers. All simulation state is integer: distances and velocities are
 * stored in 1/256 px (FP = 256), Flow is stored in milli (1000 = 1.0).
 * See docs/adr/0002-integer-fixed-point-simulation.md.
 */
export const FP = 256;

/** Convert whole/fractional pixels (a constant written by a human) to fixed-point. */
export function px(value: number): number {
  return Math.round(value * FP);
}

/** Fixed-point to whole pixels, truncating toward zero. */
export function toPx(value: number): number {
  return Math.trunc(value / FP);
}

/** Integer division, truncating toward zero (never produces a float in state). */
export function idiv(a: number, b: number): number {
  return Math.trunc(a / b);
}

/** 32-bit FNV-1a over a list of integers. */
export function fnv1a(values: readonly number[], seed = 0x811c9dc5): number {
  let h = seed >>> 0;
  for (let i = 0; i < values.length; i++) {
    let v = values[i] | 0;
    for (let b = 0; b < 4; b++) {
      h ^= v & 0xff;
      h = Math.imul(h, 0x01000193) >>> 0;
      v >>= 8;
    }
  }
  return h >>> 0;
}

/** 32-bit FNV-1a over a string's UTF-16 code units. */
export function fnv1aString(text: string, seed = 0x811c9dc5): number {
  let h = seed >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i) & 0xff;
    h = Math.imul(h, 0x01000193) >>> 0;
    h ^= text.charCodeAt(i) >> 8;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
