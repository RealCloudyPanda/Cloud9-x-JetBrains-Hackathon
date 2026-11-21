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
