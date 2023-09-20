require("dotenv").config();
require("express-async-errors");
const auth = require('./middleware/auth')
const cors = require("cors");
const morgan = require('morgan');
const express = require("express");
const app = express();

const passwordRouter = require("./routes/password.js");
const userRouter = require("./routes/user.js");
const connectDb = require("./db/connect.js");

const errorHandlerMiddleware = require("./middleware/error-handler.js");
const notFoundMiddleware = require("./middleware/not-found.js");

const PORT = process.env.PORT || 3000;

//Middleware
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(morgan('dev'));
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
