---
name: tuyaopen-skill-maker
description: >-
  How to author or edit a skill in this catalogue: frontmatter contract, id
  naming rules (product-line prefix, no slashes), TuyaOpen vs TuyaOS
  placement, the Shortcuts-table rule (command names only, never flag lists),
  progressive disclosure into references/, how to word an out-of-scope
  handoff, index.json registration fields, version-bump rules, and local
  validation commands. Use when adding a new skill, editing an existing
  SKILL.md, or registering an item in skills/index.json.
  如何在本目录新增或修改一个 skill：frontmatter 契约、id 命名规则（产品线前缀、
  不含斜杠）、TuyaOpen 与 TuyaOS 归属、Shortcuts 表规则（只写命令名不写 flag
  清单）、references/ 渐进披露、"超出本技能范围"的写法、index.json 注册字段、
  version 升号规则、本地校验命令。新增技能、修改现有 SKILL.md 或注册
  index.json 条目时使用。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-shared` § 1 (for `tuyaopen schema get`)
  - Python 3 (for scripts/validate-skills-index.py, scripts/check-skill-version-bumps.py)
  - Node.js (for tools/manifest-gen/bin/manifest-gen.js)
---

# TuyaOpen Skill Maker

This skill teaches the catalogue how to grow itself: writing a new
`SKILL.md`, registering it in `skills/index.json`, and passing the local
validators before opening a PR against `tuya/tuyaopen-ide-manifests`. It does
not cover any one skill's subject matter — for that, see the routing table in
skill `tuyaopen-shared` (§ *Routing table*).

## 1. Frontmatter contract

```yaml
---
name: <id>                    # MUST equal the payload directory name (see § 2)
description: >-
  <English description, keywords a retrieval system would match on>
  <Chinese description, same content — retrieval must work in both languages>
license: Apache-2.0
compatibility:
  - <runtime/tool prerequisites, one per line>
