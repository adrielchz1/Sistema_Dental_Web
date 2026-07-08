const Paciente = require('../models/Paciente');
const HistorialMedico = require('../models/HistorialMedico');
const Tratamiento = require('../models/Tratamiento');
const Pago = require('../models/Pago');
const Cita = require('../models/Cita');

// Precios de tratamientos
const PRECIOS_TRATAMIENTOS = {
  'Profilaxis': 75,
  'Exodoncia': 80,
  'Curación Simple': 95,
  'Curación Complicada': 130,
  'Endodoncia': 160,
  'Ortodoncia': 5000,
  'Corona': 2500,
  'Porcelana': 3000,
  'Prótesis de Cromo': 4500,
  'Fenestradas de Oro': 6400
};

module.exports = {
  // Dashboard
  getDashboard: async (req, res) => {
    try {
      const odontologoId = req.session.user.id;
      
      // Total de pacientes atendidos
      const totalPacientes = await HistorialMedico.distinct('paciente', { odontologo: odontologoId });
      
      // Total de tratamientos realizados
      const totalTratamientos = await Tratamiento.countDocuments({ odontologo: odontologoId });
      
      // Próximas citas
      const hoy = new Date();
      const proximasCitas = await Cita.find({ 
        odontologo: odontologoId,
        fecha: { $gte: hoy }
      })
      .populate('paciente')
      .sort({ fecha: 1, hora: 1 })
      .limit(5);
      
      res.render('odontologo/dashboard', {
        title: 'Dashboard Odontólogo',
        totalPacientes: totalPacientes.length,
        totalTratamientos,
        proximasCitas
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar dashboard');
      res.redirect('/odontologo/dashboard');
    }
  },

  // Pacientes
  getPacientes: async (req, res) => {
    try {
      const odontologoId = req.session.user.id;
      
      // Obtener IDs de pacientes atendidos por este odontólogo
      const pacientesIds = await HistorialMedico.distinct('paciente', { odontologo: odontologoId });
      
      // Obtener información completa de los pacientes
      const pacientes = await Paciente.find({ _id: { $in: pacientesIds } }).sort({ nombre: 1 });
      
      res.render('odontologo/pacientes', {
        title: 'Mis Pacientes',
        pacientes
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener pacientes');
      res.redirect('/odontologo/dashboard');
    }
  },

  // Historial Médico
  getHistorial: async (req, res) => {
    try {
      const odontologoId = req.session.user.id;
      
      const historiales = await HistorialMedico.find({ odontologo: odontologoId })
        .populate('paciente')
        .sort({ fecha: -1 });
      
      const pacientesIds = await HistorialMedico.distinct('paciente', { odontologo: odontologoId });
      const pacientes = await Paciente.find({ _id: { $in: pacientesIds } }).sort({ nombre: 1 });
      
      res.render('odontologo/historial', {
        title: 'Historial Médico',
        historiales,
        pacientes
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener historial médico');
      res.redirect('/odontologo/dashboard');
    }
  },

  postHistorial: async (req, res) => {
    const { paciente, diagnostico, observaciones, tratamientoRealizado } = req.body;
    const odontologoId = req.session.user.id;
    
    try {
      await HistorialMedico.create({
        paciente,
        odontologo: odontologoId,
        diagnostico,
        observaciones,
        tratamientoRealizado
      });
      
      req.flash('success_msg', 'Registro de historial creado correctamente');
      res.redirect('/odontologo/historial');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al crear registro de historial');
      res.redirect('/odontologo/historial');
    }
  },

  // Tratamientos
  getTratamientos: async (req, res) => {
    try {
      const odontologoId = req.session.user.id;
      
      const tratamientos = await Tratamiento.find({ odontologo: odontologoId })
        .populate('paciente')
        .sort({ fechaInicio: -1 });
      
      const pacientesIds = await HistorialMedico.distinct('paciente', { odontologo: odontologoId });
      const pacientes = await Paciente.find({ _id: { $in: pacientesIds } }).sort({ nombre: 1 });
      
      res.render('odontologo/tratamientos', {
        title: 'Mis Tratamientos',
        tratamientos,
        pacientes,
        precios: PRECIOS_TRATAMIENTOS
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener tratamientos');
      res.redirect('/odontologo/dashboard');
    }
  },

  postTratamiento: async (req, res) => {
    const { paciente, nombreTratamiento, descripcion, costo, estado } = req.body;
    const odontologoId = req.session.user.id;
    
    try {
      await Tratamiento.create({
        paciente,
        odontologo: odontologoId,
        nombreTratamiento,
        descripcion,
        costo,
        estado
      });
      
      req.flash('success_msg', 'Tratamiento creado correctamente');
      res.redirect('/odontologo/tratamientos');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al crear tratamiento');
      res.redirect('/odontologo/tratamientos');
    }
  },

  // Pagos
  getPagos: async (req, res) => {
    try {
      const odontologoId = req.session.user.id;
      
      // Obtener tratamientos del odontólogo
      const tratamientosIds = await Tratamiento.distinct('_id', { odontologo: odontologoId });
      
      // Obtener pagos asociados a esos tratamientos
      const pagos = await Pago.find({ tratamiento: { $in: tratamientosIds } })
        .populate('paciente')
        .populate('tratamiento')
        .sort({ fecha: -1 });
      
      // Obtener pacientes atendidos por el odontólogo
      const pacientesIds = await HistorialMedico.distinct('paciente', { odontologo: odontologoId });
      const pacientes = await Paciente.find({ _id: { $in: pacientesIds } }).sort({ nombre: 1 });
      
      // Obtener tratamientos del odontólogo
      const tratamientos = await Tratamiento.find({ odontologo: odontologoId })
        .sort({ nombreTratamiento: 1 });
      
      res.render('odontologo/pagos', {
        title: 'Pagos de Mis Tratamientos',
        pagos,
        pacientes,
        tratamientos
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener pagos');
      res.redirect('/odontologo/dashboard');
    }
  },

  postPago: async (req, res) => {
    const { paciente, tratamiento, monto, metodoPago, concepto, observaciones } = req.body;
    
    try {
      await Pago.create({
        paciente,
        tratamiento,
        monto,
        metodoPago,
        concepto,
        observaciones
      });
      
      req.flash('success_msg', 'Pago registrado correctamente');
      res.redirect('/odontologo/pagos');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al registrar pago');
      res.redirect('/odontologo/pagos');
    }
  },

  // Citas
  getCitas: async (req, res) => {
    try {
      const odontologoId = req.session.user.id;
      
      const citas = await Cita.find({ odontologo: odontologoId })
        .populate('paciente')
        .sort({ fecha: 1, hora: 1 });
      
      const pacientesIds = await HistorialMedico.distinct('paciente', { odontologo: odontologoId });
      const pacientes = await Paciente.find({ _id: { $in: pacientesIds } }).sort({ nombre: 1 });
      
      res.render('odontologo/citas', {
        title: 'Mis Citas',
        citas,
        pacientes
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener citas');
      res.redirect('/odontologo/dashboard');
    }
  }
};