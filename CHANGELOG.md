# Changelog

Manifest-level changes, newest first. Versions are the release tag of this
repo (`v<x.y.z>`), not the IDE's. Per-domain versions live in
[`registry.json`](./registry.json) and are what drive the IDE's per-page
"update available" indicator.

## [Unreleased]

Accumulated on the branch since `v1.0.0`. `skills` is the only registered
domain that changed, and its version moves `1.0.0` → **`1.3.2`**
(`registry.json` → `manifests.skills.version`) in four steps:
`1.0.0` → `1.2.0` → `1.3.0` → `1.3.1` → `1.3.2`. Three of those are the
catalogue work described below. `1.3.1` is not: it came from a concurrent branch
(rpx style scale in `tuyaopen-miniapp-panel-dev`'s theme doc and its
`validate.mjs`) and is recorded here only so the arithmetic reconciles — that
work is not summarised in the entries below.

The headline is that **the `tuyaopen` CLI is now the primary path in every
skill body**, with the legacy tools (`tos.py`, `tyutool_cli`,
`tuya-devplat-cli`) kept as a fallback the agent can *decide* to take rather
than a parallel set of instructions it has to guess between. All **28**
registered `SKILL.md` bodies changed in service of that.

### Changed

- **The skills catalogue is TuyaOpen-only.** The two items of the second
  product line were removed from `skills/index.json` (30 → 28) and their
  payload moved unmodified to the repo-root `tuyaos-skills/` — outside
  `skills/`, so the validator's orphan check is satisfied, and outside the
  release workflow's staging list, so it contributes zero bytes to
  `manifests.tar.gz`. Every remaining item's `sdks` is now `["tuyaopen"]` (18
  were dual-declared), and the validator's `PRODUCT_LINES` / `SDKS` are
  single-valued. Nothing here was ever visible to a TuyaOpen user: both
  consumers' SDK gates already dropped those items at ingestion — what changed
  is that they are now absent rather than filtered. See
  [`tuyaos-skills/README.md`](./tuyaos-skills/README.md).
- **Every item now carries `group`**, so `tuyaopen skills groups` and
  `install --group` reach all 28 across the five install units (`core` 2,
  `embedded` 10, `cloud` 3, `miniapp` 7, `category` 6). The only two that
  legitimately lacked one were the other line's; the validator's group check is
  now unconditional. 17 items carry `defaultEnabled: true` — the set New
  Project and `skills install --default` install.
- **Every item now carries a `cli` object** declaring its relationship to the
  `tuyaopen` CLI, and it is a *hard* field, not an optional hint. Fourteen items
  name the CLI groups they invoke (`cli.groups`, e.g. `tuyaopen-flash` →
  `["firmware", "device"]`); the other fourteen — `tuyaopen-add-board`,
  `tuyaopen-code-check` and the twelve MiniApp skills — declare
  `{"groups": "none", "reason": "…"}` and say so in the body too. Eleven items
  additionally declare `cli.fallback`, the legacy tool(s) the body falls back to
  when the CLI is unavailable (`tos.py`, `tyutool_cli`, `tuya-devplat-cli`).
  Before this, "not stating it" was an invisible state: measured 2026-08-17,
  three skills mentioned the CLI zero times and all three were among the nine
  that had never declared anything.
- **The risk-gate documentation was recalibrated to what the CLI enforces.**
  `P1` is gone entirely — its gate was byte-for-byte identical to P0's and no
  command ever landed in it. `P0` now means one thing: no reverse command
  exists *and* the run destroys state the caller cannot reconstruct. On that
  test `firmware flash`, `firmware authorize`, `dependency remove` and
  `skills uninstall` all dropped to P2, leaving `license remove` as the only P0
  command, and the bodies that documented a `--confirm <token>` ceremony for
  those four were corrected to the P2 gate (`--yes` +
  `TUYAOPEN_AUTOCONFIRM_P2=1`, and a P2 `--dry-run` hands back no token).
  `tuyaopen-shared` § 4 now also documents the **P3** tier — ungated, yet
  twelve of its members still write — so "not P2" can no longer be misread as
  "does not write", and it teaches the env var as a per-invocation prefix
  rather than an `export`, which would leave every later P2 command in the
  shell one `--yes` away.
