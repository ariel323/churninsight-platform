from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import pickle
import pandas as pd  # <-- AÑADIR IMPORT

# Rutas y modelo
MODEL_PATH = os.path.join(os.path.dirname(__file__), "modelo_Banco_churn.pkl")

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
    features: list[float]

class PredictResponse(BaseModel):
    prediction: int
    probability: float

# Cargar modelo (intenta joblib.load -> pickle.load)
model = None
try:
    import joblib
    model = joblib.load(MODEL_PATH)
    print(f"Modelo cargado correctamente (joblib) desde: {MODEL_PATH}")
except Exception as e1:
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
            print(f"Modelo cargado correctamente (pickle) desde: {MODEL_PATH}")
    except Exception as e2:
        print(f"ERROR: no se pudo cargar el modelo. joblib error: {e1}; pickle error: {e2}")

@app.get("/health")
def health():
    return {"status": "ok" if model is not None else "model_not_loaded"}

@app.get("/favicon.ico")
def favicon():
    # Responder 204 para evitar 404 en logs del navegador
    from fastapi.responses import Response
    return Response(status_code=204)

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Modelo no cargado. Revisa logs del servidor Python.")
    
    # Validar que se reciban exactamente 5 features
    if len(req.features) != 5:
        raise HTTPException(status_code=400, detail=f"Se esperan 5 features, se recibieron {len(req.features)}")
    
    try:
        # Convertir la lista a DataFrame con los nombres de columna correctos
        columnas = ["Age_Risk", "NumOfProducts", "Inactivo_40_70", "Products_Risk_Flag", "Country_Risk_Flag"]
        df = pd.DataFrame([req.features], columns=columnas)
        
        # Realizar la predicción
        if hasattr(model, "predict_proba"):
            prob = float(model.predict_proba(df)[0][1])
        else:
            prob = float(model.predict(df)[0])
        pred = int(model.predict(df)[0])
        
        return PredictResponse(prediction=pred, probability=prob)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))