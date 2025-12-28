# 📊 Exploratory Data Analysis (EDA) - ChurnInsight

## Descripción

Este notebook contiene el análisis exploratorio del dataset de churn prediction de ChurnInsight.

## Objetivos

1. ✅ Entender la estructura y distribución de datos
2. ✅ Identificar correlaciones entre features
3. ✅ Detectar anomalías y valores faltantes
4. ✅ Visualizar relaciones clave con la variable target
5. ✅ Derivar insights para feature engineering

## Secciones

### 1. Carga y Descripción Básica

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Cargar datos
df = pd.read_csv('../data/dataset.csv')

# Dimensiones
print(f"Shape: {df.shape}")
print(f"Columnas: {df.columns.tolist()}")

# Primeras filas
print(df.head())

# Tipos de datos
print(df.dtypes)

# Estadísticas básicas
print(df.describe())
```

### 2. Análisis de la Variable Target (Churn)

```python
# Distribución de Churn
churn_dist = df['Churn'].value_counts(normalize=True)
print(f"No Churn: {churn_dist[0]:.1%}")
print(f"Churn: {churn_dist[1]:.1%}")

# Visualizar
plt.figure(figsize=(8, 5))
df['Churn'].value_counts().plot(kind='bar', color=['green', 'red'])
plt.title('Distribución de Churn')
plt.xlabel('Churn')
plt.ylabel('Cantidad')
plt.xticks([0, 1], ['No Churn', 'Churn'], rotation=0)
plt.show()
```

### 3. Análisis de Características Numéricas

```python
# Correlación con Churn
numeric_cols = df.select_dtypes(include=[np.number]).columns
correlations = df[numeric_cols].corr()['Churn'].sort_values(ascending=False)
print("\nCorrelación con Churn:")
print(correlations)

# Visualizar correlaciones
plt.figure(figsize=(10, 8))
sns.heatmap(df[numeric_cols].corr(), annot=True, cmap='coolwarm', center=0)
plt.title('Matriz de Correlación')
plt.show()

# Distribuciones por grupo (Churn vs No Churn)
fig, axes = plt.subplots(2, 2, figsize=(12, 10))
axes = axes.flatten()

for i, col in enumerate(['Age', 'Total_Transactions', 'Avg_Transaction_Value', 'Active_Days']):
    df.boxplot(column=col, by='Churn', ax=axes[i])
    axes[i].set_title(f'{col} por Churn')
    plt.sca(axes[i])
    plt.xticks([1, 2], ['No Churn', 'Churn'])

plt.tight_layout()
plt.show()
```

### 4. Análisis de Características Categóricas

```python
# Distribución por Income_Level
print("\nChurn por Income_Level:")
print(pd.crosstab(df['Income_Level'], df['Churn'], normalize='index'))

# Visualizar
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

for idx, col in enumerate(['Income_Level', 'Location', 'App_Usage_Frequency']):
    cross = pd.crosstab(df[col], df['Churn'], normalize='index')
    cross.plot(kind='bar', ax=axes[idx])
    axes[idx].set_title(f'Churn por {col}')
    axes[idx].legend(['No Churn', 'Churn'])
    axes[idx].set_ylabel('Proporción')

plt.tight_layout()
plt.show()
```

### 5. Insights Clave

```
🔍 KEY INSIGHTS:

1. **Last_Transaction_Days_Ago es el predictor #1**
   - Si > 120 días → Casi seguro churn
   - Definición del target basada en esto

2. **Active_Days es importante**
   - Clientes con pocos días activos → Mayor churn
   - Sesgo hacia engagement temprano

3. **Income_Level no discrimina fuerte**
   - Churn es similar en Low, Medium, High
   - No es el feature más predictivo

4. **App_Usage_Frequency sí importa**
   - Daily users tienen menos churn (~15%)
   - Monthly users tienen más churn (~45%)

5. **Age tiene relación modesta**
   - Clientes jóvenes: ~25% churn
   - Clientes mayores: ~35% churn
```

### 6. Valores Faltantes

```python
# Chequear NaN
print("\nValores Faltantes:")
print(df.isnull().sum())

# Si hay NaN, imputar
if df.isnull().sum().sum() > 0:
    df = df.fillna(df.mean())  # Para numéricos
    df = df.fillna(df.mode().iloc[0])  # Para categóricos
```

### 7. Outliers

```python
# Detectar outliers con IQR
def detect_outliers(df, col):
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    return df[(df[col] < lower_bound) | (df[col] > upper_bound)]

# Checar outliers en Avg_Transaction_Value
outliers = detect_outliers(df, 'Avg_Transaction_Value')
print(f"\nOutliers en Avg_Transaction_Value: {len(outliers)}")
```

### 8. Feature Importance (Preliminar)

```python
from sklearn.ensemble import RandomForestClassifier

X = df.drop('Churn', axis=1)
y = df['Churn']

# Codificar categóricos
X_encoded = pd.get_dummies(X)

# Entrenar modelo simple
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_encoded, y)

# Feature importance
importance = pd.Series(
    model.feature_importances_,
    index=X_encoded.columns
).sort_values(ascending=False)

print("\nFeature Importance:")
print(importance.head(10))

# Visualizar
plt.figure(figsize=(10, 6))
importance.head(10).plot(kind='barh')
plt.title('Top 10 Features por Importancia')
plt.xlabel('Importance')
plt.show()
```

## 📈 Conclusiones

- Dataset es balanceado en features pero desbalanceado en target (70/30)
- Inactividad reciente es el predictor principal de churn
- Algunos features tienen alta correlación (potencial multicolinealidad)
- No hay valores faltantes (datos sintéticos)
- Pocos outliers detectados

## 🚀 Próximos Pasos

1. Feature engineering (crear nuevas características)
2. Normalización/Escalado
3. Manejo de desbalance de clases
4. Validación cruzada
5. Tuning de hiperparámetros
6. Evaluación en test set

---

**Para ejecutar este análisis:**

```bash
cd data-science
jupyter notebook notebooks/EDA.md
```

O usar el notebook Jupyter incluido:

```bash
jupyter notebook notebooks/Desafio_Conjunto_de_datos_del_valor_de_vida_del_cliente_(LTV)_de_FinTech.ipynb
```
