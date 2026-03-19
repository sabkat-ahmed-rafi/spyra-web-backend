const logger = require("../../config/logger");
const { AppError, ConflictError, BadRequestError } = require("../errors/index");
const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require("sequelize");

const globalErrorHandlerMiddleware = (err, req, res, _) => {

  if (req.log) {
    req.log.error({ err }, "Error caught in global handler");
  } else {
    // Fallback for non-request contexts
    logger.error({ err }, "Error caught in global handler");
  }

  let error = err;

  // Handle non-AppError (unexpected errors)
  if (!(error instanceof AppError)) {
    // Sequelize unique constraint
    if (err instanceof UniqueConstraintError) {
      error = new ConflictError(err.message || "Duplicate field value");
    }
    // Sequelize validation error
    else if (err instanceof ValidationError) {
      error = new BadRequestError(err.message || "Validation failed");
    }
    // Sequelize foreign key error
    else if (err instanceof ForeignKeyConstraintError) {
      error = new BadRequestError(err.message || "Foreign key constraint failed");
    }
    else {
      // fallback unknown errors
      error = new AppError(err.message || "Internal Server Error", 500);
    }
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errorCode: error.errorCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = globalErrorHandlerMiddleware;