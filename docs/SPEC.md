# Ghost Relay: Specification

> A 30-second neon sprint where you race the ghost of the player who went right before you. Two buttons, no tutorial, no internet.

Hackathon: Cloud9 x JetBrains "Sky's The Limit" 2026. Target: **Category 3, Event Mini Game** and the **Best AI-Powered Workflow Story** bonus. Deadline: 12 Jan 2027, 2:00 pm ET.

Decisions and their reasoning: [`GRILL.md`](GRILL.md). Vocabulary: [`../GLOSSARY.md`](../GLOSSARY.md). Build order: [`PLAN.md`](PLAN.md).

---

## 1. People

**Player.** A passer-by at a booth, standing, maybe holding something, with a queue behind them. Has watched the previous person play. Will not read instructions. Wants to know within one second what to press, and within one second of finishing whether they won.

**Booth Operator.** A volunteer who did not write the code. Sets up on a borrowed laptop with an external monitor and no Wi-Fi. Must be able to: start it in two minutes from the README, leave it running for hours, reset the board at the start of a day, and never be called over because a screen is stuck.

---

## 2. Flows

### 2.1 Player turn (target under 60 s end to end)

```
Attract ──any key──▶ Countdown (3 s) ──▶ Run (~30 s) ──Finish──▶ Results (≤8 s) ──▶ Initials (≤12 s) ──▶ Attract
   ▲                                                                                        │
   └──────────────────────────────── 30 s idle on any non-Run screen ───────────────────────┘
```

1. Attract Mode plays the Relay Ghost running the Course with the rival's Initials and time on screen: "BEAT **ABC** · 28.71".
2. Player presses anything. Audio unlocks. Countdown 3, 2, 1, GO with beeps. Inputs during Countdown are ignored.
3. Run. Player and Ghost start together. At each Split Gate a Delta chip pops above the gate.
4. Finish. Results screen reveals total time, overall Delta, a six-segment split bar, and one plain sentence about where time was lost or won.
5. Initials entry. Three letters, arcade style. Auto-submits "???" if left alone.
6. Back to Attract, now showing this player's Ghost as the rival for the next person.

### 2.2 Champion run

On Attract, holding Slide and pressing Jump starts a Run against today's Champion Ghost. A small hint on Attract says so ("Hold ↓ + press ↑ to race today's champion"). The result still enters the board and still becomes the next Relay Ghost.

### 2.3 Booth Operator

1. Online once: `npm install`.
2. At the booth: `npm run booth` (builds, serves on `http://localhost:4173`).
3. Open `http://localhost:4173/?booth=1` full-screen on the player monitor (F11). Open `http://localhost:4173/leaderboard.html` full-screen on the second monitor.
4. Start of day: `Ctrl+Shift+O` opens the Operator Panel → "Start new day" (confirm). Close with `Esc`.
5. If anything looks wrong: reload the page. All state is in localStorage, so a reload loses nothing but the Run in progress.

---

## 3. Screens

All screens render on one canvas at a logical 1280×720, scaled to fit with letterbox bars, crisp at devicePixelRatio (capped at 2). Text is canvas-drawn with bundled fonts.

