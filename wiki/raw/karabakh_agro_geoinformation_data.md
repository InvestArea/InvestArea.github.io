# 📜 Xammal Mənbə: Qarabağ CİS Coğrafi Verilənlər Bazası və QGIS Strukturu

> **Sənəd Növü:** Məkan Məlumatları və QGIS Layihə Struktur Spesifikasiyası  
> **Fayllar:** `InvestArea.qgs`, `InvestArea.qgz`, GeoJSON Layları  
> **Status:** İmmutable / Dəyişdirilməz Mənbə

---

## 1. Rayonlar və İqtisadi Rayon Bölgüsü
- **Qarabağ İqtisadi Rayonu:** Ağdam, Füzuli, Cəbrayıl, Xocavənd, Şuşa, Xocalı, Xankəndi, Tərtər.
- **Şərqi Zəngəzur İqtisadi Rayonu:** Zəngilan, Laçın, Kəlbəcər, Qubadlı, Cəbrayıl hissəsi.

## 2. GeoJSON Layları və Atributlar
1. `karabakh_districts.geojson`:
   - Atributlar: `ADM2_AZ` (Rayon adı), `AREA_SQKM`, `REGION_TYPE`.
2. `karabakh_parcels.geojson`:
   - Atributlar: `lot_id`, `district`, `village`, `area_ha`, `bonitet_score`, `irrigation_status`, `anama_status`, `allowed_usage` (taxılçılıq, bağçılıq, pambıqçılıq, heyvandarlıq).
3. `karabakh_waterways.geojson`:
   - Baş çaylar: Tərtərçay, Xaçınçay, Köndələnçay, Bərgüşad, Həkəri, Araz.
   - Su anbarları: Xudafərin, Qız Qalası, Sərsəng, Suqovuşan, Köndələnçay-1 və 2, Xaçınçay.
4. `azerbaijan_villages_adm3.geojson`:
   - Yaşayış məntəqələri, kənd və qəsəbə mərkəzləri.

## 3. Dinamik Koordinat Təftişi (Spatial Reverse Engine)
Xəritədə kliklənən nöqtə üzrə:
- `Rayon`: Kliklənən nöqtənin daxil olduğu poliqon (`Point-in-Polygon`).
- `Yaxın Su Mənbəyi`: Ən yaxın çay və ya kanala olan evklid/sferik məsafə (km).
- `Bonitet və Əkin Növü`: Həmin koordinat zonasının aqro-iqlim potensialı.
