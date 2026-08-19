"""The `sdks` rule, in one place.

`sdks` tells the two TuyaOpen IDE product lines apart inside this one repo: an
entry applies to exactly the lines it names, and the IDE filters every catalogue
page by the line the running build is.

**Naming no line is an error, not a default.** From IDE 1.0.1 on, an entry whose
`sdks` is missing or empty is hidden from *both* products — it renders nowhere,
in no build, and the only trace is a warning in the IDE's log that an end user
never sees. Before that the IDE admitted such an entry everywhere while this
repo's README documented it as `["tuyaopen"]`; the contradiction was resolved
against both readings (see the IDE repo's finding CY, 2026-08-19), so this file
is now the authority and the schema has no default to fall back on.

That makes the field's absence exactly the kind of mistake CI has to catch here:
by the time it reaches a user, the symptom is "a board I added is not in the
list" with nothing anywhere to explain it.

Imported by `validate-sdk-applicability.py` (all four domains) and by
`validate-skills-index.py` (its own domain), so the two entry points cannot
drift into two different rules.
"""

from __future__ import annotations

# The line ids a catalogue entry may name. Same set as the IDE's `ProductLine`
# union (`src/core/product/productLine.ts`); adding a third line is a change in
# both repos, and this list is the one this repo validates against.
SDKS = ("tuyaopen", "tuyaos")

# Index files whose *top-level* items the IDE filters by `sdks`. Everything else
# in this repo is out of scope on purpose:
#   - `peripheral-templates/index.json` and `miniapp-templates/*.json` are not
#     manifest domains and carry no per-entry SDK applicability;
#   - detail files (`boards-and-chips/board/*.json`, platform pinouts, …) are
#     reached only through an index entry that has already been filtered.
DOMAIN_INDEXES = {
    "platforms": "platforms/index.json",
    "boardsAndChips": "boards-and-chips/index.json",
    "demos": "demos/index.json",
    "skills": "skills/index.json",
}

_CONSEQUENCE = (
    "an entry that names no product line is hidden from every IDE build "
    "(TuyaOpen and TuyaOS alike) with no user-visible error"
)


def label_for(item: object, index: int) -> str:
    """`item 'id'`, or the position when the entry is too broken to have one."""
    if isinstance(item, dict):
        item_id = item.get("id")
        if isinstance(item_id, str) and item_id.strip():
            return f"item '{item_id}'"
    return f"items[{index}]"


def check_item_sdks(item: object, index: int) -> list[str]:
    """Errors for one entry's `sdks`. Empty list when it is well-formed."""
    label = label_for(item, index)
    if not isinstance(item, dict):
        return [f"{label}: must be an object"]

    if "sdks" not in item:
        return [
            f"{label}: 'sdks' is required — {_CONSEQUENCE}. "
            f"Add the line(s) this entry belongs to, e.g. \"sdks\": [\"tuyaopen\"]"
        ]

    sdks = item["sdks"]
    if not isinstance(sdks, list):
        return [f"{label}: 'sdks' must be an array of {list(SDKS)}, got {sdks!r}"]
    if not sdks:
        return [
            f"{label}: 'sdks' is an empty array — {_CONSEQUENCE}. "
            f"An empty array is not 'applies to all': name the line(s) explicitly"
        ]

    errors: list[str] = []
    unknown = [s for s in sdks if s not in SDKS]
    if unknown:
        errors.append(
            f"{label}: 'sdks' names unknown line(s) {unknown!r}; allowed: {list(SDKS)}. "
            f"A misspelt line ({'tuyaOS'!r} for {'tuyaos'!r}, say) hides the entry "
            f"from both products just as effectively as omitting the field"
        )
    if len(set(sdks)) != len(sdks):
        errors.append(f"{label}: 'sdks' repeats a line: {sdks!r}")
    return errors


def check_items(items: object, domain: str = "") -> list[str]:
    """Errors for every entry in one domain's `items` array."""
    prefix = f"{domain}: " if domain else ""
    if not isinstance(items, list):
        return [f"{prefix}'items' must be an array"]
    return [f"{prefix}{e}" for i, item in enumerate(items) for e in check_item_sdks(item, i)]
