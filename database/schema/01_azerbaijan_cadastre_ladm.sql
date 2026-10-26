-- ==============================================================================
-- InvestAreaBacking — Azərbaycan Dövlət Torpaq İdarəçiliyi və Kadastr Sxemi
-- FAO LADM (ISO 19152) Standartı Əsasında Azərbaycan Torpaq Qanunvericiliyinə Uyğunlaşdırılmışdır
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Sxemlərin yaradılması
CREATE SCHEMA IF NOT EXISTS cadastre;
CREATE SCHEMA IF NOT EXISTS administrative;
CREATE SCHEMA IF NOT EXISTS party;
CREATE SCHEMA IF NOT EXISTS source;
CREATE SCHEMA IF NOT EXISTS application;

-- ------------------------------------------------------------------------------
-- 1. İnzibati Ərazi Bölgüsü və Sərhədlər (HDX BMT OCHA / Dövlət Statistika Komitəsi İƏBT)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cadastre.hierarchy_level (
    id VARCHAR(20) PRIMARY KEY, -- 'ADM1', 'ADM2', 'ADM3'
    name VARCHAR(100) NOT NULL,
    description TEXT
);

INSERT INTO cadastre.hierarchy_level (id, name, description) VALUES
('ADM1', 'İqtisadi Rayon', 'Qarabağ və Şərqi Zəngəzur İqtisadi Rayonları'),
('ADM2', 'İnzibati Rayon', 'Ağdam, Füzuli, Şuşa, Kəlbəcər, Laçın, Zəngilan və s.'),
('ADM3', 'Kənd / Bələdiyyə / İƏD', 'İnzibati Ərazi Dairəsi, kənd və bələdiyyə poliqonları')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS cadastre.spatial_unit_group (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hierarchy_level_id VARCHAR(20) REFERENCES cadastre.hierarchy_level(id),
    parent_id UUID REFERENCES cadastre.spatial_unit_group(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE, -- İƏBT Kodu (stat.gov.az)
    area_sqkm NUMERIC(12, 2),
    population INTEGER DEFAULT 0,
    households INTEGER DEFAULT 0,
    active_workforce INTEGER DEFAULT 0,
    returnees_count INTEGER DEFAULT 0,
    bonitet_score INTEGER, -- 1-100 torpaq bonitet balı
    elevation_m INTEGER,
    geom geometry(MultiPolygon, 4326),
    centroid geometry(Point, 4326),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. Torpaq Bağlamaları (Kadastr Obyektləri)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cadastre.cadastre_object (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spatial_unit_group_id UUID REFERENCES cadastre.spatial_unit_group(id),
    cadastre_number VARCHAR(60) NOT NULL UNIQUE, -- Məsələn: 'AZ-02-AGD-001'
    district VARCHAR(100) NOT NULL,
    village VARCHAR(150) NOT NULL,
    land_category VARCHAR(100) DEFAULT 'Kənd təsərrüfatı təyinatlı torpaqlar',
    area_ha NUMERIC(10, 2) NOT NULL,
    bonitet_score INTEGER NOT NULL,
    geom geometry(Polygon, 4326),
    geom_utm38n geometry(Polygon, 32638),
    center_lat NUMERIC(9, 6),
    center_lon NUMERIC(9, 6),
    status VARCHAR(30) DEFAULT 'MÜSABİQƏDƏ', -- 'MÜSABİQƏDƏ', 'AUKSİONDA', 'İCARƏYƏ VERİLDİ', 'EHTİYAT'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. İnzibati Vahid və İcarə / Müsabiqə Hüquqları (administrative.ba_unit & RRR)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS administrative.ba_unit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cadastre_object_id UUID REFERENCES cadastre.cadastre_object(id),
    type_code VARCHAR(50) DEFAULT 'STATE_INVESTMENT_PARCEL',
    min_investment_azn NUMERIC(14, 2) NOT NULL,
    min_jobs_required INTEGER NOT NULL,
    min_local_workforce_pct INTEGER DEFAULT 80,
    lease_term_years INTEGER DEFAULT 25,
    annual_lease_fee_azn NUMERIC(12, 2),
    special_conditions TEXT
);

CREATE TABLE IF NOT EXISTS administrative.rrr (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ba_unit_id UUID REFERENCES administrative.ba_unit(id),
    type_code VARCHAR(50) NOT NULL, -- 'LEASE', 'RESTRICTION', 'RESPONSIBILITY'
    description TEXT,
    share NUMERIC(5, 2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. Tərəflər (party.party - Vahid 'Müraciət edən şəxs' Rolu)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS party.party (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_type VARCHAR(30) NOT NULL, -- 'LEGAL_PERSON' (Hüquqi şəxs) və ya 'PHYSICAL_PERSON' (Fiziki şəxs)
    name VARCHAR(255) NOT NULL, -- Şirkət adı və ya VÖEN-li fiziki şəxs adı
    tin VARCHAR(20) NOT NULL UNIQUE, -- VÖEN (10 rəqəmli)
    pin VARCHAR(10), -- FİN (7 simvollu)
    asan_signature_phone VARCHAR(20), -- ASAN İmza mobil nömrəsi (+99450XXXXXXX)
    sima_certificate_id VARCHAR(100), -- SİMA rəqəmsal sertifikat seriyası
    authorized_representative VARCHAR(150),
    legal_address TEXT,
    contact_phone VARCHAR(50),
    email VARCHAR(100),
    bank_name VARCHAR(150),
    bank_iban VARCHAR(40),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. Dövlət Elektron Xidmətləri ilə İnteqrasiya Sənədləri (source.source)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS source.source (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_id UUID REFERENCES party.party(id),
    service_type VARCHAR(50) NOT NULL, -- 'AVIS_TAX', 'EKTIS_SUBSIDY', 'DEK_PROPERTY', 'DSMF_DEBT', 'BANK_GUARANTEE'
    document_number VARCHAR(100) NOT NULL,
    verification_status VARCHAR(30) DEFAULT 'TƏSDİQLƏNDİ', -- 'TƏSDİQLƏNDİ', 'GÖZLƏYİR', 'İMTİNA'
    service_response JSONB DEFAULT '{}'::jsonb,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. Müsabiqə Müraciətləri və 9 Qurumluq Komissiya Qiymətləndirməsi
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application.application (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number VARCHAR(60) UNIQUE NOT NULL, -- 'APP-2026-XXXX'
    party_id UUID REFERENCES party.party(id),
    cadastre_object_id UUID REFERENCES cadastre.cadastre_object(id),
    business_plan_title VARCHAR(255) NOT NULL,
    proposed_investment_azn NUMERIC(14, 2) NOT NULL,
    promised_jobs_count INTEGER NOT NULL,
    promised_local_workforce_pct INTEGER NOT NULL,
    suitability_score NUMERIC(5, 2), -- 100 ballıq sistem
    commission_verdict VARCHAR(50) DEFAULT 'MÜZAKİRƏDƏ', -- 'QALİB SEÇİLDİ', 'EHTİYAT İDDİAÇI', 'UYĞUN DEYİL'
    protocol_number VARCHAR(60), -- 'PROTOKOL №-09/QAR'
    status VARCHAR(30) DEFAULT 'TƏQDİM EDİLDİ',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- İndekslər
CREATE INDEX IF NOT EXISTS idx_spatial_group_geom ON cadastre.spatial_unit_group USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_spatial_group_code ON cadastre.spatial_unit_group(code);
CREATE INDEX IF NOT EXISTS idx_cadastre_geom ON cadastre.cadastre_object USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_cadastre_number ON cadastre.cadastre_object(cadastre_number);
CREATE INDEX IF NOT EXISTS idx_party_tin ON party.party(tin);
