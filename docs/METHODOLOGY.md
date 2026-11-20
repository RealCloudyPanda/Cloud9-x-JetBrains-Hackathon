# Methodology

> **TODO (owner):** template. Pre-filled lines only link to things that exist in this repo; every judgement call is yours to write.

## Goal and constraints

Pre-filled facts: a booth mini-game for Cloud9 x JetBrains 2026, Category 3 (Event Mini Game). Two buttons, about 30 s per Run, offline (see [ADR 0004](adr/0004-offline-only-booth-no-server.md)).

TODO (owner): why these constraints matter to you.

## Process (grill → spec → plan → build)

Pre-filled: design interview in [GRILL.md](GRILL.md), spec in [SPEC.md](SPEC.md), ordered tasks in [PLAN.md](PLAN.md), vocabulary in [../GLOSSARY.md](../GLOSSARY.md).

TODO (owner): how you actually moved through these, and what you'd change.

## Determinism strategy and how it was tested

Pre-filled: integer fixed-point sim ([ADR 0002](adr/0002-integer-fixed-point-simulation.md)); Ghosts are re-simulated Input Logs ([ADR 0001](adr/0001-ghost-is-a-resimulated-input-log.md)); tests in [`test/determinism.test.ts`](../test/determinism.test.ts), [`test/ghost.test.ts`](../test/ghost.test.ts), [`test/endurance.test.ts`](../test/endurance.test.ts), purity grep in [`test/simPurity.test.ts`](../test/simPurity.test.ts).

## Playtest notes

TODO (owner): who played, what confused them, which obstacle caused most hits. Only real observations.

## What changed and why

Pre-filled from commit history: hitbox forgiveness raised and Pit width / Double Hurdle spacing tuned after the autopilot measurements (see the `feat(game): generate and ship a house ghost` commit body).

TODO (owner): changes after real playtests.

## What I'd do next

TODO (owner).
