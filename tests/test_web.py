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

def test_static(client):
    path = '../agvis/static/js'
    assert os.path.exists(path)
    for filename in os.listdir(path):
        response = client.get('/static/js/' + filename)
        assert response.status_code == 200