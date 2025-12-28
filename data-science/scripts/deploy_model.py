"""
Validate and deploy the trained model to production
Checks model quality, validates predictions, and confirms readiness
"""

import json
import logging
from pathlib import Path
from datetime import datetime
import joblib
import pandas as pd
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
MODELS_DIR = PROJECT_ROOT / "models"
LOGS_DIR = PROJECT_ROOT / "logs"


class ModelValidator:
    """Validate trained model before production deployment"""
    
    def __init__(self, model_path: str, metrics_path: str):
        self.model_path = Path(model_path)
        self.metrics_path = Path(metrics_path)
        self.model = None
        self.metrics = None
    
    def load_model(self) -> bool:
        """Load trained model from disk"""
        logger.info(f"📂 Loading model from {self.model_path}...")
        
        if not self.model_path.exists():
            logger.error(f"❌ Model file not found: {self.model_path}")
            return False
        
        try:
            self.model = joblib.load(str(self.model_path))
            file_size = self.model_path.stat().st_size / (1024 * 1024)
            logger.info(f"✅ Model loaded successfully ({file_size:.1f} MB)")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            return False
    
    def load_metrics(self) -> bool:
        """Load training metrics from JSON"""
        logger.info(f"📂 Loading metrics from {self.metrics_path}...")
        
        if not self.metrics_path.exists():
            logger.error(f"❌ Metrics file not found: {self.metrics_path}")
            return False
        
        try:
            with open(self.metrics_path, 'r') as f:
                self.metrics = json.load(f)
            logger.info(f"✅ Metrics loaded successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to load metrics: {e}")
            return False
    
    def validate_performance(self) -> bool:
        """Validate that model meets minimum performance requirements"""
        logger.info("🔍 Validating model performance...")
        
        if not self.metrics:
            logger.error("❌ Metrics not loaded")
            return False
        
        test_metrics = self.metrics.get('test_metrics', {})
        
        # Minimum thresholds for production
        thresholds = {
            'accuracy': 0.80,      # At least 80% accuracy
            'precision': 0.75,     # At least 75% precision
            'recall': 0.70,        # At least 70% recall
            'auc_roc': 0.85,       # At least 0.85 AUC
        }
        
        all_passed = True
        for metric, threshold in thresholds.items():
            value = test_metrics.get(metric, 0)
            passed = value >= threshold
            status = "✅" if passed else "❌"
            logger.info(f"  {status} {metric}: {value:.3f} (threshold: {threshold:.3f})")
            if not passed:
                all_passed = False
        
        if all_passed:
            logger.info("✅ Performance validation PASSED")
        else:
            logger.warning("⚠️  Some metrics below threshold")
        
        return all_passed
    
    def test_predictions(self) -> bool:
        """Test model with sample predictions"""
        logger.info("🧪 Testing model predictions...")
        
        if not self.model:
            logger.error("❌ Model not loaded")
            return False
        
        try:
            # Create sample input matching the expected features
            sample_data = pd.DataFrame({
                'Age': [35, 50, 25],
                'Income_Level': ['Medium', 'High', 'Low'],
                'Total_Transactions': [100, 500, 50],
                'Avg_Transaction_Value': [500, 700, 300],
                'Active_Days': [300, 350, 100],
                'App_Usage_Frequency': ['Daily', 'Weekly', 'Monthly'],
                'Customer_Satisfaction_Score': [8, 7, 4],
                'Last_Transaction_Days_Ago': [30, 60, 200]
            })
            
            # Make predictions
            predictions = self.model.predict(sample_data)
            probabilities = self.model.predict_proba(sample_data)
            
            logger.info(f"✅ Predictions successful")
            logger.info(f"   Sample 1: Prediction={predictions[0]}, P(Churn)={probabilities[0][1]:.2%}")
            logger.info(f"   Sample 2: Prediction={predictions[1]}, P(Churn)={probabilities[1][1]:.2%}")
            logger.info(f"   Sample 3: Prediction={predictions[2]}, P(Churn)={probabilities[2][1]:.2%}")
            
            return True
        except Exception as e:
            logger.error(f"❌ Prediction test failed: {e}")
            return False
    
    def generate_deployment_checklist(self) -> dict:
        """Generate deployment readiness checklist"""
        logger.info("✅ Generating deployment checklist...")
        
        checklist = {
            'timestamp': datetime.now().isoformat(),
            'model_file': str(self.model_path),
            'model_exists': self.model_path.exists(),
            'model_size_mb': self.model_path.stat().st_size / (1024 * 1024) if self.model_path.exists() else 0,
            'checks': {
                'Model Loadable': self.model is not None,
                'Metrics Available': self.metrics is not None,
                'Performance Valid': self.validate_performance() if self.metrics else False,
                'Predictions Working': self.test_predictions() if self.model else False,
            }
        }
        
        checklist['all_passed'] = all(checklist['checks'].values())
        
        return checklist
    
    def save_checklist(self, filepath: str) -> None:
        """Save deployment checklist to JSON"""
        logger.info(f"💾 Saving deployment checklist...")
        
        checklist = self.generate_deployment_checklist()
        
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        with open(filepath, 'w') as f:
            json.dump(checklist, f, indent=2)
        
        logger.info(f"✅ Checklist saved to {filepath}")
        
        # Print summary
        logger.info("\n" + "=" * 70)
        logger.info("📋 DEPLOYMENT READINESS CHECKLIST")
        logger.info("=" * 70)
        for check, result in checklist['checks'].items():
            status = "✅" if result else "❌"
            logger.info(f"  {status} {check}")
        
        logger.info("\n" + "=" * 70)
        if checklist['all_passed']:
            logger.info("🟢 MODEL IS READY FOR PRODUCTION DEPLOYMENT")
        else:
            logger.error("🔴 MODEL DEPLOYMENT BLOCKED - Resolve issues above")
        logger.info("=" * 70 + "\n")


