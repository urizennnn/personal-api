const mongoose = require("mongoose");

mongoose.set("strict", false);
function connectDB(url) {
  return mongoose.connect(url);
}

module.exports = connectDB;
