import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pypmml import Model
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rutas y modelo
MODEL_PATH = os.path.join(os.path.dirname(__file__), "modelo_churn_banco.pmml")

app = FastAPI(title="Churn Predictor API")

# Orígenes permitidos (ajusta según tu frontend/backend)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    # MODELO SIMPLIFICADO - Solo 6 variables (actualizado 19/01/2026)
    numOfProducts: float
    inactivo4070: float
    productsRiskFlag: float
    countryRiskFlag: float
    deltaNumOfProducts: float = 0.0
    hadComplaint: bool = False

class PredictResponse(BaseModel):
    prediction: int
    probability: float

# Cargar modelo PMML con manejo de errores
model = None
try:
    model = Model.load(MODEL_PATH)
    logger.info(f"Modelo PMML cargado correctamente desde: {MODEL_PATH}")
except Exception as e:
    logger.error(f"ERROR: no se pudo cargar el modelo PMML: {e}")
    model = None

@app.get("/health")
def health():
    if model is None:
        raise HTTPException(status_code=503, detail="Modelo no disponible")
    return {"status": "OK", "model_loaded": True}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    # Logging de entrada para diagnóstico
    logger.info("="*50)
    logger.info("DATOS RECIBIDOS DEL BACKEND JAVA:")
    logger.info(f"  numOfProducts: {req.numOfProducts} (tipo: {type(req.numOfProducts)})")
    logger.info(f"  inactivo4070: {req.inactivo4070} (tipo: {type(req.inactivo4070)})")
    logger.info(f"  productsRiskFlag: {req.productsRiskFlag} (tipo: {type(req.productsRiskFlag)})")
    logger.info(f"  countryRiskFlag: {req.countryRiskFlag} (tipo: {type(req.countryRiskFlag)})")
    logger.info(f"  deltaNumOfProducts: {req.deltaNumOfProducts} (tipo: {type(req.deltaNumOfProducts)})")
    logger.info(f"  hadComplaint: {req.hadComplaint} (tipo: {type(req.hadComplaint)})")
    logger.info("="*50)
    
    if model is None:
        logger.error("Modelo no cargado, devolviendo mock")
        # Fallback mock para testing
        return PredictResponse(prediction=0, probability=0.1)
    
    try:
        # Convertir a dict para PMML (asegurar tipos correctos)
        # MODELO SIMPLIFICADO - 6 variables
        features = {
            'NumOfProducts': float(req.numOfProducts),
            'Inactivo_40_70': float(req.inactivo4070),
            'Products_Risk_Flag': float(req.productsRiskFlag),
            'Country_Risk_Flag': float(req.countryRiskFlag),
            'Delta_NumOfProducts': float(req.deltaNumOfProducts),
            'Had_Complaint': 1.0 if req.hadComplaint else 0.0
        }
        
        logger.info("FEATURES ENVIADOS AL MODELO PMML:")
        for key, value in features.items():
            logger.info(f"  {key}: {value} (tipo: {type(value)})")
        
        # Predicción con PMML
        result = model.predict(features)
        
        logger.info("RESULTADO DEL MODELO PMML:")
        logger.info(f"  result completo: {result}")
        
        probability = float(result['probability(1)'])  # Ajusta según output del PMML
        prediction = 1 if probability >= 0.58 else 0  # Umbral del modelo
        
        logger.info("RESULTADO FINAL:")
        logger.info(f"  Probabilidad: {probability:.4f} ({probability*100:.2f}%)")
        logger.info(f"  Predicción (umbral 0.58): {prediction} ({'CHURN' if prediction == 1 else 'NO CHURN'})")
        logger.info("="*50)
        
        return PredictResponse(prediction=prediction, probability=probability)
    
    except Exception as e:
        logger.error(f"Error en predicción: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
