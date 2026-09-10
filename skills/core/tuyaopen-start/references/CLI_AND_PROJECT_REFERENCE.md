### 1.1 Resolve it first — `tuyaopen-cli` is usually NOT on `PATH`

**Deterministic Python runner (recommended)**: use the self-contained resolver script in this skill.
It auto-probes `TUYAOPEN_CLI_PATH` → `PATH` → project wrapper (`.tuyaopen/ide/bin/`) → IDE extensions → global npm packages, and runs transparently across Linux/macOS/Windows without brittle shell-function state:

```bash
# Check resolution & CLI version
python3 .agents/skills/tuyaopen-start/scripts/resolve_cli.py --info

# Or run any command directly through it:
python3 .agents/skills/tuyaopen-start/scripts/resolve_cli.py firmware list-ports --json
```

**Shell function alternative**: if running directly in **bash or zsh**, define `tuyaopen-cli` once for this shell:

```bash
# Define `tuyaopen-cli` for this shell. Run once; then use the skills' examples as written.
if [ -n "$TUYAOPEN_CLI_PATH" ] && [ -f "$TUYAOPEN_CLI_PATH" ]; then
  _tuyaopen_entry="$TUYAOPEN_CLI_PATH"             # explicit override wins
  tuyaopen-cli() { node "$_tuyaopen_entry" "$@"; }
elif command -v tuyaopen-cli >/dev/null 2>&1; then
  :                                                # already on PATH — nothing to do
else                                               # search upward for the IDE-written wrapper
  _d="$PWD"
  while [ "$_d" != "/" ]; do
    if [ -x "$_d/.tuyaopen/ide/bin/tuyaopen-cli" ]; then
      _tuyaopen_bin="$_d/.tuyaopen/ide/bin/tuyaopen-cli"
      tuyaopen-cli() { "$_tuyaopen_bin" "$@"; }
      break
    fi
    _d=$(dirname "$_d")
  done
fi
command -v tuyaopen-cli >/dev/null 2>&1 || echo "TuyaOpen CLI not found — see below" >&2
```

Two properties this shape buys, both of which the obvious
`TUYAOPEN_CLI="node /path/cli.js"` variable does **not**:

- **Paths with spaces survive.** A two-word variable breaks the moment anyone
  quotes it (`"$TUYAOPEN_CLI" …` looks for one executable whose name contains a
  space) and breaks differently unquoted (a path with a space splits into two
  arguments). A function passing `"$@"` has neither failure.
- **Existing examples work unchanged**, so the other TuyaOpen skills need no
  per-command edit and cannot drift out of sync with this recipe.

A shell function lives in **one shell**. If you run each command in a fresh
shell, re-run this block first, or export `TUYAOPEN_CLI_PATH` once and use
`node "$TUYAOPEN_CLI_PATH" …` directly.

On Windows the wrapper is `.tuyaopen\ide\bin\tuyaopen-cli.cmd`.

**When the search finds nothing, stop and tell the user** — do not improvise a
path, and do not fall back to `tos.py` for something the CLI was supposed to
do. The message they need is:

> The TuyaOpen CLI wrapper is written by TuyaOpen IDE into
> `.tuyaopen/ide/bin/` when it opens a TuyaOpen project. Open this project in
> the IDE once, or set `TUYAOPEN_CLI_PATH` to an `out/cli/cli.js` /
> `dist/cli/cli.js` you already have.

Three things about that wrapper are worth knowing, because they decide when
the search succeeds:

- It is written **per project, on IDE activation with that project open** —
  not at clone time, and not for a project the IDE has never opened.
- It is in `.gitignore` (`.tuyaopen/ide/`), so it is **never committed**. A
  fresh clone and a CI checkout have no wrapper and no CLI. That is expected,
  not a misconfiguration.
- Inside the IDE's integrated terminal it is also on `PATH`, which is why bare
  `tuyaopen-cli` works there and nowhere else.

The wrapper resolves the real entry itself, highest priority first:
`TUYAOPEN_CLI_PATH` → a stable pointer file the IDE rewrites on every
activation (so it survives extension upgrades) → the path baked in at write
time. You never need to know which one it picked.

