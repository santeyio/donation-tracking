import pytest
from app import app as main_app

@pytest.fixture
def app():
    return main_app

def test_app_index(client):
    assert client.get(url_for('index')).status_code == 200