def deploy_model(model_path: str, backup: bool = True) -> bool:
    """Deploy model to production location"""
    logger.info("🚀 Deploying model to production...")
    
    model_path = Path(model_path)
    prod_path = MODELS_DIR / "churn_model.pkl"
    
    # If model is already at prod location, skip copy
    if model_path.resolve() == prod_path.resolve():
        logger.info(f"✅ Model already at production location: {prod_path}")
        
        # Create deployment record
        deployment_record = {
            'timestamp': datetime.now().isoformat(),
            'model_file': str(prod_path),
            'backup_file': None,
            'status': 'deployed'
        }
        
        # Save deployment record
        record_path = LOGS_DIR / "deployment_log.json"
        record_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Append to log
        if record_path.exists():
            with open(record_path, 'r') as f:
                deployments = json.load(f)
        else:
            deployments = []
        
        deployments.append(deployment_record)
        
        with open(record_path, 'w') as f:
            json.dump(deployments, f, indent=2)
        
        logger.info(f"✅ Deployment logged to {record_path}")
        return True
    
    # Copy model to production location
    try:
        import shutil
        
        # Backup existing model if requested
        if backup and prod_path.exists():
            backup_path = MODELS_DIR / f"churn_model_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
            shutil.copy(str(prod_path), str(backup_path))
            logger.info(f"✅ Backup created: {backup_path}")
        
        # Copy model
        shutil.copy(str(model_path), str(prod_path))
        logger.info(f"✅ Model deployed to {prod_path}")
        
        # Create deployment record
        deployment_record = {
            'timestamp': datetime.now().isoformat(),
            'model_file': str(prod_path),
            'source_file': str(model_path),
            'status': 'deployed'
        }
        
        # Save deployment record
        record_path = LOGS_DIR / "deployment_log.json"
        record_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Append to log
        if record_path.exists():
            with open(record_path, 'r') as f:
                deployments = json.load(f)
        else:
            deployments = []
        
        deployments.append(deployment_record)
        
        with open(record_path, 'w') as f:
            json.dump(deployments, f, indent=2)
        
        logger.info(f"✅ Deployment logged to {record_path}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Deployment failed: {e}")
        return False


def main():
    """Main validation and deployment pipeline"""
    logger.info("=" * 70)
    logger.info("🔍 ChurnInsight - Model Validation & Deployment")
    logger.info("=" * 70)
    
    # Paths
    model_path = MODELS_DIR / "churn_model.pkl"
    metrics_path = LOGS_DIR / "training_metrics.json"
    checklist_path = LOGS_DIR / "deployment_checklist.json"
    
    # Create validator
    validator = ModelValidator(str(model_path), str(metrics_path))
    
    # Run validation steps
    steps = [
        ("Loading model", lambda: validator.load_model()),
        ("Loading metrics", lambda: validator.load_metrics()),
        ("Validating performance", lambda: validator.validate_performance()),
        ("Testing predictions", lambda: validator.test_predictions()),
    ]
    
    for step_name, step_func in steps:
        logger.info(f"\n▶️  {step_name}...")
        if not step_func():
            logger.error(f"❌ {step_name} failed")
            return False
    
    # Generate and save checklist
    logger.info(f"\n▶️  Generating deployment checklist...")
    validator.save_checklist(str(checklist_path))
    
    # Load checklist to check if all passed
    with open(checklist_path, 'r') as f:
        checklist = json.load(f)
    
    if checklist['all_passed']:
        # Deploy model
        logger.info(f"\n▶️  Deploying model to production...")
        if deploy_model(str(model_path), backup=True):
            logger.info("\n" + "=" * 70)
            logger.info("✅ MODEL SUCCESSFULLY DEPLOYED TO PRODUCTION")
            logger.info("=" * 70)
            logger.info(f"\n🎉 Production Model: {MODELS_DIR / 'churn_model.pkl'}")
            logger.info(f"📊 Ready for: http://localhost:8080/api/predict\n")
            return True
        else:
            logger.error("❌ Deployment failed")
            return False
    else:
        logger.error("❌ Validation failed - Cannot deploy")
        return False


if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
