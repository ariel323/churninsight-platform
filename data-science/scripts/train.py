"""
Script de entrenamiento del modelo de predicción de churn.

Este script automatiza el proceso de entrenamiento y puede ser ejecutado
desde la línea de comandos o como parte de un pipeline CI/CD.

Uso:
    python train.py --data data/dataset.csv --output model/churn_model.pkl
"""

import argparse
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report


def load_data(filepath):
    """Carga el dataset desde un archivo CSV."""
    return pd.read_csv(filepath)


def prepare_features(df):
    """Prepara las features y target del dataset."""
    # TODO: Implementar lógica de preparación de features
    # Por ahora retorna placeholder
    X = df.drop('churn', axis=1) if 'churn' in df.columns else df
    y = df['churn'] if 'churn' in df.columns else None
    return X, y


def train_model(X_train, y_train):
    """Entrena el modelo de clasificación."""
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    model.fit(X_train, y_train)
    return model


def evaluate_model(model, X_test, y_test):
    """Evalúa el rendimiento del modelo."""
    y_pred = model.predict(X_test)
    report = classification_report(y_test, y_pred)
    print("\n=== Reporte de Evaluación ===")
    print(report)
    return report


def save_model(model, filepath):
    """Guarda el modelo entrenado."""
    joblib.dump(model, filepath)
    print(f"\nModelo guardado en: {filepath}")


def main():
    parser = argparse.ArgumentParser(description='Entrena el modelo de predicción de churn')
    parser.add_argument('--data', type=str, help='Ruta al archivo de datos CSV')
    parser.add_argument('--output', type=str, default='../model/modelo_churn.joblib',
                        help='Ruta donde guardar el modelo')
    parser.add_argument('--test-size', type=float, default=0.2,
                        help='Proporción de datos para test')
    
    args = parser.parse_args()
    
    print("=== Iniciando entrenamiento del modelo ===")
    
    # TODO: Implementar flujo completo cuando haya datos
    print("\n[INFO] Este script está listo para usar con datos reales.")
    print("[INFO] Actualiza las funciones prepare_features() con tu lógica específica.")
    
    # Ejemplo de flujo (descomentar cuando tengas datos):
    # df = load_data(args.data)
    # X, y = prepare_features(df)
    # X_train, X_test, y_train, y_test = train_test_split(
    #     X, y, test_size=args.test_size, random_state=42
    # )
    # model = train_model(X_train, y_train)
    # evaluate_model(model, X_test, y_test)
    # save_model(model, args.output)


if __name__ == '__main__':
    main()
