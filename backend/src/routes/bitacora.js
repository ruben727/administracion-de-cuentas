const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const resultado = await pool.query(
    `SELECT b.id, b.accion, b.detalle, b.fecha, u.username
     FROM bitacora b
     LEFT JOIN usuarios u ON u.id = b.usuario_id
     ORDER BY b.fecha DESC, b.id DESC`
  );
  res.json(resultado.rows);
});

module.exports = router;
