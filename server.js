require("dotenv").config();
require("express-async-errors");
const cors = require("cors");
const morgan = require('morgan');
const express = require("express");
const app = express();

const passwordRouter = require("./routes/password.js");
const userRouter = require("./routes/user.js");
const connectDb = require("./db/connect.js");
const cookie = require('cookie-parser')
const xssCLean = require('xss-clean')
const helmet = require('helmet')
const rateLimiter = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const errorHandlerMiddleware = require("./middleware/error-handler.js");
const notFoundMiddleware = require("./middleware/not-found.js");

const PORT = process.env.PORT || 3000;

//Middleware
app.use(
  cors({
    origin: "*",
  })
);
app.set('trust proxy',1)
app.use(rateLimiter({
  windowsMs:15*60*1000,
  max:60,
}))
app.use(helmet())
app.use(xssCLean())
app.use(mongoSanitize())
app.use(express.json());
app.use(morgan('dev'));
app.use(cookie(process.env.JWT_SECRET))
//Routes
app.get("/api/v1/", (req, res) => {
  res.send("Hello");
});
app.use("/api/v1/user", userRouter);
app.use("/api/v1/password", passwordRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const string = process.env.CONNECTION_STRING || undefined;

(async () => {
  try {
    await connectDb(string).then((res) => {
      console.log("Connected");
    });
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Something went wrong:", error);
  }
})();
