# Component architecture review

Read adjacent components and identify state ownership, reusable interfaces and dependency direction. Split when it reduces duplication or isolates behavior; page count alone does not require splitting. Continue implementation within the user's authorized scope. Ask about unresolved product choices that affect behavior, not routine component boundaries.

Document props, events and state ownership when useful for review. Prefer compatible changes to shared components; create a separate component when extending the existing one would disrupt unrelated callers. Validate the changed interactions with the project's available tools.
