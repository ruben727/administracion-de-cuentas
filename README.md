# Administracion de Cuentas de Usuario

Aplicacion web para practicar la administracion de cuentas de usuario de un
sistema operativo: creacion, habilitacion, deshabilitacion y verificacion de
estados de acceso. Corre completamente en Docker mediante `docker-compose`.

## Arquitectura

| Servicio  | Tecnologia                          | Puerto expuesto |
|-----------|--------------------------------------|-----------------|
| db        | PostgreSQL 16 (volumen persistente)  | 5432            |
| backend   | Node.js + Express (API REST)         | 4000            |
| frontend  | Angular (compilado) servido con Nginx| 8080            |

El frontend sirve los archivos estaticos con Nginx y reenvia (proxy) todas
las peticiones a `/api/...` hacia el contenedor `backend`, por lo que la
interfaz nunca necesita conocer una URL de backend distinta.

## Como levantar el sistema

Requisitos: Docker y Docker Compose.

```bash
docker compose up --build
```

Esto crea tres contenedores (`db`, `backend`, `frontend`). La base de datos
se inicializa automaticamente ejecutando `db/init.sql`, que crea las tablas
y los usuarios semilla.

Cuando termine de levantar:

- Frontend (interfaz web): http://localhost:8080
- API backend: http://localhost:4000/api
- PostgreSQL: localhost:5432 (usuario `postgres`, password `postgres`, base `administracion_cuentas`)

Para detener todo:

```bash
docker compose down
```

Para detener y borrar tambien los datos de la base de datos (reiniciar los
usuarios semilla desde cero):

```bash
docker compose down -v
```

## Usuarios semilla

Se crean automaticamente tres usuarios, todos con estado `habilitado` y
`requiere_cambio_password = true`:

| Usuario     | Nombre completo   | Grupo     | Contrasena  |
|-------------|-------------------|-----------|-------------|
| `alumno1`   | Alumno Uno        | alumnos   | `Alumno#2026` |
| `alumno2`   | Alumno Dos        | alumnos   | `Alumno#2026` |
| `invitado`  | Usuario Invitado  | invitados | `Alumno#2026` |

## Guia de la practica (pasos sugeridos para tomar evidencia)

1. **Levantar el sistema**: ejecutar `docker compose up --build` y esperar a
   que los tres servicios queden arriba.
2. **Ver la tabla principal**: abrir http://localhost:8080. La tabla del
   panel principal debe mostrar los tres usuarios semilla con estado
   "Habilitado = Si".
3. **Crear un nuevo usuario**: en el panel principal, clic en
   "Crear nuevo usuario", completar el formulario (nombre completo, usuario,
   contrasena, grupo) y guardar. El nuevo usuario debe aparecer en la tabla.
4. **Deshabilitar una cuenta**: hacer clic en "Deshabilitar" junto a un
   usuario (por ejemplo `alumno1`), confirmar la accion. La columna
   "Habilitado" debe cambiar a "No".
5. **Verificar el rechazo de acceso**: ir a "Simulador de acceso", iniciar
   sesion con `alumno1` y la contrasena `Alumno#2026`. El sistema debe
   mostrar "Acceso rechazado" indicando que la cuenta esta deshabilitada.
6. **Habilitar de nuevo la cuenta**: volver al panel principal (o a la vista
   de detalle del usuario) y hacer clic en "Habilitar". Verificar en el
   simulador de acceso que ahora el inicio de sesion es aceptado y que el
   campo "ultimo inicio de sesion" se actualiza en la vista de detalle.
7. **Ver la bitacora**: ir a "Bitacora" y confirmar que aparecen registradas
   todas las acciones anteriores (crear, deshabilitar, habilitar) con fecha
   y detalle.
8. **Probar la consola de comandos**: ir a "Consola de comandos" y ejecutar,
   por ejemplo:
   ```
   list-users
   disable-user alumno2
   user-info alumno2
   enable-user alumno2
   ```
   Cada comando debe mostrar su salida en pantalla y quedar tambien
   registrado en la bitacora.

## Modelo de datos

- **usuarios**: `id, nombre_completo, username (unico), password_hash, estado
  ('habilitado'|'deshabilitado'), fecha_creacion, ultimo_login,
  requiere_cambio_password`
- **grupos**: `id, nombre`
- **usuario_grupo**: relacion muchos a muchos entre usuarios y grupos
- **bitacora**: `id, usuario_id, accion, detalle, fecha` — historial de toda
  accion administrativa
- **intentos_login**: `id, usuario_id, resultado, fecha` — historial de cada
  intento de inicio de sesion, exitoso o rechazado

Las contrasenas se almacenan siempre con hash bcrypt (nunca en texto plano):
las de los usuarios semilla se generan con la funcion `crypt()` de la
extension `pgcrypto` de PostgreSQL, y las de los usuarios creados desde la
aplicacion se generan con `bcryptjs` en el backend. Ambos formatos son
compatibles entre si.

## Endpoints de la API

Base URL: `/api`

| Metodo | Ruta                          | Descripcion                                             |
|--------|-------------------------------|-----------------------------------------------------------|
| GET    | `/salud`                      | Verifica que la API este activa                          |
| GET    | `/usuarios`                   | Lista todos los usuarios con su estado y grupos           |
| POST   | `/usuarios`                   | Crea un usuario (`nombre_completo, username, password, grupo`) |
| GET    | `/usuarios/:id`                | Detalle de un usuario (incluye lista de grupos)           |
| POST   | `/usuarios/:id/habilitar`      | Habilita la cuenta indicada                                |
| POST   | `/usuarios/:id/deshabilitar`   | Deshabilita la cuenta indicada                             |
| GET    | `/grupos`                      | Lista los grupos existentes                                |
| GET    | `/bitacora`                    | Lista el historial completo de acciones administrativas    |
| POST   | `/login`                       | Simula un inicio de sesion (`username, password`)          |
| POST   | `/consola`                     | Ejecuta un comando de consola (`comando`, texto libre)     |

Comandos disponibles en `/consola`: `enable-user <username>`,
`disable-user <username>`, `user-info <username>`, `list-users`, `help`.

## Desarrollo local sin Docker (opcional)

Backend:
```bash
cd backend
npm install
npm start
```

Frontend:
```bash
cd frontend
npm install
npm start
```

En este modo se necesita una instancia propia de PostgreSQL 16 accesible en
`localhost:5432` (o configurar `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
`DB_PASSWORD`) e inicializada con `db/init.sql`.
