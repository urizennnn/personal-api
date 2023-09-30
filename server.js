require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const xssClean = require("xss-clean");
const helmet = require("helmet");
const rateLimiter = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const passwordRouter = require("./routes/password.js");
const userRouter = require("./routes/user.js");
const connectDb = require("./db/connect.js");
const errorHandlerMiddleware = require("./middleware/error-handler.js");
const notFoundMiddleware = require("./middleware/not-found.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 60 }));
app.use(helmet());
app.use(xssClean());
app.use(mongoSanitize());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser(process.env.JWT_SECRET));
// app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
// Routes
app.get("/api/v1/", (req, res) => {
  res.send("Hello");
});
app.use("/api/v1/user", userRouter);
app.use("/api/v1/password", passwordRouter);


// Database connection
(async () => {
  try {
    const connectionString = process.env.CONNECTION_STRING || undefined;
    await connectDb(connectionString);
    console.log("Connected to the database");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Something went wrong:", error);
  }
})();
