/**
 * Premium Features Service for Better Being Wellness Platform
 * Manages feature access control, usage tracking, and premium content delivery
 */

import { SubscriptionTiers, SubscriptionFeatures } from '../models/subscriptionModels.js';

/**
 * Premium feature definitions with access requirements
 */
export const PremiumFeatures = {
  AI_COACH: {
    id: 'ai_coach',
    name: 'AI Wellness Coach',
    description: 'Unlimited personalized AI coaching sessions',
    requiredTier: 'premium',
    usageLimit: 'aiCoachSessions',
    freeLimit: 0,
    premiumLimit: -1 // unlimited
  },
  
  ADVANCED_ANALYTICS: {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Deep wellness insights and trend analysis',
    requiredTier: 'premium',
    dataRetention: {
      free: 7, // days
      premium: 90,
      pro: 365,
      enterprise: -1 // unlimited
    }
  },

  COMMUNITY_ACCESS: {
    id: 'community_access',
    name: 'Wellness Community',
    description: 'Access to wellness community and mentorship circles',
    requiredTier: 'premium',
    usageLimit: 'communityPosts',
    freeLimit: 0,
    premiumLimit: 20 // per month
  },

  ONE_ON_ONE_COACHING: {
    id: 'one_on_one_coaching',
    name: '1:1 Wellness Coaching',
    description: 'Personal coaching sessions with certified wellness experts',
    requiredTier: 'pro',
    usageLimit: 'oneOnOneCoaching',
    freeLimit: 0,
    proLimit: 2, // per month
    enterpriseLimit: 4 // per month
  },

  CUSTOM_PROGRAMS: {
    id: 'custom_programs',
    name: 'Custom Wellness Programs',
    description: 'Personalized wellness program creation and management',
    requiredTier: 'pro',
    usageLimit: 'customPrograms',
    freeLimit: 2,
    proLimit: -1 // unlimited
  },

  TEAM_DASHBOARD: {
    id: 'team_dashboard',
    name: 'Team Wellness Dashboard',
    description: 'Enterprise team wellness management and analytics',
    requiredTier: 'enterprise',
    features: ['team_analytics', 'admin_controls', 'compliance_reports']
  },

  API_ACCESS: {
    id: 'api_access',
    name: 'API Access',
    description: 'Programmatic access to wellness data and features',
    requiredTier: 'enterprise',
    rateLimit: {
      free: 100, // requests per hour
      premium: 500,
      pro: 1000,
      enterprise: 5000
    }
  },

  PRIORITY_SUPPORT: {
    id: 'priority_support',
    name: 'Priority Support',
    description: '24/7 priority customer support',
    requiredTier: 'premium',
    responseTime: {
      free: '48 hours',
      premium: '12 hours',
      pro: '4 hours',
      enterprise: '1 hour'
    }
  }
};

/**
 * Content access levels for premium features
 */
export const ContentLibrary = {
  BASIC_CONTENT: {
    tier: 'free',
    includes: [
      'Basic wellness articles',
      'Simple meditation guides',
      'General nutrition tips',
      'Basic exercise routines'
    ]
  },

  PREMIUM_CONTENT: {
    tier: 'premium',
    includes: [
      'Expert-curated wellness content',
      'Advanced meditation programs',
      'Personalized nutrition plans',
      'Specialized workout routines',
      'Weekly live wellness sessions'
    ]
  },

  PRO_CONTENT: {
    tier: 'pro',
    includes: [
      'Exclusive masterclass content',
      'Advanced biometric analysis',
      'Custom wellness protocols',
      'Professional coaching materials',
      'Monthly wellness assessments'
    ]
  },

  ENTERPRISE_CONTENT: {
    tier: 'enterprise',
    includes: [
      'White-label content options',
      'Custom branded materials',
      'Team wellness resources',
      'Compliance documentation',
      'Advanced reporting templates'
    ]
  }
};

/**
 * Feature Access Control Service
 */
