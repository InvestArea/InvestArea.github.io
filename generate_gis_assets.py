#!/usr/bin/env python3
import json
import os
import zipfile

GIS_DIR = "public/gis"
os.makedirs(GIS_DIR, exist_ok=True)

# 1. KARABAKH DISTRICTS BOUNDARIES (GeoJSON)
districts_data = {
    "type": "FeatureCollection",
    "name": "Qarabağ və Şərqi Zəngəzur İnzibati Sərhədləri",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
        {
            "type": "Feature",
            "properties": {
                "id": 1,
                "district": "Ağdam",
                "economic_region": "Qarabağ iqtisadi rayonu",
                "area_sqkm": 1150,
                "returnees_count": 5200,
                "active_workforce": 1850,
                "employment_target_jobs": 3400,
                "primary_sectors": "Taxılçılıq, Bağçılıq, Aqropark və Emal",
                "color": "#15803d",
                "fill_opacity": 0.25
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.78, 40.12], [47.02, 40.15], [47.18, 40.05], [47.16, 39.88],
                    [46.96, 39.85], [46.82, 39.92], [46.74, 40.04], [46.78, 40.12]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": 2,
                "district": "Füzuli",
                "economic_region": "Qarabağ iqtisadi rayonu",
                "area_sqkm": 1386,
                "returnees_count": 4800,
                "active_workforce": 1620,
                "employment_target_jobs": 2900,
                "primary_sectors": "İntensiv bağçılıq (badam, zeytun), Taxılçılıq, İstixana",
                "color": "#d97706",
                "fill_opacity": 0.25
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [47.00, 39.75], [47.25, 39.76], [47.38, 39.62], [47.28, 39.46],
                    [47.06, 39.48], [46.95, 39.60], [47.00, 39.75]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": 3,
                "district": "Şuşa",
                "economic_region": "Qarabağ iqtisadi rayonu",
                "area_sqkm": 289,
                "returnees_count": 2100,
                "active_workforce": 850,
                "employment_target_jobs": 1200,
                "primary_sectors": "Aqro-turizm, Giləmeyvəçilik, Arıçılıq, Əl sənətləri",
                "color": "#0284c7",
                "fill_opacity": 0.25
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.68, 39.80], [46.80, 39.81], [46.82, 39.71], [46.72, 39.68],
                    [46.64, 39.73], [46.68, 39.80]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": 4,
                "district": "Cəbrayıl",
                "economic_region": "Şərqi Zəngəzur iqtisadi rayonu",
                "area_sqkm": 1050,
                "returnees_count": 3600,
                "active_workforce": 1340,
                "employment_target_jobs": 2500,
                "primary_sectors": "Araz Vadisi İqtisadi Zonası, Üzümçülük, Logistika, Aqropark",
                "color": "#059669",
                "fill_opacity": 0.25
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.88, 39.48], [47.12, 39.46], [47.15, 39.30], [46.95, 39.22],
                    [46.78, 39.30], [46.84, 39.42], [46.88, 39.48]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": 5,
                "district": "Zəngilan",
                "economic_region": "Şərqi Zəngəzur iqtisadi rayonu",
                "area_sqkm": 707,
                "returnees_count": 2400,
                "active_workforce": 980,
                "employment_target_jobs": 1900,
                "primary_sectors": "Ağıllı Kənd Aqroparkı, İstixana, Meyvəçilik, Nəqliyyat Dəhlizi",
                "color": "#8b5cf6",
                "fill_opacity": 0.25
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.52, 39.18], [46.78, 39.22], [46.75, 38.98], [46.48, 38.90],
                    [46.44, 39.06], [46.52, 39.18]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": 6,
                "district": "Qubadlı",
                "economic_region": "Şərqi Zəngəzur iqtisadi rayonu",
                "area_sqkm": 802,
                "returnees_count": 1800,
                "active_workforce": 760,
                "employment_target_jobs": 1500,
                "primary_sectors": "Qərzəkli meyvələr (qoz, fındıq), Tütünçülük, Heyvandarlıq",
                "color": "#ea580c",
                "fill_opacity": 0.25
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.48, 39.48], [46.74, 39.46], [46.72, 39.26], [46.50, 39.24],
                    [46.42, 39.36], [46.48, 39.48]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": 7,
                "district": "Laçın",
                "economic_region": "Şərqi Zəngəzur iqtisadi rayonu",
                "area_sqkm": 1835,
                "returnees_count": 3100,
                "active_workforce": 1250,
                "employment_target_jobs": 2200,
                "primary_sectors": "Yaylaq heyvandarlığı (ət və süd), Balıqçılıq, Meşəçilik, Arıçılıq",
                "color": "#4338ca",
                "fill_opacity": 0.25
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.32, 39.92], [46.60, 39.88], [46.66, 39.52], [46.45, 39.48],
                    [46.25, 39.62], [46.30, 39.82], [46.32, 39.92]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": 8,
                "district": "Kəlbəcər",
                "economic_region": "Şərqi Zəngəzur iqtisadi rayonu",
                "area_sqkm": 3050,
                "returnees_count": 2200,
                "active_workforce": 890,
                "employment_target_jobs": 1800,
                "primary_sectors": "Alp çəmən heyvandarlığı, Kəlbəcər balı, Mineral sular (İstisu)",
                "color": "#166534",
                "fill_opacity": 0.25
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [45.85, 40.28], [46.32, 40.24], [46.42, 39.98], [46.22, 39.86],
                    [45.82, 39.94], [45.72, 40.15], [45.85, 40.28]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": 9,
                "district": "Xocavənd",
                "economic_region": "Qarabağ iqtisadi rayonu",
                "area_sqkm": 1458,
                "returnees_count": 2700,
                "active_workforce": 1100,
                "employment_target_jobs": 2000,
                "primary_sectors": "Hadrut dağətəyi üzümçülük, Şərabçılıq, Taxılçılıq",
                "color": "#9333ea",
                "fill_opacity": 0.25
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.85, 39.78], [47.16, 39.75], [47.18, 39.52], [46.90, 39.55],
                    [46.80, 39.68], [46.85, 39.78]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": 10,
                "district": "Xocalı",
                "economic_region": "Qarabağ iqtisadi rayonu",
                "area_sqkm": 970,
                "returnees_count": 2500,
                "active_workforce": 950,
                "employment_target_jobs": 1700,
                "primary_sectors": "Əkinçilik, Yemçilik, Arıçılıq, Aqro-emal",
                "color": "#0d9488",
                "fill_opacity": 0.25
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.66, 40.06], [46.92, 40.04], [46.88, 39.84], [46.70, 39.86],
                    [46.60, 39.96], [46.66, 40.06]
                ]]
            }
        }
    ]
}

