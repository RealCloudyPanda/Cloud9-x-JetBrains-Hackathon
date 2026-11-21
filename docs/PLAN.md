# Build plan: Ghost Relay

Ordered, commit-sized tasks. Riskiest first: the deterministic replay must be proven before any screen is drawn. Each task is one commit (conventional-commit message given), leaves `npm test` and `npm run build` green, and is checked by its acceptance line before committing. Spec: [`SPEC.md`](SPEC.md). Decisions: [`GRILL.md`](GRILL.md), [`adr/`](adr/).

Rules for the implementer:
- `src/sim/` imports nothing outside itself and uses integers only (ADR 0002). Never call `Math.random`, `Date`, `performance`, trig or `window` there.
- Times are Ticks everywhere until the moment they are displayed.
- Commit messages carry no AI attribution and no `Co-Authored-By` lines. Do not push.
- Design refs to apply from task 13 on: Impeccable (`shape → critique → polish → audit`), Emil Kowalski (motion: no animation on keyboard-repeated UI, ease-out, < 300 ms), Jakub Krehel `better-ui`.
- Do not create `.idea/`, `.junie/`, or any JetBrains workflow content. The owner adds those from real use.

---

### Phase A: prove the hard part

**1. Scaffold Vite + TypeScript + Vitest, two pages**
- Files: `package.json` (scripts: `dev`, `build`, `preview`, `booth` = `vite build && vite preview --port 4173 --strictPort`, `test` = `vitest run`, `typecheck` = `tsc --noEmit`), `vite.config.ts` (multi-page inputs `index.html` + `leaderboard.html`, `base: './'`), `tsconfig.json` (strict), `index.html`, `leaderboard.html`, `src/main.ts`, `src/leaderboard/main.ts`, `test/smoke.test.ts`.
- Accept: `npm install && npm test && npm run build` pass; `dist/` contains both HTML pages; `npm run booth` serves on 4173.
- Commit: `chore: scaffold vite typescript project with game and leaderboard pages`

**2. Deterministic sim core, Input Log and replay proof**
- Files: `src/sim/fixed.ts` (FP = 256 helpers), `src/sim/tuning.ts` (all SPEC §5 numbers), `src/sim/runner.ts` (jump with hold, gravity variants, slide min duration, fast-fall, input buffer, coyote), `src/sim/sim.ts` (`createSim`, `step(sim, mask)`, `hashState` FNV-1a), `src/sim/inputLog.ts` (recorder + `maskAt(log, tick)` cursor), `test/helpers/bot.ts` (mulberry32-seeded bot), `test/determinism.test.ts`.
- Course for now: flat floor plus a few placeholder Hurdles.
- Accept: tap Jump peaks at 50 ± 4 px and full hold at 88 ± 4 px (if the discrete integrator lands elsewhere, update SPEC §5 to the measured value rather than fudging constants); 2 000 seeded bot Runs each replayed from their encoded log produce identical final hash and finish Tick (2 000/2 000); encoded log for a 30 s Run is < 2 KB.
- Commit: `feat(sim): add fixed-point runner, input log and replay determinism tests`

**3. Obstacles, Flow, Course data, splits and Course Version**
- Files: `src/sim/obstacles.ts` (Hurdle, Double Hurdle, Low Bar, Pit, Switch Beam with trigger lock), `src/sim/flow.ts` (clear, Perfect window, burst, Hit, Stumble, passive recovery), `src/sim/course.ts` (SPEC §4.1 layout, six segments, ~32 obstacles), `src/sim/courseVersion.ts`, gate split + gate hash capture in `sim.ts`, `test/obstacles.test.ts`, `test/simPurity.test.ts`.
- Accept: scripted inputs clear each obstacle type cleanly and score a Perfect inside the window; a tap over a Pit is a Hit and places the runner at the far edge; Switch Beam locks LOW on even trigger Tick and HIGH on odd; a no-input Run finishes before the 3 600-Tick cap; purity test finds no forbidden identifiers in `src/sim/**`; determinism test from task 2 still passes on the full Course.
- Commit: `feat(sim): add obstacles, flow, course layout and split gates`

