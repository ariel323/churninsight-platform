-- ============================================================================
-- Migración V1: Schema Inicial con RBAC
-- ============================================================================
-- Fecha: Enero 2026
-- Descripción: Crea estructura completa de base de datos con sistema de roles
-- ============================================================================

-- 1. CREAR TABLAS PRINCIPALES
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ANALISTA',
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prediction_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    churn_probability DOUBLE NOT NULL,
    prediction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    num_of_products INTEGER NOT NULL,
    age_risk DOUBLE NOT NULL,
    inactivo4070 DOUBLE NOT NULL,
    products_risk_flag DOUBLE NOT NULL,
    country_risk_flag DOUBLE NOT NULL,
    balance DOUBLE PRECISION NULL,
    estimated_salary DOUBLE PRECISION NULL,
    country VARCHAR(50) NULL,
    tenure INTEGER NULL,
    is_active_member BOOLEAN NULL,
    INDEX idx_username (username),
    INDEX idx_customer_id (customer_id),
    INDEX idx_prediction_date (prediction_date),
    INDEX idx_churn_probability (churn_probability),
    INDEX idx_country (country),
    INDEX idx_customer_date (customer_id, prediction_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. INSERTAR ROLES
-- ============================================================================

INSERT INTO roles (name, description) VALUES 
    ('ANALISTA', 'Usuario analista estándar que puede realizar predicciones y ver su historial'),
    ('ADMIN', 'Administrador con acceso completo al sistema y todos los datos')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 3. CREAR USUARIO ADMINISTRADOR
-- ============================================================================

INSERT INTO users (username, password, email, full_name, role, active, created_at)
VALUES (
    'admin',
    '$2a$10$XQjH0Z4h5PQvD5nIj6VR9Or7v1xQK4PQXHe1yZtZ5mQO3qYFYqKhK',
    'admin@churninsight.com',
    'Administrador del Sistema',
    'ADMIN',
    true,
    NOW()
)
ON DUPLICATE KEY UPDATE password = VALUES(password);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.username = 'admin' AND r.name = 'ADMIN'
ON DUPLICATE KEY UPDATE user_id = user_id;

-- 4. ASIGNAR ROL ANALISTA A USUARIOS EXISTENTES
-- ============================================================================

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE r.name = 'ANALISTA'
  AND u.username != 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
  );
