# ================================================================================
# File Name:   test_client.py
# Author:      Zack Malkmus
# Date:        11/20/2023 (last modified)
# Description: Test the CLI for AGVis
# ================================================================================

import pytest
import argparse
import subprocess
from agvis.cli import create_parser, main

@pytest.fixture
def parser():
    return create_parser()

def test_create_parser(parser):
    assert isinstance(parser, argparse.ArgumentParser)

def test_agvis_run_default_port(monkeypatch, client):
    c1 = "agvis run --dev=True"

    def mock_subprocess_run(c2, **kwargs):
        assert c2 == c1
        return subprocess.CompletedProcess(args=c2, returncode=0, stdout=b'', stderr=b'')

    monkeypatch.setattr(subprocess, 'run', mock_subprocess_run)

    with client:
        response = client.get('/')
        assert response.status_code == 200

def test_agvis_run_custom_port(monkeypatch, client):
    c1 = "agvis run --dev=True --port=9000"

    def mock_subprocess_run(c2, **kwargs):
        assert c2 == c1
        return subprocess.CompletedProcess(args=c2, returncode=0, stdout=b'', stderr=b'')

    monkeypatch.setattr(subprocess, 'run', mock_subprocess_run)

    with client:
        response = client.get('/')
        assert response.status_code == 200

def test_agvis_misc_license(monkeypatch, capsys):
    c1 = "agvis misc --license"

    def mock_subprocess_run(c2, **kwargs):
        assert c2 == c1
        return subprocess.CompletedProcess(args=c2, returncode=0, stdout=b'', stderr=b'')

    monkeypatch.setattr(subprocess, 'run', mock_subprocess_run)

    with capsys.disabled(), pytest.raises(SystemExit):
        main()

# ================================================================================
# DISABLED: This test runs different locally than on GitHub Actions
# ================================================================================

# def test_agvis_run_invalid_command(monkeypatch, capsys):
#     c1 = "agvis invalid_command"

#     def mock_subprocess_run(c2, **kwargs):
#         assert c2 == c1
#         return subprocess.CompletedProcess(args=c2, stdout=b'', stderr=b'Invalid command')

#     monkeypatch.setattr(subprocess, 'run', mock_subprocess_run)

#     with capsys.disabled(), pytest.raises(SystemExit) as exc_info:
#         main()

#     assert exc_info.value.code == 2