"""Unit tests for skills/core/tuyaopen-start/scripts/resolve_cli.py."""

import json
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "skills", "core", "tuyaopen-start", "scripts"))
import resolve_cli


class TestResolveCli(unittest.TestCase):
    def test_find_node_finds_executable(self):
        node = resolve_cli.find_node()
        self.assertTrue(os.path.isfile(node) or node == "node")

    def test_resolve_via_env_override(self):
        fake_cli = "/tmp/fake_tuyaopen_cli.js"
        with mock.patch.dict(os.environ, {"TUYAOPEN_CLI_PATH": fake_cli}):
            with mock.patch("os.path.isfile", side_effect=lambda p: p == fake_cli):
                res = resolve_cli.resolve_cli()
                self.assertTrue(res["ok"])
                self.assertEqual(res["type"], "env")
                self.assertEqual(res["executable"], os.path.abspath(fake_cli))

    def test_resolve_via_path(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            with mock.patch("shutil.which", return_value="/usr/bin/tuyaopen-cli"):
                with mock.patch("os.path.isfile", return_value=True):
                    res = resolve_cli.resolve_cli()
                    self.assertTrue(res["ok"])
                    self.assertEqual(res["type"], "path")
                    self.assertEqual(res["executable"], "/usr/bin/tuyaopen-cli")

    def test_resolve_not_found(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            with mock.patch("shutil.which", return_value=None):
                with mock.patch("os.path.isfile", return_value=False):
                    with mock.patch("glob.glob", return_value=[]):
                        with mock.patch("subprocess.check_output", side_effect=Exception("no npm")):
                            res = resolve_cli.resolve_cli()
                            self.assertFalse(res["ok"])
                            self.assertIn("not found", res["error"])


if __name__ == "__main__":
    unittest.main()
