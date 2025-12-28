#!/bin/bash

echo "========================================"
echo "ChurnInsight - Configuración del Entorno"
echo "========================================"
echo ""

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null
then
    echo "ERROR: Python 3 no está instalado"
    echo "Por favor instala Python 3.9 o superior"
    exit 1
fi

echo "Instalando dependencias..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "ERROR: Falló la instalación de dependencias"
    exit 1
fi

echo ""
echo "Dependencias instaladas correctamente."
echo ""
echo "Para entrenar el modelo, ejecuta:"
echo "python3 scripts/train_model.py"
echo ""
echo "Para iniciar el servicio de predicción, ejecuta:"
echo "python3 scripts/start_service.py"
echo ""