> **`@tuya/tuyaopen-cli` is not on public npm yet.** The npm package is the
> intended standalone distribution and the `bin` entry is already `tuyaopen-cli`,
> but `npm install -g @tuya/tuyaopen-cli` returns 404 on the public registry
> (re-measured 2026-08-27). The internal beta ships on the company registry
> instead, and **the command takes no dist-tag suffix** — tnpm cannot move a
> dist-tag after the fact, so `latest` is the only channel that advances and
> `@beta` is frozen at `0.1.0-beta.14` (2026-08-28):
>
>     npm i -g @tuya/tuyaopen-cli --registry https://registry-npm.tuya-inc.top/
>
> An offline tarball (`npm i -g ./tuyaopen-cli-<version>.tgz`) works too. Either
> install puts `tuyaopen-cli` on `PATH` globally, in which case the search above
> short-circuits at `command -v` and nothing else here applies. Without one,
> "on `PATH`" in practice means "an IDE integrated terminal".

### 1.1a A wrapper can exist and still be dead — check before you trust it

Resolving a wrapper is not the same as having a working CLI. The wrapper bakes
in a path to the IDE's `cli.js`; a plugin upgrade deletes the directory that
path names, and a wrapper written before the stable pointer file existed has no
way to recover — it dies with Node's `Cannot find module`, which names neither
the wrapper nor the upgrade that broke it. Measured 2026-08-20 across 20 local
projects: 11 carried a wrapper, **all 11** predated the pointer file, and **2**
pointed at a `cli.js` that no longer existed.

One command tells you which case you are in:

```bash
tuyaopen-cli diag doctor --json     # read .data.cli.wrapper
```

| What you see | What it means | What to do |
|---|---|---|
| `bakedEntryAlive: false` | This wrapper is dead — every command through it fails. | Tell the user to **reopen the project in TuyaOpen IDE once** (that rewrites it), or set `TUYAOPEN_CLI_PATH` to a `cli.js` that exists. |
| `outdated: true` with `usesPointerFile: false` | Works now, but the next plugin upgrade breaks it silently. | Worth mentioning; reopening the project in the IDE fixes it. |
| `present: false` | This project was never opened in the IDE. | Expected — you resolved via `PATH` or `TUYAOPEN_CLI_PATH` instead, which is fine. |

`diag doctor` needs no login and writes nothing, so it is always safe to run
first. If it cannot run at all, you have not actually resolved the CLI — go
back to § 1.1.

**Never repair a wrapper by editing it.** It is IDE-managed and rewritten on
every project open, so the edit is lost and, worse, it hides the real state
from whoever reads next.

### 1.2 Then identify what you resolved

Two independent builds can answer to the name `tuyaopen-cli`: the **bundled** one
inside a TuyaOpen IDE install (`<extension>/out/cli/cli.js`), and the
**standalone** npm package (`dist/cli/cli.js`). They share this contract but
not necessarily a version. Don't guess which one a shell has — ask it:

```bash
"$TUYAOPEN_CLI" diag doctor --json
```

The `cli` block in the response identifies the binary you are actually
running:

```json
{
  "cli": {
    "entryPath": "/abs/path/to/cli.js",
    "version": "0.1.0",
    "contractVersion": 1,
    "processNodeVersion": "v22.22.0",
    "packaging": "bundled",
    "cacheRoot": { "path": "/home/<user>/TuyaOpenIDE/.tuyaopen/cache", "source": "default" },
    "devplatSpawnNode": "/path/to/node"
  }
}
```

- `packaging` is `"bundled"` (running from inside an IDE install), `"standalone"`
  (the npm package), or `"unknown"`.
- `contractVersion` is the machine-contract version of the `--json` envelope
  and the command schema (see § 2) — an add-only counter, currently `1`.
- `diag doctor --json` also reports `node`/`git`/`uv`/`python` toolchain
  status, `sdk.{installed,tosPresent,envReady}`, `devplatCli.{present,path}`,
  and `credential.{loggedIn,source}` in the same call — one round-trip to
  triage "why isn't this working" before touching anything.

## 2. The `--json` envelope contract

