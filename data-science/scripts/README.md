# 🚀 ChurnInsight - Scripts de Producción

## Descripción

Scripts Python profesionales para entrenar y desplegar el modelo de predicción de churn en producción.

---

## 📋 Scripts Disponibles

### 1. **`train_model_final.py`** - Entrenamiento Completo

**Propósito:** Entrenar el modelo final con validación exhaustiva

```bash
python scripts/train_model_final.py
```

**Qué hace:**

1. ✅ Carga dataset de `data/dataset.csv`
2. ✅ Valida integridad de datos
3. ✅ Prepara features (8 predictores)
4. ✅ Divide train/test (70/30)
5. ✅ Entrena RandomForestClassifier
6. ✅ Ejecuta 5-fold cross-validation
7. ✅ Evalúa en test set
8. ✅ Guarda modelo en `models/churn_model.pkl`
9. ✅ Genera métricas en `logs/training_metrics.json`

**Output esperado:**

```
✅ Loaded 7000 records
✅ Validation passed
✅ Training Accuracy: 100.0%
✅ Model saved to models/churn_model.pkl
📊 Final Performance:
   Test Accuracy: 100.0%
   Test AUC-ROC:  1.000
   CV Mean AUC:   1.000
🚀 Ready for deployment!
```

**Requisitos:**

- ✅ Dataset en `data/dataset.csv`
- ✅ Dependencias en `requirements.txt`

**Tiempo estimado:** 30-60 segundos

---

### 2. **`deploy_model.py`** - Validación y Despliegue

**Propósito:** Validar modelo y desplegarlo a producción

```bash
python scripts/deploy_model.py
```

**Qué hace:**

1. ✅ Carga modelo de `models/churn_model.pkl`
2. ✅ Carga métricas de `logs/training_metrics.json`
3. ✅ Valida performance (acc>80%, prec>75%, recall>70%, auc>0.85)
4. ✅ Prueba predicciones con 3 muestras
5. ✅ Genera checklist de despliegue
6. ✅ Despliega a `models/churn_model.pkl` (producción)
7. ✅ Crea log de despliegue

**Output esperado:**

```
✅ Model loaded successfully
✅ Metrics loaded successfully
✅ accuracy: 1.000 (threshold: 0.800)
✅ precision: 1.000 (threshold: 0.750)
✅ recall: 1.000 (threshold: 0.700)
✅ auc_roc: 1.000 (threshold: 0.850)
✅ Predictions successful
   Sample 1: Prediction=0, P(Churn)=0.56%
   Sample 2: Prediction=0, P(Churn)=3.47%
   Sample 3: Prediction=1, P(Churn)=99.42%

🟢 MODEL IS READY FOR PRODUCTION DEPLOYMENT
✅ MODEL SUCCESSFULLY DEPLOYED TO PRODUCTION
🎉 Production Model: models/churn_model.pkl
📊 Ready for: http://localhost:8080/api/predict
```

**Requisitos:**

- ✅ Modelo en `models/churn_model.pkl`
- ✅ Métricas en `logs/training_metrics.json`

**Tiempo estimado:** 5-10 segundos

---

### 3. **`generate_synthetic_data.py`** - Generador de Datos

**Propósito:** Generar datasets sintéticos para entrenamiento

```bash
python scripts/generate_synthetic_data.py
```

**Qué hace:**

1. ✅ Genera 7,000 registros sintéticos
2. ✅ Valida todas las features
3. ✅ Calcula Churn (inactivo >120 días)
4. ✅ Divide en train/test (70/30)
5. ✅ Guarda en `data/` carpeta

**Archivos generados:**

- `data/dataset.csv` (1.3 MB)
- `data/dataset_train.csv` (941 KB)
- `data/dataset_test.csv` (403 KB)

**Requisitos:**

- pandas, numpy, scikit-learn

**Tiempo estimado:** 5-10 segundos

---

### 4. **`predict_churn.py`** - Predicción Individual

**Propósito:** Hacer predicción única con modelo entrenado

```bash
python scripts/predict_churn.py '{
  "Age": 35,
  "Income_Level": "Medium",
  "Total_Transactions": 100,
  "Avg_Transaction_Value": 500,
  "Active_Days": 300,
  "App_Usage_Frequency": "Daily",
  "Customer_Satisfaction_Score": 8,
  "Last_Transaction_Days_Ago": 30
}'
```

**Output esperado:**

```json
{
  "prediction": 0,
  "probability_churn": 0.0056,
  "probability_no_churn": 0.9944,
  "interpretation": "Low risk - Client likely to retain"
}
```

---

## 🔄 Flujo Completo de Producción

```
┌──────────────────────────────────────────────┐
│ 1. GENERAR DATOS                             │
│    python scripts/generate_synthetic_data.py │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 2. ENTRENAR MODELO                           │
│    python scripts/train_model_final.py       │
│    → churn_model.pkl (0.7 MB)                │
│    → training_metrics.json                   │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 3. VALIDAR Y DESPLEGAR                       │
│    python scripts/deploy_model.py            │
│    → deployment_checklist.json               │
│    → deployment_log.json                     │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 4. SERVIR EN PRODUCCIÓN                      │
│    Backend Java (puerto 8080)                │
│    POST /api/predict                         │
│    GET /api/health                           │
└──────────────────────────────────────────────┘
```

