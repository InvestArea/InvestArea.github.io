# 🗂️ InvestArea LLM Wiki — Əsas Məzmun Kataloqu (`index.md`)

> **Xoş gəlmisiniz!** Bu fayl InvestArea ekosistemi üzrə toplanmış, çarpaz əlaqələndirilmiş və daima yenilənən bütün rəsmi wiki səhifələrinin mərkəzi naviqatorudur.  
> **İdarəedici:** LLM Agent & İstifadəçi | **Konvensiyalar:** [[wiki/AGENTS|AGENTS.md]]

---

## 🏛️ Əsas İdarəetmə və Alətlər
- [[wiki/AGENTS|AGENTS.md (Schema)]] — LLM Wiki-nin idarəetmə qaydaları, Ingest, Query və Lint prosedurları.
- [[wiki/log|log.md (Activity Log)]] — Bütün əməliyyatların xronoloji fəaliyyət jurnalı.
- `wiki/tools/search.py` — Terminal üzərindən açarsöz və teq üzrə daxili axtarış mühərriki.
- `wiki/tools/lint.py` — Bütövlük, qırıq linklər və ziddiyyətləri aşkar edən linter aləti.

---

## 📚 1. Xammal Mənbələr (`raw/`)
- [[raw/musabiqe_sherteri|Müsabiqə Qaydaları və Şərtləri]] — 236 №-li Prezident Fərmanı, iştirakçı tələbləri və 100 ballıq meyarlar.
- [[raw/ladm_iso19152_kadastr_standarti|ISO 19152 LADM & FAO SOLA]] — Torpaq kadastrı, hüquqlar (RRR) və PostgreSQL verilənlər bazası standartı.
- [[raw/ektis_integrasiya_texniki_telebleri|Dövlət Sistemləri ilə İnteqrasiya]] — EKTİS fermer reyestri, AVİS vergi arayışları, ANAMA mina zonaları və ƏMDX kadastrı.
- [[raw/karabakh_agro_geoinformation_data|CİS və QGIS Layihə Spesifikasiyası]] — Vektor GeoJSON layları, rayonlar, su hövzələri və koordinat təftişi.
- [[raw/karabakh_parceller_ve_kadastr_lotlari|Kadastr Parselləri Reyestri]] — 10 model lotun dəqiq koordinatları, sahəsi, torpaq boniteti, pH və ANAMA sertifikatları.
- [[raw/pentest_tehlukesizlik_hesabati|Kibertəhlükəsizlik və Pentest Hesabatı]] — HMAC-SHA256 JWT, RBAC, dövlət sistemlərinin qorunması və OWASP Top 10 auditi.
- [[raw/teqdimat_video_ve_ssenari|Spiker Ssenarisi və Modul Strukturu]] — 2 dəqiqəlik saniyəbəsaniyə layihə təqdimat mətni və ekran xəritəsi.
- [[raw/sola_ladm_verilenler_bazasi_sxemi|LADM & SOLA Verilənlər Bazası Cədvəlləri]] — PostgreSQL cədvəl strukturları, `LA_Party`, `LA_RRR` və `LA_SpatialUnit`.

---

## 📍 2. Subyektlər və Obyektlər (`entities/`)

### Rayonlar:
- [[entities/agdam|Ağdam Rayonu]] — Düzənlik taxılçılıq mərkəzi, Xaçınçay suvarma şəbəkəsi və AGD-2026-0012 lotu (120 ha).
- [[entities/fuzuli|Füzuli Rayonu]] — Köndələnçay hövzəsi, aqroparklar, FZL-2026-0045 lotu (85 ha) və pambıq/bağçılıq potensialı.
- [[entities/cebrayil|Cəbrayıl Rayonu]] — Arazboyu düzənliklər, Xudafərin və Qız Qalası su anbarları, CBR-2026-0078 aqroparkı (250 ha).
- [[entities/zengilan|Zəngilan Rayonu]] — Ağıllı kənd aqrotexnikası, Həkəri vadisi və yüksək bonitetli ZNG-2026-0102 istixana lotu (45 ha).
- [[entities/qubadli|Qubadlı Rayonu]] — Bərgüşad çayı hövzəsi, meyvəçilik, qoz-fındıq bağları və QBD-2026-0033 lotu (60 ha).
- [[entities/lacin|Laçın Rayonu]] — Zabux vadisi, intensiv heyvandarlıq və LCN-2026-0061 lotu (320 ha).
- [[entities/kelbecer|Kəlbəcər Rayonu]] — Tərtərçayın yuxarı axarı, mineral bulaqlar, arıçılıq və KLB-2026-0094 yaylaq lotu (180 ha).
- [[entities/shusha|Şuşa Şəhəri və Rayonu]] — Xüsusi ekoloji rejim, orqanik bağçılıq və SSA-2026-0015 lotu (35 ha).
- [[entities/xocavend|Xocavənd Rayonu]] — Hadrut və Tuğ üzümçülük ənənələri, yüksək bonitet və XVD-2026-0050 lotu (95 ha).
- [[entities/xocali|Xocalı və Xankəndi]] — Regional aqro-emal sənayesi, logistika qovşağı və XCL-2026-0021 taxılçılıq lotu (105 ha).
- [[entities/terter|Tərtər Rayonu və Suqovuşan]] — Tərtərçay və Suqovuşan su anbarı ilə 100% zəmanətli suvarma zolağı.

