const mongoose = require("mongoose");

mongoose.set("strict", false);
function connectDB(url) {
  return mongoose.connect(url,{
    serverSelectionTimeoutMS:5000
  });
}

module.exports = connectDB;
