const Usuario = require('../models/Usuario');
const Paciente = require('../models/Paciente');
const HistorialMedico = require('../models/HistorialMedico');
const Tratamiento = require('../models/Tratamiento');
const Pago = require('../models/Pago');
const { jsPDF } = require('jspdf');

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
      const totalPacientes = await Paciente.countDocuments();
      const totalTratamientos = await Tratamiento.countDocuments();
      const totalPagos = await Pago.countDocuments();
      
      // Últimos 5 pacientes
      const ultimosPacientes = await Paciente.find()
        .sort({ createdAt: -1 })
        .limit(5);
      
      // Últimos 5 pagos
      const ultimosPagos = await Pago.find()
        .populate('paciente')
        .sort({ fecha: -1 })
        .limit(5);

      res.render('dashboard', {
        title: 'Dashboard',
        totalPacientes,
        totalTratamientos,
        totalPagos,
        ultimosPacientes,
        ultimosPagos
      });
    } catch (error) {
      console.error(error);
      res.redirect('/admin/dashboard');
    }
  },

  // Usuarios
  getUsuarios: async (req, res) => {
    try {
      const usuarios = await Usuario.find();
      res.render('usuarios', { title: 'Usuarios', usuarios });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener usuarios');
      res.redirect('/admin/dashboard');
    }
  },

  postUsuario: async (req, res) => {
    const { email, password, rol } = req.body;
    
    try {
      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        req.flash('error_msg', 'El email ya está registrado');
        return res.redirect('/admin/usuarios');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await Usuario.create({ email, password: hashedPassword, rol });
      
      req.flash('success_msg', 'Usuario creado correctamente');
      res.redirect('/admin/usuarios');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al crear usuario');
      res.redirect('/admin/usuarios');
    }
  },

  getEditarUsuario: async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) {
        req.flash('error_msg', 'Usuario no encontrado');
        return res.redirect('/admin/usuarios');
      }
      
      res.render('editarUsuario', { title: 'Editar Usuario', usuario });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener usuario');
      res.redirect('/admin/usuarios');
    }
  },

  postEditarUsuario: async (req, res) => {
    const { email, rol } = req.body;
    
    try {
      await Usuario.findByIdAndUpdate(req.params.id, { email, rol });
      req.flash('success_msg', 'Usuario actualizado correctamente');
      res.redirect('/admin/usuarios');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al actualizar usuario');
      res.redirect('/admin/usuarios');
    }
  },

  eliminarUsuario: async (req, res) => {
    try {
      await Usuario.findByIdAndDelete(req.params.id);
      req.flash('success_msg', 'Usuario eliminado correctamente');
      res.redirect('/admin/usuarios');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al eliminar usuario');
      res.redirect('/admin/usuarios');
    }
  },

  // Pacientes
  getPacientes: async (req, res) => {
    try {
      const pacientes = await Paciente.find().sort({ nombre: 1 });
      res.render('pacientes', { title: 'Pacientes', pacientes });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener pacientes');
      res.redirect('/admin/dashboard');
    }
  },

  postPaciente: async (req, res) => {
    const { nombre, apellido, telefono, email, direccion, fechaNacimiento, sexo } = req.body;
    
    try {
      await Paciente.create({
        nombre,
        apellido,
        telefono,
        email,
        direccion,
        fechaNacimiento,
        sexo
      });
      
      req.flash('success_msg', 'Paciente creado correctamente');
      res.redirect('/admin/pacientes');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al crear paciente');
      res.redirect('/admin/pacientes');
    }
  },

  getEditarPaciente: async (req, res) => {
    try {
      const paciente = await Paciente.findById(req.params.id);
      if (!paciente) {
        req.flash('error_msg', 'Paciente no encontrado');
        return res.redirect('/admin/pacientes');
      }
      
      res.render('editarPaciente', { title: 'Editar Paciente', paciente });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener paciente');
      res.redirect('/admin/pacientes');
    }
  },

  postEditarPaciente: async (req, res) => {
    const { nombre, apellido, telefono, email, direccion, fechaNacimiento, sexo } = req.body;
    
    try {
      await Paciente.findByIdAndUpdate(req.params.id, {
        nombre,
        apellido,
        telefono,
        email,
        direccion,
        fechaNacimiento,
        sexo
      });
      
      req.flash('success_msg', 'Paciente actualizado correctamente');
      res.redirect('/admin/pacientes');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al actualizar paciente');
      res.redirect('/admin/pacientes');
    }
  },

  eliminarPaciente: async (req, res) => {
    try {
      await Paciente.findByIdAndDelete(req.params.id);
      req.flash('success_msg', 'Paciente eliminado correctamente');
      res.redirect('/admin/pacientes');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al eliminar paciente');
      res.redirect('/admin/pacientes');
    }
  },

  // Historial Médico
  getHistorial: async (req, res) => {
    try {
      const historiales = await HistorialMedico.find()
        .populate('paciente')
        .populate('odontologo')
        .sort({ fecha: -1 });
      
      const pacientes = await Paciente.find().sort({ nombre: 1 });
      const odontologos = await Usuario.find({ rol: 'odontologo' }).sort({ email: 1 });
      
      res.render('historial', {
        title: 'Historial Médico',
        historiales,
        pacientes,
        odontologos
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener historial médico');
      res.redirect('/admin/dashboard');
    }
  },

  postHistorial: async (req, res) => {
    const { paciente, odontologo, diagnostico, observaciones, tratamientoRealizado } = req.body;
    
    try {
      await HistorialMedico.create({
        paciente,
        odontologo,
        diagnostico,
        observaciones,
        tratamientoRealizado
      });
      
      req.flash('success_msg', 'Registro de historial creado correctamente');
      res.redirect('/admin/historial');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al crear registro de historial');
      res.redirect('/admin/historial');
    }
  },

  // Tratamientos
  getTratamientos: async (req, res) => {
    try {
      const tratamientos = await Tratamiento.find()
        .populate('paciente')
        .populate('odontologo')
        .sort({ fechaInicio: -1 });
      
      const pacientes = await Paciente.find().sort({ nombre: 1 });
      const odontologos = await Usuario.find({ rol: 'odontologo' }).sort({ email: 1 });
      
      res.render('tratamientos', {
        title: 'Tratamientos',
        tratamientos,
        pacientes,
        odontologos,
        precios: PRECIOS_TRATAMIENTOS
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener tratamientos');
      res.redirect('/admin/dashboard');
    }
  },

  postTratamiento: async (req, res) => {
    const { paciente, odontologo, nombreTratamiento, descripcion, costo, estado } = req.body;
    
    try {
      await Tratamiento.create({
        paciente,
        odontologo,
        nombreTratamiento,
        descripcion,
        costo,
        estado
      });
      
      req.flash('success_msg', 'Tratamiento creado correctamente');
      res.redirect('/admin/tratamientos');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al crear tratamiento');
      res.redirect('/admin/tratamientos');
    }
  },

  getEditarTratamiento: async (req, res) => {
    try {
      const tratamiento = await Tratamiento.findById(req.params.id)
        .populate('paciente')
        .populate('odontologo');
      
      if (!tratamiento) {
        req.flash('error_msg', 'Tratamiento no encontrado');
        return res.redirect('/admin/tratamientos');
      }
      
      const pacientes = await Paciente.find().sort({ nombre: 1 });
      const odontologos = await Usuario.find({ rol: 'odontologo' }).sort({ email: 1 });
      
      res.render('editarTratamiento', {
        title: 'Editar Tratamiento',
        tratamiento,
        pacientes,
        odontologos,
        precios: PRECIOS_TRATAMIENTOS
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener tratamiento');
      res.redirect('/admin/tratamientos');
    }
  },

  postEditarTratamiento: async (req, res) => {
    const { paciente, odontologo, nombreTratamiento, descripcion, costo, estado } = req.body;
    
    try {
      await Tratamiento.findByIdAndUpdate(req.params.id, {
        paciente,
        odontologo,
        nombreTratamiento,
        descripcion,
        costo,
        estado
      });
      
      req.flash('success_msg', 'Tratamiento actualizado correctamente');
      res.redirect('/admin/tratamientos');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al actualizar tratamiento');
      res.redirect('/admin/tratamientos');
    }
  },

  eliminarTratamiento: async (req, res) => {
    try {
      await Tratamiento.findByIdAndDelete(req.params.id);
      req.flash('success_msg', 'Tratamiento eliminado correctamente');
      res.redirect('/admin/tratamientos');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al eliminar tratamiento');
      res.redirect('/admin/tratamientos');
    }
  },

  // Pagos
  getPagos: async (req, res) => {
    try {
      const pagos = await Pago.find()
        .populate('paciente')
        .populate('tratamiento')
        .sort({ fecha: -1 });
      
      const pacientes = await Paciente.find().sort({ nombre: 1 });
      const tratamientos = await Tratamiento.find().sort({ nombreTratamiento: 1 });
      
      res.render('pagos', {
        title: 'Pagos',
        pagos,
        pacientes,
        tratamientos
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener pagos');
      res.redirect('/admin/dashboard');
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
      res.redirect('/admin/pagos');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al registrar pago');
      res.redirect('/admin/pagos');
    }
  },

  // Citas
  getCitas: async (req, res) => {
    try {
      const citas = await Cita.find()
        .populate('paciente')
        .populate('odontologo')
        .sort({ fecha: 1, hora: 1 });
      
      const pacientes = await Paciente.find().sort({ nombre: 1 });
      const odontologos = await Usuario.find({ rol: 'odontologo' }).sort({ email: 1 });
      
      res.render('citas', {
        title: 'Citas',
        citas,
        pacientes,
        odontologos
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener citas');
      res.redirect('/admin/dashboard');
    }
  },

  postCita: async (req, res) => {
    const { paciente, odontologo, fecha, hora, motivo } = req.body;
    
    try {
      await Cita.create({
        paciente,
        odontologo,
        fecha,
        hora,
        motivo
      });
      
      req.flash('success_msg', 'Cita programada correctamente');
      res.redirect('/admin/citas');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al programar cita');
      res.redirect('/admin/citas');
    }
  },

  eliminarCita: async (req, res) => {
    try {
      await Cita.findByIdAndDelete(req.params.id);
      req.flash('success_msg', 'Cita eliminada correctamente');
      res.redirect('/admin/citas');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al eliminar cita');
      res.redirect('/admin/citas');
    }
  },

  // Reportes
  getReportes: async (req, res) => {
    try {
      // Estadísticas básicas
      const totalPacientes = await Paciente.countDocuments();
      const totalTratamientos = await Tratamiento.countDocuments();
      const totalPagos = await Pago.countDocuments();
      const totalIngresos = (await Pago.aggregate([
        { $group: { _id: null, total: { $sum: "$monto" } } }
      ]))[0]?.total || 0;
      
      // Tratamientos más comunes
      const tratamientosComunes = await Tratamiento.aggregate([
        { $group: { _id: "$nombreTratamiento", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      
      // Ingresos por mes
      const ingresosPorMes = await Pago.aggregate([
        { 
          $group: { 
            _id: { 
              year: { $year: "$fecha" },
              month: { $month: "$fecha" }
            }, 
            total: { $sum: "$monto" } 
          } 
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 }
      ]);
      
      res.render('reportes', {
        title: 'Reportes',
        totalPacientes,
        totalTratamientos,
        totalPagos,
        totalIngresos,
        tratamientosComunes,
        ingresosPorMes
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al generar reportes');
      res.redirect('/admin/dashboard');
    }
  },

  getReportesPDF: async (req, res) => {
    try {
      // Obtener datos para el reporte
      const totalPacientes = await Paciente.countDocuments();
      const totalTratamientos = await Tratamiento.countDocuments();
      const totalPagos = await Pago.countDocuments();
      const totalIngresos = (await Pago.aggregate([
        { $group: { _id: null, total: { $sum: "$monto" } } }
      ]))[0]?.total || 0;
      
      // Crear PDF
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text('Reporte de la Clínica Dental', 105, 20, { align: 'center' });
      
      // Fecha
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Estadísticas
      doc.setFontSize(14);
      doc.text('Estadísticas Generales', 14, 40);
      
      doc.setFontSize(12);
      doc.text(`Total de Pacientes: ${totalPacientes}`, 14, 50);
      doc.text(`Total de Tratamientos: ${totalTratamientos}`, 14, 60);
      doc.text(`Total de Pagos: ${totalPagos}`, 14, 70);
      doc.text(`Ingresos Totales: ${totalIngresos.toFixed(2)} BOB`, 14, 80);
      
      // Enviar PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-clinica.pdf');
      res.send(doc.output());
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al generar PDF');
      res.redirect('/admin/reportes');
    }
  }
};