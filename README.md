# 🏦 ChurnInsight Platform

![Java](https://img.shields.io/badge/Java-17+-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Python](https://img.shields.io/badge/Python-3.10+-yellow?logo=python)
![MySQL](https://img.shields.io/badge/MySQL-8+-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

> **Plataforma integral para la predicción y análisis del abandono de clientes bancarios (churn)**, diseñada con arquitectura modular, desacoplada y orientada a la integración con modelos de Machine Learning.

---

## 📐 Arquitectura del Sistema

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│  Backend Java   │────▶│   Data Science  │
│  React + TS     │     │  Spring Boot    │     │  Python / PMML  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       ▼                       │
        │               ┌─────────────┐                 │
        └──────────────▶│   MySQL DB  │◀────────────────┘
                        └─────────────┘
```

---

## 📁 Estructura del Repositorio

```
churninsight-platform/
├── frontend/               # Aplicación React + TypeScript
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── services/       # Consumo de APIs
│   │   └── ...
│   └── package.json
├── backend-java/           # API Spring Boot
│   ├── src/main/java/com/churninsight/
│   │   ├── controller/     # Endpoints REST
│   │   ├── model/          # Entidades JPA
│   │   ├── security/       # JWT y filtros
│   │   └── service/        # Lógica de negocio
│   └── pom.xml
├── data-science/           # Modelos y notebooks
│   ├── api/                # API de predicción
│   ├── model/              # Modelos exportados (.pmml, .pkl)
│   ├── scripts/            # Scripts de entrenamiento
│   └── Banco_Churn_ML.ipynb
└── README.md
```

---

## ✨ Características Principales

- 🔐 **Autenticación segura** con JWT y Spring Security
- 📊 **Dashboard en tiempo real** con métricas de predicciones
- 📈 **Historial de predicciones** por cliente
- 🔌 **Arquitectura desacoplada** (backend independiente del motor ML)
- 🛡️ **Seguridad empresarial**: CORS, validación, gestión de sesiones

---

## ⚙️ Requisitos Previos

| Componente | Versión mínima   |
| ---------- | ---------------- |
| Node.js    | 18+              |
| npm        | 9+               |
| Java JDK   | 17+              |
| Maven      | 3.8+             |
| MySQL      | 8.0+             |
| Python     | 3.10+ (opcional) |

---

## 🚀 Instalación y Ejecución

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

> Accede a `http://localhost:3000`

### 2. Backend

```bash
cd backend-java
# Configura credenciales en src/main/resources/application.yml
mvn spring-boot:run
```

> API disponible en `http://localhost:8080`

### 3. Data Science (opcional)

```bash
cd data-science
pip install -r requirements.txt
python api/main.py
```

> API de predicción en `http://localhost:8000`

---

## 🔗 Endpoints Principales

| Método | Endpoint             | Descripción               |
| ------ | -------------------- | ------------------------- |
| POST   | `/api/auth/login`    | Autenticación de usuario  |
| POST   | `/api/auth/register` | Registro de usuario       |
| POST   | `/api/churn/predict` | Predicción de churn       |
| GET    | `/api/churn/history` | Historial de predicciones |
| GET    | `/api/stats`         | Estadísticas del sistema  |

---

## 🔒 Seguridad y Buenas Prácticas

- ✅ Credenciales y secretos excluidos del repositorio
- ✅ `.gitignore` configurado para dependencias y archivos temporales
- ✅ Uso de variables de entorno recomendado en producción
- ✅ Tokens JWT con expiración configurable

---

## 👥 Colaboradores

| Nombre             | Rol                     |
| ------------------ | ----------------------- |
| **Ariel323**       | Owner, Backend/Frontend |
| Gabriel Méndez     | data science            |
| Diego García       | Data Science            |
| Martin Abreu       | Desarrollo              |
| Alexandra Garavito | Backend                 |


---

## 📝 Notas Técnicas

- Revisar configuración de CORS y seguridad antes de producción
- La integración ML puede realizarse vía FastAPI, PMML o gRPC
- Se recomienda GitHub Actions para CI/CD

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.