| Screen | Content | Exits |
|---|---|---|
| **Attract** | Course in motion with the rival Ghost running it on loop. Top-left: wordmark "GHOST RELAY". Centre-left, large: "BEAT **ABC**" and their time. Bottom: two key glyphs "↑ JUMP" "↓ SLIDE", pulsing "PRESS ANY KEY". Small: Relay Streak, champion hint. | Any key → Countdown. Slide+Jump → Countdown (champion). |
| **Countdown** | Runner and Ghost at the start line. 3 · 2 · 1 · GO, each number scales in (ease-out, 180 ms) with a beep; GO is a higher pitch. Rival label above the Ghost. | Automatic after 3 s. |
| **Run** | Side view, camera locked to the player at x = 320. Top bar: timer (JetBrains Mono, tabular), "vs ABC" with live Delta to the Ghost at the last gate, Flow meter (thin bar, lime). Gate banners on the track. Delta chip pops above each gate as you cross. Ghost runner drawn behind the player at 45 % opacity. | Finish → Results. Cap (60 s) → Results with DNF. Tab hidden → Attract (Run discarded). |
| **Results** | Big total time. Overall Delta vs rival with sign and word ("+0.56 behind ABC" / "−1.27 ahead of ABC"). Split bar: six segments, each coloured by its Delta, labelled G1…G5, FIN. The Verdict sentence (see §6.4). Hits and Perfects count. "NEW BEST TODAY" banner if applicable. | Any key or 8 s → Initials. |
| **Initials** | Three large letter slots; active slot underlined. ↑/↓ change letter, → or Jump confirms the slot, ← goes back. After the third slot: "YOUR GHOST RUNS NEXT" then Attract. | Confirm third letter, or 12 s idle → submit "???". |
| **Operator Panel** (overlay) | Start new day · Sound on/off · Screen shake on/off · Export today as JSON · Force House Ghost on next run · Close. Keyboard-navigable with visible focus ring. | Esc. |
| **Leaderboard Monitor** (`leaderboard.html`) | Left: "TODAY'S TOP 10" (rank, Initials, time; top row lime). Right top: "NOW RUNNING: CHALLENGER vs ABC" with gate Deltas filling in live, or "LAST RUN" when idle. Right bottom: Relay Streak big number, runs today. Readable from 3 m: body text ≥ 32 px at 1080p. | Never exits. Updates on BroadcastChannel / storage events. |

Idle rule: Results, Initials and the Operator Panel return to Attract after 30 s with no input (Initials submits "???" first). The game never waits forever on any screen.

---

## 4. Course

One fixed Course, constant data in `src/sim/course.ts`. World units are logical pixels; ground at y = 600 (screen), heights measured up from the ground.

### 4.1 Layout

Length 10 800 px. At base speed (6 px/Tick, 360 px/s) that is 30.0 s with no Flow gained or lost.

| Segment | Ends at | Name on banner | What it teaches / tests |
|---|---|---|---|
| S1 | G1 @ 1 800 | WARM-UP | Lone Hurdle, generous gap; then a Low Bar; then two Hurdles. Learn both buttons. |
| S2 | G2 @ 3 600 | RHYTHM | Double Hurdles at even spacing; a Perfect chain is possible. |
| S3 | G3 @ 5 400 | SWITCH | Three Switch Beams separated by single Hurdles. Reaction. |
| S4 | G4 @ 7 200 | PITS | Pits (need a held Jump), a Low Bar right after a Pit landing. |
| S5 | G5 @ 9 000 | MIXED | Everything, tighter spacing. |
| S6 | FIN @ 10 800 | SPRINT | Two Switch Beams, Double Hurdle, then a clear run to the line where Flow pays off. |

Roughly 32 obstacles total. Minimum gap between obstacle groups: 220 px (about 0.6 s at base speed).

### 4.2 Obstacles

| Type | Shape (w × h, from ground) | Answer | Perfect window (runner front to obstacle leading edge when the action starts) |
|---|---|---|---|
| Hurdle | 24 × 40 | Jump (tap is enough) | 18–54 px |
| Double Hurdle | two Hurdles, 150 px apart | Jump, land, Jump | each Hurdle judged separately |
| Low Bar | 120 wide, underside at 30 px | Slide (hold) | 12–48 px |
| Pit | 120 wide gap in the floor (runner is supported while any part of its box is over floor) | Held Jump (a tap lands in the Pit) | 6–36 px |
| Switch Beam | 24 wide; LOW = 0–40 px (Jump) or HIGH = underside at 30 px (Slide) | Read, then Jump or Slide | as Hurdle or Low Bar |

Switch Beam rule: trigger line 160 px before the beam. Before the runner's front crosses it, the beam is drawn strobing between both positions every 6 Ticks (unreadable on purpose). On crossing, it locks: `LOW if tickAtTrigger is even, else HIGH`. Reaction distance is constant; reaction time is about 27 Ticks (0.44 s) at base speed and about 20 Ticks (0.33 s) at max Flow. Each simulation (player, Ghost) has its own beam locks.

### 4.3 Controls

| Action | Keys | Mouse | Behaviour |
|---|---|---|---|
| Jump | ↑, W, Space | Left button | Press to jump. Holding up to 14 Ticks gives a higher, longer jump. Buffered for 6 Ticks before landing; coyote time 5 Ticks after leaving a ledge. |
| Slide | ↓, S | Right button (context menu suppressed) | Hold to slide (minimum 18 Ticks once started). In the air: fast-fall (gravity ×2.5). |
| Anything | any key/button | any | Starts a Run from Attract. |

