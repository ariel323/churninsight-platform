@echo off
echo ========================================
echo ChurnInsight - Configuración del Entorno
echo ========================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no está instalado o no está en el PATH
    echo Por favor instala Python 3.9 o superior desde https://python.org
    pause
    exit /b 1
)

echo Instalando dependencias...
pip install -r requirements.txt

if errorlevel 1 (
    echo ERROR: Falló la instalación de dependencias
    pause
    exit /b 1
)

echo.
echo Dependencias instaladas correctamente.
echo.
echo Para entrenar el modelo, ejecuta:
echo python scripts/train_model.py
echo.
echo Para iniciar el servicio de predicción, ejecuta:
echo python scripts/start_service.py
echo.
pause