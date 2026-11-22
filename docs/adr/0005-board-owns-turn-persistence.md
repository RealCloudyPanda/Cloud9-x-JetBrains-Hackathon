# 5. Board owns the current course view and Turn persistence

Status: accepted (2026-11-21)

The player and Leaderboard Monitor use the Board module at the existing KV seam. The Board owns loading and recovery, calendar rollover, same-day operator resets, course eligibility, ranking, Run identity, Relay Streak updates, retention and Initials persistence. Callers provide a finished simulation and Input Log rather than sequencing metadata writes and record appends themselves.

MemoryKV and SessionKV remain adapters at the same seam. Existing storage keys, quota recovery, historical exports and the offline-only design stay compatible. Board views are copies, so presentation code cannot accidentally change counters, settings or recorded inputs. Ghost verification stays a supplied dependency; the Board does not depend on rendering or browser globals. Live Run broadcasts and station heartbeat remain in their existing module because they describe a running station rather than saved Runs.

Tests cross the Board interface used by the player and monitor. Storage tests retain retention and quota mechanics; duplicate append/rollover/reset stitching tests move to completed-Turn, recovery and settings scenarios. Full app tests still exercise actual Turns and Ghost playback.
