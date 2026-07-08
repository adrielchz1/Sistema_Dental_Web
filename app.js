require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');

// Importar modelos
const Usuario = require('./models/Usuario');
const Paciente = require('./models/Paciente');
const HistorialMedico = require('./models/HistorialMedico');
const Tratamiento = require('./models/Tratamiento');
const Pago = require('./models/Pago');

// Importar controladores
const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');
const odontologoController = require('./controllers/odontologoController');

// Inicializar la aplicación
const app = express();

// Configuración de la base de datos
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Configuración de la aplicación
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret-key-dental',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hora
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  next();
});

// Middleware de autenticación
const authMiddleware = require('./middlewares/auth');
const isAuthenticated = authMiddleware.isAuthenticated;
const checkRole = authMiddleware.checkRole;
// Rutas públicas
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', authController.getLogin);
app.post('/login', authController.postLogin);
app.get('/logout', authController.logout);

// Rutas protegidas para administrador
app.get('/admin/dashboard', isAuthenticated, checkRole('admin'), adminController.getDashboard);
app.get('/admin/usuarios', isAuthenticated, checkRole('admin'), adminController.getUsuarios);
app.post('/admin/usuarios', isAuthenticated, checkRole('admin'), adminController.postUsuario);
app.get('/admin/usuarios/editar/:id', isAuthenticated, checkRole('admin'), adminController.getEditarUsuario);
app.post('/admin/usuarios/editar/:id', isAuthenticated, checkRole('admin'), adminController.postEditarUsuario);
app.post('/admin/usuarios/eliminar/:id', isAuthenticated, checkRole('admin'), adminController.eliminarUsuario);

app.get('/admin/pacientes', isAuthenticated, checkRole('admin'), adminController.getPacientes);
app.post('/admin/pacientes', isAuthenticated, checkRole('admin'), adminController.postPaciente);
app.get('/admin/pacientes/editar/:id', isAuthenticated, checkRole('admin'), adminController.getEditarPaciente);
app.post('/admin/pacientes/editar/:id', isAuthenticated, checkRole('admin'), adminController.postEditarPaciente);
app.post('/admin/pacientes/eliminar/:id', isAuthenticated, checkRole('admin'), adminController.eliminarPaciente);

app.get('/admin/historial', isAuthenticated, checkRole('admin'), adminController.getHistorial);
app.post('/admin/historial', isAuthenticated, checkRole('admin'), adminController.postHistorial);

app.get('/admin/tratamientos', isAuthenticated, checkRole('admin'), adminController.getTratamientos);
app.post('/admin/tratamientos', isAuthenticated, checkRole('admin'), adminController.postTratamiento);
app.get('/admin/tratamientos/editar/:id', isAuthenticated, checkRole('admin'), adminController.getEditarTratamiento);
app.post('/admin/tratamientos/editar/:id', isAuthenticated, checkRole('admin'), adminController.postEditarTratamiento);
app.post('/admin/tratamientos/eliminar/:id', isAuthenticated, checkRole('admin'), adminController.eliminarTratamiento);

app.get('/admin/pagos', isAuthenticated, checkRole('admin'), adminController.getPagos);
app.post('/admin/pagos', isAuthenticated, checkRole('admin'), adminController.postPago);

app.get('/admin/citas', isAuthenticated, checkRole('admin'), adminController.getCitas);
app.post('/admin/citas', isAuthenticated, checkRole('admin'), adminController.postCita);
app.post('/admin/citas/eliminar/:id', isAuthenticated, checkRole('admin'), adminController.eliminarCita);

app.get('/admin/reportes', isAuthenticated, checkRole('admin'), adminController.getReportes);
app.get('/admin/reportes/pdf', isAuthenticated, checkRole('admin'), adminController.getReportesPDF);

// Rutas protegidas para odontólogo
app.get('/odontologo/dashboard', isAuthenticated, checkRole('odontologo'), odontologoController.getDashboard);
app.get('/odontologo/pacientes', isAuthenticated, checkRole('odontologo'), odontologoController.getPacientes);
app.get('/odontologo/historial', isAuthenticated, checkRole('odontologo'), odontologoController.getHistorial);
app.post('/odontologo/historial', isAuthenticated, checkRole('odontologo'), odontologoController.postHistorial);
app.get('/odontologo/tratamientos', isAuthenticated, checkRole('odontologo'), odontologoController.getTratamientos);
app.post('/odontologo/tratamientos', isAuthenticated, checkRole('odontologo'), odontologoController.postTratamiento);
app.get('/odontologo/pagos', isAuthenticated, checkRole('odontologo'), odontologoController.getPagos);
app.post('/odontologo/pagos', isAuthenticated, checkRole('odontologo'), odontologoController.postPago);
app.get('/odontologo/citas', isAuthenticated, checkRole('odontologo'), odontologoController.getCitas);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Algo salió mal!' });
});

// Crear usuarios iniciales al iniciar
const createInitialUsers = async () => {
  try {
    const adminExists = await Usuario.findOne({ email: 'admin@clinica.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Usuario.create({
        email: 'admin@clinica.com',
        password: hashedPassword,
        rol: 'admin'
      });
      console.log('Usuario admin creado');
    }

    const odontologoExists = await Usuario.findOne({ email: 'odontologo@clinica.com' });
    if (!odontologoExists) {
      const hashedPassword = await bcrypt.hash('odontologo123', 10);
      await Usuario.create({
        email: 'odontologo@clinica.com',
        password: hashedPassword,
        rol: 'odontologo'
      });
      console.log('Usuario odontólogo creado');
    }
  } catch (error) {
    console.error('Error al crear usuarios iniciales:', error);
  }
};

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  createInitialUsers();
});