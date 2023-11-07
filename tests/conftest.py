import pytest
import sys
sys.path.append('/../agvis')
from agvis.web import AgvisWeb

@pytest.fixture
def app():
    """
    Setup our flask test app, this only gets executed once.

    :return: Flask app
    """
    agvis_web = AgvisWeb()
    yield agvis_web.app

def client(app):
    """
    Create app client for testing
    """
    return app.test_client()