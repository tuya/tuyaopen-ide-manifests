#!/usr/bin/env python3
"""Validate skills/TuyaOpen/index.json structure and references.

Checks (all local / deterministic, no network):
  - JSON parses and required top-level keys exist with correct types
  - devSkillsRelease is optional and no longer published; when present its fields are checked
  - Each item has required fields with correct types
  - Every item carries a well-formed 'version' (x.y.z semver, numeric parts)
  - Bilingual fields (name/summary/whenToUse) carry both 'en' and 'zh-CN'
  - 'id' is unique; 'surface' is one of the known surfaces
  - 'source' must be {localPath}; {devSkills + subpath} is rejected (dev-skills is archived)
  - For local skills: source.localPath holds a SKILL.md, sits under skills/<surface>/,
    and installPayload == localPath minus 'skills/'
  - No orphan skills: every top-level skills/**/SKILL.md dir is referenced by
    exactly one item's source.localPath
  - Every '.agents/skills/<x>' path written in skills/**/*.md names a known item id
    (installs are flat: .agents/skills/<id>)
  - Every related[] entry resolves to a known item id
  - Every requires[] entry resolves to a known item id and is not self-referential
  - 'surfaces' (optional, multi-valued) is a non-empty array of known surfaces;
    when both 'surface' and 'surfaces' are present, 'surface' must be a member
    of 'surfaces' (the two must never silently disagree)
  - 'aliases' (optional) entries are non-empty strings, never equal to their own
    item's id, never equal to any item's canonical id (an alias must not shadow
    a real id), and unique across the whole catalogue (no old id resolves to
    two different new ids)
  - Every item carries a 'cli' object declaring its tuyaopen CLI relationship:
    either {"groups": [...]} naming real CLI command groups, or
    {"groups": "none", "reason": "..."} when the CLI does not cover it
  - That declaration agrees with the SKILL.md body's '## Shortcuts' section in
    both directions: every declared group is actually invoked there, and every
    group the section invokes is declared (tuyaopen-shared is exempt from the
    second direction — see check_shortcuts_agreement)

Usage: python3 scripts/validate-skills-index.py [path/to/index.json]
Exits 0 on success, 1 on any error.
"""

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SURFACES = {"embedded", "cloud", "miniapp"}
# Install group — the unit the `tuyaopen` CLI offers, so a user picks among five
# groups instead of 28 individual skills. **A second axis, not a replacement for
# `surface`**, and the two deliberately disagree: `surface` drives the IDE's
# filter tabs (browsing, "which end of the product is this about"), `group`
# drives CLI installs ("what am I setting out to do"). `tuyaopen-embedded-device-auth`
# is surface=embedded but group=cloud, and that is correct on both axes.
#
# - core / embedded / cloud / miniapp — grouped by capability.
# - category — grouped by **product category** instead: the lamp / socket /
#   robot-vacuum / IPC playbooks a developer installs exactly one of. Not named
#   after miniapp even though every member is one today, because embedded
#   per-category skills are expected here too; when they arrive, `surface`
#   keeps telling the IDE which tab they belong in.
# Required on every item: `group` is the CLI's install unit
# (`tuyaopen skills groups` / `install --group`), so an ungrouped item is one
# no group-install can ever reach. Two items were legitimately ungrouped while
# a second product line lived here; that line moved out on 2026-08-17, so the
# field is now unconditionally required.
GROUPS = {"core", "embedded", "product", "miniapp", "scenario"}
# Top level under skills/. Since the 2026-08-14 reorg this is NOT the surface:
# a `tuyaopen-miniapp-*` skill has surface "miniapp" but still lives under
# TuyaOpen/, because placement and capability surface are orthogonal. See
# skills/README.md's Layout section. Set-valued rather than a bare string
# because the check below reports `sorted(...)` and a typo ("Tuyaopen/") must
# name what was expected.
PRODUCT_LINES = {"TuyaOpen"}
# SDK applicability flag. Optional per item; omitted ⇒ ["tuyaopen"] (default),
# which is now the only legal value — this catalogue is TuyaOpen-only.
SDKS = {"tuyaopen"}
# `tuyaopen` CLI 的命令组。权威来源是 CLI 自己的 `tuyaopen schema list`，这里是一份
# 手工镜像 —— manifests 仓不能依赖 IDE 仓的产物，所以只能镜像。CLI 改组名时两边一起改，
# 而这份镜像过期正是我们想让它红的时刻（技能会声明一个不存在的组）。
# 2026-08-24: `device`, `ecosystem` and `library` were removed from the CLI
# outright — no aliases. A skill still declaring one of them now fails here,
# which is the point: the catalogue and the CLI ship together, so a stale
# declaration must be loud rather than quietly pointing at a dead command.
CLI_GROUPS = {
    "boards", "config", "credential", "demos", "dependency", "devplat",
    "diag", "dp", "firmware", "hardware", "license",
    "manifests", "miniapp", "product", "project", "schema", "sdk", "skills",
}
BILINGUAL_FIELDS = ("name", "summary", "whenToUse")
LANGS = ("en", "zh-CN")
URL_RE = re.compile(r"^https?://[^\s]+$")
# Per-item payload version. Same vocabulary as release.json's domains[].version:
# plain x.y.z, no pre-release/build suffixes, no leading 'v', no leading zeros.
VERSION_RE = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")

