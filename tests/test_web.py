import os, os.path
from tests.conftest import client

def test_index(client):
    response = client.get('/')
    assert response.status_code == 200

def test_static(client):
    path = '../agvis/static/js'
    assert os.path.exists(path)
    for filename in os.listdir(path):
        response = client.get('/static/js/' + filename)
        assert response.status_code == 200

    path = '../agvis/static/img'
    assert os.path.exists(path)
    for filename in os.listdir(path):
        response = client.get('/img/' + filename)
        assert response.status_code == 200