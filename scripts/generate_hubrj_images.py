#!/usr/bin/env python3
"""Generate HUB RJ image batches from public project summaries, safely resumable."""
import argparse
import base64
import json
import os
from pathlib import Path
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ROOT / "portal/data/projects.json"
AI_DIR = ROOT / "portal/assets/ai"
MANIFEST = AI_DIR / "manifest.json"

def prompt_for(project):
    summary = " ".join(str(project.get("fullSummary") or project.get("summary") or "").split())
    summary = summary[:8500]
    return f"""Create exactly ONE unique landscape image, 1536x1024 pixels, for the HUB RJ innovation portal.
Project: {project['title']}
Area: {project.get('area','')}
Project description (authoritative source):
{summary}

Depict the SPECIFIC proposed solution and its real-world application based solely on this description.
First decide privately what physical scene, relevant objects, users, environment and actions can directly illustrate this specific project.
If the product is software, show a credible use situation rather than a generic dashboard or hologram. If research, show a scientifically plausible conceptual scene, not a fabricated photograph of a finished product.
Professional photorealistic cinematic editorial illustration, tasteful deep navy and cyan accents, natural lighting, high detail and balanced composition.
No collages, no split panels, no text, no labels, no logos, no brands, no watermarks, no fictional claims, no generic agriculture/telemedicine unless the description explicitly covers it.
This is a visual CONCEPT, not proof that a working product already exists."""

def generate(prompt, key, model, pause=120):
    payload = json.dumps({
        "model": model, "prompt": prompt, "n": 1, "size": "1536x1024",
        "quality": "medium", "output_format": "webp"
    }).encode("utf-8")
    for attempt in range(3):
        req = urllib.request.Request(
            "https://api.openai.com/v1/images/generations", data=payload, method="POST",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=240) as response:
                data = json.load(response)
            encoded = data["data"][0]["b64_json"]
            image = base64.b64decode(encoded, validate=True)
            if not image.startswith(b"RIFF") or image[8:12] != b"WEBP":
                raise ValueError("API response does not contain a WebP image")
            return image
        except (urllib.error.URLError, TimeoutError, OSError, ValueError, KeyError) as exc:
            print(f"Attempt {attempt + 1}/3 failed: {type(exc).__name__}: {str(exc)[:250]}", flush=True)
            if attempt == 2:
                raise
            time.sleep(pause)

def update_index(projects):
    existing = {p.stem for p in AI_DIR.glob("*.webp")}
    ids = sorted(existing)
    info = {str(p["id"]): p for p in projects}
    manifest = {
        "total_projects": len(projects),
        "ai_image_count": len(ids),
        "pending": len(projects) - len(ids),
        "images": [
            {"id": key, "title": str(info[key]["title"]),
             "file": f"assets/ai/{key}.webp"} for key in ids if key in info
        ],
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    expression = re.compile(r"const aiIds\s*=\s*new Set\(\[[^\]]*\]\);")
    replacement = "const aiIds=new Set(" + json.dumps(ids) + ");"
    for filename in ("portal/app.js", "portal/vitrine.html"):
        path = ROOT / filename
        content = path.read_text(encoding="utf-8")
        content, replaced = expression.subn(lambda _: replacement, content, count=1)
        if replaced != 1:
            raise RuntimeError(f"Could not update aiIds in {filename}")
        path.write_text(content, encoding="utf-8")
    return len(ids)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=3)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--model", default="gpt-image-2.5-flare")
    args = parser.parse_args()
    if args.limit < 1 or args.limit > 10:
        parser.error("--limit must be between 1 and 10")
    projects = json.loads(PROJECTS.read_text(encoding="utf-8"))
    missing = [p for p in projects if not (AI_DIR / f"{p['id']}.webp").exists()]
    selected = missing[:args.limit]
    print(f"{len(projects)} projects; {len(projects)-len(missing)} existing AI images; {len(missing)} pending")
    print("Selected protocols: " + ", ".join(str(p["id"]) for p in selected))
    if args.dry_run:
        for p in selected:
            print(f"DRY RUN: {p['id']}: {p['title']} ({len(prompt_for(p))} prompt chars)")
        return
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        sys.exit("OPENAI_API_KEY missing; use GitHub Actions secret and dry-run first")
    AI_DIR.mkdir(parents=True, exist_ok=True)
    completed = 0
    for p in selected:
        img = AI_DIR / f"{p['id']}.webp"
        try:
            result = generate(prompt_for(p), key, args.model)
            img.write_bytes(result)
            completed += 1
            print(f"SAVED {img.name} ({len(result)} bytes)", flush=True)
        except Exception as exc:
            print(f"FAILED {p['id']}: {exc}", file=sys.stderr, flush=True)
    total = update_index(projects)
    print(f"Created {completed}; AI images total {total}; pending {len(projects)-total}")
    if completed == 0 and selected:
        sys.exit("No images were generated. No API costs are incurred on dry-run.")

if __name__ == "__main__":
    main()