**4. Browser loop, input and a playable bare render**
- Files: `src/game/loop.ts` (accumulator, max 5 Ticks per frame, alpha for interpolation; pure `advanceAccumulator` helper), `src/game/input.ts` (↑/W/Space and ↓/S, left/right mouse, `contextmenu` suppressed, mask snapshot per Tick), `src/game/render/world.ts` (camera at x = 320, floor, obstacles as rectangles, runner box), `src/game/canvas.ts` (1280×720 logical, letterbox, DPR ≤ 2), `test/loop.test.ts`.
- Accept: `npm run dev` shows a Run you can play start to finish with keyboard and with mouse; `test/loop.test.ts` shows a 2 s stall yields at most 5 Ticks; resizing the window keeps aspect with letterbox.
- Commit: `feat(game): add fixed-step loop, input mapping and playable course render`

**5. Ghost runner and live Deltas**
- Files: `src/game/ghost.ts` (second sim stepped on the same Tick from a log; rejected if a gate hash mismatches), `src/game/render/ghost.ts` (cyan 45 % runner), `src/game/render/hud.ts` (timer, "vs ABC", last-gate Delta, Flow bar, Delta chip above each gate), `src/sim/splits.ts` (segment Delta math), `test/splits.test.ts`.
- Accept: racing your own previous Run shows the Ghost moving in lockstep when you repeat the same inputs (manual); tampered log is rejected (test); segment Delta signs and values match hand-computed fixtures (test).
- Commit: `feat(game): race a replayed ghost with live split deltas`

**6. House Ghost via scripted autopilot**
- Files: `scripts/make-house-ghost.ts` (autopilot that reads upcoming obstacles from sim state and acts at mid-window, deliberately mistimes one Switch Beam), `src/game/houseGhost.json`, npm script `house-ghost` (run with `node --experimental-strip-types` or `vite-node`), `test/houseGhost.test.ts`.
- Accept: House Ghost replays with matching hashes and finishes in 27–31 s; if the expert autopilot (no mistakes) is not 23–26 s, adjust Course spacing in `course.ts` (not physics) and regenerate; record the measured times in the commit body.
- Commit: `feat(game): generate and ship a house ghost from a scripted autopilot`

### Phase B: the booth

**7. Booth state machine with idle recovery**
- Files: `src/booth/stateMachine.ts` (Attract, Countdown, Run, Results, Initials, Operator; transitions from SPEC §2–3; injectable clock), `src/booth/timers.ts`, `test/stateMachine.test.ts`.
- Accept: with fake timers, every non-Run state returns to Attract within 30 s of silence; Results → Initials after 8 s; Initials submits "???" after 12 s; tab hidden during Run → Attract; Countdown ignores inputs.
- Commit: `feat(booth): add turn state machine with idle timeouts`

**8. Storage, rival selection and day rollover**
- Files: `src/booth/storage.ts` (keys and bounds from SPEC §8, trimming inputs beyond latest 30 + top 10, quota retry), `src/booth/rival.ts` (champion → relay → house; Course Version filter; hash-mismatch fallback), `src/booth/streak.ts`, `test/storage.test.ts`, `test/rival.test.ts`.
- Accept: tests cover empty board → House Ghost, relay choice, champion choice, stale Course Version ignored, quota error path, day rollover, streak increments and resets.
- Commit: `feat(booth): persist runs locally and pick relay, champion or house ghost`

**9. Screens: Attract, Countdown, Results with Verdict, Initials**
- Files: `src/game/screens/attract.ts`, `countdown.ts`, `results.ts` (total, overall Delta with word, six-segment split bar with signed numbers), `initials.ts` (↑/↓ letter, → or Jump confirm, ← back, small block-list), `src/booth/verdict.ts`, `test/verdict.test.ts`, `src/main.ts` wiring.
- Accept: one full Turn works by keyboard only and by mouse only; Verdict test covers DNF, win, loss with cause, dead heat; Initials letter changes are instant (no animation); champion start (hold Slide + Jump) works from Attract.
- Commit: `feat(game): add attract, countdown, results verdict and initials screens`

