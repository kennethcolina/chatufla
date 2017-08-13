module.exports = (app) => {
  var home = app.controllers.home;
  app.get('/', home.index);
  app.post('/entrar', home.login);
  app.get('/cadastro', home.cadastro);
  app.post('/cadastrar', home.cadastrar)
  //app.get('/sair', home.logout);
};
