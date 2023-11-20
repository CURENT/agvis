import pytest
import os
import sys
import subprocess
from tests.conftest import client

def test_agvis_run(monkeypatch, client):
    c1 = "agvis run --dev=True"

    def mock_subprocess_run(c2, **kwargs):
        assert c2 == c1
        return subprocess.CompletedProcess(args=c2, returncode=0, stdout=b'', stderr=b'')

    monkeypatch.setattr(subprocess, 'run', mock_subprocess_run)

    with client:
        response = client.get('/')
        assert response.status_code == 200

def test_agvis_run_port(monkeypatch, client):
    c1 = "agvis run --dev=True --port=9000"

    def mock_subprocess_run(c2, **kwargs):
        assert c2 == c1
        return subprocess.CompletedProcess(args=c2, returncode=0, stdout=b'', stderr=b'')

    monkeypatch.setattr(subprocess, 'run', mock_subprocess_run)

    with client:
        response = client.get('/')
        assert response.status_code == 200