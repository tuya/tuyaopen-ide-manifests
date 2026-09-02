# skills/

AI agent skills served to the TuyaOpen IDE (Cursor, Claude Code, VS Code Chat …).

Unlike the other domains in this repo, `skills` ships **both** the registry
(`index.json`) and the **payload** — the `SKILL.md` files and their
`references/` and `scripts/`. A skill and the manifest entry describing it are
always in the same commit, and the IDE gets everything from the single
`manifests.tar.gz` produced by `.github/workflows/release.yml`.

## Layout

One index at the root, and the payloads grouped by **install group**. Every
skill is a single directory at `skills/<group>/<id>/` — **two levels deep**,
where the first level equals the item's own `group` field and the second level
**is** the skill's `id`.

The group is the unit `tuyaopen-cli skills install --group <g>` offers, so
grouping the tree the same way puts one whole install unit in one directory.
Five groups: `core` / `embedded` / `cloud` / `miniapp` / `scenario`. The first
four group by capability; `scenario` groups by **product category** instead —
the lamp / socket / robot-vacuum / IPC playbooks a developer installs exactly
one of.

```
skills/
├── index.json                     # THE registry — 32 items, both product lines
├── core/                          # 2 payloads
│   └── tuyaopen-start/  tuyaopen-skill-maker/          # foundation, not task skills
├── embedded/                      # 13 payloads
│   ├── tuyaopen-embedded/  tuyaopen-embedded-build/  tuyaopen-embedded-env-setup/
│   ├── tuyaopen-embedded-project/  tuyaopen-embedded-add-board/  tuyaopen-embedded-code-check/
│   ├── tuyaopen-embedded-cli-debug/  tuyaopen-embedded-flash/  tuyaopen-embedded-device-auth/
│   ├── tuyaopen-embedded-hardware/                     # per-peripheral docs under references/peripherals/
│   ├── tuyaopen-workflow-embedded-dev/
│   └── tuyaos-build/  tuyaos-hardware-vibe-coding/     # sdks: ["tuyaos"] — the other product line
├── cloud/                         # 2 payloads
│   └── tuyaopen-cloud/  tuyaopen-workflow-product-dev/
├── miniapp/                       # 7 payloads
│   ├── tuyaopen-miniapp/  tuyaopen-workflow-miniapp-dev/  tuyaopen-miniapp-ray-common/
│   ├── tuyaopen-miniapp-smart-ui/  tuyaopen-miniapp-charts-library/
│   └── tuyaopen-miniapp-requirement-guide/  tuyaopen-miniapp-performance-ux-guard/
└── scenario/                      # 8 payloads
    ├── tuyaopen-miniapp-lamp-panel/  tuyaopen-miniapp-socket-panel/
    ├── tuyaopen-miniapp-robot-vacuum/  tuyaopen-miniapp-ipc-panel/
    ├── tuyaopen-miniapp-electrician-timing/  tuyaopen-miniapp-energy-stats/
    └── tuyaopen-embedded-dependency/  tuyaopen-embedded-lvgl/
```

Note `scenario` is **not** named after miniapp even though six of its eight
members are panel playbooks: `tuyaopen-embedded-dependency` and
`tuyaopen-embedded-lvgl` already sit there with `surface: "embedded"`, and more
embedded per-category skills are expected.

Those counts drift and nothing co-enforces a number written here. Measure
instead of transcribing:

```bash
python3 -c "import json,collections;d=json.load(open('skills/index.json'));\
print(len(d['items']),collections.Counter(i['group'] for i in d['items']))"
```

Because the group **is** the directory, `group` and the payload path can no
longer disagree — `validate-skills-index.py`'s `check_source()` fails when they
do. Its history: pre-2026-08-14 the top level was the capability `surface` and a
matching rule existed; the 2026-08-14 reorg made the top level the *product
line*, leaving that rule nothing to compare against, so it was deleted;
2026-09-02 moved the product-line distinction into `sdks` and gave the directory
back — first to `surface`, then, within the same unreleased change, to `group`.
The rule is now an equality check the original never had.

### `surface` is a second axis, not the path

