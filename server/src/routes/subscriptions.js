import express from 'express';
import subscriptionController from '../controllers/subscriptionController.js';
import authMiddleware, { requireRole } from '../middleware/auth.js';
import { 
  subscriptionStatus, 
  requirePremiumSubscription,
  requireSubscriptionTier,
  requireAdminAccess,
  trackSubscriptionUsage 
} from '../middleware/subscription.js';
import validationMiddleware from '../middleware/validation.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for subscription endpoints
const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    error: 'Too many subscription requests from this IP, please try again later.',
    code: 'SUBSCRIPTION_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for webhook endpoints
    return req.path.includes('/webhook');
  }
});

// Apply rate limiting to most subscription routes
router.use(subscriptionLimiter);

/**
 * @route GET /api/subscriptions/plans
 * @desc Get available subscription plans and pricing
 * @access Public
 * @features
 *   - All subscription tiers with features and pricing
 *   - Monthly and yearly pricing options
 *   - Trial period information
 *   - Money-back guarantee details
 * @example GET /api/subscriptions/plans
 */
router.get('/plans', subscriptionController.getSubscriptionPlans);

/**
 * @route GET /api/subscriptions/current
 * @desc Get current user's subscription details
 * @access Private (Authenticated users)
 * @features
 *   - Current subscription tier and status
 *   - Usage statistics and limits
 *   - Billing information and next payment
 *   - Trial status and remaining days
 *   - Cancellation status
 * @example GET /api/subscriptions/current
 * @headers Authorization: Bearer <jwt_token>
 */
router.get('/current',
  authMiddleware,
  subscriptionStatus,
  trackSubscriptionUsage('subscription_view'),
  subscriptionController.getCurrentSubscription
);

/**
 * @route POST /api/subscriptions/subscribe
 * @desc Create new subscription or start trial
 * @access Private (Authenticated users)
 * @body
 *   - tierId (required): Subscription tier (premium, pro, enterprise)
 *   - billingCycle (optional): monthly or yearly (default: monthly)
 *   - paymentMethodId (required for paid tiers): Stripe payment method ID
 *   - trialPeriod (optional): Start with trial period (boolean)
 * @features
 *   - Support for all subscription tiers
 *   - 14-day free trial for premium and pro tiers
 *   - Automatic payment processing via Stripe
 *   - Prorated billing for upgrades
 * @example POST /api/subscriptions/subscribe
 * @body { "tierId": "premium", "billingCycle": "monthly", "paymentMethodId": "pm_123", "trialPeriod": true }
 */
router.post('/subscribe',
  authMiddleware,
  subscriptionStatus,
  validationMiddleware.validateSubscriptionData,
  trackSubscriptionUsage('subscription_create'),
  subscriptionController.createSubscription
);

/**
 * @route PUT /api/subscriptions/upgrade
 * @desc Upgrade to higher subscription tier
 * @access Private (Authenticated users with active subscription)
 * @body
 *   - tierId (required): New subscription tier
 *   - billingCycle (optional): monthly or yearly
 * @features
 *   - Upgrade to any higher tier
 *   - Prorated billing calculation
 *   - Immediate access to new features
 *   - Preserve existing billing cycle
 * @example PUT /api/subscriptions/upgrade
 * @body { "tierId": "pro", "billingCycle": "yearly" }
 */
router.put('/upgrade',
  authMiddleware,
  subscriptionStatus,
  requirePremiumSubscription,
  validationMiddleware.validateSubscriptionUpgrade,
  trackSubscriptionUsage('subscription_upgrade'),
  subscriptionController.upgradeSubscription
);

/**
 * @route DELETE /api/subscriptions/cancel
 * @desc Cancel subscription
 * @access Private (Authenticated users with active subscription)
 * @body
 *   - immediate (optional): Cancel immediately vs at period end (boolean)
 *   - reason (optional): Cancellation reason
 *   - feedback (optional): User feedback for improvement
 * @features
 *   - Cancel at end of billing period (default)
 *   - Immediate cancellation option
 *   - Retention offers and discounts
 *   - Cancellation feedback collection
 * @example DELETE /api/subscriptions/cancel
 * @body { "immediate": false, "reason": "too_expensive", "feedback": "Great service but budget constraints" }
 */
router.delete('/cancel',
  authMiddleware,
  subscriptionStatus,
  requirePremiumSubscription,
  validationMiddleware.validateCancellationData,
  trackSubscriptionUsage('subscription_cancel'),
  subscriptionController.cancelSubscription
);