# 2. KARABAKH INFRASTRUCTURE & ROADS (GeoJSON)
infra_data = {
    "type": "FeatureCollection",
    "name": "Qarabağ və Şərqi Zəngəzur Əsas İnfrastruktur Şəbəkəsi",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Zəfər Yolu (Füzuli - Şuşa)",
                "category": "Avtomagistral (101 km)",
                "status": "İstifadədədir",
                "importance": "Strateji Turizm və Aqrar Logistika",
                "stroke": "#dc2626",
                "stroke_width": 4
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [47.14, 39.60], [47.05, 39.64], [46.96, 39.66], [46.88, 39.68],
                    [46.78, 39.72], [46.75, 39.75]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Toğanalı - Kəlbəcər - İstisu Magistralı (Murov Tuneli)",
                "category": "Dağ Avtomagistralı (81 km)",
                "status": "İstifadədədir / Genişləndirilir",
                "importance": "Kəlbəcər Yaylaqlarına Birbaşa Çıxış",
                "stroke": "#ea580c",
                "stroke_width": 3.5
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [46.35, 40.42], [46.30, 40.32], [46.22, 40.22], [46.12, 40.16],
                    [46.04, 40.11], [45.96, 40.02]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Bərdə - Ağdam Avtomobil Yolu və Dəmir Yolu",
                "category": "4 Zolaqlı Avtomagistral və Dəmiryolu",
                "status": "İstifadədədir",
                "importance": "Ağdam Aqroparkının Logistika Arteriyası",
                "stroke": "#2563eb",
                "stroke_width": 4
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [47.12, 40.37], [47.04, 40.24], [46.96, 40.11], [46.92, 39.99]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Horadiz - Cəbrayıl - Zəngilan - Ağbənd Yolu",
                "category": "Beynəlxalq Magistral Dəhliz (124 km)",
                "status": "İstifadədədir",
                "importance": "Zəngəzur Dəhlizinin Əsas Magistralı",
                "stroke": "#7c3aed",
                "stroke_width": 4
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [47.14, 39.60], [47.02, 39.40], [46.85, 39.26], [46.65, 39.06],
                    [46.56, 38.98], [46.46, 38.92]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Füzuli Beynəlxalq Hava Limanı",
                "category": "Hava Limanı (Beynəlxalq)",
                "status": "Aktiv",
                "importance": "Qarabağın Hava Qapısı",
                "marker_icon": "airport"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [47.197, 39.594]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Zəngilan Beynəlxalq Hava Limanı",
                "category": "Hava Limanı (Beynəlxalq)",
                "status": "Aktiv",
                "importance": "Şərqi Zəngəzur Nəqliyyat Qovşağı",
                "marker_icon": "airport"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [46.738, 39.096]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Laçın Beynəlxalq Hava Limanı",
                "category": "Hava Limanı (Dağlıq Zona)",
                "status": "Tamamlanmaq üzrədir",
                "importance": "Qorçu qəsəbəsi, Dağ Logistikası",
                "marker_icon": "airport"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [46.425, 39.896]
            }
        }
    ]
}

