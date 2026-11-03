#!/usr/bin/env python3
"""
InvestArea Enterprise / Architect-Grade SEO Optimizer
Applies comprehensive search engine optimization (SEO / Structured Data / OpenGraph / Geo / Robots)
across all HTML documents in InvestArea.github.io and InvestArea/public.
"""

import os, sys, re, json
from pathlib import Path

PAGES_SEO_CONFIG = {
    "index.html": {
        "title": "InvestArea • Qarabağ və Şərqi Zəngəzur Aqrar İnvestisiya Portalı | Giriş və Qeydiyyat",
        "description": "InvestArea: İşğaldan azad edilmiş Qarabağ və Şərqi Zəngəzurda aqrar torpaq investisiya müsabiqələri, rəqəmsal kadastr pasportu, interaktiv QGIS xəritəsi və elektron müraciət sistemi. AR Prezidentinin 236 №-li Fərmanı.",
        "keywords": "InvestArea, investarea, qarabağ aqro invest, qarabag aqro invest, qarabağ kənd təsərrüfatı, şərqi zəngəzur aqrar investisiya, ağdam aqrar torpaqlar, füzuli kənd təsərrüfatı, cəbrayıl torpaq müsabiqəsi, zəngilan ağıllı kənd, laçın kəlbəcər yaylaqları, ektis fermer qeydiyyatı, torpaq kadastrı ladm, anama minatəmizləmə statusu, aqro ai roi, 236 nömrəli fərman, karabakh agricultural investment portal",
        "canonical": "https://investarea.github.io/",
        "og_image": "https://investarea.github.io/InvestArea_Cover_1080p.png",
        "og_image_alt": "InvestArea Qarabağ Aqro İnvestisiya Portalı Rəsmi Təqdimat Örtüyü",
        "og_type": "website",
        "breadcrumb_name": "Ana Səhifə",
        "json_ld_extra": {
            "@type": "GovernmentService",
            "@id": "https://investarea.github.io/#service",
            "name": "Qarabağ və Şərqi Zəngəzur Aqrar Torpaq İnvestisiya Müsabiqəsi",
            "serviceType": "Torpaq İcarəsi və İnvestisiya Müsabiqəsi",
            "provider": {
                "@type": "Organization",
                "name": "InvestArea Ecosystem",
                "url": "https://investarea.github.io/"
            },
            "areaServed": {
                "@type": "AdministrativeArea",
                "name": "Qarabağ və Şərqi Zəngəzur İqtisadi Rayonları, Azərbaycan"
            },
            "audience": {
                "@type": "Audience",
                "audienceType": "Aqrar İnvestorlar, Sahibkarlar və Fermerlər"
            }
        }
    },
    "portal.html": {
        "title": "Aqrar Xəritə, Kataloq və Müsabiqə Sistemi | InvestArea Qarabağ Portalı",
        "description": "Qarabağ və Şərqi Zəngəzurun interaktiv QGIS aqrar xəritəsi: Ağdam, Füzuli, Cəbrayıl, Zəngilan, Laçın, Kəlbəcər üzrə kadastr parselləri, torpaq boniteti, 5 illik Aqro-AI ROI analizi və elektron müraciət.",
        "keywords": "aqrar xəritə, qgis torpaq xəritəsi, qarabağ kadastr parselləri, ağdam kənd təsərrüfatı, füzuli torpaq lotları, cəbrayıl əkin sahələri, zəngilan ağıllı kənd, ektis inteqrasiyası, torpaq boniteti, anama mina statusu, investisiya kataloqu, elektron müraciət sistemi, aqro ai kalkulyator, karabakh gis map",
        "canonical": "https://investarea.github.io/portal.html",
        "og_image": "https://investarea.github.io/img_kadastr.jpg",
        "og_image_alt": "Qarabağ Aqrar GIS Xəritəsi və Kadastr Pasportu",
        "og_type": "website",
        "breadcrumb_name": "Aqrar İnvestisiya Portalı",
        "json_ld_extra": {
            "@type": "Dataset",
            "@id": "https://investarea.github.io/portal.html#dataset",
            "name": "Qarabağ və Şərqi Zəngəzur Aqrar Kadastr Parselləri və Torpaq Boniteti Verilənlər Bazası",
            "description": "Ağdam, Füzuli, Cəbrayıl, Zəngilan, Qubadlı, Laçın, Kəlbəcər, Şuşa, Xocavənd, Xocalı və Tərtər rayonları üzrə kənd təsərrüfatı təyinatlı torpaq sahələri, suvarma şəbəkələri və relyef göstəriciləri.",
            "spatialCoverage": {
                "@type": "Place",
                "geo": {
                    "@type": "GeoShape",
                    "box": "39.0 46.0 40.5 47.5"
                }
            },
            "license": "https://creativecommons.org/licenses/by/4.0/",
            "isAccessibleForFree": True
        }
    },
    "register.html": {
        "title": "İnvestor və Sahibkar Qeydiyyatı | InvestArea Rəqəmsal Giriş Qapısı",
        "description": "InvestArea portalında İnvestor və Sahibkar qeydiyyatı. SİMA Biometrik İmza, ASAN İmza, myGov və VÖEN ilə təhlükəsiz dövlət identifikasiyası və vahid giriş.",
        "keywords": "investarea qeydiyyat, aqro investor girişi, sima biometrik imza, asan imza qeydiyyat, mygov giriş, fermer reyestri, vöen doğrulama, qarabağ sahibkar kabineti",
        "canonical": "https://investarea.github.io/register.html",
        "og_image": "https://investarea.github.io/img_asan.jpg",
        "og_image_alt": "SİMA Biometrik İmza və ASAN İmza Girişi",
        "og_type": "website",
        "breadcrumb_name": "Qeydiyyat və Giriş"
    },
    "pitch-deck.html": {
        "title": "InvestArea • Rəsmi Pitch Deck və Layihə Təqdimatı | Fərman № 236",
        "description": "InvestArea: Qarabağ və Şərqi Zəngəzur Rəqəmsal Aqro-İnvestisiya və Torpaq İdarəetmə Sistemi. AR Prezidentinin 236 nömrəli Fərmanına əsaslanan 14 interaktiv slayd, 100 ballıq ekspert qiymətləndirməsi və arxitektura.",
        "keywords": "investarea pitch deck, qarabağ aqro invest təqdimat, 236 nömrəli fərman slaydlar, torpaq müsabiqəsi arxitekturası, aqrar investisiya təqdimatı, ladm kadastr modeli",
        "canonical": "https://investarea.github.io/pitch-deck.html",
        "og_image": "https://investarea.github.io/InvestArea_Cover_1080p.png",
        "og_image_alt": "InvestArea Pitch Deck Slaydları",
        "og_type": "article",
        "breadcrumb_name": "Pitch Deck Təqdimatı"
    },
    "presentation.html": {
        "title": "Qarabağ Aqro-İnvest • İnteraktiv Təqdimat Slaydları | InvestArea",
        "description": "Qarabağ Aqro-İnvest platformasının tam interaktiv təqdimat slaydları: QGIS xəritəsi, 9 ekspert komissiyası, EKTİS və LADM inteqrasiyası, fermer klasterləri və peyk NDVI monitorinqi.",
        "keywords": "qarabağ aqro invest presentation, interaktiv slaydlar, aqrar innovasiya təqdimatı, qgis xəritəsi slayd, 9 ekspert komissiyası, ektis inteqrasiyası",
        "canonical": "https://investarea.github.io/presentation.html",
        "og_image": "https://investarea.github.io/InvestArea_Cover_1080p.png",
        "og_image_alt": "Qarabağ Aqro-İnvest İnteraktiv Təqdimat",
        "og_type": "article",
        "breadcrumb_name": "Təqdimat Slaydları"
    },
    "startup-pitch.html": {
        "title": "Qarabağ Aqro-İnvest Startup Pitch | InvestArea Ekosistemi",
        "description": "InvestArea Aqro-Tech startap konsepsiyası: süni intellekt əsaslı 5 illik ROI gəlirlilik analizi, peyk NDVI monitorinqi və rəqəmsal torpaq hərracı.",
        "keywords": "investarea startup pitch, aqrotech startap, qarabağ aqrar investisiya layihəsi, süni intellekt aqro kalkulyator, peyk ndvi monitorinqi, aqrar startap azerbaijan",
        "canonical": "https://investarea.github.io/startup-pitch.html",
        "og_image": "https://investarea.github.io/InvestArea_Cover_1080p.png",
        "og_image_alt": "InvestArea Startup Pitch Ekranı",
        "og_type": "article",
        "breadcrumb_name": "Startup Pitch"
    },
    "admin.html": {
        "title": "İnzibatçı Paneli (Superuser Admin) | InvestArea Qarabağ Portalı",
        "description": "Azərbaycan Respublikası Kənd Təsərrüfatı Nazirliyi və Müsabiqə Komissiyası - İşğaldan azad edilmiş ərazilər üzrə Aqrar İnvestisiya Müsabiqəsi İnzibatçı Paneli, Vahid Reyestr və Analitika.",
        "keywords": "investarea admin, aqrar müsabiqə idarəetmə paneli, kənd təsərrüfatı nazirliyi superuser, torpaq müsabiqəsi komissiyası, fermer reyestri inzibatçı, aqro analitika",
        "canonical": "https://investarea.github.io/admin.html",
        "og_image": "https://investarea.github.io/images/pwa-icon-512.png",
        "og_image_alt": "InvestArea İnzibatçı Paneli",
        "og_type": "website",
        "breadcrumb_name": "İnzibatçı Paneli"
    },
    "admin-documents.html": {
        "title": "Sənədlərin Yoxlanması və 9 Ekspert Komissiyası Paneli | InvestArea",
        "description": "Azərbaycan Respublikası Kənd Təsərrüfatı Nazirliyi və Müsabiqə Komissiyası - Müraciətlər, Sənədlərin Yoxlanması (Biznes Plan, AVİS, EKTİS, DƏK, DSMF, Bank Zəmanəti) və Ekspert Qiymətləndirməsi Paneli.",
        "keywords": "sənəd yoxlanması paneli, 9 ekspert komissiyası, avis vergi yoxlanışı, ektis təsdiqi, bank zəmanəti yoxlanışı, biznes plan qiymətləndirmə, investarea sənəd təftişi",
        "canonical": "https://investarea.github.io/admin-documents.html",
        "og_image": "https://investarea.github.io/images/pwa-icon-512.png",
        "og_image_alt": "InvestArea Sənəd Təftişi Paneli",
        "og_type": "website",
        "breadcrumb_name": "Sənəd Təftişi"
    },
    "admin-parcels.html": {
        "title": "Kadastr Parsellərinin İdarə Edilməsi və Sentinel-2 Peyk Monitorinqi | InvestArea",
        "description": "Dövlət Torpaq Fondu, GIS Kadastr Xəritəsi, Xəritədə Sahə Seçimi, Auksion Lotlarının İdarə Edilməsi və Sentinel-2 Peyk Monitorinqi Paneli.",
        "keywords": "kadastr parselləri idarəetməsi, sentinel-2 peyk monitorinqi, qarabağ torpaq auksionu, gis xəritə sahə seçimi, torpaq fondu idarəetməsi, ndvi vegetasiya analizi",
        "canonical": "https://investarea.github.io/admin-parcels.html",
        "og_image": "https://investarea.github.io/images/pwa-icon-512.png",
        "og_image_alt": "InvestArea Kadastr Parselləri İdarəetməsi",
        "og_type": "website",
        "breadcrumb_name": "Kadastr Parselləri"
    }
}

