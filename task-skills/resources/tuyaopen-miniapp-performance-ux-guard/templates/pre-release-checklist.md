# Release review checklist

Record the actual target/runtime and source of each release requirement. Mark each item PASS, BLOCKED or NOT VERIFIED, with evidence. An explained gap remains NOT VERIFIED.

- Requested interactions and loading/error/empty states behave correctly.
- Side effects handle repeated submits, errors and lifecycle cleanup.
- Sensitive data stays out of source/logs and user-visible text follows project localization.
- Build and available preview/interaction checks cover the change.
- Package and performance measurements meet verified target requirements or agreed project budgets.

Historical 2 MB, one blocking request, two synchronous calls, 3 s and 200 ms figures are investigation references, not universal platform gates. Do not claim a release decision from source inspection or numeric guesses alone.
