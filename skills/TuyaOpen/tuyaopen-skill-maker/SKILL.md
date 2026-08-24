---
name: tuyaopen-skill-maker
description: >-
  How to author or edit a skill in this catalogue: frontmatter contract, id
  naming rules (tuyaopen- prefix, no slashes), where the payload goes, the
  Shortcuts-table rule (command names only, never flag lists), progressive
  disclosure into references/, how to word an out-of-scope handoff,
  index.json registration fields, version-bump rules, and local validation
  commands. Use when adding a new skill, editing an existing SKILL.md, or
  registering an item in skills/index.json.
  如何在本目录新增或修改一个 skill：frontmatter 契约、id 命名规则（tuyaopen-
  前缀、不含斜杠）、载荷放在哪里、Shortcuts 表规则（只写命令名不写 flag
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

## Shortcuts — `tuyaopen schema`

| Intent | Command |
|---|---|
| List every command's contract (use this to find which group/command your new skill should point at) | `tuyaopen schema list [--group <g>]` |
| One command's flags/mutating/riskLevel | `tuyaopen schema get --group <g> --command <c>` |

Flags aren't listed here — run `tuyaopen schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen` first per `tuyaopen-shared` § 1 (it is
usually not on `PATH`).

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
  directory name (`skills/TuyaOpen/<id>/`). Since the 2026-08-14 reorg
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

- The `id` **is** the second path segment: `skills/TuyaOpen/<id>/SKILL.md`.
  No nesting deeper than that — a sub-skill bundled inside a parent (e.g.
  `tuyaopen-embedded-hardware/peripheral-drivers/onchip-gpio/`) is fine, but it is not
  separately indexed and does not get its own top-level `<id>` directory.
