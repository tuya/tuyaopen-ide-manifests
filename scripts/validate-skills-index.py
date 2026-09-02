#!/usr/bin/env python3
"""Validate skills/index.json structure and references.

Checks (all local / deterministic, no network):
  - JSON parses and required top-level keys exist with correct types
  - devSkillsRelease is optional and no longer published; when present its fields are checked
  - Each item has required fields with correct types
  - Every item carries a well-formed 'version' (x.y.z semver, numeric parts)
  - Bilingual fields (name/summary/whenToUse) carry both 'en' and 'zh-CN'
  - 'id' is unique; 'surface' is one of the known surfaces
  - 'source' must be {localPath}; {devSkills + subpath} is rejected (dev-skills is archived)
  - For local skills: source.localPath holds a SKILL.md, sits under skills/<group>/,
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
    group the section invokes is declared (tuyaopen-start is exempt from the
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
# Install group — the unit `tuyaopen-cli skills install --group <g>` offers, so
# a user picks among five groups instead of 32 individual skills. **Since
# 2026-09-02 it is also the payload directory**: `skills/<group>/<id>/`.
#
# **A second axis, not a replacement for `surface`**, and the two deliberately
# disagree — measured, 11 of 32 items today. `surface` drives the IDE's filter
# tabs ("which end of the product is this about"); `group` drives installs
# ("what am I setting out to do"). `tuyaopen-start` is surface=embedded but
# group=core; every `tuyaopen-miniapp-*-panel` playbook is surface=miniapp but
# group=scenario. Because the directory is now the group, **nothing may infer a
# surface from a path** — the rule in check_source() compares the path to
# `group`, never to `surface`.
#
# - core / embedded / cloud / miniapp — grouped by capability.
# - scenario — grouped by **product category** instead: the lamp / socket /
#   robot-vacuum / IPC playbooks a developer installs exactly one of. Not named
#   after miniapp even though every member is one today, because embedded
#   per-category skills are expected here too; when they arrive, `surface`
#   keeps telling the IDE which tab they belong in.
#
# `cloud` was called `product` until 2026-09-02. Do NOT confuse this rename
# with `cli.groups`, which names **tuyaopen-cli command groups** — there, the
# string `"product"` is the `tuyaopen-cli product` command group and is still
# correct on the two items that declare it. Same word, two vocabularies.
#
# Required on every item: an ungrouped item is one no group-install can ever
# reach, and now also one with no directory to live in.
GROUPS = {"core", "embedded", "cloud", "miniapp", "scenario"}
# SDK applicability. **This field, not the directory, is what separates the two
# product lines** (2026-09-02). Optional per item; omitted ⇒ ["tuyaopen"].
#
# Until now the separation was a path — `skills/TuyaOpen/` vs `skills/TuyaOS/` —
# backed by three independent mechanisms (registry.json's skills url, release.yml
# deleting the other tree, and a GOVERNED_SUBTREE constant here). All three are
# gone: one index covers both lines, the payloads ship together, and every
# consumer decides what applies to it by reading `sdks`. The rules below that
# describe a *relationship with the tuyaopen CLI* are therefore scoped by
# `applies_to_tuyaopen()` rather than by subtree — which is the same scoping the
# subtree used to buy, expressed against the field that actually states it.
SDKS = {"tuyaopen", "tuyaos"}
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

    # Two invariants, and the layout rests on both.
    #
    # History, because this file has held all three answers: pre-2026-08-14 the
    # top level was the capability surface and rule 1 below existed; the
    # 2026-08-14 reorg made it the *product line*, so rule 1 was deleted as
    # having nothing to compare against; 2026-09-02 moved the product-line
    # distinction into `sdks` and gave the directory back to the surface, so
    # rule 1 is here again — now with the equality check the first version
    # never had. Rule 2 has been continuous throughout, and is the one that
    # matters most: without it the tree drifts back into three different names
    # per skill (directory, frontmatter `name`, index `id`), which is exactly
    # what the pre-reorg tree did.
    #
    # `installPayload` is not a third fact — it is `localPath` minus `skills/`,
    # asserted below, so the two segments it carries are the same two checked
    # here. That two-ness is load-bearing downstream: the IDE's cache prune
    # (`skillsSync.ts`'s pruneOrphanCacheDirs) reads two levels, and would
    # delete the whole cache if a payload were a SINGLE segment. Deeper is
    # tolerated (it under-prunes), so the floor is two, not the exact count.
    segments = local_path.split("/")

    # 1. Top level under skills/ is the install GROUP, and it must agree with
    #    the item's own `group`. A typo ("embeded/") would otherwise install
    #    fine and only show up as a missing skill much later.
    #
    #    Group, not surface: `group` is the unit a user installs
    #    (`skills install --group <g>`), so grouping the tree the same way puts
    #    a whole install unit in one directory. `surface` stays an orthogonal
    #    field driving the IDE's filter tabs, and the two disagree for 11 of the
    #    32 items today — e.g. every `tuyaopen-miniapp-*-panel` playbook is
    #    surface=miniapp but group=scenario. Nothing may infer one from the
    #    other, or from the path.
    if len(segments) > 1 and segments[1] not in GROUPS:
        err(
            f"{label}: source.localPath must sit under one of "
            f"{sorted(GROUPS)}, got {segments[1]!r} in {local_path!r}"
        )
    elif len(segments) > 1 and item.get("group") in GROUPS and segments[1] != item["group"]:
        err(
            f"{label}: source.localPath sits under {segments[1]!r} but 'group' "
            f"says {item['group']!r} — the directory IS the group"
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

    **It must also not cross the product line** (2026-09-02). While the two
    lines had separate index files a cross-line `requires` was unwritable; one
    merged index makes it expressible, and it would resolve here and then
    silently do nothing in the product — every consumer filters on `sdks`
    before the installer sees the list, so the dependency would be dropped and
    the "brought in transitively" promise quietly broken with no error anywhere.
    A prevention lock: zero such edges exist today, so a hit is always new.
    """
    by_id = {i.get("id"): i for i in items if isinstance(i, dict) and is_str(i.get("id"))}
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
            elif applies_to_tuyaopen(item) != applies_to_tuyaopen(by_id.get(ref, {})):
                err(
                    f"{label}: requires id {ref!r}, which belongs to the other "
                    f"product line ('sdks' differs). Consumers filter on 'sdks' "
                    f"before the installer runs, so this edge would resolve here "
                    f"and then be silently dropped."
                )


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


