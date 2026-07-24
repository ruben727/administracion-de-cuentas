const express = require('express');
const bcrypt = require('bcryptjs');
const { pool, registrarBitacora } = require('../db');

const router = express.Router();

const SELECT_LISTA = `
  SELECT u.id, u.nombre_completo, u.username, u.estado, u.requiere_cambio_password,
         u.fecha_creacion, u.ultimo_login,
         COALESCE(string_agg(g.nombre, ', ' ORDER BY g.nombre), '') AS grupos
  FROM usuarios u
  LEFT JOIN usuario_grupo ug ON ug.usuario_id = u.id
  LEFT JOIN grupos g ON g.id = ug.grupo_id
  GROUP BY u.id
  ORDER BY u.id
`;

router.get('/', async (req, res) => {
  const resultado = await pool.query(SELECT_LISTA);
  res.json(resultado.rows);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const usuario = await pool.query(
    `SELECT id, nombre_completo, username, estado, requiere_cambio_password, fecha_creacion, ultimo_login
     FROM usuarios WHERE id = $1`,
    [id]
  );
  if (usuario.rows.length === 0) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  const grupos = await pool.query(
    `SELECT g.id, g.nombre FROM usuario_grupo ug
     JOIN grupos g ON g.id = ug.grupo_id
     WHERE ug.usuario_id = $1 ORDER BY g.nombre`,
    [id]
  );
  res.json({ ...usuario.rows[0], grupos: grupos.rows });
});

router.post('/', async (req, res) => {
  const { nombre_completo, username, password, grupo } = req.body;

  if (!nombre_completo || !username || !password) {
    return res.status(400).json({ error: 'nombre_completo, username y password son obligatorios' });
  }

  const existente = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
  if (existente.rows.length > 0) {
    return res.status(409).json({ error: 'El nombre de usuario ya existe' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const nuevo = await pool.query(
    `INSERT INTO usuarios (nombre_completo, username, password_hash, estado, requiere_cambio_password)
     VALUES ($1, $2, $3, 'habilitado', true)
     RETURNING id, nombre_completo, username, estado, requiere_cambio_password, fecha_creacion, ultimo_login`,
    [nombre_completo, username, passwordHash]
  );
  const usuario = nuevo.rows[0];

  if (grupo) {
    let grupoRes = await pool.query('SELECT id FROM grupos WHERE nombre = $1', [grupo]);
    if (grupoRes.rows.length === 0) {
      grupoRes = await pool.query('INSERT INTO grupos (nombre) VALUES ($1) RETURNING id', [grupo]);
    }
    await pool.query(
      'INSERT INTO usuario_grupo (usuario_id, grupo_id) VALUES ($1, $2)',
      [usuario.id, grupoRes.rows[0].id]
    );
  }

  await registrarBitacora(usuario.id, 'crear', `Usuario ${username} creado con grupo "${grupo || 'sin grupo'}"`);

  res.status(201).json(usuario);
});

router.post('/:id/habilitar', async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query(
    `UPDATE usuarios SET estado = 'habilitado' WHERE id = $1 RETURNING username`,
    [id]
  );
  if (resultado.rows.length === 0) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  await registrarBitacora(id, 'habilitar', `Usuario ${resultado.rows[0].username} habilitado`);
  res.json({ ok: true });
});

router.post('/:id/deshabilitar', async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query(
    `UPDATE usuarios SET estado = 'deshabilitado' WHERE id = $1 RETURNING username`,
    [id]
  );
  if (resultado.rows.length === 0) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  await registrarBitacora(id, 'deshabilitar', `Usuario ${resultado.rows[0].username} deshabilitado`);
  res.json({ ok: true });
});

module.exports = router;
