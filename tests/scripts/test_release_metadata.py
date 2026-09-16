import json
import re
from pathlib import Path


ROOT = Path(__file__).parents[2]
STRICT = re.compile(r"^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$")


def _support():
    data = json.loads((ROOT / "release-metadata.json").read_text())
    return data["ideSupport"]


def test_release_metadata_is_strict_and_increasing():
    support = _support()
    assert STRICT.fullmatch(support["minVersion"])
    assert STRICT.fullmatch(support["maxVersionExclusive"])
    assert tuple(map(int, support["minVersion"].split("."))) < tuple(
        map(int, support["maxVersionExclusive"].split("."))
    )


def test_current_release_embeds_identical_support():
    support = _support()
    release = json.loads((ROOT / "release.json").read_text())
    assert release["ideSupport"] == support
