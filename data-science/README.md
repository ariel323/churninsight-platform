🏦 Sistema de Predicción de Churn para un Banco

Este proyecto implementa una solución de **inteligencia artificial** de extremo a extremo orientada a la detección temprana de clientes con alta probabilidad de abandono (**Churn**) en un Banco.

---

## 📁 Información General

- **Versión:** 1.0.0
- **Estado:** 🟢 Completado
- **Dominio:** Analítica Predictiva / Machine Learning

### 🛠️ Tecnologías

- **Modelado:** Python (XGBoost)
- **Interoperabilidad:** PKL (Pickle) con integración Java vía Py4J
- **Comunicación:** Py4J Gateway para predicciones en tiempo real

---

## 🚀 Descripción del Proyecto

El Banco Alura enfrenta el desafío de retener clientes en un entorno financiero competitivo. Esta solución transforma el dataset histórico `Banco_Churn.csv` en un modelo predictivo robusto, capaz de estimar el riesgo de abandono de cada cliente en tiempo real.

### ⭐ Características Principales

1. **Dataset Utilizado**: Banco_Churn.csv
2. **Modelo XGBoost:** Implementación de alto rendimiento para clasificación.
3. **Integración Java-Python:** Uso de Py4J para ejecutar predicciones desde el backend Java.

---

## 📁 Estructura de Archivos

```
data-science/
├── Banco_Churn.csv              # Dataset de entrenamiento
├── Banco_Churn_ML.ipynb         # Notebook con análisis y entrenamiento
├── modelo_Banco_churn.pkl       # Modelo XGBoost entrenado (formato Pickle)
├── modelo_churn_banco.pmml      # Modelo en formato PMML (alternativo)
├── predictor.py                 # Script Python para predicciones con Py4J
└── README.md                    # Este archivo
```

---

## ⚙️ Configuración del Entorno

### Requisitos Previos

- **Python 3.10+** instalado en el servidor
- **Java 17+** (para el backend)
- Conexión entre Java y Python vía Py4J

### Instalación de Dependencias Python

```bash
pip install scikit-learn==1.6.1 py4j==0.10.9.9 xgboost==3.1.2 joblib
```

---

## 🔧 Integración con Backend Java

### Archivo: `predictor.py`

Este script inicia un servidor Py4J que carga el modelo PKL y expone una función `predict()` para que el backend Java pueda consumirla.

**Características:**

- Carga automática del modelo `modelo_Banco_churn.pkl`
- Servidor Py4J en el puerto por defecto (25333)
- Retorna la probabilidad de churn (0.0 - 1.0)

**Uso desde Java:**
El backend Java inicia automáticamente el script Python al arrancar (`@PostConstruct`) y se conecta vía Py4J Gateway.

---

## 📊 Contrato de Predicción

### Entrada (Features)

El modelo requiere un array de 5 valores numéricos en el siguiente orden:

```json
[
    Age_Risk,          // 0 o 1: Si el cliente está en rango de edad de riesgo (40-70 años)
    NumOfProducts,     // Número de productos contratados (1-4)
    Inactivo_40_70,    // 0 o 1: Si está inactivo y en rango 40-70 años
    Products_Risk_Flag, // 0 o 1: Si tiene 3+ productos (riesgo)
    Country_Risk_Flag  // 0 o 1: Si es de Alemania (país de mayor riesgo)
]
```

### Salida (Response)

```json
{
  "churn_probability": 0.75, // Probabilidad de abandono (0.0 - 1.0)
  "customer_id": "cliente_123" // ID único del cliente
}
```

---

## 🧪 Pruebas Locales

### 1. Probar el predictor Python directamente:

```bash
python predictor.py
```

El servidor Py4J debería iniciarse y esperar conexiones.

### 2. Probar desde el backend Java:

```bash
cd ../backend-java
mvn spring-boot:run
```

### 3. Probar el endpoint REST:

```bash
curl -X POST http://localhost:8080/api/churn/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "ageRisk": 1,
    "numOfProducts": 3,
    "inactivo4070": 1,
    "productsRiskFlag": 1,
    "countryRiskFlag": 1
  }'
```

---

## 📝 Ejemplo de Entrada para Predicción

| Campo               | Descripción                  | Valores Posibles |
| ------------------- | ---------------------------- | ---------------- |
| Edad del cliente    | Edad en años                 | 18-100           |
| Número de productos | Productos contratados        | 1-4              |
| ¿Cuenta activa?     | 1=Sí, 0=No                   | 0, 1             |
| País                | 0=France, 1=Germany, 2=Spain | 0, 1, 2          |

**Cálculo automático de features:**

- `Age_Risk`: Se calcula si edad está entre 40-70
- `Inactivo_40_70`: Se calcula si edad 40-70 Y cuenta inactiva
- `Products_Risk_Flag`: Se calcula si productos >= 3
- `Country_Risk_Flag`: Se calcula si país = Germany (1)

---

## 🛠️ Solución de Problemas

### Error: "STACK_GLOBAL requires str"

**Causa:** Incompatibilidad de versiones de Python entre entrenamiento y ejecución.

**Solución:**

1. Asegúrate de usar Python 3.13.1 (la misma versión usada para entrenar)
2. O regenera el modelo PKL con la versión actual:
   ```python
   import joblib
   joblib.dump(pipe_xgb, 'modelo_Banco_churn.pkl')
   ```

### Error: "Cannot connect to Python Gateway"

**Causa:** El proceso Python no se inició correctamente.

**Solución:**

1. Verifica que Python esté en el PATH
2. Ejecuta manualmente: `python data-science/predictor.py`
3. Revisa los logs del backend Java

### Error: "Module 'xgboost' not found"

**Causa:** Falta instalar dependencias Python.

**Solución:**

```bash
pip install xgboost scikit-learn py4j
```

---

## 👥 Equipo de Trabajo

- **Gabriel Mendez Oteiza:** Equipo Data Science
- **Martin Abreu:** Equipo Data Science
- **Ariel:** Backend Java & Integración