errors: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def is_str(v) -> bool:
    return isinstance(v, str) and v.strip() != ""


def check_bilingual(item_label: str, field: str, value) -> None:
    if not isinstance(value, dict):
        err(f"{item_label}: '{field}' must be an object with {LANGS}")
        return
    for lang in LANGS:
        if not is_str(value.get(lang)):
            err(f"{item_label}: '{field}.{lang}' missing or not a non-empty string")


def check_top_level(data: dict) -> None:
    for key in ("schemaVersion", "domain", "publishedAt", "publishedBy", "items"):
        if key not in data:
            err(f"top-level: missing required key '{key}'")
    if "schemaVersion" in data and not isinstance(data["schemaVersion"], int):
        err("top-level: 'schemaVersion' must be an integer")
    for key in ("domain", "publishedAt", "publishedBy"):
        if key in data and not is_str(data[key]):
            err(f"top-level: '{key}' must be a non-empty string")
    if "items" in data and not isinstance(data["items"], list):
        err("top-level: 'items' must be an array")


def check_dev_skills_release(dsr) -> None:
    # No longer published: TuyaOpen-dev-skills is archived and its content is now
    # inlined under skills/embedded/tuyaopen/, so the field is normally absent.
    # Kept lenient rather than forbidden so an old index can still be validated.
    if dsr is None:
        return
    if not isinstance(dsr, dict):
        err("devSkillsRelease: must be an object")
        return
    for key in ("version", "github", "gitee", "sha256", "size"):
        if key not in dsr:
            err(f"devSkillsRelease: missing required key '{key}'")
    for url_key in ("github", "gitee"):
        url = dsr.get(url_key)
        if url is not None and not (isinstance(url, str) and URL_RE.match(url)):
            err(f"devSkillsRelease.{url_key}: not a well-formed URL: {url!r}")
    if "size" in dsr and not isinstance(dsr["size"], int):
        err("devSkillsRelease.size: must be an integer")


def check_item(item, index: int, seen_ids: set) -> None:
    label = f"items[{index}]"
    if not isinstance(item, dict):
        err(f"{label}: must be an object")
        return

    item_id = item.get("id")
    if not is_str(item_id):
        err(f"{label}: 'id' missing or not a non-empty string")
    else:
        label = f"item '{item_id}'"
        if item_id in seen_ids:
            err(f"{label}: duplicate id")
        seen_ids.add(item_id)

    if not isinstance(item.get("order"), (int, float)):
        err(f"{label}: 'order' missing or not numeric")

    # Payload version. The IDE compares the installed copy's recorded version
    # against this one to tell "upstream shipped an update" apart from "the user
    # edited their installed copy" — a content hash alone cannot distinguish the
    # two. Required, so that a missing version always means "old manifest", never
    # "this skill happens not to be versioned".
    version = item.get("version")
    if not is_str(version) or not VERSION_RE.match(version):
        err(
            f"{label}: 'version' missing or not an x.y.z semver string "
            f"(numeric parts, no 'v' prefix, no suffix), got {version!r}"
        )

    surface = item.get("surface")
    if surface not in SURFACES:
        err(f"{label}: 'surface' must be one of {sorted(SURFACES)}, got {surface!r}")

    # `group` is required on every item — see GROUPS.
    src = item.get("source")
    local_path = src.get("localPath") if isinstance(src, dict) else None
    group = item.get("group")
    if group not in GROUPS:
        err(f"{label}: 'group' must be one of {sorted(GROUPS)}, got {group!r}")

    # Optional multi-valued surfaces (2026-08-14). Preferred by the IDE over
    # 'surface' when present (see manifestsTypes.ts's SkillManifestItem.surfaces
    # docstring) — checked here only for internal consistency, never as a
    # replacement for 'surface', which stays required above.
    surfaces = item.get("surfaces")
    if surfaces is not None:
        if not isinstance(surfaces, list) or not surfaces or not all(s in SURFACES for s in surfaces):
            err(f"{label}: 'surfaces' when present must be a non-empty array of {sorted(SURFACES)}, got {surfaces!r}")
        elif surface in SURFACES and surface not in surfaces:
            err(
                f"{label}: 'surface' ({surface!r}) must be a member of 'surfaces' "
                f"({surfaces!r}) when both are present — they must never disagree"
            )

    for field in BILINGUAL_FIELDS:
        check_bilingual(label, field, item.get(field))

    if not isinstance(item.get("tags"), list):
        err(f"{label}: 'tags' must be an array")
    if not isinstance(item.get("defaultEnabled"), bool):
        err(f"{label}: 'defaultEnabled' must be a boolean")
    if not is_str(item.get("installPayload")):
        err(f"{label}: 'installPayload' missing or not a non-empty string")

    # Optional SDK applicability flag. Omitted ⇒ ["tuyaopen"]; when present
    # it must be a non-empty array of known SDK ids.
    sdks = item.get("sdks")
    if sdks is not None:
        if not isinstance(sdks, list) or not sdks or not all(s in SDKS for s in sdks):
            err(f"{label}: 'sdks' when present must be a non-empty array of {sorted(SDKS)}, got {sdks!r}")

    check_source(label, item)


