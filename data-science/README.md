 🏦 Sistema de Predicción de Churn  para un Banco 

Este proyecto implementa una solución de **inteligencia artificial** de extremo a extremo orientada a la detección temprana de clientes con alta probabilidad de abandono (**Churn**) en un Banco.

---

## 📁 Información General
* **Versión:** 1.0.0
* **Estado:** 🟢 Completado
* **Dominio:** Analítica Predictiva / Machine Learning

### 🛠️ Tecnologías
* **Modelado:** Python (XGBoost)
* **Interoperabilidad:** PMML y PKL

---

## 🚀 Descripción del Proyecto
El Banco Alura enfrenta el desafío de retener clientes en un entorno financiero competitivo. Esta solución transforma el dataset histórico `Banco_Churn.csv` en un modelo predictivo robusto, capaz de estimar el riesgo de abandono de cada cliente en tiempo real.

### ⭐ Características Principales
1. **Dataset Utilizado**: Banco_Churn.csv
2.  **Modelo XGBoost:** Implementación de alto rendimiento para clasificación.
3.  **Interoperabilidad PMML:** Exportación del modelo para consumo en Java sin dependencias de Python.

---

### ⚙️ Recursos y Configuración

**`modelo_churn_banco.pmml`**: Modelo predictivo entrenado para ser usado en BackEnd y ser leido por java.

 **Contrato de entrada:**

[
    'Age_Risk',
    
    'NumOfProducts',
    
    'Inactivo_40_70',
    
    'Products_Risk_Flag',
    
    'Country_Risk_Flag'
]
---

### Entrada para predecir Churn:

   Edad del cliente: 
   
   Número de productos contratados: 
   ¿La cuenta está ACTIVA actualmente? (1=Sí, 0=No): 
   
   País:
   
   0 = France
   
   1 = Germany
   
   2 = Spain
   
   Seleccione país: 

## ⚙️ Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/Gameto2025/Churn_Banco.git]

👥 Equipo de Trabajo

Gabriel Mendez Oteiza: Equipo Data Science.

Martin Abreu   Equipo Data Svience.

