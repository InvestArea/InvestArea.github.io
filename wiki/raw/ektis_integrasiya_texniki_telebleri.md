---
title: "Dövlət İnformasiya Sistemləri ilə İnteqrasiya Tələbləri"
type: source
tags: [ektis, avis, anama, emdx, api]
date: 2026-10-28
updated: 2026-10-28
status: immutable
---

# 📜 Xammal Mənbə: Dövlət İnformasiya Sistemləri ilə İnteqrasiya Tələbləri (EKTİS, AVİS, ANAMA, ƏMDX)

> **Sənəd Növü:** Dövlət Sistemlərarası İnteqrasiya və API Şlüzü Spesifikasiyası  
> **Əsas Qurumlar:** KTN (EKTİS), DVX (AVİS), ANAMA, ƏMDX (Kadastr), myGov  
> **Status:** İmmutable / Dəyişdirilməz Mənbə

---

## 1. EKTİS (Elektron Kənd Təsərrüfatı İnformasiya Sistemi)
- **Funksiya:** Fermerlərin qeydiyyatı, əkin bəyannamələri, subsidiya tarixçəsi, aqro-texnika balansı.
- **API Metodları:**
  - `GET /api/v1/ektis/farmer/{fin_or_voen}`: Fermerin rəsmi statusu və mövcud əkin təcrübəsi.
  - `POST /api/v1/ektis/application-sync`: Təsdiq edilmiş müsabiqə qalibinin sahəsinin EKTİS bazasına dövlət kodu ilə qeydiyyatı.

## 2. AVİS (Avtomatlaşdırılmış Vergi İnformasiya Sistemi)
- **Funksiya:** İnvestorun maliyyə etibarlılığı və vergi borcunun olmaması.
- **API Metodları:**
  - `GET /api/v1/tax/debt-status/{voen}`: Cari vergi borcu, dondurulmuş hesabların yoxlanması.

## 3. ANAMA (Azərbaycan Respublikasının Minatəmizləmə Agentliyi)
- **Funksiya:** Parselin təhlükəsizlik statusunun real vaxt rejimində təsdiqi.
- **Təhlükəsizlik Statusları:**
  - `LEVEL_1_CLEARED`: Ərazi minadan tam təmizlənib və rəsmi təhvil-təslim aktı var. Təsərrüfat üçün dərhal yararlıdır.
  - `LEVEL_2_SURVEYED`: Qeyri-texniki tədqiqat aparılıb, təhlükəsiz cığırlar müəyyən olunub, təmizlənmə planlaşdırılır.
  - `LEVEL_3_RESTRICTED`: Yüksək riskli zona, təsərrüfat fəaliyyəti qəti qadağandır.

## 4. Əmlak Məsələləri Dövlət Xidməti (ƏMDX)
- **Funksiya:** Torpağın kadastr nömrəsi, kateqoriyası, mülkiyyət növü və qeydiyyat çıxarışı.