Every command returns one JSON object on a single stdout line under
`--json` / `--format json` (default when stdout is piped; `human` is the
default in a TTY). Never parse human-mode output.

> **你多半看不到 stdout 和 stderr 的区别 —— 不要凭观感断言这条契约被违反了。**
>
> 几乎每个 agent 工具的 shell 都把两个流**合并**后展示给你（Claude Code 的 Bash
> 工具就是这样）。于是你会看到日志行和那一行 JSON 交错在一起，看起来像是日志
> 混进了 stdout。**内测第五轮就有人据此报了一个不存在的 bug** —— 复核时严格分离
> 两个流，stdout 恰好一行 JSON，日志一行不差全在 stderr。
>
> 要验证，就显式重定向，别靠眼睛：
>
> ```bash
> tuyaopen-cli <cmd> --json >out.txt 2>err.txt
> wc -l out.txt            # 契约要求：1
> ```
>
> 顺带解释了为什么日志走 stderr：**不是藏起来，是为了不污染载荷**。你要读日志，
> 看 stderr；你要解析结果，读 stdout —— 前提是你把它们分开。

```ts
interface CommandResult {
  ok: boolean;
  data?: unknown;                 // payload; shape is per-command
  error?: string;                 // legacy human message
  code?: string;                  // legacy stable machine code
  suggestion?: string;            // legacy hint (superseded by `hint`)
  type?: ErrorCategory;           // 'validation'|'authentication'|'authorization'
                                   // |'config'|'network'|'api'|'policy'|'internal'
                                   // |'confirmation'|'tooling'|'envstate'
  subtype?: string;               // closed-set sub-classifier
  hint?: string;                  // actionable one-liner
  retryable?: boolean;
  next_steps?: string[];          // ordered follow-up commands
  details?: unknown;              // structured detail, never rendered in human mode
  meta?: { elapsed_ms?: number; mutating?: boolean; riskLevel?: 'P0'|'P2'|'P3'; [k: string]: unknown };
}
```

`contractVersion` (currently `1`) is stamped onto the **outer** object at
render time — sibling to `ok`/`data`, not nested under `meta` — on every
`--json` response including the crash-net envelope. Treat it as the one
add-only flag that says "I know this envelope shape"; do not infer the shape
from which fields happen to be present.

**A programmatic caller classifies by `type` / `subtype` / `code` — never by
exit code number.** See § 3.

List payloads (a bare array, or an object wrapping one under `list` /
`dataList` / `datas` / `items` / `records` / `data`) can be cropped with the
global `--fields name,other` / `--max-items N` flags — useful for keeping a
large listing inside an AI context window.

## 3. Exit codes: only `0` / non-zero is a promise

**The only contract is `0` = success, non-zero = failure.** The CLI does map
error categories to specific non-zero values internally, and that mapping is
real and in force today — but it is an **internal implementation detail, not
a stable interface**. Categories can be added or re-mapped over time.

**Do not branch on a specific exit code number** (`=== 7`, etc.). Read
`type` / `subtype` / `code` from the parsed `--json` envelope instead — that
is the add-only machine contract this CLI actually promises to keep stable.

## 3. Environment and diagnostics

Two commands answer "is this machine set up, and which CLI am I actually
running". They belong here rather than in a device skill: what they diagnose is
the **CLI and the host**, not the board — and every skill needs that answer, not
just the one that was holding them until 2026-08-24.

### 3.1 `tuyaopen-cli diag doctor` — environment triage

```bash
tuyaopen-cli diag doctor --json
```

One round-trip covering: which CLI binary is actually running (`cli.entryPath`
/ `version` / `contractVersion` / `packaging: bundled|standalone|unknown` /
`cacheRoot` / `devplatSpawnNode` — see skill `tuyaopen-start` § 1 for the
full shape and how to read `packaging`), `node`/`git`/`uv`/`python` toolchain
status, `sdk.{installed,tosPresent,envReady}`, `devplatCli.{present,path}`,
and `credential.{loggedIn,source}`. Real example (fields vary by machine):