- **No slashes in the id.** `.claude/skills/` (Claude Code's loader) walks
  exactly one level deep and silently skips anything nested further — a
  slash-bearing id like the pre-reorg `miniapp/ray-common` would install
  invisibly there.
- **Must be `tuyaopen-` prefixed.** This is not cosmetic: the **global**
  install hub (`~/.cursor/skills/`, see skill `tuyaopen-shared` § 6) is the
  same directory the community `npx skills` tool (vercel-labs/skills) installs
  into. An unprefixed name (the pre-reorg `smart-panel-dev` is the example on
  record — it became `tuyaopen-workflow-miniapp-dev` for exactly this reason, with
  `smart-panel-dev` kept as an `aliases` entry) can collide with, and be
  silently overwritten by, an unrelated third-party skill of the same name. The
  prefix is the whole defense.
- The same argument applies **one level down**, to bundled sub-skills, because
  some hosts do not stop at the top level: Codex scans `$HOME/.agents/skills`
  recursively and registers every nested `SKILL.md` as an independent skill, so
  a sub-skill's `name` is a globally visible identifier there too. Hence the
  `tuyaopen/<slug>` namespace form under `peripheral-drivers/` — measured
  2026-08-17, when `peripheral-sd` was still announcing itself as
  `SD Card Storage`.

## 2a. The three layers, and which one you are writing

Every skill in this catalogue sits on exactly one of three layers. Deciding
which **before** you write is what keeps two skills from describing the same
thing differently — the failure mode this section exists for is real: for
months `tuyaopen-workflow-product-dev` and `tuyaopen-cloud` declared the same
three CLI groups and both described creating a product, and nothing said which
one was authoritative.

| Layer | Named | Owns | One-line test |
|---|---|---|---|
| Mechanism | `tuyaopen-shared` | CLI identity, the `--json` envelope, exit codes, the risk gate, command and skill self-discovery, the routing table, environment triage | True regardless of what you are building |
| **Phase** | `tuyaopen-workflow-<domain>-dev` | Step order, the state machine, each step's deliverable, **which steps only a human can do**, what is handed to the next phase | Delete it and the agent no longer knows *what to do next* |
| **Capability** | `tuyaopen-<domain>` | Which command groups the domain has, how a single command is invoked, what it requires first, domain concepts and traps, reference data | Delete it and the agent no longer knows *how to execute this step* |

Task skills (`tuyaopen-embedded-build`, `tuyaopen-miniapp-smart-ui`, …) hang
off the capability layer: one job, done one way.

### The two prohibitions that keep phase and capability apart

> **A workflow names commands but never explains them.**
> Write "Step 4 — create the product: follow `tuyaopen-cloud`'s create path".
> Do **not** copy that skill's invocation details, its reference tables, or its
> traps into the workflow.
>
> **A capability skill states preconditions but never order.**
> Write "`sync-schema` requires a bound product". Do **not** write "first bind
> the product, then sync-schema, then build".

The same fact can be phrased either way, which is exactly why the rule needs a
test rather than a feeling:

**Does the sentence still hold if someone arrives at this command out of
order?** If yes it is a precondition and belongs to the capability layer. If it
only holds while walking the sequence, it is order and belongs to the workflow.

### Workflows may name each other — the one exception

Section 8's rule ("out of scope → point at `tuyaopen-shared`'s routing table,
never name a sibling") is about **out-of-scope handoffs**, and it exists to
avoid an O(n²) web of cross-references. A workflow's **next phase** is not out
of scope; it is the content. `tuyaopen-workflow-product-dev` must say, by name,
that the firmware phase continues in `tuyaopen-workflow-embedded-dev` — a
pipeline whose segments cannot name their successor is not a pipeline.

This exception is exactly three skills wide. Do not generalise it.

## 3. Where the payload goes

One layout, one level deep: **`skills/TuyaOpen/<id>/`**, and the directory name
**is** the `id` (§ 2). `validate-skills-index.py` enforces both halves — the
path must match `installPayload`, and every `skills/**/SKILL.md` directory must
be referenced by an item in `index.json` (the orphan check), so a payload you
forget to register fails the build rather than shipping unreachable.

`surface` (`embedded` / `cloud` / `miniapp`) is a **browsing filter, not a
path**: a `tuyaopen-miniapp-*` skill has `surface: "miniapp"` and still lives at
`skills/TuyaOpen/<id>/` like everything else. Do not try to encode `surface`,
`group`, or anything else into the directory tree — the pre-2026-08-14 layout
did exactly that and it is why ids used to carry slashes.

`sdks` is an applicability flag, not a placement rule. It defaults to
`["tuyaopen"]` when omitted, and every item in this catalogue is
`["tuyaopen"]`; each consumer applies its own SDK gate at the point it ingests
the manifest (`sdkAppliesToItem()` — `skillsFlow.ts:179` for the IDE,
`cli/commands/skills.ts:161` for the CLI), so an item the gate rejects is not
"hidden" downstream, it never enters the catalogue at all. There is no reason to
set the field by hand today; omit it.

## 4. The relationship with the CLI must be declared

Every skill states how it relates to the `tuyaopen` CLI in **two** places, and
they must agree: the machine-checkable `cli` field in `skills/index.json`,
and the human/agent-facing `## Shortcuts` section in the body (its exact
shape is § 6 below). This section covers the `index.json` half and why the
split exists at all; § 5 covers writing the fallback prose that goes with it.

### The `cli` field's three shapes

```json
{ "cli": { "groups": ["schema"] } }
```

```json
{ "cli": { "groups": ["firmware", "diag", "device"], "fallback": ["tos.py", "tyutool_cli"] } }
```

```json
{ "cli": { "groups": "none", "reason": "加 board 是纯 tos.py / 手工流程", "fallback": ["tos.py"] } }
```

1. **`groups: [...]`, no `fallback`** — the CLI covers everything this skill
   needs; there is no older tool to drop back to. This skill's own
   declaration is this shape: `{"groups": ["schema"]}`.
2. **`groups: [...]` with `fallback: [...]`** — the CLI covers it, but an
   older tool remains as the decidable fallback for when the CLI is
   unavailable (§ 5).
3. **`groups: "none"`, with a required `reason`** (optionally with
   `fallback`) — the CLI has no coverage for this skill at all.

### Why the field lives in `index.json`, not the frontmatter

`cli: { groups: [...] }` is a **nested mapping**, and the consumer that reads
`SKILL.md` frontmatter — `src/core/skill/skillsFrontmatter.ts` in the IDE
repo — is deliberately flat. Its own docstring says nested mappings are
"skipped without blowing up." Put this field in the frontmatter and it looks
like it worked: the file parses, nothing errors, and the value is silently
gone on the read side — the one failure mode a validator here cannot catch,
because the validator never sees the IDE's runtime parse. `index.json` is
already JSON, is already parsed by `validate-skills-index.py`, and already
carries every other machine field (`group`, `surface`, `tags`,
`defaultEnabled`, `requires`, `aliases`) — `cli` belongs with them.

### The `## Shortcuts` section template

```markdown
## Shortcuts — `tuyaopen <group1>` / `tuyaopen <group2>`

| Intent | Command |
|---|---|
| <what it does> | `tuyaopen <group> <command>` |

Flags aren't listed here — run `tuyaopen schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen` first per `tuyaopen-shared` § 1 (it is
usually not on `PATH`).
```

The header names every group the skill declared in `index.json` — no more,
no fewer (see § 6's hard-rule note on why that has to be exact). The table
lists command names only, never flags (§ 6).

When a skill's `cli.groups` is `"none"`, the body does not get this table at
all — it gets the sentence the validator looks for instead, verbatim:

> No `tuyaopen` CLI coverage

(followed by the reason, in prose). `tuyaopen-embedded-add-board` and
`tuyaopen-embedded-code-check` already use this heading; match their wording rather
than inventing a new one.

## 5. Writing a fallback

A step that has both a CLI command and an older-tool equivalent gets one
blockquote under it, naming the fallback command and nothing else:

```markdown
> **No CLI?** Equivalent: `tos.py build`, but you parse its output yourself.
> Full mapping: `tuyaopen-shared` § 7.
```

**The blockquote gives a command name, never a semantic explanation.**
Anything that needs explaining — `tos.py update` is not `sdk update`; `tos.py
config` and `tuyaopen config` collide in name but edit unrelated things — is
written **once**, in `tuyaopen-shared` § 7. If every skill restated the
semantic differences for its own fallback command, sixteen copies would
exist and drift is the only possible outcome; a reader who needs the nuance
follows the link instead.

**Fall back only when the CLI is unavailable — never because it refused
you.** "Unavailable" means: `tuyaopen-shared` § 1's resolve step found
nothing, the command/flag doesn't exist (an old CLI build), or the envelope's
`type` is `tooling` with subtype `tool_missing`. Every other typed error —
`confirmation`, `policy`, `authentication`, `validation`, `config`, and the
rest of the exhaustive, default-deny table in `tuyaopen-shared` § 4 — means
the CLI ran, is working correctly, and is declining on purpose. Reaching for
the fallback tool at that point is not "trying another way" — it is going
around the CLI's risk gate. Concretely: `tuyaopen firmware flash` sits
behind a P2 gate (`--yes` + `TUYAOPEN_AUTOCONFIRM_P2=1`); `tos.py flash` /
`tyutool_cli flash` gate nothing at all. A skill body that says "if flash
asks for confirmation, just use `tos.py flash`" has handed an agent exactly
the bypass this catalogue exists to prevent.

## 6. Shortcuts table rule: command names, never flag lists

**This section is a hard requirement, not a style preference — read the
second paragraph before skipping it.** A skill's body may name commands
(`tos.py config set`, `tuyaopen firmware flash`) but **must not** enumerate
their flags in prose. Point the reader at:

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
The existing `tuyaopen-embedded-build` / `tuyaopen-embedded-project` skills follow this:
they describe *what* a config subcommand does and route the reader to
`tos.py config -h` for the current flag surface, never hardcoding it.

**Why the section as a whole is now mandatory, not optional convention:** the
`## Shortcuts` section is no longer just a reader convenience — it is also
what the validator's rule 3 checks the `index.json` `cli.groups` declaration
against, in both directions (declared but not named in the section, or named
in the section but not declared, are both hard failures). A skill that skips
the section, or lets it drift from the declaration, now fails CI, not just a
style review.

## 7. `references/` — progressive disclosure

`SKILL.md` is a router: intent recognition, a decision table, and pointers.
Move anything that is "read this only if you're doing the deep version" into
`references/<TOPIC>.md` and link it. Precedents in this catalogue:

- `tuyaopen-embedded-build/references/KCONFIG_GUIDE.md` — the `select`/`depends on`/`if`
  dependency mechanics, needed only when a config change interacts with
  Kconfig dependencies.
- `tuyaopen-embedded-project/references/{TOS_COMMANDS.md,CONFIG_CLI.md}` — the
  full `tos.py` command table and non-interactive config CLI semantics.
- `tuyaopen-shared/references/ROUTING.md` — the intent→skill routing table
  this skill's § 8 tells you to link to instead of copying.

A helper script goes in `scripts/` (see `tuyaopen-embedded-env-setup/scripts/` for a
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

## 8. Wording an out-of-scope handoff

Do not name a sibling skill directly from inside your skill's prose (e.g.
"if the user wants X, use skill `tuyaopen-cloud`"). That produces an O(n²)
maintenance surface — every new skill would need edits to every existing
skill that might hand off to it. Instead write:

> Not in scope — see skill `tuyaopen-shared`'s routing table.

and add your own row to `tuyaopen-shared/references/ROUTING.md` in the same
change (that file is the one place allowed to name every skill, precisely
because it is the only thing that has to change when the catalogue grows).

## 9. Registering in `skills/index.json`

Preferred: the generator keeps the JSON well-formed and fills in the
mechanical fields for you:

```bash
node tools/manifest-gen/bin/manifest-gen.js skills add <id> \
  --surface embedded --order <n> \
  --payload TuyaOpen/<id> --local-path skills/TuyaOpen/<id> \
  --name-en "…" --name-zh "…" --summary-en "…" --summary-zh "…" \
  --when-en "…" --when-zh "…" --tags a b
```

Whether generated or hand-written, an item needs:

| Field | Notes |
|---|---|
| `id` | Directory name, `tuyaopen-` prefixed (§ 2) |
| `version` | `x.y.z`; new skills start at `1.0.0` |
| `order` | Manual integer/float, purely a display sort key — pick a value that puts it where it belongs; don't renumber existing items |
| `name` / `summary` / `whenToUse` | Each an object with **both** `en` and `zh-CN` — required, not optional |
| `surface` | One of `embedded` / `cloud` / `miniapp` — a browsing filter, **not** a path segment (§ 3) |
| `tags` | Array of free-form strings |
| `defaultEnabled` | **Must be set explicitly.** `validate-skills-index.py` in this repo requires it present and boolean — omitting it fails validation outright. But the IDE's own runtime type (`SkillManifestItem.defaultEnabled` in the IDE's `src/manifests/manifestsTypes.ts`) declares it **optional**, and `defaultEnabledSkillIds()` filters on truthiness — so if this repo's validator were ever bypassed, an omitted field would silently read as `false` there too. Two independent reasons to always write `true` or `false` explicitly, never rely on omission. |
| `installPayload` | Must equal `source.localPath` with the leading `skills/` stripped — the validator checks this exactly |
| `source.localPath` | `skills/TuyaOpen/<id>` |
| `related` (optional) | Ids of closely-coupled sibling skills only (not a routing mechanism — see § 8) |
| `sdks` (optional) | Applicability flag; defaults to `["tuyaopen"]` when omitted — omit it (§ 3) |
| `cli` | The CLI relationship declaration (§ 4) — required on every item |

## 10. `version` bump rules

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

## 11. Local validation

Run before opening a PR:

```bash
python3 scripts/validate-skills-index.py          # structure, paths, versions, no orphans — must exit 0
python3 -m pytest tests -q                         # skill + repo script unit tests
```

`check-skill-version-bumps.py` needs the PR's base commit and the last
release tag to compare against, so it has no meaningful standalone
invocation during authoring — CI runs it; see its own docstring if you need
to reproduce that comparison locally.
