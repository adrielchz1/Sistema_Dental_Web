module.exports = (err, req, res, next) => {
  console.error(err.stack);
  
  // Definir mensaje de error
  let message = 'Ocurrió un error en el servidor';
  if (err.message) {
    message = err.message;
  }
  
  // Enviar respuesta de error
  if (req.accepts('html')) {
    req.flash('error_msg', message);
    res.redirect('back');
  } else if (req.accepts('json')) {
    res.status(500).json({ error: message });
  } else {
    res.type('txt').send(message);
  }
};