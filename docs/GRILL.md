# Grill: Ghost Relay

Self-interview run in the grill-with-docs style. Each question carries a recommended answer (➡️). The owner's standing instruction is "accept the recommended answer", so every ✅ matches its ➡️ unless a note says otherwise. Vocabulary follows [`GLOSSARY.md`](../GLOSSARY.md). Decisions that are hard to reverse, surprising and a real trade-off are recorded as ADRs in [`docs/adr/`](adr/).

Context: Cloud9 x JetBrains "Sky's The Limit" 2026, Category 3 (Event Mini Game) plus the "Best AI-Powered Workflow Story" bonus. Category 3 asks for a run under 3 minutes, high replayability, controls a stranger understands without a tutorial, a clean reset between players, sustained responsiveness, and a complete start → play → end-screen loop. Stretch asks: showcase a gamer skill (reaction, timing) and a local live leaderboard on a second monitor that works without Wi-Fi.

---

## Round 1: Who is it for, and what is the one moment?

**Q1.1 Who is the primary player?**
➡️ A passer-by at an esports/game-dev booth, standing, holding a drink or a bag, with a queue behind them. Zero patience for reading. They have 60–90 seconds including walking up and walking away.
✅ Accepted.

**Q1.2 Who is the secondary user?**
➡️ The Booth Operator: a volunteer who did not build the game, must get it running in two minutes on a borrowed laptop with no internet, and must never need to touch the keyboard during a busy hour.
✅ Accepted.

**Q1.3 What is the one moment the game exists to produce?**
➡️ The results screen saying, in plain words, "You lost 0.42 s at Gate 3", next to a split bar against the person who just walked away. The person in line saw that run, so the rivalry is real and immediate. That sentence is the demo moment in the video.
✅ Accepted.

