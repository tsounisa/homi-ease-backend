import { jest } from '@jest/globals';
import { ApiError } from '../../src/utils/ApiError.js';

const { errorHandler } = await import('../../src/middleware/errorHandler.js');

describe('Middleware: ErrorHandler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should handle ApiError (Operational) correctly', () => {
    const error = new ApiError(404, 'Not Found');
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Not Found'
    }));
  });

  it('should pass through message for generic Errors', () => {
    const error = new Error('Something broke');
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Something broke' // Matches actual implementation behavior
    }));
  });

  it('should handle Mongoose CastError', () => {
    const error = { name: 'CastError', value: 'bad-id' };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Resource not found')
    }));
  });

  it('should handle Mongoose Duplicate Key Error', () => {
    const error = { code: 11000 }; // No errmsg provided, will trigger fallback
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      // Matches the fallback logic in your handler
      message: 'Duplicate field value: entered value. Please use another value!' 
    }));
  });

  it('should handle JWT Validation Error', () => {
    const error = { name: 'JsonWebTokenError' };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Not authorized'
    }));
  });
});