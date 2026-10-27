---
title: "LADM və FAO SOLA Verilənlər Bazası Cədvəlləri"
type: source
tags: [database, postgresql, postgis, ladm, schema]
date: 2026-10-28
updated: 2026-10-28
status: immutable
---

# 📜 Xammal Mənbə: LADM və FAO SOLA Verilənlər Bazası Cədvəlləri

> **Sənəd Növü:** PostgreSQL / PostGIS DDL Sxemləri  
> **İstinad:** `database/schema/01_azerbaijan_cadastre_ladm.sql` və `database/sola/`  
> **Status:** İmmutable / Dəyişdirilməz Mənbə

---

## 1. Nüvə Cədvəllər və Münasibətlər
- **`party.party`:** Şəxsin növü (fiziki / hüquqi), FİN, VÖEN, əlaqə və bank məlumatları.
- **`administrative.rrr`:** Hüquqlar (`right`), məhdudiyyətlər (`restriction`) və öhdəliklər (`responsibility`).
  - `rrr_type`: `leasehold_agricultural`, `anama_hazard_restriction`, `irrigation_servitude`.
  - `time_period`: icarə müddəti (10-25 il).
- **`cadastre.cadastre_object`:** Torpaq parseli.
  - `name_firstpart` (Rayon kodu), `name_lastpart` (Parsel nömrəsi).
  - `geom_polygon` (`geometry(MultiPolygon, 32638)`).
  - `area_sqm`, `bonitet_rating`, `soil_type`, `irrigation_type`.
- **`transaction.application`:** Müsabiqə müraciəti.
  - `tracking_number`: `INV-2026-AGD-XXXX`.
  - `investment_azn`, `jobs_expected`, `status`.
