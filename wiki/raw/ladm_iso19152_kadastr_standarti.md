---
title: "ISO 19152 LADM və FAO SOLA Modeli"
type: source
tags: [ladm, sola, cadastre, iso19152, standards]
date: 2026-10-28
updated: 2026-10-28
status: immutable
---

# 📜 Xammal Mənbə: ISO 19152 LADM və FAO SOLA Torpaq İdarəetmə Modeli

> **Sənəd Növü:** Beynəlxalq Kadastr və Verilənlər Bazası Arxitekturası  
> **Əsas İstinad:** ISO 19152:2012 Land Administration Domain Model (LADM) və FAO Solutions for Open Land Administration (SOLA)  
> **Status:** İmmutable / Dəyişdirilməz Mənbə

---

## 1. LADM Əsas Nüvə Paketləri
ISO 19152 standartı dörd əsas sinif paketindən ibarətdir:

1. **Party Package (`LA_Party`):**
   - Fiziki şəxslər, hüquqi şəxslər, fermerlər, investorlar və dövlət qurumları.
   - Azərbaycan reallığında: FİN, VÖEN, EKTİS fermer ID-si.

2. **Administrative Package (`LA_RRR`):**
   - **Rights (Hüquqlar):** Mülkiyyət, icarə, istifadə, girov.
   - **Restrictions (Məhdudiyyətlər):** ANAMA mina riski zonaları, mühafizə zolaqları, su ehtiyatı servitutları.
   - **Responsibilities (Öhdəliklər):** Müəyyən olunmuş müddətdə investisiya yatırımı, torpağın münbitliyinin qorunması.

3. **Spatial Unit Package (`LA_SpatialUnit`):**
   - Kadastr parselləri (`cadastre_object`), torpaq massivləri, sərhəd nöqtələri (`LA_Point`) və sərhəd xətləri (`LA_BoundaryFaceString`).
   - Koordinat sistemi: Pulkovo 1942 / 3-degree Gauss-Kruger zone və WGS 84 / UTM zone 38N (EPSG:32638).

4. **Surveying and Representation Package (`LA_SpatialSource`):**
   - Peyk təsvirləri (Sentinel-2, Planet), ortofotolar, dron aeroçəkilişləri və GPS koordinat ölçmə aktları.

## 2. PostgreSQL / PostGIS İcra Sxemi
- Sxemlər: `cadastre`, `administrative`, `party`, `spatial_unit`.
- Həndəsi tiplər: `ST_MultiPolygon`, `ST_Point`, `ST_MultiLineString`.
- Topoloji bütövlük: Parsellər arasında üst-üstə düşmə (overlap) və boşluq (gap) qadağandır.
