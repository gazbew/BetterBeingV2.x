import jwt from 'jsonwebtoken';

/**
 * Authentication middleware for Better Being API
 * Validates JWT tokens and sets user context
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'No authorization token provided. Please include a valid Bearer token in the Authorization header.',
        code: 'NO_TOKEN_PROVIDED'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        message: 'Authorization header must start with "Bearer ". Format: "Bearer <token>"',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Empty token',
        message: 'Bearer token cannot be empty.',
        code: 'EMPTY_TOKEN'
      });
    }

    // In a real application, this would use your actual JWT secret
    const JWT_SECRET = process.env.JWT_SECRET || 'better-being-wellness-secret-key-2024';

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Add user information to request object
      req.user = {
        id: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role || 'user',
        verified: decoded.verified || false,
        subscriptionTier: decoded.subscriptionTier || 'basic',
        preferences: decoded.preferences || {},
        tokenIssuedAt: new Date(decoded.iat * 1000),
        tokenExpiresAt: new Date(decoded.exp * 1000)
      };

      // Check if token is about to expire (within 1 hour)
      const oneHour = 60 * 60 * 1000;
      if (req.user.tokenExpiresAt.getTime() - Date.now() < oneHour) {
        res.set('X-Token-Refresh-Recommended', 'true');
        res.set('X-Token-Expires-At', req.user.tokenExpiresAt.toISOString());
      }

      next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          message: 'Your authentication token has expired. Please log in again.',
          code: 'TOKEN_EXPIRED',
          expiredAt: jwtError.expiredAt
        });
      }

      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'The provided authentication token is invalid or malformed.',
          code: 'INVALID_TOKEN'
        });
      }

      if (jwtError.name === 'NotBeforeError') {
        return res.status(401).json({
          success: false,
          error: 'Token not active yet',
          message: 'The authentication token is not active yet.',
          code: 'TOKEN_NOT_ACTIVE',
          activeAt: jwtError.date
        });
      }

      throw jwtError; // Re-throw unknown JWT errors
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication service error',
      message: 'Unable to verify authentication token. Please try again.',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role(s)
 */
export const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'This endpoint requires authentication.',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!rolesArray.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This endpoint requires one of the following roles: ${rolesArray.join(', ')}. Your role: ${userRole}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: rolesArray,
        userRole: userRole
      });
    }

    next();
  };
};

/**
 * Subscription tier middleware
 * Checks if user has required subscription tier
 */
export const requireSubscription = (requiredTier) => {
  const tierLevels = {
    'free': 0,
    'basic': 1,
    'premium': 2,
    'pro': 3,
    'enterprise': 4
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'This endpoint requires authentication.',
        code: 'AUTH_REQUIRED'
      });
    }

    const userTier = req.user.subscriptionTier || 'free';
    const userLevel = tierLevels[userTier] || 0;
    const requiredLevel = tierLevels[requiredTier] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        error: 'Subscription upgrade required',
        message: `This feature requires a ${requiredTier} subscription or higher. Your current plan: ${userTier}`,
        code: 'SUBSCRIPTION_UPGRADE_REQUIRED',
        currentTier: userTier,
        requiredTier: requiredTier,
        upgradeUrl: process.env.FRONTEND_URL + '/upgrade'
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Sets user context if token is provided, but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue as anonymous user
    req.user = null;
    return next();
  }

  // Token provided, try to authenticate
  authMiddleware(req, res, (error) => {
    if (error) {
      // Authentication failed, continue as anonymous user
      req.user = null;
    }
    next();
  });
};

/**
 * API key authentication middleware (for service-to-service communication)
 */
export const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'This endpoint requires a valid API key in the X-API-Key header.',
      code: 'API_KEY_REQUIRED'
    });
  }

  // In a real application, validate against your API key database
  const validApiKeys = (process.env.VALID_API_KEYS || '').split(',');
  
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid.',
      code: 'INVALID_API_KEY'
    });
  }

  // Set service context
  req.service = {
    apiKey: apiKey,
    isServiceCall: true
  };

  next();
};

/**
 * Rate limiting by user ID
 */
export const userRateLimit = (windowMs, maxRequests) => {
  const userRequests = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get user's request history
    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }

    const requests = userRequests.get(userId);
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    userRequests.set(userId, recentRequests);

    if (recentRequests.length >= maxRequests) {
      const resetTime = new Date(recentRequests[0] + windowMs);
      
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${maxRequests} requests per ${Math.floor(windowMs / 60000)} minutes.`,
        code: 'USER_RATE_LIMIT_EXCEEDED',
        resetTime: resetTime.toISOString(),
        remainingTime: Math.ceil((resetTime.getTime() - now) / 1000)
      });
    }

    // Add current request
    recentRequests.push(now);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - recentRequests.length).toString(),
      'X-RateLimit-Reset': Math.ceil((now + windowMs) / 1000).toString()
    });

    next();
  };
};

export default authMiddleware;