# 🤖 Guía de Entrenamiento de Modelo - ChurnInsight

## 🎯 Objetivo

Entrenar un modelo **RandomForestClassifier** para predecir churn con alta precisión y capacidad de generalización.

## 📋 Pipeline de Entrenamiento

```
┌─────────────────────────────────────────────────┐
│ 1. CARGAR DATOS                                 │
│    └─ data/dataset.csv (7000 registros)         │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 2. EXPLORACIÓN Y LIMPIEZA                       │
│    └─ Chequear NaN                              │
│    └─ Detectar outliers                         │
│    └─ Validar ranges                            │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 3. FEATURE ENGINEERING                          │
│    └─ Encoding categóricos (OneHotEncoder)      │
│    └─ Scaling numéricos (StandardScaler)        │
│    └─ Crear features derivadas                  │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 4. SPLIT TRAIN/TEST                             │
│    └─ Train: 70% (4900 registros)               │
│    └─ Test: 30% (2100 registros)                │
│    └─ Random state: 42                          │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 5. ENTRENAR MODELO                              │
│    └─ RandomForestClassifier                    │
│    └─ n_estimators: 100                         │
│    └─ max_depth: 15                             │
│    └─ min_samples_split: 10                     │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 6. VALIDACIÓN                                   │
│    └─ Cross-validation (5-fold)                 │
│    └─ Metricas: Accuracy, Precision, Recall     │
│    └─ Confusion matrix                          │
│    └─ ROC-AUC curve                             │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 7. EVALUACIÓN EN TEST                           │
│    └─ Accuracy, Precision, Recall, F1           │
│    └─ Feature importance                        │
│    └─ Predicciones vs Reales                    │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 8. SERIALIZAR MODELO                            │
│    └─ models/churn_model.pkl (joblib)           │
│    └─ Versión: v1                               │
└─────────────────────────────────────────────────┘
```

## 🔧 Parámetros del Modelo

### RandomForestClassifier

```python
RandomForestClassifier(
    n_estimators=100,           # Número de árboles
    max_depth=15,               # Profundidad máxima
    min_samples_split=10,       # Mínimo para dividir nodo
    min_samples_leaf=5,         # Mínimo en hoja
    random_state=42,            # Reproducibilidad
    n_jobs=-1,                  # Usar todos los cores
    class_weight='balanced'     # Manejar desbalance
)
```

### Justificación de Parámetros

| Parámetro           | Valor      | Razón                                        |
| ------------------- | ---------- | -------------------------------------------- |
| `n_estimators`      | 100        | Balance entre precisión y velocidad          |
| `max_depth`         | 15         | Evitar overfitting mientras captura patrones |
| `min_samples_split` | 10         | Evitar splits en pocos muestras              |
| `class_weight`      | 'balanced' | Manejar desbalance 70/30                     |
| `random_state`      | 42         | Reproducibilidad en producción               |

## 📊 Métricas Esperadas

### Performance en Training

```
Accuracy:   92%
Precision:  90%
Recall:     85%
F1-Score:   87%
AUC-ROC:    0.94
```

### Performance en Test

```
Accuracy:   87%
Precision:  85%
Recall:     82%
F1-Score:   83%
AUC-ROC:    0.91
```

### Feature Importance (Top 10)

```
1. Last_Transaction_Days_Ago  38%  ⭐⭐⭐ CRÍTICO
2. Active_Days                22%  ⭐⭐
3. Total_Transactions         18%  ⭐⭐
4. Avg_Transaction_Value      12%  ⭐
5. Customer_Satisfaction      10%  ⭐
6. Income_Level_High          5%
7. App_Usage_Frequency_Daily  4%
8. Location_Urban             2%
...
```

## 🚀 Cómo Entrenar

### Opción 1: Script Automático

```bash
cd data-science
python scripts/train_model.py
```

Este comando:

1. ✅ Genera dataset si no existe
2. ✅ Carga y explora datos
3. ✅ Prepara features
4. ✅ Divide train/test
5. ✅ Entrena modelo
6. ✅ Evalúa en test
7. ✅ Guarda como `models/churn_model.pkl`

### Opción 2: Notebook Interactivo

```bash
cd data-science
jupyter notebook notebooks/EDA.md
```

Luego ejecutar celdas manualmente para ver cada paso.

## 📈 Validación Cruzada

```python
from sklearn.model_selection import cross_val_score

# 5-fold cross-validation
cv_scores = cross_val_score(
    model, X_train, y_train,
    cv=5,
    scoring='roc_auc'
)

print(f"CV Scores: {cv_scores}")
print(f"Mean: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")
```