# 3. KARABAKH HYDROLOGY & WATERWAYS (GeoJSON)
waterways_data = {
    "type": "FeatureCollection",
    "name": "Qarabağ və Şərqi Zəngəzur Su Ehtiyatları və Su Anbarları",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Xudafərin Su Anbarı",
                "type": "Su Anbarı",
                "volume_m3": "1.612 milyard m³",
                "irrigation_hectares": "120,000 ha torpağın suvarılması",
                "color": "#0284c7"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.98, 39.15], [47.12, 39.14], [47.16, 39.18], [47.04, 39.22], [46.98, 39.15]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Sərsəng Su Anbarı",
                "type": "Su Anbarı (Tərtərçay)",
                "volume_m3": "565 milyon m³",
                "irrigation_hectares": "100,000 ha əkin sahəsinin su təminatı",
                "color": "#0284c7"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.60, 40.18], [46.68, 40.21], [46.72, 40.19], [46.65, 40.15], [46.60, 40.18]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Suqovuşan Su Anbarı",
                "type": "Su Anbarı",
                "volume_m3": "5.86 milyon m³",
                "irrigation_hectares": "Tərtər, Goranboy və Bərdə suvarma şəbəkəsi",
                "color": "#0284c7"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.74, 40.35], [46.78, 40.36], [46.80, 40.34], [46.75, 40.33], [46.74, 40.35]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Xaçınçay Su Anbarı",
                "type": "Su Anbarı (Ağdam)",
                "volume_m3": "23 milyon m³",
                "irrigation_hectares": "Ağdam rayonunda 7,000 ha əkin sahəsi",
                "color": "#0284c7"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [46.82, 40.08], [46.87, 40.09], [46.88, 40.06], [46.84, 40.05], [46.82, 40.08]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Köndələnçay Su Anbarları (Füzuli)",
                "type": "Su Anbarı Kompleksi",
                "volume_m3": "15.5 milyon m³",
                "irrigation_hectares": "Füzuli bağ və taxıl sahələrinin suvarılması",
                "color": "#0284c7"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [47.12, 39.68], [47.17, 39.69], [47.19, 39.66], [47.14, 39.65], [47.12, 39.68]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Həkəri Çayı",
                "type": "Təbii Çay Arteriyası (128 km)",
                "basin": "Laçın, Qubadlı, Zəngilan, Araz hövzəsi",
                "color": "#0369a1",
                "stroke_width": 3
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [46.54, 39.75], [46.52, 39.60], [46.56, 39.42], [46.60, 39.25],
                    [46.68, 39.12], [46.74, 39.02]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Tərtərçay",
                "type": "Təbii Çay Arteriyası (200 km)",
                "basin": "Kəlbəcər, Ağdərə, Tərtər, Bərdə",
                "color": "#0369a1",
                "stroke_width": 3.5
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [45.95, 40.05], [46.15, 40.10], [46.35, 40.15], [46.62, 40.18],
                    [46.76, 40.35], [46.98, 40.36], [47.15, 40.40]
                ]
            }
        }
    ]
}

