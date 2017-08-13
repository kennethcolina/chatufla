module.exports = (app) => {
  var main = app.controllers.main;
  app.get('/main', main.index);
};
