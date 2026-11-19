#!/usr/bin/env python3
"""Build derived portal assets: card thumbnails, the light project index and the external logo.

Originals are never modified. Run from any directory:
  python scripts/build_portal_assets.py          # create or refresh derived files
  python scripts/build_portal_assets.py --check  # fail if anything is missing or stale
"""
import argparse, base64, hashlib, io, json, re, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PORTAL = ROOT / "portal"
AI_DIR = PORTAL / "assets/ai"
THUMB_WIDTHS = (640, 960)
THUMB_QUALITY = {640: 72, 960: 76}
THUMB_STATE = AI_DIR / "thumbs.json"
PROJECTS = PORTAL / "data/projects.json"
INDEX = PORTAL / "data/projects-index.json"
INDEX_FIELDS = ("id", "title", "city", "area", "sector", "phase", "status", "problem", "solution",
                "difference", "market", "stage", "mission", "officialResult")
LOGO = PORTAL / "assets/logo.webp"
LOGO_SIZE = (340, 144)
LOGO_DATA_URI = re.compile(r'src="data:image/png;base64,([A-Za-z0-9+/=]+)"([^>]*class="brand-logo")')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def thumbnail_bytes(source, width):
    with Image.open(io.BytesIO(source)) as image:
        image.load()
        height = round(image.height * width / image.width)
        resized = image.convert("RGB").resize((width, height), Image.LANCZOS)
    out = io.BytesIO()
    resized.save(out, "WEBP", quality=THUMB_QUALITY[width], method=6)
    return out.getvalue()


def project_index(projects):
    return [{key: project.get(key) for key in INDEX_FIELDS} for project in projects]


def index_bytes(projects):
    return (json.dumps(project_index(projects), ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_bytes(data)
    temp.replace(path)


def build_thumbnails(check=False, only=None):
    state = json.loads(THUMB_STATE.read_text()) if THUMB_STATE.exists() else {}
    problems, changed = [], []
    sources = sorted(AI_DIR.glob("*.webp"))
    ids = {p.stem for p in sources}
    for path in sources:
        pid = path.stem
        if only and pid not in only:
            continue
        data = path.read_bytes()
        digest = sha(data)
        missing = [w for w in THUMB_WIDTHS if not (AI_DIR / str(w) / path.name).is_file()]
        if state.get(pid) == digest and not missing:
            continue
        if check:
            problems.append(f"miniatura ausente ou desatualizada: {pid}")
            continue
        for width in THUMB_WIDTHS:
            write(AI_DIR / str(width) / path.name, thumbnail_bytes(data, width))
        state[pid] = digest
        changed.append(pid)
    orphans = sorted(set(state) - ids)
    for pid in orphans:
        if check:
            problems.append(f"miniatura sem original: {pid}")
        else:
            state.pop(pid)
            for width in THUMB_WIDTHS:
                (AI_DIR / str(width) / f"{pid}.webp").unlink(missing_ok=True)
    removed = bool(orphans) and not check
    if not check and (changed or removed or not THUMB_STATE.exists()):
        write(THUMB_STATE, (json.dumps(dict(sorted(state.items())), indent=2) + "\n").encode())
    return changed, problems


def build_index(check=False):
    data = index_bytes(json.loads(PROJECTS.read_text(encoding="utf-8")))
    if INDEX.exists() and INDEX.read_bytes() == data:
        return False, []
    if check:
        return False, ["projects-index.json ausente ou diferente de projects.json"]
    write(INDEX, data)
    return True, []


def build_logo(check=False):
    if LOGO.is_file():
        return False, []
    match = LOGO_DATA_URI.search((PORTAL / "index.html").read_text(encoding="utf-8"))
    if not match:
        return False, ["assets/logo.webp ausente e logo embutido não encontrado em index.html"]
    if check:
        return False, ["assets/logo.webp ainda não foi gerado"]
    with Image.open(io.BytesIO(base64.b64decode(match.group(1)))) as image:
        image.load()
        logo = image.convert("RGBA")
        logo.thumbnail(LOGO_SIZE, Image.LANCZOS)
    out = io.BytesIO()
    logo.save(out, "WEBP", quality=90, method=6)
    write(LOGO, out.getvalue())
    return True, []


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--only", nargs="*", help="Protocolos cujas miniaturas devem ser geradas")
    args = parser.parse_args()
    thumbs, p1 = build_thumbnails(args.check, set(args.only) if args.only else None)
    index, p2 = build_index(args.check)
    logo, p3 = build_logo(args.check)
    problems = p1 + p2 + p3
    print(json.dumps({"thumbnails_built": len(thumbs), "index_written": index, "logo_written": logo,
                      "problems": problems}, ensure_ascii=False))
    if problems:
        sys.exit(1)


if __name__ == "__main__":
    main()
