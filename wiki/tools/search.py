#!/usr/bin/env python3
"""
InvestArea LLM Wiki — CLI Axtarış Mühərriki
İstifadə:
    python3 wiki/tools/search.py "Ağdam suvarma"
    python3 wiki/tools/search.py --tag agrotech
"""

import sys, os, re
from pathlib import Path

WIKI_DIR = Path(__file__).resolve().parent.parent

def search_wiki(query, tag_filter=None):
    results = []
    terms = query.lower().split() if query else []
    
    for md_file in WIKI_DIR.rglob("*.md"):
        if md_file.name in ["AGENTS.md", "log.md"]:
            continue
        try:
            content = md_file.read_text(encoding="utf-8")
        except Exception:
            continue
        
        # Frontmatter parse
        frontmatter = ""
        tags = []
        title = md_file.stem
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                frontmatter = parts[1]
                m_title = re.search(r'title:\s*["\']?([^"\']+)["\']?', frontmatter)
                if m_title:
                    title = m_title.group(1).strip()
                m_tags = re.search(r'tags:\s*\[(.*?)\]', frontmatter)
                if m_tags:
                    tags = [t.strip() for t in m_tags.group(1).split(",")]

        if tag_filter and tag_filter.lower() not in [t.lower() for t in tags]:
            continue

        score = 0
        content_lower = content.lower()
        title_lower = title.lower()

        for term in terms:
            if term in title_lower:
                score += 15
            for tag in tags:
                if term in tag.lower():
                    score += 10
            matches = content_lower.count(term)
            score += min(matches, 10)

        if score > 0 or (not terms and tag_filter):
            rel_path = md_file.relative_to(WIKI_DIR)
            results.append((score, title, str(rel_path), tags))

    results.sort(key=lambda x: x[0], reverse=True)
    return results

def main():
    if len(sys.argv) < 2:
        print("İstifadə: python3 wiki/tools/search.py <axtarış sözü> [--tag <teq>]")
        sys.exit(1)

    tag = None
    query_parts = []
    i = 1
    while i < len(sys.argv):
        if sys.argv[i] == "--tag" and i + 1 < len(sys.argv):
            tag = sys.argv[i + 1]
            i += 2
        else:
            query_parts.append(sys.argv[i])
            i += 1

    query = " ".join(query_parts)
    results = search_wiki(query, tag)

    print(f"\n🔍 Axtarış Nəticələri: '{query}' (Tapıldı: {len(results)})\n" + "="*60)
    for score, title, path, tags in results[:10]:
        print(f"⭐ [{score:2d} bal] {title}")
        print(f"   📁 Keçid: [[{path[:-3]}]]")
        if tags:
            print(f"   🏷️  Teqlər: {', '.join(tags)}")
        print("-" * 60)

if __name__ == "__main__":
    main()
