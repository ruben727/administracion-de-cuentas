const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const resultado = await pool.query('SELECT id, nombre FROM grupos ORDER BY nombre');
  res.json(resultado.rows);
});

module.exports = router;
