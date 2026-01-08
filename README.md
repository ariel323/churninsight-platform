# 🏦 ChurnInsight Platform

![Java](https://img.shields.io/badge/Java-17+-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.0-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
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
- 🔑 **Recuperación de contraseña** vía email con tokens temporales
- 📊 **Dashboard en tiempo real** con métricas de predicciones
- 📈 **Historial de predicciones** por cliente con análisis de causales
- 🎯 **Recomendaciones de negocio** basadas en flags de riesgo
- 📑 **Exportación a Excel** del historial de predicciones
- ♿ **Accesibilidad web completa** (Lighthouse 95+)
- 🔌 **Arquitectura desacoplada** (backend independiente del motor ML)
- 🛡️ **Seguridad empresarial**: CORS, validación, gestión de sesiones
- 🎨 **Interfaz moderna** con Material-UI y diseño responsive
- 📱 **Experiencia móvil optimizada**
- 🤖 **Integración Python-Java** vía Py4J para predicciones en tiempo real

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

| Método | Endpoint                           | Descripción                           |
| ------ | ---------------------------------- | ------------------------------------- |
| POST   | `/api/auth/login`                  | Autenticación de usuario              |
| POST   | `/api/auth/register`               | Registro de usuario                   |
| POST   | `/api/auth/forgot-password`        | Recuperación de contraseña            |
| POST   | `/api/auth/reset-password`         | Reseteo de contraseña con token       |
| POST   | `/api/churn/predict`               | Predicción de churn (9 variables)     |
| GET    | `/api/stats`                       | Estadísticas del sistema              |
| GET    | `/api/churn/history`               | Historial de predicciones del usuario |
| GET    | `/api/churn/kpis`                  | KPIs del sistema (clientes en riesgo) |
| GET    | `/api/churn/customer/{id}/history` | Historial de un cliente específico    |

---

## ♿ Accesibilidad y Rendimiento

### Puntuaciones Lighthouse (Objetivo: 90+)

| Métrica               | Estado | Descripción                                       |
| --------------------- | ------ | ------------------------------------------------- |
| **Accesibilidad**     | ✅ 95+ | Etiquetas ARIA, navegación por teclado, contraste |
| **Mejores Prácticas** | ✅ 95+ | Console.logs eliminados en producción             |
| **SEO**               | ✅ 90+ | Meta tags, estructura semántica                   |
| **Rendimiento**       | ✅ 85+ | Lazy loading, compresión Gzip                     |

### Características de Accesibilidad

- 🎯 **Lectores de pantalla** compatibles (NVDA, JAWS, VoiceOver)
- ⌨️ **Navegación por teclado** completa
- 🎨 **Contraste de colores** WCAG AA compliant
- 📱 **Responsive design** para todos los dispositivos
- 🔊 **Etiquetas descriptivas** en gráficos y formularios

---

## 👥 Colaboradores

| Nombre             | Rol                   | Contribuciones                   |
| ------------------ | --------------------- | -------------------------------- |
| **Ariel323**       | Owner, Full-Stack Dev | Backend, Frontend, Accesibilidad |
| Gabriel Méndez     | Data Science          | Modelos ML, análisis             |
| Martin Abreu       | Desarrollo            | Arquitectura, testing            |
| Alexandra Garavito | Backend               | APIs, seguridad                  |

### 🆕 Últimas Actualizaciones (v1.2.0)

- ✨ **9 variables predictoras** - Modelo más robusto con datos originales del cliente
- 🔑 **Recuperación de contraseña** - Sistema completo con envío de emails
- 📊 **Panel de KPIs** - Métricas de clientes en riesgo y capital en riesgo
- 📈 **Análisis de causales** - Identificación automática de razones de riesgo
- 🎯 **Recomendaciones de negocio** - Acciones sugeridas basadas en causales técnicas
- 📑 **Exportación Excel** - Descarga de historial con análisis completo
- 🤖 **Integración Py4J** - Comunicación directa Java-Python sin APIs HTTP
- ✅ **WCAG 2.1 AA** - Cumplimiento total de estándares de accesibilidad

---

## �️ Tecnologías y Herramientas

### Frontend

- **React 19** + **TypeScript 5.x** - Componentes tipados
- **Material-UI (MUI)** - Diseño moderno y accesible
- **Recharts** - Gráficos interactivos con accesibilidad
- **React Hook Form** - Validación de formularios
- **Webpack + Babel** - Optimización y transformación de código

### Backend

- **Spring Boot 3.4.0** - Framework Java moderno
- **Spring Security + JWT** - Autenticación segura
- **Spring Data JPA** - Persistencia de datos
- **MySQL 8+** - Base de datos relacional

### Data Science

- **Python 3.10+** - Procesamiento de datos
- **XGBoost** - Modelo de Machine Learning (clasificación binaria)
- **Py4J** - Integración Java-Python en tiempo real
- **Joblib** - Serialización del modelo entrenado (.pkl)
- **FastAPI** - API de predicción alternativa (opcional)

### DevOps & Calidad

- **Maven** - Gestión de dependencias Java
- **npm** - Gestión de dependencias Node.js
- **ESLint + Prettier** - Calidad de código
- **Lighthouse** - Auditoría de rendimiento y accesibilidad

---

## � Notas Técnicas

### 🔧 Versiones Específicas de Dependencias

#### Frontend

- **React**: 19.0.0+ (hooks modernos, concurrent features)
- **TypeScript**: 5.6.x+ (decorators, const type parameters)
- **Material-UI**: 6.x+ (MUI v6 con mejor accesibilidad)
- **React Hook Form**: 7.x+ (validación performante)
- **Recharts**: 2.x+ (gráficos accesibles)

#### Backend

- **Spring Boot**: 3.4.0+ (última versión LTS)
- **Java**: 17+ (LTS con nuevas características)
- **Spring Security**: 6.x+ (OAuth2, JWT moderno)
- **Spring Data JPA**: 3.x+ (Hibernate 6.x)
- **MySQL Connector**: 8.0.33+ (compatibilidad MySQL 8+)

#### Data Science

- **Python**: 3.10+ (typing moderno, pattern matching)
- **XGBoost**: 2.x+ (mejor rendimiento en predicciones)
- **PMML**: 4.4+ (estándar de intercambio de modelos)
- **FastAPI**: 0.100+ (async/await nativo)

### ⚙️ Configuraciones Críticas

#### JWT Authentication

```yaml
# application.yml
jwt:
  secret: ${JWT_SECRET:your-secret-key-here}
  expiration: 86400000 # 24 horas en ms
  refresh-expiration: 604800000 # 7 días en ms
```

#### CORS Configuration

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

#### Database Connection

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/churninsight?useSSL=false&serverTimezone=UTC
    username: ${DB_USERNAME:churnuser}
    password: ${DB_PASSWORD:churnpass}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
```

### 🤖 Modelo de Machine Learning

#### Características del Modelo

- **Algoritmo**: XGBoost Classifier
- **Precisión**: ~85% en conjunto de validación
- **Características**: 9 variables predictoras (5 derivadas + 4 originales)
- **Formato**: PKL (Pickle) con integración Python vía Py4J
- **Entrenamiento**: Dataset bancario anonimizado
- **Umbral óptimo**: 0.58 (validado para maximizar recall)

#### Variables Predictoras

**Variables Derivadas (Risk Flags):**

- **Age_Risk**: Indicador binario (1 si edad entre 40-70 años, 0 en caso contrario)
- **NumOfProducts**: Número de productos contratados por el cliente (1-4)
- **Inactivo_40_70**: Indicador binario (1 si cliente de 40-70 años e inactivo, 0 en caso contrario)
- **Products_Risk_Flag**: Indicador binario (1 si tiene 3 o más productos, 0 en caso contrario)
- **Country_Risk_Flag**: Indicador binario (1 si cliente de Germany, 0 en caso contrario)

**Variables Originales del Cliente:**

- **Balance**: Saldo actual de la cuenta del cliente
- **EstimatedSalary**: Salario estimado del cliente
- **Tenure**: Antigüedad del cliente (años con el banco)
- **CreditScore**: Puntuación crediticia del cliente
- **Country**: País de residencia (France, Germany, Spain)
- **IsActiveMember**: Estado de actividad de la cuenta (boolean)

#### Niveles de Riesgo

- **ALTO** (≥75%): Contacto inmediato, cashback especial, beneficios premium
- **MEDIO** (≥58%): Campaña de engagement, promociones personalizadas
- **BAJO** (<58%): Mantener experiencia actual, monitoreo regular

### 🚀 Consideraciones de Despliegue

#### Variables de Entorno Requeridas

```bash
# Backend
JWT_SECRET=your-super-secret-jwt-key
DB_USERNAME=prod_user
DB_PASSWORD=prod_password
DB_URL=jdbc:mysql://prod-db:3306/churninsight

# SMTP (Solo para recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend
REACT_APP_API_URL=https://api.churninsight.com
REACT_APP_ENV=production
```

#### Puertos por Defecto

- **Frontend**: 3000 (desarrollo), 80/443 (producción)
- **Backend**: 8080 (desarrollo), 80/443 (producción)
- **Data Science API**: 8000 (opcional)

#### Health Checks

- **Backend**: `GET /actuator/health` (Spring Boot Actuator)
- **Frontend**: Implementado en Nginx/Apache
- **Database**: Conexión automática en startup

### 🔒 Consideraciones de Seguridad

#### Headers de Seguridad

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
```

#### Validaciones Implementadas

- **Input Sanitization**: En todos los endpoints
- **Rate Limiting**: 100 requests/min por IP
- **SQL Injection Prevention**: JPA Criteria API
- **XSS Protection**: Content Security Policy
- **JWT Authentication**: Tokens de sesión con expiración (24h) y refresh (7 días)
- **Password Reset**: Tokens de un solo uso enviados por email con expiración (15 minutos)
- **Password Hashing**: BCrypt con salt automático
- **CORS Protection**: Whitelist de orígenes permitidos

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.