/**
 * @route POST /api/subscriptions/payment-method
 * @desc Update payment method for subscription
 * @access Private (Authenticated users with paid subscription)
 * @body
 *   - paymentMethodId (required): New Stripe payment method ID
 *   - setAsDefault (optional): Set as default payment method (boolean)
 * @features
 *   - Update credit card information
 *   - Support for multiple payment methods
 *   - Secure payment processing via Stripe
 *   - Immediate validation and confirmation
 * @example POST /api/subscriptions/payment-method
 * @body { "paymentMethodId": "pm_new_card_456", "setAsDefault": true }
 */
router.post('/payment-method',
  authMiddleware,
  subscriptionStatus,
  requirePremiumSubscription,
  validationMiddleware.validatePaymentMethodData,
  trackSubscriptionUsage('payment_method_update'),
  subscriptionController.updatePaymentMethod
);

/**
 * @route GET /api/subscriptions/billing-history
 * @desc Get user's billing history and invoices
 * @access Private (Authenticated users with subscription history)
 * @params
 *   - limit (query): Number of records to return (max 50, default 10)
 *   - offset (query): Pagination offset (default 0)
 * @features
 *   - Complete billing transaction history
 *   - Downloadable invoice links
 *   - Payment status and amounts
 *   - Billing period information
 *   - Pagination support
 * @example GET /api/subscriptions/billing-history?limit=20&offset=0
 */
router.get('/billing-history',
  authMiddleware,
  subscriptionStatus,
  validationMiddleware.validateBillingHistoryQuery,
  trackSubscriptionUsage('billing_history_view'),
  subscriptionController.getBillingHistory
);

/**
 * @route POST /api/subscriptions/webhook
 * @desc Stripe webhook handler for subscription events
 * @access Public (Webhook endpoint - authenticated via Stripe signature)
 * @body Stripe webhook payload
 * @features
 *   - Handle subscription lifecycle events
 *   - Process payment success/failure
 *   - Update subscription status
 *   - Send customer notifications
 * @security Validated using Stripe webhook signatures
 * @example POST /api/subscriptions/webhook (called by Stripe)
 */
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionController.handleStripeWebhook
);

// Premium feature access endpoints
/**
 * @route GET /api/subscriptions/premium-analytics
 * @desc Get advanced analytics (Premium+ feature)
 * @access Private (Premium subscription required)
 * @features
 *   - Advanced wellness analytics
 *   - Historical trend analysis
 *   - Personalized insights
 *   - Comparison benchmarks
 */
router.get('/premium-analytics',
  authMiddleware,
  subscriptionStatus,
  requirePremiumSubscription,
  trackSubscriptionUsage('premium_analytics'),
  (req, res) => {
    res.json({
      success: true,
      data: {
        analytics: {
          wellnessTrends: {
            mood: { current: 4.2, trend: '+12%', period: '30d' },
            energy: { current: 3.8, trend: '+8%', period: '30d' },
            stress: { current: 2.1, trend: '-15%', period: '30d' }
          },
          insights: [
            'Your mood has improved 12% this month',
            'Morning meditation shows strongest correlation with better sleep',
            'Weekend stress levels are 40% lower than weekdays'
          ],
          recommendations: [
            'Consider adding evening yoga to your routine',
            'Your optimal bedtime appears to be 10:30 PM',
            'Magnesium supplementation may help with sleep quality'
          ]
        },
        accessLevel: 'premium'
      },
      message: 'Premium analytics data retrieved successfully'
    });
  }
);

/**
 * @route GET /api/subscriptions/pro-coaching
 * @desc Access 1:1 coaching features (Pro+ feature)
 * @access Private (Pro subscription required)
 */
router.get('/pro-coaching',
  authMiddleware,
  subscriptionStatus,
  requireSubscriptionTier('pro'),
  trackSubscriptionUsage('pro_coaching'),
  (req, res) => {
    res.json({
      success: true,
      data: {
        coachingSessions: {
          remaining: 2,
          nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          coachProfile: {
            name: 'Sarah Johnson',
            specialties: ['Stress Management', 'Sleep Optimization', 'Nutrition'],
            experience: '8 years',
            rating: 4.9
          }
        },
        bookingUrl: `${process.env.FRONTEND_URL}/coaching/book`,
        accessLevel: 'pro'
      },
      message: '1:1 coaching access confirmed'
    });
  }
);

