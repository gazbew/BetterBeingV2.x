/**
 * Global error handling middleware for Better Being API
 * Provides consistent error responses and logging
 */

const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  console.error('API Error:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });

  // Default error response
  let statusCode = 500;
  let errorResponse = {
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred. Please try again later.',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  // Handle specific error types
  switch (err.name) {
    case 'ValidationError':
      statusCode = 400;
      errorResponse = {
        ...errorResponse,
        error: 'Validation failed',
        message: 'The request contains invalid data.',
        code: 'VALIDATION_ERROR',
        details: err.details || []
      };
      break;

    case 'UnauthorizedError':
    case 'JsonWebTokenError':
      statusCode = 401;
      errorResponse = {
        ...errorResponse,
        error: 'Authentication failed',
        message: 'Invalid or missing authentication credentials.',
        code: 'AUTHENTICATION_ERROR'
      };
      break;

    case 'TokenExpiredError':
      statusCode = 401;
      errorResponse = {
        ...errorResponse,
        error: 'Token expired',
        message: 'Your authentication token has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
        expiredAt: err.expiredAt
      };
      break;

    case 'ForbiddenError':
      statusCode = 403;
      errorResponse = {
        ...errorResponse,
        error: 'Access forbidden',
        message: 'You do not have permission to access this resource.',
        code: 'ACCESS_FORBIDDEN'
      };
      break;

    case 'NotFoundError':
      statusCode = 404;
      errorResponse = {
        ...errorResponse,
        error: 'Resource not found',
        message: 'The requested resource could not be found.',
        code: 'RESOURCE_NOT_FOUND'
      };
      break;

    case 'ConflictError':
      statusCode = 409;
      errorResponse = {
        ...errorResponse,
        error: 'Resource conflict',
        message: 'The request conflicts with the current state of the resource.',
        code: 'RESOURCE_CONFLICT'
      };
      break;

    case 'RateLimitError':
      statusCode = 429;
      errorResponse = {
        ...errorResponse,
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: err.retryAfter || 900 // 15 minutes default
      };
      break;

    case 'ServiceUnavailableError':
      statusCode = 503;
      errorResponse = {
        ...errorResponse,
        error: 'Service unavailable',
        message: 'The AI recommendation service is temporarily unavailable.',
        code: 'SERVICE_UNAVAILABLE',
        retryAfter: err.retryAfter || 300 // 5 minutes default
      };
      break;

    case 'MongoError':
    case 'DatabaseError':
      statusCode = 503;
      errorResponse = {
        ...errorResponse,
        error: 'Database unavailable',
        message: 'Database service is temporarily unavailable. Please try again later.',
        code: 'DATABASE_UNAVAILABLE'
      };
      break;

    case 'NetworkError':
    case 'TimeoutError':
      statusCode = 504;
      errorResponse = {
        ...errorResponse,
        error: 'Service timeout',
        message: 'The request took too long to process. Please try again.',
        code: 'REQUEST_TIMEOUT'
      };
      break;

    default:
      // Handle custom error objects with specific properties
      if (err.statusCode) {
        statusCode = err.statusCode;
      }
      
      if (err.code) {
        errorResponse.code = err.code;
      }
      
      if (err.message && err.message !== 'Internal server error') {
        errorResponse.message = err.message;
      }
      
      if (err.details) {
        errorResponse.details = err.details;
      }
      
      break;
  }

  // Add development-specific error details
  if (process.env.NODE_ENV === 'development') {
    errorResponse.debug = {
      originalError: err.message,
      stack: err.stack,
      requestInfo: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.method !== 'GET' ? req.body : undefined,
        query: req.query,
        params: req.params
      }
    };
  }

  // Add helpful suggestions based on error type
  switch (statusCode) {
    case 400:
      errorResponse.suggestions = [
        'Check the request format and required fields',
        'Ensure all values are within valid ranges',
        'Review the API documentation for correct usage'
      ];
      break;
      
    case 401:
      errorResponse.suggestions = [
        'Include a valid Bearer token in the Authorization header',
        'Check if your token has expired and refresh if needed',
        'Ensure you are logged in to your Better Being account'
      ];
      break;
      
    case 403:
      errorResponse.suggestions = [
        'Verify your account has the necessary permissions',
        'Contact support if you believe this is an error',
        'Check if your subscription tier includes this feature'
      ];
      break;
      
    case 404:
      errorResponse.suggestions = [
        'Check the URL for typos or incorrect paths',
        'Ensure the resource ID is correct and exists',
        'Review available endpoints in the API documentation'
      ];
      break;
      
    case 429:
      errorResponse.suggestions = [
        'Wait before making additional requests',
        'Implement exponential backoff in your client',
        'Consider upgrading your subscription for higher limits'
      ];
      break;
      
    case 500:
    case 503:
    case 504:
      errorResponse.suggestions = [
        'Try again in a few moments',
        'Check our status page for ongoing issues',
        'Contact support if the problem persists'
      ];
      break;
  }

  // Add support contact information for server errors
  if (statusCode >= 500) {
    errorResponse.support = {
      email: 'support@betterbeing.com',
      status: 'https://status.betterbeing.com',
      docs: 'https://docs.betterbeing.com'
    };
  }

  // Set security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  });

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
  const errorResponse = {
    success: false,
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
    code: 'ENDPOINT_NOT_FOUND',
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      health: 'GET /health',
      recommendations: {
        daily: 'GET /api/recommendations/daily',
        products: 'GET /api/recommendations/products',
        feedback: 'POST /api/recommendations/feedback',
        insights: 'GET /api/recommendations/insights',
        profile: 'POST /api/recommendations/profile'
      }
    },
    documentation: 'https://docs.betterbeing.com/api',
    suggestions: [
      'Check the URL for typos',
      'Verify the HTTP method (GET, POST, etc.)',
      'Review the API documentation for correct endpoints',
      'Ensure you\'re using the correct API version'
    ]
  };

  res.status(404).json(errorResponse);
};

/**
 * Async error wrapper to catch async function errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create custom error classes
 */
export class APIError extends Error {
  constructor(message, statusCode = 500, code = 'API_ERROR', details = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends APIError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'ACCESS_FORBIDDEN');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'RESOURCE_NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends APIError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'RESOURCE_CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends APIError {
  constructor(message = 'Rate limit exceeded', retryAfter = 900) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ServiceUnavailableError extends APIError {
  constructor(message = 'Service temporarily unavailable', retryAfter = 300) {
    super(message, 503, 'SERVICE_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
    this.retryAfter = retryAfter;
  }
}

export default errorHandler;