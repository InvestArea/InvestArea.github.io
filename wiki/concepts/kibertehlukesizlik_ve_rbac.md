---
title: "Kibertəhlükəsizlik Arxitekturası, RBAC və Məlumatların Mühafizəsi"
type: concept
tags: [security, rbac, jwt, owasp, cryptography]
date: 2026-10-28
updated: 2026-10-28
status: verified
sources: ["[[raw/pentest_tehlukesizlik_hesabati]]"]
---

# 🛡️ Kibertəhlükəsizlik və Rol Əsaslı Giriş (RBAC)

InvestArea dövlət və kommersiya sirri təşkil edən torpaq müsabiqəsi məlumatlarının toxunulmazlığını təmin etmək üçün qabaqcıl kiber-mühafizə standartlarına cavab verir.

---

## 🔐 Nüvə Təhlükəsizlik Mexanizmləri

1. **HMAC-SHA256 İmzalanmış JWT Tokenləri:**
   - Sessiya müddəti: 60 dəqiqə.
   - Hər bir token istifadəçinin rolunu (`INVESTOR`, `EXPERT`, `SUPER_ADMIN`) və unikal FİN/VÖEN identifikatorunu daşıyır.

2. **Rol İyerarxiyası (RBAC):**
   - **İnvestor / Sahibkar:** Yalnız öz müraciətlərini redaktə edə və statusunu izləyə bilər.
   - **Komissiya Eksperti:** Müraciət fayllarını oxuya və 100 ballıq sistemlə səs verə bilər.
   - **Super Admin (KTN / Dövlət İnzibatçısı):** Bütün müraciətləri yekun təsdiqləyə, istifadəçi reyestrini və audit qeydlərini idarə edə bilər.

3. **Status Maşını Mühafizəsi (State Transition Guard):**
   - Müraciət qəbul edilmədən birbaşa qalib elan edilə bilməz. Hər bir keçid rəqəmsal imzalanır və qeyri-qanuni addımlar `HTTP 400` statusu ilə rədd edilir.

4. **Təhlükəsizlik Başlıqları (Security Headers):**
   - `Content-Security-Policy (CSP)`, `X-Frame-Options: DENY`, `Strict-Transport-Security (HSTS)`.