Every key that is neither Jump nor Slide does nothing during a Run. Arcade two-button encoders that send ↑/↓ or Space/S work without configuration.

---

## 5. Tuning numbers (starting values)

All in simulation units: 1 Tick = 1/60 s; distances in px; stored internally ×256 (fixed-point, see §7).

| Name | Value | Notes |
|---|---|---|
| Tick rate | 60 Hz | Fixed. Render runs at display rate with interpolation. |
| Base speed | 6.0 px/Tick | 360 px/s. |
| Flow range | 0.60 – 1.35 | Stored as milli (600–1350). Speed = base × Flow. |
| Flow start | 1.00 | |
| Clean clear | +0.04 Flow | |
| Perfect clear | +0.08 Flow, plus 20-Tick burst of +0.10 | Burst is extra speed that fades linearly. |
| Hit | Flow → 0.70, streak reset, 24-Tick Stumble | During Stumble: speed ×0.5, no Jump. Runner passes through the obstacle (never blocked). |
| Pit hit | Runner placed at the Pit's far edge, 30-Tick Stumble | Counts as a Hit. |
| Passive recovery | +0.002 Flow/Tick toward 1.00 when below 1.00 | Never above 1.00 without clears. |
| Jump velocity | 10.5 px/Tick up | |
| Gravity (rising, Jump held, ≤14 Ticks) | 0.55 px/Tick² | Full hold ≈ 84 px high, ≈ 28 Ticks airtime. |
| Gravity (otherwise) | 1.10 px/Tick² | Tap ≈ 50 px high, ≈ 19 Ticks airtime. |
| Fast-fall gravity | 2.75 px/Tick² | Slide pressed while airborne. |
| Runner box | 28 × 48 standing, 44 × 22 sliding | |
| Input buffer / coyote | 6 / 5 Ticks | Both inside the sim, so replay-safe. |
| Time cap | 3 600 Ticks (60 s) | DNF. |
| Expected times | expert ≈ 24 s, typical ≈ 30 s, rough ≈ 36 s | To be checked in playtest; adjust Course spacing, not physics, after the House Ghost is recorded. |

### 5.1 Juice (render-only, never affects the sim)

| Event | Effect |
|---|---|
| Jump | Stretch 1.0 → 1.15 vertical over 80 ms, synth "blip" rising. |
| Land | Squash 0.85 vertical, 3 dust particles, soft thud. |
| Perfect | "PERFECT" word above runner (ease-out scale 0.9 → 1, 220 ms, fades over 400 ms), lime ring burst, bright chime. |
| Hit | Screen shake 6 px amplitude decaying over 120 ms, orange flash on obstacle, runner flicker during Stumble, low buzz. |
| Gate | Banner flashes, whoosh, Delta chip: "−0.18" in lime or "+0.31" in orange, always with sign. |
| Flow | Speed lines density and the background grid scroll rate scale with Flow; synth drone pitch follows Flow. |
| Finish | Slow-motion 250 ms on the render side, finish sting chord. |
| New best today | Banner on Results, short arpeggio. |

`prefers-reduced-motion: reduce` or the Operator toggle turns off screen shake and speed lines; everything else stays.

---

## 6. Ghost, splits and results

### 6.1 Input Log format

A Run's inputs are stored as change events: `[[tick, mask], …]` where `mask` bit 0 = Jump held, bit 1 = Slide held. A new event is written only when the mask changes. A typical Run is 60–150 events, well under 2 KB as JSON.

### 6.2 Ghost record

```ts
type GhostRecord = {
  id: string;            // `${dateKey}-${runNumber}`
  initials: string;      // "ABC" or "???"
  courseVersion: string; // hash of course data + tuning constants
  finishTick: number;    // or cap tick for DNF
  dnf: boolean;
  splits: number[];      // 6 ticks: G1..G5, FIN
  gateHashes: number[];  // 6 state hashes, checked on replay
  hits: number[];        // per segment
  perfects: number[];    // per segment
  hitKinds: string[][];  // per segment, obstacle types hit (for the Verdict)
  inputs: [number, number][];
  rivalId: string | null;
  beatRival: boolean;
  createdAt: number;     // wall clock, display only, never read by the sim
};
```

