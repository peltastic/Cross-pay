import { AppError, ErrorState, initialErrorState, createAppError, mapHttpErrorToAppError } from './error.model';

describe('Error Model', () => {
  describe('AppError interface', () => {
    it('should have correct structure', () => {
      const error: AppError = {
        id: 'test-id',
        message: 'Test error',
        code: 'TEST_CODE',
        type: 'api',
        timestamp: Date.now(),
        retryable: true,
        context: { test: 'data' }
      };

      expect(error.id).toBeDefined();
      expect(error.message).toBeDefined();
      expect(error.type).toBeDefined();
      expect(error.timestamp).toBeDefined();
      expect(error.retryable).toBeDefined();
    });

    it('should accept all valid error types', () => {
      const types: AppError['type'][] = ['network', 'validation', 'api', 'unknown'];
      
      types.forEach(type => {
        const error: AppError = {
          id: 'test',
          message: 'test',
          type,
          timestamp: Date.now(),
          retryable: true
        };
        expect(error.type).toBe(type);
      });
    });
  });

  describe('ErrorState interface', () => {
    it('should have correct structure', () => {
      const state: ErrorState = {
        errors: [],
        lastError: null
      };

      expect(state.errors).toBeDefined();
      expect(Array.isArray(state.errors)).toBe(true);
      expect(state.lastError).toBeNull();
    });

    it('should allow errors array and lastError', () => {
      const error: AppError = createAppError('Test error');
      const state: ErrorState = {
        errors: [error],
        lastError: error
      };

      expect(state.errors.length).toBe(1);
      expect(state.lastError).toBe(error);
    });
  });

  describe('initialErrorState', () => {
    it('should have empty errors array', () => {
      expect(initialErrorState.errors).toEqual([]);
      expect(initialErrorState.errors.length).toBe(0);
    });

    it('should have null lastError', () => {
      expect(initialErrorState.lastError).toBeNull();
    });

    it('should be immutable reference', () => {
      const state1 = initialErrorState;
      const state2 = initialErrorState;
      expect(state1).toBe(state2);
    });
  });

  describe('createAppError', () => {
    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2023, 0, 1, 12, 0, 0));
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should create error with required fields', () => {
      const error = createAppError('Test message');

      expect(error.id).toBeDefined();
      expect(error.message).toBe('Test message');
      expect(error.type).toBe('unknown');
      expect(error.timestamp).toBeDefined();
      expect(error.retryable).toBe(true);
      expect(error.code).toBeUndefined();
      expect(error.context).toBeUndefined();
    });

    it('should create error with all optional fields', () => {
      const context = { userId: '123', action: 'login' };
      const error = createAppError('Test message', 'validation', 'INVALID_INPUT', false, context);

      expect(error.message).toBe('Test message');
      expect(error.type).toBe('validation');
      expect(error.code).toBe('INVALID_INPUT');
      expect(error.retryable).toBe(false);
      expect(error.context).toBe(context);
    });

    it('should generate unique IDs', () => {
      const error1 = createAppError('Message 1');
      const error2 = createAppError('Message 2');

      expect(error1.id).not.toBe(error2.id);
      expect(error1.id).toBeDefined();
      expect(error2.id).toBeDefined();
    });

    it('should set timestamp correctly', () => {
      const fixedTime = new Date(2023, 0, 1, 12, 0, 0).getTime();
      jasmine.clock().mockDate(new Date(fixedTime));

      const error = createAppError('Test message');

      expect(error.timestamp).toBe(fixedTime);
    });

    it('should handle different error types', () => {
      const networkError = createAppError('Network error', 'network');
      const validationError = createAppError('Validation error', 'validation');
      const apiError = createAppError('API error', 'api');
      const unknownError = createAppError('Unknown error', 'unknown');

      expect(networkError.type).toBe('network');
      expect(validationError.type).toBe('validation');
      expect(apiError.type).toBe('api');
      expect(unknownError.type).toBe('unknown');
    });

    it('should handle complex context objects', () => {
      const complexContext = {
        user: { id: '123', name: 'John' },
        request: { url: '/api/test', method: 'POST' },
        metadata: { version: '1.0.0', environment: 'production' }
      };

      const error = createAppError('Complex error', 'api', 'COMPLEX_ERROR', true, complexContext);

      expect(error.context).toEqual(complexContext);
      expect(error.context.user.id).toBe('123');
      expect(error.context.request.url).toBe('/api/test');
    });
  });

  describe('mapHttpErrorToAppError', () => {
    it('should map network error (status 0)', () => {
      const httpError = { status: 0, message: 'Network failed' };
      const context = { url: '/api/test' };

      const appError = mapHttpErrorToAppError(httpError, context);

      expect(appError.message).toBe('Network connection failed. Please check your internet connection.');
      expect(appError.type).toBe('network');
      expect(appError.code).toBe('NETWORK_ERROR');
      expect(appError.retryable).toBe(true);
      expect(appError.context).toBe(context);
    });

    it('should map unauthorized error (status 401)', () => {
      const httpError = { status: 401, message: 'Unauthorized' };

      const appError = mapHttpErrorToAppError(httpError);

      expect(appError.message).toBe('Access denied. Please check your credentials.');
      expect(appError.type).toBe('api');
      expect(appError.code).toBe('UNAUTHORIZED');
      expect(appError.retryable).toBe(false);
    });

    it('should map forbidden error (status 403)', () => {
      const httpError = { status: 403, message: 'Forbidden' };

      const appError = mapHttpErrorToAppError(httpError);

      expect(appError.message).toBe('Access denied. Please check your credentials.');
      expect(appError.type).toBe('api');
      expect(appError.code).toBe('UNAUTHORIZED');
      expect(appError.retryable).toBe(false);
    });

    it('should map rate limiting error (status 429)', () => {
      const httpError = { status: 429, message: 'Too Many Requests' };

      const appError = mapHttpErrorToAppError(httpError);

      expect(appError.message).toBe('Too many requests. Please wait a moment and try again.');
      expect(appError.type).toBe('api');
      expect(appError.code).toBe('RATE_LIMITED');
      expect(appError.retryable).toBe(true);
    });

    it('should map server errors (status >= 500)', () => {
      const testCases = [
        { status: 500, name: 'Internal Server Error' },
        { status: 502, name: 'Bad Gateway' },
        { status: 503, name: 'Service Unavailable' },
        { status: 504, name: 'Gateway Timeout' }
      ];

      testCases.forEach(testCase => {
        const httpError = { status: testCase.status, message: testCase.name };
        const appError = mapHttpErrorToAppError(httpError);

        expect(appError.message).toBe('Server error occurred. Please try again later.');
        expect(appError.type).toBe('api');
        expect(appError.code).toBe('SERVER_ERROR');
        expect(appError.retryable).toBe(true);
      });
    });

    it('should map not found error (status 404)', () => {
      const httpError = { status: 404, message: 'Not Found' };

      const appError = mapHttpErrorToAppError(httpError);

      expect(appError.message).toBe('Requested resource not found.');
      expect(appError.type).toBe('api');
      expect(appError.code).toBe('NOT_FOUND');
      expect(appError.retryable).toBe(false);
    });

    it('should map other client errors', () => {
      const testCases = [
        { status: 400, message: 'Bad Request' },
        { status: 409, message: 'Conflict' },
        { status: 422, message: 'Unprocessable Entity' }
      ];

      testCases.forEach(testCase => {
        const httpError = { status: testCase.status, message: testCase.message };
        const appError = mapHttpErrorToAppError(httpError);

        expect(appError.message).toBe(testCase.message);
        expect(appError.type).toBe('api');
        expect(appError.code).toBe(testCase.status.toString());
        expect(appError.retryable).toBe(true);
      });
    });

    it('should handle error without message', () => {
      const httpError = { status: 400 };

      const appError = mapHttpErrorToAppError(httpError);

      expect(appError.message).toBe('An unexpected error occurred.');
      expect(appError.type).toBe('api');
      expect(appError.code).toBe('400');
      expect(appError.retryable).toBe(true);
    });

    it('should handle error without status', () => {
      const httpError = { message: 'Some error' };

      const appError = mapHttpErrorToAppError(httpError);

      expect(appError.message).toBe('Some error');
      expect(appError.type).toBe('api');
      expect(appError.code).toBeUndefined();
      expect(appError.retryable).toBe(true);
    });

    it('should handle completely empty error', () => {
      const httpError = {};

      const appError = mapHttpErrorToAppError(httpError);

      expect(appError.message).toBe('An unexpected error occurred.');
      expect(appError.type).toBe('api');
      expect(appError.code).toBeUndefined();
      expect(appError.retryable).toBe(true);
    });

    it('should preserve context when provided', () => {
      const httpError = { status: 400, message: 'Bad Request' };
      const context = { 
        requestId: 'abc-123',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date().toISOString()
      };

      const appError = mapHttpErrorToAppError(httpError, context);

      expect(appError.context).toBe(context);
      expect(appError.context.requestId).toBe('abc-123');
    });

    it('should handle edge case status codes', () => {
      const edgeCases = [
        { status: 1, expected: { code: '1', retryable: true } },
        { status: 99, expected: { code: '99', retryable: true } },
        { status: 418, expected: { code: '418', retryable: true } }, // I'm a teapot
        { status: 499, expected: { code: '499', retryable: true } },
        { status: 999, expected: { code: 'SERVER_ERROR', retryable: true } }
      ];

      edgeCases.forEach(testCase => {
        const httpError = { status: testCase.status, message: 'Test error' };
        const appError = mapHttpErrorToAppError(httpError);

        expect(appError.code).toBe(testCase.expected.code);
        expect(appError.retryable).toBe(testCase.expected.retryable);
        expect(appError.type).toBe('api');
      });
    });
  });

  describe('integration and edge cases', () => {
    it('should create consistent error structure across functions', () => {
      const directError = createAppError('Test message', 'api', 'TEST_CODE', false);
      const httpError = { status: 404, message: 'Not found' };
      const mappedError = mapHttpErrorToAppError(httpError);

      // Both should have the same structure
      expect(directError).toEqual(jasmine.objectContaining({
        id: jasmine.any(String),
        message: jasmine.any(String),
        type: jasmine.any(String),
        timestamp: jasmine.any(Number),
        retryable: jasmine.any(Boolean)
      }));

      expect(mappedError).toEqual(jasmine.objectContaining({
        id: jasmine.any(String),
        message: jasmine.any(String),
        type: jasmine.any(String),
        timestamp: jasmine.any(Number),
        retryable: jasmine.any(Boolean)
      }));
    });

    it('should handle error chaining scenarios', () => {
      const originalError = new Error('Original error');
      const httpError = { 
        status: 500, 
        message: 'Server error',
        originalError: originalError 
      };
      const context = { 
        action: 'user-login',
        originalError: originalError 
      };

      const appError = mapHttpErrorToAppError(httpError, context);

      expect(appError.context.originalError).toBe(originalError);
      expect(appError.message).toBe('Server error occurred. Please try again later.');
    });
  });
});