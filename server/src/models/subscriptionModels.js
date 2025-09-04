// Subscription models and schemas for the Better Being premium wellness platform

export const SubscriptionTiers = {
  FREE: {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    billingCycle: null,
    features: [
      'Basic wellness tracking',
      'Limited daily recommendations (3/day)',
      'Basic mood and energy logging',
      'Weekly wellness summary',
      'Community access (read-only)'
    ],
    limits: {
      dailyRecommendations: 3,
      aiCoachSessions: 0,
      analyticsHistoryDays: 7,
      customGoals: 2,
      communityPosts: 0,
      prioritySupport: false
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium Tier',
    price: 19.99,
    billingCycle: 'monthly',
    features: [
      'Unlimited AI coaching with personalized recommendations',
      'Advanced wellness analytics and insights',
      'Community circle access with mentorship',
      'Personalized wellness plans and goal tracking',
      'Premium content library access',
      'Priority email support',
      'Weekly live wellness sessions'
    ],
    limits: {
      dailyRecommendations: -1, // unlimited
      aiCoachSessions: -1, // unlimited
      analyticsHistoryDays: 90,
      customGoals: 10,
      communityPosts: 20,
      prioritySupport: true
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro Tier',
    price: 39.99,
    billingCycle: 'monthly',
    features: [
      'Everything in Premium',
      'Personalized 1:1 coaching sessions (2/month)',
      'Advanced biometric integrations',
      'Custom wellness program creation',
      'Exclusive masterclass access',
      'Direct coach messaging',
      'Monthly wellness assessment calls'
    ],
    limits: {
      dailyRecommendations: -1,
      aiCoachSessions: -1,
      analyticsHistoryDays: 365,
      customGoals: -1, // unlimited
      communityPosts: -1, // unlimited
      prioritySupport: true,
      oneOnOneCoaching: 2 // per month
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise Tier',
    price: 99.99,
    billingCycle: 'monthly',
    features: [
      'Everything in Pro',
      'Team wellness dashboard and analytics',
      'Admin panel for team management',
      'Custom integrations and API access',
      'Dedicated success manager',
      'White-label options',
      'Advanced reporting and compliance tools',
      'SSO integration'
    ],
    limits: {
      dailyRecommendations: -1,
      aiCoachSessions: -1,
      analyticsHistoryDays: -1, // unlimited
      customGoals: -1,
      communityPosts: -1,
      prioritySupport: true,
      oneOnOneCoaching: 4, // per month
      teamSize: 50,
      adminUsers: 5
    }
  }
};

export const BillingCycles = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime'
};

export const SubscriptionStatus = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired'
};

export const PaymentMethods = {
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay'
};

export class UserSubscription {
  constructor(data = {}) {
    this.userId = data.userId;
    this.subscriptionId = data.subscriptionId;
    this.tierId = data.tierId || 'free';
    this.status = data.status || SubscriptionStatus.ACTIVE;
    this.billingCycle = data.billingCycle || BillingCycles.MONTHLY;
    this.currentPeriodStart = data.currentPeriodStart || new Date();
    this.currentPeriodEnd = data.currentPeriodEnd || this.calculatePeriodEnd();
    this.trialEnd = data.trialEnd || null;
    this.cancelAtPeriodEnd = data.cancelAtPeriodEnd || false;
    this.canceledAt = data.canceledAt || null;
    this.stripeSubscriptionId = data.stripeSubscriptionId || null;
    this.stripeCustomerId = data.stripeCustomerId || null;
    this.paymentMethodId = data.paymentMethodId || null;
    this.paymentMethod = data.paymentMethod || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    
    // Usage tracking
    this.usage = {
      dailyRecommendations: data.usage?.dailyRecommendations || 0,
      aiCoachSessions: data.usage?.aiCoachSessions || 0,
      communityPosts: data.usage?.communityPosts || 0,
      oneOnOneCoaching: data.usage?.oneOnOneCoaching || 0,
      lastResetDate: data.usage?.lastResetDate || new Date()
    };
  }

  calculatePeriodEnd() {
    const start = this.currentPeriodStart || new Date();
    const end = new Date(start);
    
    switch (this.billingCycle) {
      case BillingCycles.MONTHLY:
        end.setMonth(end.getMonth() + 1);
        break;
      case BillingCycles.YEARLY:
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }
    
    return end;
  }

  getTier() {
    return SubscriptionTiers[this.tierId.toUpperCase()] || SubscriptionTiers.FREE;
  }

  isActive() {
    return this.status === SubscriptionStatus.ACTIVE || 
           this.status === SubscriptionStatus.TRIALING;
  }

  isPremium() {
    return this.tierId !== 'free' && this.isActive();
  }

  hasFeatureAccess(feature) {
    if (!this.isActive()) return false;
    
    const tier = this.getTier();
    return tier.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  }

  checkUsageLimit(limitType) {
    const tier = this.getTier();
    const limit = tier.limits[limitType];
    
    if (limit === -1) return { allowed: true, remaining: -1 }; // unlimited
    if (limit === 0) return { allowed: false, remaining: 0 };
    
    const currentUsage = this.usage[limitType] || 0;
    const remaining = Math.max(0, limit - currentUsage);
    
    return {
      allowed: remaining > 0,
      remaining: remaining,
      limit: limit,
      used: currentUsage
    };
  }

  incrementUsage(limitType, amount = 1) {
    if (!this.usage[limitType]) this.usage[limitType] = 0;
    this.usage[limitType] += amount;
    this.updatedAt = new Date();
  }

  resetMonthlyUsage() {
    this.usage = {
      dailyRecommendations: 0,
      aiCoachSessions: 0,
      communityPosts: 0,
      oneOnOneCoaching: 0,
      lastResetDate: new Date()
    };
  }

  isTrialing() {
    return this.status === SubscriptionStatus.TRIALING && 
           this.trialEnd && new Date() < new Date(this.trialEnd);
  }

  daysUntilRenewal() {
    const now = new Date();
    const renewalDate = new Date(this.currentPeriodEnd);
    const diffTime = renewalDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  getNextBillingAmount() {
    if (!this.isActive() || this.cancelAtPeriodEnd) return 0;
    
    const tier = this.getTier();
    return tier.price;
  }
}

export class BillingHistory {
  constructor(data = {}) {
    this.id = data.id;
    this.userId = data.userId;
    this.subscriptionId = data.subscriptionId;
    this.stripeInvoiceId = data.stripeInvoiceId;
    this.amount = data.amount;
    this.currency = data.currency || 'usd';
    this.status = data.status; // paid, pending, failed, refunded
    this.description = data.description;
    this.billingPeriod = {
      start: data.billingPeriod?.start,
      end: data.billingPeriod?.end
    };
    this.paidAt = data.paidAt;
    this.createdAt = data.createdAt || new Date();
    this.downloadUrl = data.downloadUrl;
  }
}

export class SubscriptionFeatures {
  static checkFeatureAccess(userSubscription, featureName) {
    if (!userSubscription.isActive()) {
      return {
        hasAccess: false,
        reason: 'subscription_inactive',
        message: 'Your subscription is not active. Please reactivate to access this feature.',
        upgradeRequired: true
      };
    }

    const tier = userSubscription.getTier();
    const hasFeature = tier.features.some(feature => 
      feature.toLowerCase().includes(featureName.toLowerCase())
    );

    if (!hasFeature) {
      return {
        hasAccess: false,
        reason: 'feature_not_included',
        message: `This feature is not included in your ${tier.name}. Upgrade to access advanced features.`,
        upgradeRequired: true,
        suggestedTiers: SubscriptionFeatures.getSuggestedTiers(featureName)
      };
    }

    return {
      hasAccess: true,
      tier: tier.name
    };
  }

  static checkUsageLimit(userSubscription, limitType) {
    const usage = userSubscription.checkUsageLimit(limitType);
    
    if (!usage.allowed) {
      const tier = userSubscription.getTier();
      return {
        allowed: false,
        reason: 'usage_limit_exceeded',
        message: `You've reached your ${limitType} limit for ${tier.name}. Upgrade for unlimited access.`,
        limit: usage.limit,
        used: usage.used,
        upgradeRequired: true
      };
    }

    return {
      allowed: true,
      remaining: usage.remaining,
      limit: usage.limit
    };
  }

  static getSuggestedTiers(featureName) {
    const suggestions = [];
    
    Object.values(SubscriptionTiers).forEach(tier => {
      if (tier.id !== 'free' && tier.features.some(f => 
        f.toLowerCase().includes(featureName.toLowerCase())
      )) {
        suggestions.push({
          id: tier.id,
          name: tier.name,
          price: tier.price
        });
      }
    });

    return suggestions.sort((a, b) => a.price - b.price);
  }
}

// Mock database storage (in production, this would use a real database)
export class MockSubscriptionDatabase {
  constructor() {
    this.subscriptions = new Map();
    this.billingHistory = new Map();
    this.customers = new Map();
  }

  async createSubscription(subscriptionData) {
    const subscription = new UserSubscription(subscriptionData);
    this.subscriptions.set(subscription.userId, subscription);
    return subscription;
  }

  async getSubscription(userId) {
    return this.subscriptions.get(userId) || new UserSubscription({ userId, tierId: 'free' });
  }

  async updateSubscription(userId, updateData) {
    const existing = await this.getSubscription(userId);
    Object.assign(existing, updateData);
    existing.updatedAt = new Date();
    this.subscriptions.set(userId, existing);
    return existing;
  }

  async addBillingRecord(billingData) {
    const record = new BillingHistory(billingData);
    if (!this.billingHistory.has(record.userId)) {
      this.billingHistory.set(record.userId, []);
    }
    this.billingHistory.get(record.userId).push(record);
    return record;
  }

  async getBillingHistory(userId, limit = 10) {
    const history = this.billingHistory.get(userId) || [];
    return history
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  async deleteSubscription(userId) {
    this.subscriptions.delete(userId);
    this.billingHistory.delete(userId);
    return true;
  }
}

// Global instance for demo purposes
export const mockSubscriptionDB = new MockSubscriptionDatabase();