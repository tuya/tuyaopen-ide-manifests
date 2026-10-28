# MiniApp quality and performance review

Use for evidence-based review and optimization of performance, interaction states, accessibility and release quality. Ordinary feature implementation stays with Ray/Smart UI; this skill does not take over every page, bug or design request.

1. Read adjacent code and the project's actual constraints; select only the needed review area.
2. Review loading/error/empty/success states, feedback, repeated submits, lifecycle cleanup, device context and localization as relevant to the change. Prefer the project's existing components and request/state patterns.
3. Measure startup, package and rendering issues before assigning causes. Historical budgets such as package size, request counts and latency are recommendations unless verified against the current target/runtime or explicitly agreed project budgets.
4. Use available preview/DevTools capabilities to gather evidence before asking the user to do it. Missing tools, screenshots or measurements produce a stated gap, never fabricated PASS.
5. Report blocking defects separately from suggestions and measured performance. A release decision requires evidence for its actual acceptance criteria; merely explaining an evidence gap is not a passed gate.
6. Reuse the Smart UI mapping references when reviewing a design. Component splitting is an implementation choice, not a new approval gate on every two-page reuse. Do not forbid all custom styles or require every design value to match an existing token.

References and internal review workflows remain available by files list. build-guard.md contains a checklist, launch-performance.md contains hypotheses to measure, review-gate.md structures findings, and design-component.md supplies review references. Their numeric heuristics do not override the current project/runtime or user scope.
