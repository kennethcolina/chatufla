module.exports = (app) => {
  //var autenticar = require('./../middleware/autenticador')
    , main = app.controllers.main;
    app.get('/main', main.index);
    //app.get('/main', autenticar, main.index);
};