### 6.3 Split deltas

Segment Delta for segment *i* = (player split *i* − player split *i−1*) − (Ghost split *i* − Ghost split *i−1*). Displayed in seconds with two decimals (`ticks / 60`). Negative = player faster. The split bar colours each segment: lime if ≤ −0.05 s, orange if ≥ +0.05 s, grey otherwise, and always prints the signed number, so colour is never the only signal.

### 6.4 Verdict sentence (the demo moment)

One sentence, picked by rules, in this order:

1. DNF: "Time ran out at Gate N. The course is still there for you."
2. Beat the rival: "You beat **ABC** by 1.27 s. Biggest gain: Gate 3 (−0.62 s). Your ghost runs next."
3. Lost to the rival: "You lost 0.42 s at Gate 3: 2 hits on the Switch Beam." (largest positive segment Delta, with its cause from `hitKinds` if any, otherwise "slower line through the Pits").
4. Tie within 0.02 s: "Dead heat with **ABC**. Settle it."

### 6.5 Rival selection

1. Champion run requested → today's fastest non-DNF Ghost (current Course Version).
2. Otherwise → the most recent Ghost (current Course Version).
3. None → House Ghost (shipped JSON, generated by a scripted autopilot at about 29 s, see PLAN).

---

## 7. Determinism approach

1. **Pure sim.** `src/sim/` exports `createSim(course)`, `step(sim, mask)`, `hashState(sim)`. No DOM, no `Date`, no `Math.random`, no `Math.sin/cos/sqrt`, no floats in state. An ESLint `no-restricted-globals` / `no-restricted-properties` rule plus a Vitest grep test enforce this.
2. **Fixed-point integers.** Positions and velocities ×256, Flow in milli. All arithmetic is integer; divisions use `Math.trunc` (or `>> 8` on non-negative values). See [ADR 0002](adr/0002-integer-fixed-point-simulation.md).
3. **Fixed step.** The browser loop accumulates real time and runs whole 60 Hz Ticks (max 5 per frame, extra time dropped so a stalled tab does not fast-forward). Rendering interpolates between the previous and current runner positions; interpolation never feeds the sim.
4. **Input sampling.** Keyboard and mouse handlers only update a live mask. At each Tick boundary the loop reads the mask once, appends a change event if it differs, and passes it to `step`. The Ghost sim steps on the same Tick with the mask decoded from its log.
5. **Verification.** At each Split Gate the sim records `hashState` (FNV-1a over all integer fields). A replay that produces a different hash or finish Tick is rejected and the rival falls back (next most recent Ghost, then House Ghost). Tests replay thousands of logs.
6. **Course Version.** FNV-1a hash of the serialized Course and tuning constants. Changing either invalidates old Ghosts automatically.

---

## 8. Storage and live sync

| Key (localStorage) | Content | Bound |
|---|---|---|
| `ghostrelay:v1:runs:<YYYY-MM-DD>` | Array of GhostRecord for that day | Keep inputs for the latest 30 runs and today's top 10; older records keep summary only (inputs dropped). Max 500 records/day. |
| `ghostrelay:v1:meta` | `{ currentDay, runCounter, relayStreak, settings: { sound, shake } }` | Small. |

BroadcastChannel `ghost-relay` messages: `run-started { rivalInitials, rivalSplits }`, `split { gateIndex, tick, delta }`, `run-finished { record summary }`, `board-reset`. The Leaderboard Monitor also listens for `storage` events and re-reads on `visibilitychange`, so it recovers even if a message is missed. Writes are wrapped in try/catch; on quota error the oldest day is deleted and the write retried once.

---

## 9. Architecture

```
index.html ──▶ src/main.ts ──▶ booth/stateMachine ──▶ game/screens/*
                     │                 │
                     │                 ├──▶ booth/storage (localStorage)
                     │                 └──▶ booth/broadcast (BroadcastChannel) ──▶ leaderboard.html
                     ├──▶ game/loop (accumulator) ──▶ sim/ (pure, deterministic)
                     ├──▶ game/input (keys, mouse → mask)
                     ├──▶ game/render/* (canvas 2D, juice)
                     └──▶ audio/synth (WebAudio)
```