def check_source(label: str, item: dict) -> None:
    source = item.get("source")
    if not isinstance(source, dict):
        err(f"{label}: 'source' must be an object")
        return

    has_local = "localPath" in source
    has_dev = source.get("devSkills") is True

    if "devSkills" in source and not isinstance(source["devSkills"], bool):
        err(f"{label}: 'source.devSkills' must be a boolean")

    if has_local and has_dev:
        err(f"{label}: 'source' must be exactly one of localPath or devSkills, not both")
        return
    if not has_local and not has_dev:
        err(f"{label}: 'source' must declare localPath")
        return

    if has_dev:
        err(
            f"{label}: 'source.devSkills' is no longer supported — TuyaOpen-dev-skills is "
            f"archived and this index no longer publishes a devSkillsRelease block, so the IDE "
            f"has no tarball to resolve it from. Put the payload under skills/ and use "
            f"source.localPath."
        )
        return

    # Local skill: dir must exist, installPayload must match localPath minus 'skills/'
    local_path = source.get("localPath")
    if not is_str(local_path):
        err(f"{label}: 'source.localPath' missing or not a non-empty string")
        return
    if not local_path.startswith("skills/"):
        err(f"{label}: source.localPath must begin with 'skills/', got {local_path!r}")
        return
    if not (REPO_ROOT / local_path).is_dir():
        err(f"{label}: source.localPath does not exist: {local_path}")
    elif not (REPO_ROOT / local_path / "SKILL.md").is_file():
        # Without this an entry can point at a parent directory: the payload
        # would install empty, and every real skill nested below it would be
        # excused by the orphan check as a "bundled sub-skill".
        err(f"{label}: source.localPath has no SKILL.md directly inside: {local_path}")

    # NOTE: until the 2026-08-14 reorg, this function also asserted that
    # local_path's second segment equalled item['surface'] ("embedded" /
    # "cloud" / "miniapp"), since the top level of skills/ used to be the
    # capability surface and the IDE copied skills/<surface>/ trees into its
    # cache one surface at a time. That reorg made the top level *product
    # line* instead — see skills/README.md's Layout section
    # — so 'surface' is now an orthogonal field with no directory it could
    # agree with (a tuyaopen-miniapp-* skill's surface is "miniapp" but it
    # lives under TuyaOpen/, by design). The check was removed rather than
    # updated because there is no longer any path segment to compare against;
    # it could only ever have been re-derived as "trivially true" or deleted.
    #
    # What replaces it are the two invariants the new layout actually rests on.
    # Deleting the old check without adding these would have left the reorg's
    # load-bearing rule — "id is the directory name" — with nothing enforcing
    # it, which is the whole reason the pre-reorg tree drifted into having three
    # different names per skill (directory, frontmatter `name`, and index `id`).
    segments = local_path.split("/")

    # 1. Top level under skills/ is TuyaOpen/, and nothing else.
    #    A typo ("Tuyaopen/") would otherwise install fine and only surface as a
    #    missing skill much later.
    if len(segments) > 1 and segments[1] not in PRODUCT_LINES:
        err(
            f"{label}: source.localPath must sit under one of "
            f"{sorted(PRODUCT_LINES)}, got {segments[1]!r} in {local_path!r}"
        )

    # 2. `id` IS the directory name — the rule that lets a human (or an agent
    #    copying a skill in by hand) derive one from the other, and that lets
    #    `.claude/skills/<id>/` be a one-level mirror without a flattening step.
    if len(segments) > 2 and is_str(item.get("id")) and segments[-1] != item["id"]:
        err(
            f"{label}: id {item['id']!r} must equal the payload directory name, "
            f"got {segments[-1]!r} in {local_path!r}"
        )

    expected_payload = re.sub(r"^skills/", "", local_path)
    if is_str(item.get("installPayload")) and item["installPayload"] != expected_payload:
        err(
            f"{label}: installPayload {item['installPayload']!r} does not match "
            f"localPath-derived {expected_payload!r}"
        )


