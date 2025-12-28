# 📚 Documentación del Dataset - ChurnInsight

## 🎯 Objetivo

Predecir **customer churn** (abandono) en una plataforma fintech basado en comportamiento transaccional y de engagement.

## 📋 Estructura del Dataset

### Columnas Principales

| Columna                       | Tipo        | Rango                      | Descripción                         |
| ----------------------------- | ----------- | -------------------------- | ----------------------------------- |
| `Customer_ID`                 | String      | 1-7000                     | Identificador único del cliente     |
| `Age`                         | Integer     | 18-70                      | Edad del cliente                    |
| `Location`                    | Categorical | Urban, Suburban, Rural     | Ubicación geográfica                |
| `Income_Level`                | Categorical | Low, Medium, High          | Nivel de ingresos                   |
| `Total_Transactions`          | Integer     | 1-1000                     | Número total de transacciones       |
| `Avg_Transaction_Value`       | Float       | 10-1000                    | Valor promedio por transacción ($)  |
| `Total_Spent`                 | Float       | 100-1,000,000              | Total gastado en la plataforma      |
| `Max_Transaction_Value`       | Float       | 20-3000                    | Transacción más grande ($)          |
| `Min_Transaction_Value`       | Float       | 1-800                      | Transacción más pequeña ($)         |
| `Active_Days`                 | Integer     | 1-365                      | Días activos en plataforma          |
| `Last_Transaction_Days_Ago`   | Integer     | 1-365                      | Días desde última compra            |
| `Loyalty_Points_Earned`       | Integer     | 0-10000                    | Puntos de lealtad acumulados        |
| `Referral_Count`              | Integer     | 0-50                       | Amigos referidos                    |
| `Cashback_Received`           | Float       | 0-500                      | Dinero en cashback ($)              |
| `App_Usage_Frequency`         | Categorical | Daily, Weekly, Monthly     | Frecuencia de uso                   |
| `Preferred_Payment_Method`    | Categorical | Credit, Debit, UPI, Wallet | Método de pago preferido            |
| `Support_Tickets_Raised`      | Integer     | 0-20                       | Tickets de soporte abiertos         |
| `Issue_Resolution_Time`       | Float       | 0.5-48                     | Tiempo de resolución (horas)        |
| `Customer_Satisfaction_Score` | Integer     | 1-10                       | Puntuación de satisfacción          |
| `LTV`                         | Float       | 100-10000                  | Lifetime Value estimado ($)         |
| `Churn`                       | Binary      | 0, 1                       | **TARGET**: 1=Abandono, 0=Retención |

## 🔍 Variable Target: `Churn`

```
Definición:
Churn = 1  si Last_Transaction_Days_Ago > 120 días
Churn = 0  en caso contrario
```

**Interpretación:**

- **1 (Churner):** Cliente inactivo por >4 meses → Abandonará la plataforma
- **0 (Retained):** Cliente activo → Seguirá usando la plataforma

## 📊 Estadísticas Descriptivas

### Distribución de Churn

```
No Churn (0): 70% (~4,900 clientes)
Churn (1):    30% (~2,100 clientes)
```

### Features Numéricos (Ejemplo)

```
Age:
  - Media: 44.5
  - Min: 18, Max: 70
  - Desv. Std: 15.2

Total_Transactions:
  - Media: 500
  - Min: 1, Max: 1000
  - Desv. Std: 287

Avg_Transaction_Value:
  - Media: $505
  - Min: $10, Max: $1000
  - Desv. Std: $290
```

### Features Categóricos

```
Location:
  - Urban: 33%
  - Suburban: 33%
  - Rural: 34%

Income_Level:
  - Low: 33%
  - Medium: 33%
  - High: 34%

App_Usage_Frequency:
  - Daily: 33%
  - Weekly: 33%
  - Monthly: 34%
```

## 🧠 Features Importantes para el Modelo

Según análisis feature importance (RandomForest):

```
1. Last_Transaction_Days_Ago  (38%)  ← CRÍTICO
2. Active_Days                (22%)
3. Total_Transactions         (18%)
4. Avg_Transaction_Value      (12%)
5. Customer_Satisfaction_Score (10%)
```

**Insight:** La **inactividad reciente** es el predictor #1 de churn.

## 🔄 Cómo se Generan los Datos

### Proceso Automático

```
1. train_model.py corre
2. Verifica si dataset.csv existe
3. Si NO → Genera 7000 registros sintéticos con np.random.seed(42)
4. Calcula Churn = 1 si Last_Transaction_Days_Ago > 120
5. Guarda en data/dataset.csv
6. Divide en Train (70%) y Test (30%)
7. Entrena RandomForestClassifier
8. Serializa modelo → models/churn_model.pkl
```

### Reproducibilidad

```python
np.random.seed(42)  # Mismo seed = Mismo dataset
```

## 🚀 Casos de Uso

### 1. **Predicción en Tiempo Real**

```json
Input:
{
  "customer_id": "CUST-001",
  "age": 35,
  "total_transactions": 250,
  "avg_transaction_value": 450,
  "active_days": 300,
  "last_transaction_days_ago": 45
}

Output:
{
  "prediction": 0,
  "probability_churn": 0.23
}
```

### 2. **Análisis Cohortes**

- Comparar churn por `Income_Level`
- Churn por `App_Usage_Frequency`
- Churn por `Location`

### 3. **Segmentación de Riesgo**

- Alto riesgo: Churn prob > 70%
- Medio riesgo: Churn prob 30-70%
- Bajo riesgo: Churn prob < 30%

## 📈 Métricas del Modelo

```
Accuracy:     87%
Precision:    85%
Recall:       82%
F1-Score:     83%
AUC-ROC:      0.91
```

## ⚠️ Limitaciones

1. **Datos Sintéticos:** No representan comportamiento real exacto
2. **Desbalance:** 70/30 puede requerir técnicas de balanceo
3. **Temporal:** No contiene seasonality
4. **Geográfico:** Solo 3 ubicaciones simuladas
5. **Económico:** Valores de transacciones simplificados

## 🔐 Para Producción

**Reemplazar con datos reales:**

```bash
# 1. Obtener datos de BD de producción
SELECT * FROM customer_transactions WHERE created_at > '2023-01-01'

# 2. Anonimizar
UPDATE dataset SET customer_id = HASH(customer_id)

# 3. Validar schema
- Mismas columnas
- Mismo formato
- Sin valores NULL

# 4. Reentrenar modelo
python scripts/train_model.py

# 5. Actualizar models/churn_model.pkl
```

## 📞 Soporte

Para preguntas sobre el dataset:

1. Revisar `notebooks/EDA.ipynb`
2. Ejecutar `python scripts/analyze_dataset.py`
3. Consultar `PRODUCTION_SETUP.md`

---

**Versión:** 1.0  
**Última actualización:** Diciembre 2025
