import { mockSubscriptionDB, SubscriptionFeatures } from '../models/subscriptionModels.js';

/**
 * Subscription status middleware
 * Loads user subscription data and attaches to request
 */
export const subscriptionStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User authentication is required to access subscription features.',
        code: 'AUTH_REQUIRED'
      });
    }

    // Load user subscription from database
    const subscription = await mockSubscriptionDB.getSubscription(req.user.id);
    
    // Attach subscription to request
    req.subscription = subscription;
    
    // Add subscription info to response headers for client awareness
    res.set({
      'X-Subscription-Tier': subscription.tierId,
      'X-Subscription-Status': subscription.status,
      'X-Subscription-Active': subscription.isActive().toString(),
      'X-Days-Until-Renewal': subscription.daysUntilRenewal().toString()
    });

    next();
  } catch (error) {
    console.error('Subscription status middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Subscription service error',
      message: 'Unable to load subscription information. Please try again.',
      code: 'SUBSCRIPTION_SERVICE_ERROR'
    });
  }
};

/**
 * Require active subscription middleware
 */
export const requireActiveSubscription = (req, res, next) => {
  if (!req.subscription) {
    return res.status(500).json({
      success: false,
      error: 'Subscription data missing',
      message: 'Subscription information not loaded. Please ensure subscriptionStatus middleware is applied first.',
      code: 'SUBSCRIPTION_DATA_MISSING'
    });
  }

  if (!req.subscription.isActive()) {
    return res.status(403).json({
      success: false,
      error: 'Active subscription required',
      message: 'This feature requires an active subscription. Please reactivate your subscription to continue.',
      code: 'INACTIVE_SUBSCRIPTION',
      subscription: {
        status: req.subscription.status,
        tier: req.subscription.tierId,
        upgradeUrl: `${process.env.FRONTEND_URL}/subscription/reactivate`
      }
    });
  }

  next();
};

/**
 * Require premium subscription middleware (any paid tier)
 */
export const requirePremiumSubscription = (req, res, next) => {
  if (!req.subscription) {
    return res.status(500).json({
      success: false,
      error: 'Subscription data missing',
      code: 'SUBSCRIPTION_DATA_MISSING'
    });
  }

  if (!req.subscription.isPremium()) {
    return res.status(403).json({
      success: false,
      error: 'Premium subscription required',
      message: 'This feature requires a premium subscription. Upgrade to unlock advanced wellness features.',
      code: 'PREMIUM_SUBSCRIPTION_REQUIRED',
      currentTier: req.subscription.tierId,
      availableUpgrades: [
        {
          tier: 'premium',
          price: '$19.99/month',
          features: ['Unlimited AI coaching', 'Advanced analytics', 'Community access']
        },
        {
          tier: 'pro',
          price: '$39.99/month',
          features: ['Everything in Premium', '1:1 coaching', 'Custom programs']
        }
      ],
      upgradeUrl: `${process.env.FRONTEND_URL}/subscription/upgrade`
    });
  }

  next();
};

/**
 * Require specific subscription tier middleware
 */
export const requireSubscriptionTier = (requiredTier) => {
  const tierLevels = {
    'free': 0,
    'premium': 1,
    'pro': 2,
    'enterprise': 3
  };

  return (req, res, next) => {
    if (!req.subscription) {
      return res.status(500).json({
        success: false,
        error: 'Subscription data missing',
        code: 'SUBSCRIPTION_DATA_MISSING'
      });
    }

    const userTierLevel = tierLevels[req.subscription.tierId] || 0;
    const requiredTierLevel = tierLevels[requiredTier] || 0;

    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({
        success: false,
        error: 'Subscription tier upgrade required',
        message: `This feature requires a ${requiredTier} subscription or higher. Your current plan: ${req.subscription.tierId}`,
        code: 'SUBSCRIPTION_TIER_UPGRADE_REQUIRED',
        currentTier: req.subscription.tierId,
        requiredTier: requiredTier,
        upgradeUrl: `${process.env.FRONTEND_URL}/subscription/upgrade`
      });
    }

    next();
  };
};

/**
 * Feature access control middleware
 */
export const requireFeatureAccess = (featureName) => {
  return (req, res, next) => {
    if (!req.subscription) {
      return res.status(500).json({
        success: false,
        error: 'Subscription data missing',
        code: 'SUBSCRIPTION_DATA_MISSING'
      });
    }

    const featureCheck = SubscriptionFeatures.checkFeatureAccess(req.subscription, featureName);
    
    if (!featureCheck.hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Feature access denied',
        message: featureCheck.message,
        code: featureCheck.reason.toUpperCase(),
        feature: featureName,
        currentTier: req.subscription.tierId,
        suggestedTiers: featureCheck.suggestedTiers,
        upgradeUrl: `${process.env.FRONTEND_URL}/subscription/upgrade`
      });
    }

    next();
  };
};

