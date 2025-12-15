"""
Script de predicción usando el modelo entrenado.

Uso:
    python predict.py --model ../model/churn_model.pkl --input data.csv
"""

import argparse
import joblib
import pandas as pd
import json


def load_model(model_path):
    """Carga el modelo entrenado."""
    return joblib.load(model_path)


def load_input_data(filepath):
    """Carga los datos de entrada para predicción."""
    if filepath.endswith('.csv'):
        return pd.read_csv(filepath)
    elif filepath.endswith('.json'):
        return pd.read_json(filepath)
    else:
        raise ValueError("Formato de archivo no soportado. Usa .csv o .json")


def make_predictions(model, data):
    """Realiza predicciones con el modelo."""
    predictions = model.predict(data)
    probabilities = model.predict_proba(data)
    return predictions, probabilities


def save_predictions(predictions, probabilities, output_path):
    """Guarda las predicciones en un archivo."""
    results = pd.DataFrame({
        'prediction': predictions,
        'probability_no_churn': probabilities[:, 0],
        'probability_churn': probabilities[:, 1]
    })
    results.to_csv(output_path, index=False)
    print(f"\nPredicciones guardadas en: {output_path}")


def main():
    parser = argparse.ArgumentParser(description='Realiza predicciones de churn')
    parser.add_argument('--model', type=str, required=True,
                        help='Ruta al modelo entrenado (.joblib o .pkl)')
    parser.add_argument('--input', type=str, required=True,
                        help='Ruta a los datos de entrada (.csv o .json)')
    parser.add_argument('--output', type=str, default='predictions.csv',
                        help='Ruta donde guardar las predicciones')
    
    args = parser.parse_args()
    
    print("=== Cargando modelo y datos ===")
    model = load_model(args.model)
    data = load_input_data(args.input)
    
    print(f"Datos cargados: {len(data)} registros")
    
    print("\n=== Realizando predicciones ===")
    predictions, probabilities = make_predictions(model, data)
    
    print(f"Predicciones completadas: {len(predictions)} registros")
    
    save_predictions(predictions, probabilities, args.output)


if __name__ == '__main__':
    main()
