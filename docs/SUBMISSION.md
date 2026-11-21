# Submission pack: Cloud9 x JetBrains "Sky's The Limit" 2026, Category 3

Draft for the owner. Nothing here has been submitted. Rules, overview and Submission Specifics checked on cloud9.devpost.com on 2026-11-21.

## Rules that matter (as read on 2026-11-21)

| Item | What the rules say | Status |
| --- | --- | --- |
| Deadline | **Jan 12 2027, 11:00 AM PT (2:00 PM ET)**. Judging Jan 27 – Feb 3; winners around Feb 8. | Aim to submit by **Jan 10**. |
| Eligibility | Age of majority where you live (18 in Ontario). Quebec residents excluded. | Owner to confirm. |
| **Built with a JetBrains tool** | "Build or significantly update a working project using at least one JetBrains tool" (IDE, Air or Junie). Other editors are allowed alongside. | **Blocker.** So far the build used Claude and Codex, not a JetBrains tool. See "The JetBrains pass" below. |
| Tooling explanation | Required: which JetBrains tools you used and what each one did. | Owner only, from real use. |
| Methodology write-up | Required: short explanation of the approach and how it solves the category's problem. | Draft below; owner fills the marked lines. |
| Working project | A link to a working demo **if the project is a website**; otherwise a judge-accessible build. | Ghost Relay is a website, so a hosted link is expected. GitHub Pages deploy is pending your approval. |
| Repo | Public, with a license detectable in the About section. Committing genuine `.idea`, `.junie` or `.air` folders is encouraged. | Public; GitHub detects MIT. No JetBrains folders yet. |
| Video | **Under 3 minutes**, public on YouTube, showing the project working on its device. No third-party trademarks or copyrighted music without permission. | Not recorded. Script below runs 2:40. |
| Category 3 must-haves | Complete loop (start → play → end/score screen); resets cleanly between players; stays responsive in sustained use. Stretch: a gamer skill, a local live leaderboard on a second monitor without Wi-Fi. | All shown in the script. |
| Bonus: Best AI-Powered Workflow Story ($1,000) | A direct URL to a case study or short video about using JetBrains IDEs, Junie or Air. A repo file such as `AI_SHOWCASE.md` counts. | Template with 7 `TODO (owner)` lines. Only real use counts. |

**Judging** (equally weighted): Technological Implementation ("How thoroughly and skillfully does the project use JetBrains tools?"), Design, Potential Impact, Quality of the Idea, Presentation (the video, end to end). Ties go to the higher score on the first criterion, which is the JetBrains one.

## The JetBrains pass (do this before recording)

The JetBrains requirement is both an eligibility rule and the first judging criterion, so the entry is weakest here. A real pass that changes the game is the fix. Pick one task from the README's Known limitations and do it in WebStorm (or Rider) with Junie:

1. **ESLint `no-restricted-globals` for `src/sim/`** (SPEC §7). Small, testable, and on theme: the IDE then flags `Math.random`, `Date` or `performance` in the sim as you type. Good footage.
2. **Finish slow-motion** (SPEC §5.1). Visible in the video, but it must stay in the renderer so determinism holds (ADR 0002).

Record your screen while you work. That footage goes in the video segment at 2:05–2:30 and can become the bonus video. Commit any `.idea` / `.junie` files the tools actually create; never write them by hand. Then fill `AI_SHOWCASE.md` and `docs/METHODOLOGY.md` from what happened.

## Video script (target 2:40, hard cap under 3:00)

Film the real booth setup: laptop plus a second monitor, Wi-Fi off. You need two turns: Player A, then Player B racing A's Ghost. A friend as Player B is best. If you play both turns yourself, don't present them as two different people. Use the Verdict sentence that actually appears in your take; the one below comes from a unit test.