**Nothing may infer a surface from a path.** `surface` is still required on
every item and is unchanged by the directory move — it drives the IDE's filter
tabs ("which end of the product is this about"), while `group` drives installs
("what am I setting out to do"). The two are fully orthogonal and disagree for
**11 of the 32** items today: `tuyaopen-start` is `surface: "embedded"` with
`group: "core"`; every `tuyaopen-miniapp-*-panel` playbook is
`surface: "miniapp"` with `group: "scenario"`;
`tuyaopen-workflow-product-dev` is `surface: "embedded"` with `group: "cloud"`.
Surface distribution — embedded 18, miniapp 13, cloud 1 — did not change when
the directories did.

Measure the disagreement rather than trusting the number above:

```bash
python3 -c "import json;d=json.load(open('skills/index.json'));\
print(sum(1 for i in d['items'] if i['group']!=i['surface']),'of',len(d['items']))"
```

`check_source()` compares the path's second segment to `group`, **never** to
`surface`. A doc or tool that reads a surface out of a payload path is reading
the wrong field, and would be wrong about a third of the catalogue.

The group formerly called `product` was renamed **`cloud`** on 2026-09-02, in
the same unreleased change. Do not confuse that rename with `cli.groups` in
`index.json`, which names **`tuyaopen-cli` command groups**: the string
`"product"` there is the `tuyaopen-cli product` command group and is still
correct on the two items that declare it (`tuyaopen-cloud`,
`tuyaopen-workflow-product-dev`). Same word, two vocabularies — only the
install group was renamed.

### Two product lines, one index

**`sdks` is the only thing that separates them.** 30 items carry
`["tuyaopen"]`; two — `tuyaos-build` and `tuyaos-hardware-vibe-coding` — carry
`["tuyaos"]`. Omitting the field still means `["tuyaopen"]`, so a hand-written
entry that forgets it lands in the right line; every item happens to state it
explicitly today, but the default is what makes that safe, not something to
lean on.

**Both lines ship.** `manifests.tar.gz` carries the whole `skills/` tree and
the one index advertises every item in it, so the filtering happens at the
**consumer**, never at the packager: `sdkAppliesToItem()` on the IDE side, the
matching gate in the CLI's `skills` group. Deleting a path at release time
would now hide a payload that the shipped index still points at.

The validator scopes by the same field, and that scoping is **not an
exemption**. Rules that describe a *relationship with the `tuyaopen-cli` CLI* — the
`cli` declaration and its Shortcuts agreement, the `tuyaopen-start` routing-table
coverage, the `triggers` coverage — run only for items `applies_to_tuyaopen()`
accepts, because asserting them about a TuyaOS skill would assert something
meaningless: there is no CLI command group for it to name. Every other rule —
frontmatter, the id/directory agreement, `.agents/skills/…` path integrity,
`version`, orphans — applies to the whole tree, both lines included.

#### What this replaced

On **2026-08-17** the catalogue narrowed to TuyaOpen only: the two items of the
second product line were dropped from the index (30 → 28) and their payload was
moved, byte-for-byte, to a repo-root `tuyaos-skills/` — outside `skills/`, which
satisfied the orphan check by putting the tree where no scan looked.

On **2026-08-19** that placement was reversed and the separation made explicit
instead of incidental: the registry pointed at `skills/TuyaOpen/index.json`, the
TuyaOS payload moved back to `skills/TuyaOS/` with an `index.json` of its own,
and **three** independent mechanisms kept the second line out of the product —
`registry.json`'s `manifests.skills.url`, a `rm -rf staging/skills/TuyaOS` in
`.github/workflows/release.yml`, and a `GOVERNED_SUBTREE` constant in
`scripts/validate-skills-index.py`. They were deliberately independent, on the
theory that one mechanism is one mechanism to forget.

All three are gone as of **2026-09-02**. A path split can only answer "which
product line is this?" while exactly one line ships; both ship now, so the
question is asked of the field that states it. The history is kept here because
someone reading `release.yml` and finding that it deletes nothing should be able
to tell that from an oversight.

