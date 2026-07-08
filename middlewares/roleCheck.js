// middlewares/roleCheck.js

module.exports = (requiredRole) => {
  return (req, res, next) => {
    // Verificar si el usuario está autenticado
    if (!req.session.user) {
      req.flash('error_msg', 'Por favor inicia sesión');
      return res.redirect('/login');
    }

    // Verificar si el usuario tiene el rol requerido
    if (req.session.user.rol !== requiredRole) {
      req.flash('error_msg', 'No tienes permisos para acceder a esta sección');
      
      // Redirigir al dashboard correspondiente según el rol del usuario
      const redirectPath = req.session.user.rol === 'admin' 
        ? '/admin/dashboard' 
        : '/odontologo/dashboard';
      
      return res.redirect(redirectPath);
    }

    // Si todo está bien, continuar
    next();
  };
};