| Time | Picture | Voice-over / on-screen text |
| --- | --- | --- |
| 0:00–0:15 | Cold open on Player B's finish: the cyan Ghost and the runner cross the line close together. Hard cut to Results: split bar, one gate lit orange, the Verdict sentence. | *(no voice for 3 s, game audio only)* "Ghost Relay. You race the person who played right before you, and the game tells you exactly where you lost." |
| 0:15–0:35 | Wide shot of the booth: queue, game monitor, leaderboard monitor. Attract screen shows `BEAT ___ · __.__`. | "At a booth, the top score was set hours ago by someone who's gone. The rival you care about is the person you just watched. So every run becomes the next player's Ghost." |
| 0:35–1:05 | Player A presses any key: countdown, run. Show a Switch Beam revealing jump or slide at the last moment. Delta chips pop at gates. | "Two buttons: jump and slide. No tutorial. About thirty seconds. Switch Beams only show whether to jump or slide at the last moment, so it's a reaction test, the same skill competitive players train." |
| 1:05–1:35 | Player B races A's Ghost. Live Deltas. Results and Verdict. B enters initials. Booth returns to Attract with B as the new rival. | "Six split gates. At the end you get one sentence, the gate where you lost the most time and why. Then your three initials, and you're the Ghost for the next person in line." |
| 1:35–1:55 | Second monitor updating live as B runs; laptop Wi-Fi menu showing off. Quick cut: an idle screen timing out back to Attract; `Ctrl+Shift+O` Operator Panel, *Start new day*. | "The leaderboard runs on a second monitor with no internet. Every screen resets itself when someone walks away. A volunteer can start a new day in two keystrokes." |
| 1:55–2:05 | Terminal: `npx vitest run --reporter=verbose`, zoom on the real lines `2000/2000 replays matched` and `endurance: 1000 turns … 40/40 stored ghosts replay-verified`, then `Tests 61 passed`. | "A Ghost isn't a recording of positions. It's your inputs, replayed through a deterministic integer simulation. The tests replay four thousand runs and a thousand booth turns to prove every Ghost matches." |
| 2:05–2:30 | **Owner footage** from the JetBrains pass: WebStorm/Rider and Junie doing the real task. | **[[OWNER]]** Describe in one or two sentences what you used and what it did, e.g. "I used WebStorm and Junie to …". Only what actually happened. |
| 2:30–2:40 | Attract screen, `BEAT` with B's initials. End card: "Ghost Relay — beat the last one." Repo and demo URLs. | "Ghost Relay. Beat the last one." |

Recording notes:
- Every number on screen must come from the run you film. The test output above matched exactly on 2026-11-21.
- Keep Cloud9 and Riot logos out of the frame, and use no copyrighted music. The game's own synth audio is fine.
- Upload to YouTube as **public**, then check the length is under 3:00.

## Devpost text

**Project name:** Ghost Relay

**Elevator pitch** (≤200 chars):

> Race the ghost of the player who went right before you. Two buttons, 30 seconds, a gate-by-gate verdict on where you lost, and a second-monitor leaderboard that needs no Wi-Fi.

