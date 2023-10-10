// jwtAuth.js
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const jwksHost = process.env.HANKO_API_URL;
const SECRET_KEY = process.env.JWT_SECRET
module.exports = jwt({
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
    } else if (req.signedCookies && req.signedCookies.refreshToken) {
      return req.signedCookies.refreshToken; // Use accessToken instead of hanko
    }
    return null;
  },
});
