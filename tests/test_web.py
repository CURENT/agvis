# ================================================================================
# File Name:   test_web.py
# Author:      Zack Malkmus
# Date:        11/16/2023 (last modified)
# Description: Tests AGVis' Flask web application
# ================================================================================

import os, os.path
import pytest
from tests.conftest import client

def test_index(client):
    response = client.get('/')
    assert response.status_code == 200

def test_static_js_files(client):
    path = '../agvis/static/js'
    assert os.path.exists(path)
    for filename in os.listdir(path):
        response = client.get(f'/static/js/{filename}')
        assert response.status_code == 200

def test_invalid_static_path(client):
    response = client.get('/static/invalid_path')
    assert response.status_code == 404

def test_nonexistent_route(client):
    response = client.get('/nonexistent')
    assert response.status_code == 404