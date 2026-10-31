# 📜 InvestArea LLM Wiki — Xronoloji Əməliyyat Jurnalı (`log.md`)

> **Qeyd:** Bu fayl davamlı əlavə olunan (append-only) qeydiyyat jurnalidir. Hər bir əməliyyat (ingest, query, lint) standart prefiks ilə qeyd olunur.

---

## [2026-10-27] init | LLM Wiki Arxitekturasının Qurulması
- **Əməliyyat:** InvestArea layihəsi üçün davamlı və sintez olunan LLM Wiki infrastrukturunun yaradılması.
- **Yaradılan Strukturlar:**
  - `wiki/AGENTS.md` (Schema və idarəetmə qaydaları)
  - `wiki/index.md` (Məzmun kataloqu)
  - `wiki/log.md` (Xronoloji jurnal)
  - `wiki/raw/`, `wiki/entities/`, `wiki/concepts/`, `wiki/comparisons/`, `wiki/synthesis/`
- **İlkin İcra:** 4 xammal sənədin ingesti, 8 entity səhifəsi, 6 concept səhifəsi, 1 müqayisə və 1 sintez sənədinin formalaşdırılması.

## [2026-10-27] ingest | musabiqe_sherteri.md
- **Mənbə:** [[raw/musabiqe_sherteri]] (Azərbaycan Respublikası Prezidentinin 236 №-li Fərmanı)
- **Təsir Sahələri:** [[concepts/agro_ai_ve_roi_skorinq]], [[entities/ktn]], [[synthesis/karabakh_aqrar_investisiya_strategiyasi]]
- **Nəticə:** 100 ballıq qiymətləndirmə meyarları, 10% maliyyə təminatı tələbi və 2 illik investisiya öhdəliyi qaydaları çıxarıldı.

## [2026-10-27] ingest | ladm_iso19152_kadastr_standarti.md
- **Mənbə:** [[raw/ladm_iso19152_kadastr_standarti]] (ISO 19152 LADM & FAO SOLA spesifikasiyası)
- **Təsir Sahələri:** [[concepts/ladm_iso19152]], [[entities/emdx]]
- **Nəticə:** Party, RRR, BAUnit və SpatialUnit strukturu layihənin PostgreSQL bazası ilə əlaqələndirildi.

## [2026-10-27] ingest | karabakh_agro_geoinformation_data.md
- **Mənbə:** [[raw/karabakh_agro_geoinformation_data]] (QGIS GeoJSON layları və relyef analizi)
- **Təsir Sahələri:** [[entities/agdam]], [[entities/fuzuli]], [[entities/cebrayil]], [[entities/zengilan]], [[entities/lacin]], [[concepts/torpaq_boniteti_ve_qiymetlendirme]], [[concepts/suvarma_ve_su_ehtiyatlari]]
- **Nəticə:** Bütün 6 əsas rayon üzrə torpaq boniteti, su ehtiyatları və ilkin lot məlumatları yaradıldı.

## [2026-10-27] lint | İlkin Bütövlük Yoxlanışı
- **Nəticə:** Bütün 16 markdown səhifəsi yoxlanıldı. 0 yetim səhifə (orphan page) aşkarlandı, bütün linklər `[[wikilinks]]` formatındadır və `index.md`-yə çıxışı var.
- **Qadağan olunmuş ifadələr:** Sıfır tapıntı (100% təmiz).
