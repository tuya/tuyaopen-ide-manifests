# skills/

AI agent skills served to the TuyaOpen IDE (Cursor, Claude Code, VS Code Chat …).

Unlike the other domains in this repo, `skills` ships **both** the registry
(`index.json`) and the **payload** — the `SKILL.md` files and their
`references/` and `scripts/`. A skill and the manifest entry describing it are
always in the same commit, and the IDE gets everything from the single
`manifests.tar.gz` produced by `.github/workflows/release.yml`.

## Layout

Top level is a single product-line directory, not the capability surface: every
skill lives under `TuyaOpen/`, one directory per skill, **one level deep**, and
the directory name **is** the skill's `id`.

```
skills/
├── TuyaOS/                             # the other product line — NOTHING reads it
│   ├── index.json                      #   management only; excluded from releases
│   └── tuyaos-build/  tuyaos-hardware-vibe-coding/
└── TuyaOpen/                           # 28 skills — id starts with `tuyaopen-`
    ├── index.json                      #   THE registry the IDE and CLI read
│   ├── tuyaopen-shared/  tuyaopen-skill-maker/       #   foundation, not task skills
│   ├── tuyaopen-build/  tuyaopen-env-setup/  tuyaopen-device-auth/
│   ├── tuyaopen-add-board/  tuyaopen-code-check/  tuyaopen-project/
│   ├── tuyaopen-diagnose/  tuyaopen-flash/
│   ├── tuyaopen-workflow-dev-loop/  tuyaopen-workflow-product-dev/
│   ├── tuyaopen-hardware/              #   bundles sub-skills under peripheral-drivers/
│   ├── tuyaopen-dependency/
│   ├── tuyaopen-cloud/
│   └── tuyaopen-miniapp/  tuyaopen-miniapp-panel-dev/  tuyaopen-miniapp-ray-common/
│       tuyaopen-miniapp-smart-ui/  tuyaopen-miniapp-lamp-panel/
│       tuyaopen-miniapp-socket-panel/  tuyaopen-miniapp-robot-vacuum/
│       tuyaopen-miniapp-ipc-panel/  tuyaopen-miniapp-charts-library/
│       tuyaopen-miniapp-electrician-timing/  tuyaopen-miniapp-energy-stats/
        tuyaopen-miniapp-requirement-guide/  tuyaopen-miniapp-performance-ux-guard/
```

### Two product lines, one consumed

On **2026-08-17** the catalogue narrowed to TuyaOpen only: the two items of the
second product line were dropped from the index (30 → 28) and their payload was
moved, byte-for-byte, to a repo-root `tuyaos-skills/` — outside `skills/`, which
satisfied the orphan check by putting the tree where no scan looked.

On **2026-08-19** that placement was reversed and the separation made explicit
instead of incidental. `skills/TuyaOpen/index.json` became **`skills/TuyaOpen/index.json`**
and the TuyaOS payload moved back to **`skills/TuyaOS/`**, where it now carries
its own `index.json` so those files have a listed owner rather than sitting in the
repo unaccounted for.

Three things keep the second line out of the product, and each is enforced
somewhere different — that is deliberate, because one mechanism would be one
mechanism to forget:

| What | Where |
|---|---|
| The IDE and CLI resolve exactly one index | `registry.json`'s `manifests.skills.url` → `skills/TuyaOpen/index.json` |
| Releases do not ship the tree | `.github/workflows/release.yml` deletes `staging/skills/TuyaOS` after staging |
| The validator does not judge it | `GOVERNED_SUBTREE` in `scripts/validate-skills-index.py` scopes every scan to `TuyaOpen/` |

The validator scoping is **not an exemption**. Every rule in that script describes
a relationship with the `tuyaopen` CLI — the `cli` declaration, the single-valued
`sdks`, the Shortcuts agreement — so applying them to TuyaOS skills would assert
things that are meaningless there. Before this change the scans walked all of
`skills/`, which was correct only while `skills/` held exactly one product line.

Nothing in the TuyaOS payload was edited in either move; see
[`TuyaOS/README.md`](./TuyaOS/README.md).

