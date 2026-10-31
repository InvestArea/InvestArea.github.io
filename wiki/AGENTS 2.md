# 🧠 LLM Wiki — Schema & Operating Instructions (`AGENTS.md`)

> **Ecosystem:** InvestArea — Qarabağ və Şərqi Zəngəzur Rəqəmsal Aqrar İnvestisiya və Torpaq İdarəetmə Ekosistemi  
> **Vault Path:** `wiki/`  
> **Conventions:** Obsidian-first (`[[wikilinks]]`), YAML Frontmatter, Compounding Markdown Artifacts.

---

## 🏛️ Əsas Fəlsəfə və Məqsəd

Ənənəvi RAG (Retrieval-Augmented Generation) sistemləri hər sorğuda xammal sənədlərdən sıfırdan parça toplayır və heç bir davamlı bilik toplanmır. **LLM Wiki** isə tamamilə fərqli bir paradiqmadır:
1. **Davamlı və Zənginləşən Baza (Compounding Artifact):** LLM hər yeni mənbə əlavə olunduqda bilikləri sintez edir, subyekt və anlayış səhifələrini yeniləyir, çarpaz əlaqələr (`[[wikilinks]]`) qurur və ziddiyyətləri dərhal qeyd edir.
2. **Rol Bölgüsü:**
   - **İstifadəçi (Siz):** Mənbələri seçir, istiqaməti müəyyən edir, strateji suallar verir və nəticələri Obsidian-da canlı izləyir.
   - **LLM Agent:** Bütün qara işi — oxuma, icmal çıxarma, çarpaz əlaqələndirmə, səhifələri aktual saxlama və arxivi idarə etmə işlərini icra edir.
3. **Obsidian İnteqrasiyası:** Obsidian IDE kimidir, LLM proqramçıdır, Wiki isə kod bazasıdır. Bütün səhifələr Obsidian-ın Graph View, Dataview və Axtarış alətləri ilə 100% uyğundur.

---

## 📂 Qovluq Strukturu

```
wiki/
├── AGENTS.md        # Bu təlimat və idarəetmə qaydaları (Schema)
├── index.md         # Bütün mövzuların və səhifələrin məzmun kataloqu
├── log.md           # Xronoloji əməliyyat jurnalı (Ingest, Query, Lint)
├── raw/             # Xammal, toxunulmaz ilkin sənədlər (PDF, qanunlar, protokollar)
├── entities/        # Konkret subyektlər: Rayonlar, dövlət qurumları, təşkilatlar
├── concepts/        # Əsas anlayışlar: Bonitet, LADM, suvarma, ANAMA, NDVI, Aqro-AI
├── comparisons/     # Yan-yana müqayisələr və parametrik analizlər
└── synthesis/       # Dərin strateji təhlillər və suallardan doğan qalıcı hesabatlar
```

---

## 📋 Səhifə Standartları və Formatı

Hər bir wiki səhifəsi aşağıdakı YAML frontmatter ilə başlamalıdır:

```yaml
---
title: "Səhifənin Adı"
type: entity | concept | comparison | source | synthesis
tags: [agrotech, gis, karabakh, ladm, ektis]
date: YYYY-MM-DD
updated: YYYY-MM-DD
status: verified | draft | in-review
sources: ["[[raw/source_file]]"]
---
```

### Əlaqələndirmə Qaydaları:
- Digər səhifələrə keçid üçün yalnız Obsidian formatlı ikiqat mötərizə `[[sehife_adi]]` istifadə olunur.
- Heç bir səhifə təcrid olunmuş («yetim» / orphan) qala bilməz; ən azı 2-3 əlaqəli səhifəyə və `index.md`-yə çıxışı olmalıdır.
- **Qəti Qadağa:** Müsabiqə dərəcələri və yerləri haqqında subyektiv iddiaların qeyd olunması qadağandır.

---

## ⚡ Əsas Əməliyyatlar (Operations)

### 1. Ingest (Mənbənin Daxil Edilməsi)
İstifadəçi `wiki/raw/` qovluğuna yeni fayl əlavə etdikdə və ya mətn verdikdə LLM:
1. Mənbəni tam oxuyur və əsas faktları, rəqəmləri, qanuni tələbləri təhlil edir.
2. `wiki/raw/` daxilində sənədin rəqəmsal xülasəsini formalaşdırır.
3. Müvafiq `entities/` və `concepts/` səhifələrini tapır və yeni faktlarla zənginləşdirir (lazım gələrsə yeni səhifələr yaradır).
4. Köhnə məlumatlarla yeni mənbə arasında ziddiyyət varsa, «⚠️ Ziddiyyət Qeydi» bölməsində vurğulayır.
5. `wiki/index.md` faylında məzmun cədvəlini yeniləyir.
6. `wiki/log.md` faylına aşağıdakı formatda qeyd əlavə edir:
   ```markdown
   ## [YYYY-MM-DD] ingest | Mənbənin Adı
   - Əlaqələndirilən səhifələr: [[entity_a]], [[concept_b]]
   - Əsas yenilik: ...
   ```

### 2. Query (Sual & Sintez)
İstifadəçi mürəkkəb sual verdikdə LLM:
1. İlk öncə `wiki/index.md` və əlaqəli səhifələri oxuyur.
2. Səhifələr arasında əlaqələri çarpaz yoxlayaraq arqumentləşdirilmiş cavab hazırlayır.
3. Əgər verilən cavab dəyərli, yeni və ya təkrar istifadə edilə bilən strateji analizdirsə, onu `wiki/synthesis/` və ya `wiki/comparisons/` qovluğunda yeni qalıcı səhifə kimi bazaya yazır.

### 3. Lint (Sağlamlıq və Bütövlük Yoxlanışı)
Dövri olaraq (və ya istifadəçinin tələbi ilə) LLM:
1. Giriş keçidi olmayan «yetim» (orphan) səhifələri aşkarlayır və əlaqələndirir.
2. Səhifələr arasındakı ziddiyyətləri siyahılayır.
3. Doldurulmamış və ya gələcək araşdırma tələb edən mövzuları «Araşdırma Boşluqları» kimi qeyd edir.
4. Nəticələri `wiki/log.md` faylına `lint` əməliyyatı kimi qeyd edir.