### Dövlət Qurumları və İdentifikasiya Şlüzləri:
- [[entities/ktn|Kənd Təsərrüfatı Nazirliyi]] — Tənzimləyici orqan, EKTİS fermer reyestri və 9 qurumlu komissiya sədri.
- [[entities/iqtisadiyyat_nazirliyi|İqtisadiyyat Nazirliyi]] — Sahibkarlığın İnkişafı Fondu (SİF), güzəştli kreditlər və 10 illik vergi güzəştləri.
- [[entities/emdx|Əmlak Məsələləri Dövlət Xidməti]] — Dövlət kadastr uçotu, LADM parselləri və icarə çıxarışları.
- [[entities/anama|ANAMA]] — Minatəmizləmə sertifikatlaşdırılması və təhlükəsizlik koordinasiyası.
- [[entities/etsn|Ekologiya və Təbii Sərvətlər Nazirliyi]] — Meşə fondu sərhədləri və ekoloji təsir ekspertizası.
- [[entities/adsea|Azərbaycan Dövlət Su Ehtiyatları Agentliyi]] — Suvarma infrastrukturu, kanallar və su kvotaları.
- [[entities/dovlet_vergi_xidmeti_avis|Dövlət Vergi Xidməti (AVİS)]] — Borcsuzluq arayışı və maliyyə reytinqinin avtomatik yoxlanması.
- [[entities/sima_ve_asan_imza|SİMA, ASAN İmza və myGov]] — Rəqəmsal biometrik şəxsiyyət və hüquqi qüvvəyə malik elektron imza.

---

## 💡 3. Anlayışlar və Metodologiyalar (`concepts/`)
- [[concepts/torpaq_boniteti_ve_qiymetlendirme|Torpaq Boniteti]] — 100 ballıq münbitlik şkalası, torpaq tipləri və icarə qiymətləndirmə mexanizmi.
- [[concepts/suvarma_ve_su_ehtiyatlari|Suvarma Şəbəkələri]] — Qarabağın su anbarları (Xudafərin, Sərsəng, Xaçınçay) və məcburi pivot/damlama tələbi.
- [[concepts/minatemizleme_tehlukesizlik_statusu|Minatəmizləmə Statusu]] — `LEVEL_1_CLEARED`, `LEVEL_2_SURVEYED`, `LEVEL_3_RESTRICTED` təhlükəsizlik dərəcələri.
- [[concepts/ladm_iso19152|LADM ISO 19152]] — Party, RRR, BAUnit və SpatialUnit beynəlxalq kadastr arxitekturası.
- [[concepts/agro_ai_ve_roi_skorinq|Aqro-AI və ROI Skorinqi]] — Gemini AI dəstəkli 100 ballıq müraciət qiymətləndirməsi və 5 illik gəlirlilik analizi.
- [[concepts/sentinel2_ndvi_monitorinq|Sentinel-2 Peyk NDVI]] — Peyk vegetasiya indeksi ilə əkin sahələrinin kosmosdan fasiləsiz monitorinqi.
- [[concepts/kibertehlukesizlik_ve_rbac|Kibertəhlükəsizlik və RBAC]] — HMAC-SHA256 JWT, rol iyerarxiyası, dövlət sistemlərinin qorunması.
- [[concepts/kooperativ_klasterlesme|İnvestor-Sahibkar Klasteri]] — İri kapital və yerli fermer kooperasiyası, +10 bonus bal mexanizmi.
- [[concepts/kollegial_sesverme_9_qurum|9 Qurumun Canlı Səsverməsi]] — 9 dövlət orqanının elektron konsensusu və qərar qəbuletmə alqoritmi.
- [[concepts/elektron_muraciet_ve_izleme_wizard|Elektron Müraciət Sihirbazı]] — 4-addımlı müraciət və `INV-2026-AGD-XXXX` izləmə zənciri.
- [[concepts/torpaq_icare_muqavileleri_ve_236_ferman|236 №-li Fərman və Torpaq İcarəsi]] — 10-25 illik icarə, 5 ha kəndətrafı sahə norması və 50 AZN rüsum.

---

## ⚖️ 4. Müqayisələr və Təhlillər (`comparisons/`)
- [[comparisons/agro_rayonlar_ve_lotlar_muqayisesi|Rayonlararası Müqayisə Matrisi]] — Qarabağ və Şərqi Zəngəzur rayonlarının təbii, su və torpaq şəraitinin yan-yana müqayisəsi.
- [[comparisons/bitkiler_ve_aqrar_gelirlilik_roi|Bitkilər üzrə İqtisadi Səmərəlilik]] — Buğda, badam, üzüm, istixana pomidoru və yonca üzrə 5 illik maya dəyəri və mənfəət cədvəli.
- [[comparisons/suvarma_texnologiyalari_damlama_pivot_yagis|Suvarma Texnologiyalarının Müqayisəsi]] — Damlama, pivot və yağışyağdırma texnologiyalarının xərc, relyef və səmərəlilik matrisi.
- [[comparisons/dovlet_qurumlari_ve_selahiyyet_bolgusu|9 Qurumun Səlahiyyət Bölgüsü]] — Hər bir dövlət orqanının yoxlama meyarları, inteqrasiya bazaları və veto hüquqları.

---

## 🎯 5. Strateji Sintezlər (`synthesis/`)
- [[synthesis/karabakh_aqrar_investisiya_strategiyasi|Aqrar İnvestisiya Strategiyası]] — Milli ərzaq təhlükəsizliyi, rəqəmsal torpaq idarəçiliyi və dayanıqlı inkişaf baxışı.
- [[synthesis/investor_yol_xeritesi_step_by_step|İnvestor üçün Addım-Addım Yol Xəritəsi]] — Qeydiyyatdan müsabiqəyə, icarə müqaviləsinə və ilk məhsul yığımına qədər bələdçi.
- [[synthesis/qarabag_erzaq_tehlukesizliyi_ve_ixrac_potensiali|Ərzaq Təhlükəsizliyi və İxrac Potensialı]] — Ərzaqlıq buğda balansı, damazlıq heyvandarlıq və yüksək əlavə dəyərli ixracat.
