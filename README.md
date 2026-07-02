# tuyaopen-ide-manifests

> Public manifest registry consumed by the **TuyaOpen IDE** at runtime.
> The IDE fetches `registry.json` from this repo on startup, then
> lazy-loads each domain's `index.json` only when the matching page is
> opened. This repo intentionally ships **no code** — only structured
> JSON pointing at the canonical source repos.

```
.
├── registry.json                  # top-level index — fetched first
├── boards-and-chips/
│   └── index.json                 # boards + chips (Tuya official + ecosystem)
├── demos/
│   └── index.json                 # demo / example projects
└── skills/
    └── index.json                 # Cursor / VS Code Chat skills
```

---

## Domains

| domain           | what it lists                          | file                              |
| ---------------- | -------------------------------------- | --------------------------------- |
| `boardsAndChips` | development boards and SoCs (official + ecosystem) | `boards-and-chips/index.json` |
| `demos`          | example projects (point at git repos)  | `demos/index.json`                |
| `skills`         | pluggable Cursor / VS Code Chat skills | `skills/index.json`               |

The boards manifest mixes Tuya official boards and ecosystem boards into
one list. The IDE filters on the `brand` field (`brand.en === "Tuya"`
means official) — no separate manifest needed. When the brand and
manufacturer differ (typical for ODM / OEM boards), use the
`manufacturer` field; when they're the same, fill **both** explicitly so
the schema never relies on "implicit inheritance".

## Design principles

1. **Decoupled from the IDE binary** — manifests version independently;
   neither side blocks the other's release cycle.
2. **Flat + inlined** — each domain has exactly **one** `index.json` with
   every entry's fields inlined. No "catalog page → detail page" split.
   A few hundred entries per domain is fine.
3. **Point at sources, never store code** — every product reference uses
   the same shape: `{ "repo": "...", "subpath": "...", "ref": "main|tag|sha" }`.
4. **Versioned** — top-level `schemaVersion` (integer, structural compat)
   plus `publishedAt` (ISO-8601, cache busting), and per-domain
   `version` (semver, differential refresh) inside `registry.json`.
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
- **Boards**: `brand` is the brand owner, `manufacturer` is who actually
  fabricates it. Often identical (e.g. Espressif for an ESP32 DevKit),
  but split for ODM / OEM cases. Always fill both — never rely on
  "missing means same as brand".
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
  See `docs/superpowers/specs/2026-06-30-pinout-functions-caps-split-matrix-design.md`
  in the IDE repo for the full design.
- **`published` gates downstream** — a platform item and a board item each carry
  `published` (default `true` when absent). A board's **effective** publish state
  is `board.published !== false` **AND** its chip platform's `published !== false`:
  if the platform (the variant a board targets via `platformId`) is unpublished,
  every board on it is effectively unpublished too — even boards flagged
  `published: true`. Consumers treat effectively-unpublished boards as not-yet-released
  (the editor sorts them to the end of their tab, published first; the IDE should hide
  them from the board picker). Rationale: you can't ship a board whose SoC platform
  isn't released yet. (Same idea applies to demos gated by their platform.)
- **Board list grouping (multi-variant platforms)** — the editor groups boards into
  one tab per SDK **platform group**. A board's `platformId` may be the group itself
  (single-chip platforms: `t5ai`, `gd32`) OR a specific chip **variant** (multi-chip
  platforms: `esp32s3`, `esp32c6`, …). To place every chip of one SDK platform in a
  single tab, resolve a board's `platformId` to its group via the platforms list
  (`platform.id → platform.platformId`). Keep `board.platformId = the variant` (so the
  IDE resolves the correct per-chip detail) and `board.variantId = the same variant`.

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
- **Schema bump** — bump the top-level `schemaVersion` and include a
  short migration note in the PR description.
- **Release** — tag the commit; CI validates every JSON against the
  schema; the tag is what the CDN / IDE pins to.

This is meant to be edited like any normal git repo: PR, review, merge,
tag. No special tooling needed beyond a JSON-aware editor.

## Roadmap (not in this round)

- `schemas/*.json` — JSON Schema per domain, enforced by CI.
- `mirrors.json` — Mainland China mirrors / Gitee fallback URLs.
- `CHANGELOG.md` — manifest-level changelog the IDE references in its
  "manifests updated" toast.

## License

Apache License 2.0. See [`LICENSE`](./LICENSE).
