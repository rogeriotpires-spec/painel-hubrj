#!/usr/bin/env python3
"""Generate HUB RJ image batches from public project summaries, safely resumable."""
import argparse
import base64
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_portal_assets import THUMB_WIDTHS, build_thumbnails  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ROOT / "portal/data/projects.json"
AI_DIR = ROOT / "portal/assets/ai"
MANIFEST = AI_DIR / "manifest.json"
INDEX_FILES = ("portal/app.js", "portal/vitrine.html")
AI_EXPRESSION = re.compile(r"const aiIds\s*=\s*new Set\((\[[^\]]*\])\);")


def load_projects():
    projects = json.loads(PROJECTS.read_text(encoding="utf-8"))
    seen = set()
    for project in projects:
        protocol = project.get("id")
        if not isinstance(protocol, str) or not re.fullmatch(r"[0-9]{6}", protocol):
            raise ValueError("Protocolo inválido na base documental")
        if protocol in seen:
            raise ValueError(f"Protocolo duplicado: {protocol}")
        if not project.get("title") or not (project.get("fullSummary") or project.get("summary")):
            raise ValueError(f"Título ou resumo ausente: {protocol}")
        seen.add(protocol)
    if not projects:
        raise ValueError("A base de projetos está vazia")
    return projects


def validate_webp(data, expected_size=None):
    with Image.open(io.BytesIO(data)) as image:
        if image.format != "WEBP" or getattr(image, "n_frames", 1) != 1:
            raise ValueError("A resposta não é uma imagem WebP estática")
        image.load()
        if expected_size and image.size != expected_size:
            raise ValueError(f"Dimensões incorretas: {image.size}; esperado {expected_size}")


def image_inventory(projects):
    known = {p["id"] for p in projects}
    inventory = {}
    for path in sorted(AI_DIR.glob("*.webp")):
        if path.stem not in known:
            raise ValueError(f"Imagem sem protocolo na base: {path.name}")
        data = path.read_bytes()
        validate_webp(data)
        inventory[path.stem] = hashlib.sha256(data).hexdigest()
    return inventory


def validate_indexes(projects, inventory):
    expected = set(inventory)
    for filename in INDEX_FILES:
        matches = AI_EXPRESSION.findall((ROOT / filename).read_text(encoding="utf-8"))
        if len(matches) != 1:
            raise ValueError(f"Índice aiIds ausente ou duplicado: {filename}")
        ids = json.loads(matches[0])
        if len(ids) != len(expected) or set(ids) != expected:
            raise ValueError(f"Índice de imagens divergente: {filename}")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    entries = manifest.get("images", [])
    if (manifest.get("total_projects") != len(projects)
            or manifest.get("ai_image_count") != len(expected)
            or manifest.get("pending") != len(projects) - len(expected)
            or len(entries) != len(expected)
            or {p["id"] for p in entries} != expected):
        raise ValueError("Manifesto de imagens divergente da base e dos arquivos")
    info = {p["id"]: p for p in projects}
    for entry in entries:
        if (entry["title"] != info[entry["id"]]["title"]
                or entry["file"] != f"assets/ai/{entry['id']}.webp"):
            raise ValueError(f"Associação incorreta no manifesto: {entry['id']}")


def atomic_write(path, data):
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_bytes(data)
    temporary.replace(path)

