const mongoose = require('mongoose');

const historialMedicoSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  odontologo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  diagnostico: {
    type: String,
    required: true
  },
  observaciones: {
    type: String
  },
  tratamientoRealizado: {
    type: String
  }
});

module.exports = mongoose.model('HistorialMedico', historialMedicoSchema);