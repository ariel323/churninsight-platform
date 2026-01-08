-- ============================================================================
-- Script de Migración: Enriquecimiento de Datos - Fase 3
-- ============================================================================
-- Proyecto: ChurnInsight Platform
-- Fecha: Enero 8, 2026
-- Descripción: Agrega 5 campos nuevos a prediction_history para habilitar
--              KPIs de negocio (Capital en Riesgo, filtros por país, etc.)
-- ============================================================================

-- IMPORTANTE: Ejecutar en horario de bajo tráfico (downtime estimado: ~5 min)
-- IMPORTANTE: Hacer backup de la tabla antes de ejecutar

-- ============================================================================
-- 1. VERIFICAR TABLA EXISTENTE
-- ============================================================================
SELECT COUNT(*) AS total_registros FROM prediction_history;
-- Anotar el número de registros antes de la migración

-- ============================================================================
-- 2. AGREGAR NUEVAS COLUMNAS (Todas nullable por compatibilidad)
-- ============================================================================

-- Columna 1: Balance del cliente (crítico para "Capital en Riesgo")
ALTER TABLE prediction_history
ADD COLUMN balance DOUBLE PRECISION NULL
COMMENT 'Balance de la cuenta del cliente al momento de la predicción';

-- Columna 2: Salario estimado del cliente
ALTER TABLE prediction_history
ADD COLUMN estimated_salary DOUBLE PRECISION NULL
COMMENT 'Salario estimado anual del cliente';

-- Columna 3: País del cliente (para filtros geográficos)
ALTER TABLE prediction_history
ADD COLUMN country VARCHAR(50) NULL
COMMENT 'País del cliente (Germany, France, Spain)';

-- Columna 4: Antigüedad del cliente (tenure)
ALTER TABLE prediction_history
ADD COLUMN tenure INTEGER NULL
COMMENT 'Años de antigüedad del cliente con el banco';

-- Columna 5: Estado de membresía activa
ALTER TABLE prediction_history
ADD COLUMN is_active_member BOOLEAN NULL
COMMENT 'Indica si el cliente es un miembro activo (true/false)';

-- ============================================================================
-- 3. CREAR ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ============================================================================

-- Índice para consultas de KPIs (filtrar por probabilidad alta)
CREATE INDEX idx_prediction_history_probability 
ON prediction_history(churn_probability) 
WHERE churn_probability > 0.75;

-- Índice para filtros por país
CREATE INDEX idx_prediction_history_country 
ON prediction_history(country) 
WHERE country IS NOT NULL;

-- Índice compuesto para historial de cliente por fecha
CREATE INDEX idx_prediction_history_customer_date 
ON prediction_history(customer_id, prediction_date DESC);

-- ============================================================================
-- 4. VALIDAR MIGRACIÓN
-- ============================================================================

-- Verificar que las columnas se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'prediction_history'
  AND column_name IN ('balance', 'estimated_salary', 'country', 'tenure', 'is_active_member')
ORDER BY ordinal_position;

-- Verificar que no se perdieron registros
SELECT COUNT(*) AS total_registros_despues FROM prediction_history;
-- Debe coincidir con el conteo del paso 1

-- Verificar estructura completa de la tabla
DESCRIBE prediction_history;

-- ============================================================================
-- 5. DATOS DE PRUEBA (OPCIONAL - Solo en entorno DEV)
-- ============================================================================

-- Ejemplo: Actualizar un registro existente con datos de prueba
-- COMENTAR ESTA SECCIÓN EN PRODUCCIÓN

/*
UPDATE prediction_history
SET 
    balance = 75000.00,
    estimated_salary = 120000.00,
    country = 'Germany',
    tenure = 5,
    is_active_member = TRUE
WHERE id = 1;

-- Verificar actualización
SELECT * FROM prediction_history WHERE id = 1;
*/

-- ============================================================================
-- 6. ROLLBACK (En caso de error)
-- ============================================================================

-- Si algo sale mal, ejecutar estos comandos para revertir:
/*
-- ROLLBACK PLAN:
ALTER TABLE prediction_history DROP COLUMN balance;
ALTER TABLE prediction_history DROP COLUMN estimated_salary;
ALTER TABLE prediction_history DROP COLUMN country;
ALTER TABLE prediction_history DROP COLUMN tenure;
ALTER TABLE prediction_history DROP COLUMN is_active_member;

DROP INDEX IF EXISTS idx_prediction_history_probability;
DROP INDEX IF EXISTS idx_prediction_history_country;
DROP INDEX IF EXISTS idx_prediction_history_customer_date;
*/

-- ============================================================================
-- 7. NOTAS POST-MIGRACIÓN
-- ============================================================================

/*
SIGUIENTE PASO: Actualizar el backend para poblar estos campos en nuevas predicciones

1. Modificar ChurnController.java para recibir estos campos en POST /api/churn/predict
2. Actualizar ChurnPredictionRequest.java con los nuevos campos
3. Modificar el código que guarda en prediction_history para incluir estos valores

EJEMPLO:
PredictionHistory record = new PredictionHistory();
record.setCustomerId(request.getCustomerId());
record.setChurnProbability(prediction.getChurnProbability());
record.setBalance(request.getBalance());  // NUEVO
record.setEstimatedSalary(request.getEstimatedSalary());  // NUEVO
record.setCountry(request.getCountry());  // NUEVO
record.setTenure(request.getTenure());  // NUEVO
record.setIsActiveMember(request.getIsActiveMember());  // NUEVO
// ... resto de campos existentes
*/

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- CHECKLIST POST-EJECUCIÓN:
-- [ ] Verificar que todas las columnas se crearon
-- [ ] Verificar que los índices se crearon
-- [ ] Verificar que no se perdieron registros
-- [ ] Probar endpoint /api/stats/kpis (debe devolver capitalAtRisk=0 inicialmente)
-- [ ] Probar endpoint /api/churn/customer/{id}/history (debe funcionar con valores NULL)
-- [ ] Reiniciar backend Java (Spring Boot debe reconocer las nuevas columnas)
-- [ ] Hacer una predicción de prueba con los nuevos campos
-- [ ] Verificar que los KPIs del frontend muestran datos correctos
