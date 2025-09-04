import express from 'express';
import recommendationsController from '../controllers/recommendationsController.js';
import authMiddleware from '../middleware/auth.js';
import validationMiddleware from '../middleware/validation.js';
import { 
  subscriptionStatus, 
  enforceUsageLimit, 
  trackSubscriptionUsage,
  requireFeatureAccess
} from '../middleware/subscription.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for recommendations endpoints
const recommendationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many recommendation requests from this IP, please try again later.',
    code: 'RECOMMENDATION_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all recommendation routes
router.use(recommendationLimiter);

// Optional authentication middleware (allows both authenticated and demo users)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // If auth header exists, validate it
    return authMiddleware(req, res, next);
  } else {
    // No auth header, continue as demo user
    req.user = { id: 'demo_user', role: 'demo' };
    next();
  }
};

/**
 * @route GET /api/recommendations/daily
 * @desc Get daily personalized wellness recommendations
 * @access Public (with optional authentication)
 * @params 
 *   - mood (query): Current mood level (1-5)
 *   - energy (query): Current energy level (1-5) 
 *   - sleepQuality (query): Recent sleep quality (1-5)
 *   - stressLevel (query): Current stress level (1-5)
 *   - goals (query): Comma-separated wellness goals
 * @example GET /api/recommendations/daily?mood=3&energy=2&stress=4&goals=improve_sleep,reduce_stress
 */
router.get('/daily', 
  optionalAuth,
  subscriptionStatus,
  enforceUsageLimit('dailyRecommendations'),
  trackSubscriptionUsage('daily_recommendation'),
  validationMiddleware.validateDailyRecommendationQuery,
  recommendationsController.getDailyRecommendations
);

/**
 * @route GET /api/recommendations/products
 * @desc Get personalized product recommendations based on wellness profile
 * @access Public (with optional authentication)
 * @params
 *   - limit (query): Number of products to return (max 20, default 8)
 *   - category (query): Filter by product category
 *   - mood, energy, sleepQuality, stressLevel (query): Current wellness metrics
 * @example GET /api/recommendations/products?limit=10&category=adaptogens&mood=3
 */
router.get('/products',
  optionalAuth,
  validationMiddleware.validateProductRecommendationQuery,
  recommendationsController.getProductRecommendations
);

/**
 * @route POST /api/recommendations/feedback
 * @desc Submit feedback on recommendations to improve AI
 * @access Public (with optional authentication)
 * @body
 *   - recommendationId (required): ID of the recommendation
 *   - rating (required): 1-5 star rating
 *   - helpfulness (optional): How helpful was the recommendation (1-5)
 *   - followed (optional): Whether user followed the recommendation (boolean)
 *   - effectiveness (optional): How effective was the recommendation (1-5)
 *   - comments (optional): Additional feedback text
 */
router.post('/feedback',
  optionalAuth,
  validationMiddleware.validateFeedbackBody,
  recommendationsController.submitFeedback
);

/**
 * @route GET /api/recommendations/insights
 * @desc Get comprehensive AI-powered wellness insights and analytics
 * @access Public (with optional authentication)
 * @params
 *   - timeframe (query): Analysis timeframe (7d, 30d, 90d, default: 30d)
 *   - compare (query): Include benchmark comparison (true/false)
 *   - mood, energy, sleepQuality, stressLevel (query): Current wellness metrics for analysis
 * @example GET /api/recommendations/insights?timeframe=30d&compare=true&mood=4
 */
router.get('/insights',
  authMiddleware,
  subscriptionStatus,
  requireFeatureAccess('advanced_analytics'),
  trackSubscriptionUsage('premium_analytics'),
  validationMiddleware.validateInsightsQuery,
  recommendationsController.getWellnessInsights
);

/**
 * @route POST /api/recommendations/profile
 * @desc Update user wellness profile data
 * @access Public (with optional authentication)
 * @body
 *   - metrics (optional): Current wellness metrics object
 *     - mood (1-5)
 *     - energy (1-5) 
 *     - sleepQuality (1-5)
 *     - stressLevel (1-5)
 *   - goals (optional): Array of wellness goal strings
 *   - preferences (optional): User preferences object
 */
router.post('/profile',
  optionalAuth,
  validationMiddleware.validateProfileUpdate,
  recommendationsController.updateWellnessProfile
);

// Health check endpoint for recommendations service
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Recommendations API',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/recommendations/daily',
      'GET /api/recommendations/products', 
      'POST /api/recommendations/feedback',
      'GET /api/recommendations/insights',
      'POST /api/recommendations/profile'
    ],
    aiServices: {
      recommendationEngine: 'operational',
      insightsAnalytics: 'operational',
      feedbackLearning: 'operational'
    }
  });
});

// Demo data endpoint for testing and development
router.get('/demo', (req, res) => {
  res.status(200).json({
    message: 'Better Being Recommendations Demo Data',
    sampleRequests: {
      dailyRecommendations: {
        endpoint: '/api/recommendations/daily',
        sampleQuery: '?mood=3&energy=2&sleepQuality=3&stressLevel=4&goals=improve_sleep,reduce_stress',
        description: 'Get personalized daily wellness recommendations'
      },
      productRecommendations: {
        endpoint: '/api/recommendations/products', 
        sampleQuery: '?limit=5&mood=3&energy=2&category=adaptogens',
        description: 'Get AI-curated product recommendations'
      },
      wellnessInsights: {
        endpoint: '/api/recommendations/insights',
        sampleQuery: '?timeframe=30d&compare=true&mood=4&energy=3',
        description: 'Get comprehensive wellness analytics and insights'
      }
    },
    wellnessMetrics: {
      mood: 'Integer 1-5 (1=poor, 5=excellent)',
      energy: 'Integer 1-5 (1=depleted, 5=high)',
      sleepQuality: 'Integer 1-5 (1=terrible, 5=excellent)',
      stressLevel: 'Integer 1-5 (1=minimal, 5=overwhelming)'
    },
    availableGoals: [
      'improve_sleep',
      'reduce_stress', 
      'increase_energy',
      'enhance_mood',
      'better_focus',
      'weight_management',
      'immune_support',
      'digestive_health'
    ],
    productCategories: [
      'adaptogens',
      'minerals', 
      'vitamins',
      'herbal_teas',
      'essential_oils',
      'mindfulness_tools',
      'sleep_support',
      'immunity_boosters'
    ]
  });
});

// Error handling for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Recommendation endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist in the recommendations API.`,
    availableEndpoints: [
      'GET /api/recommendations/daily',
      'GET /api/recommendations/products',
      'POST /api/recommendations/feedback', 
      'GET /api/recommendations/insights',
      'POST /api/recommendations/profile',
      'GET /api/recommendations/health',
      'GET /api/recommendations/demo'
    ],
    documentation: 'https://docs.betterbeing.com/api/recommendations'
  });
});

export default router;