def check_related(items: list, ids: set) -> None:
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        related = item.get("related")
        if related is None:
            continue
        label = f"item '{item.get('id', index)}'"
        if not isinstance(related, list):
            err(f"{label}: 'related' must be an array")
            continue
        for ref in related:
            if not is_str(ref):
                err(f"{label}: related entry must be a non-empty string, got {ref!r}")
            elif ref not in ids:
                err(f"{label}: related id {ref!r} does not resolve to a known item")


def check_requires(items: list, ids: set) -> None:
    """`requires[]` is a real install dependency edge (unlike `related[]`,
    which is display-only) — see manifestsTypes.ts's SkillManifestItem.requires
    docstring. Every entry must resolve, and a self-reference is always a
    mistake (the installer's cycle guard tolerates a cycle at runtime, but
    there is never a legitimate reason to author one directly here).
    """
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        requires = item.get("requires")
        if requires is None:
            continue
        label = f"item '{item.get('id', index)}'"
        if not isinstance(requires, list):
            err(f"{label}: 'requires' must be an array")
            continue
        for ref in requires:
            if not is_str(ref):
                err(f"{label}: requires entry must be a non-empty string, got {ref!r}")
            elif ref not in ids:
                err(f"{label}: requires id {ref!r} does not resolve to a known item")
            elif is_str(item.get("id")) and ref == item["id"]:
                err(f"{label}: 'requires' must not reference its own id")


def check_aliases(items: list, ids: set) -> None:
    """Old ids resolved by `skills install`/`uninstall` (see
    manifestsTypes.ts's SkillManifestItem.aliases docstring). An alias must
    never collide with a real id (ambiguous: which does the caller mean?) or
    with another item's alias (an old id can only ever mean one new id).
    """
    seen_aliases: dict[str, str] = {}
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        aliases = item.get("aliases")
        if aliases is None:
            continue
        item_id = item.get("id")
        label = f"item '{item_id if is_str(item_id) else index}'"
        if not isinstance(aliases, list):
            err(f"{label}: 'aliases' must be an array")
            continue
        for alias in aliases:
            if not is_str(alias):
                err(f"{label}: alias entry must be a non-empty string, got {alias!r}")
                continue
            if alias in ids:
                err(f"{label}: alias {alias!r} collides with a real item id")
                continue
            if is_str(item_id) and alias == item_id:
                err(f"{label}: alias {alias!r} equals its own item's id (redundant)")
                continue
            prior_owner = seen_aliases.get(alias)
            if prior_owner is not None and prior_owner != item_id:
                err(
                    f"{label}: alias {alias!r} is already claimed by item "
                    f"'{prior_owner}' — an old id must resolve to exactly one new id"
                )
                continue
            seen_aliases[alias] = item_id


# The ONLY subtree this validator governs.
#
# `skills/TuyaOS/` is the other product line. It carries its own
# `index.json` purely so its payloads have an owner, and **nothing reads it** —
# registry.json's skills domain points at skills/TuyaOpen/index.json, and
# .github/workflows/release.yml excludes skills/TuyaOS from the package. Every
# rule in this file describes a relationship with the `tuyaopen` CLI (the `cli`
# declaration, the single-valued `sdks`, the Shortcuts agreement), so applying
# them to TuyaOS skills would assert things that are meaningless there. Scoping
# by this constant is therefore not an exemption — the rules genuinely do not
# describe that tree. Before 2026-08-19 the scans below walked all of `skills/`,
# which was correct only while `skills/` held exactly one product line.
GOVERNED_SUBTREE = "TuyaOpen"


def check_orphan_skill_dirs(items: list) -> None:
    """Every skill payload on disk must be reachable from the index.

    A "top-level" skill dir is one holding a SKILL.md whose ancestors are not
    themselves referenced by the index — sub-skills bundled inside a parent
    (e.g. hardware-vibe-coding/peripheral-drivers/*) ship with the parent and
    are intentionally not indexed.

    This exists because tuyaopen-cli-debug and tuyaopen-crash-decode sat in the
    payload for months, shipped in every package, and were never installable
    because nothing referenced them.
    """
    referenced: dict[str, list[str]] = {}
    for item in items:
        if not isinstance(item, dict):
            continue
        local_path = (item.get("source") or {}).get("localPath")
        if is_str(local_path):
            referenced.setdefault(local_path.rstrip("/"), []).append(str(item.get("id")))

    for path, ids in sorted(referenced.items()):
        if len(ids) > 1:
            err(f"source.localPath {path!r} is claimed by multiple items: {', '.join(sorted(ids))}")

    skills_root = REPO_ROOT / "skills" / GOVERNED_SUBTREE
    for skill_md in sorted(skills_root.rglob("SKILL.md")):
        rel = skill_md.parent.relative_to(REPO_ROOT).as_posix()
        if rel in referenced:
            continue
        # Bundled inside an indexed parent skill? Then it is not an orphan.
        if any(rel.startswith(parent + "/") for parent in referenced):
            continue
        err(
            f"orphan skill payload: {rel} holds a SKILL.md but no index item references it "
            f"via source.localPath — it would ship in the package and never be installed"
        )


