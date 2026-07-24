const express = require('express');
const cors = require('cors');
require('express-async-errors');

const usuariosRouter = require('./routes/usuarios');
const gruposRouter = require('./routes/grupos');
const bitacoraRouter = require('./routes/bitacora');
const loginRouter = require('./routes/login');
const consolaRouter = require('./routes/consola');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/salud', (req, res) => {
  res.json({ estado: 'activo' });
});

app.use('/api/usuarios', usuariosRouter);
app.use('/api/grupos', gruposRouter);
app.use('/api/bitacora', bitacoraRouter);
app.use('/api/login', loginRouter);
app.use('/api/consola', consolaRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const { pool } = require('./db');

async function esperarBaseDeDatos(intentosMax = 20) {
  for (let intento = 1; intento <= intentosMax; intento += 1) {
    try {
      await pool.query('SELECT 1');
      console.log('Conexion con la base de datos establecida');
      return;
    } catch (err) {
      console.log(`Esperando la base de datos (intento ${intento}/${intentosMax})...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error('No fue posible conectar con la base de datos');
}

const PUERTO = process.env.PORT || 4000;

esperarBaseDeDatos().then(() => {
  app.listen(PUERTO, () => {
    console.log(`API de administracion de cuentas escuchando en el puerto ${PUERTO}`);
  });
});