**10. Leaderboard Monitor with live sync**
- Files: `src/booth/broadcast.ts` (BroadcastChannel `ghost-relay`, `storage` event fallback, `visibilitychange` re-read), `src/leaderboard/main.ts`, `src/leaderboard/render.ts` (DOM, not canvas: top 10, NOW RUNNING with gate Deltas filling in, LAST RUN, Relay Streak, runs today), `src/leaderboard/style.css`, `test/broadcast.test.ts`.
- Accept: two windows open, a Run in one updates the other gate by gate within 200 ms (manual); closing and reopening the monitor shows the current board; body text ≥ 32 px at 1920×1080; works with Wi-Fi off.
- Commit: `feat(leaderboard): add live second-monitor leaderboard over broadcast channel`

**11. Operator Panel and kiosk mode**
- Files: `src/game/screens/operator.ts` (Ctrl+Shift+O; Start new day with confirm, sound, shake, export JSON download, force House Ghost; visible focus ring; Esc closes), `src/booth/settings.ts`, `?booth=1` handling in `src/main.ts` (hide cursor, suppress context menu and browser shortcuts that navigate away where possible).
- Accept: no single key or mash sequence opens the panel (test the chord detector); reset requires confirm; settings survive reload; export downloads valid JSON of today's runs.
- Commit: `feat(booth): add hidden operator panel and kiosk mode`

**12. Endurance test: 1 000 Turns**
- Files: `test/endurance.test.ts`, `test/helpers/fakeStorage.ts`, `test/helpers/fakeChannel.ts`.
- Accept: 1 000 consecutive Turns (bot inputs, fake clock) through state machine + sim + storage + broadcast stubs: every Turn returns to Attract, every Run ends ≤ 3 600 Ticks, every stored Ghost replays with matching hashes, stored bytes < 1 MB, broadcast listener count constant. Print a one-line summary (Turns, mean Run time, bytes) to use in the README verbatim.
- Commit: `test: add 1000-turn headless endurance test`

### Phase C: feel and look

**13. Night broadcast visual pass**
- Files: `src/game/render/theme.ts` (oklch palette from SPEC §10 converted to canvas colours), `src/game/render/background.ts` (perspective grid scrolling with Flow, stage lights), neon obstacle strokes in `world.ts`, typography via `@fontsource/chakra-petch` and `@fontsource/jetbrains-mono` imported in `src/main.ts` and `src/leaderboard/main.ts` (wait for `document.fonts.ready` before first draw), results as broadcast lower-third.
- Accept: no network requests on load (DevTools Network, offline); text contrast ≥ 4.5:1 on ink; Deltas readable without colour; run Impeccable `critique` on screenshots and fix the top findings in this commit.
- Commit: `style: apply night broadcast palette, typography and course art`

**14. Juice**
- Files: `src/game/render/fx.ts` (particles pool with fixed capacity, squash/stretch, Perfect word, ring burst, Hit flash, speed lines, finish slow-mo on render side), `src/game/render/shake.ts` (respects `prefers-reduced-motion` and Operator setting).
- Accept: all effects are render-only (sim tests unchanged and green); particle pool never allocates after start (capacity constant); reduced-motion disables shake and speed lines.
- Commit: `feat(game): add jump, hit, perfect and gate juice with reduced-motion support`