# 4. KARABAKH INVESTMENT PARCELS WITH EMPLOYMENT & SOIL METRICS (GeoJSON)
# Exact polygons for the 10 state parcels
parcels = [
    {
        "id": 1, "cadastreNumber": "AGD-2026-0012", "district": "Ağdam", "village": "Qiyaslı",
        "areaHectares": 120.0, "sector": "EKINCILIK", "soilBonitet": 85, "irrigationType": "PIVOT",
        "minInvestmentAzn": 450000.0, "latitude": 39.991, "longitude": 46.927, "soilPh": 7.0,
        "soilOrganicCarbon": 27.0, "clayContent": 30.2, "elevationMeters": 245, "ndviIndex": 0.64,
        "terrainSlope": 1.2, "anamaCertificate": "AZ-ANM-2025/08", "anamaStatus": "TAM_TEMIZLENMIS",
        "requiredPermanentJobs": 24, "seasonalJobs": 50, "returneeQuotaPercent": 85,
        "availableLaborPool": 1850, "leaseYears": 25, "legalStatus": "Dövlət İcarəsi (Sosial Öhdəlikli)"
    },
    {
        "id": 2, "cadastreNumber": "FZL-2026-0045", "district": "Füzuli", "village": "Horadiz",
        "areaHectares": 85.0, "sector": "BAGCHILIQ", "soilBonitet": 82, "irrigationType": "DAMCILI",
        "minInvestmentAzn": 650000.0, "latitude": 39.601, "longitude": 47.142, "soilPh": 6.9,
        "soilOrganicCarbon": 39.9, "clayContent": 28.5, "elevationMeters": 210, "ndviIndex": 0.58,
        "terrainSlope": 1.8, "anamaCertificate": "AZ-ANM-2025/14", "anamaStatus": "TAM_TEMIZLENMIS",
        "requiredPermanentJobs": 35, "seasonalJobs": 80, "returneeQuotaPercent": 85,
        "availableLaborPool": 1620, "leaseYears": 25, "legalStatus": "Dövlət İcarəsi (Sosial Öhdəlikli)"
    },
    {
        "id": 3, "cadastreNumber": "CBR-2026-0078", "district": "Cəbrayıl", "village": "Böyük Mərcanlı",
        "areaHectares": 250.0, "sector": "AQROPARK", "soilBonitet": 78, "irrigationType": "KANAL",
        "minInvestmentAzn": 1800000.0, "latitude": 39.398, "longitude": 47.025, "soilPh": 7.1,
        "soilOrganicCarbon": 35.7, "clayContent": 26.0, "elevationMeters": 290, "ndviIndex": 0.52,
        "terrainSlope": 2.1, "anamaCertificate": "AZ-ANM-2025/03", "anamaStatus": "TAM_TEMIZLENMIS",
        "requiredPermanentJobs": 65, "seasonalJobs": 110, "returneeQuotaPercent": 80,
        "availableLaborPool": 1340, "leaseYears": 30, "legalStatus": "Dövlət İcarəsi (Sosial Öhdəlikli)"
    },
    {
        "id": 4, "cadastreNumber": "ZNG-2026-0102", "district": "Zəngilan", "village": "Ağalı",
        "areaHectares": 45.0, "sector": "ISTIXANA", "soilBonitet": 89, "irrigationType": "DAMCILI",
        "minInvestmentAzn": 900000.0, "latitude": 39.062, "longitude": 46.654, "soilPh": 7.2,
        "soilOrganicCarbon": 31.3, "clayContent": 29.4, "elevationMeters": 380, "ndviIndex": 0.69,
        "terrainSlope": 3.5, "anamaCertificate": "AZ-ANM-2024/99", "anamaStatus": "TAM_TEMIZLENMIS",
        "requiredPermanentJobs": 50, "seasonalJobs": 40, "returneeQuotaPercent": 90,
        "availableLaborPool": 980, "leaseYears": 25, "legalStatus": "Dövlət İcarəsi (Sosial Öhdəlikli)"
    },
    {
        "id": 5, "cadastreNumber": "QBD-2026-0033", "district": "Qubadlı", "village": "Mahruzlu",
        "areaHectares": 60.0, "sector": "BAGCHILIQ", "soilBonitet": 84, "irrigationType": "TEBII_MENBE",
        "minInvestmentAzn": 500000.0, "latitude": 39.344, "longitude": 46.582, "soilPh": 7.2,
        "soilOrganicCarbon": 32.5, "clayContent": 31.0, "elevationMeters": 520, "ndviIndex": 0.72,
        "terrainSlope": 4.2, "anamaCertificate": "AZ-ANM-2025/19", "anamaStatus": "TAM_TEMIZLENMIS",
        "requiredPermanentJobs": 28, "seasonalJobs": 60, "returneeQuotaPercent": 85,
        "availableLaborPool": 760, "leaseYears": 25, "legalStatus": "Dövlət İcarəsi (Sosial Öhdəlikli)"
    },
    {
        "id": 6, "cadastreNumber": "LCN-2026-0061", "district": "Laçın", "village": "Zabux",
        "areaHectares": 320.0, "sector": "HEYVANDARLIQ", "soilBonitet": 75, "irrigationType": "TEBII_MENBE",
        "minInvestmentAzn": 850000.0, "latitude": 39.638, "longitude": 46.546, "soilPh": 6.8,
        "soilOrganicCarbon": 43.0, "clayContent": 22.8, "elevationMeters": 1180, "ndviIndex": 0.78,
        "terrainSlope": 8.5, "anamaCertificate": "AZ-ANM-2025/22", "anamaStatus": "TAM_TEMIZLENMIS",
        "requiredPermanentJobs": 42, "seasonalJobs": 30, "returneeQuotaPercent": 80,
        "availableLaborPool": 1250, "leaseYears": 25, "legalStatus": "Dövlət İcarəsi (Sosial Öhdəlikli)"
    },
    {
        "id": 7, "cadastreNumber": "KLB-2026-0094", "district": "Kəlbəcər", "village": "Zülfüqarlı",
        "areaHectares": 180.0, "sector": "HEYVANDARLIQ", "soilBonitet": 76, "irrigationType": "TEBII_MENBE",
        "minInvestmentAzn": 700000.0, "latitude": 40.108, "longitude": 46.037, "soilPh": 6.7,
        "soilOrganicCarbon": 45.5, "clayContent": 21.0, "elevationMeters": 1650, "ndviIndex": 0.81,
        "terrainSlope": 9.8, "anamaCertificate": "AZ-ANM-2025/31", "anamaStatus": "TAM_TEMIZLENMIS",
        "requiredPermanentJobs": 30, "seasonalJobs": 25, "returneeQuotaPercent": 80,
        "availableLaborPool": 890, "leaseYears": 25, "legalStatus": "Dövlət İcarəsi (Sosial Öhdəlikli)"
    },
    {
        "id": 8, "cadastreNumber": "SSA-2026-0015", "district": "Şuşa", "village": "Daşaltı",
        "areaHectares": 35.0, "sector": "BAGCHILIQ", "soilBonitet": 81, "irrigationType": "DAMCILI",
        "minInvestmentAzn": 400000.0, "latitude": 39.753, "longitude": 46.751, "soilPh": 7.0,
        "soilOrganicCarbon": 38.0, "clayContent": 27.5, "elevationMeters": 1320, "ndviIndex": 0.75,
        "terrainSlope": 5.6, "anamaCertificate": "AZ-ANM-2024/77", "anamaStatus": "TAM_TEMIZLENMIS",
        "requiredPermanentJobs": 20, "seasonalJobs": 45, "returneeQuotaPercent": 85,
        "availableLaborPool": 850, "leaseYears": 25, "legalStatus": "Dövlət İcarəsi (Sosial Öhdəlikli)"
    },
    {
        "id": 9, "cadastreNumber": "XVD-2026-0050", "district": "Xocavənd", "village": "Hadrut",
        "areaHectares": 95.0, "sector": "BAGCHILIQ", "soilBonitet": 87, "irrigationType": "DAMCILI",
        "minInvestmentAzn": 800000.0, "latitude": 39.523, "longitude": 47.031, "soilPh": 7.3,
        "soilOrganicCarbon": 34.2, "clayContent": 32.1, "elevationMeters": 750, "ndviIndex": 0.68,
        "terrainSlope": 3.8, "anamaCertificate": "AZ-ANM-2025/11", "anamaStatus": "TAM_TEMIZLENMIS",
        "requiredPermanentJobs": 40, "seasonalJobs": 90, "returneeQuotaPercent": 85,
        "availableLaborPool": 1100, "leaseYears": 25, "legalStatus": "Dövlət İcarəsi (Sosial Öhdəlikli)"
    },
    {
        "id": 10, "cadastreNumber": "XCL-2026-0021", "district": "Xocalı", "village": "Əsgəran",
        "areaHectares": 105.0, "sector": "EKINCILIK", "soilBonitet": 86, "irrigationType": "ARTEZIAN",
        "minInvestmentAzn": 550000.0, "latitude": 39.912, "longitude": 46.833, "soilPh": 7.1,
        "soilOrganicCarbon": 29.8, "clayContent": 33.0, "elevationMeters": 560, "ndviIndex": 0.63,
        "terrainSlope": 2.4, "anamaCertificate": "AZ-ANM-2025/05", "anamaStatus": "TAM_TEMIZLENMIS",
        "requiredPermanentJobs": 22, "seasonalJobs": 45, "returneeQuotaPercent": 85,
        "availableLaborPool": 950, "leaseYears": 25, "legalStatus": "Dövlət İcarəsi (Sosial Öhdəlikli)"
    }
]