- `tuyaopen-env-setup` Step 3 points at **`tuyaopen diag doctor`** instead of a
  bundled script (see *Removed*).
- `tuyaopen-skill-maker` § 3 rewritten around a single payload location. It also
  carried a false claim worth naming: that the CLI does not apply the `sdks`
  filter and lists every item. `cli/commands/skills.ts` has filtered since
  2026-08-15.
- `tuyaopen-dependency` described `tuyaopen library list` as listing the
  "TuyaOS platform sub-SDKs (LVGL, mbedtls, …)". Wrong twice over: it lists the
  TuyaOpen core repo plus its per-chip platform repos, read from the SDK's own
  `platform/platform_config.yaml`; and LVGL/mbedtls are what `ecosystem install`
  adds — the other half of the very paragraph that sentence was drawing a
  distinction in. The IDE-side command description carried the same error and
  was corrected there in the same change.
- Per-skill payload `version`s bumped alongside the bodies they describe.
- **Twelve more MiniApp templates** published to `miniapp-templates/`. Not a
  registered domain, so no domain version moves — see the 1.0.0 entry for why.

### Added

- **`scripts/check-domain-version-bumps.py` + `validate-domains.yml`** — the
  domain-version rule in [README](./README.md#contributing) had no gate, and it
  showed: the commits summarised above changed 439 files under `skills/` while
  `manifests.skills.version` stayed at the `1.0.0` that shipped with `v1.0.0`,
  and `skills/index.json`'s `publishedAt` still carried that release's date.
  Since `release.json#domains` is generated from those numbers, and the IDE
  lights its per-page "update available" dot from them, an unbumped domain means
  an already-synced IDE downloads the new tarball and then tells the user
  nothing changed. The check also refuses a registry entry whose `url` is
  missing or whose `domain` field disagrees with its key — the IDE's
  `cacheIntegrity()` will not start on either, so those are startup failures
  rather than tidiness. Unit-tested in `tests/scripts/`, and all three failure
  branches were verified by mutation against this very state.
- **Three `cli`-declaration rules in `scripts/validate-skills-index.py`**, each
  closing a different way the declaration could be wrong:
  1. **The field is required.** An item with no `cli` object fails, so "never
     declared" stops being indistinguishable from "declared no coverage".
     `{"groups": "none"}` must come with a `reason`, and the body must also
     carry the sentence ``No `tuyaopen` CLI coverage`` — the reader needs to see
     it, not just the index.
  2. **Group names must be real.** `cli.groups` entries are checked against the
     CLI's actual group list, which catches a typo here *and* a group rename on
     the CLI side.
  3. **The declaration and the body must agree, in both directions.** The
     validator reads the item's own `SKILL.md` (never anything under
     `references/`) and compares `cli.groups` against the **Command column of
     the `## Shortcuts` table** — deliberately that column and nothing else,
     because Rule 3 is about what the skill *invokes*, and prose, an `## Other`
     section or a `> **No CLI?**` aside mentioning a group is not an
     invocation. A declared group with no matching Command-column row is
     *declared but unused*; a Command-column row invoking a group that is not
     declared is *used but undeclared*. An item declaring groups with no
     `## Shortcuts` section at all fails outright — that section is the agent's
     entry point.
  Unit-tested in `tests/scripts/test_validate_cli_declaration.py`.

### Removed

- **`tuyaopen-env-setup/scripts/check_env.{sh,ps1,bat}`** (162 lines: 65 + 43 +
  54). `tuyaopen diag doctor` now answers all seven of the questions those
  scripts asked — the activated venv and `OPEN_SDK_ROOT` (as
  `sdk.envReady` / `sdk.installed`), `tos.py` on PATH (`sdk.tosPresent`), git,
  python3, and **cmake and ninja, which were added to `diag doctor` for this**
  — so three per-platform copies of the same probe were pure maintenance cost,
  and the shell/PowerShell/batch triplet was the part most likely to drift
  apart silently. Step 3 of the skill points at the CLI command instead.

### Fixed

- `peripheral-sd`'s frontmatter `name` was `SD Card Storage`, carrying no
  namespace. Bundled sub-skills are not merely internal: Codex scans
  `$HOME/.agents/skills` recursively and registers every nested `SKILL.md` as an
  independent skill, so that name occupied a global identifier on any machine
  that installed `tuyaopen-hardware`. Now `tuyaopen/peripheral-sd`, matching its
  25 siblings, and `tuyaopen-skill-maker` § 2 states the rule so the next
  sub-skill gets it right.

