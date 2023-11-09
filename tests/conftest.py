import pytest
import sys
sys.path.append('/../agvis')
from agvis.web import AgvisWeb

@pytest.fixture
def app():
    agvis_web = AgvisWeb()
    yield agvis_web.app

@pytest.fixture
def client(app):
    return app.test_client()