# Data Science - ChurnInsight

Esta carpeta contiene todo el trabajo de ciencia de datos: exploración, entrenamiento y artefactos del modelo de predicción de churn.

## 🚀 Inicio Rápido

### 1. Configurar el entorno

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate

# Activar entorno (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Explorar los datos

```bash
jupyter notebook notebooks/01_exploracion_datos.ipynb
```

### 3. Entrenar el modelo

```bash
# Desde notebooks
jupyter notebook notebooks/02_entrenamiento_modelo.ipynb

# O desde scripts
python scripts/train.py --data data/dataset.csv --output model/modelo_churn.joblib
```

## 📁 Estructura del Proyecto

```
data-science/
├── README.md                          # Este archivo
├── requirements.txt                   # Dependencias de Python
├── data/                              # Datasets (no subir a git si son grandes)
│   └── .gitkeep
├── notebooks/                         # Notebooks de Jupyter
│   ├── 01_exploracion_datos.ipynb    # Análisis exploratorio
│   └── 02_entrenamiento_modelo.ipynb # Entrenamiento del modelo
├── scripts/                           # Scripts de Python reutilizables
│   ├── train.py                       # Script de entrenamiento
│   └── predict.py                     # Script de predicción
└── model/                             # Modelos entrenados (.joblib, .pkl, .h5, etc.)
    ├── .gitkeep
    └── MODEL_INFO.md                  # Documentación del modelo
```

## 📊 Flujo de Trabajo

1. **Exploración de Datos**: Usar `01_exploracion_datos.ipynb` para entender el dataset
2. **Feature Engineering**: Diseñar y crear features relevantes
3. **Entrenamiento**: Entrenar modelos usando `02_entrenamiento_modelo.ipynb` o `scripts/train.py`
4. **Evaluación**: Comparar métricas (accuracy, precision, recall, ROC-AUC)
5. **Exportación**: Guardar el mejor modelo en formato `.joblib` (o `.pkl`) en la carpeta `model/`
6. **Integración**: El backend Java cargará el modelo para hacer predicciones

## 🔧 Scripts Disponibles

### train.py

Entrena el modelo de predicción de churn.

```bash
python scripts/train.py --data data/dataset.csv --output model/churn_model.pkl --test-size 0.2
```

### predict.py

Realiza predicciones usando un modelo entrenado.

```bash
python scripts/predict.py --model model/churn_model.pkl --input data/nuevos_clientes.csv --output predictions.csv
```

## 📈 Métricas Objetivo

- **Métrica principal**: ROC-AUC Score
- **Métricas secundarias**: Precision, Recall, F1-Score
- **Umbral de producción**: ROC-AUC > 0.75

## 📝 Documentación de Modelos

Cuando entrenes un modelo, documenta:

- **Features utilizadas**: Lista completa de variables
- **Versión de datos**: Fecha y fuente del dataset
- **Hiperparámetros**: Configuración del modelo
- **Métricas obtenidas**: Resultados de evaluación
- **Fecha de entrenamiento**: Cuándo se entrenó

Ejemplo: Crear un archivo `model/modelo_v1_info.txt` con esta información.

## ⚠️ Buenas Prácticas

- ✅ **Versionar código**, no datos grandes ni modelos pesados
- ✅ Usar `.gitignore` para excluir datasets crudos y modelos grandes
- ✅ Documentar cada experimento en los notebooks
- ✅ Mantener scripts actualizados y funcionales
- ✅ Usar semillas aleatorias (`random_state`) para reproducibilidad
- ❌ No subir archivos `.csv` o `.pkl` > 10 MB sin acordarlo con el equipo

## 🔗 Integración con Backend

El modelo entrenado se exporta en formato `.pkl` (pickle) y el backend Java lo consumirá a través de:

- API REST para predicciones en tiempo real
- Carga del modelo usando Jython o servicios externos (Python microservice)