# Both separators: Windows instructions in SKILL.md legitimately use backslashes.
AGENT_SKILL_PATH_RE = re.compile(r"\.agents[/\\]skills[/\\]([A-Za-z0-9._-]+)")


def check_agent_skill_paths(ids: set) -> None:
    """Markdown must reference the INSTALLED path, which is `.agents/skills/<id>`.

    The IDE installs a skill to `path.join('.agents/skills', item.id)` — flat,
    keyed off the id, not off localPath/installPayload. `.agents/skills/tuyaopen/build/`
    is the old nested layout the IDE now repairs away from, so a SKILL.md telling
    the agent to run a script there sends it to a path that does not exist.
    """
    for md in sorted((REPO_ROOT / "skills" / GOVERNED_SUBTREE).rglob("*.md")):
        rel = md.relative_to(REPO_ROOT).as_posix()
        try:
            text = md.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as e:
            err(f"{rel}: unreadable as UTF-8: {e}")
            continue
        for lineno, line in enumerate(text.splitlines(), start=1):
            for segment in AGENT_SKILL_PATH_RE.findall(line):
                if segment not in ids:
                    err(
                        f"{rel}:{lineno}: '.agents/skills/{segment}' is not an installed skill "
                        f"path — the first segment must be an index item id (installs are flat: "
                        f".agents/skills/<id>)"
                    )


# Rule 3 support: the declaration (skills/index.json's cli.groups) and the
# body's `## Shortcuts` section must name the same groups, in both directions.
#
# `tuyaopen-shared` is the tos.py <-> tuyaopen mapping table itself (its §7),
# which by design points out nearly every command group, so the reverse
# direction (body mentions a group it did not declare) is exempted for it by
# name. The forward direction (declared but unused) still applies.
SHORTCUTS_REVERSE_EXEMPT = {"tuyaopen-shared"}

# `schema` is the catalogue-wide self-discovery idiom — nearly every skill's
# Shortcuts section has a "flags aren't listed here, run `tuyaopen schema get
# --group <g> --command <c>`" row or line, because that is how an agent looks
# up a command's flags without this doc hardcoding them (see the "don't
# hardcode the flag list" rule referenced from every skill: `tuyaopen-shared`
# § 5). That is advice about *finding* commands, not the skill's own task
# using the `schema` group as a dependency. Counting it would force ~27 of 28
# skills to declare `schema`, which would sit on nearly everything and stop
# distinguishing anything — the whole information value of the declaration is
# that it differs between skills. So `schema` is exempted from the *reverse*
# ("used but undeclared") direction only. Skills whose actual subject matter
# is schema introspection (`tuyaopen-skill-maker`, `tuyaopen-shared`) still
# get the *forward* check — if they declare `schema` but their Command column
# never has a `tuyaopen schema …` row, that still fires, because forward
# checking is untouched by this set.
GROUPS_EXEMPT_FROM_REVERSE_CHECK = {"schema"}

_SHORTCUTS_HEADING = re.compile(r"^##\s+Shortcuts\b", re.MULTILINE)
_NEXT_H2 = re.compile(r"^##\s+", re.MULTILINE)
_CLI_INVOCATION = re.compile(r"`?tuyaopen-cli\s+([a-z][a-z0-9-]*)")


def extract_shortcuts_section(body: str) -> "str | None":
    """Return the text of the `## Shortcuts` section, or None when absent.

    Scoped on purpose: a whole-body scan would force `tuyaopen-shared` to
    declare the seven-plus groups its §7 mapping table names, and would trip
    on every fallback blockquote or piece of prose that quotes an example
    command only to say not to use it (e.g. tuyaopen-embedded-build calling
    `tuyaopen config` "a different, unrelated command"). The section stops at
    the next `##` heading, not at end of file, so trailing sections (like the
    `## Other`/`> **No CLI?**` material below Shortcuts) are excluded too.
    """
    m = _SHORTCUTS_HEADING.search(body)
    if not m:
        return None
    rest = body[m.end():]
    nxt = _NEXT_H2.search(rest)
    return rest[: nxt.start()] if nxt else rest


def _is_table_separator_row(line: str) -> bool:
    """`|---|---|` (optionally with `:` alignment markers) — a GFM table's
    second row. Deliberately permissive about spacing/colon placement; the
    only thing that matters is "this row is punctuation, not content"."""
    stripped = line.strip()
    return bool(stripped) and "-" in stripped and set(stripped) <= set("-:| \t")