```json
{
  "ok": true,
  "data": {
    "cli": { "entryPath": "/…/out/cli/cli.js", "version": "0.1.0", "contractVersion": 1,
              "processNodeVersion": "v22.22.0", "packaging": "bundled",
              "cacheRoot": { "path": "/home/<user>/TuyaOpenIDE/.tuyaopen/cache", "source": "default" },
              "devplatSpawnNode": "/…/bin/node" },
    "node": { "status": "ok", "version": "v22.22.0" },
    "git": { "status": "ok", "version": "2.43.0" },
    "uv": { "status": "ok", "version": "0.11.3" },
    "python": { "status": "ok", "version": "3.12.3" },
    "sdk": { "installed": true, "tosPresent": true, "envReady": true },
    "devplatCli": { "present": true, "path": "/…/tuya-devplat-cli/packages/tuya-devplat-cli/dist/cli.js" },
    "credential": { "loggedIn": false, "source": "none" }
  }
}
```

Read `sdk.envReady` before assuming `tos.py` commands will work — `installed`
and `tosPresent` can both be `true` while the env is still cold. Each tool's
`status` is `ok` / `warn` / `fail`; `node.status: "warn"` means Node is usable
but below the required major version.

### 3.2 `tuyaopen-cli diag export` — diagnostics bundle for a bug report

```bash
tuyaopen-cli diag export [--out <path>] [--force]
```

Writes a JSON file (default `./tuyaopen-diag-<yyyymmdd-hhmmss>.json`)
combining the same `cli` identity block as `doctor`, system info, tool
versions, SDK diagnostics, and — when run inside a project — project
diagnostics. Refuses to overwrite an existing `--out` path unless `--force`
is given. This is a **local file write** (P3, not gated), not a network
upload — hand the resulting file to whoever is helping debug.

### 3.3 When `diag doctor` says the SDK is the problem

`diag doctor` reports `sdk.{installed,tosPresent,envReady}` but does not fix
anything. A narrower SDK-only probe and every repair path — installing,
cloning, warming the environment — belong to skill
`tuyaopen-embedded-env-setup`. Read the field, then go there; do not try to
reconstruct the setup steps from this section.

## 4. Risk gate — P0 needs a **derived** `--confirm` token, P2 needs `--yes`

| Tier | Gate | What's here today |
|---|---|---|
| **P0** | `--confirm <token>`, and the token must be the one **this exact operation's** `--dry-run` handed back | Only `license remove` |
| **P2** | `--yes` | Most mutating commands — `firmware flash` / `authorize`, `skills install` / `uninstall`, `dependency add` / `remove`, `dp add`, `project *`, `config set`, `license add` / `import`, `manifests sync`, `product sync`, `miniapp upload` / `install` / `sync-schema`, `dependency install`, `dependency install`, `hardware set-used` / `intellisense`, `credential logout` |
| **P3** | **No gate at all** — not even `--yes` | Mostly long-running reads, but the writers among them are ungated too: `sdk clone` / `update` / `env-init` / `env-pull`, `firmware build` / `clean`, `skills sync`, `miniapp build` / `meta` / `template`, `credential login`, `diag export`, `dp generate` / `dp sync`, `hardware board-context`, `miniapp preview`. Each guards itself on its own preconditions instead — `diag export` refuses an existing `--out` without `--force`; `sdk clone` refuses a non-empty target. **So do not read "it is not P2" as "it does not write."** |
| Read-only | No gate | — |

Ask `tuyaopen-cli schema list --json` for a command's `riskLevel` rather than
inferring it: the table above is a snapshot, `schema list` is the contract.

> **This table is an inventory, not a route.** A command named here and nowhere
> else is effectively undiscoverable: beta round 6 never ran
> `hardware intellisense`, and the only place it appeared was this risk table —
> which answers "what does it cost to run" and never "when would I want it".
> When adding a command, name it at the task moment it belongs to, in a workflow
> step. Leave this table a risk lookup.

**P2 is `--yes` and nothing else.**

```bash
tuyaopen-cli firmware flash --port <port> --yes
```

Until 2026-08-26 P2 also demanded `TUYAOPEN_AUTOCONFIRM_P2=1` in the
environment, and this section told you to prefix it per-invocation rather than
`export` it. That is gone — do not add it back, and treat any older transcript
that shows the prefix as stale rather than as a second requirement you are
missing. A P2 command that still reports `confirmation:needs_yes` is missing
`--yes` itself.

