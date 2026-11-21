import { TUNING } from './tuning';
import { idiv } from './fixed';

export function flowAfterClear(flow: number, perfect: boolean): number {
  const next = flow + (perfect ? TUNING.flowPerfect : TUNING.flowClean);
  return next > TUNING.flowMax ? TUNING.flowMax : next;
}

export function recoverFlow(flow: number): number {
  if (flow >= TUNING.flowStart) return flow;
  const next = flow + TUNING.recoveryPerTick;
  return next > TUNING.flowStart ? TUNING.flowStart : next;
}

export function flowAfterHit(flow: number): number {
  return flow < TUNING.hitFlow ? flow : TUNING.hitFlow;
}

export function speedFor(flow: number, burstTicks: number, stumbling: boolean): number {
  const burst = idiv(TUNING.burstFlow * burstTicks, TUNING.burstTicks);
  let speed = idiv(TUNING.baseSpeed * (flow + burst), 1000);
  if (stumbling) speed = idiv(speed, TUNING.stumbleSpeedDiv);
  return speed;
}
