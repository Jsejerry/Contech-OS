"""Read-only, allowlisted public brand assets backed by managed object storage."""
import json
import logging
import os
from functools import lru_cache
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Response

load_dotenv(Path(__file__).parent / ".env")
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
storage_key = None
router = APIRouter(prefix="/api/brand")


def init_storage():
    global storage_key
    if not storage_key:
        response = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ.get("EMERGENT_LLM_KEY")}, timeout=30)
        response.raise_for_status()
        storage_key = response.json()["storage_key"]
    return storage_key


def put_object(path, data, content_type):
    response = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": init_storage(), "Content-Type": content_type}, data=data, timeout=120)
    response.raise_for_status()
    return response.json()


@lru_cache(maxsize=4)
def read_asset(name):
    global storage_key
    manifest = json.loads((Path(__file__).parent / "brand_manifest.json").read_text())
    if name not in manifest:
        raise HTTPException(status_code=404, detail="Asset not found")
    asset = manifest[name]
    response = requests.get(f"{STORAGE_URL}/objects/{asset['path']}", headers={"X-Storage-Key": init_storage()}, timeout=45)
    if response.status_code == 503:
        storage_key = None
        response = requests.get(f"{STORAGE_URL}/objects/{asset['path']}", headers={"X-Storage-Key": init_storage()}, timeout=45)
    response.raise_for_status()
    return response.content, asset["type"]


@router.get("/{name}")
def brand_asset(name: str):
    try:
        data, content_type = read_asset(name)
    except HTTPException:
        raise
    except (requests.RequestException, OSError, ValueError):
        logging.exception("Brand asset unavailable: %s", name)
        raise HTTPException(status_code=503, detail="Brand asset temporarily unavailable")
    return Response(data, media_type=content_type, headers={"Cache-Control": "public, max-age=86400"})