**15. WebAudio synth**
- Files: `src/audio/synth.ts` (oscillator + gain envelope voices: jump, land, slide, perfect, hit, gate, countdown ×2, finish sting, new-best arpeggio), `src/audio/drone.ts` (pitch follows Flow), unlock on first Attract key, mute via Operator setting.
- Accept: no audio files in the repo; first key on Attract produces sound; muted setting survives reload; audio nodes are reused or disconnected (no growth over 20 Turns in Chrome's WebAudio inspector, if available; otherwise note as not verified).
- Commit: `feat(audio): add synthesized sound effects and flow drone`

### Phase D: ship

**16. Static deploy and offline booth check**
- Files: `.github/workflows/pages.yml` (build on push to `main`, deploy `dist/` to GitHub Pages), `?scene=attract|run|results|initials` param in `src/main.ts` that freezes a deterministic scene using the House Ghost (for screenshots and judges), fixes from an offline run-through.
- Accept: `npm run build && npx vite preview` works with Wi-Fi off (manual: play 3 Turns with the Leaderboard Monitor open); each `?scene=` renders a stable frame.
- Commit: `chore: add pages deploy workflow and screenshot scenes`

**17. Methodology and AI showcase templates**
- Files: `docs/METHODOLOGY.md` (sections: Goal and constraints · Process (grill → spec → plan → build) · Determinism strategy and how it was tested · Playtest notes · What changed and why · What I'd do next; each section has a `TODO (owner):` prompt for real content, with only verifiable facts pre-filled, e.g. links to tests and ADRs), `AI_SHOWCASE.md` (sections: Tools used (WebStorm, Junie, others) · Where AI helped · Where I overrode it · A concrete before/after · Prompts that worked · Time saved (only if measured); every section is `TODO (owner):` with guidance questions, nothing invented).
- Accept: every claim in both files is either a link to code/tests in the repo or an explicit `TODO (owner)` marker; grep finds no fabricated tool usage.
- Commit: `docs: add methodology and AI showcase templates for the owner`

**18. Full README with screenshots and final QA**
- Files: `README.md` (all sections from the brief: pitch, hero, problem, what it does, demo moment, how it works diagram, sponsor tech & why, quickstart, booth setup, sample/offline mode note, judging criteria → proof table, project structure, known limitations, how this was built with AI disclosure, license), `docs/images/hero.png`, `attract.png`, `run.png`, `results.png`, `leaderboard.png` (headless Chrome against `npm run booth` and the `?scene=` params, server killed after).
- Accept: `npm run typecheck && npm test && npm run build` all green from a clean clone; README test numbers are pasted from the actual task 12 output; ≥ 3 screenshots render on GitHub; Known limitations lists anything not verified (e.g. soak test, audio node growth).
- Commit: `docs: write full README with screenshots and booth guide`

---

## Risk register

| Risk | Mitigation | Task |
|---|---|---|
| Replay drifts from original | Integer sim, tick-boundary input, gate hashes, 2 000-replay test before any UI | 2, 3 |
| Course too hard or too easy for strangers | Autopilot timing targets; adjust spacing not physics; Course Version invalidates old Ghosts | 6 |
| Booth gets stuck on a screen | Every non-Run state has a timeout; tested with fake timers and the 1 000-Turn test | 7, 12 |
| localStorage fills over a long event | Input trimming, per-day keys, quota retry; byte bound asserted in tests | 8, 12 |
| Second monitor misses an update | `storage` fallback + re-read on visibility; monitor reads full state, messages are hints | 10 |
| Audio blocked by autoplay policy | Unlock on first Attract key, which every player presses | 15 |
| Bonus prize needs a real workflow story | Templates only; owner writes from real WebStorm/Junie use | 17 |

## Completed relay reliability pass — 2026-11-21

- Fixed course-authored Switch Beam answers, regenerated/versioned the House Ghost, and verified fairness at different runner speeds.
- Added YOU/rival labels, starter and handoff explanations, state announcements, safe keyboard navigation, visible Operator/spectator controls, and reduced-motion screen reveals.
- Preserved relay state in memory after storage denial/quota errors, displayed SESSION ONLY, and validated malformed records/settings before recovery.
- Published expiring station heartbeats with monitor recovery controls; filtered retired Course Versions from best-run and spectator comparisons.
- Verification: 69 tests across 16 files, typecheck, production build, and House Ghost regeneration (expert 22.67 s / 0 hits; house 28.72 s / 5 hits).

Owner tasks remain genuine JetBrains workflow evidence, human playtests, booth hardware/audio measurements, hosted deployment, and submission/video. No owner evidence is fabricated.
