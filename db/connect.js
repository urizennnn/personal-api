const mongoose = require('mongoose')
require('dotenv')
mongoose.set("strict", false)
function connectDB (url){
    return mongoose.connect(url)
}

module.exports = connectDB