def extract_command_column_mentions(section: str) -> "list[str] | None":
    """Return every `tuyaopen <group>` mention found in the *Command* column
    of every markdown table inside `section`, or None when the section
    contains no such table at all.

    Rule 3's declaration is about what the skill *invokes* — only a table row
    under a literal "Command" header asserts that. Everything else that can
    appear in a real `## Shortcuts` section quotes a `tuyaopen <group>`
    command without asserting a dependency: the "flags aren't listed here,
    run `tuyaopen schema get …`" discovery line, the `> **No CLI?**` fallback
    blockquote (which names the *old* tool, but may quote a `tuyaopen`
    equivalent for contrast), and steering-away prose ("`tuyaopen config` is
    a different, unrelated command"). Scoping one level finer than the
    section — to the Command column specifically — removes all three false
    positive classes by construction, rather than by an exemption list that
    grows every time someone writes a sentence.

    None vs. `[]` matters: None means "no Command-column table found at all"
    (the section is prose-only, or its table uses different headers); `[]`
    means "a Command-column table exists but named no `tuyaopen` group in any
    row" (e.g. every row is `tos.py`-only). Both are treated as "nothing
    asserted" by the caller, but are surfaced as distinct error messages so a
    missing table isn't silently indistinguishable from an empty one.
    """
    lines = section.splitlines()
    found_table = False
    mentions: list[str] = []
    i = 0
    while i < len(lines) - 1:
        header_line = lines[i]
        sep_line = lines[i + 1]
        if header_line.strip().startswith("|") and _is_table_separator_row(sep_line):
            headers = [c.strip().lower() for c in header_line.strip().strip("|").split("|")]
            if "command" in headers:
                found_table = True
                col = headers.index("command")
                j = i + 2
                while j < len(lines) and lines[j].strip().startswith("|"):
                    cells = [c.strip() for c in lines[j].strip().strip("|").split("|")]
                    if col < len(cells):
                        mentions.extend(_CLI_INVOCATION.findall(cells[col]))
                    j += 1
                i = j
                continue
        i += 1
    return mentions if found_table else None


def check_shortcuts_agreement(skill_id: str, groups, body: str) -> list:
    """Rule 3: the declaration and the body's Shortcuts section must agree.

    `groups` is `item["cli"]["groups"]` — either the string "none" or a list
    of declared group names. Returns a list of error strings (does not touch
    the module-level `errors` accumulator, so it can be unit-tested directly).
    """
    out = []
    if groups == "none":
        if "No `tuyaopen-cli` CLI coverage" not in body:
            out.append(
                f"item {skill_id!r}: cli.groups is \"none\" but the body never says "
                f"``No `tuyaopen-cli` CLI coverage`` — the reader needs to see it too"
            )
        return out

    section = extract_shortcuts_section(body)
    if section is None:
        out.append(
            f"item {skill_id!r}: declares CLI groups but has no `## Shortcuts` section — "
            f"that section is the agent's entry point, not optional"
        )
        return out

    declared = set(groups)
    mentions = extract_command_column_mentions(section)
    if mentions is None:
        out.append(
            f"item {skill_id!r}: declares CLI groups but the `## Shortcuts` section has "
            f"no table with a `Command` column — that table's rows are the only place "
            f"the body asserts what it actually invokes"
        )
        mentioned: set = set()
    else:
        mentioned = set(mentions)

    for g in sorted(declared - mentioned):
        out.append(
            f"item {skill_id!r}: declares cli group {g!r} but no Shortcuts Command-column "
            f"row invokes `tuyaopen {g} …` — declared but unused"
        )
    if skill_id not in SHORTCUTS_REVERSE_EXEMPT:
        for g in sorted((mentioned & CLI_GROUPS) - declared - GROUPS_EXEMPT_FROM_REVERSE_CHECK):
            out.append(
                f"item {skill_id!r}: Shortcuts Command column invokes `tuyaopen {g} …` but "
                f"{g!r} is not in cli.groups — used but undeclared"
            )
    return out


