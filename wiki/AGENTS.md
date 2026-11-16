# Bilik Bazası — Sxem və İdarəetmə Qaydaları (AGENTS.md)

> Ekosistem: InvestArea — Qarabağ və Şərqi Zəngəzur Rəqəmsal Aqrar İnvestisiya və Torpaq İdarəetmə Ekosistemi  
> Baza Yolu: `wiki/`  
> Standartlar: Obsidian uyğunluğu (`[[wikilinks]]`), YAML Frontmatter, Strukturlaşdırılmış Markdown Sənədləri.

---

## Əsas Konsepsiya və Məqsəd

Bilik bazası layihənin bütün texniki, hüquqi və aqronomik sənədlərini mərkəzləşdirilmiş və əlaqələndirilmiş şəkildə saxlayan davamlı məlumat ekosistemidir:
1. Davamlı Məlumat Arxitekturası: Hər yeni rəsmi mənbə və qanunvericilik aktı daxil edildikdə baza sintez olunur, subyekt və anlayış səhifələri yenilənir, çarpaz əlaqələr (`[[wikilinks]]`) qurulur və normativ ziddiyyətlər qeyd olunur.
2. Strukturlaşdırılmış Əməkdaşlıq:
   - Mütəxəssis / Auditor: İlkin mənbələri təyin edir, analitik sorğuları formalaşdırır və sistemin fəaliyyətini nəzarətdə saxlayır.
   - Analitik Alqoritm və Skriptlər: Sənədlərin təhlili, çarpaz indekslənməsi, qraf əlaqələrinin qurulması və məlumatların tamlığının yoxlanılması əməliyyatlarını həyata keçirir.
3. Qraf və Məlumat İnteqrasiyası: Bütün səhifələr qraf analizi (Graph View), strukturlaşdırılmış məlumat sorğuları (Dataview) və axtarış sistemləri ilə tam uyğundur.

---

## Qovluq Strukturu

```
wiki/
├── AGENTS.md        # İdarəetmə qaydaları və standartlar (Sxem)
├── index.md         # Bütün mövzuların və səhifələrin məzmun kataloqu
├── log.md           # Xronoloji əməliyyat jurnalı (Ingest, Query, Lint)
├── raw/             # Xammal ilkin sənədlər (PDF, qanunlar, normativ aktlar)
├── entities/        # Subyektlər: Rayonlar, dövlət qurumları, təşkilatlar
├── concepts/        # Əsas anlayışlar: Bonitet, LADM, suvarma, ANAMA, NDVI, aqronomik analitika
├── comparisons/     # Yan-yana müqayisələr və parametrik analizlər
└── synthesis/       # Dərin strateji təhlillər və yekun hesabatlar
```

---

## Səhifə Standartları və Formatı

Hər bir səhifə aşağıdakı YAML frontmatter ilə başlayır:

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
- Digər səhifələrə keçid üçün Obsidian formatlı ikiqat mötərizə `[[sehife_adi]]` istifadə olunur.
- Heç bir səhifə əlaqəsiz qala bilməz; ən azı 2-3 əlaqəli səhifəyə və `index.md`-yə istinadı olmalıdır.

---

## Əsas Əməliyyatlar (Operations)

### 1. Ingest (Mənbənin Daxil Edilməsi)
İlkin mənbə `wiki/raw/` qovluğuna əlavə edildikdə:
1. Mənbə tam oxunur, əsas faktlar, rəqəmlər və hüquqi tələblər təhlil edilir.
2. `wiki/raw/` daxilində sənədin xülasəsi formalaşdırılır.
3. Müvafiq `entities/` və `concepts/` səhifələri yeni faktlarla zənginləşdirilir.
4. Köhnə məlumatlarla yeni mənbə arasında uyğunsuzluq varsa, ziddiyyət qeydi aparılır.
5. `wiki/index.md` faylında məzmun cədvəli yenilənir.
6. `wiki/log.md` faylına qeyd əlavə edilir.

### 2. Query (Sorğu və Sintez)
Mürəkkəb analitik sorğu icra edildikdə:
1. `wiki/index.md` və əlaqəli səhifələr nəzərdən keçirilir.
2. Səhifələr arasında əlaqələr çarpaz yoxlanaraq əsaslandırılmış arxitektura cavabı hazırlanır.
3. Əgər nəticə davamlı strateji əhəmiyyət kəsb edirsə, `wiki/synthesis/` və ya `wiki/comparisons/` qovluğunda qalıcı sənəd kimi qeydə alınır.

### 3. Lint (Bütövlük və Sağlamlıq Yoxlanışı)
Dövri yoxlama zamanı:
1. Keçidi olmayan səhifələr aşkarlanır və əlaqələndirilir.
2. Ziddiyyətlər və çatışmayan normativ istinadlar müəyyən edilir.
3. Nəticələr `wiki/log.md` faylına qeyd edilir.
