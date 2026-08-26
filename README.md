# tuyaopen-ide-manifests

> Public manifest registry consumed by the **TuyaOpen IDE** at runtime.
> The IDE fetches `registry.json` from this repo on startup, then
> lazy-loads each domain's `index.json` only when the matching page is
> opened. Boards / demos / platforms are pure metadata pointing at the
> canonical source repos; `skills/` is the one domain that also ships its
> **payload** in-repo (see below).

```
.
├── registry.json                  # top-level index — fetched first
├── boards-and-chips/
│   └── index.json                 # boards + chips (Tuya official + ecosystem)
├── demos/
│   └── index.json                 # demo / example projects
├── skills/
│   ├── index.json                 # AI agent skills registry (Cursor, Claude Code, …)
│   ├── embedded/                  # ── the skill payloads themselves ──
│   ├── cloud/                     #    SKILL.md + references/ + scripts/
│   └── miniapp/                   #    see skills/README.md
└── miniapp-templates/             # shipped in the tarball, but NOT a domain
    └── miniapp-template-covers.json
```

---

## Domains

| domain           | what it lists                          | file                              |
| ---------------- | -------------------------------------- | --------------------------------- |
| `boardsAndChips` | development boards and SoCs (official + ecosystem) | `boards-and-chips/index.json` |
| `demos`          | example projects (point at git repos)  | `demos/index.json`                |
| `skills`         | pluggable AI agent skills **+ their payload** | `skills/index.json` + `skills/<surface>/**` |

### Shipped in the tarball but *not* a domain

`miniapp-templates/miniapp-template-covers.json` rides in `manifests.tar.gz`
from 1.0.0 on, and the IDE reads it by its manifest-relative path like any
board `detailUrl` — but it must **never** be added to `registry.json#manifests`.
It is `schemaVersion: 2`, has no `domain` field and names its array `templates`
instead of `items`, so the IDE's domain-envelope check rejects it; worse, a
registry entry makes the IDE's cache-integrity check demand a file that older
releases do not carry, which forces a full tarball re-download on every startup
for anyone pinned to such a release.

`peripheral-templates/index.json` is the mirror case: it stays in this repo as
the canonical source, but is **not** packaged — the IDE serves that catalogue
from its own bundled copy and syncs it in at build time.

The boards manifest mixes Tuya official boards and ecosystem boards into
one list. The IDE tells them apart from **`manufacturer` first, falling
back to `brand`** — it resolves that value in the active locale and treats
`Tuya` / `TuyaOpen` / `Tuya Inc.`, or any name starting with `涂鸦`, as
official. No separate manifest needed. `manufacturer` is therefore the
field every board must carry; `brand` is optional and only worth setting
when the brand owner genuinely differs from the fabricator (ODM / OEM).
Note that a `brand` alone does **not** move a board into the official
group — `manufacturer` wins whenever both are present.

## Design principles

1. **Decoupled from the IDE binary** — manifests version independently;
   neither side blocks the other's release cycle.
2. **Flat + inlined** — each domain has exactly **one** `index.json` with
   every entry's fields inlined. No "catalog page → detail page" split.
   A few hundred entries per domain is fine.
3. **Point at sources, don't copy them** — every *product* reference uses
   the same shape: `{ "repo": "...", "subpath": "...", "ref": "main|tag|sha" }`.
   Skills are the deliberate exception: their payload lives here
   (`source.localPath`) so a skill and the manifest describing it can never
   drift apart, and the IDE gets everything from one `manifests.tar.gz`.