def check_cli_declaration(items: list) -> None:
    """Every item must state its relationship to the `tuyaopen` CLI.

    Rule 1 (field required) exists because "not stating it" was an invisible
    state: measured 2026-08-17, three skills mentioned the CLI zero times and
    all three were among the nine that had never declared anything. Nothing
    could see it.

    Rule 2 (group names must be real) catches both a typo here and a rename in
    the CLI.

    Rule 3 (declaration agrees with the body's `## Shortcuts` section, see
    check_shortcuts_agreement) ties the two halves together: it reads each
    item's own SKILL.md (never anything under references/) and checks both
    directions — declared-but-unused and used-but-undeclared.
    """
    def run_shortcuts_check(item: dict, groups) -> None:
        local_path = (item.get("source") or {}).get("localPath")
        if not is_str(local_path):
            return
        md = REPO_ROOT / local_path / "SKILL.md"
        if not md.is_file():
            return
        for e in check_shortcuts_agreement(
            item.get("id", "?"), groups, md.read_text(encoding="utf-8")
        ):
            err(e)

    for item in items:
        label = f"item {item.get('id', '?')!r}"
        cli = item.get("cli")
        if not isinstance(cli, dict):
            err(f"{label}: missing 'cli' — declare the CLI groups it uses, or "
                f"{{\"groups\": \"none\", \"reason\": \"…\"}}")
            continue

        groups = cli.get("groups")
        if groups == "none":
            if not is_str(cli.get("reason")):
                err(f"{label}: cli.groups is \"none\" but there is no 'reason' — "
                    f"say why the CLI does not cover this skill")
            run_shortcuts_check(item, groups)
            continue

        if not isinstance(groups, list):
            err(f"{label}: cli.groups must be a list of group names, or the "
                f"string \"none\", got {groups!r}")
            continue
        if not groups:
            err(f"{label}: cli.groups is an empty list — declare real groups, or "
                f"use \"none\" with a reason")
            continue
        for g in groups:
            if not is_str(g):
                err(f"{label}: cli.groups entries must be strings, got {g!r}")
            elif g not in CLI_GROUPS:
                err(f"{label}: cli.groups names {g!r}, which is not a tuyaopen CLI "
                    f"group. Known: {', '.join(sorted(CLI_GROUPS))}")

        fallback = cli.get("fallback")
        if fallback is not None and not (
            isinstance(fallback, list) and all(is_str(f) for f in fallback)
        ):
            err(f"{label}: cli.fallback must be a list of tool names, got {fallback!r}")

        run_shortcuts_check(item, groups)


# --------------------------------------------------------------------------- #
# Frontmatter must actually PARSE as YAML                                      #
# --------------------------------------------------------------------------- #
# Added 2026-08-21 after a measured, silent, six-week-old catalogue defect.
#
# `tuyaopen-embedded-code-check`'s frontmatter carried:
#
#     compatibility:
#       - clang-format installed (Linux: `apt install clang-format`; …)
#
# A backtick cannot start a YAML plain scalar, so the whole document failed to
# parse. Every gate in this repo stayed green — none of them read the
# frontmatter — and the consequence only showed up in an agent tool: `agy`
# listed 16 of 17 globally-installed skills and said nothing about the 17th,
# and Claude Code fell back to the body's H1 in place of the description. A
# skill that does not parse is a skill that does not exist, and nothing
# anywhere reported it.
#
# Two oracles, deliberately:
#
#   * PyYAML when importable — the real parser, so no guessing about what is
#     legal. This is what CI gets.
#   * A narrow textual floor otherwise, so a machine without PyYAML still
#     catches THIS class rather than silently skipping the check. It only
#     inspects unquoted inline values and sequence items (never block-scalar
#     continuation lines, which is where all our prose lives) and only flags
#     the two things that actually broke: a leading YAML indicator character,
#     and an embedded ": " that turns a scalar into a nested mapping.
#
# The floor is a floor, not an equivalent: it is allowed to miss things PyYAML
# would catch. It is not allowed to report something PyYAML accepts, which is
# why it stays this narrow.

_FRONTMATTER_RE = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n", re.S)
# Characters that genuinely cannot open a plain scalar *and* are not a legal
# flow-collection opener. Deliberately NOT the full YAML indicator set: `[` and
# `{` open flow sequences/mappings, which this catalogue really does use
# (`tags: [a, b]`, `surfaces: [embedded]`), and the first draft of this floor
# flagged three of those as errors — i.e. it reported things PyYAML accepts,
# which is the one thing the note above says a floor may not do.
_YAML_INDICATORS = "`@%*&!"


def _yaml_floor_errors(text: str) -> "list[str]":
    """Textual fallback — see the module note above for its exact remit."""
    problems: "list[str]" = []
    in_block_scalar = False
    block_indent = 0
    for lineno, raw in enumerate(text.splitlines(), start=1):
        if not raw.strip():
            continue
        indent = len(raw) - len(raw.lstrip(" "))
        if in_block_scalar:
            # Still inside a `>-` / `|` body while more-indented than its key.
            if indent > block_indent:
                continue
            in_block_scalar = False
        m = re.match(r"^\s*([A-Za-z_][\w-]*):\s*(.*)$", raw)
        if m:
            value = m.group(2)
            if value[:1] in (">", "|"):
                in_block_scalar, block_indent = True, indent
                continue
            if value == "":
                continue  # key introducing a nested block/sequence
        else:
            seq = re.match(r"^\s*-\s+(.*)$", raw)
            if not seq:
                continue
            value = seq.group(1)
        value = value.strip()
        if not value or value[0] in "\"'":
            continue  # quoted — whatever is inside is the parser's business
        if value[0] in _YAML_INDICATORS:
            problems.append(
                f"line {lineno}: plain scalar starts with the reserved character "
                f"{value[0]!r} — quote the whole value: {raw.strip()[:90]}"
            )
        elif ": " in value:
            problems.append(
                f"line {lineno}: plain scalar contains ': ', which YAML reads as a "
                f"nested mapping — quote the whole value: {raw.strip()[:90]}"
            )
    return problems


