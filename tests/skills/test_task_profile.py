"""Breaking catalogue migration stays opt-in, preserves payloads and validates."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import pytest

REPO = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('task_profile', REPO/'scripts/build-task-skills-profile.py')
profile = importlib.util.module_from_spec(spec)
spec.loader.exec_module(profile)


def test_profile_preserves_legacy_and_unique_resources(tmp_path):
    original = (REPO/'skills/index.json').read_bytes()
    out = tmp_path/'profile'
    index = profile.build(out)
    assert (REPO/'skills/index.json').read_bytes() == original
    ids = {i['id'] for i in index['items']}
    assert len(ids) == 19 and not ids & profile.RETIRED
    for sdk, expected in [('tuyaopen', profile.BASE), ('tuyaos', profile.TUYAOS)]:
        defaults = {i['id'] for i in index['items'] if i['defaultEnabled'] and sdk in i.get('sdks', ['tuyaopen'])}
        assert defaults == expected
    old = REPO/'skills/miniapp/miniapp-development-workflow'
    for name in ['scripts/fetch_doc.py','scripts/search_help.py']:
        assert (out/'skills/miniapp/tuyaopen-miniapp'/name).read_text() == (old/name).read_text().replace('miniapp-development-workflow', 'tuyaopen-miniapp')
    validator = (out/'skills/miniapp/tuyaopen-miniapp/scripts/validate.mjs').read_text()
    assert 'Unpacked dist/ size' in validator and 'target upload requirements NOT VERIFIED' in validator
    migrations = json.loads((out/'payload-migrations.json').read_text())
    mapped = {x['from'] for x in migrations}
    legacy = json.loads(original)
    for item in legacy['items']:
        if item['id'] in profile.RETIRED:
            assert all(str(f.relative_to(REPO)) in mapped for f in (REPO/item['source']['localPath']).rglob('*') if f.is_file() and '__pycache__' not in f.parts and f.suffix != '.pyc')
    assert len(list((out/'skills').rglob('SKILL.md'))) == 19
    assert not list(out.rglob('*.pyc'))
    driver_index = (out/'skills/embedded/tuyaos-hardware-vibe-coding/peripheral-drivers/reference.md').read_text()
    assert 'matching `reference.md`' in driver_index
    assert 'matching `SKILL.md`' not in driver_index
    checklist = (out/'skills/miniapp/tuyaopen-miniapp/references/upload-checklist.md').read_text()
    assert all(x in checklist for x in ['packagePath', 'biz', 'sign', 'random'])
    assert 'only package value' not in checklist
    debug = (out/'skills/embedded/tuyaopen-embedded-cli-debug/references/CLI_DEBUG.md').read_text()
    assert 'clean -f && tos.py build && tos.py flash' not in debug
    result = subprocess.run([sys.executable, str(REPO/'scripts/validate-skills-index.py'), str(out/'skills/index.json')], capture_output=True, text=True)
    assert result.returncode == 0, result.stdout + result.stderr
    with pytest.raises(ValueError, match='never overwrite'):
        profile.build(out)


def test_refuses_repository_and_ancestors():
    for output in [REPO, REPO.parent]:
        with pytest.raises(ValueError, match='cannot replace'):
            profile.build(output)


def test_new_unmapped_retired_resource_fails(tmp_path, monkeypatch):
    import shutil
    source = tmp_path/'source'
    shutil.copytree(REPO/'skills', source/'skills', ignore=shutil.ignore_patterns('__pycache__','*.pyc'))
    shutil.copytree(REPO/'task-skills', source/'task-skills')
    shutil.copytree(REPO/'docs', source/'docs')
    shutil.copy2(REPO/'registry.json', source/'registry.json')
    (source/'skills/core/tuyaopen-start/new-reference.md').write_text('Unique new knowledge')
    monkeypatch.setattr(profile, 'REPO', source)
    with pytest.raises(ValueError, match='Missing explicit retired-file disposition'):
        profile.build(tmp_path/'out')
