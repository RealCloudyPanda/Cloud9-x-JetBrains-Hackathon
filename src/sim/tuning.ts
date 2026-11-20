import { px } from './fixed';

/**
 * Every gameplay number lives here (SPEC §5). Values are fixed-point (×256) for
 * distances/velocities and milli for Flow. Changing anything here changes the
 * Course Version and invalidates old Ghosts, by design.
 */
export const TUNING = {
  tickRate: 60,
  baseSpeed: px(6), // px/Tick
  flowMin: 600,
  flowMax: 1350,
  flowStart: 1000,
  flowClean: 40,
  flowPerfect: 80,
  burstTicks: 20,
  burstFlow: 100, // extra Flow at the start of a burst, fading linearly
  hitFlow: 700,
  stumbleTicks: 24,
  pitStumbleTicks: 30,
  stumbleSpeedDiv: 2,
  recoveryPerTick: 2,
  jumpVelocity: px(10.5),
  gravityHold: px(0.62),
  gravity: px(1.1),
  gravityFastFall: px(2.75),
  jumpHoldTicks: 14,
  slideMinTicks: 18,
  bufferTicks: 6,
  coyoteTicks: 5,
  runnerW: 28,
  runnerH: 48,
  slideW: 44,
  slideH: 22,
  /** Hitbox forgiveness, px: horizontal inset each side, feet and head insets. */
  hitInsetX: 8,
  hitInsetFeet: 10,
  hitInsetHead: 4,
  timeCap: 3600,
} as const;

export const MASK_JUMP = 1;
export const MASK_SLIDE = 2;
