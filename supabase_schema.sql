-- ============================================================
-- ТехноПро CRM — схема базы данных
-- Выполнить в Supabase SQL Editor
-- ============================================================

-- Стадии контракта
CREATE TABLE IF NOT EXISTS stages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER NOT NULL UNIQUE
);

INSERT INTO stages (id, name, color, order_index) VALUES
  (1, 'Запрос КП',             '#9E9E9E', 1),
  (2, 'КП отправлено',         '#42A5F5', 2),
  (3, 'Переговоры',            '#FFA726', 3),
  (4, 'Договор подписан',      '#1565C0', 4),
  (5, 'Аванс получен',         '#66BB6A', 5),
  (6, 'Производство/поставка', '#FF7043', 6),
  (7, 'КС подписан',           '#2E7D32', 7),
  (8, 'Финальная оплата',      '#1B5E20', 8)
ON CONFLICT (id) DO NOTHING;

-- Контракты
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT,
  contract_date DATE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  manager_name TEXT,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  stage_id INTEGER REFERENCES stages(id) ON DELETE SET NULL DEFAULT 1,
  deadline DATE,
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','advance','partial','paid')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Платежи
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('advance','intermediate','final')),
  date DATE NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- История смены стадий
CREATE TABLE IF NOT EXISTS stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  stage_id INTEGER NOT NULL REFERENCES stages(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  comment TEXT
);

-- Документы (метаданные)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Автообновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS — Row Level Security
-- ============================================================

ALTER TABLE contracts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages        ENABLE ROW LEVEL SECURITY;

-- Авторизованные пользователи видят всё
CREATE POLICY "auth_read_contracts"     ON contracts     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_payments"      ON payments      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_stage_history" ON stage_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_documents"     ON documents     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_stages"        ON stages        FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Индексы
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contracts_stage_id   ON contracts(stage_id);
CREATE INDEX IF NOT EXISTS idx_contracts_manager_id ON contracts(manager_id);
CREATE INDEX IF NOT EXISTS idx_contracts_deadline   ON contracts(deadline);
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_contract_id ON stage_history(contract_id);
