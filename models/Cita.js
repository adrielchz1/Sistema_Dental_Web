const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
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
    required: true
  },
  hora: {
    type: String,
    required: true
  },
  motivo: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'completada', 'cancelada'],
    default: 'pendiente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cita', citaSchema);