def check_frontmatter_parses(items: list) -> None:
    """Every referenced SKILL.md must have frontmatter a YAML parser accepts."""
    try:
        import yaml  # type: ignore
    except ImportError:
        yaml = None  # noqa: N806 — fall through to the textual floor

    for item in items:
        local_path = (item.get("source") or {}).get("localPath")
        if not is_str(local_path):
            continue
        md = REPO_ROOT / local_path / "SKILL.md"
        if not md.is_file():
            continue
        label = f"item {item.get('id', '?')!r}"
        text = md.read_text(encoding="utf-8")
        m = _FRONTMATTER_RE.match(text)
        if not m:
            err(f"{label}: {local_path}/SKILL.md has no YAML frontmatter block")
            continue
        body = m.group(1)
        if yaml is not None:
            try:
                parsed = yaml.safe_load(body)
            except Exception as e:  # noqa: BLE001 — any parse failure is the finding
                first = str(e).splitlines()[0]
                err(f"{label}: {local_path}/SKILL.md frontmatter is not valid YAML: {first}")
                continue
            if not isinstance(parsed, dict):
                err(f"{label}: {local_path}/SKILL.md frontmatter parsed to "
                    f"{type(parsed).__name__}, expected a mapping")
            continue
        for p in _yaml_floor_errors(body):
            err(f"{label}: {local_path}/SKILL.md frontmatter {p}")


# The routing table's own path, relative to REPO_ROOT. `tuyaopen-shared` owns the
# single intent→skill map; every other skill points here instead of naming
# siblings, so a skill missing from it is only reachable by someone who already
# knows its id.
ROUTING_TABLE = "skills/TuyaOpen/tuyaopen-shared/references/ROUTING.md"


def check_routing_covers_opt_in(items: list) -> None:
    """Every `defaultEnabled: false` skill must be named in the routing table.

    Why only the opt-in half: a default-enabled skill is installed, so an agent
    tool loads it and can match its own `whenToUse` — it is discoverable whether
    or not the table mentions it. A skill that is NOT installed is invisible to
    passive discovery (the agent binds its skill roots at launch and never sees
    a directory that was never written), so the table is the only thing that can
    put its name in front of an agent that is not going to run
    `tuyaopen skills list --json` on its own.

    This gate exists because it had already failed silently:
    `tuyaopen-embedded-lvgl-simulator` was `defaultEnabled: false` and absent
    from ROUTING.md, which made it effectively offline — the catalogue held 29
    skills while the table listed 28, and nothing compared the two. The 2026-08
    regroup moves 9 skills into `scenario` (all opt-in), which multiplies that
    failure mode by nine, so it gets a gate rather than a habit.
    """
    table = REPO_ROOT / ROUTING_TABLE
    if not table.is_file():
        err(f"routing table not found at {ROUTING_TABLE} — `tuyaopen-shared` owns "
            f"the intent→skill map; this gate cannot verify opt-in skills without it")
        return
    text = table.read_text(encoding="utf-8")
    for item in items:
        if item.get("defaultEnabled"):
            continue
        sid = item.get("id")
        if not is_str(sid):
            continue
        # Backticked id is how every row spells it; require that exact form so a
        # passing mention inside prose does not count as a routing entry.
        if f"`{sid}`" not in text:
            err(f"item {sid!r}: defaultEnabled is false but the id is not in "
                f"{ROUTING_TABLE} — an opt-in skill absent from the routing table "
                f"is unreachable by passive discovery. Add a row, or make it "
                f"default-enabled.")


def main() -> int:
    index_path = Path(sys.argv[1]) if len(sys.argv) > 1 else REPO_ROOT / "skills" / "TuyaOpen" / "index.json"
    if not index_path.is_file():
        print(f"✗ index file not found: {index_path}", file=sys.stderr)
        return 1

    try:
        data = json.loads(index_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"✗ {index_path}: invalid JSON: {e}", file=sys.stderr)
        return 1

    if not isinstance(data, dict):
        print(f"✗ {index_path}: top-level must be a JSON object", file=sys.stderr)
        return 1

    check_top_level(data)
    check_dev_skills_release(data.get("devSkillsRelease"))

    items = data.get("items") if isinstance(data.get("items"), list) else []
    seen_ids: set = set()
    for index, item in enumerate(items):
        check_item(item, index, seen_ids)
    check_related(items, seen_ids)
    check_requires(items, seen_ids)
    check_aliases(items, seen_ids)
    check_orphan_skill_dirs(items)
    check_agent_skill_paths(seen_ids)
    check_cli_declaration(items)
    check_frontmatter_parses(items)
    check_routing_covers_opt_in(items)

    if errors:
        print(f"✗ {index_path}: {len(errors)} problem(s) found:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    print(f"✓ {index_path}: OK ({len(items)} items validated)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