---
```

- `name` **must equal** the skill's `id`, which **must equal** the payload
  directory name (`skills/<ProductLine>/<id>/`). Since the 2026-08-14 reorg
  all three are mechanically the same string — getting them out of sync is a
  typo away, not a structural necessity, so double-check it.
- `description` carries **both** languages in one field (unlike the
  `index.json` `name`/`summary`/`whenToUse`, which are separate `en`/`zh-CN`
  keys) — include Chinese keywords even in an otherwise-English skill so
  retrieval matches a Chinese-language request too.
- `license` — every existing skill in this catalogue uses `Apache-2.0`;
  match it unless you have a specific reason not to.
- `compatibility` — a plain list of runtime/tool prerequisites (SDK
  activation state, TTY requirement, tool version floors). Optional but every
  existing skill has one.
- Suggested but not required by the validator: `metadata.requires.bins` (a
  list of binaries the skill assumes are on `PATH`) and `metadata.cliHelp`
  (the `--help`/`schema get` invocation an agent should run first) — neither
  is enforced today, but both make an agent's first turn faster.

## 2. id naming rules

- The `id` **is** the second path segment: `skills/<ProductLine>/<id>/SKILL.md`.
  No nesting deeper than that — a sub-skill bundled inside a parent (e.g.
  `tuyaopen-hardware/peripheral-drivers/onchip-gpio/`) is fine, but it is not
  separately indexed and does not get its own top-level `<id>` directory.
- **No slashes in the id.** `.claude/skills/` (Claude Code's loader) walks
  exactly one level deep and silently skips anything nested further — a
  slash-bearing id like the pre-reorg `miniapp/ray-common` would install
  invisibly there.
- **Must carry the product-line prefix**: `tuyaopen-` under `TuyaOpen/`,
  `tuyaos-` under `TuyaOS/`. This is not cosmetic: the **global** install hub
  (`~/.cursor/skills/`, see skill `tuyaopen-shared` § 6) is the same directory
  the community `npx skills` tool (vercel-labs/skills) installs into. An
  unprefixed name (the pre-reorg `smart-panel-dev` is the example on record)
  can collide with, and be silently overwritten by, an unrelated third-party
  skill of the same name. The prefix is the whole defense.

## 3. Product-line placement: `TuyaOpen/` vs `TuyaOS/`

Top level under `skills/` is **product line**, not capability surface:

- `TuyaOpen/` — everything for the TuyaOpen SDK track, **including** its
  miniapp/panel skills (`tuyaopen-miniapp-*` skills live under `TuyaOpen/`
  even though their `surface` field is `"miniapp"` — `surface` and product
  line are orthogonal fields, see `skills/README.md`'s Layout section).
- `TuyaOS/` — the TuyaOS SDK track (`tuyaos-build`,
  `tuyaos-hardware-vibe-coding`).

**A `tuyaos`-only skill (`sdks: ["tuyaos"]`, no `"tuyaopen"`) never reaches the
TuyaOpen IDE's Skills page at all** — `sdkAppliesToItem()`
(`src/manifests/manifestsTypes.ts` in the IDE repo) drops any item whose
`sdks` doesn't include the build's `ACTIVE_SDK` (`'tuyaopen'` for this IDE)
*before* the webview ever sees it; `skillsFlow.ts` applies that filter at
manifest-hydrate time and logs how many were dropped. This filtering is
**IDE-webview-only** — the `tuyaopen skills list --json` CLI command does not
apply it and lists all items (including `tuyaos-build` /
`tuyaos-hardware-vibe-coding`) regardless of `sdks`. So a `TuyaOS/`-prefixed,
`tuyaos`-only skill still validates, ships in the package, and is
discoverable via the CLI, but a user browsing the IDE's own Skills sidebar
page will not see it.

Pick `<ProductLine>` by which SDK the skill's instructions are actually
written against — not by guessing from `surface`.

## 4. Shortcuts table rule: command names, never flag lists

A skill's body may name commands (`tos.py config set`, `tuyaopen firmware
flash`) but **must not** enumerate their flags in prose. Point the reader at:

```bash
tos.py <group> -h
tuyaopen <group> --help
tuyaopen schema get --group <g> --command <c>
```

**Why this is a hard rule, not a style preference:** the `tuyaopen` CLI's flag
set is protected by an add-only contract snapshot (`cliSchemaDrift.test.ts` in
the IDE repo) specifically so it can grow safely — a flag list copied into a
skill's Markdown has no such protection and silently goes stale the moment the
real command gains, renames, or (rarely, with an owner decision) drops a flag.
The existing `tuyaopen-build` / `tuyaopen-project` skills follow this:
they describe *what* a config subcommand does and route the reader to
`tos.py config -h` for the current flag surface, never hardcoding it.

## 5. `references/` — progressive disclosure

`SKILL.md` is a router: intent recognition, a decision table, and pointers.
Move anything that is "read this only if you're doing the deep version" into
`references/<TOPIC>.md` and link it. Precedents in this catalogue:

- `tuyaopen-build/references/KCONFIG_GUIDE.md` — the `select`/`depends on`/`if`
  dependency mechanics, needed only when a config change interacts with
  Kconfig dependencies.
- `tuyaopen-project/references/{TOS_COMMANDS.md,CONFIG_CLI.md}` — the
  full `tos.py` command table and non-interactive config CLI semantics.
- `tuyaopen-shared/references/ROUTING.md` — the intent→skill routing table
  this skill's § 6 tells you to link to instead of copying.

A helper script goes in `scripts/` (see `tuyaopen-env-setup/scripts/` for a
per-OS example: `.sh`/`.ps1`/`.bat` variants of the same check). Reference it
by its **installed** path, not its source path:

```bash
.agents/skills/<id>/scripts/<name>.sh
```

(`.agents/skills/<id>/`, flat — never the pre-reorg nested layout that put a
product-line segment before the id. `validate-skills-index.py` rejects any
`.agents/skills/<segment>/...` reference whose first segment is not a known
item id — which is exactly what would catch that old nested shape if it were
written literally.)

## 6. Wording an out-of-scope handoff

Do not name a sibling skill directly from inside your skill's prose (e.g.
"if the user wants X, use skill `tuyaopen-cloud`"). That produces an O(n²)
maintenance surface — every new skill would need edits to every existing
skill that might hand off to it. Instead write:

> Not in scope — see skill `tuyaopen-shared`'s routing table.

and add your own row to `tuyaopen-shared/references/ROUTING.md` in the same
change (that file is the one place allowed to name every skill, precisely
because it is the only thing that has to change when the catalogue grows).

## 7. Registering in `skills/index.json`

Preferred: the generator keeps the JSON well-formed and fills in the
mechanical fields for you:

```bash
node tools/manifest-gen/bin/manifest-gen.js skills add <id> \
  --surface embedded --order <n> \
  --payload <ProductLine>/<id> --local-path skills/<ProductLine>/<id> \
  --name-en "…" --name-zh "…" --summary-en "…" --summary-zh "…" \
  --when-en "…" --when-zh "…" --tags a b
