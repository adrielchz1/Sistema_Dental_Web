const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  telefono: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  direccion: {
    type: String,
    trim: true
  },
  fechaNacimiento: {
    type: Date,
    required: true
  },
  sexo: {
    type: String,
    enum: ['masculino', 'femenino', 'otro'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Paciente', pacienteSchema);