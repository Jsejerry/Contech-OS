"""One-time brand preparation. Sources: user's PDF and NASA Blue Marble texture."""
import json
from pathlib import Path
from uuid import uuid4

import numpy as np
from PIL import Image

from brand_assets import put_object


def prepare():
    image = Image.open("/tmp/reference-16.jpeg").convert("RGBA").crop((104, 74, 153, 123))
    pixels = np.array(image)
    bright = pixels[:, :, :3].max(axis=2).astype(float)
    pixels[:, :, 3] = np.clip((bright - 26) * 5, 0, 255).astype(np.uint8)
    Image.fromarray(pixels).resize((196, 196), Image.Resampling.LANCZOS).save("/tmp/contech-logo.png")
    texture = Image.open("/tmp/earth-color.jpg").convert("RGBA").resize((1536, 768), Image.Resampling.LANCZOS)
    if Path("/tmp/earth-night.png").exists():
        texture.putalpha(Image.open("/tmp/earth-night.png").convert("L").resize(texture.size, Image.Resampling.LANCZOS))
    Path("/tmp/earth.rgba").write_bytes(texture.tobytes())
    manifest_file = Path(__file__).with_name("brand_manifest.json")
    manifest = json.loads(manifest_file.read_text()) if manifest_file.exists() else {}
    for name, filename, content_type in [("logo", "/tmp/contech-logo.png", "image/png"), ("earth", "/tmp/earth.rgba", "application/octet-stream")]:
        if name == "logo" and name in manifest:
            continue
        result = put_object(f"contech-os/uploads/brand/{uuid4()}{Path(filename).suffix}", Path(filename).read_bytes(), content_type)
        manifest[name] = {"path": result["path"], "type": content_type}
    Path(__file__).with_name("brand_manifest.json").write_text(json.dumps(manifest, indent=2))

    # Geographic coordinates are geometry, not image assets. Keep coastlines crisp in 3D.
    world = json.loads(Path("/tmp/world.geojson").read_text())
    rings = []
    for feature in world["features"]:
        geometry = feature["geometry"]
        polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
        for polygon in polygons:
            ring = polygon[0]
            if len(ring) > 5:
                rings.append([[round(lon, 3), round(lat, 3)] for lon, lat in ring])
    target = Path("/app/frontend/src/world-outlines.json")
    target.write_text(json.dumps(rings, separators=(",", ":")))
    print("Prepared managed brand assets and", len(rings), "country outlines")


if __name__ == "__main__":
    prepare()