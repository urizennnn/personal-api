;'use strict'
class CustomAPIErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { CustomAPIErrorHandler };
