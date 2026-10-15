"""Backend tests for ConTech OS waitlist API."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL") or os.environ.get("EXPO_BACKEND_URL")
if not BASE_URL:
    # Fallback to reading frontend .env since the preview URL lives there
    from pathlib import Path
    env = Path("/app/frontend/.env").read_text()
    for line in env.splitlines():
        if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().strip('"')
            break
BASE_URL = BASE_URL.rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    yield s
    s.close()


# ---- Health / Root ----
class TestHealth:
    def test_api_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert "message" in r.json()


# ---- Waitlist ----
class TestWaitlist:
    def test_get_count_returns_int(self, api):
        r = api.get(f"{BASE_URL}/api/waitlist/count")
        assert r.status_code == 200
        body = r.json()
        assert "count" in body and isinstance(body["count"], int)

    def test_invalid_email_422(self, api):
        r = api.post(f"{BASE_URL}/api/waitlist", json={"name": "Bad", "email": "not-an-email"})
        assert r.status_code == 422

    def test_missing_name_422(self, api):
        r = api.post(f"{BASE_URL}/api/waitlist", json={"email": "a@b.co"})
        assert r.status_code == 422

    def test_empty_name_422(self, api):
        r = api.post(f"{BASE_URL}/api/waitlist", json={"name": "", "email": "x@y.co"})
        assert r.status_code == 422

    def test_join_success_shape(self, api):
        email = f"test_{uuid.uuid4().hex[:10]}@example.com"
        r = api.post(f"{BASE_URL}/api/waitlist", json={"name": "TEST User", "email": email, "role": "Investor"})
        assert r.status_code == 200, r.text
        data = r.json()
        for k in ["id", "name", "email", "role", "position", "already_joined"]:
            assert k in data, f"missing {k}"
        assert data["already_joined"] is False
        assert data["email"] == email.lower()
        assert isinstance(data["position"], int) and data["position"] >= 1
        assert data["role"] == "Investor"

    def test_duplicate_email_case_insensitive(self, api):
        email = f"test_dup_{uuid.uuid4().hex[:8]}@example.com"
        # first insert
        r1 = api.post(f"{BASE_URL}/api/waitlist", json={"name": "TEST Dup", "email": email})
        assert r1.status_code == 200
        assert r1.json()["already_joined"] is False
        # same email uppercase -> already_joined
        r2 = api.post(f"{BASE_URL}/api/waitlist", json={"name": "TEST Dup2", "email": email.upper()})
        assert r2.status_code == 200, r2.text
        d2 = r2.json()
        assert d2["already_joined"] is True
        assert d2["email"] == email.lower()
        # original name is preserved from DB on duplicate (not overwritten)
        assert d2["name"] == "TEST Dup"

    def test_count_increases_after_insert(self, api):
        before = api.get(f"{BASE_URL}/api/waitlist/count").json()["count"]
        email = f"test_cnt_{uuid.uuid4().hex[:8]}@example.com"
        r = api.post(f"{BASE_URL}/api/waitlist", json={"name": "TEST Count", "email": email})
        assert r.status_code == 200
        after = api.get(f"{BASE_URL}/api/waitlist/count").json()["count"]
        assert after == before + 1

    def test_role_optional(self, api):
        email = f"test_norole_{uuid.uuid4().hex[:8]}@example.com"
        r = api.post(f"{BASE_URL}/api/waitlist", json={"name": "TEST NoRole", "email": email})
        assert r.status_code == 200
        assert r.json()["role"] is None