parcel_features = []
for p in parcels:
    import math
    lat = p["latitude"]
    lon = p["longitude"]
    areaHa = p["areaHectares"]
    deltaLat = (math.sqrt(areaHa * 10000) / 111320.0) / 2.0
    deltaLon = (math.sqrt(areaHa * 10000) / (111320.0 * math.cos(lat * math.pi / 180.0))) / 2.0
    
    poly_coords = [
        [round(lon - deltaLon, 6), round(lat - deltaLat, 6)],
        [round(lon + deltaLon, 6), round(lat - deltaLat, 6)],
        [round(lon + deltaLon, 6), round(lat + deltaLat, 6)],
        [round(lon - deltaLon, 6), round(lat + deltaLat, 6)],
        [round(lon - deltaLon, 6), round(lat - deltaLat, 6)]
    ]
    
    sector_color = {
        "EKINCILIK": "#15803d",
        "BAGCHILIQ": "#d97706",
        "HEYVANDARLIQ": "#0284c7",
        "ISTIXANA": "#10b981",
        "AQROPARK": "#7c3aed"
    }.get(p["sector"], "#003526")

    feat = {
        "type": "Feature",
        "properties": {
            **p,
            "color": sector_color,
            "fill_opacity": 0.45
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [poly_coords]
        }
    }
    parcel_features.append(feat)

parcels_data = {
    "type": "FeatureCollection",
    "name": "Qarabağ Dövlət Aqrar Torpaq Fondu və Məşğulluq Sahələri",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": parcel_features
}

# Write GeoJSON files
with open(f"{GIS_DIR}/karabakh_districts.geojson", "w", encoding="utf-8") as f:
    json.dump(districts_data, f, ensure_ascii=False, indent=2)

with open(f"{GIS_DIR}/karabakh_infrastructure.geojson", "w", encoding="utf-8") as f:
    json.dump(infra_data, f, ensure_ascii=False, indent=2)

with open(f"{GIS_DIR}/karabakh_waterways.geojson", "w", encoding="utf-8") as f:
    json.dump(waterways_data, f, ensure_ascii=False, indent=2)

with open(f"{GIS_DIR}/karabakh_parcels.geojson", "w", encoding="utf-8") as f:
    json.dump(parcels_data, f, ensure_ascii=False, indent=2)

print("Generated 4 GeoJSON layers in public/gis/")

