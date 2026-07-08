const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  tratamiento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tratamiento'
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  monto: {
    type: Number,
    required: true
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia'],
    required: true
  },
  concepto: {
    type: String,
    required: true
  },
  observaciones: {
    type: String
  }
});

module.exports = mongoose.model('Pago', pagoSchema);