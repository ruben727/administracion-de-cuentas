const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const router = express.Router();

async function registrarIntento(usuarioId, resultado) {
  await pool.query(
    'INSERT INTO intentos_login (usuario_id, resultado) VALUES ($1, $2)',
    [usuarioId, resultado]
  );
}

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username y password son obligatorios' });
  }

  const resultado = await pool.query(
    `SELECT id, nombre_completo, username, password_hash, estado, requiere_cambio_password
     FROM usuarios WHERE username = $1`,
    [username]
  );

  if (resultado.rows.length === 0) {
    await registrarIntento(null, 'rechazado_usuario_inexistente');
    return res.json({
      acceso: false,
      motivo: `No existe ninguna cuenta con el nombre de usuario "${username}".`
    });
  }

  const usuario = resultado.rows[0];

  if (usuario.estado === 'deshabilitado') {
    await registrarIntento(usuario.id, 'rechazado_deshabilitado');
    return res.json({
      acceso: false,
      motivo: `La cuenta "${usuario.username}" esta deshabilitada. El acceso fue rechazado.`
    });
  }

  const passwordValida = bcrypt.compareSync(password, usuario.password_hash);

  if (!passwordValida) {
    await registrarIntento(usuario.id, 'rechazado_password_incorrecta');
    return res.json({
      acceso: false,
      motivo: 'La contrasena ingresada es incorrecta.'
    });
  }

  await pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1', [usuario.id]);
  await registrarIntento(usuario.id, 'exitoso');

  res.json({
    acceso: true,
    motivo: 'Acceso concedido.',
    nombre_completo: usuario.nombre_completo,
    requiere_cambio_password: usuario.requiere_cambio_password
  });
});

module.exports = router;
