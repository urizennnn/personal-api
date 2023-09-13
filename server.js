const express = require('express');
const errorHandlerMiddlewareFunction = require('./middleware/error-handler.js');
const app = express();
const PORT = process.env.PORT || 3090;
const cors = require('cors');
const morgan = require('morgan')
const routes = require('./routes/routes.js');
const connectDb = require('./db/connect.js');
require('dotenv').config();

app.use(cors({
    origin: "*"
}));
app.use(express.json());
app.use(morgan('dev'))
app.use('/api/v1', routes);
app.use(errorHandlerMiddlewareFunction);

const string = process.env.CONNECTION_STRING || undefined;

(async () => {
    try {
        await connectDb(string).then(res=>{
            console.log("Connected")
        });
        app.listen(PORT, () => {
            console.log("Server is running on http://localhost:" + PORT);
        });
    } catch (error) {
        console.error("Something went wrong:", error);
    }
})();
