/** Every timing rule of the booth, in milliseconds (SPEC §2–3). */
export const TIMERS = {
  countdown: 3000,
  /** Results ignores input this long so a held button from the Run doesn't skip it. */
  resultsGuard: 900,
  resultsAuto: 8000,
  initialsIdle: 12000,
  submitted: 1600,
  idle: 30000,
} as const;

export type Clock = () => number;
