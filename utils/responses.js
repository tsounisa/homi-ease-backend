/**
 * @function sendSuccessResponse
 * @description Sends a standardized success JSON response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object | array} [data=null] - Payload data
 */
export const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };
  if (data) {
    response.data = data;
  }
  res.status(statusCode).json(response);
};

/**
 * @function sendErrorResponse
 * @description Sends a standardized error JSON response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object | string} [error=null] - Error details (e.g., stack)
 */
export const sendErrorResponse = (
  res,
  statusCode,
  message,
  error = null
) => {
  const response = {
    success: false,
    message,
  };
  if (error) {
    response.error = error;
  }
  res.status(statusCode).json(response);
};