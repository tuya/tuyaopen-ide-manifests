# Review rubric

Report concrete findings with location, impact and evidence. Blocking means a demonstrated functional defect or a verified violation of the current target's release requirements. Unmeasured performance is unknown, not a failed platform limit or a PASS.

For release review, use PASS / BLOCKED / NOT VERIFIED for each actual acceptance criterion. Missing required evidence results in NOT VERIFIED. Keep optional improvement suggestions separate. Historical 2 MB, one blocking request, two synchronous calls, 3 s startup, 200 ms feedback and 50-row budgets are hypotheses until the target/runtime or project requirements confirm them.

Assess relevant loading/error/empty/success states, repeated side effects, lifecycle cleanup, localization, sensitive-data handling and accessibility. Record measurements and tools actually used; no tool-specific evidence is mandatory when it is unavailable. Do not remove valid Chinese UI text: follow the project's localization strategy.
