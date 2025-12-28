#!/usr/bin/env python3
"""
ChurnInsight Production Pipeline - Automated Workflow

Ejecuta:
1. Generación de datos
2. Entrenamiento de modelo
3. Validación y despliegue

Usage:
    python run_production_pipeline.py
    python run_production_pipeline.py --skip-data     (sin regenerar datos)
    python run_production_pipeline.py --train-only    (solo entrenar)
    python run_production_pipeline.py --deploy-only   (solo desplegar)
"""

import subprocess
import sys
import json
import logging
from pathlib import Path
from datetime import datetime
import argparse

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Rutas
SCRIPTS_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPTS_DIR.parent
MODELS_DIR = PROJECT_ROOT / 'models'
LOGS_DIR = PROJECT_ROOT / 'logs'
DATA_DIR = PROJECT_ROOT / 'data'

# Crear directorios si no existen
MODELS_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)


def run_command(script_name: str, description: str) -> bool:
    """Ejecuta un script Python y retorna True si es exitoso."""
    script_path = SCRIPTS_DIR / script_name
    
    logger.info(f"\n{'='*70}")
    logger.info(f"▶️  {description}")
    logger.info(f"{'='*70}")
    
    if not script_path.exists():
        logger.error(f"❌ Script no encontrado: {script_path}")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=str(PROJECT_ROOT),
            capture_output=False,
            text=True,
            timeout=300  # 5 minutos max
        )
        
        if result.returncode == 0:
            logger.info(f"✅ {description} completado exitosamente")
            return True
        else:
            logger.error(f"❌ {description} falló (exit code: {result.returncode})")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error(f"❌ {description} tardó demasiado (timeout)")
        return False
    except Exception as e:
        logger.error(f"❌ Error ejecutando {description}: {e}")
        return False


def verify_files_exist(files: dict) -> bool:
    """Verifica que archivos necesarios existan."""
    logger.info(f"\n🔍 Verificando archivos...")
    all_exist = True
    
    for label, file_path in files.items():
        path = Path(file_path)
        if path.exists():
            size = path.stat().st_size / (1024 * 1024)  # MB
            logger.info(f"  ✅ {label}: {path.name} ({size:.2f} MB)")
        else:
            logger.warning(f"  ⚠️  {label}: NO ENCONTRADO - {path}")
            all_exist = False
    
    return all_exist


def load_metrics() -> dict:
    """Carga métricas de training."""
    metrics_file = LOGS_DIR / 'training_metrics.json'
    if metrics_file.exists():
        try:
            with open(metrics_file) as f:
                return json.load(f)
        except:
            return {}
    return {}


def load_checklist() -> dict:
    """Carga checklist de despliegue."""
    checklist_file = LOGS_DIR / 'deployment_checklist.json'
    if checklist_file.exists():
        try:
            with open(checklist_file) as f:
                return json.load(f)
        except:
            return {}
    return {}


def print_summary():
    """Imprime resumen final de la ejecución."""
    logger.info(f"\n{'='*70}")
    logger.info("📊 RESUMEN FINAL DEL PIPELINE")
    logger.info(f"{'='*70}")
    
    # Verificar archivos
    files_to_check = {
        'Dataset': DATA_DIR / 'dataset.csv',
        'Modelo': MODELS_DIR / 'churn_model.pkl',
        'Métricas': LOGS_DIR / 'training_metrics.json',
        'Checklist': LOGS_DIR / 'deployment_checklist.json',
    }
    
    files_status = {}
    for label, path in files_to_check.items():
        files_status[label] = path.exists()
    
    logger.info("\n📁 Estado de Archivos:")
    for label, exists in files_status.items():
        status = "✅" if exists else "❌"
        logger.info(f"  {status} {label}")
    
    # Mostrar métricas si existen
    metrics = load_metrics()
    if metrics:
        logger.info("\n📈 Métricas de Entrenamiento:")
        test_metrics = metrics.get('test_metrics', {})
        for key, value in test_metrics.items():
            if isinstance(value, float):
                logger.info(f"  • {key.capitalize()}: {value:.4f}")
    
    # Mostrar checklist si existe
    checklist = load_checklist()
    if checklist:
        logger.info("\n✅ Validación de Despliegue:")
        all_passed = checklist.get('all_passed', False)
        checks = checklist.get('validation_results', {})
        
        for check, passed in checks.items():
            status = "✅" if passed else "❌"
            logger.info(f"  {status} {check}")
        
        final_status = "🟢 PRODUCTION READY" if all_passed else "🔴 VALIDATION FAILED"
        logger.info(f"\n  {final_status}")
    
    logger.info(f"\n{'='*70}")
    logger.info("🎉 Pipeline completado")
    logger.info(f"{'='*70}\n")


def main():
    parser = argparse.ArgumentParser(
        description='ChurnInsight Production Pipeline'
    )
    parser.add_argument(
        '--skip-data',
        action='store_true',
        help='Omitir generación de datos'
    )
    parser.add_argument(
        '--train-only',
        action='store_true',
        help='Solo entrenar modelo'
    )
    parser.add_argument(
        '--deploy-only',
        action='store_true',
        help='Solo desplegar modelo'
    )
    
    args = parser.parse_args()
    
    logger.info("🚀 Iniciando Pipeline de Producción ChurnInsight")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info(f"Directorio: {PROJECT_ROOT}")
    
    success = True
    
    # 1. Generar datos (si no se especifica --skip-data y no es --deploy-only)
    if not args.skip_data and not args.deploy_only:
        logger.info("\n📊 FASE 1: GENERACIÓN DE DATOS")
        if not run_command(
            'generate_synthetic_data.py',
            'Generación de dataset sintético'
        ):
            success = False
            logger.error("❌ No se puede continuar sin datos")
            return False
        
        # Verificar que se creó el dataset
        if not (DATA_DIR / 'dataset.csv').exists():
            logger.error("❌ Dataset no fue creado correctamente")
            return False
    
    # 2. Entrenar modelo (si no es --deploy-only)
    if not args.deploy_only:
        logger.info("\n🤖 FASE 2: ENTRENAMIENTO DEL MODELO")
        
        # Verificar dataset
        if not (DATA_DIR / 'dataset.csv').exists():
            logger.error("❌ Dataset no encontrado. Ejecuta sin --train-only primero")
            return False
        
        if not run_command(
            'train_model_final.py',
            'Entrenamiento del modelo de churn'
        ):
            success = False
            logger.error("❌ No se puede continuar sin modelo entrenado")
            return False
        
        # Verificar que se creó el modelo
        if not (MODELS_DIR / 'churn_model.pkl').exists():
            logger.error("❌ Modelo no fue creado correctamente")
            return False
    
    # 3. Desplegar modelo (si no es --train-only)
    if not args.train_only:
        logger.info("\n🚀 FASE 3: VALIDACIÓN Y DESPLIEGUE")
        
        # Verificar archivo del modelo
        if not (MODELS_DIR / 'churn_model.pkl').exists():
            logger.error("❌ Modelo no encontrado. Entrena primero")
            return False
        
        if not run_command(
            'deploy_model.py',
            'Validación y despliegue del modelo'
        ):
            success = False
            logger.error("❌ Despliegue falló")
            return False
    
    # Resumen final
    print_summary()
    
    if success:
        logger.info("✅ PIPELINE COMPLETADO EXITOSAMENTE")
        return True
    else:
        logger.error("❌ PIPELINE COMPLETADO CON ERRORES")
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
