-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  pricing_tier      VARCHAR(50) DEFAULT 'standard',
  default_customer_commitment_preference VARCHAR(100),
  default_payment_terms VARCHAR(100),
  active_status     VARCHAR(20) DEFAULT 'active',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(active_status);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- Product configs
CREATE TABLE IF NOT EXISTS product_configs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_family        VARCHAR(100) NOT NULL,
  dimensions            JSONB,
  material              VARCHAR(100),
  weight                DECIMAL(12, 4),
  finish                VARCHAR(100),
  printing              BOOLEAN DEFAULT false,
  certifications       JSONB DEFAULT '[]',
  packaging_configuration VARCHAR(255),
  pallet_configuration  VARCHAR(255),
  mold_required         BOOLEAN DEFAULT false,
  mold_cost             DECIMAL(12, 2),
  special_requirements  TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_configs_family ON product_configs(product_family);

-- Customer commitments (delivery/logistics model)
CREATE TABLE IF NOT EXISTS customer_commitments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type               VARCHAR(100) NOT NULL UNIQUE,
  warehouse_required BOOLEAN DEFAULT false,
  storage_required   BOOLEAN DEFAULT false,
  delivery_required  BOOLEAN DEFAULT false,
  freight_type       VARCHAR(50),
  export_required   BOOLEAN DEFAULT false,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_commitments_type ON customer_commitments(type);

-- Cost rules
CREATE TABLE IF NOT EXISTS cost_rules (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name           VARCHAR(255) NOT NULL,
  rule_category       VARCHAR(50) NOT NULL,
  trigger_conditions  JSONB NOT NULL DEFAULT '{}',
  calculation_type    VARCHAR(50) NOT NULL,
  cost_value          DECIMAL(12, 4) NOT NULL,
  cost_unit           VARCHAR(50) NOT NULL,
  active              BOOLEAN DEFAULT true,
  effective_date      DATE,
  expiration_date     DATE,
  approval_trigger     BOOLEAN DEFAULT false,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_rules_category ON cost_rules(rule_category);
CREATE INDEX IF NOT EXISTS idx_cost_rules_active ON cost_rules(active);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id           UUID REFERENCES customers(id),
  sales_rep             VARCHAR(255),
  quote_date            DATE NOT NULL,
  expected_close_date   DATE,
  opportunity_notes     TEXT,
  project_name          VARCHAR(255),
  opportunity_size      DECIMAL(15, 2),
  confidence_level      VARCHAR(50),
  product_config_id     UUID REFERENCES product_configs(id),
  quoted_quantity       INTEGER NOT NULL,
  annual_forecast_volume INTEGER,
  commitment_type       VARCHAR(50),
  payment_terms         VARCHAR(100),
  target_price          DECIMAL(12, 4),
  margin_target         DECIMAL(5, 2),
  customer_commitment_id UUID REFERENCES customer_commitments(id),
  customer_commitment_details JSONB DEFAULT '{}',
  calculated_unit_price  DECIMAL(12, 4),
  tooling_charges       DECIMAL(12, 2) DEFAULT 0,
  logistics_charges     DECIMAL(12, 2) DEFAULT 0,
  import_duty_charges   DECIMAL(12, 2) DEFAULT 0,
  handling_charges     DECIMAL(12, 2) DEFAULT 0,
  storage_charges       DECIMAL(12, 2) DEFAULT 0,
  estimated_margin      DECIMAL(5, 2),
  total_quote_value     DECIMAL(15, 2),
  assumptions_json      JSONB DEFAULT '{}',
  warnings_json         JSONB DEFAULT '[]',
  approval_required     BOOLEAN DEFAULT false,
  status                VARCHAR(50) DEFAULT 'draft',
  odoo_reference        VARCHAR(255),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(quote_date);