## [1.0.0] - 2026-08-13

First release paired with TuyaOpen IDE 1.0.0. All four domain versions are
aligned to `1.0.0` here; from the next release on they move independently
again, as [the design principles](./README.md#design-principles) intend.

### Added

- **`miniapp-templates/` now ships in `manifests.tar.gz`.** The MiniApp
  template gallery reads `miniapp-templates/miniapp-template-covers.json` from
  the manifest cache, and no release before this one carried it — a packaged IDE
  showed only its one bundled starter template. It is deliberately **not** a
  registry domain: the file is `schemaVersion: 2` with a `templates` array and
  no `domain` field, so the IDE's domain-envelope check would reject it, and a
  `registry.json` entry would make its cache-integrity check demand a file older
  releases lack — forcing a full tarball re-download on every startup. Needs IDE
  ≥ 1.0.0, which is the first version that installs the directory into its cache.
- **Per-skill payload `version`** on all 29 `skills` items, with CI enforcing a
  bump whenever a payload changes and refusing a version that moves backwards
  onto already-released ground (`scripts/check-skill-version-bumps.py`). This is
  what lets the IDE tell an upstream skill update apart from a user's local edit
  instead of silently overwriting it. See
  [`skills/README.md`](./skills/README.md#version--per-skill-payload-version).
- **Nine TuyaOpen development skills absorbed from `TuyaOpen-dev-skills`** —
  `env-setup`, `dev-loop`, `project-config`, `debug-helper`, `cli-debug`,
  `crash-decode`, `code-check`, `device-auth`, `tyutool_cli` — payloads and index
  entries in one place, with unit tests for the scripts they ship.
- **Device-authorization ledger** documented in the `device-auth` skill, plus a
  corrected serial-port rule.
- **`oemUrl` on demos** for one-click OEM product creation, replacing the
  `productId` seed. Demos without an OEM source can still declare a ready-to-use
  preset PID.
- **MiniApp template covers catalogue** — 32 templates with bilingual display
  names, cover images, QR codes and download URLs.

### Changed

- **All domain versions → `1.0.0`** (`platforms` 0.3.0, `boardsAndChips` 0.4.0,
  `demos` 0.1.3, `skills` 0.3.0). Note `demos` had accumulated changes since
  v0.1.7 without a version bump, so IDEs that had already synced were never told
  the OEM links existed; this release corrects that.
- **Board `manufacturer` values are localized and de-duplicated** —
  `{ "en": …, "zh-CN": … }` for Tuya, Espressif, Waveshare, ALIENTEK, JLC and
  GigaDevice. Waveshare had been spelled both `微雪` and `Waveshare` across four
  boards, which reads as two different vendors; the Chinese-only strings showed
  up as Chinese for English users.
- **Documentation corrected against the shipping IDE** in three places where the
  README described behaviour that does not exist: official-board detection reads
  `manufacturer` first and only falls back to `brand` (it is not
  `brand.en === "Tuya"`, and `brand` is optional); `board.platformId` is the
  platform **group** while `board.variantId` is the chip **variant** (the README
  had these swapped); and `demos` spells its visibility flag `publish` while
  `boardsAndChips` / `platforms` use `published` — deliberately, on the IDE side,
  so "normalising" the names would silently publish hidden demos.

### Fixed

- **11 MiniApp templates unpublished** after every template in the catalogue was
  built and screenshotted headlessly: compile failures, blank screens, templates
  needing real hardware or a live cloud, and one that renders only against DP
  data it does not ship. Published count 26 → 15.
- **Stale counters** in the template covers catalogue (`withCover` / `withoutCover`
  described an earlier 34-template state and summed to more than the total).
- **TuyaOpenClaw board ids** reverted by an earlier change.
- **Ubuntu board** switched to cross-deploy over SSH, renamed, arm64 dropped.

---

Releases before 1.0.0 are not covered here; see the
[commit history](https://github.com/tuya/tuyaopen-ide-manifests/commits/main)
and the [GitHub Releases](https://github.com/tuya/tuyaopen-ide-manifests/releases)
page.
