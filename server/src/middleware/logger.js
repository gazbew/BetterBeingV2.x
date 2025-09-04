/**
 * Request logging middleware for Better Being API
 * Provides structured logging for monitoring and debugging
 */

const logger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Add request ID to request object
  req.requestId = requestId;
  
  // Add request ID to response headers
  res.set('X-Request-ID', requestId);

  // Capture original response methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  let responseBody = null;
  let responseSent = false;

  // Override res.send to capture response body
  res.send = function(body) {
    if (!responseSent) {
      responseBody = body;
      responseSent = true;
    }
    return originalSend.call(this, body);
  };

  // Override res.json to capture response body
  res.json = function(body) {
    if (!responseSent) {
      responseBody = body;
      responseSent = true;
    }
    return originalJson.call(this, body);
  };

  // Log request details
  const requestLog = {
    timestamp: new Date().toISOString(),
    requestId,
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: getClientIP(req),
    userId: null, // Will be populated by auth middleware
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    headers: filterSensitiveHeaders(req.headers)
  };

  // Don't log sensitive request body data
  if (req.method !== 'GET' && req.body) {
    requestLog.bodySize = JSON.stringify(req.body).length;
    requestLog.hasBody = true;
  }

  console.log('📥 Request:', formatLogEntry(requestLog));

  // Handle response completion
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    const responseLog = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      userId: req.user?.id || null,
      responseSize: responseBody ? JSON.stringify(responseBody).length : 0,
      success: statusCode < 400,
      category: getRequestCategory(req.path),
      userAgent: req.get('User-Agent')?.split(' ')[0] || 'Unknown' // Browser/client type only
    };

    // Add response body for errors (but filter sensitive data)
    if (statusCode >= 400 && responseBody) {
      try {
        const parsedBody = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
        responseLog.errorCode = parsedBody.code;
        responseLog.errorMessage = parsedBody.message;
      } catch (e) {
        // Response body is not JSON, skip parsing
      }
    }

    // Determine log level based on status code
    const logLevel = getLogLevel(statusCode);
    const emoji = getStatusEmoji(statusCode);
    
    console.log(`${emoji} Response [${logLevel}]:`, formatLogEntry(responseLog));

    // Log slow requests
    if (duration > 2000) {
      console.warn('🐌 Slow Request:', {
        requestId,
        url: req.originalUrl,
        duration: `${duration}ms`,
        warning: 'Request took longer than 2 seconds'
      });
    }

    // Log wellness-specific metrics
    if (req.path.includes('/recommendations')) {
      const wellnessLog = {
        timestamp: new Date().toISOString(),
        requestId,
        service: 'wellness-recommendations',
        endpoint: req.path,
        userMetrics: extractWellnessMetrics(req),
        recommendationCount: extractRecommendationCount(responseBody),
        aiConfidence: extractAIConfidence(responseBody),
        personalized: req.user?.id ? true : false
      };

      console.log('🧠 Wellness AI:', formatLogEntry(wellnessLog));
    }
  });

  // Handle response errors
  res.on('error', (error) => {
    const duration = Date.now() - startTime;
    
    console.error('❌ Response Error:', {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      url: req.originalUrl,
      duration: `${duration}ms`,
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  });

  // Update request log with user info after auth middleware runs
  req.on('userAuthenticated', (user) => {
    requestLog.userId = user.id;
    requestLog.userRole = user.role;
  });

  next();
};

/**
 * Get client IP address, handling proxies
 */
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
}

/**
 * Filter sensitive headers from logs
 */
function filterSensitiveHeaders(headers) {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
  const filtered = {};
  
  Object.keys(headers).forEach(key => {
    if (!sensitiveHeaders.includes(key.toLowerCase())) {
      filtered[key] = headers[key];
    } else {
      filtered[key] = '[FILTERED]';
    }
  });
  
  return filtered;
}

/**
 * Categorize requests for better organization
 */
function getRequestCategory(path) {
  if (path.includes('/recommendations/daily')) return 'daily-recommendations';
  if (path.includes('/recommendations/products')) return 'product-recommendations';
  if (path.includes('/recommendations/feedback')) return 'feedback';
  if (path.includes('/recommendations/insights')) return 'wellness-insights';
  if (path.includes('/recommendations/profile')) return 'profile-update';
  if (path.includes('/recommendations')) return 'recommendations-general';
  if (path.includes('/health')) return 'health-check';
  if (path.includes('/auth')) return 'authentication';
  return 'other';
}

/**
 * Get log level based on HTTP status code
 */
