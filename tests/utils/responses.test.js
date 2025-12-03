import { jest } from '@jest/globals';
import { sendSuccessResponse, sendErrorResponse } from '../../src/utils/responses.js';

describe('Utils: responses', () => {
  let mockRes;

  beforeEach(() => {
    // Mock Express Response Object
    // .status() must return 'this' to allow chaining .json()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('sendSuccessResponse', () => {
    it('should send response with data', () => {
      const data = { id: 1, name: 'Test' };
      sendSuccessResponse(mockRes, 200, 'Success', data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: data,
      });
    });

    it('should send response without data (default null)', () => {
      sendSuccessResponse(mockRes, 201, 'Created');

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Created',
      });
    });
  });

  describe('sendErrorResponse', () => {
    it('should send error response with details', () => {
      const errorDetails = { stack: 'trace' };
      sendErrorResponse(mockRes, 400, 'Bad Request', errorDetails);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Bad Request',
        error: errorDetails,
      });
    });

    it('should send error response without details', () => {
      sendErrorResponse(mockRes, 404, 'Not Found');

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not Found',
      });
    });
  });
});