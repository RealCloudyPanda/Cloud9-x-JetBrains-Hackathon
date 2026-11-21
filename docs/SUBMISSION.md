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
