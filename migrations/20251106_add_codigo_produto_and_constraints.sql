-- Migration originalmente planned to add `codigo_produto` to produtos_transportados.
-- The team decided NOT to add `codigo_produto`. This file is intentionally kept as a no-op
-- placeholder to document the decision and MUST NOT be executed.

-- Decision log: 2025-11-06
--   - Removed planned addition of `codigo_produto` column from produtos_transportados.
--   - Backend updated to write products into existing columns only (carga, movimentacao, origem, destino, distancia, modalidade, acondicionamento, ordem).
-- If you need to apply any constraint/index changes later, create a new migration explicitly.
