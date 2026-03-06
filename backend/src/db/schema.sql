-- =============================================
-- CyberAsset Manager — Schéma PostgreSQL
-- Méthode EBIOS Risk Manager (ANSSI 2018)
-- =============================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- UTILISATEURS & AUTH
-- =============================================
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,        -- bcrypt hash
  first_name  VARCHAR(100),
  last_name   VARCHAR(100),
  role        VARCHAR(50) DEFAULT 'analyst' CHECK (role IN ('admin', 'analyst', 'viewer')),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- GESTION DES ACTIFS (Asset Inventory)
-- =============================================
CREATE TABLE assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  type            VARCHAR(50) NOT NULL CHECK (type IN (
    'server', 'workstation', 'network', 'application', 'database', 'cloud', 'iot', 'other'
  )),
  ip_address      INET,
  hostname        VARCHAR(255),
  os              VARCHAR(100),
  owner           VARCHAR(255),
  location        VARCHAR(255),
  criticality     SMALLINT DEFAULT 2 CHECK (criticality BETWEEN 1 AND 4),
  -- 1=Faible, 2=Modéré, 3=Important, 4=Critique
  status          VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'decommissioned')),
  tags            TEXT[],
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_criticality ON assets(criticality);
CREATE INDEX idx_assets_status ON assets(status);

-- =============================================
-- EBIOS RM — PROJETS
-- =============================================
CREATE TABLE ebios_projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  organization    VARCHAR(255),
  scope           TEXT,               -- Périmètre de l'étude
  status          VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- EBIOS RM — ATELIER 1 : Cadrage et socle
-- =============================================