---

## 📊 Archivos Generados

Después de ejecutar `train_model_final.py` y `deploy_model.py`:

```
models/
├── churn_model.pkl                    (Modelo en producción)
├── churn_model_v1.pkl                 (Backup)
└── churn_model_backup_20251227.pkl   (Backup automático)

logs/
├── training_metrics.json              (Métricas de test)
├── deployment_checklist.json          (Checklist de validación)
└── deployment_log.json                (Historial de despliegues)

data/
├── dataset.csv                        (Dataset completo)
├── dataset_train.csv                  (Entrenamiento)
└── dataset_test.csv                   (Validación)
```

---

## ⚙️ Características de los Scripts

### Validación Automática

- ✅ Chequea valores faltantes
- ✅ Valida tipos de datos
- ✅ Verifica rangos de features
- ✅ Confirma distribución de Churn
- ✅ Valida performance mínima

### Logging Detallado

- ✅ Información de cada paso
- ✅ Métricas en tiempo real
- ✅ Tiempos de ejecución
- ✅ Tamaños de archivos
- ✅ Errores con traceback completo

### Backup Automático

- ✅ Modelo anterior se respalda
- ✅ Log de despliegues mantiene historial
- ✅ Permite rollback si es necesario

### Métricas Detalladas

- ✅ Accuracy, Precision, Recall, F1
- ✅ AUC-ROC, Confusion Matrix
- ✅ Cross-validation scores
- ✅ Classification report

---

## 🔍 Troubleshooting

### Error: "Dataset not found"

```bash
# Solución: Generar dataset primero
python scripts/generate_synthetic_data.py
```

### Error: "Model file not found"

```bash
# Solución: Entrenar modelo primero
python scripts/train_model_final.py
```

### Error: "Performance validation failed"

```bash
# Significa que alguna métrica está bajo el threshold
# Posibles soluciones:
# 1. Mejorar features en data_utils.py
# 2. Ajustar hiperparámetros en build_pipeline()
# 3. Usar más datos
# 4. Feature engineering adicional
```

### Error: "ImportError: No module named..."

```bash
# Solución: Instalar dependencias
pip install -r requirements.txt
```

---

## 📈 Métricas de Éxito

### Training

- ✅ Training Accuracy: > 90%
- ✅ CV Mean AUC: > 0.90

### Deployment

- ✅ Test Accuracy: ≥ 80%
- ✅ Test Precision: ≥ 75%
- ✅ Test Recall: ≥ 70%
- ✅ Test AUC-ROC: ≥ 0.85
- ✅ All 4 checks pass

---

## 🚀 Caso de Uso Completo

```bash
# 1. Posicionarse en data-science
cd data-science

# 2. Generar datos (si no existen)
python scripts/generate_synthetic_data.py
# Output: dataset.csv, dataset_train.csv, dataset_test.csv

# 3. Entrenar modelo
python scripts/train_model_final.py
# Output: churn_model.pkl, training_metrics.json
# Validación: 5-fold CV, test evaluation

# 4. Validar y desplegar
python scripts/deploy_model.py
# Output: deployment_checklist.json, deployment_log.json
# Si todo pass: modelo listo para producción

# 5. Usar en API Java (automático)
# Backend carga models/churn_model.pkl
# Recibe requests en POST /api/predict
# Retorna predicción + probabilidad
```

---

## 📝 Notas Importantes

### Reproducibilidad

- ✅ `random_state=42` en todos lados
- ✅ Mismo seed = mismo modelo
- ✅ Resultados determinísticos

### Producción

- ✅ Error handling completo
- ✅ Logging en todos los niveles
- ✅ Validaciones exhaustivas
- ✅ Backups automáticos

### Monitoreo

- ✅ Archivos JSON con métricas
- ✅ Historial de despliegues
- ✅ Timestamps en todos los registros

---

## 🔐 Seguridad

- ✅ Modelos versionados (backup automático)
- ✅ Deployments loguados con timestamp
- ✅ Validación previa al despliegue
- ✅ Checklist completo antes de producción
- ✅ Rollback posible (backups disponibles)

---

## 🎓 Para Desarrolladores

### Extender con nuevo modelo

1. Crear nuevo script `train_model_xgboost.py`
2. Mantener interfaz compatible (load, predict_proba)
3. Agregar validaciones similares
4. Usar `deploy_model.py` para desplegar

### Agregar más features

1. Editar `prepare_features()` en `train_model_final.py`
2. Actualizar lista de features en `config.py`
3. Reentrenar con `python scripts/train_model_final.py`
4. Desplegar con `python scripts/deploy_model.py`

---

**Última actualización:** 27 Dic 2025  
**Versión:** 1.0  
**Status:** ✅ Production Ready
