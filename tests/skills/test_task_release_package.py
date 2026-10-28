import hashlib
import json
import subprocess
import sys
import tarfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SCRIPT = REPO / 'scripts/prepare-task-skills-release.py'


def test_task_release_isolated_from_default_and_version_gated(tmp_path):
    target = tmp_path / 'release'
    before = (REPO / 'skills/index.json').read_bytes()
    subprocess.run([sys.executable, str(SCRIPT), '--output', str(target), '--version', '1.2.3',
                    '--min-ide-version', '1.0.2', '--max-ide-version', '9.9.9'], check=True)
    meta = json.loads((target / 'release.json').read_text())
    archive = (target / 'manifests.tar.gz').read_bytes()
    assert meta['ideSupport'] == {'minVersion': '1.0.2', 'maxVersionExclusive': '9.9.9'}
    assert meta['package']['sha256'] == hashlib.sha256(archive).hexdigest()
    assert meta['package']['size'] == len(archive)
    with tarfile.open(target / 'manifests.tar.gz') as tar:
        index = json.load(tar.extractfile('skills/index.json'))
        registry = json.load(tar.extractfile('registry.json'))
        assert index['profile'] == 'tasks-v2'
        assert len(index['items']) == 19
        assert 'tuyaopen-start' not in {item['id'] for item in index['items']}
        assert meta['domains']['skills']['version'] == registry['manifests']['skills']['version']
        assert 'boards-and-chips/index.json' in tar.getnames()
        assert 'demos/index.json' in tar.getnames()
    assert (REPO / 'skills/index.json').read_bytes() == before


def test_requires_explicit_compatibility_range_and_new_destination(tmp_path):
    target = tmp_path / 'existing'
    target.mkdir()
    sentinel = target / 'sentinel'
    sentinel.write_text('keep')
    result = subprocess.run([sys.executable, str(SCRIPT), '--output', str(target), '--version', '1.2.3',
                             '--min-ide-version', '1.0.2', '--max-ide-version', '9.9.9'])
    assert result.returncode != 0
    assert sentinel.read_text() == 'keep'
    result = subprocess.run([sys.executable, str(SCRIPT), '--output', str(tmp_path / 'invalid'), '--version', '1.2.3',
                             '--min-ide-version', '1.2.3', '--max-ide-version', '1.0.0'])
    assert result.returncode != 0


def test_rejects_minimum_that_admits_the_legacy_ide(tmp_path):
    target = tmp_path / 'release'
    result = subprocess.run([sys.executable, str(SCRIPT), '--output', str(target), '--version', '1.2.3',
                             '--min-ide-version', '1.0.1', '--max-ide-version', '9.9.9'])
    assert result.returncode != 0
    assert not target.exists()