Nothing in the TuyaOS payload has been edited through any of these moves — every
relocation was a pure `git mv`, checkable with
`git log --follow --oneline -- skills/embedded/tuyaos-build/SKILL.md`. Its two
items hold 16 `SKILL.md` files between them, 14 of which are sub-skills nested
under `tuyaos-hardware-vibe-coding/peripheral-drivers/`. The orphan check exempts
those as bundled payload, but they do contradict the never-name-a-bundled-doc
`SKILL.md` rule under [Path rules](#path-rules); they predate it, they reach no
TuyaOpen consumer (the `sdks` gate drops the whole line first), and they are
deliberately left alone.

The 2026-08-14 CLI-coverage pass merged five former standalone skills into
three renamed ones — `tuyaopen-tyutool-cli` into `tuyaopen-embedded-flash`;
`tuyaopen-cli-debug` + `tuyaopen-crash-decode` + `tuyaopen-debug-helper` into
`tuyaopen-embedded-cli-debug`; `tuyaopen-project-config` into `tuyaopen-embedded-project` — and
added `tuyaopen-miniapp` as a brand-new skill covering the `miniapp` CLI
command group. See [History: TuyaOpen-dev-skills](#history-tuyaopen-dev-skills)
and each merged skill's own `references/` for what moved where.

Every `id` in the index is prefixed with its product line — `tuyaopen-` for the
30 TuyaOpen skills, `tuyaos-` for the two TuyaOS ones — for a reason unrelated
to the directory layout: the global install hub (`~/.agents/skills/`) is
**shared with the community `npx skills` registry** (vercel-labs/skills), so an
unprefixed name like the old `smart-panel-dev` could collide with and be
overwritten by an unrelated third-party skill of the same name. That the prefix
happens to name the product line is a convenience, not the mechanism — `sdks` is
the mechanism, and nothing parses an id to decide which line an item is in.
`surface` (`embedded` / `cloud` / `miniapp`) describes *what kind of work the
skill does*, and is **not** the directory — see
[`surface` is a second axis](#surface-is-a-second-axis-not-the-path).

## Path rules

Three paths describe the same skill. The first two are about **where the
source lives**; the third is **where it gets installed**. The `id` **is** the
last path segment and the `group` **is** the one before it, so all three are
mechanically derivable from one another — getting them out of sync is still
possible (nothing stops a typo), it's just no longer *necessary* the way it
was when the source tree nested three and four levels deep. `surface` is
derivable from none of them.

| | example | who reads it |
|---|---|---|
| `source.localPath` | `skills/core/tuyaopen-start` | this repo — where the payload lives. Second segment must equal the item's `group`, last segment must equal its `id` |
| `installPayload` | `core/tuyaopen-start` | the IDE's cache layout — **must** equal `localPath` minus the `skills/` prefix (CI enforces this), which under today's layout makes it two segments. **At least** two is the load-bearing part: the IDE's cache prune (`skillsSync.ts`'s `pruneOrphanCacheDirs`) reads two levels and would treat every entry as an orphan — deleting the whole cache — if a payload were a single segment. Deeper payloads are tolerated; the pre-2026-08-17 catalogue had three |
| installed dir | `.agents/skills/tuyaopen-start` | the SKILL.md text itself — **`.agents/skills/<id>`, flat.** Not the payload path |

That example is deliberately a skill whose `group` (`core`) is not its
`surface` (`embedded`): the path says `core/` and nothing about it is wrong.

The installed directory is `path.join('.agents/skills', item.id)` in the IDE
(`src/core/skill/skills.ts`), so a skill with id `tuyaopen-start` installs to
`.agents/skills/tuyaopen-start/` regardless of how deeply its source is
nested. A *nested* form — `tuyaopen/build/` under `.agents/skills/` — is the
**old** layout the IDE actively repairs away from
(`src/core/skill/skillsLegacyMigration.ts`); it predates this reorg and is
kept only as a migration target, not something new content should produce.

So when a `SKILL.md` refers to its own scripts, write the **installed** form:

```bash
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-workflow-embedded-dev/scripts/build_run.py
```

CI enforces this: `validate-skills-index.py` rejects any `.agents/skills/…`
path in a skill's markdown whose leading segment is not a known item `id`.

Documents bundled inside a parent skill (e.g.
`embedded/tuyaopen-embedded-hardware/references/peripherals/onchip-gpio.md`) are
**not** indexed separately — they ship with the parent and the validator
exempts them.

**They must never be named `SKILL.md`.** Agent loaders that scan recursively
(Codex, and anything else walking `~/.agents/skills` for `SKILL.md`) register
every one they find as an independent skill. Until 2026-08-26 the hardware
skill's 26 peripheral documents were named that way, so one installed skill
presented as 27 and a machine with the 17-skill default set showed 43 choices.
Bundle payload goes under `references/`, per `tuyaopen-skill-maker` § 7.

## `version` — per-skill payload version

Every item carries a required `version`, a plain `x.y.z` semver string:

```json
{ "id": "tuyaopen-embedded-build", "version": "1.0.0", "order": 1, … }
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
the PR against its base, and against `skills/index.json` as of the release tag in
`release.json`, to tell shipped versions from in-flight ones. It **fails when a
payload changed and a *published* `version` did not**, and when a version moves
backwards onto released ground. A version nobody bumps is worse than no version —
the IDE would confidently report installed copies as up to date while the content
changed underneath them.

Run it locally the way CI does:

```bash
RELEASE_TAG="$(python3 -c 'import json;print(json.load(open("release.json"))["tag"])')"
# The index has lived at two paths across three eras (`skills/index.json`, then
# `skills/TuyaOpen/index.json` from 2026-08-19, then back again on 2026-09-02).
# Try the current one first and fall back, the way the workflow does — naming
# only one silently produces an empty baseline for a tag that predates it, and
# an empty baseline never fails.
git show "$RELEASE_TAG:skills/index.json" > /tmp/released-index.json 2>/dev/null \
  || git show "$RELEASE_TAG:skills/TuyaOpen/index.json" > /tmp/released-index.json
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

1. Create `skills/<group>/<id>/SKILL.md` — `<group>` is one of
   `core` / `embedded` / `cloud` / `miniapp` / `scenario` and must match the
   item's `group` field, and `<id>` must already carry its product line's
   prefix — `tuyaopen-`, or `tuyaos-` if you are adding to the other line (see
   the collision note under [Layout](#layout)). Pick the group by *what the
   user sets out to install*, not by which tab the skill shows up in; the
   `surface` field answers the second question and is chosen independently.
   Frontmatter:
   `name`, `description` — include Chinese keywords so retrieval works in both
   languages — `license`, `compatibility`. Put helper scripts in `scripts/`
   and long-form docs in `references/`.
2. Register it:

   ```bash
   node tools/manifest-gen/bin/manifest-gen.js skills add <id> \
     --surface embedded --order <n> \
     --payload <group>/<id> --local-path skills/<group>/<id> \
     --name-en "…" --name-zh "…" --summary-en "…" --summary-zh "…" \
     --when-en "…" --when-zh "…" --tags a b
   ```

   `name` / `summary` / `whenToUse` are required in **both** `en` and `zh-CN`.
   `--surface` is the capability surface (`embedded` / `cloud` / `miniapp`) and
   is now **unrelated to the payload directory** — set it from what the skill
   is about, not from where you put it. `sdks` may be omitted for a TuyaOpen
   skill (the default is `["tuyaopen"]`); a TuyaOS skill must set `["tuyaos"]`
   explicitly, and those two values are the whole vocabulary. `version`
   defaults to `1.0.0` (`--skill-version` to override).

   **`skills add` has no `--group` flag yet**, and `group` is required on every
   item — so after running it, add `"group": "<group>"` to the new entry by
   hand (matching the directory) or `validate-skills-index.py` rejects it. Also
   add the `cli` object (`{"groups": [...]}` naming real `tuyaopen-cli` command
   groups, or `{"groups": "none", "reason": "…"}`), which the generator does not
   write either — and note that a `cli.groups` entry is a **CLI command group**,
   an unrelated vocabulary that still contains `"product"`.
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

…or copy it in yourself. **The source directory name already is the `id`** —
copy it straight across, dropping the group level:

```bash
git clone https://github.com/tuya/tuyaopen-ide-manifests.git
mkdir -p /path/to/TuyaOpen/.agents/skills
# skills/<group>/<id>  →  .agents/skills/<id>
cp -r tuyaopen-ide-manifests/skills/core/tuyaopen-start \
      /path/to/TuyaOpen/.agents/skills/tuyaopen-start
cp -r tuyaopen-ide-manifests/skills/embedded/tuyaopen-embedded-build \
      /path/to/TuyaOpen/.agents/skills/tuyaopen-embedded-build
```

Don't guess the middle segment from what the skill is about —
`tuyaopen-start` is embedded work but lives under `core/`, and every
`tuyaopen-miniapp-*-panel` lives under `scenario/`. `ls skills/*/<id>` finds
any of them; `source.localPath` in `index.json` is the authority.

No lookup in `index.json` needed to find the `id` — that was the point of the
2026-08-14 reorg and it survived the 2026-09-02 one. (Before 2026-08-14 the
source tree nested three or four levels deep — `skills/embedded/tuyaopen/build`
— and the `id` had to be looked up separately because it wasn't derivable from
the directory name; `skills/miniapp/smart-panel-dev` installed as
`smart-panel-dev`, for example. That indirection is gone: the last directory
name is always the installed name — and `smart-panel-dev` itself became
`tuyaopen-workflow-miniapp-dev`, keeping the old name as an `aliases` entry.)

If you are not on TuyaOpen, check the item's `sdks` before copying: the two
`tuyaos-*` payloads are for the other product line and nothing in a TuyaOpen
project routes to them.

## History: TuyaOpen-dev-skills

The skills now under `embedded/tuyaopen-embedded-build/`,
`embedded/tuyaopen-embedded-env-setup/`, `embedded/tuyaopen-embedded-device-auth/`,
`embedded/tuyaopen-embedded-add-board/`, `embedded/tuyaopen-embedded-code-check/`,
`embedded/tuyaopen-embedded-project/` (as `tuyaopen-project-config`), and
`embedded/tuyaopen-embedded-cli-debug/` (as `tuyaopen-debug-helper` +
`tuyaopen-cli-debug` + `tuyaopen-crash-decode`) came from
`tuya/TuyaOpen-dev-skills`, which the IDE used to download as a **second**
tarball resolved through the `devSkillsRelease` field in `index.json`. That repo
is **archived** and its content was inlined here — originally under
`skills/embedded/tuyaopen/` — at upstream `d0655d46` (v0.0.10); the 2026-08-14
reorg moved each of those nine skills to its own one-level `<id>/` directory
(under a product-line parent then, under its install group now — see
[Layout](#layout)), and a same-day CLI-coverage pass (see the note under
[Layout](#layout)) merged three of those nine (`tuyaopen-debug-helper`,
`tuyaopen-cli-debug`, `tuyaopen-crash-decode`) into
`tuyaopen-embedded-cli-debug` and renamed `tuyaopen-project-config` to
`tuyaopen-embedded-project`.

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
  `installPayload`, so the cache path is `skills-registry/<group>/<id>` today
  purely because that is what `installPayload` says. **Nothing on the IDE side
  names the top level.** `populateCacheDirs` (`manifestsCacheIntegrity.ts`)
  copies the payload root — the first segment of the registry-declared index
  url, i.e. `skills/` — into `skills-registry/` in one `cp`, and
  `pruneOrphanCacheDirs` (`skillsSync.ts`) *discovers* the top-level
  directories it finds there rather than iterating a list. Both were written
  that way after being burnt: the copy step once iterated
  `['embedded','cloud','miniapp']` as literal path segments and went silently
  dead at the 2026-08-14 reorg, and the prune loop's hardcoded copy of the same
  list stopped matching the tree at the same moment. This layout change was
  therefore a no-op on both — which is exactly the property to preserve. Do not
  re-introduce a hardcoded top level here or there, and do not describe one in
  this file.