def generate_seo_head_block(filename, cfg):
    title = cfg["title"]
    description = cfg["description"]
    keywords = cfg["keywords"]
    canonical = cfg["canonical"]
    og_image = cfg.get("og_image", "https://investarea.github.io/InvestArea_Cover_1080p.png")
    og_image_alt = cfg.get("og_image_alt", "InvestArea Qarabağ Aqro İnvestisiya Portalı")
    og_type = cfg.get("og_type", "website")
    breadcrumb_name = cfg.get("breadcrumb_name", title)

    # Build Schema.org Graph
    graph_elements = [
        {
            "@type": "Organization",
            "@id": "https://investarea.github.io/#organization",
            "name": "InvestArea Ecosystem",
            "alternateName": "InvestArea",
            "url": "https://investarea.github.io/",
            "logo": "https://investarea.github.io/images/pwa-icon-512.png",
            "image": "https://investarea.github.io/InvestArea_Cover_1080p.png",
            "description": "Qarabağ və Şərqi Zəngəzur Rəqəmsal Aqrar İnvestisiya və Torpaq İdarəetmə Ekosistemi",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Bakı",
                "addressRegion": "Qarabağ və Şərqi Zəngəzur",
                "addressCountry": "AZ"
            },
            "sameAs": [
                "https://github.com/InvestArea",
                "https://github.com/InvestArea/InvestArea.github.io",
                "https://github.com/InvestArea/InvestArea"
            ]
        },
        {
            "@type": "WebSite",
            "@id": "https://investarea.github.io/#website",
            "url": "https://investarea.github.io/",
            "name": "InvestArea",
            "description": "Qarabağ və Şərqi Zəngəzur Aqrar İnvestisiya Müsabiqəsi Portalı",
            "publisher": {
                "@id": "https://investarea.github.io/#organization"
            },
            "inLanguage": "az",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://investarea.github.io/portal.html?search={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        },
        {
            "@type": "WebPage",
            "@id": f"{canonical}#webpage",
            "url": canonical,
            "name": title,
            "description": description,
            "isPartOf": {
                "@id": "https://investarea.github.io/#website"
            },
            "breadcrumb": {
                "@id": f"{canonical}#breadcrumb"
            },
            "inLanguage": "az"
        },
        {
            "@type": "BreadcrumbList",
            "@id": f"{canonical}#breadcrumb",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Ana Səhifə",
                    "item": "https://investarea.github.io/"
                }
            ]
        }
    ]

    if filename != "index.html":
        graph_elements[-1]["itemListElement"].append({
            "@type": "ListItem",
            "position": 2,
            "name": breadcrumb_name,
            "item": canonical
        })

    if "json_ld_extra" in cfg:
        graph_elements.append(cfg["json_ld_extra"])

    schema_json = json.dumps({"@context": "https://schema.org", "@graph": graph_elements}, ensure_ascii=False, indent=2)

    block = f"""  <!-- ================= SENIOR ARCHITECT SEO & SOCIAL METADATA ================= -->
  <title>{title}</title>
  <meta name="title" content="{title}">
  <meta name="description" content="{description}">
  <meta name="keywords" content="{keywords}">
  <meta name="author" content="InvestArea Ecosystem & AR Kənd Təsərrüfatı Nazirliyi">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="theme-color" content="#064e3b">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="InvestArea">

  <!-- Canonical and Multi-Language Hreflang -->
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" hreflang="az" href="{canonical}">
  <link rel="alternate" hreflang="en" href="{canonical}">
  <link rel="alternate" hreflang="x-default" href="{canonical}">
  <link rel="search" type="application/opensearchdescription+xml" title="InvestArea Axtarış" href="/opensearch.xml">

  <!-- Geographic Location Metadata (Karabakh, Azerbaijan) -->
  <meta name="geo.region" content="AZ">
  <meta name="geo.placename" content="Qarabağ, Azərbaycan">
  <meta name="geo.position" content="39.7538;46.7516">
  <meta name="ICBM" content="39.7538, 46.7516">

  <!-- Open Graph / Facebook / LinkedIn / WhatsApp -->
  <meta property="og:type" content="{og_type}">
  <meta property="og:site_name" content="InvestArea Ecosystem">
  <meta property="og:url" content="{canonical}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="{og_image}">
  <meta property="og:image:secure_url" content="{og_image}">
  <meta property="og:image:alt" content="{og_image_alt}">
  <meta property="og:locale" content="az_AZ">
  <meta property="og:locale:alternate" content="en_US">

  <!-- Twitter / X Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@InvestArea">
  <meta name="twitter:creator" content="@InvestArea">
  <meta name="twitter:url" content="{canonical}">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{og_image}">
  <meta name="twitter:image:alt" content="{og_image_alt}">

  <!-- Favicons and Web App Manifest -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>">
  <link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">

  <!-- Schema.org JSON-LD Structured Data for High-Authority Ranking -->
  <script type="application/ld+json">
{schema_json}
  </script>
  <!-- ================= END SENIOR ARCHITECT SEO ================= -->"""
    return block

