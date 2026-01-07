import { sendErrorResponse } from '../utils/responses.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

const handleCastErrorDB = (err) => {
  const message = `Resource not found with id of ${err.value}`;
  return new ApiError(404, message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\\1/)[0] : 'entered value';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ApiError(400, message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ApiError(400, message);
};

const handleJWTError = () => new ApiError(401, 'Not authorized');
const handleJWTExpiredError = () => new ApiError(401, 'Session expired');

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;
  error.name = err.name;
  error.statusCode = err.statusCode || 500;

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  if (process.env.NODE_ENV === 'development') {
    logger.error('ERROR 💥', err);
  }

  const errorDetails =
    process.env.NODE_ENV === 'production' ? null : { stack: err.stack };

  sendErrorResponse(res, statusCode, message, errorDetails);
};
