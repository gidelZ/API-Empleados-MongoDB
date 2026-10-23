
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(error => console.error('Error de MongoDB:', error.message));

// Modelo de empleados
const empleadoSchema = new mongoose.Schema({
  Clave: { type: Number, required: true, unique: true },
  Nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  fechadenacimiento: { type: Date, required: true },
  sexo: { type: mongoose.Schema.Types.Mixed, required: true },
  tipodesangre: { type: String, required: true }
}, { versionKey: false });

const Empleado = mongoose.model(
  'Empleado',
  empleadoSchema,
  'Empleados'
);

// GET: consultar todos los empleados
app.get('/api/empleados', async (req, res) => {
  try {
    res.json(await Empleado.find());
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// GET: consultar por clave
app.get('/api/empleados/:clave', async (req, res) => {
  try {
    const empleado = await Empleado.findOne({
      Clave: Number(req.params.clave)
    });

    if (!empleado) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    res.json(empleado);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// POST: registrar empleado
app.post('/api/empleados', async (req, res) => {
  try {
    const empleado = new Empleado(req.body);
    res.status(201).json(await empleado.save());
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      mensaje: error.code === 11000
        ? 'La clave ya existe'
        : error.message
    });
  }
});

// PUT: actualizar empleado
app.put('/api/empleados/:clave', async (req, res) => {
  try {
    const clave = Number(req.params.clave);
    const { Clave, ...datos } = req.body;

    const empleado = await Empleado.findOneAndUpdate(
      { Clave: clave },
      { $set: datos },
      { new: true, runValidators: true }
    );

    if (!empleado) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    res.json(empleado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// DELETE: eliminar empleado
app.delete('/api/empleados/:clave', async (req, res) => {
  try {
    const empleado = await Empleado.findOneAndDelete({
      Clave: Number(req.params.clave)
    });

    if (!empleado) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    res.json({ mensaje: 'Empleado eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Empleados funcionando' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
