'use strict'

const { CustomAPIErrorHandler } = require("../errors/custom-errors");
const { StatusCodes } = require("http-status-codes");

function errorHandler(err, req, res, next) {
  if (err instanceof CustomAPIErrorHandler) {
    return res.status(err.statusCode).json({ message: err.message });
  }
 throw new CustomAPIErrorHandler('Internal Server Error',StatusCodes.INTERNAL_SERVER_ERROR)
}

module.exports = errorHandler;
