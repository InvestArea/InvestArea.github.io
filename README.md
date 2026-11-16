# InvestArea — Rəsmi Veb-Portal

Qarabağ və Şərqi Zəngəzur üzrə Rəqəmsal Aqrar İnvestisiya və Torpaq Müsabiqələri Portalı

---

## Layihə Haqqında

InvestArea — Azərbaycan Respublikasının işğaldan azad edilmiş Qarabağ və Şərqi Zəngəzur iqtisadi rayonlarında kənd təsərrüfatı təyinatlı torpaq sahələrinə investisiya cəlbini təmin edən, torpaq müsabiqələrini rəqəmsallaşdıran və dövlət aqrar informasiya sistemlərinə (EKTİS, AVİS, LADM) inteqrasiya olunan vahid dövlət veb-portal ekosistemidir.

- Canlı Veb-Portal: https://investarea.github.io
- Rəsmi GitHub Təşkilatı: https://github.com/InvestArea
- Əsas Backend və Baza Repozitoriyası: https://github.com/InvestArea/InvestArea

---

## Portalın Əsas Səhifələri və Modulları

| Səhifə | Təyinatı və Əsas Funksiyaları |
| :--- | :--- |
| index.html | Əsas Giriş Səhifəsi: Rəsmi layihə təqdimatı, naviqasiya və təhlükəsiz autentifikasiya pəncərələri. |
| portal.html | Vahid Aqrar İnvestisiya Portalı: İnteraktiv CİS xəritəsi, 236 №-li Fərman şərtləri, aqronomik analitika və ROI kalkulyasiyası, müsabiqə lotları, elektron müraciət forması və müraciət izləmə kabineti. |
| register.html | İdentifikasiya Mərkəzi: SİMA Rəqəmsal İmza, ASAN İmza, myGov və vahid dövlət giriş şlüzləri. |
| admin.html | İnzibati Qiymətləndirmə Paneli: Vahid Reyestr, iştirakçı dosyeləri, 100 ballıq çoxtərəfli sənəd skorinqi, 9 dövlət qurumunun kollegial səsvermə sistemi və Sentinel-2 Peyk NDVI monitorinqi. |
| admin-documents.html | Sənəd Təftiş Paneli: EKTİS fermer reyestri, AVİS vergi arayışları, DƏK kadastr çıxarışları və bank təminatlarının elektron yoxlanışı. |
| admin-parcels.html | Kadastr Parselləri və Peyk Monitorinqi: Torpaq sahələrinin koordinatları, torpaq boniteti və vegetasiya analitikası. |
| pitch-deck.html | Rəqəmsal Təqdimat Sənədi: Layihənin konseptual və texniki təqdimat modulu. |

---

## Geoinformasiya (CİS / QGIS) İmkanları

Portal geoinformasiya məlumat bazaları ilə inteqrasiya olunmuşdur:
- Dinamik Koordinat Təftişi: Xəritənin istənilən nöqtəsinə klikləndikdə GeoJSON layları (karabakh_districts.geojson, karabakh_waterways.geojson, azerbaijan_villages_adm3.geojson, karabakh_parcels.geojson) real vaxt rejimində sorğulanır.
- Müsabiqə Lotları: Ağdam, Füzuli, Cəbrayıl, Zəngilan, Laçın və Kəlbəcər üzrə ayrılmış təsərrüfat sahələri, torpaq boniteti və suvarma mənbələri.
- Rəsmi QGIS Layihələri: InvestArea.qgs və InvestArea.qgz faylları repozitoriyada arxivləşdirilmişdir.

---

## Texnoloji Baza

- Frontend: HTML5, CSS3, JavaScript ES6+
- Xəritə Mühərriki: Leaflet.js, GeoJSON Vektor Layları, CartoDB və Esri Satellite xəritə layları
- Analitika və Hesablama: Aqronomik ROI və Çoxtərəfli Skorinq Mühərriki
- Beynəlxalq Kadastr Standartları: ISO 19152 LADM (Land Administration Domain Model), FAO SOLA
- Hostinq: GitHub Pages (SSL təminatlı, qlobal CDN)

---

## Əlaqə və Təşkilat

- Təşkilat: InvestArea (https://github.com/InvestArea)
- Məkan: Bakı, Azərbaycan