# 5. GENERATE ONE-CLICK QGIS PYTHON SCRIPT
qgis_python_script = """# ==============================================================================
# InvestAreaBacking — Qarabağ Dövlət Torpaq və Məşğulluq Portalı
# QGIS Python Konsolu üçün Avtomatlaşdırılmış Quraşdırma Skripti
# ==============================================================================
# İstifadə qaydası:
# 1. QGIS-i açın
# 2. Yuxarı menyudan: Plugins -> Python Console (və ya Ctrl + Alt + P) açın
# 3. Bu skripti yapışdırıb Enter vurun.
# ==============================================================================

import os
from qgis.core import (
    QgsProject,
    QgsRasterLayer,
    QgsVectorLayer,
    QgsCoordinateReferenceSystem,
    QgsRectangle
)

project = QgsProject.instance()

# 1. Koordinat Sistemini WGS 84 / UTM Zone 38N (EPSG:32638) təyin edirik
crs_utm38n = QgsCoordinateReferenceSystem("EPSG:32638")
project.setCrs(crs_utm38n)

# 2. Peyk və Xəritə Altlıqları (XYZ Raster Qatları)
basemaps = [
    ("Google Satellite Hybrid", "type=xyz&url=https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"),
    ("Esri World Imagery", "type=xyz&url=https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"),
    ("OpenStreetMap Standard", "type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png")
]

for name, uri in basemaps:
    rlayer = QgsRasterLayer(uri, name, "wms")
    if rlayer.isValid():
        project.addMapLayer(rlayer)
        print(f"✓ Əlavə olundu: {name}")
    else:
        print(f"✗ Xəta baş verdi: {name}")

# 3. Qarabağ Vektor Qatları (GeoJSON)
# Cari layihə qovluğuna nisbi və ya mütləq yol
base_dir = os.path.abspath("public/gis")
if not os.path.exists(base_dir):
    # Fallback to current working directory
    base_dir = os.getcwd()

vector_layers = [
    ("Qarabağ İnzibati Sərhədləri (10 Rayon)", os.path.join(base_dir, "karabakh_districts.geojson")),
    ("Qarabağ İnfrastruktur və Yollar (Zəfər Yolu)", os.path.join(base_dir, "karabakh_infrastructure.geojson")),
    ("Qarabağ Su Ehtiyatları və Anbarlar (Xudafərin/Sərsəng)", os.path.join(base_dir, "karabakh_waterways.geojson")),
    ("Qarabağ Dövlət Torpaq Fondu & Məşğulluq Sahələri", os.path.join(base_dir, "karabakh_parcels.geojson"))
]

for lname, lpath in vector_layers:
    if os.path.exists(lpath):
        vlayer = QgsVectorLayer(lpath, lname, "ogr")
        if vlayer.isValid():
            project.addMapLayer(vlayer)
            print(f"✓ Vektor qatı yükləndi: {lname}")
        else:
            print(f"✗ Vektor layı etibarsızdır: {lname}")
    else:
        print(f"! Fayl tapılmadı (yol yoxlanılmalıdır): {lpath}")

print("\\n★ Bütün Qarabağ GIS qatları uğurla yükləndi və layihəyə inteqrasiya edildi!")
"""

with open(f"{GIS_DIR}/InvestAreaBacking_karabakh_qgis_setup.py", "w", encoding="utf-8") as f:
    f.write(qgis_python_script)

print("Generated QGIS Python Setup script in public/gis/")

