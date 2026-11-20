import { TUNING } from './tuning';
import { idiv } from './fixed';

/** Flow after a clean or Perfect clear. */
export function flowAfterClear(flow: number, perfect: boolean): number {
  const next = flow + (perfect ? TUNING.flowPerfect : TUNING.flowClean);
  return next > TUNING.flowMax ? TUNING.flowMax : next;
}

/** Passive recovery toward 1.00 when below it; never above 1.00 without clears. */
export function recoverFlow(flow: number): number {
  if (flow >= TUNING.flowStart) return flow;
  const next = flow + TUNING.recoveryPerTick;
  return next > TUNING.flowStart ? TUNING.flowStart : next;
}

/** Flow after a Hit. */
export function flowAfterHit(flow: number): number {
  return flow < TUNING.hitFlow ? flow : TUNING.hitFlow;
}

/** Speed in fixed-point px/Tick for the given Flow, burst and Stumble. */
export function speedFor(flow: number, burstTicks: number, stumbling: boolean): number {
  const burst = idiv(TUNING.burstFlow * burstTicks, TUNING.burstTicks);
  let speed = idiv(TUNING.baseSpeed * (flow + burst), 1000);
  if (stumbling) speed = idiv(speed, TUNING.stumbleSpeedDiv);
  return speed;
}
