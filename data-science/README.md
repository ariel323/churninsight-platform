# ChurnInsight - Data Science Module

Este módulo contiene el código para análisis, entrenamiento y servicio de predicción de churn en la plataforma ChurnInsight.

## Estructura del Proyecto

```
data-science/
├── data/                    # Datasets y archivos de datos
├── models/                  # Modelos entrenados serializados
├── notebooks/              # Notebooks de Jupyter para análisis exploratorio
├── src/                    # Código fuente Python
│   ├── __init__.py
│   ├── config.py           # Configuración y constantes
│   ├── data_utils.py       # Utilidades de procesamiento de datos
│   ├── model_trainer.py    # Clase para entrenamiento de modelos
│   └── model_service.py    # Servicio FastAPI para predicciones
├── scripts/                # Scripts ejecutables
│   ├── train_model.py      # Script para entrenar el modelo
│   └── start_service.py    # Script para iniciar el servicio
├── tests/                  # Tests unitarios
│   └── test_data_utils.py
├── requirements.txt        # Dependencias Python
└── README.md              # Esta documentación
```

## Instalación y Configuración

### Prerrequisitos

- Python 3.9+
- pip

### Instalación

1. Instalar dependencias:

```bash
pip install -r requirements.txt
```

## Uso

### Entrenamiento del Modelo

Para entrenar el modelo con los datos actuales:

```bash
python scripts/train_model.py
```

### Iniciar Servicio de Predicción

Para iniciar el servicio FastAPI:

```bash
python scripts/start_service.py
```

El servicio estará disponible en `http://localhost:8000`

### API Endpoints

- `GET /` - Información del servicio
- `GET /health` - Health check
- `POST /predict` - Predicción de churn

#### Ejemplo de Request

```json
{
  "customer_id": "12345",
  "monthly_charges": 65.5,
  "tenure_months": 24,
  "contract_type": "month-to-month",
  "internet_service": "fiber_optic",
  "total_charges": 1572.0
}
```

#### Ejemplo de Response

```json
{
  "customer_id": "12345",
  "prevision": "alto_riesgo",
  "probabilidad": 0.87
}
```

## Desarrollo

### Estructura del Código

- **`config.py`**: Configuración centralizada del proyecto
- **`data_utils.py`**: Funciones para carga y procesamiento de datos
- **`model_trainer.py`**: Clase para entrenamiento y gestión de modelos
- **`model_service.py`**: Servicio FastAPI para predicciones en producción

### Tests

Ejecutar tests:

```bash
python -m pytest tests/
```

## Arquitectura

El módulo sigue una arquitectura modular:

1. **Carga de Datos**: Utilidades para cargar y preprocesar datos
2. **Entrenamiento**: Pipeline de ML para entrenar modelos
3. **Servicio**: API REST para servir predicciones
4. **Configuración**: Configuración centralizada

## Métricas del Modelo

El modelo actual (Random Forest) alcanza las siguientes métricas:

- **Accuracy**: ~95%
- **Precision**: Alto para ambas clases
- **Recall**: Bueno para detección de churn

## Próximos Pasos

- [ ] Implementar validación cruzada
- [ ] Añadir más algoritmos de ML
- [ ] Implementar monitoring del modelo
- [ ] Añadir tests de integración
- [ ] Documentar API con OpenAPI
