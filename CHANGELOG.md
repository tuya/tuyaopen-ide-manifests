# Changelog

Manifest-level changes, newest first. Versions are the release tag of this
repo (`v<x.y.z>`), not the IDE's. Per-domain versions live in
[`registry.json`](./registry.json) and are what drive the IDE's per-page
"update available" indicator.

## [Unreleased]

Accumulated on the branch since `v1.0.0`; `skills` is the only registered
domain that changed, and its version moves `1.0.0` → **`1.1.0`**.

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
  `install --group` reach all 28. The only two that legitimately lacked one were
  the other line's; the validator's group check is now unconditional.
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
- Six skill payloads bumped: `tuyaopen-shared` 1.2.0, `tuyaopen-skill-maker`
  1.1.0 (both minor — the routing table lost two destinations and the placement
  rule changed), `tuyaopen-build` 1.0.2, `tuyaopen-project` 1.1.1,
  `tuyaopen-dependency` 1.0.3, `tuyaopen-hardware` 1.0.3.
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