def applies_to_tuyaopen(item: dict) -> bool:
    """Does this item belong to the TuyaOpen product line?

    The scope four rules below need, and the reason `sdks` exists. Some rules
    here describe a *relationship with the `tuyaopen` CLI* — the `cli`
    declaration, the Shortcuts agreement, the routing table, the trigger
    coverage. Asserting those about a TuyaOS skill would assert something
    meaningless: there is no `tuyaopen-cli` command group for it to name and no
    `tuyaopen-start` routing table it belongs in.

    Until 2026-09-02 the same scope was bought with a path (`GOVERNED_SUBTREE =
    "TuyaOpen"`, two `rglob`s rooted at it). That worked only because the two
    lines lived in separate directories and only one of them shipped. Both now
    live in one tree and both ship, so the question "which line is this?" has to
    be asked of the data that states it. Omitted `sdks` still means
    `["tuyaopen"]`, matching `sdkAppliesToItem()` on the IDE side — the two
    defaults must not drift apart, since a disagreement would make an item the
    validator governs invisible to the product, or the reverse.
    """
    sdks = item.get("sdks")
    if not isinstance(sdks, list) or not sdks:
        return True
    return "tuyaopen" in sdks


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

    skills_root = REPO_ROOT / "skills"
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
    for md in sorted((REPO_ROOT / "skills").rglob("*.md")):
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
# `tuyaopen-start` is the tos.py <-> tuyaopen mapping table itself (its §7),
# which by design points out nearly every command group, so the reverse
# direction (body mentions a group it did not declare) is exempted for it by
# name. The forward direction (declared but unused) still applies.
SHORTCUTS_REVERSE_EXEMPT = {"tuyaopen-start"}

