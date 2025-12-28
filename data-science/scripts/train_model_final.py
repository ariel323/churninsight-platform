"""
Train the final churn prediction model for production deployment
Includes data validation, model training, evaluation, and serialization
"""

import pandas as pd
import numpy as np
import os
import json
import logging
from pathlib import Path
from datetime import datetime
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, 
    f1_score, roc_auc_score, confusion_matrix, classification_report
)
import joblib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
MODELS_DIR = PROJECT_ROOT / "models"
LOGS_DIR = PROJECT_ROOT / "logs"

# Ensure directories exist
LOGS_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)


def load_data(filepath: str) -> pd.DataFrame:
    """Load training data from CSV"""
    logger.info(f"📂 Loading dataset from {filepath}...")
    df = pd.read_csv(filepath)
    logger.info(f"✅ Loaded {len(df)} records with {len(df.columns)} features")
    return df


def validate_data(df: pd.DataFrame) -> bool:
    """Validate dataset structure and quality"""
    logger.info("🔍 Validating dataset...")
    
    checks = {
        "No missing values": df.isnull().sum().sum() == 0,
        "Churn column exists": 'Churn' in df.columns,
        "Churn is binary": set(df['Churn'].unique()) <= {0, 1},
        "Sufficient records": len(df) >= 1000,
    }
    
    all_valid = True
    for check_name, result in checks.items():
        status = "✅" if result else "❌"
        logger.info(f"  {status} {check_name}")
        if not result:
            all_valid = False
    
    if all_valid:
        logger.info(f"✅ Validation passed")
        logger.info(f"   Churn distribution: {df['Churn'].value_counts().to_dict()}")
    
    return all_valid


def prepare_features(df: pd.DataFrame) -> tuple:
    """Prepare features and target for training"""
    logger.info("⚙️  Preparing features...")
    
    # Define feature columns
    feature_columns = [
        'Age', 'Income_Level', 'Total_Transactions', 'Avg_Transaction_Value',
        'Active_Days', 'App_Usage_Frequency', 'Customer_Satisfaction_Score', 
        'Last_Transaction_Days_Ago'
    ]
    
    # Verify all features exist
    missing_features = set(feature_columns) - set(df.columns)
    if missing_features:
        raise ValueError(f"Missing required features: {missing_features}")
    
    X = df[feature_columns]
    y = df['Churn']
    
    logger.info(f"✅ {len(feature_columns)} features selected")
    logger.info(f"   Numeric: Age, Total_Transactions, Avg_Transaction_Value, Active_Days, Customer_Satisfaction_Score, Last_Transaction_Days_Ago")
    logger.info(f"   Categorical: Income_Level, App_Usage_Frequency")
    
    return X, y, feature_columns


def build_pipeline() -> Pipeline:
    """Build preprocessing and modeling pipeline"""
    logger.info("🔧 Building ML pipeline...")
    
    numeric_features = [
        'Age', 'Total_Transactions', 'Avg_Transaction_Value', 
        'Active_Days', 'Customer_Satisfaction_Score', 'Last_Transaction_Days_Ago'
    ]
    categorical_features = ['Income_Level', 'App_Usage_Frequency']
    
    # Numeric preprocessing
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])
    
    # Categorical preprocessing
    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    # Combine preprocessors
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )
    
    # Full pipeline with classifier
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            n_jobs=-1,
            class_weight='balanced'
        ))
    ])
    
    logger.info("✅ Pipeline built successfully")
    return pipeline


def train_model(X_train: pd.DataFrame, y_train: pd.Series, pipeline: Pipeline) -> Pipeline:
    """Train the model on training data"""
    logger.info("🤖 Training model...")
    logger.info(f"   Training set: {len(X_train)} samples")
    
    pipeline.fit(X_train, y_train)
    
    # Training accuracy
    train_pred = pipeline.predict(X_train)
    train_acc = accuracy_score(y_train, train_pred)
    logger.info(f"✅ Model trained - Training Accuracy: {train_acc:.1%}")
    
    return pipeline


def evaluate_model(X_test: pd.DataFrame, y_test: pd.Series, pipeline: Pipeline) -> dict:
    """Evaluate model on test set"""
    logger.info("📊 Evaluating model on test set...")
    logger.info(f"   Test set: {len(X_test)} samples")
    
    # Predictions
    y_pred = pipeline.predict(X_test)
    y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
    
    # Metrics
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1': f1_score(y_test, y_pred),
        'auc_roc': roc_auc_score(y_test, y_pred_proba),
    }
    
    # Log metrics
    logger.info(f"✅ Evaluation Results:")
    logger.info(f"   Accuracy:  {metrics['accuracy']:.1%}")
    logger.info(f"   Precision: {metrics['precision']:.1%}")
    logger.info(f"   Recall:    {metrics['recall']:.1%}")
    logger.info(f"   F1-Score:  {metrics['f1']:.1%}")
    logger.info(f"   AUC-ROC:   {metrics['auc_roc']:.3f}")
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    logger.info(f"\n   Confusion Matrix:")
    logger.info(f"   TN: {cm[0,0]}  FP: {cm[0,1]}")
    logger.info(f"   FN: {cm[1,0]}  TP: {cm[1,1]}")
    
    # Classification report
    logger.info(f"\n   Classification Report:")
    logger.info(classification_report(y_test, y_pred, target_names=['No Churn', 'Churn']))
    
    return metrics