The 2026-08-14 CLI-coverage pass merged five former standalone skills into
three renamed ones — `tuyaopen-tyutool-cli` into `tuyaopen-flash`;
`tuyaopen-cli-debug` + `tuyaopen-crash-decode` + `tuyaopen-debug-helper` into
`tuyaopen-diagnose`; `tuyaopen-project-config` into `tuyaopen-project` — and
added `tuyaopen-miniapp` as a brand-new skill covering the `miniapp` CLI
command group. See [History: TuyaOpen-dev-skills](#history-tuyaopen-dev-skills)
and each merged skill's own `references/` for what moved where.

Every `id` in the index carries the `tuyaopen-` prefix for a reason unrelated to
the directory layout: the global install
hub (`~/.agents/skills/`) is **shared with the community `npx skills`
registry** (vercel-labs/skills), so an unprefixed name like the old
`smart-panel-dev` could collide with and be overwritten by an unrelated
third-party skill of the same name. `surface` (`embedded` / `cloud` /
`miniapp`) is a separate, orthogonal field on each index item — it describes
*what kind of work the skill does*, not where its payload sits on disk; do not
expect it to match the top-level directory.

## Path rules

Three paths describe the same skill. The first two are about **where the
source lives**; the third is **where it gets installed**. Since the
2026-08-14 reorg the `id` **is** the second path segment, so all three are
mechanically derivable from one another — getting them out of sync is still
possible (nothing stops a typo), it's just no longer *necessary* the way it
was when the source tree nested three and four levels deep.

| | example | who reads it |
|---|---|---|
| `source.localPath` | `skills/TuyaOpen/tuyaopen-build` | this repo — where the payload lives |
| `installPayload` | `TuyaOpen/tuyaopen-build` | the IDE's cache layout — **must** equal `localPath` minus the `skills/` prefix (CI enforces this) |
| installed dir | `.agents/skills/tuyaopen-build` | the SKILL.md text itself — **`.agents/skills/<id>`, flat.** Not the payload path |

The installed directory is `path.join('.agents/skills', item.id)` in the IDE
(`src/core/skill/skills.ts`), so a skill with id `tuyaopen-build` installs to
`.agents/skills/tuyaopen-build/` regardless of how deeply its source is
nested. A *nested* form — `tuyaopen/build/` under `.agents/skills/` — is the
**old** layout the IDE actively repairs away from
(`src/core/skill/skillsLegacyMigration.ts`); it predates this reorg and is
kept only as a migration target, not something new content should produce.

So when a `SKILL.md` refers to its own scripts, write the **installed** form:

```bash
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-workflow-dev-loop/scripts/build_run.py
```

CI enforces this: `validate-skills-index.py` rejects any `.agents/skills/…`
path in a skill's markdown whose leading segment is not a known item `id`.

Sub-skills bundled inside a parent skill (e.g.
`TuyaOpen/tuyaopen-hardware/peripheral-drivers/onchip-gpio/SKILL.md`) are
**not** indexed separately — they ship with the parent and the validator
exempts them.

## `version` — per-skill payload version

Every item carries a required `version`, a plain `x.y.z` semver string:

```json
{ "id": "tuyaopen-build", "version": "1.0.0", "order": 1, … }
```

It versions **the payload** — the `SKILL.md` and its `references/` / `scripts/`
that get installed into a user's project. It is not the repo version and not
`registry.json`'s `manifests.skills.version` (that one is domain-level and
drives whether the IDE refetches the *whole* skills domain).

### Why it exists

Without it the IDE has exactly one signal: a recursive hash of the installed
copy versus the cached source. That hash cannot tell these apart:

- upstream shipped a new version of the skill → the project copy should be updated;
- the user hand-edited their installed copy → overwriting it destroys their work.

Both look identical, so an "update all" button would silently overwrite local
edits with no honest way to warn. The recorded version is what separates the
two cases.

### When to bump

Bump it **in the same PR as the payload change** — any edit to a file under the
skill's `source.localPath`, including its sub-skills and sidecar scripts:

| change | bump |
|---|---|
| typo, wording, a corrected command | patch — `1.0.0` → `1.0.1` |
| new steps, new script, meaningfully different behaviour | minor — `1.0.0` → `1.1.0` |
| incompatible restructure (renamed/removed script paths a project may call) | major — `1.0.0` → `2.0.0` |

Metadata-only edits in `index.json` (`name`, `summary`, `tags`, `order`) do not
touch the installed payload and need no bump. New skills start at `1.0.0`. Every
item was seeded at `1.0.0` when the field was introduced — the seed carries no
history, only the bumps after it mean anything.

A pure relocation — `source.localPath` moves but no file under it changes in
substance — still counts as a payload change under
`check-skill-version-bumps.py` (it treats `base_dir != head_dir` the same as a
touched file) and still needs a bump once the prior version has shipped. The
2026-08-14 `embedded/cloud/miniapp` → product-line reorg moved and, for
most items, renamed the `id` of all 29 skills; every item was bumped a single
**patch** version for it, on the theory that fixing a skill's own
self-references (frontmatter `name`/`id`, `related`, and in-body `see skill
…` links) to match its new address is the same class of change as "a
corrected command," not new behaviour or an incompatible restructure — the
instructional content itself did not change.

