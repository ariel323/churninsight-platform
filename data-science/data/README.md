# 📊 Directorio `data/` - Datasets

## Descripción

Este directorio contiene los **datasets** utilizados para entrenamiento, validación y prueba del modelo de predicción de churn.

## Estructura

```
data/
├── README.md                    # Este archivo
├── dataset.csv                  # Dataset principal de entrenamiento
├── dataset_train.csv           # Datos de entrenamiento (70%)
├── dataset_test.csv            # Datos de prueba (30%)
└── dataset_synthetic.csv       # Datos sintéticos generados
```

## Datasets Disponibles

### `dataset.csv` (Principal)

- **Propósito:** Dataset completo para entrenamiento
- **Filas:** 7000+ registros
- **Columnas:** 20+ características
- **Generación:** Script `train_model.py` genera automáticamente si no existe
- **Formato:** CSV con headers

### `dataset_train.csv`

- **Propósito:** Subconjunto para entrenamiento del modelo
- **Proporción:** 70% del dataset principal
- **Filas:** ~4900 registros
- **Uso:** Entrenar RandomForestClassifier

### `dataset_test.csv`

- **Propósito:** Subconjunto para validación
- **Proporción:** 30% del dataset principal
- **Filas:** ~2100 registros
- **Uso:** Evaluar rendimiento del modelo

### `dataset_synthetic.csv`

- **Propósito:** Datos sintéticos generados para testing
- **Filas:** 500+ registros
- **Generación:** Script `scripts/generate_synthetic_data.py`
- **Uso:** Pruebas sin datos reales

## Características del Dataset

```json
{
  "Customer_ID": "Identificador único",
  "Age": "Edad del cliente (18-70 años)",
  "Location": "Ubicación (Urban, Suburban, Rural)",
  "Income_Level": "Nivel de ingresos (Low, Medium, High)",
  "Total_Transactions": "Número total de transacciones (1-1000)",
  "Avg_Transaction_Value": "Valor promedio de transacciones ($10-$1000)",
  "Total_Spent": "Total gastado (suma de transacciones)",
  "Active_Days": "Días activos en plataforma (1-365)",
  "Last_Transaction_Days_Ago": "Días desde última transacción (1-365)",
  "App_Usage_Frequency": "Frecuencia de uso (Daily, Weekly, Monthly)",
  "Customer_Satisfaction_Score": "Satisfacción del cliente (1-10)",
  "Churn": "Variable target - Abandono (0=No, 1=Sí)"
}
```

## Cómo Usar los Datos

### 1. Generar Dataset Automáticamente

```bash
cd data-science
python scripts/train_model.py
# Genera dataset.csv automáticamente si no existe
```

### 2. Dividir en Train/Test

```python
from sklearn.model_selection import train_test_split
import pandas as pd

df = pd.read_csv('data/dataset.csv')
train, test = train_test_split(df, test_size=0.3, random_state=42)
train.to_csv('data/dataset_train.csv', index=False)
test.to_csv('data/dataset_test.csv', index=False)
```

### 3. Cargar en Scripts

```python
import pandas as pd
df = pd.read_csv('data/dataset.csv')
print(f"Loaded {len(df)} records")
```

## Estadísticas del Dataset

- **Total de registros:** ~7000
- **Características numéricas:** 13
- **Características categóricas:** 7
- **Variable target (Churn):** Binaria (0/1)
- **Desbalance de clases:** ~30% Churn, ~70% No Churn
- **Sin datos faltantes:** ✅

## 🔐 Privacidad

⚠️ **Para Producción:**

- Usar datos reales SOLO con consentimiento
- Anonimizar IDs de clientes
- Cumplir con GDPR/CCPA
- Datos sintéticos para desarrollo/testing

## 📝 Notas

- Los datos se generan sintéticamente con `np.random.seed(42)` para reproducibilidad
- Para datos reales, reemplazar `dataset.csv` manteniendo estructura
- Validar que features coincidan con `config.py`

---

**Última actualización:** Diciembre 2025