def prompt_for(project):
    summary = " ".join(str(project.get("fullSummary") or project.get("summary") or "").split())
    summary = summary[:8500]
    return f"""Create exactly ONE unique landscape image, 1536x1024 pixels, for the HUB RJ innovation portal.
Project: {project['title']}
Area: {project.get('area','')}
Municipality: {project.get('city','')}
Project description (authoritative source):
{summary}

Depict the SPECIFIC proposed solution and its real-world application based solely on this description.
First decide privately what physical scene, relevant objects, users, environment and actions can directly illustrate this specific project.
If the product is software, show a credible use situation rather than a generic dashboard or hologram. If research, show a scientifically plausible conceptual scene, not a fabricated photograph of a finished product.
Professional photorealistic cinematic editorial illustration, tasteful deep navy and cyan accents, natural lighting, high detail and balanced composition.
No collages, no split panels, no text, no labels, no logos, no brands, no watermarks, no personal identifying details, no fictional claims, no generic agriculture/telemedicine unless the description explicitly covers it.
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
            validate_webp(image, expected_size=(1536, 1024))
            return image
        except urllib.error.HTTPError as exc:
            # Never log response bodies, headers or credentials.
            try:
                error = json.loads(exc.read()).get("error", {})
                code = str(error.get("code") or "")
                error_type = str(error.get("type") or "")
                message = str(error.get("message") or "").lower()
            except (ValueError, AttributeError):
                code, error_type, message = "", "", ""
            # Only expose normalized error categories, never the server's message.
            safe_category = code or error_type
            if not re.fullmatch(r"[a-zA-Z_]{1,64}", safe_category):
                safe_category = "unspecified"
            quota_codes = {
                "insufficient_quota", "billing_hard_limit_reached", "credit_balance_exhausted",
                "organization_spend_limit_exceeded", "project_spend_limit_exceeded",
                "organization_usage_limit_exceeded"
            }
            no_quota = code in quota_codes or error_type in quota_codes or any(
                phrase in message for phrase in ("exceeded your current quota", "billing hard limit",
                                                  "insufficient credit", "insufficient balance")
            ) or bool(re.search(r"\blimit:\s*0\b", message))
            if no_quota:
                raise RuntimeError(f"API HTTP {exc.code} ({safe_category}): sem cota disponível; confira créditos e limites do projeto na OpenAI") from None
            if exc.code not in (408, 429, 500, 502, 503, 504):
                raise RuntimeError(f"API HTTP {exc.code} ({safe_category}): confira chave e acesso ao modelo") from None
            print(f"API HTTP {exc.code} ({safe_category}); tentativa {attempt + 1}/3", flush=True)
            if attempt == 2:
                raise RuntimeError(f"API indisponível após 3 tentativas (HTTP {exc.code}; {safe_category})") from None
            retry_after = str(exc.headers.get("Retry-After", ""))
            delay = max(pause, int(retry_after)) if retry_after.isdigit() else pause
            if delay > 600:
                raise RuntimeError(f"API HTTP {exc.code} ({safe_category}): aguarde {delay} segundos antes de retomar") from None
            time.sleep(delay)
        except (urllib.error.URLError, TimeoutError, OSError, ValueError, KeyError) as exc:
            print(f"Attempt {attempt + 1}/3 failed: {type(exc).__name__}", flush=True)
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
    replacement = "const aiIds=new Set(" + json.dumps(ids) + ");"
    updates = {}
    for filename in INDEX_FILES:
        path = ROOT / filename
        content = path.read_text(encoding="utf-8")
        content, replaced = AI_EXPRESSION.subn(lambda _: replacement, content)
        if replaced != 1:
            raise RuntimeError(f"Could not update aiIds in {filename}")
        updates[path] = content.encode("utf-8")
    updates[MANIFEST] = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    for path, content in updates.items():
        atomic_write(path, content)
    return len(ids)


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, check=True,
                          text=True, capture_output=True).stdout.strip()


def publish_checkpoint(protocol):
    allowed = set(INDEX_FILES) | {"portal/assets/ai/manifest.json", f"portal/assets/ai/{protocol}.webp",
                                  "portal/assets/ai/thumbs.json"}
    allowed |= {f"portal/assets/ai/{width}/{protocol}.webp" for width in THUMB_WIDTHS}
    changed = set(git("diff", "--name-only", "HEAD").splitlines())
    untracked = set(git("ls-files", "--others", "--exclude-standard").splitlines())
    if (changed | untracked) - allowed:
        raise RuntimeError("Arquivos fora do lote foram alterados; publicação interrompida")
    git("add", "--", *sorted(allowed))
    git("commit", "-m", f"Publica imagem HUB RJ do protocolo {protocol}")
    # A normal push fails safely if another author advanced main. Never force-push.
    git("push", "origin", "HEAD:main")
    return git("rev-parse", "HEAD")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=3)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--protocols", nargs="*")
    parser.add_argument("--request", type=Path)
    parser.add_argument("--publish", action="store_true")
    parser.add_argument("--report", type=Path)
    parser.add_argument("--model", default="gpt-image-2.5-flare")
    args = parser.parse_args()
    if args.request:
        request = json.loads(args.request.read_text(encoding="utf-8"))
        args.limit = request["quantidade"]
        if not isinstance(request["apenas_verificar"], bool):
            parser.error("apenas_verificar deve ser booleano")
        args.dry_run = args.dry_run or request["apenas_verificar"]
        args.protocols = request.get("protocolos")
    if type(args.limit) is not int or not 1 <= args.limit <= 84:
        parser.error("--limit must be between 1 and 84")
    projects = load_projects()
    initial = image_inventory(projects)
    validate_indexes(projects, initial)
    missing = [p for p in projects if p["id"] not in initial]
    if args.protocols is not None:
        known = {p["id"]: p for p in projects}
        if (not isinstance(args.protocols, list) or any(not isinstance(p, str) for p in args.protocols)
                or len(set(args.protocols)) != len(args.protocols)
                or any(p not in known for p in args.protocols)):
            parser.error("Lista de protocolos inválida, desconhecida ou duplicada")
        selected = [known[p] for p in args.protocols if p not in initial][:args.limit]
    else:
        selected = missing[:args.limit]
    print(f"{len(projects)} projects; {len(projects)-len(missing)} existing AI images; {len(missing)} pending")
    print("Selected protocols: " + ", ".join(str(p["id"]) for p in selected))
    if args.validate_only:
        print("Protocolos, arquivos WebP, manifesto e ambos os índices conferidos.")
        return
    if args.dry_run:
        for p in selected:
            print(f"DRY RUN: {p['id']}: {p['title']} ({len(prompt_for(p))} prompt chars)")
        return
    report = {"total_projects": len(projects), "initial_images": len(initial),
              "selected": [p["id"] for p in selected], "generated": [], "published": [],
              "status": "running", "pending": len(missing)}

    def save_report():
        if args.report:
            args.report.parent.mkdir(parents=True, exist_ok=True)
            atomic_write(args.report, (json.dumps(report, ensure_ascii=False, indent=2) + "\n").encode())

    save_report()
    try:
        key = os.getenv("OPENAI_API_KEY", "").strip()
        if selected and not key:
            raise RuntimeError("OPENAI_API_KEY ausente. Cadastre a chave em Settings > Secrets and variables > Actions.")
        if args.publish and selected:
            if git("status", "--porcelain", "--untracked-files=all"):
                raise RuntimeError("A publicação exige um checkout limpo")
            git("config", "user.name", "github-actions[bot]")
            git("config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com")
        AI_DIR.mkdir(parents=True, exist_ok=True)
        for p in selected:
            img = AI_DIR / f"{p['id']}.webp"
            if img.exists():
                raise RuntimeError(f"A imagem {img.name} já existe; não será sobrescrita")
            result = generate(prompt_for(p), key, args.model)
            atomic_write(img, result)
            build_thumbnails(only={p["id"]})
            update_index(projects)
            current = image_inventory(projects)
            validate_indexes(projects, current)
            if any(current.get(protocol) != digest for protocol, digest in initial.items()):
                raise RuntimeError("Uma imagem anterior foi alterada")
            report["generated"].append(p["id"])
            report["pending"] = len(projects) - len(current)
            save_report()
            print(f"SAVED {img.name} ({len(result)} bytes)", flush=True)
            if args.publish:
                commit = publish_checkpoint(p["id"])
                report["published"].append(p["id"])
                report["last_commit"] = commit
                save_report()
        report["status"] = "success"
    except Exception as exc:
        report["status"] = "failed"
        # Do not expose subprocess stdout/stderr or remote API response bodies.
        report["error"] = str(exc) if isinstance(exc, (ValueError, RuntimeError)) else type(exc).__name__
        raise
    finally:
        save_report()
        if os.getenv("GITHUB_STEP_SUMMARY"):
            with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as summary:
                summary.write(f"### Imagens HUB RJ\n\nEstado: {report['status']}\n\n"
                              f"Protocolos selecionados: {', '.join(report['selected'])}\n\n"
                              f"Geradas: {len(report['generated'])}; publicadas no repositório: "
                              f"{len(report['published'])}; pendentes: {report['pending']}.\n\n")
                if report.get("error"):
                    summary.write(report["error"] + "\n")
    print(f"Created {len(report['generated'])}; pending {report['pending']}")

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        message = str(exc) if isinstance(exc, (ValueError, RuntimeError)) else type(exc).__name__
        sys.exit(message)
