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
   `["tuyaopen"]`.
3. Bump `manifests.skills.version` in `registry.json` (minor for new items,
   patch for content-only edits).
4. Validate:

   ```bash
   python3 scripts/validate-skills-index.py     # structure, paths, no orphans
   python3 -m pytest tests/skills -q            # skill script unit tests
   ```

Both run in CI (`validate-skills-index.yml`, `skills-tests.yml`).

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
content was inlined here at upstream `d0655d46` (v0.0.10) — see
`docs/superpowers/plans/2026-08-06-absorb-dev-skills.md`.

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