### Only published versions are frozen

A version has to be protected once it can be *installed*, which means once it has
been **released**. A version that has not shipped yet — the seeded `1.0.0`, or a
number an earlier PR in this same cycle already bumped to — may keep absorbing
payload edits without moving again. Otherwise a skill polished over four PRs
before its first release would debut at `1.0.4`, and the number would say nothing
about anything.

Concretely, within one release cycle: **the first PR that touches a released
payload bumps it; later PRs in that cycle ride the same number.** Once that
version ships, the next payload change bumps again.

What this never permits is landing on or below a number that already shipped —
that would make one version describe two different payloads.

CI enforces it on pull requests: `scripts/check-skill-version-bumps.py` compares
the PR against its base, and against `skills/TuyaOpen/index.json` as of the release tag in
`release.json`, to tell shipped versions from in-flight ones. It **fails when a
payload changed and a *published* `version` did not**, and when a version moves
backwards onto released ground. A version nobody bumps is worse than no version —
the IDE would confidently report installed copies as up to date while the content
changed underneath them.

Run it locally the way CI does:

```bash
RELEASE_TAG="$(python3 -c 'import json;print(json.load(open("release.json"))["tag"])')"
git show "$RELEASE_TAG:skills/TuyaOpen/index.json" > /tmp/released-index.json
git show HEAD:skills/index.json          > /tmp/base-index.json
git diff --name-only --no-renames HEAD -- skills/ \
  | python3 scripts/check-skill-version-bumps.py \
      --base-index /tmp/base-index.json \
      --released-index /tmp/released-index.json \
      --changed -
```

Omitting `--released-index` falls back to treating every base version as
published — stricter, never looser, so a broken or missing release tag can only
ask for an unnecessary bump, never wave a needed one through.

### How the IDE reads it

The IDE records the version it installed and compares it with the manifest's.
A **missing** version means *unknown* — never *up to date*: an item with no
version (an old cached manifest, a hand-written index) falls back to the
hash-only behaviour and is never treated as current on the strength of an
absent field. Adding the field was verified safe to publish ahead of IDE
support: the loader validates only `schemaVersion` / `domain` / `items`
(`src/manifests/manifestsLoader.ts`, `assertDomainEnvelope`) and per-item
fields are never enumerated, so shipped builds ignore it silently.

## Adding a skill

