const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

module.exports = {
  getLogin: (req, res) => {
    res.render('login', { layout: false });
  },

  postLogin: async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const usuario = await Usuario.findOne({ email });
      if (!usuario) {
        req.flash('error_msg', 'Credenciales incorrectas');
        return res.redirect('/login');
      }

      const isMatch = await usuario.comparePassword(password);
      if (!isMatch) {
        req.flash('error_msg', 'Credenciales incorrectas');
        return res.redirect('/login');
      }

      req.session.user = {
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol
      };

      const redirectPath = usuario.rol === 'admin' ? '/admin/dashboard' : '/odontologo/dashboard';
      res.redirect(redirectPath);

    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error en el servidor');
      res.redirect('/login');
    }
  },

  logout: (req, res) => {
    req.session.destroy();
    res.redirect('/login');
  }
};