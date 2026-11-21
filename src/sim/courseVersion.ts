import type { Course } from './course';
import { fnv1aString } from './fixed';
import { TUNING } from './tuning';
import { OBSTACLE_SIZE, PERFECT_WINDOW, HURDLE_H, BAR_UNDERSIDE, BEAM_TRIGGER } from './obstacles';

/** Hash of Course data + tuning: any change invalidates old Ghosts (SPEC §7.6). */
export function courseVersion(course: Course): string {
  const text = JSON.stringify({
    course,
    TUNING,
    OBSTACLE_SIZE,
    PERFECT_WINDOW,
    HURDLE_H,
    BAR_UNDERSIDE,
    BEAM_TRIGGER,
    sim: 4,
  });
  return fnv1aString(text).toString(16).padStart(8, '0');
}
