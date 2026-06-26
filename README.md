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
