import sys
import pytest
sys.path.append('../agvis')
from web import AgvisWeb

@pytest.fixture
def test_index(app):
    client = app.test_client()
    response = client.get('/')
    assert response.status_code == 200
    assert b'Welcome to AGVis' in response.data

def test_static_proxy(app):
    client = app.test_client()
    response = client.get('/some-path')
    assert response.status_code == 200

def test_run_app_dev_mode(monkeypatch, capsys):
    agvis_web = AgvisWeb()
    monkeypatch.setattr(agvis_web, 'os_name', 'win32')
    agvis_web.run(dev=True)
    captured = capsys.readouterr()
    assert "WARNING: AGVis is running on Windows. This is not recommended for production use." in captured.out

def test_run_app_prod_mode(monkeypatch, capsys):
    agvis_web = AgvisWeb()
    monkeypatch.setattr(agvis_web, 'os_name', 'linux')
    agvis_web.run(host='localhost', port=5000, workers=4, dev=False)
    captured = capsys.readouterr()
    assert "AGVis will serve static files from directory" in captured.out

def test_run_app_error_handling(monkeypatch, capsys):
    agvis_web = AgvisWeb()
    monkeypatch.setattr(agvis_web, 'os_name', 'linux')
    with pytest.raises(Exception) as e_info:
        agvis_web.run(host='localhost', port=5000, workers=4, dev=False)
    captured = capsys.readouterr()
    assert "An unexpected error has occured while trying to start AGVis:" in captured.out