export class PremiumFeaturesService {
  
  /**
   * Check if user has access to a specific premium feature
   */
  static async checkFeatureAccess(userSubscription, featureId, options = {}) {
    try {
      const feature = PremiumFeatures[featureId.toUpperCase()];
      
      if (!feature) {
        return {
          hasAccess: false,
          error: 'Feature not found',
          code: 'FEATURE_NOT_FOUND'
        };
      }

      // Check subscription tier requirement
      const tierLevels = { free: 0, premium: 1, pro: 2, enterprise: 3 };
      const userTierLevel = tierLevels[userSubscription.tierId] || 0;
      const requiredTierLevel = tierLevels[feature.requiredTier] || 0;

      if (userTierLevel < requiredTierLevel) {
        return {
          hasAccess: false,
          error: 'Insufficient subscription tier',
          code: 'TIER_UPGRADE_REQUIRED',
          currentTier: userSubscription.tierId,
          requiredTier: feature.requiredTier,
          feature: {
            id: feature.id,
            name: feature.name,
            description: feature.description
          },
          upgradeOptions: this.getUpgradeOptions(userSubscription.tierId, feature.requiredTier)
        };
      }

      // Check usage limits if applicable
      if (feature.usageLimit) {
        const usageCheck = userSubscription.checkUsageLimit(feature.usageLimit);
        
        if (!usageCheck.allowed) {
          return {
            hasAccess: false,
            error: 'Usage limit exceeded',
            code: 'USAGE_LIMIT_EXCEEDED',
            usage: {
              type: feature.usageLimit,
              used: usageCheck.used,
              limit: usageCheck.limit,
              resetDate: userSubscription.currentPeriodEnd
            },
            feature: {
              id: feature.id,
              name: feature.name
            }
          };
        }
      }

      // Check subscription status
      if (!userSubscription.isActive()) {
        return {
          hasAccess: false,
          error: 'Inactive subscription',
          code: 'SUBSCRIPTION_INACTIVE',
          subscriptionStatus: userSubscription.status
        };
      }

      return {
        hasAccess: true,
        feature: {
          id: feature.id,
          name: feature.name,
          description: feature.description
        },
        tier: userSubscription.tierId,
        usageRemaining: feature.usageLimit ? 
          userSubscription.checkUsageLimit(feature.usageLimit).remaining : null
      };

    } catch (error) {
      console.error('Feature access check error:', error);
      return {
        hasAccess: false,
        error: 'Service error',
        code: 'FEATURE_ACCESS_ERROR'
      };
    }
  }

  /**
   * Get available content based on subscription tier
   */
  static getContentAccess(userSubscription) {
    const tierLevels = { free: 0, premium: 1, pro: 2, enterprise: 3 };
    const userLevel = tierLevels[userSubscription.tierId] || 0;

    const availableContent = [];
    
    Object.values(ContentLibrary).forEach(content => {
      const contentLevel = tierLevels[content.tier] || 0;
      if (userLevel >= contentLevel) {
        availableContent.push({
          tier: content.tier,
          includes: content.includes,
          accessible: true
        });
      } else {
        availableContent.push({
          tier: content.tier,
          includes: content.includes,
          accessible: false,
          requiresUpgrade: true
        });
      }
    });

    return {
      currentTier: userSubscription.tierId,
      availableContent,
      totalAccessibleContent: availableContent
        .filter(c => c.accessible)
        .reduce((acc, c) => acc + c.includes.length, 0)
    };
  }

  /**
   * Get upgrade options for feature access
   */
  static getUpgradeOptions(currentTier, requiredTier) {
    const upgrades = [];
    const tiers = ['free', 'premium', 'pro', 'enterprise'];
    const currentIndex = tiers.indexOf(currentTier);
    const requiredIndex = tiers.indexOf(requiredTier);

    for (let i = requiredIndex; i < tiers.length; i++) {
      const tier = SubscriptionTiers[tiers[i].toUpperCase()];
      if (tier && i > currentIndex) {
        upgrades.push({
          tierId: tier.id,
          name: tier.name,
          price: tier.price,
          billingCycle: tier.billingCycle,
          keyFeatures: tier.features.slice(0, 3), // Top 3 features
          savings: tier.billingCycle === 'yearly' ? '20%' : null
        });
      }
    }

    return upgrades;
  }

