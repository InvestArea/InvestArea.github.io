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

## [2026-10-28] ingest | karabakh_parceller_ve_kadastr_lotlari.md
- **Mənbə:** [[raw/karabakh_parceller_ve_kadastr_lotlari]] (`public/gis/karabakh_parcels.geojson`)
- **Təsir Sahələri:** [[entities/qubadli]], [[entities/xocavend]], [[entities/shusha]], [[entities/xocali]], [[entities/kelbecer]]
- **Nəticə:** 10 model kadastr parseli (sahə, bonitet, suvarma növü, ANAMA sertifikatı, tələb olunan iş yerləri) bazaya daxil edildi.

## [2026-10-28] ingest | pentest_tehlukesizlik_hesabati.md
- **Mənbə:** [[raw/pentest_tehlukesizlik_hesabati]] (`docs/pentest_report_final.md`)
- **Təsir Sahələri:** [[concepts/kibertehlukesizlik_ve_rbac]], [[entities/sima_ve_asan_imza]]
- **Nəticə:** HMAC-SHA256 JWT, RBAC middleware, dövlət sistemlərarası təhlükəsizlik və status sıçrayışlarının qorunması qaydaları sintez olundu.

## [2026-10-28] ingest | teqdimat_video_ve_ssenari.md
- **Mənbə:** [[raw/teqdimat_video_ve_ssenari]] (`docs/InvestArea_2_Deqiqelik_Tam_Teqdimat_Metni.md`)
- **Təsir Sahələri:** [[concepts/elektron_muraciet_ve_izleme_wizard]], [[concepts/kooperativ_klasterlesme]], [[synthesis/investor_yol_xeritesi_step_by_step]]
- **Nəticə:** İnvestor və sahibkar istifadəçi təcrübəsi, 4 addımlı müraciət, canlı hərrac və monitorinq modulları sənədləşdirildi.

## [2026-10-28] expand | Dövlət Qurumları və İqtisadi Analiz
- **Yeni Səhifələr:**
  - Entities: [[entities/iqtisadiyyat_nazirliyi]], [[entities/etsn]], [[entities/adsea]], [[entities/dovlet_vergi_xidmeti_avis]], [[entities/terter]]
  - Comparisons: [[comparisons/bitkiler_ve_aqrar_gelirlilik_roi]], [[comparisons/suvarma_texnologiyalari_damlama_pivot_yagis]], [[comparisons/dovlet_qurumlari_ve_selahiyyet_bolgusu]]
  - Synthesis: [[synthesis/investor_yol_xeritesi_step_by_step]], [[synthesis/qarabag_erzaq_tehlukesizliyi_ve_ixrac_potensiali]]
  - Tools: `wiki/tools/search.py`, `wiki/tools/lint.py`

## [2026-10-28] lint | Tam Bütövlük və Keçid Auditi
- **Nəticə:** 32 fayl və 80+ qarşılıqlı `[[wikilink]]` yoxlanıldı. Bütün keçidlər aktivdir və `index.md`-yə çıxış təmin edilib.
- **Təmizlik:** Qadağan olunmuş ifadələr üzrə 100% təmiz status təsdiqləndi.
