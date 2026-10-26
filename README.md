# 🌱 InvestArea — Rəsmi Veb-Portal (`InvestArea.github.io`)

**Qarabağ və Şərqi Zəngəzur üzrə Rəqəmsal Aqrar İnvestisiya və Torpaq Müsabiqələri Portalı**

[![Website](https://img.shields.io/badge/Veb--Portal-investarea.github.io-success?style=for-the-badge&logo=googlechrome&logoColor=white)](https://investarea.github.io)
[![Organization](https://img.shields.io/badge/GitHub-InvestArea-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/InvestArea)
[![Status](https://img.shields.io/badge/GitHub%20Pages-Aktiv-00C853?style=for-the-badge)](https://investarea.github.io)

---

## 📌 Layihə Haqqında

**InvestArea** — işğaldan azad edilmiş Qarabağ və Şərqi Zəngəzur iqtisadi rayonlarında kənd təsərrüfatı təyinatlı torpaq sahələrinə yerli və xarici investisiyaların cəlb edilməsini sürətləndirən, torpaq müsabiqələrini rəqəmsallaşdıran və dövlət aqrar informasiya sistemlərinə (**EKTİS**, **AVİS**, **LADM**) inteqrasiya olunan vahid dövlət veb-portal ekosistemidir.

- 🌐 **Canlı Veb-Portal:** [https://investarea.github.io](https://investarea.github.io)
- 🏢 **Rəsmi GitHub Təşkilatı:** [https://github.com/InvestArea](https://github.com/InvestArea)
- ⚙️ **Əsas Backend və Baza Repozitoriyası:** [https://github.com/InvestArea/InvestArea](https://github.com/InvestArea/InvestArea)

---

## 📄 Portalın Əsas Səhifələri və Modulları

| Səhifə | Təyinatı və Əsas Funksiyaları |
| :--- | :--- |
| **[`index.html`](index.html)** | **Əsas Giriş Qapısı (Landing Gate):** Kinematik video fon, rəsmi layihə təqdimatı, avtomatik demo giriş düymələri və təhlükəsiz autentifikasiya modalları. |
| **[`portal.html`](portal.html)** | **Vahid Aqrar İnvestisiya Portalı:** İnteraktiv QGIS xəritəsi, 236 №-li Fərman şərtləri, Aqro-AI gəlirlilik analizi, müsabiqə lotları, 5 addımlı müraciət forması və müraciət izləmə kabineti. |
| **[`register.html`](register.html)** | **İdentifikasiya Mərkəzi:** SİMA Biometrik İmza, ASAN İmza, myGov və Google vahid giriş qapısı. |
| **[`admin.html`](admin.html)** | **Superuser İnzibati Paneli:** Vahid Reyestr, iştirakçı dosyeləri, 100 ballıq AI sənəd skorinqi, 9 dövlət qurumu canlı səsvermə sistemi və Sentinel-2 Peyk NDVI monitorinqi. |
| **[`admin-documents.html`](admin-documents.html)** | **Sənəd Təftiş Paneli:** EKTİS fermer reyestri, AVİS vergi arayışları, DƏK kadastr çıxarışları və bank təminatlarının elektron yoxlanışı. |
| **[`pitch-deck.html`](pitch-deck.html)** | **İnteraktiv Təqdimat:** Layihənin 14 slaydıq interaktiv təqdimat modulu. |

---

## 🗺️ Geoinformasiya (CİS / QGIS) İmkanları

Portal real geoinformasiya məlumat bazaları ilə inteqrasiya olunmuşdur:
- **Dinamik Koordinat Təftişi:** Xəritənin istənilən nöqtəsinə klikləndikdə GeoJSON layları (`karabakh_districts.geojson`, `karabakh_waterways.geojson`, `azerbaijan_villages_adm3.geojson`, `karabakh_parcels.geojson`) real vaxtda sorğulanır.
- **Müsabiqə Lotları:** Ağdam, Füzuli, Cəbrayıl, Zəngilan, Laçın və Kəlbəcər üzrə ayrılmış təsərrüfat sahələri, torpaq boniteti və suvarma mənbələri.
- **Rəsmi QGIS Layihələri:** `InvestArea.qgs` və `InvestArea.qgz` faylları həmçinin repozitoriyada saxlanılır.

---

## 🛠️ Texnoloji Stek

- **Frontend:** HTML5, Modern CSS3 (Tailwind CSS & Glassmorphism), Modern JavaScript (ES6+ Modules)
- **Xəritə Mühərriki:** Leaflet.js, GeoJSON Vektor Layları, CartoDB & Esri Satellite Tile Layers
- **Süni İntellekt:** Google Gemini AI və Aqronomik ROI Kalkulyatoru
- **Beynəlxalq Kadastr Standartları:** ISO 19152 LADM (*Land Administration Domain Model*), FAO SOLA
- **Hostinq:** GitHub Pages (SSL təminatlı, qlobal CDN)

---

## 📞 Əlaqə və Təşkilat

- **Təşkilat:** [InvestArea](https://github.com/InvestArea)
- **Ünvan:** Bakı, Azərbaycan
