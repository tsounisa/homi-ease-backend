import { sendErrorResponse } from '../utils/responses.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @function handleCastErrorDB
 * @description Handles Mongoose CastError (e.g., invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Resource not found with id of ${err.value}`;
  return new ApiError(404, message);
};

/**
 * @function handleDuplicateFieldsDB
 * @description Handles Mongoose duplicate key error (code 11000)
 */
const handleDuplicateFieldsDB = (err) => {
  // Safe extraction of the duplicate value
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'entered value';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ApiError(400, message);
};

/**
 * @function handleValidationErrorDB
 * @description Handles Mongoose validation error
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ApiError(400, message);
};

const handleJWTError = () =>
  new ApiError(401, 'Not authorized'); // Matches test expectation

const handleJWTExpiredError = () =>
  new ApiError(401, 'Session expired');

/**
 * @function errorHandler
 * @description Global error handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  
  // Ensure critical properties are copied (sometimes lost in spread)
  error.message = err.message;
  error.name = err.name;
  error.statusCode = err.statusCode || 500;

  // --- Normalization Logic (Runs in ALL environments) ---
  
  // 1. Mongoose Bad ObjectId
  if (error.name === 'CastError') error = handleCastErrorDB(error);

  // 2. Mongoose Duplicate Key
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);

  // 3. Mongoose Validation Error
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

  // 4. JWT Errors
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // --- Response Handling ---
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';
  
  // In development, we might want to log the full error
  if (process.env.NODE_ENV === 'development') {
    logger.error('ERROR 💥', err);
  }

  // Send the response
  // We include the stack trace only if we are NOT in production
  const errorDetails = process.env.NODE_ENV === 'production' ? null : { stack: err.stack };

  sendErrorResponse(res, statusCode, message, errorDetails);
};