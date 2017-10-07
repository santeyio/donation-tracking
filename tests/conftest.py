import pytest

from ../app import app as main_app

@pytest.fixture
def app():
    return main_app
