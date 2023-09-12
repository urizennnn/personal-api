const mongoose = require('mongoose')
require('dotenv')
mongoose.set("strictQuery", false)
function connectDB (url){
    return mongoose.connect(url)
}

module.exports = connectDB