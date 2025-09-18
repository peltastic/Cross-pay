export interface AppError {
  id: string;
  message: string;
  code?: string;
  type: 'network' | 'validation' | 'api' | 'unknown';
  timestamp: number;
  retryable: boolean;
  context?: any;
}

export interface ErrorState {
  errors: AppError[];
  lastError: AppError | null;
}

export const initialErrorState: ErrorState = {
  errors: [],
  lastError: null,
};

export function createAppError(
  message: string,
  type: AppError['type'] = 'unknown',
  code?: string,
  retryable = true,
  context?: any
): AppError {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    message,
    code,
    type,
    timestamp: Date.now(),
    retryable,
    context,
  };
}

export function mapHttpErrorToAppError(error: any, context?: any): AppError {
  if (error.status === 0) {
    return createAppError(
      'Network connection failed. Please check your internet connection.',
      'network',
      'NETWORK_ERROR',
      true,
      context
    );
  }
  
  if (error.status === 401 || error.status === 403) {
    return createAppError(
      'Access denied. Please check your credentials.',
      'api',
      'UNAUTHORIZED',
      false,
      context
    );
  }
  
  if (error.status === 429) {
    return createAppError(
      'Too many requests. Please wait a moment and try again.',
      'api',
      'RATE_LIMITED',
      true,
      context
    );
  }
  
  if (error.status >= 500) {
    return createAppError(
      'Server error occurred. Please try again later.',
      'api',
      'SERVER_ERROR',
      true,
      context
    );
  }
  
  if (error.status === 404) {
    return createAppError(
      'Requested resource not found.',
      'api',
      'NOT_FOUND',
      false,
      context
    );
  }
  
  return createAppError(
    error.message || 'An unexpected error occurred.',
    'api',
    error.status?.toString(),
    true,
    context
  );
}