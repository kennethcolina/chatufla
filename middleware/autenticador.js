module.exports = function(req, res, next) {
  console.log("AUTENTICAR: ", req.session.usuario);
  if(!req.session.usuario) {
    return res.redirect('/');
  }
  return next();
};
