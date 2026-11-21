export const TIMERS = {
  countdown: 3000,
  resultsGuard: 900,
  resultsAuto: 8000,
  initialsIdle: 12000,
  submitted: 1600,
  idle: 30000,
} as const;

export type Clock = () => number;