| Folder | Responsibility | May import |
|---|---|---|
| `src/sim/` | Course data, physics, collisions, Flow, splits, hashing, Input Log encode/decode | nothing outside `src/sim/` |
| `src/game/` | Loop, input, camera, renderers, screens | `sim`, `audio`, `booth` |
| `src/booth/` | State machine, timers, storage, broadcast, rival selection, verdict text | `sim` |
| `src/audio/` | Synth voices and the Flow drone | nothing |
| `src/leaderboard/` | Second-monitor page | `booth` (storage + broadcast only) |
| `test/` | Vitest: determinism, endurance, state machine, storage | everything |
| `scripts/` | `make-house-ghost.ts` (autopilot → JSON) | `sim` |

Stack: Vite (multi-page), TypeScript, Canvas 2D, Vitest, `@fontsource/chakra-petch`, `@fontsource/jetbrains-mono`. No framework, no engine, no network.

---

## 10. Visual direction: "Night broadcast"

- Background: deep ink `oklch(0.16 0.02 250)`, a faint perspective grid scrolling with Flow. Track: a single bright floor line plus subtle stage lights.
- Player: signal lime `oklch(0.90 0.20 128)`, solid. Ghost: cold cyan `oklch(0.82 0.12 210)` at 45 % with a 6-frame scanline trail. Hits/loss: hot orange `oklch(0.72 0.19 45)`. Neutral text: `oklch(0.95 0.01 250)`; secondary `oklch(0.72 0.02 250)`.
- Obstacles are outlined neon shapes with a soft inner glow (a second stroke at lower alpha, no blur filters, for speed).
- Typography: Chakra Petch 600/700 for display and banners, uppercase with +4 % tracking; JetBrains Mono 500 with tabular numbers for all times and Deltas.
- Layout: broadcast lower-third for results, left-aligned text blocks, not centred marketing layout. No gradients behind text, no emoji, no logos.
- Contrast: all text ≥ 4.5:1 on the ink background; Deltas carry sign and word, not colour alone.
- UI motion: keyboard-driven changes (Initials letters, Operator Panel focus) are instant. Results reveal staggers in over 400 ms with ease-out `cubic-bezier(0.23, 1, 0.32, 1)`.

---

## 11. Quality bar and tests

| Check | How | Pass |
|---|---|---|
| Replay equals original | Vitest: 2 000 seeded bot Runs, each replayed from its Input Log | Same finish Tick and all six gate hashes, 2 000/2 000 |
| Endurance | Vitest: 1 000 consecutive Turns through the booth state machine with fake timers, storage and broadcast stubs | Every Turn reaches Attract again; every Run ends ≤ 3 600 Ticks; stored bytes under 1 MB; no listener count growth |
| Sim purity | Vitest grep over `src/sim/**` | No `Math.random`, `Date`, `performance`, `window`, `document`, trig |
| Idle recovery | Vitest state machine with fake timers | Every non-Run state reaches Attract within 30 s of silence |
| Frame budget | Manual, Chrome Performance panel on the booth laptop | Report only what was measured |
| Offline | Manual: Wi-Fi off, `npm run booth`, play 3 Turns with the Leaderboard Monitor open | Board updates live |

---

## 12. Judge scorecard

