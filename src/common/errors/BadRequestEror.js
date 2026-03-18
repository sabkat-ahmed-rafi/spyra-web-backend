const AppError = require("./AppError");

class BadRequestError extends AppError {
  constructor(message = "Bad Request", errorCode = "BAD_REQUEST") {
    super(message, 400, errorCode);
  }
}

module.exports = BadRequestError;