function getLogLevel(statusCode) {
  if (statusCode >= 500) return 'ERROR';
  if (statusCode >= 400) return 'WARN';
  if (statusCode >= 300) return 'INFO';
  return 'INFO';
}

/**
 * Get emoji based on HTTP status code
 */
function getStatusEmoji(statusCode) {
  if (statusCode >= 500) return '💥';
  if (statusCode >= 400) return '⚠️';
  if (statusCode >= 300) return '🔄';
  if (statusCode >= 200) return '✅';
  return '📤';
}

/**
 * Extract wellness metrics from request for logging
 */
function extractWellnessMetrics(req) {
  const metrics = {};
  
  ['mood', 'energy', 'sleepQuality', 'stressLevel'].forEach(metric => {
    if (req.query[metric] !== undefined) {
      metrics[metric] = req.query[metric];
    }
    if (req.body?.metrics?.[metric] !== undefined) {
      metrics[metric] = req.body.metrics[metric];
    }
  });
  
  if (req.query.goals) {
    metrics.goals = Array.isArray(req.query.goals) ? req.query.goals : req.query.goals.split(',');
  }
  
  return Object.keys(metrics).length > 0 ? metrics : null;
}

/**
 * Extract recommendation count from response
 */
function extractRecommendationCount(responseBody) {
  if (!responseBody) return null;
  
  try {
    const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
    
    if (parsed.data?.recommendations?.length) {
      return parsed.data.recommendations.length;
    }
    
    if (parsed.data?.products?.length) {
      return parsed.data.products.length;
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract AI confidence score from response
 */
function extractAIConfidence(responseBody) {
  if (!responseBody) return null;
  
  try {
    const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
    
    if (parsed.data?.meta?.aiConfidence) {
      return parsed.data.meta.aiConfidence;
    }
    
    // Calculate average confidence from recommendations
    const recommendations = parsed.data?.recommendations || parsed.data?.products || [];
    if (recommendations.length > 0) {
      const confidenceScores = recommendations
        .map(r => r.confidence || r.personalizedScore)
        .filter(c => c !== undefined);
      
      if (confidenceScores.length > 0) {
        return Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length * 100) / 100;
      }
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Format log entry for consistent output
 */
function formatLogEntry(logData) {
  // In production, you might want to format this as JSON for log aggregation
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(logData);
  }
  
  // Development-friendly formatting
  const important = {
    method: logData.method,
    url: logData.url,
    status: logData.statusCode,
    duration: logData.duration,
    userId: logData.userId,
    requestId: logData.requestId?.slice(-8) // Last 8 characters for brevity
  };
  
  return Object.entries(important)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');
}

/**
 * Health check logger (lighter logging for health checks)
 */
export const healthCheckLogger = (req, res, next) => {
  if (req.path === '/health' || req.path.includes('/health')) {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Only log if health check fails or is slow
      if (res.statusCode !== 200 || duration > 1000) {
        console.log(`💓 Health Check: status=${res.statusCode} duration=${duration}ms`);
      }
    });
  }
  
  next();
};

/**
 * Security event logger
 */
export const securityLogger = {
  logAuthenticationFailure: (req, reason) => {
    console.warn('🔒 Auth Failure:', {
      timestamp: new Date().toISOString(),
      ip: getClientIP(req),
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      reason,
      requestId: req.requestId
    });
  },
  
  logSuspiciousActivity: (req, activity) => {
    console.warn('🚨 Suspicious Activity:', {
      timestamp: new Date().toISOString(),
      ip: getClientIP(req),
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      activity,
      requestId: req.requestId
    });
  },
  
  logRateLimitHit: (req, limit) => {
    console.warn('🛑 Rate Limit Hit:', {
      timestamp: new Date().toISOString(),
      ip: getClientIP(req),
      limit,
      url: req.originalUrl,
      requestId: req.requestId
    });
  }
};

/**
 * Performance logger for monitoring AI service performance
 */
export const performanceLogger = {
  logAIProcessingTime: (service, operation, duration, metadata = {}) => {
    console.log('⚡ AI Performance:', {
      timestamp: new Date().toISOString(),
      service,
      operation,
      duration: `${duration}ms`,
      ...metadata
    });
  },
  
  logSlowQuery: (query, duration, metadata = {}) => {
    console.warn('🐌 Slow Query:', {
      timestamp: new Date().toISOString(),
      query,
      duration: `${duration}ms`,
      threshold: '2000ms',
      ...metadata
    });
  }
};

export default logger;