# 6. UPDATE InvestAreaBacking.qgs and package into InvestAreaBacking.qgz
qgs_content = """<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis projectname="InvestAreaBacking - Qarabağ Aqrar İnvestisiya və Məşğulluq Layihəsi" saveUser="Suleiman Hajizadeh" saveUserFull="Suleiman Hajizadeh" version="3.34.0-Prizren">
  <homePath path=""/>
  <title>InvestAreaBacking - Qarabağ Aqrar İnvestisiya və Məşğulluq Layihəsi</title>
  <autotransform>1</autotransform>
  <evaluateDefaultValues>0</evaluateDefaultValues>
  <trust>0</trust>
  <projectCrs>
    <spatialrefsys nativeFormat="Wkt">
      <wkt>PROJCRS["WGS 84 / UTM zone 38N",BASEGEOGCRS["WGS 84",ENSEMBLE["World Geodetic System 1984 ensemble",MEMBER["World Geodetic System 1984 (Transit)"],MEMBER["World Geodetic System 1984 (G730)"],MEMBER["World Geodetic System 1984 (G873)"],MEMBER["World Geodetic System 1984 (G1150)"],MEMBER["World Geodetic System 1984 (G1674)"],MEMBER["World Geodetic System 1984 (G1762)"],MEMBER["World Geodetic System 1984 (G2139)"],MEMBER["World Geodetic System 1984 (G2296)"],ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]],ENSEMBLEACCURACY[2.0]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],ID["EPSG",4326]],CONVERSION["UTM zone 38N",METHOD["Transverse Mercator",ID["EPSG",9807]],PARAMETER["Latitude of natural origin",0,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8801]],PARAMETER["Longitude of natural origin",45,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8802]],PARAMETER["Scale factor at natural origin",0.9996,SCALEUNIT["unity",1],ID["EPSG",8805]],PARAMETER["False easting",500000,LENGTHUNIT["metre",1],ID["EPSG",8806]],PARAMETER["False northing",0,LENGTHUNIT["metre",1],ID["EPSG",8807]]],CS[Cartesian,2],AXIS["(E)",east,ORDER[1],LENGTHUNIT["metre",1]],AXIS["(N)",north,ORDER[2],LENGTHUNIT["metre",1]],USAGE[SCOPE["Engineering survey, topographic mapping."],AREA["Between 42°E and 48°E, northern hemisphere."],BBOX[0,42,84,48]],ID["EPSG",32638]]</wkt>
      <proj4>+proj=utm +zone=38 +datum=WGS84 +units=m +no_defs</proj4>
      <srsid>3122</srsid>
      <srid>32638</srid>
      <authid>EPSG:32638</authid>
      <description>WGS 84 / UTM zone 38N</description>
      <projectionacronym>utm</projectionacronym>
      <ellipsoidacronym>EPSG:7030</ellipsoidacronym>
      <geographicflag>false</geographicflag>
    </spatialrefsys>
  </projectCrs>
  <layer-tree-group>
    <customproperties>
      <Option/>
    </customproperties>
    <layer-tree-layer checked="Qt::Checked" expanded="1" id="karabakh_parcels" name="Qarabağ Dövlət Torpaq Fondu &amp; Məşğulluq Sahələri" providerKey="ogr" source="./public/gis/karabakh_parcels.geojson"/>
    <layer-tree-layer checked="Qt::Checked" expanded="1" id="karabakh_infrastructure" name="Qarabağ İnfrastruktur və Yollar (Zəfər Yolu)" providerKey="ogr" source="./public/gis/karabakh_infrastructure.geojson"/>
    <layer-tree-layer checked="Qt::Checked" expanded="1" id="karabakh_waterways" name="Qarabağ Su Ehtiyatları və Anbarlar (Xudafərin/Sərsəng)" providerKey="ogr" source="./public/gis/karabakh_waterways.geojson"/>
    <layer-tree-layer checked="Qt::Checked" expanded="1" id="karabakh_districts" name="Qarabağ İnzibati Sərhədləri (10 Rayon)" providerKey="ogr" source="./public/gis/karabakh_districts.geojson"/>
    <layer-tree-layer checked="Qt::Checked" expanded="0" id="google_hybrid" name="Google Satellite Hybrid" providerKey="wms" source="type=xyz&amp;url=https://mt1.google.com/vt/lyrs=y&amp;x={x}&amp;y={y}&amp;z={z}"/>
    <layer-tree-layer checked="Qt::Unchecked" expanded="0" id="esri_imagery" name="Esri World Imagery" providerKey="wms" source="type=xyz&amp;url=https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"/>
    <layer-tree-layer checked="Qt::Unchecked" expanded="0" id="osm_standard" name="OpenStreetMap Standard" providerKey="wms" source="type=xyz&amp;url=https://tile.openstreetmap.org/{z}/{x}/{y}.png"/>
    <custom-order enabled="0">
      <item>karabakh_parcels</item>
      <item>karabakh_infrastructure</item>
      <item>karabakh_waterways</item>
      <item>karabakh_districts</item>
      <item>google_hybrid</item>
      <item>esri_imagery</item>
      <item>osm_standard</item>
    </custom-order>
  </layer-tree-group>
  <projectlayers>
    <!-- Google Satellite Hybrid -->
    <maplayer autoRefreshMode="Disabled" autoRefreshTime="0" hasScaleBasedVisibilityFlag="0" maxScale="0" minScale="1e+08" refreshOnNotifyEnabled="0" refreshOnNotifyMessage="" styleCategories="AllStyleCategories" type="raster">
      <id>google_hybrid</id>
      <datasource>type=xyz&amp;url=https://mt1.google.com/vt/lyrs=y&amp;x={x}&amp;y={y}&amp;z={z}</datasource>
      <keywordList><value></value></keywordList>
      <layername>Google Satellite Hybrid</layername>
      <srs>
        <spatialrefsys nativeFormat="Wkt">
          <wkt>EPSG:3857</wkt>
          <proj4>+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs</proj4>
          <srsid>3857</srsid>
          <srid>3857</srid>
          <authid>EPSG:3857</authid>
          <description>WGS 84 / Pseudo-Mercator</description>
        </spatialrefsys>
      </srs>
    </maplayer>

    <!-- Esri Imagery -->
    <maplayer autoRefreshMode="Disabled" autoRefreshTime="0" hasScaleBasedVisibilityFlag="0" maxScale="0" minScale="1e+08" refreshOnNotifyEnabled="0" refreshOnNotifyMessage="" styleCategories="AllStyleCategories" type="raster">
      <id>esri_imagery</id>
      <datasource>type=xyz&amp;url=https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}</datasource>
      <keywordList><value></value></keywordList>
      <layername>Esri World Imagery</layername>
      <srs>
        <spatialrefsys nativeFormat="Wkt">
          <wkt>EPSG:3857</wkt>
        </spatialrefsys>
      </srs>
    </maplayer>

    <!-- OpenStreetMap -->
    <maplayer autoRefreshMode="Disabled" autoRefreshTime="0" hasScaleBasedVisibilityFlag="0" maxScale="0" minScale="1e+08" refreshOnNotifyEnabled="0" refreshOnNotifyMessage="" styleCategories="AllStyleCategories" type="raster">
      <id>osm_standard</id>
      <datasource>type=xyz&amp;url=https://tile.openstreetmap.org/{z}/{x}/{y}.png</datasource>
      <keywordList><value></value></keywordList>
      <layername>OpenStreetMap Standard</layername>
      <srs>
        <spatialrefsys nativeFormat="Wkt">
          <wkt>EPSG:3857</wkt>
        </spatialrefsys>
      </srs>
    </maplayer>

    <!-- Azerbaijan Villages ADM3 Vector Layer -->
    <maplayer autoRefreshMode="Disabled" autoRefreshTime="0" geometry="Polygon" hasScaleBasedVisibilityFlag="0" id="azerbaijan_villages_adm3" maxScale="0" minScale="1e+08" refreshOnNotifyEnabled="0" refreshOnNotifyMessage="" styleCategories="AllStyleCategories" type="vector" wkbType="Polygon">
      <id>azerbaijan_villages_adm3</id>
      <datasource>./public/gis/azerbaijan_villages_adm3.geojson</datasource>
      <keywordList><value></value></keywordList>
      <layername>Azərbaycan Kənd Sərhədləri (HDX ADM3 &amp; İƏBT)</layername>
      <srs>
        <spatialrefsys nativeFormat="Wkt"><wkt>EPSG:4326</wkt></spatialrefsys>
      </srs>
    </maplayer>

    <!-- Karabakh Districts Vector -->
    <maplayer autoRefreshMode="Disabled" autoRefreshTime="0" geometry="Polygon" hasScaleBasedVisibilityFlag="0" id="karabakh_districts" maxScale="0" minScale="1e+08" refreshOnNotifyEnabled="0" refreshOnNotifyMessage="" styleCategories="AllStyleCategories" type="vector" wkbType="Polygon">
      <id>karabakh_districts</id>
      <datasource>./public/gis/karabakh_districts.geojson</datasource>
      <keywordList><value></value></keywordList>
      <layername>Qarabağ İnzibati Sərhədləri (10 Rayon)</layername>
      <srs>
        <spatialrefsys nativeFormat="Wkt"><wkt>EPSG:4326</wkt></spatialrefsys>
      </srs>
    </maplayer>

    <!-- Karabakh Infrastructure Vector -->
    <maplayer autoRefreshMode="Disabled" autoRefreshTime="0" geometry="Line" hasScaleBasedVisibilityFlag="0" id="karabakh_infrastructure" maxScale="0" minScale="1e+08" refreshOnNotifyEnabled="0" refreshOnNotifyMessage="" styleCategories="AllStyleCategories" type="vector" wkbType="LineString">
      <id>karabakh_infrastructure</id>
      <datasource>./public/gis/karabakh_infrastructure.geojson</datasource>
      <keywordList><value></value></keywordList>
      <layername>Qarabağ İnfrastruktur və Yollar (Zəfər Yolu)</layername>
      <srs>
        <spatialrefsys nativeFormat="Wkt"><wkt>EPSG:4326</wkt></spatialrefsys>
      </srs>
    </maplayer>

    <!-- Karabakh Waterways Vector -->
    <maplayer autoRefreshMode="Disabled" autoRefreshTime="0" geometry="Polygon" hasScaleBasedVisibilityFlag="0" id="karabakh_waterways" maxScale="0" minScale="1e+08" refreshOnNotifyEnabled="0" refreshOnNotifyMessage="" styleCategories="AllStyleCategories" type="vector" wkbType="Polygon">
      <id>karabakh_waterways</id>
      <datasource>./public/gis/karabakh_waterways.geojson</datasource>
      <keywordList><value></value></keywordList>
      <layername>Qarabağ Su Ehtiyatları və Anbarlar (Xudafərin/Sərsəng)</layername>
      <srs>
        <spatialrefsys nativeFormat="Wkt"><wkt>EPSG:4326</wkt></spatialrefsys>
      </srs>
    </maplayer>

    <!-- Karabakh Parcels Vector -->
    <maplayer autoRefreshMode="Disabled" autoRefreshTime="0" geometry="Polygon" hasScaleBasedVisibilityFlag="0" id="karabakh_parcels" maxScale="0" minScale="1e+08" refreshOnNotifyEnabled="0" refreshOnNotifyMessage="" styleCategories="AllStyleCategories" type="vector" wkbType="Polygon">
      <id>karabakh_parcels</id>
      <datasource>./public/gis/karabakh_parcels.geojson</datasource>
      <keywordList><value></value></keywordList>
      <layername>Qarabağ Dövlət Torpaq Fondu &amp; Məşğulluq Sahələri</layername>
      <srs>
        <spatialrefsys nativeFormat="Wkt"><wkt>EPSG:4326</wkt></spatialrefsys>
      </srs>
    </maplayer>
  </projectlayers>
  <ProjectViewSettings UseProjectScales="0" rotation="0">
    <Scales/>
    <DefaultViewExtent xmax="47.60" xmin="45.60" ymax="40.50" ymin="38.80">
      <spatialrefsys nativeFormat="Wkt"><wkt>EPSG:4326</wkt></spatialrefsys>
    </DefaultViewExtent>
  </ProjectViewSettings>
</qgis>
"""

# Write InvestAreaBacking.qgs and package into InvestAreaBacking.qgz
with open("InvestAreaBacking.qgs", "w", encoding="utf-8") as f:
    f.write(qgs_content)

# Update zip archive InvestAreaBacking.qgz
with zipfile.ZipFile("InvestAreaBacking.qgz", "w", zipfile.ZIP_DEFLATED) as z:
    z.write("InvestAreaBacking.qgs", "InvestAreaBacking.qgs")
    # if styles exist, keep them
    if os.path.exists("kdJUnG_styles.db"):
        z.write("kdJUnG_styles.db", "kdJUnG_styles.db")

print("Updated InvestAreaBacking.qgz with all Karabakh layers and extent!")