P0 is judged by **consequence**, not verb: no reverse command exists, **and**
running it destroys state the caller cannot reconstruct. `firmware flash` /
`firmware authorize` / `dependency remove` / `skills uninstall` dropped from
P0 to P2 on 2026-08-18 — all four have a reverse command (`authorize` also
gained `firmware auth-status`, which reads the result back off the device so
you verify after the fact instead of proving intent with a token beforehand).

`P1` was removed entirely (2026-08-18). Its gate was byte-for-byte identical
to P0's, and no command ever landed in it.

**`--dry-run` works on every mutating command, regardless of tier.** The
guard was deliberately decoupled from risk level onto `mutating`, so it is
always available to preview a change without applying it.

For a P0 command, `--dry-run`'s response carries the token in
`meta.confirm_token`. **`--confirm` must be re-run with the identical flags**
used for that `--dry-run` call — a token minted for one flag set does not
confirm a different one. **Never fabricate or guess a token**; always copy
the exact value `--dry-run` handed back.

**Rejected ≠ unusable.** A `confirmation`-type error (the `type` field from
§2) means the CLI is working correctly and refusing you on purpose — do not
switch to `tos.py` because of it.

## 5. Command self-discovery — don't hardcode flags here or anywhere

```bash
tuyaopen-cli schema list [--group <g>]                     # every command's contract
tuyaopen-cli schema get --group <g> --command <c>           # one command's flags/mutating/riskLevel
tuyaopen-cli <group> --help                                 # human-readable, same info
```

**Never copy a flag list into a skill's prose.** The CLI's own schema is the
source of truth and changes are contract-versioned; a hardcoded flag table
goes stale the moment a command gains or loses a flag. Point at `schema get`
instead.

## 6. Skill self-discovery

```bash
tuyaopen-cli skills list [--json]                 # catalog: id/name/summary/whenToUse/surfaces/tags/commands/defaultEnabled
tuyaopen-cli skills list-installed --project-root <dir> [--scope project|global]
tuyaopen-cli skills install --scope project|global [--ids <id1,id2>] [--default] [--force]
tuyaopen-cli skills uninstall --scope project|global --id <id>
tuyaopen-cli skills sync [--stream]                # fetch payloads for catalogue items that declare source.repo
```

**Cold start — `skills list` came back `no_manifest_cache`?** Then this machine
has no catalogue yet (typical right after `npm i -g @tuya/tuyaopen-cli`; the IDE
does this for you). The fix is `manifests sync`, **not** `skills sync`:

```bash
tuyaopen-cli manifests sync --yes    # downloads the catalogue + skill bodies
tuyaopen-cli skills install --default --yes
```

`skills sync` only fetches items whose manifest entry carries a `source.repo`.
Every item in this catalogue ships inside the manifest release instead, so it
reports `external: 0`, exits 0, and changes nothing — running it in place of
`manifests sync` leaves you exactly where you started. `tuyaopen-cli diag doctor`
reports the catalogue state under `manifests` if you want to check first.

**A catalogue that is present can still be stale, and staleness is silent.** An
old cache resolves fine, and `skills install` **succeeds** — against ids that
have since been renamed or retired. Measured 2026-08-21 on a machine whose cache
was 8 days old: `skills install --default` wrote **13 retired ids** and exited 0,
with nothing in any output suggesting a problem. So before trusting a catalogue
you did not just download, ask:

```bash
tuyaopen-cli manifests status --json                    # offline; read `layout`
tuyaopen-cli manifests status --check-update --json     # network; read `update.updateAvailable`
```

Two independent signals, and either one alone is enough to act on:

| Signal | Meaning |
|---|---|
| `layout: "legacy"` | The cache predates the 2026-08-17 product-line split. **Deterministic proof**, not a date guess — that path only exists in a pre-split cache. Its skill ids are the pre-rename ones. |
| `update.domains[].outdated: true` | That domain's declared version is behind the published release. |

