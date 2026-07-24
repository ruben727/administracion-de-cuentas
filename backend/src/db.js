const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'administracion_cuentas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function registrarBitacora(usuarioId, accion, detalle) {
  await pool.query(
    'INSERT INTO bitacora (usuario_id, accion, detalle) VALUES ($1, $2, $3)',
    [usuarioId, accion, detalle]
  );
}

module.exports = { pool, registrarBitacora };
