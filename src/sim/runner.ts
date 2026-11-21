import { FP } from './fixed';
import { TUNING } from './tuning';

export interface RunnerState {
  x: number;
  y: number;
  vy: number;
  grounded: number;
  coyote: number;
  buffer: number;
  hold: number;
  sliding: number;
  slideTicks: number;
  stumble: number;
  jumpFront: number;
  slideFront: number;
}

export const NEVER = -(1 << 30);

export function createRunner(): RunnerState {
  return {
    x: 0,
    y: 0,
    vy: 0,
    grounded: 1,
    coyote: TUNING.coyoteTicks,
    buffer: 0,
    hold: 0,
    sliding: 0,
    slideTicks: 0,
    stumble: 0,
    jumpFront: NEVER,
    slideFront: NEVER,
  };
}

export function front(r: RunnerState): number {
  return r.x + TUNING.runnerW * FP;
}

export function boxW(r: RunnerState): number {
  return (r.sliding ? TUNING.slideW : TUNING.runnerW) * FP;
}

export function boxH(r: RunnerState): number {
  return (r.sliding ? TUNING.slideH : TUNING.runnerH) * FP;
}

export type RunnerEvent = 'jump' | 'slide' | 'land';

export function applyInput(r: RunnerState, mask: number, prevMask: number, out: RunnerEvent[]): void {
  const jumpHeld = (mask & 1) !== 0;
  const slideHeld = (mask & 2) !== 0;
  const jumpPressed = jumpHeld && (prevMask & 1) === 0;

  if (jumpPressed) r.buffer = TUNING.bufferTicks;
  else if (r.buffer > 0) r.buffer--;

  if (r.sliding) {
    r.slideTicks++;
    if (!slideHeld && r.slideTicks >= TUNING.slideMinTicks) r.sliding = 0;
  }

  const canJump = (r.grounded === 1 || r.coyote > 0) && r.stumble === 0;
  if (r.buffer > 0 && canJump) {
    r.vy = TUNING.jumpVelocity;
    r.grounded = 0;
    r.coyote = 0;
    r.hold = TUNING.jumpHoldTicks;
    r.buffer = 0;
    r.sliding = 0;
    r.slideTicks = 0;
    r.jumpFront = front(r);
    out.push('jump');
  }

  if (slideHeld && r.grounded === 1 && r.sliding === 0) {
    r.sliding = 1;
    r.slideTicks = 0;
    r.slideFront = front(r);
    out.push('slide');
  }
}

export function applyGravity(r: RunnerState, mask: number, supported: boolean, out: RunnerEvent[]): void {
  const jumpHeld = (mask & 1) !== 0;
  const slideHeld = (mask & 2) !== 0;

  if (r.grounded === 1) {
    if (supported) {
      r.coyote = TUNING.coyoteTicks;
      return;
    }
    r.grounded = 0;
    r.vy = 0;
  } else if (r.coyote > 0) {
    r.coyote--;
  }

  let g: number;
  if (jumpHeld && r.hold > 0 && r.vy > 0) {
    g = TUNING.gravityHold;
    r.hold--;
  } else {
    r.hold = 0;
    g = slideHeld ? TUNING.gravityFastFall : TUNING.gravity;
  }
  r.vy -= g;
  r.y += r.vy;

  if (r.y <= 0 && supported) {
    r.y = 0;
    r.vy = 0;
    r.grounded = 1;
    r.coyote = TUNING.coyoteTicks;
    out.push('land');
  }
}
