export const C = {
  ink: 'oklch(0.16 0.02 250)',
  inkDeep: 'oklch(0.12 0.02 250)',
  inkRaised: 'oklch(0.21 0.025 250)',
  grid: 'oklch(0.32 0.04 250 / 0.55)',
  line: 'oklch(0.95 0.01 250)',
  lime: 'oklch(0.90 0.20 128)',
  limeDim: 'oklch(0.90 0.20 128 / 0.22)',
  cyan: 'oklch(0.82 0.12 210)',
  cyanDim: 'oklch(0.82 0.12 210 / 0.2)',
  orange: 'oklch(0.72 0.19 45)',
  orangeDim: 'oklch(0.72 0.19 45 / 0.25)',
  text: 'oklch(0.95 0.01 250)',
  text2: 'oklch(0.72 0.02 250)',
  text3: 'oklch(0.55 0.02 250)',
  neutral: 'oklch(0.60 0.02 250)',
  obstacle: 'oklch(0.86 0.08 300)',
  obstacleGlow: 'oklch(0.86 0.08 300 / 0.18)',
} as const;

export const FONT_DISPLAY = '"Chakra Petch", system-ui, sans-serif';
export const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

export function display(size: number, weight = 700): string {
  return `${weight} ${size}px ${FONT_DISPLAY}`;
}

export function mono(size: number, weight = 500): string {
  return `${weight} ${size}px ${FONT_MONO}`;
}

export function tracked(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.letterSpacing = `${(size * 0.04).toFixed(1)}px`;
}

export const EASE_OUT = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
export const EASE_OUT_STRONG = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 5);