# `schema` is the catalogue-wide self-discovery idiom — nearly every skill's
# Shortcuts section has a "flags aren't listed here, run `tuyaopen schema get
# --group <g> --command <c>`" row or line, because that is how an agent looks
# up a command's flags without this doc hardcoding them (see the "don't
# hardcode the flag list" rule referenced from every skill: `tuyaopen-start`
# § 5). That is advice about *finding* commands, not the skill's own task
# using the `schema` group as a dependency. Counting it would force ~27 of 28
# skills to declare `schema`, which would sit on nearly everything and stop
# distinguishing anything — the whole information value of the declaration is
# that it differs between skills. So `schema` is exempted from the *reverse*
# ("used but undeclared") direction only. Skills whose actual subject matter
# is schema introspection (`tuyaopen-skill-maker`, `tuyaopen-start`) still
# get the *forward* check — if they declare `schema` but their Command column
# never has a `tuyaopen schema …` row, that still fires, because forward
# checking is untouched by this set.
GROUPS_EXEMPT_FROM_REVERSE_CHECK = {"schema"}

_SHORTCUTS_HEADING = re.compile(r"^##\s+Shortcuts\b", re.MULTILINE)
_NEXT_H2 = re.compile(r"^##\s+", re.MULTILINE)
_CLI_INVOCATION = re.compile(r"`?tuyaopen-cli\s+([a-z][a-z0-9-]*)")


