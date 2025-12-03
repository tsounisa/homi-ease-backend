import { jest } from '@jest/globals';
import { logger } from '../../src/utils/logger.js';

describe('Utils: logger', () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Mock implementation to prevent cluttering test output
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log info messages', () => {
    logger.info('Test Info');
    expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'Test Info');
  });

  it('should log warn messages', () => {
    logger.warn('Test Warn');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]', 'Test Warn');
  });

  it('should log error messages', () => {
    logger.error('Test Error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Test Error');
  });
});