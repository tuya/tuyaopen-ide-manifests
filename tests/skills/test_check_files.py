import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "skills", "embedded", "tuyaopen-embedded-code-check", "scripts"))
import check_files


def test_external_app_file_is_accepted_without_copying_into_sdk(tmp_path):
    app = tmp_path / 'app'
    app.mkdir()
    source = app / 'main.c'
    source.write_text('int main(void) { return 0; }')
    assert check_files.checked_files(app.resolve(), [str(source)]) == [str(source)]


def test_missing_file_and_symlink_escape_are_rejected(tmp_path):
    app = tmp_path / 'app'
    app.mkdir()
    outside = tmp_path / 'outside.c'
    outside.write_text('int value;')
    (app / 'escape.c').symlink_to(outside)
    with pytest.raises(ValueError, match='outside project root'):
        check_files.checked_files(app.resolve(), ['escape.c'])
    with pytest.raises(ValueError, match='does not exist'):
        check_files.checked_files(app.resolve(), ['missing.c'])


def test_find_repo_root_via_env(tmp_path):
    clang = tmp_path / ".clang-format"
    clang.write_text("")
    os.environ["OPEN_SDK_ROOT"] = str(tmp_path)
    try:
        result = check_files.find_repo_root()
        assert result == str(tmp_path)
    finally:
        del os.environ["OPEN_SDK_ROOT"]


def test_find_repo_root_by_traversal(tmp_path):
    clang = tmp_path / ".clang-format"
    clang.write_text("")
    subdir = tmp_path / "apps" / "my_app"
    subdir.mkdir(parents=True)
    old = os.getcwd()
    os.environ.pop("OPEN_SDK_ROOT", None)   # isolate from any real env var
    os.chdir(subdir)
    try:
        result = check_files.find_repo_root()
        assert result == str(tmp_path)
    finally:
        os.chdir(old)


def test_find_repo_root_not_found(tmp_path):
    old = os.getcwd()
    os.chdir(tmp_path)
    os.environ.pop("OPEN_SDK_ROOT", None)
    try:
        result = check_files.find_repo_root()
        assert result == ""
    finally:
        os.chdir(old)