def cross_validate_model(X_train: pd.DataFrame, y_train: pd.Series, pipeline: Pipeline) -> dict:
    """Perform 5-fold cross-validation"""
    logger.info("🔄 Running 5-fold cross-validation...")
    
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='roc_auc')
    
    logger.info(f"✅ CV Scores (AUC-ROC):")
    logger.info(f"   Fold scores: {cv_scores}")
    logger.info(f"   Mean: {cv_scores.mean():.3f}")
    logger.info(f"   Std Dev: {cv_scores.std():.3f}")
    
    return {
        'cv_scores': cv_scores.tolist(),
        'cv_mean': float(cv_scores.mean()),
        'cv_std': float(cv_scores.std())
    }


def save_model(pipeline: Pipeline, model_path: str) -> None:
    """Serialize and save trained model"""
    logger.info(f"💾 Saving model to {model_path}...")
    
    joblib.dump(pipeline, model_path)
    file_size = Path(model_path).stat().st_size / (1024 * 1024)
    
    logger.info(f"✅ Model saved successfully")
    logger.info(f"   File: {model_path}")
    logger.info(f"   Size: {file_size:.1f} MB")


def save_metrics(metrics: dict, cv_metrics: dict, filepath: str) -> None:
    """Save training metrics to JSON file"""
    logger.info(f"📈 Saving metrics to {filepath}...")
    
    output = {
        'timestamp': datetime.now().isoformat(),
        'model_type': 'RandomForestClassifier',
        'hyperparameters': {
            'n_estimators': 100,
            'max_depth': 15,
            'min_samples_split': 10,
            'random_state': 42,
        },
        'test_metrics': {k: float(v) for k, v in metrics.items()},
        'cross_validation': cv_metrics,
    }
    
    filepath = Path(filepath)
    filepath.parent.mkdir(parents=True, exist_ok=True)
    
    with open(filepath, 'w') as f:
        json.dump(output, f, indent=2)
    
    logger.info(f"✅ Metrics saved to {filepath}")


def main():
    """Main training pipeline"""
    logger.info("=" * 70)
    logger.info("🚀 ChurnInsight - Final Model Training")
    logger.info("=" * 70)
    
    try:
        # Step 1: Load data
        dataset_path = DATA_DIR / "dataset.csv"
        if not dataset_path.exists():
            logger.error(f"❌ Dataset not found: {dataset_path}")
            logger.info("   Run: python scripts/generate_synthetic_data.py")
            return False
        
        df = load_data(str(dataset_path))
        
        # Step 2: Validate
        if not validate_data(df):
            logger.error("❌ Data validation failed")
            return False
        
        # Step 3: Prepare features
        X, y, feature_cols = prepare_features(df)
        
        # Step 4: Split data
        logger.info("📊 Splitting data (70% train, 30% test)...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42, stratify=y
        )
        logger.info(f"✅ Split completed: {len(X_train)} train, {len(X_test)} test")
        
        # Step 5: Build pipeline
        pipeline = build_pipeline()
        
        # Step 6: Train model
        pipeline = train_model(X_train, y_train, pipeline)
        
        # Step 7: Cross-validation
        cv_metrics = cross_validate_model(X_train, y_train, pipeline)
        
        # Step 8: Evaluate
        test_metrics = evaluate_model(X_test, y_test, pipeline)
        
        # Step 9: Save model
        model_path = MODELS_DIR / "churn_model.pkl"
        save_model(pipeline, str(model_path))
        
        # Step 10: Save metrics
        metrics_path = LOGS_DIR / "training_metrics.json"
        save_metrics(test_metrics, cv_metrics, str(metrics_path))
        
        # Final summary
        logger.info("\n" + "=" * 70)
        logger.info("✅ MODEL TRAINING COMPLETED SUCCESSFULLY")
        logger.info("=" * 70)
        logger.info(f"\n📁 Artifacts saved:")
        logger.info(f"   Model:   {model_path}")
        logger.info(f"   Metrics: {metrics_path}")
        logger.info(f"\n📊 Final Performance:")
        logger.info(f"   Test Accuracy: {test_metrics['accuracy']:.1%}")
        logger.info(f"   Test AUC-ROC:  {test_metrics['auc_roc']:.3f}")
        logger.info(f"   CV Mean AUC:   {cv_metrics['cv_mean']:.3f}")
        logger.info(f"\n🚀 Ready for deployment!\n")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Training failed: {e}", exc_info=True)
        return False


if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
