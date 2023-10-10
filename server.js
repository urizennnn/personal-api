'use strict'

require("dotenv").config();
const express = require("express");
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require("cors");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const {connection} = require('./controllers/workers')
const { execSync } = require('child_process')
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const xssClean = require("xss-clean");
const helmet = require("helmet");
const rateLimiter = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const os = require('os')


const passwordRouter = require("./routes/password.js");
const userRouter = require("./routes/user.js");
const connectDb = require("./db/connect.js");
const errorHandlerMiddleware = require("./middleware/error-handler.js");
const networkInterfaces = require('network-interfaces')
const jwksHost = process.env.HANKO_API_URL;

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 60 }));
app.use(helmet());
app.use(xssClean());
app.use(mongoSanitize());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser(process.env.JWT_SECRET));
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/password", passwordRouter);
app.use(
  jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 2,
      jwksUri: `${jwksHost}/.well-known/jwks.json`,
    }),
    algorithms: ["RS256"],
    getToken: function fromCookieOrHeader(req) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        return req.headers.authorization.split(" ")[1];
      } else if (req.cookies && req.cookies.hanko) {
        return req.cookies.hanko;
      }
      return null;
    },
  })
)
connection(io)

app.get('/', (req, res) => {
  res.status(200).json('Hello')
});



(async () => {
  try {
    const connectionString = process.env.CONNECTION_STRING || undefined;
    await connectDb(connectionString);
    console.log("Connected to the database");
    http.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Something went wrong:", error);
  }
})();