  /**
   * Track premium feature usage
   */
  static async trackFeatureUsage(userSubscription, featureId, metadata = {}) {
    try {
      const feature = PremiumFeatures[featureId.toUpperCase()];
      
      if (!feature || !feature.usageLimit) {
        return { tracked: false, reason: 'No usage tracking for this feature' };
      }

      // Increment usage counter
      userSubscription.incrementUsage(feature.usageLimit);

      // Log usage analytics
      console.log('Premium feature usage:', {
        userId: userSubscription.userId,
        featureId,
        featureName: feature.name,
        tier: userSubscription.tierId,
        usageType: feature.usageLimit,
        newUsageCount: userSubscription.usage[feature.usageLimit],
        metadata,
        timestamp: new Date().toISOString()
      });

      return {
        tracked: true,
        feature: feature.name,
        usageCount: userSubscription.usage[feature.usageLimit],
        remainingUsage: userSubscription.checkUsageLimit(feature.usageLimit).remaining
      };

    } catch (error) {
      console.error('Feature usage tracking error:', error);
      return { tracked: false, error: error.message };
    }
  }

  /**
   * Get premium feature recommendations
   */
  static getFeatureRecommendations(userSubscription) {
    const currentTier = userSubscription.tierId;
    const recommendations = [];

    // Recommend features based on current tier
    Object.values(PremiumFeatures).forEach(feature => {
      const tierLevels = { free: 0, premium: 1, pro: 2, enterprise: 3 };
      const userLevel = tierLevels[currentTier] || 0;
      const featureLevel = tierLevels[feature.requiredTier] || 0;

      if (featureLevel > userLevel) {
        recommendations.push({
          featureId: feature.id,
          featureName: feature.name,
          description: feature.description,
          requiredTier: feature.requiredTier,
          benefits: this.getFeatureBenefits(feature.id),
          upgradeRequired: true
        });
      }
    });

    return {
      currentTier,
      availableUpgrades: recommendations,
      nextTierBenefits: this.getNextTierBenefits(currentTier)
    };
  }

  /**
   * Get feature benefits for marketing/upsell purposes
   */
  static getFeatureBenefits(featureId) {
    const benefits = {
      AI_COACH: [
        'Unlimited personalized wellness recommendations',
        '24/7 AI-powered health insights',
        'Adaptive coaching based on your progress'
      ],
      ADVANCED_ANALYTICS: [
        'Deep wellness trend analysis',
        'Predictive health insights',
        'Comprehensive progress tracking'
      ],
      ONE_ON_ONE_COACHING: [
        'Personal sessions with certified coaches',
        'Customized wellness strategies',
        'Direct support and accountability'
      ],
      TEAM_DASHBOARD: [
        'Team wellness overview',
        'Employee engagement metrics',
        'Custom reporting and compliance'
      ]
    };

    return benefits[featureId] || ['Enhanced wellness features', 'Professional support', 'Advanced capabilities'];
  }

  /**
   * Get next tier benefits for upgrade motivation
   */
  static getNextTierBenefits(currentTier) {
    const nextTierMap = {
      free: 'premium',
      premium: 'pro',
      pro: 'enterprise',
      enterprise: null
    };

    const nextTier = nextTierMap[currentTier];
    if (!nextTier) return null;

    const tier = SubscriptionTiers[nextTier.toUpperCase()];
    return {
      tier: nextTier,
      name: tier.name,
      price: tier.price,
      features: tier.features,
      keyBenefits: tier.features.slice(0, 4) // Top 4 benefits
    };
  }
}

export default PremiumFeaturesService;