/**
 * @route GET /api/subscriptions/enterprise-admin
 * @desc Enterprise admin dashboard access
 * @access Private (Enterprise subscription + Admin role)
 */
router.get('/enterprise-admin',
  authMiddleware,
  subscriptionStatus,
  requireSubscriptionTier('enterprise'),
  requireAdminAccess,
  trackSubscriptionUsage('enterprise_admin'),
  (req, res) => {
    res.json({
      success: true,
      data: {
        teamAnalytics: {
          totalUsers: 45,
          activeUsers: 38,
          engagementRate: '84%',
          averageWellnessScore: 7.3
        },
        adminTools: [
          'User Management',
          'Team Reports',
          'Custom Integrations',
          'Compliance Dashboard'
        ],
        accessLevel: 'enterprise_admin'
      },
      message: 'Enterprise admin dashboard access granted'
    });
  }
);

// Health check endpoint for subscriptions service
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Subscriptions API',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/subscriptions/plans',
      'GET /api/subscriptions/current',
      'POST /api/subscriptions/subscribe',
      'PUT /api/subscriptions/upgrade',
      'DELETE /api/subscriptions/cancel',
      'POST /api/subscriptions/payment-method',
      'GET /api/subscriptions/billing-history',
      'POST /api/subscriptions/webhook'
    ],
    features: {
      subscriptionTiers: ['free', 'premium', 'pro', 'enterprise'],
      paymentProcessing: 'Stripe',
      trialPeriod: '14 days',
      billingCycles: ['monthly', 'yearly']
    },
    integrations: {
      stripe: 'operational',
      webhooks: 'operational',
      analytics: 'operational'
    }
  });
});

// Demo endpoint for testing subscription features
router.get('/demo', (req, res) => {
  res.status(200).json({
    message: 'Better Being Subscriptions Demo',
    subscriptionTiers: {
      free: {
        price: 0,
        features: ['Basic tracking', 'Limited recommendations'],
        limits: { dailyRecommendations: 3 }
      },
      premium: {
        price: 19.99,
        features: ['Unlimited AI coaching', 'Advanced analytics', 'Community access'],
        limits: { dailyRecommendations: -1 }
      },
      pro: {
        price: 39.99,
        features: ['1:1 coaching', 'Custom programs', 'Priority support'],
        limits: { dailyRecommendations: -1, oneOnOneCoaching: 2 }
      },
      enterprise: {
        price: 99.99,
        features: ['Team dashboard', 'Admin tools', 'Custom integrations'],
        limits: { teamSize: 50, adminUsers: 5 }
      }
    },
    sampleRequests: {
      getPlans: {
        method: 'GET',
        endpoint: '/api/subscriptions/plans',
        description: 'Get all available subscription plans'
      },
      subscribe: {
        method: 'POST',
        endpoint: '/api/subscriptions/subscribe',
        body: {
          tierId: 'premium',
          billingCycle: 'monthly',
          paymentMethodId: 'pm_sample_123',
          trialPeriod: true
        },
        description: 'Subscribe to premium tier with 14-day trial'
      },
      currentSubscription: {
        method: 'GET',
        endpoint: '/api/subscriptions/current',
        headers: { 'Authorization': 'Bearer <jwt_token>' },
        description: 'Get current user subscription details'
      }
    },
    premiumFeatures: {
      aiCoaching: 'Unlimited personalized AI wellness coaching',
      analytics: 'Advanced wellness trends and insights',
      community: 'Access to wellness community and mentorship',
      oneOnOneCoaching: '1:1 sessions with certified wellness coaches',
      customPrograms: 'Personalized wellness program creation',
      teamDashboard: 'Enterprise team wellness management'
    }
  });
});

// Error handling for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Subscription endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist in the subscriptions API.`,
    availableEndpoints: [
      'GET /api/subscriptions/plans',
      'GET /api/subscriptions/current',
      'POST /api/subscriptions/subscribe',
      'PUT /api/subscriptions/upgrade',
      'DELETE /api/subscriptions/cancel',
      'POST /api/subscriptions/payment-method',
      'GET /api/subscriptions/billing-history',
      'POST /api/subscriptions/webhook',
      'GET /api/subscriptions/health',
      'GET /api/subscriptions/demo'
    ],
    documentation: 'https://docs.betterbeing.com/api/subscriptions'
  });
});

export default router;