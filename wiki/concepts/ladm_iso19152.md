---
title: "ISO 19152 LADM və FAO SOLA Torpaq Kadastr Standartı"
type: concept
tags: [ladm, sola, cadastre, iso19152, gis, database]
date: 2026-10-27
updated: 2026-10-27
status: verified
sources: ["[[raw/ladm_iso19152_kadastr_standarti]]", "[[entities/emdx]]"]
---

# 📐 ISO 19152 LADM və SOLA Standartı

**LADM (Land Administration Domain Model)** torpaq inzibatçılığı, kadastr, torpaq mülkiyyəti və icarə hüquqlarının rəqəmsal təsviri üzrə beynəlxalq standartdır (ISO 19152).

---

## 🏗️ Nüvə Model Birləşmələri

```
LA_Party (İnvestor / Dövlət) 
        ↓
LA_RRR (Rights, Restrictions, Responsibilities)
        ↓
LA_BAUnit (Əsas İnzibati Vahid)
        ↓
LA_SpatialUnit (Kadastr Parseli / Həndəsə)
```

- **Hüquqlar (`Rights`):** 10-25 illik kənd təsərrüfatı icarəsi.
- **Məhdudiyyətlər (`Restrictions`):** ANAMA təhlükəsizlik buferi, su mühafizə zolağı.
- **Öhdəliklər (`Responsibilities`):** 2 il ərzində investisiya öhdəliyinin icrası, torpağın bonitetinin azaldılmaması.
- Ətraflı PostgreSQL sxemi üçün bax: `database/schema/01_azerbaijan_cadastre_ladm.sql`.
