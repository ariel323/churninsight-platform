-- Restaurar usuario admin a estado conocido
-- Contraseña: admin123
-- IMPORTANTE: Este script asigna ambos roles (ADMIN y ANALISTA) al usuario admin

-- Limpiar roles del usuario admin (solo por email)
DELETE FROM user_roles 
WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@churninsight.com');

-- Eliminar usuario admin (solo por email)
DELETE FROM users WHERE email = 'admin@churninsight.com';

-- Insertar usuario admin limpio
INSERT INTO users (username, password, email, full_name, active, created_at)
VALUES (
    'admin',
    '$2a$10$XQjH0Z4h5PQvD5nIj6VR9Or7v1xQK4PQXHe1yZtZ5mQO3qYFYqKhK',
    'admin@churninsight.com',
    'Administrador del Sistema',
    true,
    NOW()
);

-- Asignar rol ADMIN al usuario admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@churninsight.com'
AND r.name = 'ADMIN';

-- Asignar rol ANALISTA para compatibilidad
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@churninsight.com'
AND r.name = 'ANALISTA';

-- Mostrar roles asignados
SELECT u.username, u.email, r.name as rol
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@churninsight.com';