| Criterion | What the judge sees | Where |
|---|---|---|
| Technological implementation | Deterministic fixed-point sim; Ghosts as replayed Input Logs with per-gate hash verification; 2 000-replay and 1 000-turn endurance tests; offline two-window sync; WebAudio synth with zero audio files; built in WebStorm with Junie (owner's own write-up) | `src/sim/`, `test/`, README "How it works", `AI_SHOWCASE.md` |
| Design | One readable course, two buttons, no tutorial; Verdict sentence teaches; Night broadcast look; split bar; accessible contrast and reduced motion | Video 0:00–1:30, screenshots |
| Potential impact | Booth-ready today: attract mode, idle reset, Operator Panel, offline leaderboard monitor; the relay turns a queue into a chain of rivalries | README "Booth setup", video 1:30–2:00 |
| Quality of idea | Not an aim trainer: you race the person who just played, and the game tells you exactly where you lost to them | Devpost description, video opening |
| Presentation | 3-minute video with two real players, live second monitor, Wi-Fi off, honest tooling segment | Video |

Category brief checklist: fast (≈30 s Run, < 60 s Turn) ✔ · replayable (fixed Course to learn, new rival every Turn, champion mode) ✔ · simple controls (two buttons, mouse works) ✔ · no tutorial ✔ · resets cleanly (idle timers, state machine test) ✔ · sustained responsiveness (endurance test) ✔ · complete loop with clear end screen ✔ · gamer skill (timing + reaction) ✔ · offline second-monitor leaderboard ✔ · original art, no Riot content ✔.

---

## 13. Video script (≤ 3 min)

| Time | Picture | Voice-over / on-screen text |
|---|---|---|
| 0:00–0:10 | Booth: two people, game monitor and leaderboard monitor side by side. | "At a booth, the best rival isn't a high score. It's the person who just played." Title card: GHOST RELAY. |
| 0:10–0:35 | Player A's full Run from Attract, screen capture. | "Two buttons: jump, slide. No tutorial. Thirty seconds." |
| 0:35–1:10 | Player B races A's Ghost. Split chips pop at each gate. Results: "You lost 0.42 s at Gate 3: 2 hits on the Switch Beam." | "Every run becomes the next player's ghost, and the game tells you exactly where you lost." |
| 1:10–1:30 | B presses any key, runs again, beats the ghost. Initials entry. | "Instant restart. Learn the gate. Take it back." |
| 1:30–1:55 | Second monitor updating live; laptop Wi-Fi menu shown off. Operator Panel briefly. | "The leaderboard runs on a second monitor with no internet. Idle screens reset themselves." |
| 1:55–2:20 | Code and terminal: test run printing the 2 000-replay and 1 000-turn results (real output). | "Ghosts are just recorded inputs, replayed through a deterministic simulation. Tests prove every replay matches." |
| 2:20–2:50 | Owner's own WebStorm / Junie footage. | TODO (owner): describe your real workflow; see `AI_SHOWCASE.md`. |
| 2:50–3:00 | Attract screen: "BEAT ABC". | "Ghost Relay. Beat the last one." Repo URL. |

---

## 14. Devpost copy

**Title:** Ghost Relay

**Tagline:** Race the ghost of the player who went right before you. Two buttons, 30 seconds, no Wi-Fi needed.

**Description (draft; owner to finalise):**

> Ghost Relay is a booth-ready mini game built for a queue. Each player runs a 30-second neon obstacle course with just two buttons (jump and slide) while racing a translucent ghost of the person who played right before them. When you finish, the game shows exactly where you lost or gained time against that ghost, gate by gate: "You lost 0.42 s at Gate 3: 2 hits on the Switch Beam." Then your run becomes the ghost for the next person in line.
>
> It tests timing and reaction: perfect take-offs build speed, hits cost it, and Switch Beams only reveal whether you need to jump or slide a split second before you reach them.
>
> Built for real booths: an attract screen, automatic reset after idle, arcade-style initials, an operator panel, and a live leaderboard on a second monitor that works with no internet at all. Ghosts are stored as recorded inputs and replayed through a deterministic fixed-point simulation; the test suite replays thousands of runs to prove every ghost matches.
>
> Built with TypeScript, Vite and Canvas 2D in WebStorm, with Junie (see the methodology write-up).

**Built with:** typescript, vite, canvas, web-audio-api, vitest, webstorm, junie.

---

## 15. Submission checklist

- [ ] Public GitHub repo with MIT `LICENSE` at root
- [ ] Working demo link (GitHub Pages build) and offline booth instructions in README
- [ ] Devpost description (§14), filled with real details
- [ ] `docs/METHODOLOGY.md`: approach, iterations, testing, what changed after playtests (owner fills real content)
- [ ] `AI_SHOWCASE.md`: tooling explanation, WebStorm/Junie workflow (owner fills real content; template only)
- [ ] Owner's JetBrains tool use is real and shown (screenshots/footage the owner captures themselves)
- [ ] Video ≤ 3:00, uploaded publicly, linked on Devpost
- [ ] README with ≥ 3 screenshots, quickstart, Judging criteria → proof table, Known limitations, AI disclosure
- [ ] Test output pasted into README only from an actual run
- [ ] No Riot names, logos or art; no third-party logos in assets
- [ ] Category selected: Event Mini Game; bonus: Best AI-Powered Workflow Story
- [ ] Submitted before 12 Jan 2027, 2:00 pm ET
