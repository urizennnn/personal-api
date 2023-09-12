const express = require('express')
const errorHandlerMiddlewareFunction= require('./middleware/error-handler.js')
const app = express()
const PORT = process.env.PORT || 3000;
const cors = require('cors')
const routes = require('./routes/routes.js')
const connectDb = require('./db/connect.js')
require('dotenv').config()
app.use('/api/v1', routes)
app.use(express.json())
app.use(cors({
    origin: "*"
}))
app.use(errorHandlerMiddlewareFunction)

const string = process.env.CONNECTION_STRING




(async (req, res) => {

    try {
        await connectDb(string)
        app.listen(PORT, () => {
            console.log("Server has been hit")
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log("SOmething went wrong")
    }


})()