```

Whether generated or hand-written, an item needs:

| Field | Notes |
|---|---|
| `id` | Directory name, `tuyaopen-`/`tuyaos-` prefixed |
| `version` | `x.y.z`; new skills start at `1.0.0` |
| `order` | Manual integer/float, purely a display sort key — pick a value that puts it where it belongs; don't renumber existing items |
| `name` / `summary` / `whenToUse` | Each an object with **both** `en` and `zh-CN` — required, not optional |
| `surface` | One of `embedded` / `cloud` / `miniapp` — the capability surface, independent of product line (§ 3) |
| `tags` | Array of free-form strings |
| `defaultEnabled` | **Must be set explicitly.** `validate-skills-index.py` in this repo requires it present and boolean — omitting it fails validation outright. But the IDE's own runtime type (`SkillManifestItem.defaultEnabled` in the IDE's `src/manifests/manifestsTypes.ts`) declares it **optional**, and `defaultEnabledSkillIds()` filters on truthiness — so if this repo's validator were ever bypassed, an omitted field would silently read as `false` there too. Two independent reasons to always write `true` or `false` explicitly, never rely on omission. |
| `installPayload` | Must equal `source.localPath` with the leading `skills/` stripped — the validator checks this exactly |
| `source.localPath` | `skills/<ProductLine>/<id>` |
| `related` (optional) | Ids of closely-coupled sibling skills only (not a routing mechanism — see § 6) |
| `sdks` (optional) | `["tuyaopen"]` (default when omitted) or `["tuyaos"]` / both |

## 8. `version` bump rules

Full policy lives in `skills/README.md` § *`version` — per-skill payload
version* — this is the short form:

| Change | Bump |
|---|---|
| Typo, wording, a corrected command | patch |
| New steps, new script, meaningfully different behaviour | minor |
| Incompatible restructure (renamed/removed a script path a project may already call) | major |
| A brand-new skill | starts at `1.0.0`, no bump needed until its first payload edit after release |

Bump in the **same PR** as the payload change. `check-skill-version-bumps.py`
enforces this against **published** versions only (an unreleased version may
keep absorbing edits) — see that script's docstring for the exact base/head/
released-index comparison it runs.

## 9. Local validation

Run before opening a PR:

```bash
python3 scripts/validate-skills-index.py          # structure, paths, versions, no orphans — must exit 0
python3 -m pytest tests -q                         # skill + repo script unit tests
```

`check-skill-version-bumps.py` needs the PR's base commit and the last
release tag to compare against, so it has no meaningful standalone
invocation during authoring — CI runs it; see its own docstring if you need
to reproduce that comparison locally.
