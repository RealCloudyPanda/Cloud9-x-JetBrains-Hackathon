# Glossary

Shared vocabulary for Ghost Relay. Terms only; implementation lives in [`docs/SPEC.md`](docs/SPEC.md).

**Run**
One player's attempt at the course, from the end of the countdown to crossing the Finish (or hitting the time cap).
_Avoid_: round, match, game, session.

**Turn**
Everything one person at the booth does: Attract → Countdown → Run → Results → Name Entry.
_Avoid_: session, play.

**Course**
The single fixed track every Run uses, with its obstacles and gates in a fixed order.
_Avoid_: level, map, stage.

**Course Version**
The identity of the Course's exact contents. Ghosts are only comparable within one Course Version.
_Avoid_: map hash, level id.

**Ghost**
A recorded Run replayed as a translucent runner the player races against. It cannot touch or block the player.
_Avoid_: bot, AI opponent, shadow, replay (when meaning the runner).

**Relay Ghost**
The Ghost of the previous player. The default rival.
_Avoid_: last ghost, previous replay.

**Champion Ghost**
The Ghost of today's fastest Run. Raced only when the player opts in.
_Avoid_: best ghost, record ghost, boss.

**House Ghost**
The Ghost shipped with the game, used when no other Ghost exists for the current Course Version.
_Avoid_: default ghost, demo ghost, CPU.

**Relay**
The chain of consecutive Turns in which each player races the one before.

**Relay Streak**
How many consecutive Runs beat the Ghost they raced.
_Avoid_: combo, win streak.

**Split Gate**
A marked point on the Course where elapsed time is captured for comparison. The Finish counts as the last one.
_Avoid_: checkpoint, sector, lap.

**Segment**
The stretch of Course between two consecutive Split Gates (or the start and the first gate).
_Avoid_: section, sector.

**Split**
The elapsed time at a Split Gate.

**Delta**
The difference between the player's and the Ghost's time for the same Split or Segment. Negative means the player was faster.
_Avoid_: diff, gap, margin.

**Jump**
The upward action. Held longer, it goes higher.
_Avoid_: hop, up.

**Slide**
The low action on the ground. In the air it becomes a fast-fall.
_Avoid_: duck, crouch, dive.

**Flow**
The player's current speed multiplier, built by clean clears and lost on a Hit.
_Avoid_: momentum, combo, boost meter.

**Clear**
Passing an obstacle without touching it.

**Perfect**
A Clear whose Jump or Slide began inside the narrow window just before the obstacle.
_Avoid_: crit, frame-perfect.

**Hit**
Touching an obstacle. Costs Flow and causes a Stumble; never ends the Run.
_Avoid_: death, crash, fail.

**Stumble**
The short period after a Hit during which the runner is slowed.

**DNF**
A Run ended by the time cap rather than the Finish.

**Tick**
One fixed step of game time. All timing is counted in Ticks.
_Avoid_: frame (frames are what the screen draws).

**Input Log**
The record of which actions were held on each Tick of a Run. A Ghost is an Input Log.
_Avoid_: recording, macro, demo file.

**Attract Mode**
The idle screen that plays a Ghost and invites anyone to press a key.
_Avoid_: title screen, menu, lobby.

**Booth Operator**
The person running the physical booth. Not a player.
_Avoid_: admin, host, staff.

**Operator Panel**
The hidden controls only the Booth Operator uses.
_Avoid_: settings, admin menu, debug menu.

**Leaderboard Monitor**
The second screen showing the board, the latest Run and the Relay Streak live.
_Avoid_: scoreboard page, second screen app.

**Initials**
The three letters a player enters after a Run.
_Avoid_: name, username, tag.

**Board**
The active day's Runs and Relay statistics, viewed for the current Course Version. The Board owns Turn persistence, Initials updates, calendar rollover and operator resets through the KV seam; retired Course Versions stay in exports but cannot become current rivals or records.
