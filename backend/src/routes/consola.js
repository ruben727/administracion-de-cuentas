const express = require('express');
const { pool, registrarBitacora } = require('../db');

const router = express.Router();

async function buscarUsuario(username) {
  const resultado = await pool.query(
    'SELECT id, username, estado FROM usuarios WHERE username = $1',
    [username]
  );
  return resultado.rows[0] || null;
}

async function comandoEnableUser(username) {
  const usuario = await buscarUsuario(username);
  if (!usuario) return `Error: el usuario "${username}" no existe.`;
  await pool.query(`UPDATE usuarios SET estado = 'habilitado' WHERE id = $1`, [usuario.id]);
  await registrarBitacora(usuario.id, 'habilitar', `Usuario ${username} habilitado desde la consola de comandos`);
  return `Usuario "${username}" habilitado correctamente.`;
}

async function comandoDisableUser(username) {
  const usuario = await buscarUsuario(username);
  if (!usuario) return `Error: el usuario "${username}" no existe.`;
  await pool.query(`UPDATE usuarios SET estado = 'deshabilitado' WHERE id = $1`, [usuario.id]);
  await registrarBitacora(usuario.id, 'deshabilitar', `Usuario ${username} deshabilitado desde la consola de comandos`);
  return `Usuario "${username}" deshabilitado correctamente.`;
}

async function comandoListUsers() {
  const resultado = await pool.query('SELECT username, estado FROM usuarios ORDER BY username');
  if (resultado.rows.length === 0) return 'No hay usuarios registrados.';
  return resultado.rows.map((u) => `${u.username}\t${u.estado}`).join('\n');
}

async function comandoUserInfo(username) {
  const usuario = await buscarUsuario(username);
  if (!usuario) return `Error: el usuario "${username}" no existe.`;
  const detalle = await pool.query(
    `SELECT nombre_completo, estado, fecha_creacion, ultimo_login, requiere_cambio_password
     FROM usuarios WHERE id = $1`,
    [usuario.id]
  );
  const u = detalle.rows[0];
  return [
    `usuario: ${username}`,
    `nombre completo: ${u.nombre_completo}`,
    `estado: ${u.estado}`,
    `fecha de creacion: ${u.fecha_creacion.toISOString()}`,
    `ultimo login: ${u.ultimo_login ? u.ultimo_login.toISOString() : 'nunca'}`,
    `requiere cambio de password: ${u.requiere_cambio_password ? 'si' : 'no'}`
  ].join('\n');
}

const COMANDOS = {
  'enable-user': comandoEnableUser,
  'disable-user': comandoDisableUser,
  'list-users': comandoListUsers,
  'user-info': comandoUserInfo
};

const AYUDA = [
  'Comandos disponibles:',
  '  enable-user <username>   Habilita la cuenta indicada',
  '  disable-user <username>  Deshabilita la cuenta indicada',
  '  user-info <username>     Muestra el detalle de la cuenta',
  '  list-users                Lista todos los usuarios y su estado',
  '  help                      Muestra esta ayuda'
].join('\n');

router.post('/', async (req, res) => {
  const { comando } = req.body;

  if (!comando || !comando.trim()) {
    return res.status(400).json({ error: 'comando es obligatorio' });
  }

  const partes = comando.trim().split(/\s+/);
  const nombreComando = partes[0];
  const argumento = partes[1];

  if (nombreComando === 'help') {
    return res.json({ salida: AYUDA });
  }

  const funcion = COMANDOS[nombreComando];

  if (!funcion) {
    await registrarBitacora(null, 'consola', `Comando no reconocido: "${comando}"`);
    return res.json({ salida: `Comando no reconocido: "${nombreComando}". Escriba "help" para ver la lista de comandos.` });
  }

  if (funcion !== comandoListUsers && !argumento) {
    return res.json({ salida: `Uso: ${nombreComando} <username>` });
  }

  const salida = funcion === comandoListUsers ? await funcion() : await funcion(argumento);

  res.json({ salida });
});

module.exports = router;