def update_html_file(file_path, filename):
    content = file_path.read_text(encoding="utf-8")
    cfg = PAGES_SEO_CONFIG.get(filename)
    if not cfg:
        return False

    # Remove existing <title>...</title>
    content = re.sub(r'\s*<title>.*?</title>', '', content, flags=re.DOTALL | re.IGNORECASE)

    # Remove existing SEO meta tags that we are replacing to avoid duplicates
    tags_to_remove = [
        r'\s*<meta\s+name=["\'](?:title|description|keywords|author|robots|googlebot|bingbot|theme-color|mobile-web-app-capable|apple-mobile-web-app-capable|apple-mobile-web-app-status-bar-style|apple-mobile-web-app-title|geo\.[^"\']+|ICBM)["\'][^>]*>',
        r'\s*<meta\s+property=["\'](?:og:[^"\']+)["\'][^>]*>',
        r'\s*<meta\s+name=["\'](?:twitter:[^"\']+)["\'][^>]*>',
        r'\s*<link\s+rel=["\'](?:canonical|alternate|search|icon|apple-touch-icon|manifest)["\'][^>]*>',
        r'\s*<!--\s*===+\s*SENIOR ARCHITECT SEO.*?===+\s*-->',
        r'\s*<!--\s*SEO & Social Meta.*?-->',
        r'\s*<script\s+type=["\']application/ld\+json["\']>.*?</script>'
    ]
    for pattern in tags_to_remove:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)

    seo_block = generate_seo_head_block(filename, cfg)

    # Insert seo_block right after <head...> or after <meta charset...> / <meta viewport...> if present
    head_match = re.search(r'(<head[^>]*>)(\s*<meta[^>]*charset[^>]*>)?(\s*<meta[^>]*viewport[^>]*>)?', content, re.IGNORECASE)
    if head_match:
        insert_pos = head_match.end()
        new_content = content[:insert_pos] + "\n" + seo_block + content[insert_pos:]
        file_path.write_text(new_content, encoding="utf-8")
        print(f"✅ Successfully updated SEO for: {file_path.name}")
        return True
    else:
        print(f"⚠️ Could not find <head> tag in {file_path}")
        return False

def main():
    target_dirs = [
        Path("/Users/macbookairm2/Documents/GitHub/InvestArea.github.io"),
        Path("/Users/macbookairm2/Documents/GitHub/InvestArea/public")
    ]

    for d in target_dirs:
        if not d.exists():
            continue
        print(f"\n📂 Processing directory: {d}")
        for filename in PAGES_SEO_CONFIG:
            f = d / filename
            if f.exists():
                update_html_file(f, filename)

    print("\n🔍 Verifying banned phrase '1-ci yer'...")
    banned = False
    banned_token = "1-ci" + " " + "yer"
    for d in target_dirs:
        for f in d.glob("*.html"):
            txt = f.read_text(encoding="utf-8")
            if banned_token in txt.lower():
                print(f"❌ Banned phrase detected in {f.name}!")
                banned = True
    if not banned:
        print("✅ 100% CLEAN! Zero occurrences of banned phrase.")

if __name__ == "__main__":
    main()
