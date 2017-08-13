module.exports = (app) => {
  var path = require('path');

  var MainController = {
    index: (req, res) => {
      res.sendFile(path.join(__dirname + '/../views/main.html'));
    }
  };
  return MainController;
};
