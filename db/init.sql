-- Script de inicializacion de la base de datos
-- Se ejecuta automaticamente al crear el contenedor de PostgreSQL
-- (montado en /docker-entrypoint-initdb.d dentro del contenedor)

-- Extension necesaria para generar hashes bcrypt directamente en SQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE estado_usuario AS ENUM ('habilitado', 'deshabilitado');

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    estado estado_usuario NOT NULL DEFAULT 'habilitado',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    ultimo_login TIMESTAMP,
    requiere_cambio_password BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE grupos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE usuario_grupo (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    grupo_id INTEGER NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, grupo_id)
);

CREATE TABLE bitacora (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(50) NOT NULL,
    detalle TEXT,
    fecha TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE intentos_login (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    resultado VARCHAR(30) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Datos semilla
-- Contraseña compartida por los tres usuarios semilla: Alumno#2026
-- (se documenta en el README para poder probar el simulador de inicio de sesion)

INSERT INTO grupos (nombre) VALUES ('alumnos'), ('invitados');

INSERT INTO usuarios (nombre_completo, username, password_hash, estado, requiere_cambio_password)
VALUES
    ('Alumno Uno', 'alumno1', crypt('Alumno#2026', gen_salt('bf', 10)), 'habilitado', true),
    ('Alumno Dos', 'alumno2', crypt('Alumno#2026', gen_salt('bf', 10)), 'habilitado', true),
    ('Usuario Invitado', 'invitado', crypt('Alumno#2026', gen_salt('bf', 10)), 'habilitado', true);

INSERT INTO usuario_grupo (usuario_id, grupo_id)
SELECT u.id, g.id FROM usuarios u, grupos g
WHERE (u.username = 'alumno1' AND g.nombre = 'alumnos')
   OR (u.username = 'alumno2' AND g.nombre = 'alumnos')
   OR (u.username = 'invitado' AND g.nombre = 'invitados');

INSERT INTO bitacora (usuario_id, accion, detalle)
SELECT id, 'crear', 'Usuario creado por script de inicializacion (dato semilla)'
FROM usuarios;