Either one → `tuyaopen-cli manifests sync --yes`, then
re-read `skills list`. If the check could not reach the release it says so
(`update.checked: false`, `reason: "release-unreachable"`) — treat that as
"unknown", never as "up to date". `diag doctor` reports the same `layout` plus
the catalogue's `publishedAt` / `skillsVersion`, offline.

- **Project scope** (default) installs a real, editable copy at
  `<project>/.agents/skills/<id>/` (and mirrors it, regenerated on every
  install, to `<project>/.claude/skills/<id>/` — that mirror is IDE-managed;
  edit the `.agents/` copy, not the mirror).
- **Global scope** (`--scope global`, since 2026-08-14) installs to a single
  **hub** at `~/.agents/skills/<id>/`, then links `~/.claude/skills/<id>/`,
  `~/.codex/skills/<id>/` and `~/.cursor/skills/<id>/` back into it (a
  directory symlink on macOS/Linux, a junction on Windows) — so Claude Code,
  Claude Desktop, Codex and Cursor all read the same install. See § 10 for
  what that means for editing one.
- `install --default` pulls in every manifest-declared default-enabled skill
  (the same set a New Project installs automatically) and unions with
  `--ids` rather than replacing it.
- `list-installed` reports drift (`upToDate`) per skill so an agent can decide
  whether to re-install, and — with a project open — whether a same-id
  project-scope copy is *shadowing* a global one (or vice versa): same-id
  project copies always win over the global hub, so a hub update alone does
  not reach a project that already has its own copy.

### 6.1 Your tool's skill directory isn't one of the four? Install them yourself

**Which tool reads what** (measured 2026-08-21 against shipped builds; the
`tuyaopen-cli skills install` result and `diag doctor` both report this per tool,
with a `confidence` field saying whether the row was probed or assumed):

| Tool | project scope | global scope |
|---|---|---|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Antigravity (`agy`) | `.agents/skills/` | `~/.gemini/config/skills/` (**two** levels, not a typo) |
| Codex | `.agents/skills/` (**not** `.claude/`) | `~/.codex/skills/` |
| opencode | `.agents/skills/`, `.claude/skills/`, `.opencode/skill(s)/` | `~/.agents/skills/` — **the hub itself**, no link needed |
| Cursor | unknown | `~/.cursor/skills/` — *unverified*, no CLI to probe |

A project-scope install writes `.agents/skills/` **and** `.claude/skills/`, so
it covers the first four. Global scope writes the hub plus links into
`~/.claude/`, `~/.codex/`, `~/.cursor/` and `~/.gemini/config/`.

**This table has been wrong twice, in both directions**, which is why it now
carries a `confidence` field instead of just paths: `agy` was missing entirely
until 2026-08-21 (so the "just install globally" advice in § 0.1 would have
produced an empty listing), and Codex was recorded as reading *no* project root
(so the report called it blind right after an install it reads fine). If your
tool is not on this list, or reads no skill directory at all, **nothing is
broken.** The catalogue is machine-readable and installation is a command you
can run yourself:

```bash
tuyaopen-cli skills list --json           # id, group, name, summary, whenToUse, tags, defaultEnabled
tuyaopen-cli skills groups --json         # core | embedded | cloud | miniapp | category
tuyaopen-cli skills list-installed --json --project-root .
tuyaopen-cli skills install --ids <a,b> --yes    # project scope
```

Then read the bodies straight off disk — they are plain Markdown with YAML
frontmatter, no tool-specific packaging:

```
<project>/.agents/skills/<id>/SKILL.md      # canonical copy (project scope)
~/.agents/skills/<id>/SKILL.md              # canonical copy (global hub)
```

Pick by `whenToUse` from `skills list`, install what the task needs, read that
`SKILL.md` **before** starting. Two things to get right:

- **Use the canonical `.agents/` copy**, not the `.claude/` mirror — the mirror
  is regenerated on every install and its directory name is flattened.
- **The id in `skills list` is the directory name.** Aliases resolve a lookup,
  never a path: `skills install --ids tuyaopen-debug-helper` works and creates
  `.agents/skills/tuyaopen-embedded-cli-debug/`. Always read the installed
  result back with `list-installed` rather than assuming the path.

