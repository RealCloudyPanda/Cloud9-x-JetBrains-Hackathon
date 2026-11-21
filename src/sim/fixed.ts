export const FP = 256;

export function px(value: number): number {
  return Math.round(value * FP);
}

export function toPx(value: number): number {
  return Math.trunc(value / FP);
}

export function idiv(a: number, b: number): number {
  return Math.trunc(a / b);
}

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
