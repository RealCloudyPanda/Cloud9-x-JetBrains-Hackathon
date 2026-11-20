# Research

What already exists for deterministic ghost replay and fixed-timestep input recording, and what we reuse. Searched 2026-11-20 with `gh search repos` / `gh search code` and `npm view`. Star counts and licenses are as GitHub and npm reported them that day.

## Searches run

| Query (`gh search repos` unless noted) | Useful hits |
|---|---|
| `ghost replay` | Engine-specific ghost systems in Unity (C#), Garry's Mod (Lua), Roblox (Luau). None in TS/canvas. |
| `ghost replay racing` (TypeScript), `ghost racer`, `speedrun ghost javascript`, `time trial ghost canvas` | No TypeScript canvas ghost-racing project worth reusing. "GhostRacer" hits are unrelated C++ course projects. |
| `fixed timestep` | `jakubtomsu/fixed-timestep-demo` (Odin, MIT, ★45): side-by-side comparison of fixed-step loops with and without interpolation. `bjornbytes/tick` (Lua, MIT). Godot/Bevy interpolation add-ons. |
| `fixed timestep deterministic replay`, `deterministic lockstep typescript`, `input replay game`, `replay deterministic canvas` | Nothing directly reusable. |
| code: `accumulator inputLog` (TypeScript) | `hivvu/scale-miniatures` `src/net/Sim.ts` (GPL-3.0): advances a race by step number from an input log, with `snapshot/restore/hashState`. `gunnchOS3k/anime-aggressors` `ReplayPlayer.ts` (custom licence): accumulator-driven replay at `fixedDt = 1/60` from an initial serialized state. |
| `mulberry32`, `seedrandom prng` | `cprosche/mulberry32` (no licence file), `PeshoVurtoleta/lite-random` (MIT), `jurerotar/ts-seedrandom` (MIT). |
| `zzfx`, `jsfxr` | `KilledByAPixel/ZzFX` (MIT, ★815; npm `zzfx` 1.4.0, MIT). `grumdrig/jsfxr` (Unlicense). |
| `broadcastchannel leaderboard`, `arcade high score initials`, `one button game canvas typescript` | No relevant results. |

## Patterns confirmed (ideas, not code)

1. **Accumulator loop** ("Fix Your Timestep", Glenn Fiedler, gafferongames.com): accumulate real elapsed time, run whole fixed steps while `acc >= dt`, render with `alpha = acc / dt` interpolation between previous and current state. Clamp the accumulator (e.g. max 5 steps per frame) so a backgrounded tab does not spiral. Both TS samples above follow this shape.
2. **Step number is the clock** (`hivvu/scale-miniatures` `Sim.ts` doc comment): the wall clock only decides *when* to advance; *what* a step contains comes from the step number and the input log. Reading the keyboard "live" inside a step is what breaks replays. We sample input into a bitmask once per Tick, before stepping, and the sim only sees that bitmask.
3. **State hash for verification** (same file, `hashState`): hash the simulation state at known points and compare between original and replay. We store one hash per Split Gate inside each Ghost.
4. **Input logging over position logging** (`Avatarchik/UnityReplaySystem` repo description: "replaying the inputs with a deterministic fixed timestep"): smaller, and a correctness check, at the cost of invalidation on any physics change. See [ADR 0001](adr/0001-ghost-is-a-resimulated-input-log.md).
5. **Interpolate render only**: interpolation lives in the renderer and never feeds back into the sim (`jakubtomsu/fixed-timestep-demo`).

None of the GPL or unlicensed code is copied. We write our own ~150-line loop and sim; the above are pattern references.

## Reusable dependencies

| Need | Choice | Licence | Why |
|---|---|---|---|
| Build / dev server | `vite` ^8 | MIT | Multi-page build (game + leaderboard), static output, `vite preview` for the offline booth. |
| Language | `typescript` (current major on npm is 7.x) | Apache-2.0 | Pin `^` to whatever `npm create vite` scaffolds; if 7.x tooling misbehaves with Vite, fall back to `typescript@^5`. |
| Tests | `vitest` ^5 | MIT | Determinism and 1000-run endurance tests in Node, no browser. |
| Display font | `@fontsource/chakra-petch` ^5 | OFL-1.1 | Bundled locally, offline. Angular, broadcast feel without imitating any brand. |
| Number font | `@fontsource/jetbrains-mono` ^5 | OFL-1.1 | Tabular digits for timers; a quiet nod to the sponsor's own typeface. |
| Seeded PRNG (tests only) | inline mulberry32 (~6 lines, public-domain algorithm) | n/a | Drives the bot players in endurance tests. The game sim needs no randomness at all. |
| Sound | own `src/audio/synth.ts` (oscillator + gain envelope) | ours | ~80 lines covers 10 effects. ZzFX (MIT) is the fallback if time runs short; if used, keep its licence notice in `THIRD_PARTY.md`. |

No physics engine, no game framework (Phaser, PixiJS): the game is one runner and a list of rectangles, and an engine would make the determinism guarantee harder to prove.

## Prior winner reference

Last year's Event Game winner, "Junie's Arcade", used Next.js + TypeScript + Phaser 3 + Three.js, three mini-games including a reflex game, an online Postgres leaderboard, and shareable cards with QR codes, and was shown at the JetBrains GDC booth. Differences we lean into: offline-first, one deep game, a social relay mechanic, and per-gate teaching feedback instead of a single score.
