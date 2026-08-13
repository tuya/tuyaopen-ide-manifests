# skills/

AI agent skills served to the TuyaOpen IDE (Cursor, Claude Code, VS Code Chat …).

Unlike the other domains in this repo, `skills` ships **both** the registry
(`index.json`) and the **payload** — the `SKILL.md` files and their
`references/` and `scripts/`. A skill and the manifest entry describing it are
always in the same commit, and the IDE gets everything from the single
`manifests.tar.gz` produced by `.github/workflows/release.yml`.

## Layout

```
skills/
├── index.json                  # the registry (29 items)
├── embedded/                   # surface: embedded
│   ├── tuyaopen/               #   TuyaOpen SDK skills (was tuya/TuyaOpen-dev-skills)
│   │   ├── build/  dev-loop/  debug-helper/  project-config/
│   │   ├── add-board/  code-check/  device-auth/  env-setup/
│   │   └── cli-debug/  crash-decode/
│   ├── tuyaos-build/  tuyaos-hardware-vibe-coding/
│   ├── hardware-vibe-coding/   #   bundles sub-skills under peripheral-drivers/
│   ├── ecosystem-wire-cmake/  smart-product-dev/  tyutool_cli/
├── cloud/                      # surface: cloud
│   └── tuya-iot-platform/
└── miniapp/                    # surface: miniapp
    └── smart-panel-dev/  ray-common/  smart-ui/  lamp-panel/  …
```

## Path rules

Three paths describe the same skill. The first two are about **where the source
lives**; the third is **where it gets installed**, and it is derived from the
`id` — not from the other two. Getting this wrong is easy and silent.

| | example | who reads it |
|---|---|---|
| `source.localPath` | `skills/embedded/tuyaopen/build` | this repo — where the payload lives |
| `installPayload` | `embedded/tuyaopen/build` | the IDE's cache layout — **must** equal `localPath` minus the `skills/` prefix (CI enforces this) |
| installed dir | `.agents/skills/tuyaopen-build` | the SKILL.md text itself — **`.agents/skills/<id>`, flat.** Not the payload path |

The installed directory is `path.join('.agents/skills', item.id)` in the IDE
(`src/core/skill/skills.ts`), so a skill with id `tuyaopen-build` installs to
`.agents/skills/tuyaopen-build/` regardless of how deeply its source is nested.
A *nested* form — `tuyaopen/build/` under `.agents/skills/` — is the **old**
layout the IDE actively repairs away from
(`src/core/skill/skillsLegacyMigration.ts`).

So when a `SKILL.md` refers to its own scripts, write the **installed** form:

```bash
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-dev-loop/scripts/build_run.py
```

CI enforces this: `validate-skills-index.py` rejects any `.agents/skills/…`
path in a skill's markdown whose leading segment is not a known item `id`.

Sub-skills bundled inside a parent skill (e.g.
`embedded/hardware-vibe-coding/peripheral-drivers/onchip-gpio/SKILL.md`) are
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
git show "$RELEASE_TAG:skills/index.json" > /tmp/released-index.json
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

1. Create `skills/<surface>/<name>/SKILL.md` (frontmatter: `name`,
   `description` — include Chinese keywords so retrieval works in both
   languages — `license`, `compatibility`). Put helper scripts in `scripts/`
   and long-form docs in `references/`.
2. Register it:

   ```bash
   node tools/manifest-gen/bin/manifest-gen.js skills add <id> \
     --surface embedded --order <n> \
     --payload <surface>/<name> --local-path skills/<surface>/<name> \
     --name-en "…" --name-zh "…" --summary-en "…" --summary-zh "…" \
     --when-en "…" --when-zh "…" --tags a b
   ```

   `name` / `summary` / `whenToUse` are required in **both** `en` and `zh-CN`.
   Set `sdks: ["tuyaos"]` only for TuyaOS-specific skills — omitted means
   `["tuyaopen"]`. `version` defaults to `1.0.0` (`--skill-version` to override).
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

…or copy it in yourself. **Name the destination directory after the `id`, flat** —
that is what the SKILL.md files' own script paths assume:

```bash
git clone https://github.com/tuya/tuyaopen-ide-manifests.git
mkdir -p /path/to/TuyaOpen/.agents/skills
# skills/<surface>/<...>/<name>  →  .agents/skills/<id>
cp -r tuyaopen-ide-manifests/skills/embedded/tuyaopen/build \
      /path/to/TuyaOpen/.agents/skills/tuyaopen-build
cp -r tuyaopen-ide-manifests/skills/embedded/tuyaopen/env-setup \
      /path/to/TuyaOpen/.agents/skills/tuyaopen-env-setup
```

Look the `id` up in `index.json` — it is **not** derivable from the directory
name (`skills/embedded/tuyaopen/build` → `tuyaopen-build`, but
`skills/miniapp/smart-panel-dev` → `smart-panel-dev`). The archived repo's
instructions copied whole trees into a `tuyaopen/` subdirectory instead; that
nested layout no longer matches the script paths inside the skills.

## History: TuyaOpen-dev-skills

`skills/embedded/tuyaopen/` came from `tuya/TuyaOpen-dev-skills`, which the IDE
used to download as a **second** tarball resolved through the
`devSkillsRelease` field in `index.json`. That repo is **archived** and its
content was inlined here at upstream `d0655d46` (v0.0.10).

`devSkillsRelease` and `source.devSkills` are **gone**, and the validator now
rejects `source.devSkills`. Verified against the IDE before removing the field:
it is optional-typed (`SkillsManifest.devSkillsRelease?`) and was guarded from
the commit that introduced it — `skillsFlow.ts` only syncs when
`devSkillsRelease != null && some(source.devSkills === true)`, and `syncSkills`
logs-and-skips when the block is absent. `assertDomainEnvelope` validates only
`schemaVersion` / `domain` / `items`, so no IDE build ever required the field.

How the payload reaches the IDE now, both ways:

- **dev** — read straight from the `vendor/tuyaopen-ide-manifests` submodule at
  `vendor/tuyaopen-ide-manifests/<localPath>`.
- **prod** — `manifests.tar.gz` is extracted and `skills/{embedded,cloud,miniapp}`
  is copied to `<globalStorage>/cache/skills-registry/{surface}`, then resolved
  per skill by `installPayload`. That is exactly why `installPayload` must equal
  `localPath` minus `skills/`.
