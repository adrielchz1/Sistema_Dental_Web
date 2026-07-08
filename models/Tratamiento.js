const mongoose = require('mongoose');

const tratamientoSchema = new mongoose.Schema({
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
  nombreTratamiento: {
    type: String,
    required: true
  },
  fechaInicio: {
    type: Date,
    default: Date.now
  },
  fechaFin: {
    type: Date
  },
  descripcion: {
    type: String,
    required: true
  },
  costo: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'finalizado'],
    default: 'pendiente'
  }
});

module.exports = mongoose.model('Tratamiento', tratamientoSchema);