def extract_shortcuts_section(body: str) -> "str | None":
    """Return the text of the `## Shortcuts` section, or None when absent.

    Scoped on purpose: a whole-body scan would force `tuyaopen-start` to
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
            f"row invokes `tuyaopen-cli {g} …` — declared but unused"
        )
    if skill_id not in SHORTCUTS_REVERSE_EXEMPT:
        for g in sorted((mentioned & CLI_GROUPS) - declared - GROUPS_EXEMPT_FROM_REVERSE_CHECK):
            out.append(
                f"item {skill_id!r}: Shortcuts Command column invokes `tuyaopen-cli {g} …` but "
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
        if not applies_to_tuyaopen(item):
            continue
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


# The routing table's own path, relative to REPO_ROOT. `tuyaopen-start` owns the
# single intent→skill map; every other skill points here instead of naming
# siblings, so a skill missing from it is only reachable by someone who already
# knows its id.
ROUTING_TABLE = "skills/core/tuyaopen-start/references/ROUTING.md"


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
        err(f"routing table not found at {ROUTING_TABLE} — `tuyaopen-start` owns "
            f"the intent→skill map; this gate cannot verify opt-in skills without it")
        return
    text = table.read_text(encoding="utf-8")
    for item in items:
        if item.get("defaultEnabled") or not applies_to_tuyaopen(item):
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



def check_resident_descriptions_cover_triggers(items: list) -> None:
    """Every opt-in skill's `triggers` must appear in some INSTALLED skill's
    frontmatter description.

    The routing table above answers "can an agent that already opened
    `tuyaopen-start` find this skill". This answers the earlier question:
    **will anything be selected at all** when the user's first sentence arrives.

    An agent tool loads only the installed skills' frontmatter. If a cold intent
    matches none of them, there is no first hop — the routing table is never
    read, `skills read` is never called, and the whole pull-on-demand design
    never starts. So the resident descriptions have to cover the intent space,
    and "cover" has to be checkable rather than asserted.

    Mechanism, and why it is shaped this way:

    * `triggers` lives in `index.json` (machine data, like `cli`), but is
      checked against the payload **frontmatter**, because that is the only text
      a loader reads. `index.json`'s own `summary`/`whenToUse` are separately
      maintained prose that no agent tool ever sees — an earlier draft of this
      gate checked those and would have passed while the real descriptions
      covered nothing.
    * Substring match, deliberately: Chinese has no word boundaries, so a
      tokenizing check would be less reliable, not more.

    Known limitation, stated rather than hidden: a trigger also counts when it
    appears in a steering-*away* sentence ("屏幕不在本技能范围"). That makes this
    gate a floor, not a proof. It still catches the failure that matters — a
    keyword surface that is nowhere in the resident set at all.
    """
    resident = [i for i in items
                if i.get("defaultEnabled") and is_str(i.get("id")) and applies_to_tuyaopen(i)]
    if not resident:
        err("no defaultEnabled skills — nothing would be loaded by any agent tool")
        return

    blob = ""
    for item in resident:
        payload = item.get("installPayload")
        if not is_str(payload):
            continue
        body = REPO_ROOT / "skills" / payload / "SKILL.md"
        if not body.is_file():
            err(f"item {item['id']!r}: defaultEnabled but {payload}/SKILL.md is missing")
            continue
        text = body.read_text(encoding="utf-8")
        m = re.match(r"---\n(.*?)\n---", text, re.S)
        if not m:
            err(f"item {item['id']!r}: {payload}/SKILL.md has no frontmatter — "
                f"an agent tool would load nothing for it")
            continue
        blob += m.group(1).lower() + "\n"

    for item in items:
        if item.get("defaultEnabled") or not applies_to_tuyaopen(item):
            continue
        sid, triggers = item.get("id"), item.get("triggers")
        if not is_str(sid):
            continue
        if triggers is None:
            err(f"item {sid!r}: defaultEnabled is false but declares no 'triggers'. "
                f"List the words a user's first sentence would contain for this "
                f"skill; they must appear in some installed skill's description, "
                f"or nothing will be selected and this skill is unreachable.")
            continue
        if not isinstance(triggers, list) or not triggers:
            err(f"item {sid!r}: 'triggers' must be a non-empty array")
            continue
        missing = [t for t in triggers
                   if not is_str(t) or t.strip().lower() not in blob]
        if missing:
            err(f"item {sid!r}: trigger(s) {missing} appear in NO installed skill's "
                f"frontmatter. A user opening with one of those words matches "
                f"nothing, so the routing table is never reached. Widen a resident "
                f"description, or drop the trigger.")




# --------------------------------------------------------------------------
# Attachments must have an exit
# --------------------------------------------------------------------------

#: Markdown headings that count as "this file tells you where to go next".
#: Matched case-insensitively against the whole file, not just headings, so a
#: bolded lead-in works as well as a `##`.
_EXIT_MARKERS = (
    "next:",
    "## next",
    "下一步",
    "next step",
)


def check_attachments_have_exit(items: list) -> None:
    """Every `ops/*.md` attachment must say where the workflow goes next.

    An agent that reaches a skill through an attachment reads that file and
    stops there: attachments are leaves, and a leaf with no exit is where a
    workflow silently ends.

    Measured, beta round 6: the agent fetched `tuyaopen-cloud/ops/manage-dp.md`
    to create DPs, and that file ended with a Troubleshooting table. The two
    steps that had to follow — `dp generate`, and creating the phone panel —
    were named in `tuyaopen-workflow-product-dev`, a skill that agent never
    loaded, because the routing table correctly sent "create product / DPs" to
    `tuyaopen-cloud`. Two doors into the same room; only one had exit signs.
    The product shipped with a hand-written DP header and no panel at all.

    Scope is deliberately narrow — `ops/` only. Those are the
    do-a-platform-operation attachments, i.e. exactly the ones an agent lands on
    mid-workflow. A `references/` file is lookup material and may legitimately
    just end.
    """
    for item in items:
        # Scoped like the four CLI-relationship rules above: the exit this
        # demands is a `tuyaopen-cli` command or a TuyaOpen skill, neither of
        # which means anything for the other product line. No TuyaOS payload has
        # an `ops/` dir today, so this is a latent-only correction — which is
        # exactly when to make it, rather than after the first one does.
        if not applies_to_tuyaopen(item):
            continue
        local_path = (item.get("source") or {}).get("localPath")
        if not is_str(local_path):
            continue
        ops_dir = REPO_ROOT / local_path / "ops"
        if not ops_dir.is_dir():
            continue
        for md in sorted(ops_dir.glob("*.md")):
            try:
                body = md.read_text(encoding="utf-8").lower()
            except OSError as e:
                errors.append(f"{item.get('id')}: cannot read {md.name}: {e}")
                continue
            if not any(marker in body for marker in _EXIT_MARKERS):
                errors.append(
                    f"{item.get('id')}: ops/{md.name} has no next-step section. "
                    f"An agent that arrives here reads this file and stops. "
                    f"End it with a 'Next:' / '下一步' section naming the "
                    f"command(s) or skill that follow."
                )


def main() -> int:
    index_path = Path(sys.argv[1]) if len(sys.argv) > 1 else REPO_ROOT / "skills" / "index.json"
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
    check_resident_descriptions_cover_triggers(items)
    check_attachments_have_exit(items)

    if errors:
        print(f"✗ {index_path}: {len(errors)} problem(s) found:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    print(f"✓ {index_path}: OK ({len(items)} items validated)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
