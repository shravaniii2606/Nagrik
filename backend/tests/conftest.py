import pytest
from fastapi.testclient import TestClient

from app.core.auth import CurrentUser, get_current_user
from app.main import app


@pytest.fixture
def client():
    app.dependency_overrides.clear()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def authenticated_client(client):
    def override_current_user():
        return CurrentUser(id="user-123", email="citizen@example.com")

    app.dependency_overrides[get_current_user] = override_current_user
    return client
