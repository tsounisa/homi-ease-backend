import { sendErrorResponse } from '../utils/responses.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';

/**
 * @function handleCastErrorDB
 * @description Handles Mongoose CastError (e.g., invalid ObjectId)
 * @param {object} err - Mongoose CastError object
 * @returns {ApiError} - A 400 Bad Request ApiError
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ApiError(400, message);
};

/**
 * @function handleDuplicateFieldsDB
 * @description Handles Mongoose duplicate key error (code 11000)
 * @param {object} err - Mongoose error object
 * @returns {ApiError} - A 400 Bad Request ApiError
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ApiError(400, message);
};

/**
 * @function handleValidationErrorDB
 * @description Handles Mongoose validation error
 * @param {object} err - Mongoose validation error object
 * @returns {ApiError} - A 400 Bad Request ApiError
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ApiError(400, message);
};

/**
 * @function handleJWTError
 * @description Handles invalid JWT token error
 * @returns {ApiError} - A 401 Unauthorized ApiError
 */
const handleJWTError = () =>
  new ApiError(401, 'Invalid token. Please log in again.');

/**
 * @function handleJWTExpiredError
 * @description Handles expired JWT token error
 * @returns {ApiError} - A 401 Unauthorized ApiError
 */
const handleJWTExpiredError = () =>
  new ApiError(401, 'Your token has expired. Please log in again.');

/**
 * @function sendErrorDev
 * @description Sends detailed error response in development
 */
const sendErrorDev = (err, res) => {
  sendErrorResponse(res, err.statusCode, err.message, err.stack);
};

/**
 * @function sendErrorProd
 * @description Sends generic error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    sendErrorResponse(res, err.statusCode, err.message);
  }
  // Programming or other unknown error: don't leak error details
  else {
    // 1) Log error
    logger.error('ERROR 💥', err);
    // 2) Send generic message
    sendErrorResponse(500, 'Something went very wrong!');
  }
};

/**
 * @function errorHandler
 * @description Global error handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };

    // Handle specific Mongoose errors
    if (err instanceof mongoose.Error.CastError)
      error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err instanceof mongoose.Error.ValidationError)
      error = handleValidationErrorDB(err);

    // Handle specific JWT errors
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};