**Q1.4 Why a relay (previous player's ghost) instead of racing the best time?**
➡️ The best time becomes unbeatable within an hour and new players stop trying. The previous player is almost always beatable, is physically present or just left, and turns the queue into a chain ("the relay"). The champion's ghost stays available as an opt-in mode for strong players.
✅ Accepted. Recorded as [ADR 0003](adr/0003-default-ghost-is-previous-player.md) because it is surprising and it shapes the leaderboard and attract screen.

**Q1.5 How do we differ from last year's winner ("Junie's Arcade": 3 mini-games, online leaderboard, aim/reflex game)?**
➡️ One game, finished deeply rather than three shallow ones; a social mechanic (relay ghost) rather than a solo score; offline-first rather than server-backed; split-gate feedback that teaches the player where they lost time. No aim trainer.
✅ Accepted.

---

## Round 2: Core loop and controls

**Q2.1 What does the player control?**
➡️ An auto-running runner on a single side-scrolling track. Two actions only: **Jump** (Up / W / Space; hold for a higher jump) and **Slide** (Down / S; hold to keep sliding; pressed in the air it becomes a fast-fall). Left mouse button also jumps and right mouse button also slides, so a two-button arcade encoder or a mouse works.
✅ Accepted.

**Q2.2 If the runner auto-runs, how does skill change the time?**
➡️ Through **Flow**: speed is a multiplier on base speed. Each clean clear raises it, a Perfect clear raises it more, and a Hit drops it sharply and resets the streak. Time is therefore a direct readout of timing quality, which is the "useful gamer skill" the brief asks for.
✅ Accepted.

**Q2.3 Can the player die or fail?**
➡️ No. Hits cost time (Stumble), never the run. Every run reaches the finish, so every player sees a results screen and the booth loop is guaranteed. A hard cap (60 s) ends a run that somehow stalls and records it as DNF.
✅ Accepted.

**Q2.4 How long is a run?**
➡️ About 30 s for an average player (target band: 24 s expert, 30 s typical, 36 s rough). With countdown and results, a full turn is under 60 s, well inside the 3-minute ceiling.
✅ Accepted.

**Q2.5 Is there a tutorial?**
➡️ No. The attract screen shows two key glyphs with one word each ("JUMP", "SLIDE") while a ghost demonstrates. The first obstacle of the course is a lone hurdle with generous spacing, which teaches by doing.
✅ Accepted.

**Q2.6 How does a player start?**
➡️ Any key or click on the attract screen. A 3-2-1 countdown follows; inputs during the countdown are ignored so a mashing player does not start mid-jump.
✅ Accepted.

---

## Round 3: Course, obstacles and timing

**Q3.1 Fixed course or procedural?**
➡️ One fixed, hand-authored course. Ghost comparison and leaderboard fairness require every player to face the same obstacles, and a fixed course lets players learn it across retries, which is replayability.
✅ Accepted.

**Q3.2 How many gates?**
➡️ Five Split Gates plus the Finish, i.e. six segments of roughly 5 s each. Few enough to read at a glance, enough to pinpoint where time went.
✅ Accepted.

**Q3.3 Which obstacles?**
➡️ Five types, each testing one thing: Hurdle (jump timing), Low Bar (slide timing), Double Hurdle (rhythm), Pit (jump distance; landing in costs a climb-out), Switch Beam (reaction: it flips between high and low and shows its final position only ~0.4 s before you reach it, so you must read and choose jump or slide).
✅ Accepted.

**Q3.4 What makes a clear "Perfect"?**
➡️ Taking off (or starting a slide) inside a short window just before the obstacle's leading edge. The window is measured in world distance, so it is the same for every player regardless of speed. Perfects give a speed burst and a visual "PERFECT" flash.
✅ Accepted.

**Q3.5 Is the Switch Beam fair, given players reach it at different times?**
➡️ Yes. Before a runner reaches its trigger line (a fixed distance ahead of the beam) the beam strobes between high and low and cannot be read; when the runner crosses the line it locks to one position, chosen from the Tick count at that moment. Everyone gets the same reaction *distance*; a runner carrying more Flow gets less reaction *time*, which is the price of speed. It depends only on simulation state, so a Ghost replay sees exactly what its player saw.
✅ Accepted.

---

## Round 4: Ghost and determinism

**Q4.1 Do we record the ghost's positions or its inputs?**
➡️ Inputs. A per-tick input bitmask stored as change events (tick, mask), replayed through the same simulation. It is tiny (a few hundred bytes), lets us store many ghosts in localStorage, and doubles as a determinism proof: a replay must reproduce the same finish tick and state hash.
✅ Accepted. Recorded as [ADR 0001](adr/0001-ghost-is-a-resimulated-input-log.md).

**Q4.2 How do we guarantee the replay matches?**
➡️ Fixed timestep (60 ticks/s) decoupled from rendering; integer fixed-point state (positions in 1/256 px); no `Math.random`, no `Date.now`, no trig, no wall-clock reads inside the simulation; input is sampled only at tick boundaries; the course is constant data. A state hash per gate is stored with the ghost so a mismatch is detectable, and a Vitest suite replays thousands of bot runs to prove it.
✅ Accepted. Fixed-point choice is in [ADR 0002](adr/0002-integer-fixed-point-simulation.md).

**Q4.3 What if a stored ghost no longer matches (course edited during development)?**
➡️ Every ghost carries a Course Version (hash of the course data). Ghosts from another version are dropped silently and the attract screen falls back to the built-in House Ghost.
✅ Accepted.

**Q4.4 What does the very first player race?**
➡️ The House Ghost: a pre-recorded, decent-but-beatable run shipped with the game (~30 s), so the first player of the day still has a rival.
✅ Accepted.

**Q4.5 Do the player and ghost interact?**
➡️ No. The ghost is a translucent runner on the same track, drawn behind the player. No collision, no blocking.
✅ Accepted.

---

## Round 5: Booth operation and leaderboard

**Q5.1 What is the screen flow?**
➡️ Attract → Countdown → Run → Results (split deltas) → Name Entry → back to Attract. Any idle state returns to Attract on its own.
✅ Accepted.

**Q5.2 Idle timeouts?**
➡️ Results auto-advance to Name Entry after 8 s (or any key); Name Entry auto-submits as "???" after 12 s idle; any screen other than Run returns to Attract after 30 s idle. During Run no timeout is needed because the 60 s cap ends it.
✅ Accepted.

**Q5.3 How are names entered?**
➡️ Arcade style: three letters, Up/Down cycle the letter, Right or Jump confirms and moves on, Left goes back. No on-screen keyboard, no typing, no profanity risk worth a filter beyond a small block-list of three-letter strings.
✅ Accepted.

**Q5.4 Where does the leaderboard live?**
➡️ In localStorage on the booth machine. A second page, `leaderboard.html`, opened in another window on the second monitor, updates live through BroadcastChannel with a `storage` event fallback. Same origin, same browser, no network.
✅ Accepted.

**Q5.5 What does the leaderboard monitor show?**
➡️ Today's top 10 times; the latest run with its split bar against the ghost it raced; the Relay Streak (how many consecutive players beat the ghost in front of them); total runs today. It is readable from 3 m away.
✅ Accepted.

**Q5.6 What can the operator do?**
➡️ Operator Panel behind a hidden chord (Ctrl+Shift+O): reset today's board (with confirm), toggle sound, toggle screen shake, export runs as JSON, force House Ghost. URL flag `?booth=1` hides the cursor and enables kiosk behaviours. Nothing operator-only is reachable by a player mashing keys.
✅ Accepted.

**Q5.7 Champion mode?**
➡️ On the attract screen, holding Slide while pressing Jump (or a small "Race the champion" hint) starts a run against today's best ghost instead of the previous player. The result still enters the board and still becomes the next relay ghost.
✅ Accepted.

**Q5.8 How do we prove it stays responsive in sustained use?**
➡️ A headless endurance test that runs 1000 complete bot runs through the simulation and the booth state machine, asserting replay equality, bounded storage, and that every run ends. Plus a manual 30-minute soak with the leaderboard window open (documented in the README as a measured result only if actually run).
✅ Accepted.

**Q5.9 Does the Leaderboard Monitor show the Run while it happens?**
➡️ Yes. The game broadcasts each Split as it is crossed, so the queue watching the second monitor sees "CHALLENGER vs ABC" with live Deltas filling in gate by gate. Spectators are the next players; this is what keeps the line engaged.
✅ Accepted.

---

## Round 6: Stack and architecture

**Q6.1 Which stack?**
➡️ Vite + TypeScript + Canvas 2D, no framework. A canvas game needs no React; plain TS keeps the simulation pure and testable. Vitest for unit and endurance tests. Two Vite entry pages: `index.html` (game) and `leaderboard.html`.
✅ Accepted.

**Q6.2 Online leaderboard as an option?**
➡️ No. Offline is the feature, not a limitation: the brief calls a no-Wi-Fi leaderboard a "massive plus", and last year's winner needed internet. No server, no database, no env vars.
✅ Accepted. Recorded as [ADR 0004](adr/0004-offline-only-booth-no-server.md).

**Q6.3 How is it run at the booth?**
➡️ `npm install` once (while online), then `npm run booth` (build + local preview server). After that, no network is needed. Fonts and sounds are bundled; nothing is fetched from a CDN.
✅ Accepted.

**Q6.4 How is the code split?**
➡️ `src/sim/` (pure, deterministic, no DOM), `src/game/` (loop, input, render, screens), `src/booth/` (state machine, storage, broadcast), `src/audio/` (WebAudio synth), `src/leaderboard/` (second-monitor page). The sim never imports from anything else.
✅ Accepted.

**Q6.5 Which JetBrains tool?**
➡️ The owner builds it in WebStorm and uses Junie for part of the work, and writes `AI_SHOWCASE.md` and `docs/METHODOLOGY.md` from their real workflow. Templates are provided; nothing is pre-filled or invented, and no `.idea/` or `.junie/` folders are fabricated.
✅ Accepted.

---

## Round 7: Look, feel and sound

**Q7.1 Visual direction?**
➡️ "Night broadcast": a dark ink track lit like an esports stage, one hot accent per actor. The player is signal lime, the ghost is cold cyan at ~45 % opacity with a scanline trail, hits flash hot orange. Broadcast-style lower-third for splits. Original canvas-drawn shapes only; no logos, no Riot-like names or art.
✅ Accepted. No purple gradients, no emoji, no centered-everything marketing layout.

**Q7.2 Type?**
➡️ Chakra Petch (display, OFL) for headings and callouts; JetBrains Mono (OFL) for timers and split numbers, with tabular figures so digits do not jitter. Both bundled via `@fontsource`, so offline.
✅ Accepted.

**Q7.3 Juice?**
➡️ Screen shake on Hit (small, 120 ms), squash and stretch on jump and land, speed lines scaled to Flow, Perfect flash, gate pass whoosh with a delta chip ("-0.18" green / "+0.31" orange) that pops above the gate. Shake respects `prefers-reduced-motion` and the operator toggle.
✅ Accepted.

**Q7.4 Motion in menus?**
➡️ Follow Emil Kowalski's rule: keyboard-driven, repeated UI (name entry letter changes, menu focus) does not animate. Rare moments (results reveal, new record) may celebrate. Ease-out curves, under 300 ms for UI.
✅ Accepted.

**Q7.5 Sound?**
➡️ A small WebAudio synth (oscillators + envelopes, no audio files): jump, land, slide, perfect, hit, gate, countdown beeps, finish sting, and a pulsing low drone whose pitch follows Flow. Audio unlocks on the first key press at the attract screen. Operator can mute.
✅ Accepted.

---

## Round 8: Submission and presentation

**Q8.1 What is the demo link?**
➡️ A static build on GitHub Pages (the game itself is static), plus "clone and `npm run booth`" for the offline booth. The Pages build is a convenience; the README says the booth setup is the intended mode.
✅ Accepted.

**Q8.2 What carries the video?**
➡️ Two real players back to back, the second beating the first's ghost, the split screen sentence, the second monitor updating live with Wi-Fi visibly off. Then a short, honest segment on the WebStorm/Junie workflow for the bonus prize.
✅ Accepted. Script in [`SPEC.md`](SPEC.md#video-script-3-min).

**Q8.3 What do we claim?**
➡️ Only what is measured: replay determinism and endurance numbers from the test suite output, and any soak test the owner actually runs. No invented playtest quotes or player counts.
✅ Accepted.
