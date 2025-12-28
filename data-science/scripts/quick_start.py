#!/usr/bin/env python3
"""
ChurnInsight Quick Start - Inicialización de Producción

Ejecuta todo automáticamente en modo verbose.
Ideal para la primera ejecución.

Usage:
    python quick_start.py
"""

import subprocess
import sys
from pathlib import Path

def run_pipeline():
    """Ejecuta el pipeline de producción."""
    script_path = Path(__file__).parent / 'run_production_pipeline.py'
    
    print("""
    ╔══════════════════════════════════════════════════════════════════╗
    ║          🚀 ChurnInsight Production Pipeline - Quick Start       ║
    ║                                                                  ║
    ║  Este script ejecutará:                                         ║
    ║  1. Generación de datos sintéticos (7,000 registros)           ║
    ║  2. Entrenamiento del modelo (RandomForest)                    ║
    ║  3. Validación y despliegue a producción                       ║
    ║                                                                  ║
    ║  ⏱️  Tiempo estimado: 2-3 minutos                               ║
    ║  💾 Espacio requerido: ~50 MB                                  ║
    ║                                                                  ║
    ╚══════════════════════════════════════════════════════════════════╝
    """)
    
    input("Presiona ENTER para continuar...")
    
    result = subprocess.run(
        [sys.executable, str(script_path)],
        cwd=str(Path(__file__).parent.parent)
    )
    
    return result.returncode == 0

if __name__ == '__main__':
    success = run_pipeline()
    
    if success:
        print("""
        ╔══════════════════════════════════════════════════════════════════╗
        ║                    ✅ ¡LISTO PARA PRODUCCIÓN!                    ║
        ║                                                                  ║
        ║  Próximos pasos:                                                ║
        ║  1. Inicia el backend Java (puerto 8080)                       ║
        ║  2. Usa el endpoint POST /api/predict para predicciones        ║
        ║  3. Las métricas se guardan en MySQL automáticamente           ║
        ║                                                                  ║
        ║  URLs importantes:                                              ║
        ║  • API Predicción: http://localhost:8080/api/predict          ║
        ║  • Health Check:   http://localhost:8080/api/health           ║
        ║                                                                  ║
        ║  Archivos generados:                                            ║
        ║  • Modelo:      data-science/models/churn_model.pkl           ║
        ║  • Métricas:    data-science/logs/training_metrics.json       ║
        ║  • Checklist:   data-science/logs/deployment_checklist.json   ║
        ║                                                                  ║
        ╚══════════════════════════════════════════════════════════════════╝
        """)
        sys.exit(0)
    else:
        print("""
        ╔══════════════════════════════════════════════════════════════════╗
        ║                    ❌ Pipeline falló                              ║
        ║                                                                  ║
        ║  Revisa los logs para más detalles:                             ║
        ║  • data-science/logs/pipeline.log                              ║
        ║                                                                  ║
        ║  Posibles soluciones:                                            ║
        ║  1. Verifica que Python 3.8+ esté instalado                   ║
        ║  2. Ejecuta: pip install -r requirements.txt                  ║
        ║  3. Asegúrate que MySQL esté corriendo                        ║
        ║                                                                  ║
        ╚══════════════════════════════════════════════════════════════════╝
        """)
        sys.exit(1)
