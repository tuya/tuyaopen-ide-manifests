# skills/TuyaOS/ — parked, not maintained, not shipped

This tree was `skills/TuyaOS/` until **2026-08-17**, spent two days at the
repo root as `tuyaos-skills/`, and on **2026-08-19** moved back here — this time
with its own `index.json`, so the payload has a listed owner instead of being
kept out of the way by living somewhere no scan looked. What keeps it out of the
product is now stated in three enforced places rather than implied by its path;
see the table in [`../README.md`](../README.md). It holds two skills
(`tuyaos-build`, `tuyaos-hardware-vibe-coding`, the latter bundling 13
peripheral sub-skills) plus their nested payloads — 16 `SKILL.md` files.

## What happened, exactly

The skills catalogue narrowed to **TuyaOpen only**. The two items were removed
from `skills/TuyaOpen/index.json` (30 → 28 items) and this payload was **moved with
`git mv`, contents unmodified** — every file here is byte-for-byte what it was
under `skills/TuyaOS/`. Verify with:

```bash
git log --follow --oneline -- tuyaos-skills/tuyaos-build/SKILL.md
git show --stat <the relocating commit>     # pure renames, no content hunks
```

## Why it moved instead of staying put

`scripts/validate-skills-index.py` runs an **orphan check**: every
`skills/**/SKILL.md` directory must be referenced by exactly one item in
`skills/TuyaOpen/index.json`. De-registering the two items while leaving the payload
under `skills/` would have failed validation. Moving it outside `skills/` is
what satisfies both constraints at once — de-registered *and* unedited.

## Consequences

- **Not shipped.** `.github/workflows/release.yml` stages an explicit list of
  domain directories (`boards-and-chips demos platforms skills
  miniapp-templates`) before creating `manifests.tar.gz`. A repo-root directory
  that is not on that list contributes zero bytes to the release artefact.
- **Not installable.** Nothing indexes it, so no consumer can list, group,
  install or sync it. Note this is a *stronger* condition than before: while
  these items were indexed with `sdks: ["tuyaos"]`, both consumers' SDK gates
  (`skillsFlow.ts` for the IDE, `cli/commands/skills.ts` for the CLI) already
  dropped them at ingestion — so no TuyaOpen user could reach them then either.
  What changed is that they are now absent rather than filtered.
- **Not validated.** The validator's `PRODUCT_LINES` is `{"TuyaOpen"}` and
  `SDKS` is `{"tuyaopen"}`; this tree is outside its scope entirely, so nothing
  here is checked for frontmatter, id/directory agreement, or link integrity.
  Treat the content as frozen at its 2026-08-17 state.

## If you want to revive it

Don't re-register it into `skills/TuyaOpen/index.json` — that would put the other
product line back inside the TuyaOpen catalogue, which is the thing 2026-08-17
undid. Give it its own registry: a separate repository, or a new domain in
`registry.json` with its own `index.json`, its own validator scope, and its own
entry in the release workflow's staging list. Both consumers resolve
`skills/TuyaOpen/index.json` by a hard-coded path
(`cli/commands/skills.ts`, `manifests/manifestsCacheIntegrity.ts` in the IDE
repo), so a second registry needs code on the consumer side too — plan for that
rather than discovering it.