/**
 * Usage limit enforcement middleware
 */
export const enforceUsageLimit = (limitType) => {
  return async (req, res, next) => {
    if (!req.subscription) {
      return res.status(500).json({
        success: false,
        error: 'Subscription data missing',
        code: 'SUBSCRIPTION_DATA_MISSING'
      });
    }

    const usageCheck = SubscriptionFeatures.checkUsageLimit(req.subscription, limitType);
    
    if (!usageCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: 'Usage limit exceeded',
        message: usageCheck.message,
        code: 'USAGE_LIMIT_EXCEEDED',
        limit: {
          type: limitType,
          used: usageCheck.used,
          limit: usageCheck.limit,
          resetDate: req.subscription.currentPeriodEnd
        },
        upgradeUrl: `${process.env.FRONTEND_URL}/subscription/upgrade`
      });
    }

    // Add usage info to response headers
    res.set({
      'X-Usage-Remaining': usageCheck.remaining?.toString() || 'unlimited',
      'X-Usage-Limit': usageCheck.limit?.toString() || 'unlimited'
    });

    next();
  };
};

/**
 * Trial period middleware
 */
export const allowTrialAccess = (req, res, next) => {
  if (!req.subscription) {
    return res.status(500).json({
      success: false,
      error: 'Subscription data missing',
      code: 'SUBSCRIPTION_DATA_MISSING'
    });
  }

  // Allow access if user has active subscription OR is in trial period
  if (req.subscription.isActive() || req.subscription.isTrialing()) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Subscription or trial required',
    message: 'This feature requires an active subscription or trial. Start your free trial to access premium features.',
    code: 'SUBSCRIPTION_OR_TRIAL_REQUIRED',
    trialAvailable: !req.subscription.trialEnd, // true if user hasn't used trial yet
    trialUrl: `${process.env.FRONTEND_URL}/subscription/trial`,
    upgradeUrl: `${process.env.FRONTEND_URL}/subscription/upgrade`
  });
};

/**
 * Admin access middleware for enterprise features
 */
export const requireAdminAccess = (req, res, next) => {
  if (!req.subscription) {
    return res.status(500).json({
      success: false,
      error: 'Subscription data missing',
      code: 'SUBSCRIPTION_DATA_MISSING'
    });
  }

  // Check if user has enterprise subscription
  if (req.subscription.tierId !== 'enterprise') {
    return res.status(403).json({
      success: false,
      error: 'Enterprise subscription required',
      message: 'Administrative features require an Enterprise subscription.',
      code: 'ENTERPRISE_SUBSCRIPTION_REQUIRED',
      currentTier: req.subscription.tierId,
      upgradeUrl: `${process.env.FRONTEND_URL}/subscription/enterprise`
    });
  }

  // Check if user has admin role (this would come from user profile in real app)
  const isAdmin = req.user.role === 'admin' || req.user.role === 'enterprise_admin';
  
  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Admin privileges required',
      message: 'You must have administrative privileges to access this feature.',
      code: 'ADMIN_PRIVILEGES_REQUIRED',
      userRole: req.user.role
    });
  }

  next();
};

/**
 * Subscription analytics middleware
 * Tracks usage and engagement metrics
 */
export const trackSubscriptionUsage = (eventType, metadata = {}) => {
  return async (req, res, next) => {
    try {
      if (req.subscription) {
        // Log usage event (in production, this would go to analytics service)
        console.log('Subscription usage event:', {
          userId: req.user.id,
          subscriptionTier: req.subscription.tierId,
          eventType,
          metadata,
          timestamp: new Date().toISOString()
        });

        // Increment usage counters for certain event types
        const usageMapping = {
          'daily_recommendation': 'dailyRecommendations',
          'ai_coach_session': 'aiCoachSessions',
          'community_post': 'communityPosts',
          'coaching_session': 'oneOnOneCoaching'
        };

        const limitType = usageMapping[eventType];
        if (limitType) {
          req.subscription.incrementUsage(limitType);
          await mockSubscriptionDB.updateSubscription(req.user.id, req.subscription);
        }
      }
      
      next();
    } catch (error) {
      console.error('Subscription usage tracking error:', error);
      // Don't block the request for analytics errors
      next();
    }
  };
};

export default {
  subscriptionStatus,
  requireActiveSubscription,
  requirePremiumSubscription,
  requireSubscriptionTier,
  requireFeatureAccess,
  enforceUsageLimit,
  allowTrialAccess,
  requireAdminAccess,
  trackSubscriptionUsage
};