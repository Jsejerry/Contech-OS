"""Brand assets and gzip regression.

The public preview proxy intentionally rewrites Cache-Control to no-store.
Test the application's cache contract at the origin handler, separately from
public integration checks. Do not change infrastructure to bypass its policy.
"""
import os

import pytest
import requests


BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL") or os.environ.get("EXPO_BACKEND_URL")
if not BASE_URL:
    from pathlib import Path

    env_text = Path("/app/frontend/.env").read_text()
    for line in env_text.splitlines():
        if line.startswith("EXPO_PUBLIC_BACKEND_URL=") or line.startswith("EXPO_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().strip('"')
            break
if not BASE_URL:
    pytest.skip("Backend URL not found in env/frontend .env", allow_module_level=True)
BASE_URL = BASE_URL.rstrip("/")


@pytest.fixture(scope="module")
def api():
    session = requests.Session()
    session.headers.update({"Accept-Encoding": "gzip, deflate", "Content-Type": "application/json"})
    yield session
    session.close()


# ---- Brand assets ----
class TestBrandAssets:
    def test_brand_logo_returns_503(self, api):
        # Expected: original logo asset lives in prior account's object storage;
        # frontend falls back to drawn logo. Backend surfaces 503.
        response = api.get(f"{BASE_URL}/api/brand/logo")
        assert response.status_code == 503

    def test_origin_cache_policy_earth(self):
        from brand_assets import brand_asset

        response = brand_asset("earth")
        assert response.headers["cache-control"] == "public, max-age=86400"
        assert len(response.body) > 0

    def test_brand_earth_binary_shape_and_size(self, api):
        response = api.get(f"{BASE_URL}/api/brand/earth?v=2")
        assert response.status_code == 200
        assert response.headers.get("content-type", "").startswith("application/octet-stream")
        assert len(response.content) == 1536 * 768 * 4

    def test_unknown_asset_404(self, api):
        response = api.get(f"{BASE_URL}/api/brand/not-real")
        assert response.status_code == 404


# ---- Waitlist still works with middleware enabled ----
class TestWaitlistCompatibility:
    def test_waitlist_count_still_available(self, api):
        response = api.get(f"{BASE_URL}/api/waitlist/count")
        assert response.status_code == 200
        body = response.json()
        assert isinstance(body.get("count"), int)
