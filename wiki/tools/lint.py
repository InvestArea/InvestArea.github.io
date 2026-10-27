#!/usr/bin/env python3
"""
InvestArea LLM Wiki — Bütövlük və Sağlamlıq Yoxlayıcısı (Linter)
İstifadə:
    python3 wiki/tools/lint.py
"""

import sys, os, re
from pathlib import Path

WIKI_DIR = Path(__file__).resolve().parent.parent

IGNORED_EXAMPLE_LINKS = {
    "wikilinks", "wikilink", "source_file", "raw/source_file",
    "sehife_adi", "entity_a", "concept_b"
}

def lint_wiki():
    pages = {}
    all_links = set()
    errors = []
    warnings = []

    md_files = list(WIKI_DIR.rglob("*.md"))

    for f in md_files:
        rel = f.relative_to(WIKI_DIR)
        pages[f.stem] = str(rel)

    for f in md_files:
        rel = str(f.relative_to(WIKI_DIR))
        text = f.read_text(encoding="utf-8")

        # Check frontmatter if not index or log or schema
        if f.name not in ["AGENTS.md", "log.md", "index.md"]:
            if not text.startswith("---"):
                warnings.append(f"[{rel}] Frontmatter yoxdur.")

        # Find wikilinks outside of code blocks
        clean_text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
        links = re.findall(r'\[\[([^\]\|#]+)(?:[\|#][^\]]+)?\]\]', clean_text)
        for target in links:
            target_clean = Path(target).stem
            if target_clean in IGNORED_EXAMPLE_LINKS or target in IGNORED_EXAMPLE_LINKS:
                continue
            all_links.add(target_clean)
            if target_clean not in pages and target not in ["wiki/AGENTS", "wiki/log", "index", "log"]:
                warnings.append(f"[{rel}] Qırıq keçid: [[{target}]] mövcud deyil.")

    # Check for orphan pages
    for stem, path in pages.items():
        if stem not in ["index", "log", "AGENTS"] and stem not in all_links:
            warnings.append(f"Yetim səhifə (inbound link yoxdur): {path}")

    return errors, warnings

def main():
    print("\n🩺 InvestArea LLM Wiki Bütövlük Yoxlanışı (Lint Pass)...\n" + "="*60)
    errors, warnings = lint_wiki()

    if errors:
        print("❌ Xətalar:")
        for e in errors:
            print(f"  - {e}")
    else:
        print("✅ Kritik xəta yoxdur.")

    if warnings:
        print("\n⚠️ Xəbərdarlıqlar və Tövsiyələr:")
        for w in warnings:
            print(f"  - {w}")
    else:
        print("🌟 TƏBRİKLƏR! Bütün səhifələr, teqlər və keçidlər 100% bütövdür!")

    print("="*60)

if __name__ == "__main__":
    main()