- **Reading a `SKILL.md` off disk is always available**, and it does not care
  where your tool was launched. If `/skills` (or your tool's equivalent) does
  not list them but `list-installed` says they are there, you have hit § 0.1 —
  `cat` the files and carry on, rather than concluding they failed to install.

If `skills list` returns `no_manifest_cache`, this machine has no catalogue at
all yet — run `manifests sync` first (see the cold-start note above).

## 7. `tos.py` ↔ `tuyaopen-cli` — what's covered, what still needs `tos.py`

`tos.py` (the TuyaOpen SDK's own build tool, 13 verbs: `build` `clean` `flash`
`monitor` `new` `update` `config` `dev` `idf` `prepare` `hello` `check`
`version`) predates this CLI and is still required for anything the table
below doesn't cover.

| `tos.py` verb | `tuyaopen-cli` CLI equivalent | Note |
|---|---|---|
| `build` / `clean` / `flash` / `monitor` | `firmware build` / `firmware clean` / `firmware flash` / `firmware monitor` | Directly wrapped |
| `new` (project) | `project create` | Non-interactive equivalent of the interactive `tos.py new project` |
| `update` | `sdk update` | **Not the same operation** — `tuyaopen-cli sdk update` is `git pull --ff-only` on the SDK clone (`pullSdk`), while `tos.py update` pins the platform sub-SDK. Use whichever you actually mean; neither replaces the other |
| `config` (Kconfig / menuconfig) | — | **See the warning below — do not confuse with `tuyaopen-cli config`** |
| `dev` / `idf` / `prepare` / `hello` / `check` / `version` | — | No `tuyaopen-cli` equivalent; use `tos.py` |
| `tyutool_cli authorize` | `firmware authorize` | Wrapped (writes UUID/AuthKey over UART) |

> **⚠ `tos.py config` and `tuyaopen-cli config` are two unrelated commands that
> happen to share a name.**
>
> - `tos.py config` (`choice`/`menu`/`save`/`set`/`get`/`list`/`diff`) edits the
>   **project's Kconfig build configuration** — `app_default.config`,
>   `.build/cache/using.config`. See skill `tuyaopen-embedded-build`.
> - `tuyaopen-cli config` (`get`/`set`/`list`) edits **IDE settings**, and only
>   three keys exist: `language`, `gitMirror`, `manifestsSource`. It has
>   **nothing to do with Kconfig.**
>
> The intuitive guess for "set a build config option" is `tuyaopen-cli config
> set` — that is the wrong command and will silently do nothing to the
> project's Kconfig (it will just reject the key, since it isn't one of the
> three above). Use `tos.py config set` (or hand-edit `app_default.config`,
> see skill `tuyaopen-embedded-build`) for Kconfig.

## 8. Project layout

```
<project>/
├── .tuyaopen/                    # AI/SDK-readable metadata, at ROOT
│   ├── project.json              # schema-versioned project descriptor
│   ├── status.json                # lifecycle / intent status
│   ├── architecture.json          # platform/board/framework record
│   ├── dependencies.lock.json     # pinned ecosystem library versions
│   ├── ide/                       # IDE-private state — do not hand-edit
│   └── platform/                  # IDE-private platform/devplat state
└── source/
    ├── embedded/                  # firmware application code
    └── miniapp/                   # Ray panel miniapp code
```

Everything at `.tuyaopen/`'s root is meant to be read (and in places written)
by an AI agent or the SDK; `ide/` and `platform/` under it are IDE-private —
treat them as opaque.

## 9. Routing table — which skill for which intent

`tuyaopen-cli skills list --json` is the live, authoritative listing of this
catalogue — it returns every item with its `whenToUse` whether or not that item
is installed. **No count is written here**: every attempt to state one went
stale (this line said 28 while the catalogue held 30). Rather than every skill naming every sibling it might hand off to —
an O(n²) maintenance burden where adding one skill means editing many others'
prose — **the rule is one-way**: a task-specific skill that hits something out
of its scope says "not in scope, see skill `tuyaopen-start`'s routing table"
and stops there; it does not name which sibling skill picks it up. This file
is the only place that maps intent → skill, in `references/ROUTING.md`.

## 10. Editing an installed skill
