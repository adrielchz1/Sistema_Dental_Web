module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Por favor inicia sesión');
    res.redirect('/login');
  },

  checkRole: (role) => {
    return (req, res, next) => {
      if (req.session.user && req.session.user.rol === role) {
        return next();
      }
      req.flash('error_msg', 'No tienes permiso para acceder a esta sección');
      res.redirect(req.session.user ? '/admin/dashboard' : '/login');
    };
  }
};