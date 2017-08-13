var mongoose = require('mongoose')
  , single_connection
  , env_url = {
    "test": "mongodb://localhost/chatufla_test"
  , "development": "mongodb://localhost/chatufla"
  , "remote": "mongodb://kenneth:2504@ds135963.mlab.com:35963/chatufla"
};

module.exports = () => {
  //var env = process.env.NODE_ENV || "remote"
  //var url = env_url["development"];
 // var url = process.env.MONGODB_URI;
  if (!single_connection) {
    single_connection = mongoose.connect(env_url['development']);
  }
  mongoose.Promise = global.Promise;
  return single_connection;
};