4. **Versioned** — top-level `schemaVersion` (integer, structural compat)
   plus `publishedAt` (ISO-8601, cache busting), and per-domain
   `version` (semver, differential refresh) inside `registry.json`.
   `skills` items additionally carry a **per-item** `version` (semver), because
   their payload is installed into user projects: it is what lets the IDE tell
   an upstream update apart from a user's local edit. See
   [`skills/README.md`](./skills/README.md#version--per-skill-payload-version).
5. **Localizable** — `name` / `summary` / similar fields accept either a
   plain string or `{ "en": "...", "zh-CN": "..." }`. The IDE picks by
   active locale and falls back to English.
6. **Forward compatible** — unknown fields **must** be ignored by the
   IDE so we can grow the schema without coordinated releases.

## Field conventions

- **Time** — ISO-8601 UTC (`2026-05-12T00:00:00Z`).
- **IDs** — kebab-case, **unique per domain**.
- **Localized strings** — string **or** `{ "en": "...", "zh-CN": "..." }`;
  consumers must accept both.
- **Cross-domain references** use IDs (e.g. a board's
  `recommendedDemos: ["switch-3-iot"]`), never URLs — moving a file
  doesn't break the link.
- **Boards**: `manufacturer` is who actually fabricates the board and is
  **required**; `brand` is the brand owner and is **optional**, meant for
  the ODM / OEM case where the two genuinely differ. Do not fill `brand`
  with a copy of `manufacturer`: the IDE reads `manufacturer || brand`, so
  a duplicate buys nothing, and the board card only renders a separate
  manufacturer row when the two values differ. Prefer the localized form
  `{ "en": …, "zh-CN": … }` over a single-language string — a bare `"微雪"`
  shows up as Chinese for English users, and the same vendor spelled two
  ways reads as two vendors.
- **SDK applicability** (`sdks`) — optional array marking which SDK(s) an
  entry applies to, on `boardsAndChips` / `demos` / `skills` items.
  Values: `"tuyaopen"`, `"tuyaos"`; an entry may list one or both
  (`["tuyaopen", "tuyaos"]`). **Omitted ⇒ `["tuyaopen"]`** — every
  pre-existing entry is TuyaOpen-only, so existing data needs no
  back-fill; only TuyaOS-capable entries set the field explicitly.
  Forward-compatible: an IDE predating the field ignores it (shows
  everything); an SDK-aware IDE filters the catalogue by the active SDK.
  `platforms` items do **not** carry this field.
- **Platform pinout `functions` vs `caps`** — in a platform detail file each
  `pinout[]` entry splits its labels into two arrays: `functions[]` is a
  **controlled, selection-only** vocabulary of editor-selectable *routing*
  tokens (`GPIO` + `UART{n}_TX` / `I2C{n}_SCL` / `SPI{n}_MOSI` / `QSPI…` /
  `PWM{n}` / `ADC{u}_CH{c}` — exactly what the manifest-editor's pin-picker
  matches); `caps[]` is **free datasheet text** for display-only capabilities
  (`RTC_GPIOn`/`LP_GPIOn`, `TOUCHn`, `DACn`, flash/USB/strapping, `JTAG`,
  `RGB`/`i8080`/`SEG`, `ENET_*`, power rails, …). A pin's own `GPIO{n}`
  identity lives in `name`/`gpio`, not in `functions`.
- **Platform peripheral port `routable`** — each `peripherals.<p>.spec.ports[]`
  (PWM on `spec`) carries `routable` (default `false` = fixed pinmux, pins
  locked). GPIO-matrix chips (ESP32) set `routable: true` on digital ports so
  their `pinGroups` become *defaults* and any `GPIO`-capable pin is selectable;
  an optional `candidates: [gpio,…]` constrains the routable set (e.g. LP-domain
  ports). ADC/analog ports stay `routable: false`.
- **`published` gates downstream** — a platform item and a board item each carry
  `published` (default `true` when absent). A board's **effective** publish state
  is `board.published !== false` **AND** its chip platform's `published !== false`:
  if the platform (the variant a board targets via `variantId`) is unpublished,
  every board on it is effectively unpublished too — even boards flagged
  `published: true`. Consumers treat effectively-unpublished boards as not-yet-released
  (the editor sorts them to the end of their tab, published first; the IDE should hide
  them from the board picker). Rationale: you can't ship a board whose SoC platform
  isn't released yet.
- **`demos` spells the same flag `publish`, not `published`** — deliberately, and
  the IDE reads the two names on different domains: `published` on
  `boardsAndChips` / `platforms`, `publish` on `demos` (and on the
  `miniapp-templates` covers catalogue). Both default to visible when absent, so
  spelling it the other way on a demo does not hide that demo — it silently
  publishes it. Do not "normalise" one into the other without changing the IDE
  in the same release.
- **Board list grouping (multi-variant platforms)** — a board carries **two**
  platform pointers and they are not interchangeable:
  - `board.platformId` = the **platform group**, which is what the boards list tabs
    on (`t5ai`, `gd32`, `esp32`, `linux`). A platform item's own group is its
    `platformId` field, so several items share one: all of `esp32`, `esp32c3`,
    `esp32c6`, `esp32s3`, `esp32p4c6` carry `platformId: "esp32"`.
  - `board.variantId` = the exact chip **variant**, i.e. some platform item's `id`.
    This is what resolves the per-chip detail, and it must be set on every board —
    including single-chip platforms, where it repeats the group (`t5ai` → `t5ai`).

  The consumer binds on `variantId` when present and only falls back to matching
  `platformId` against a platform item's `id` **or** its group when it is absent.
  So a group id that no platform item uses as its `id` (`gd32`) is fine in
  `platformId` — `variantId: "gd32vw553"` is what does the resolving.

  **What the IDE actually reads today** — `BoardManifestItem`
  (`src/manifests/manifestsTypes.ts`) declares only `platformId`; there is no
  `variantId` on it, so every IDE-side board → platform join goes through
  `platformId`, two-step: `items.find(p => p.id === pid) || items.find(p =>
  p.platformId === pid)` (`src/extension.ts`, and `boardOnPlatform` in
  `media/webview/main.js`). `variantId` is still required by the rule above and
  is what `tools/manifest-editor` resolves on, but do not assume it steers the
  IDE.

  **Known exception — the five T1 modules carry `platformId: "t1-chl"`, the
  variant id, not the group id `"t1"`.** The T1 platform item is
  `id: "t1-chl"` / `platformId: "t1"`, split so that both the `T1-CHL` chip
  token TuyaOS reports and the family token `T1` resolve. The TuyaOS board list
  filters with `b.platformId === plat.id` (`media/webview-tuyaos/main.js`, three
  sites) — it has not picked up the `boardOnPlatform` fix that
  `media/webview/main.js` already carries — so a board holding the group id
  `"t1"` never matches the `t1-chl` platform item: it falls into the ungrouped
  bucket at the bottom of the list, and the T1-CHL tab renders "no boards".
  These modules are `sdks: ["tuyaos"]`, so that view is the only surface they
  appear on. Putting the variant id in `platformId` is a deliberate deviation
  from the rule above, taken because the fix belongs to the IDE repo and not to
  this one. **Revert it to `"t1"` once `webview-tuyaos` matches on the group id
  too.**

  Two things to know while it stands. `tools/manifest-editor` recomputes
  `platformId` from the chip dropdown's `data-group` on save
  (`board-editor.js`), so editing one of these five boards there silently
  restores `"t1"` and re-breaks the grouping. And a project scaffolded from one
  of them gets `platform.target: "t1-chl"`. `platformKconfigId` is unaffected:
  it is overwritten from `platformSymbol: "T1"` in `platforms/t1/t1.json`.

## How the IDE consumes this repo

```
IDE startup
  → fetch <CDN>/registry.json (with ETag — 304 hits the local cache)
  → diff cached publishedAt + per-domain version
  → lazy-fetch only the domains the user navigates to
  → cache to globalStorage; re-validate via ETag on next cold start
```

## Maintenance flow

- **Add / edit / remove an item** — edit the entries in the matching
  `<domain>/index.json` directly and open a PR.
- **Add / edit a skill** — the payload and the index entry go in the same PR,
  and editing a payload means bumping that item's `version`;
  see [`skills/README.md`](./skills/README.md). CI runs
  `scripts/validate-skills-index.py` (structure + versions + no orphan
  payloads), `scripts/check-skill-version-bumps.py` (changed payload ⇒ version
  bumped) and `pytest tests`.
- **Bump the domain version** — any change to a `<domain>/index.json` or the
  items under it needs `registry.json`'s `manifests.<domain>.version` bumped
  (minor for added / removed items, patch for content-only edits). That number
  is what lights the "this page has an update" dot in the IDE; leaving it
  untouched means an already-synced IDE never tells the user anything changed.
  Refresh that domain's `publishedAt` in the same PR.
- **Schema bump** — bump the top-level `schemaVersion` and include a
  short migration note in the PR description.
- **Release** — add a [`CHANGELOG.md`](./CHANGELOG.md) entry, then tag the
  commit and publish a GitHub Release for the tag; CI validates the JSON, packs
  `manifests.tar.gz`, generates `release.json` from `registry.json`'s domain
  versions, and mirrors both to Gitee. The tag is what the CDN / IDE pins to.
  The `images.tuyacn.com` copy named in `release.json#package.tuyacn` is **not**
  uploaded by CI — publish it by hand. Skipping it does not break the release:
  the IDE cycles `tuyacn → gitee → github` (CN locale) across six attempts, so a
  404 there costs one failed request and a short backoff before Gitee serves the
  tarball. It does mean every Mainland-China client pays that penalty on every
  cold sync, which is the whole reason the CDN entry exists.

This is meant to be edited like any normal git repo: PR, review, merge,
tag. No special tooling needed beyond a JSON-aware editor.

## Roadmap (not in this round)

- `schemas/*.json` — JSON Schema per domain, enforced by CI.
- `mirrors.json` — Mainland China mirrors / Gitee fallback URLs.
- Uploading the `images.tuyacn.com` tarball from CI instead of by hand.

## License

Apache License 2.0. See [`LICENSE`](./LICENSE).
