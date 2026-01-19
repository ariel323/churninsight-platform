-- ============================================================================
-- Migración V2: Agregar campos dinámicos para modelo actualizado
-- ============================================================================
-- Fecha: Enero 2026
-- Descripción: Agrega campos dinámicos para el modelo de churn con 500k datos
-- ============================================================================

ALTER TABLE prediction_history
ADD COLUMN delta_balance DOUBLE PRECISION NULL,
ADD COLUMN delta_num_of_products DOUBLE PRECISION NULL,
ADD COLUMN recent_inactive BOOLEAN NULL,
ADD COLUMN product_usage_drop BOOLEAN NULL,
ADD COLUMN had_complaint BOOLEAN NULL;

-- Agregar índices para los nuevos campos si es necesario
-- INDEX idx_delta_balance (delta_balance),
-- INDEX idx_recent_inactive (recent_inactive);