**About the project** (Devpost's markdown field):

```markdown
## The problem
A booth volunteer has a queue of strangers and one laptop. A high-score table means little to the person in
line: the number at the top was set hours ago by someone who left. What they actually watched was the player
in front of them. Booth games also fail the volunteer: stuck screens, tutorials nobody reads, and
leaderboards that need Wi-Fi.

## What it does
Ghost Relay is a 30-second neon sprint with two buttons, jump and slide. You race a translucent Ghost of the
player who went right before you. At each of six Split Gates a Delta shows whether you're ahead or behind,
and the Results screen gives one plain sentence about where you lost or gained the most time, such as
"You lost 0.42 s at Gate 3: 2 hits on the Switch Beam." Then you enter your initials and your run becomes
the Ghost for the next person in line. Switch Beams reveal whether to jump or slide only at the last moment,
so it is a reaction drill as well as a race.

It is built for real booths: an attract screen, idle timeouts on every screen, arcade initials, a champion
mode, a hidden operator panel to start a new day, and a live leaderboard for a second monitor that syncs
between windows with no network at all.

## How I built it
TypeScript, Vite and Canvas 2D, with a Web Audio synth and no audio files. A Ghost is not a recording of
positions: it is the player's input log (typically under 1.3 KB) replayed through the same deterministic
simulation. The simulation uses integer fixed-point maths with no clocks, randomness or floats in its state,
and stores a state hash at every Split Gate, so a replay that drifts is rejected instead of shown wrong.
The leaderboard monitor syncs with BroadcastChannel and storage events and restores from localStorage.

[[OWNER: which JetBrains tools you used and what each did, from your real use.]]

## Proof it holds up at a booth
From the test suite (Vitest, 61 tests): 2,000 of 2,000 seeded bot runs replayed identically on the flat
course and 2,000 of 2,000 on the full course; a 1,000-turn endurance run kept 40 of 40 stored Ghosts
replay-verified. A test also scans the simulation source for `Math.random`, `Date`,
`performance` and DOM globals.

## Challenges
Keeping replays exact meant treating the step number as the clock: input is sampled once per 60 Hz tick
and the simulation only ever sees that bitmask. Any change to physics would silently break old Ghosts, so
the course version is a hash of the course data and every tuning constant, and changing either retires old
Ghosts automatically.

## What's next
[[OWNER: from real playtests: what players found hard, what you changed.]] Not yet built: finish slow-motion
and a synth drone that follows the player's speed.

## Built with AI assistance
This project was built with significant AI assistance. Planning documents and much of the implementation
were drafted by AI coding agents from my brief and reviewed by running them. [[OWNER: your JetBrains/Junie
workflow.]] All test numbers come from actual runs.
```

**Built with:** `typescript` · `vite` · `canvas` · `web-audio-api` · `vitest` · `broadcastchannel` · `localstorage` · [[OWNER: the JetBrains tools you actually used, e.g. `webstorm` `junie`]]

**Try it out:** [[hosted demo URL once GitHub Pages is live]] · `https://github.com/RealCloudyPanda/Cloud9-x-JetBrains-Hackathon`

**Category:** Category 3: Event Mini Game

**Methodology write-up** (required field; facts pre-filled, judgement calls are yours):

> Category 3 asks for a booth game that a stranger understands instantly, that resets cleanly between players, and that stays responsive over a long day. I designed around one booth fact: the rival people care about is the person they just watched, not a high score from hours ago. So every run is raced against the previous player's Ghost, and the end screen names the gate where you lost the most time.
>
> To make Ghosts trustworthy I chose a deterministic integer simulation that replays input logs, with a hash at every gate that rejects any replay that drifts. The test suite checks this with 4,000 seeded bot replays and a 1,000-turn endurance run. For booth reliability every screen has an idle timeout back to Attract, a hidden operator panel starts a new day, and the second-monitor leaderboard syncs locally with no Wi-Fi.
>
> [[OWNER: what you changed after real playtests, and how the JetBrains tools fit into your process.]]

**Tooling explanation** (required field): [[OWNER ONLY: which JetBrains IDE / Junie / Air you used and what each did. Do not submit until this is real.]]

**Bonus prize URL:** link to `AI_SHOWCASE.md` on GitHub once you've filled it, or to a short video of your JetBrains workflow.

## Before you press submit
- [ ] JetBrains pass done; `AI_SHOWCASE.md` and `docs/METHODOLOGY.md` filled from real use.
- [ ] GitHub Pages deployed and the link tested in a private window.
- [ ] Video under 3:00, public on YouTube, numbers on screen from the filmed run.
- [ ] Every `[[OWNER]]` line above replaced or removed.
- [ ] Submit by Jan 10; the deadline is Jan 12, 2:00 PM ET.
