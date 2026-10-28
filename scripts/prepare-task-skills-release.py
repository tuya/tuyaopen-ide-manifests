#!/usr/bin/env python3
"""Prepare an isolated tasks-v2 release package; never publish or change latest."""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path

from release_contract import build_release_manifest, validate_ide_support, validate_version, write_release_manifest

REPO = Path(__file__).resolve().parents[1]
# IDE v1.0.1 still requires tuyaopen-start, as verified against its tagged
# client in the compatibility matrix. Future compatible versions must be newer.
LAST_KNOWN_INCOMPATIBLE_IDE = (1, 0, 1)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True, help='New directory outside the source tree')
    parser.add_argument('--version', required=True, help='Manifest release version, strict X.Y.Z')
    parser.add_argument('--min-ide-version', required=True, help='First compatible released IDE, inclusive')
    parser.add_argument('--max-ide-version', required=True, help='First unsupported IDE, exclusive')
    args = parser.parse_args()
    validate_version(args.version, 'version')
    support = validate_ide_support({'minVersion': args.min_ide_version, 'maxVersionExclusive': args.max_ide_version})
    if tuple(map(int, support['minVersion'].split('.'))) <= LAST_KNOWN_INCOMPATIBLE_IDE:
        raise ValueError('minimum IDE version must be newer than 1.0.1, which still requires tuyaopen-start')
    output = args.output.resolve()
    if output.is_relative_to(REPO.resolve()):
        raise ValueError('output must be outside the manifests source tree')
    if output.exists():
        raise FileExistsError(f'output already exists: {output}')

    with tempfile.TemporaryDirectory(prefix='tuya-task-release-') as temp:
        tmp = Path(temp)
        staging = tmp / 'staging'
        subprocess.run([sys.executable, str(REPO / 'scripts/build-task-skills-profile.py'),
                        '--output', str(staging)], check=True)
        for name in ('boards-and-chips', 'demos', 'platforms', 'miniapp-templates'):
            source = REPO / name
            if source.is_dir():
                shutil.copytree(source, staging / name)
        archive = tmp / 'manifests.tar.gz'
        with tarfile.open(archive, 'w:gz') as tar:
            for child in sorted(staging.iterdir()):
                tar.add(child, arcname=child.name)
        payload = archive.read_bytes()
        metadata = tmp / 'release-metadata.json'
        metadata.write_text(json.dumps({'ideSupport': support}), encoding='utf-8')
        release = build_release_manifest(tag=f'v{args.version}', version=args.version,
                                         sha256=hashlib.sha256(payload).hexdigest(), size=len(payload),
                                         registry_path=staging / 'registry.json', metadata_path=metadata)
        output.mkdir(parents=True, exist_ok=False)
        shutil.copyfile(archive, output / 'manifests.tar.gz')
        write_release_manifest(release, output / 'release.json')
    print(f'Prepared {output}; no assets were published and latest was not changed.')


if __name__ == '__main__':
    main()
