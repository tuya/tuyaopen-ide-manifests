# Changelog

Manifest-level changes, newest first. Versions are the release tag of this
repo (`v<x.y.z>`), not the IDE's. Per-domain versions live in
[`registry.json`](./registry.json) and are what drive the IDE's per-page
"update available" indicator.

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
