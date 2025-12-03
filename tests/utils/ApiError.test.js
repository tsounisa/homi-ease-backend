import { ApiError } from '../../src/utils/ApiError.js';

describe('Utils: ApiError', () => {
  it('should create an operational error with 4xx status', () => {
    const error = new ApiError(404, 'Not Found');

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(404);
    expect(error.status).toBe('fail'); // 4xx = fail
    expect(error.isOperational).toBe(true); // Default
    expect(error.message).toBe('Not Found');
    expect(error.stack).toBeDefined();
  });

  it('should create an error with 5xx status', () => {
    const error = new ApiError(500, 'Server Error');

    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error'); // 5xx = error
  });

  it('should allow setting isOperational to false', () => {
    const error = new ApiError(500, 'Crash', false);
    expect(error.isOperational).toBe(false);
  });

  it('should use provided stack trace if given', () => {
    const customStack = 'Error: stack...';
    const error = new ApiError(400, 'Bad', true, customStack);
    expect(error.stack).toBe(customStack);
  });
});