1. Create `skills/TuyaOpen/<id>/SKILL.md` (`<id>` must already carry the
   `tuyaopen-` prefix — see the collision note under [Layout](#layout)).
   Frontmatter:
   `name`, `description` — include Chinese keywords so retrieval works in both
   languages — `license`, `compatibility`. Put helper scripts in `scripts/`
   and long-form docs in `references/`.
2. Register it:

   ```bash
   node tools/manifest-gen/bin/manifest-gen.js skills add <id> \
     --surface embedded --order <n> \
     --payload <ProductLine>/<id> --local-path skills/<ProductLine>/<id> \
     --name-en "…" --name-zh "…" --summary-en "…" --summary-zh "…" \
     --when-en "…" --when-zh "…" --tags a b
   ```

   `name` / `summary` / `whenToUse` are required in **both** `en` and `zh-CN`.
   `--surface` is the semantic capability surface (`embedded` / `cloud` /
   `miniapp`) — it does not need to agree with any path segment. Leave `sdks`
   omitted; the default `["tuyaopen"]` is the only legal value and the
   validator enforces it. `version` defaults to `1.0.0`
   (`--skill-version` to override).
3. Editing an **existing** skill's payload? Bump that item's `version` — see
   [`version`](#version--per-skill-payload-version) above. CI fails the PR
   otherwise.
4. Bump `manifests.skills.version` in `registry.json` (minor for new items,
   patch for content-only edits).
5. Validate:

   ```bash
   python3 scripts/validate-skills-index.py     # structure, paths, versions, no orphans
   python3 -m pytest tests -q                   # skill + repo script unit tests
   ```

Both run in CI (`validate-skills-index.yml`, `skills-tests.yml`), which
additionally runs the version-bump check — that one needs the PR's base commit,
so it has no standalone local invocation.

## Using these skills without the TuyaOpen IDE

The IDE installs skills for you. If you work in plain Cursor / Claude Code, the
payloads here are usable directly — these instructions replace the ones that
lived in the archived `TuyaOpen-dev-skills` README.

Loader directories:

| Location | Scope | Notes |
|----------|-------|-------|
| `.agents/skills/` | project | Cursor / VS Code Agent Skills |
| `.cursor/skills/` | project | Cursor |
| `~/.cursor/skills/` | user | Cursor, global |
| `.claude/skills/` | project | Claude Code — walks **one** level only, so the directory name must be flat |

Either ask the agent to install a skill for you:

```text
Install the skill for this project: https://github.com/tuya/tuyaopen-ide-manifests.git
```

…or copy it in yourself. Since the reorg, **the source directory name already
is the `id`, flat** — copy it straight across:

```bash
git clone https://github.com/tuya/tuyaopen-ide-manifests.git
mkdir -p /path/to/TuyaOpen/.agents/skills
# skills/<ProductLine>/<id>  →  .agents/skills/<id>
cp -r tuyaopen-ide-manifests/skills/TuyaOpen/tuyaopen-build \
      /path/to/TuyaOpen/.agents/skills/tuyaopen-build
cp -r tuyaopen-ide-manifests/skills/TuyaOpen/tuyaopen-env-setup \
      /path/to/TuyaOpen/.agents/skills/tuyaopen-env-setup
```

No lookup in `index.json` needed to find the `id` — that was the point of the
reorg. (Before 2026-08-14, the source tree nested three or four levels deep
under a capability surface — `skills/embedded/tuyaopen/build` — and the `id`
had to be looked up separately because it wasn't derivable from the directory
name; `skills/miniapp/smart-panel-dev` installed as `smart-panel-dev`, for
example. That indirection is gone: every directory name under `TuyaOpen/` is
already the installed name — and `smart-panel-dev` itself became
`tuyaopen-miniapp-panel-dev`, keeping the old name as an `aliases` entry.)

## History: TuyaOpen-dev-skills

The skills now under `TuyaOpen/tuyaopen-build/`, `TuyaOpen/tuyaopen-env-setup/`,
`TuyaOpen/tuyaopen-device-auth/`, `TuyaOpen/tuyaopen-add-board/`,
`TuyaOpen/tuyaopen-code-check/`, `TuyaOpen/tuyaopen-project/` (as
`tuyaopen-project-config`), and `TuyaOpen/tuyaopen-diagnose/` (as
`tuyaopen-debug-helper` + `tuyaopen-cli-debug` + `tuyaopen-crash-decode`) came
from `tuya/TuyaOpen-dev-skills`, which the IDE used to download as a
**second** tarball resolved through the `devSkillsRelease` field in
`index.json`. That repo is **archived** and its content was inlined here —
originally under `skills/embedded/tuyaopen/` — at upstream `d0655d46`
(v0.0.10); the 2026-08-14 reorg (see [Layout](#layout)) moved each of those
nine skills to its own `TuyaOpen/<id>/` directory, and a same-day
CLI-coverage pass (see the note under [Layout](#layout)) merged three of
those nine (`tuyaopen-debug-helper`, `tuyaopen-cli-debug`,
`tuyaopen-crash-decode`) into `tuyaopen-diagnose` and renamed
`tuyaopen-project-config` to `tuyaopen-project`.

`devSkillsRelease` and `source.devSkills` are **gone**, and the validator now
rejects `source.devSkills`. Verified against the IDE before removing the field:
it is optional-typed (`SkillsManifest.devSkillsRelease?`) and was guarded from
the commit that introduced it — `skillsFlow.ts` only syncs when
`devSkillsRelease != null && some(source.devSkills === true)`, and `syncSkills`
logs-and-skips when the block is absent. `assertDomainEnvelope` validates only
`schemaVersion` / `domain` / `items`, so no IDE build ever required the field.

How the payload reaches the IDE now:

- **dev** — read straight from the `vendor/tuyaopen-ide-manifests` submodule at
  `vendor/tuyaopen-ide-manifests/<localPath>`.
- **prod** — `manifests.tar.gz` is extracted and resolved per skill by
  `installPayload`. Before the 2026-08-14 reorg the extraction step copied
  `skills/{embedded,cloud,miniapp}` to `<globalStorage>/cache/skills-registry/{surface}`
  one capability-surface directory at a time; that top-level split no longer
  exists on disk (see [Layout](#layout)), so the IDE-side extraction step needs
  a matching update — out of scope for this reorg, tracked as main-repo
  follow-up. `installPayload` remains the single source of truth for where a
  skill's payload resolves to either way.