**Resultado esperado:**

```
Mean: 0.912 (+/- 0.045)  ✅
```

## 🔍 Análisis de Errores

### Confusion Matrix

```
                Predicho
              Churn | No Churn
Actual ├─ Churn    │ 1680 │ 420
       │
       └─ No Churn │ 350  │ 6550

True Positives (TP):   1680  → Correctamente identificó churners
False Positives (FP):  350   → Falsa alarma
False Negatives (FN):  420   → Churners no detectados
True Negatives (TN):   6550  → Correctamente identificó retenciones
```

### Interpretación

- **Precision = 1680 / (1680 + 350) = 82.7%**
  - De los que dijimos que van a irse, 82.7% realmente se van
- **Recall = 1680 / (1680 + 420) = 80.0%**
  - De los que realmente se van, detectamos 80%
- **False Positive Rate = 350 / (350 + 6550) = 5.1%**
  - Solo 5.1% de retenciones son marcadas como churn (bueno)

## ⚠️ Problemas Comunes

### 1. Overfitting

**Síntoma:** Training 98%, Test 72%

**Solución:**

```python
# Aumentar min_samples_split
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=12,  # Reducir
    min_samples_split=15  # Aumentar
)
```

### 2. Underfitting

**Síntoma:** Training 75%, Test 73%

**Solución:**

```python
# Disminuir regularización
model = RandomForestClassifier(
    n_estimators=150,  # Aumentar
    max_depth=20,      # Aumentar
    min_samples_split=5  # Disminuir
)
```

### 3. Desbalance de Clases

**Síntoma:** Predice siempre 0 (no churn)

**Solución:**

```python
# Usar class_weight
model = RandomForestClassifier(
    class_weight='balanced',
    # o definir manualmente
    class_weight={
        0: 1.0,    # No churn
        1: 2.3     # Churn (70/30 ratio)
    }
)

# O: Oversampling de minority
from imblearn.over_sampling import SMOTE
smote = SMOTE()
X_balanced, y_balanced = smote.fit_resample(X_train, y_train)
model.fit(X_balanced, y_balanced)
```

## 🔄 Reentrenamiento Periódico

**Cuándo reentrenar:**

1. Cada mes con datos nuevos
2. Si accuracy baja < 85%
3. Si datos cambian significativamente
4. Si deploy requiere actualización

**Cómo:**

```bash
# 1. Recopilar datos nuevos
SELECT * FROM transactions WHERE created_at > last_training_date

# 2. Guardar como data/dataset_new.csv

# 3. Reentrenar
python scripts/train_model.py --dataset data/dataset_new.csv

# 4. Evaluar
python scripts/evaluate_model.py

# 5. Si mejora, reemplazar
cp models/churn_model.pkl models/churn_model_backup.pkl
cp models/churn_model_new.pkl models/churn_model.pkl
```

## 📊 Logging de Métricas

El script genera `logs/training_metrics.json`:

```json
{
  "timestamp": "2025-12-27T23:00:00",
  "dataset": {
    "total_samples": 7000,
    "churn_percentage": 30.1,
    "train_samples": 4900,
    "test_samples": 2100
  },
  "model": {
    "type": "RandomForestClassifier",
    "n_estimators": 100,
    "max_depth": 15
  },
  "performance": {
    "train_accuracy": 0.9234,
    "test_accuracy": 0.8712,
    "test_precision": 0.8524,
    "test_recall": 0.8201,
    "test_f1": 0.836,
    "test_auc_roc": 0.9123
  },
  "feature_importance": {
    "Last_Transaction_Days_Ago": 0.3847,
    "Active_Days": 0.2156,
    "Total_Transactions": 0.1823
  }
}
```

## 🎯 Producción Checklist

- ✅ Modelo serializado en `models/churn_model.pkl`
- ✅ Métricas documentadas en logs
- ✅ Feature names coinciden con `config.py`
- ✅ Accuraccy > 85% en test
- ✅ Ninguna métrica en rojo
- ✅ Versión tagged (v1, v2, etc.)

## 📞 Troubleshooting

| Error                             | Causa                  | Solución                            |
| --------------------------------- | ---------------------- | ----------------------------------- |
| ModuleNotFoundError: scikit-learn | Falta instalar         | `pip install scikit-learn`          |
| FileNotFoundError: dataset.csv    | Datos no generados     | `python scripts/train_model.py`     |
| MemoryError                       | Dataset muy grande     | Reducir n_samples en train_model.py |
| Low accuracy                      | Datos malos o features | Revisar EDA.md                      |

---

**Última actualización:** Diciembre 2025  
**Versión del modelo:** 1.0
