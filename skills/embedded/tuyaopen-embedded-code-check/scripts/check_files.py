#!/usr/bin/env python3
"""Check C/C++ files using SDK rules, including apps outside the SDK checkout."""
import argparse
import importlib.util
import os
from pathlib import Path
import subprocess
import sys


def find_repo_root():
    root = os.environ.get('OPEN_SDK_ROOT', '')
    if root and (Path(root) / '.clang-format').is_file():
        return root
    for directory in (Path.cwd(), *Path.cwd().parents):
        if (directory / '.clang-format').is_file():
            return str(directory)
    return ''


def checked_files(project_root, files):
    result = []
    for supplied in files:
        candidate = (Path(supplied) if Path(supplied).is_absolute()
                     else project_root / supplied).resolve()
        try:
            candidate.relative_to(project_root)
        except ValueError:
            raise ValueError('File path outside project root: ' + supplied)
        if not candidate.is_file():
            raise ValueError('File does not exist: ' + supplied)
        if candidate.suffix not in ('.c', '.cpp', '.h', '.hpp', '.cc', '.cxx'):
            raise ValueError('Not a C/C++ file: ' + supplied)
        result.append(str(candidate))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sdk-root', default=find_repo_root())
    parser.add_argument('--project-root', default=os.getcwd())
    parser.add_argument('files', nargs='+')
    args = parser.parse_args()
    sdk = Path(args.sdk_root).resolve()
    project = Path(args.project_root).resolve()
    try:
        files = checked_files(project, args.files)
        script = sdk / 'tools' / 'check_format.py'
        if not script.is_file() or not (sdk / '.clang-format').is_file():
            raise ValueError('SDK format checker/config missing; pass --sdk-root')
        spec = importlib.util.spec_from_file_location('tuya_sdk_format_checker', script)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        class ProjectChecker(module.FormatChecker):
            def _find_project_root(self):
                return project

            def _format_file_content(self, file_path):
                original = Path(file_path).read_text(encoding='utf-8')
                style_root = project if (project / '.clang-format').is_file() else sdk
                formatted = subprocess.run(
                    ['clang-format', '-style=file', '--assume-filename=' + str(style_root / Path(file_path).name)],
                    input=original, capture_output=True, text=True, check=True)
                return original, formatted.stdout

        # Reuse actual SDK header/character rules, with app-local file selection.
        checker = ProjectChecker(debug_mode=True)
        return 0 if checker.check_format(file_patterns=files) else 1
    except (OSError, ValueError, subprocess.CalledProcessError, AttributeError) as error:
        print('[ERROR] ' + str(error), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
