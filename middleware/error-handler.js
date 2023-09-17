const { CustomAPIErrorHandler } = require("../errors/custom-errors");
const { StatusCodes } = require("http-status-codes");

function errorHandler(err, req, res, next) {
  if (err instanceof CustomAPIErrorHandler) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: "Something went wrong" });
}

module.exports = errorHandler;
