-- Migración de la Fase E: Flujo E2E y Anti-Trampas
-- Añade columnas de control y seguridad a la tabla ctrader_accounts

ALTER TABLE ctrader_accounts ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending_link';
ALTER TABLE ctrader_accounts ADD COLUMN IF NOT EXISTS status_reason TEXT;
ALTER TABLE ctrader_accounts ADD COLUMN IF NOT EXISTS ctrader_balance_snapshot NUMERIC;
ALTER TABLE ctrader_accounts ADD COLUMN IF NOT EXISTS ctrader_leverage INTEGER;
ALTER TABLE ctrader_accounts ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT true;
ALTER TABLE ctrader_accounts ADD COLUMN IF NOT EXISTS linked_at TIMESTAMPTZ;
ALTER TABLE ctrader_accounts ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMPTZ;
ALTER TABLE ctrader_accounts ADD COLUMN IF NOT EXISTS peak_equity NUMERIC;
ALTER TABLE ctrader_accounts ADD COLUMN IF NOT EXISTS profit_target NUMERIC;
ALTER TABLE ctrader_accounts ADD COLUMN IF NOT EXISTS max_drawdown_pct NUMERIC DEFAULT 10;
ALTER TABLE ctrader_accounts ADD COLUMN IF NOT EXISTS daily_drawdown_pct NUMERIC DEFAULT 5;