-- Valeurs métier (ce que l'organisation veut protéger)
CREATE TABLE ebios_business_values (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES ebios_projects(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  type            VARCHAR(50) CHECK (type IN ('process', 'information', 'service')),
  responsable     VARCHAR(255),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Biens supports (actifs qui supportent les valeurs métier)
CREATE TABLE ebios_supporting_assets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID REFERENCES ebios_projects(id) ON DELETE CASCADE,
  asset_id            UUID REFERENCES assets(id),         -- lien avec l'inventaire
  business_value_id   UUID REFERENCES ebios_business_values(id),
  name                VARCHAR(255) NOT NULL,
  type                VARCHAR(50) CHECK (type IN ('data', 'software', 'hardware', 'network', 'personnel', 'site', 'organization')),
  created_at          TIMESTAMP DEFAULT NOW()
);

-- Événements redoutés (impacts sur les valeurs métier)
CREATE TABLE ebios_feared_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID REFERENCES ebios_projects(id) ON DELETE CASCADE,
  business_value_id   UUID REFERENCES ebios_business_values(id),
  description         TEXT NOT NULL,
  impact_type         VARCHAR(50) CHECK (impact_type IN ('confidentiality', 'integrity', 'availability', 'traceability')),
  -- Cotation gravité : 1=Négligeable, 2=Limitée, 3=Importante, 4=Critique
  severity            SMALLINT CHECK (severity BETWEEN 1 AND 4),
  created_at          TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- EBIOS RM — ATELIER 2 : Sources de risque
-- =============================================
CREATE TABLE ebios_risk_sources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES ebios_projects(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  category        VARCHAR(50) CHECK (category IN (
    'state_actor', 'organized_crime', 'hacktivist', 'malicious_insider',
    'negligent_insider', 'terrorist', 'competitor', 'researcher'
  )),
  motivation      TEXT,
  -- Cotation pertinence : 1=Très faible, 2=Faible, 3=Significatif, 4=Très significatif
  pertinence      SMALLINT CHECK (pertinence BETWEEN 1 AND 4),
  targeted_objectives TEXT[],    -- Objectifs visés sur les valeurs métier
  created_at      TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- EBIOS RM — ATELIER 3 : Scénarios stratégiques
-- =============================================
CREATE TABLE ebios_strategic_scenarios (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID REFERENCES ebios_projects(id) ON DELETE CASCADE,
  risk_source_id      UUID REFERENCES ebios_risk_sources(id),
  feared_event_id     UUID REFERENCES ebios_feared_events(id),
  name                VARCHAR(255) NOT NULL,
  description         TEXT,
  attack_path         TEXT,           -- Chemin d'attaque décrit
  -- Cotation vraisemblance : 1=Très faible, 2=Faible, 3=Significative, 4=Très significative
  likelihood          SMALLINT CHECK (likelihood BETWEEN 1 AND 4),
  -- Gravité héritée de l'événement redouté
  severity            SMALLINT CHECK (severity BETWEEN 1 AND 4),
  -- Niveau de risque = combinaison likelihood x severity
  risk_level          VARCHAR(20) CHECK (risk_level IN ('acceptable', 'tolerable', 'unacceptable')),
  created_at          TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- EBIOS RM — ATELIER 4 : Scénarios opérationnels
-- =============================================
CREATE TABLE ebios_operational_scenarios (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id              UUID REFERENCES ebios_projects(id) ON DELETE CASCADE,
  strategic_scenario_id   UUID REFERENCES ebios_strategic_scenarios(id),
  name                    VARCHAR(255) NOT NULL,
  description             TEXT,
  attack_technique        VARCHAR(255),   -- ex: Phishing, SQLi, RCE...
  mitre_attack_ref        VARCHAR(50),    -- ex: T1566 (MITRE ATT&CK)
  targeted_asset_id       UUID REFERENCES ebios_supporting_assets(id),
  -- Cotation technique (difficulté pour l'attaquant)
  technical_likelihood    SMALLINT CHECK (technical_likelihood BETWEEN 1 AND 4),
  created_at              TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- EBIOS RM — ATELIER 5 : Traitement du risque
-- =============================================
CREATE TABLE ebios_security_measures (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id              UUID REFERENCES ebios_projects(id) ON DELETE CASCADE,
  strategic_scenario_id   UUID REFERENCES ebios_strategic_scenarios(id),
  name                    VARCHAR(255) NOT NULL,
  description             TEXT,
  type                    VARCHAR(50) CHECK (type IN ('preventive', 'detective', 'corrective', 'deterrent')),
  treatment_option        VARCHAR(50) CHECK (treatment_option IN ('reduce', 'transfer', 'avoid', 'accept')),
  status                  VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'implemented')),
  responsible             VARCHAR(255),
  deadline                DATE,
  -- Risque résiduel après mesure
  residual_risk_level     VARCHAR(20) CHECK (residual_risk_level IN ('acceptable', 'tolerable', 'unacceptable')),
  created_at              TIMESTAMP DEFAULT NOW(),
  updated_at              TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- VUES UTILES
-- =============================================

-- Vue synthèse des risques par projet
CREATE VIEW v_risk_summary AS
SELECT
  ep.id AS project_id,
  ep.name AS project_name,
  ss.name AS scenario_name,
  rs.name AS risk_source,
  ss.likelihood,
  ss.severity,
  ss.risk_level,
  COUNT(sm.id) AS measures_count,
  COUNT(CASE WHEN sm.status = 'implemented' THEN 1 END) AS measures_implemented
FROM ebios_projects ep
JOIN ebios_strategic_scenarios ss ON ss.project_id = ep.id
JOIN ebios_risk_sources rs ON rs.id = ss.risk_source_id
LEFT JOIN ebios_security_measures sm ON sm.strategic_scenario_id = ss.id
GROUP BY ep.id, ep.name, ss.name, rs.name, ss.likelihood, ss.severity, ss.risk_level;

-- Données de démonstration
INSERT INTO users (email, password, first_name, last_name, role)
VALUES ('admin@cyberasset.local', '$2b$12$placeholder_hash', 'Admin', 'Demo', 'admin');
