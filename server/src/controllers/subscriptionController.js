import { 
  SubscriptionTiers, 
  mockSubscriptionDB, 
  UserSubscription, 
  BillingHistory,
  SubscriptionStatus 
} from '../models/subscriptionModels.js';
import { validateStripePayment, createStripeSubscription } from '../services/stripeService.js';

/**
 * Get available subscription plans
 * @route GET /api/subscriptions/plans
 */
export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = Object.values(SubscriptionTiers).map(tier => ({
      id: tier.id,
      name: tier.name,
      price: tier.price,
      billingCycle: tier.billingCycle,
      features: tier.features,
      limits: tier.limits,
      recommended: tier.id === 'premium', // Mark premium as recommended
      popular: tier.id === 'premium',
      savings: tier.billingCycle === 'yearly' ? '20%' : null
    }));

    // Add yearly pricing options
    const plansWithYearly = plans.map(plan => {
      if (plan.id !== 'free') {
        return {
          ...plan,
          pricing: {
            monthly: {
              price: plan.price,
              total: plan.price,
              savings: null
            },
            yearly: {
              price: Math.round(plan.price * 10 * 0.8), // 20% discount
              total: Math.round(plan.price * 12 * 0.8),
              savings: '20%',
              monthlySavings: Math.round(plan.price * 2.4) // 20% of yearly
            }
          }
        };
      }
      return plan;
    });

    res.json({
      success: true,
      data: {
        plans: plansWithYearly,
        currency: 'USD',
        trialPeriod: {
          available: true,
          duration: 14, // days
          tiersIncluded: ['premium', 'pro']
        },
        guarantees: {
          moneyBackDays: 30,
          cancelAnytime: true
        }
      },
      message: 'Subscription plans retrieved successfully'
    });

  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve subscription plans',
      message: 'Unable to load subscription plans. Please try again.',
      code: 'PLANS_FETCH_ERROR'
    });
  }
};

/**
 * Get current user subscription details
 * @route GET /api/subscriptions/current
 */
export const getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await mockSubscriptionDB.getSubscription(req.user.id);
    const tier = subscription.getTier();

    // Calculate usage percentages for display
    const usageStats = {};
    Object.keys(tier.limits).forEach(limitType => {
      const usage = subscription.checkUsageLimit(limitType);
      if (usage.limit > 0) {
        usageStats[limitType] = {
          used: usage.used,
          limit: usage.limit,
          remaining: usage.remaining,
          percentage: Math.round((usage.used / usage.limit) * 100)
        };
      } else if (usage.limit === -1) {
        usageStats[limitType] = {
          used: usage.used,
          limit: 'unlimited',
          remaining: 'unlimited',
          percentage: 0
        };
      }
    });

    res.json({
      success: true,
      data: {
        subscription: {
          id: subscription.subscriptionId,
          tier: {
            id: tier.id,
            name: tier.name,
            price: tier.price,
            billingCycle: subscription.billingCycle
          },
          status: subscription.status,
          isActive: subscription.isActive(),
          isPremium: subscription.isPremium(),
          isTrialing: subscription.isTrialing(),
          currentPeriod: {
            start: subscription.currentPeriodStart,
            end: subscription.currentPeriodEnd
          },
          billing: {
            nextBillingDate: subscription.currentPeriodEnd,
            nextBillingAmount: subscription.getNextBillingAmount(),
            daysUntilRenewal: subscription.daysUntilRenewal()
          },
          trial: {
            isTrialing: subscription.isTrialing(),
            trialEnd: subscription.trialEnd,
            trialDaysRemaining: subscription.trialEnd ? 
              Math.max(0, Math.ceil((new Date(subscription.trialEnd) - new Date()) / (1000 * 60 * 60 * 24))) : 0
          },
          cancellation: {
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            canceledAt: subscription.canceledAt
          },
          usage: usageStats,
          features: tier.features,
          paymentMethod: subscription.paymentMethod
        }
      },
      message: 'Current subscription retrieved successfully'
    });

  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve subscription',
      message: 'Unable to load your subscription details. Please try again.',
      code: 'SUBSCRIPTION_FETCH_ERROR'
    });
  }
};

/**
 * Create new subscription
 * @route POST /api/subscriptions/subscribe
 */
export const createSubscription = async (req, res) => {
  try {
    const { tierId, billingCycle = 'monthly', paymentMethodId, trialPeriod = false } = req.body;

    // Validate tier
    if (!SubscriptionTiers[tierId.toUpperCase()]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription tier',
        message: 'The specified subscription tier is not valid.',
        code: 'INVALID_TIER'
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await mockSubscriptionDB.getSubscription(req.user.id);
    if (existingSubscription.isActive() && existingSubscription.tierId !== 'free') {
      return res.status(400).json({
        success: false,
        error: 'Active subscription exists',
        message: 'You already have an active subscription. Use the upgrade endpoint to change your plan.',
        code: 'SUBSCRIPTION_EXISTS',
        currentSubscription: {
          tier: existingSubscription.tierId,
          status: existingSubscription.status
        }
      });
    }

    const tier = SubscriptionTiers[tierId.toUpperCase()];
    
    // For free tier, no payment processing needed
    if (tierId === 'free') {
      const subscription = await mockSubscriptionDB.updateSubscription(req.user.id, {
        tierId: 'free',
        status: SubscriptionStatus.ACTIVE,
        billingCycle: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
        paymentMethodId: null
      });

      return res.json({
        success: true,
        data: { subscription },
        message: 'Successfully subscribed to free plan'
      });
    }

    // For paid tiers, process payment (mock implementation)
    let stripeSubscriptionId = null;
    let stripeCustomerId = null;

    try {
      // In production, this would create actual Stripe subscription
      const stripeResult = await createStripeSubscription({
        customerId: req.user.stripeCustomerId,
        email: req.user.email,
        paymentMethodId,
        priceId: `price_${tierId}_${billingCycle}`, // Stripe price ID
        trialPeriod: trialPeriod && ['premium', 'pro'].includes(tierId) ? 14 : 0
      });

      stripeSubscriptionId = stripeResult.subscriptionId;
      stripeCustomerId = stripeResult.customerId;

    } catch (stripeError) {
      return res.status(400).json({
        success: false,
        error: 'Payment processing failed',
        message: 'Unable to process payment. Please check your payment method and try again.',
        code: 'PAYMENT_FAILED',
        details: stripeError.message
      });
    }

    // Create subscription record
    const subscriptionData = {
      userId: req.user.id,
      tierId,
      status: trialPeriod ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
      billingCycle,
      stripeSubscriptionId,
      stripeCustomerId,
      paymentMethodId,
      paymentMethod: {
        type: 'card',
        last4: '****', // In production, get from Stripe
        brand: 'visa' // In production, get from Stripe
      },
      trialEnd: trialPeriod ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null
    };

    const subscription = await mockSubscriptionDB.createSubscription(subscriptionData);

    // Create initial billing record
    if (!trialPeriod) {
      await mockSubscriptionDB.addBillingRecord({
        userId: req.user.id,
        subscriptionId: subscription.subscriptionId,
        amount: tier.price,
        currency: 'usd',
        status: 'paid',
        description: `${tier.name} - ${billingCycle} subscription`,
        billingPeriod: {
          start: subscription.currentPeriodStart,
          end: subscription.currentPeriodEnd
        },
        paidAt: new Date()
      });
    }

    res.status(201).json({
      success: true,
      data: { 
        subscription,
        tier: {
          name: tier.name,
          features: tier.features
        },
        trial: trialPeriod ? {
          daysRemaining: 14,
          trialEnd: subscription.trialEnd
        } : null
      },
      message: trialPeriod 
        ? `Successfully started ${tier.name} trial - 14 days free!`
        : `Successfully subscribed to ${tier.name}!`
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Subscription creation failed',
      message: 'Unable to create subscription. Please try again.',
      code: 'SUBSCRIPTION_CREATE_ERROR'
    });
  }
};

/**
 * Upgrade subscription to higher tier
 * @route PUT /api/subscriptions/upgrade
 */
export const upgradeSubscription = async (req, res) => {
  try {
    const { tierId, billingCycle } = req.body;
    const currentSubscription = await mockSubscriptionDB.getSubscription(req.user.id);

    // Validate new tier
    if (!SubscriptionTiers[tierId.toUpperCase()]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription tier',
        code: 'INVALID_TIER'
      });
    }

    const currentTier = currentSubscription.getTier();
    const newTier = SubscriptionTiers[tierId.toUpperCase()];

    // Check if it's actually an upgrade
    const tierLevels = { free: 0, premium: 1, pro: 2, enterprise: 3 };
    const currentLevel = tierLevels[currentTier.id];
    const newLevel = tierLevels[newTier.id];

    if (newLevel <= currentLevel) {
      return res.status(400).json({
        success: false,
        error: 'Invalid upgrade',
        message: 'You can only upgrade to a higher tier. Use the downgrade endpoint for lower tiers.',
        code: 'INVALID_UPGRADE'
      });
    }

    // Process upgrade payment (prorated amount)
    const daysRemaining = currentSubscription.daysUntilRenewal();
    const prorationAmount = Math.max(0, 
      Math.round(((newTier.price - currentTier.price) * daysRemaining) / 30 * 100) / 100
    );

    // Update subscription
    const upgradedSubscription = await mockSubscriptionDB.updateSubscription(req.user.id, {
      tierId: newTier.id,
      billingCycle: billingCycle || currentSubscription.billingCycle,
      updatedAt: new Date()
    });

    // Create billing record for upgrade
    if (prorationAmount > 0) {
      await mockSubscriptionDB.addBillingRecord({
        userId: req.user.id,
        subscriptionId: upgradedSubscription.subscriptionId,
        amount: prorationAmount,
        currency: 'usd',
        status: 'paid',
        description: `Upgrade to ${newTier.name} - Prorated amount`,
        paidAt: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        subscription: upgradedSubscription,
        upgrade: {
          from: currentTier.name,
          to: newTier.name,
          prorationAmount,
          effectiveImmediately: true,
          newFeatures: newTier.features.filter(f => !currentTier.features.includes(f))
        }
      },
      message: `Successfully upgraded to ${newTier.name}!`
    });

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Subscription upgrade failed',
      message: 'Unable to upgrade subscription. Please try again.',
      code: 'SUBSCRIPTION_UPGRADE_ERROR'
    });
  }
};

/**
 * Cancel subscription
 * @route DELETE /api/subscriptions/cancel
 */
export const cancelSubscription = async (req, res) => {
  try {
    const { immediate = false, reason, feedback } = req.body;
    const subscription = await mockSubscriptionDB.getSubscription(req.user.id);

    if (!subscription.isActive()) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription',
        message: 'You do not have an active subscription to cancel.',
        code: 'NO_ACTIVE_SUBSCRIPTION'
      });
    }

    const cancellationData = {
      cancelAtPeriodEnd: !immediate,
      canceledAt: new Date()
    };

    if (immediate) {
      cancellationData.status = SubscriptionStatus.CANCELED;
      cancellationData.currentPeriodEnd = new Date(); // End immediately
    }

    const canceledSubscription = await mockSubscriptionDB.updateSubscription(
      req.user.id, 
      cancellationData
    );

    // Log cancellation reason and feedback for analytics
    console.log('Subscription cancellation:', {
      userId: req.user.id,
      subscriptionTier: subscription.tierId,
      reason,
      feedback,
      immediate,
      timestamp: new Date().toISOString()
    });

    const response = {
      success: true,
      data: {
        subscription: canceledSubscription,
        cancellation: {
          immediate,
          effectiveDate: immediate ? new Date() : subscription.currentPeriodEnd,
          accessUntil: immediate ? new Date() : subscription.currentPeriodEnd,
          refundEligible: immediate && subscription.daysUntilRenewal() > 25, // within 30 days
          reason,
          feedback
        }
      },
      message: immediate 
        ? 'Subscription canceled immediately. Your access has ended.'
        : `Subscription canceled. You'll retain access until ${subscription.currentPeriodEnd.toLocaleDateString()}.`
    };

    // Add reactivation offer for non-immediate cancellations
    if (!immediate) {
      response.data.reactivation = {
        available: true,
        deadline: subscription.currentPeriodEnd,
        discountOffer: {
          percentage: 25,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      };
    }

    res.json(response);

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Subscription cancellation failed',
      message: 'Unable to cancel subscription. Please try again.',
      code: 'SUBSCRIPTION_CANCEL_ERROR'
    });
  }
};

/**
 * Update payment method
 * @route POST /api/subscriptions/payment-method
 */
export const updatePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId, setAsDefault = true } = req.body;
    const subscription = await mockSubscriptionDB.getSubscription(req.user.id);

    if (!subscription.isPremium()) {
      return res.status(400).json({
        success: false,
        error: 'No paid subscription',
        message: 'Payment method can only be updated for paid subscriptions.',
        code: 'NO_PAID_SUBSCRIPTION'
      });
    }

    // In production, this would validate with Stripe
    const mockPaymentMethod = {
      id: paymentMethodId,
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025
    };

    const updatedSubscription = await mockSubscriptionDB.updateSubscription(req.user.id, {
      paymentMethodId,
      paymentMethod: mockPaymentMethod
    });

    res.json({
      success: true,
      data: {
        paymentMethod: mockPaymentMethod,
        subscription: {
          id: updatedSubscription.subscriptionId,
          nextBillingDate: updatedSubscription.currentPeriodEnd,
          nextBillingAmount: updatedSubscription.getNextBillingAmount()
        }
      },
      message: 'Payment method updated successfully'
    });

  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment method update failed',
      message: 'Unable to update payment method. Please try again.',
      code: 'PAYMENT_METHOD_UPDATE_ERROR'
    });
  }
};

/**
 * Get billing history
 * @route GET /api/subscriptions/billing-history
 */
export const getBillingHistory = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const billingHistory = await mockSubscriptionDB.getBillingHistory(
      req.user.id, 
      parseInt(limit)
    );

    const totalAmount = billingHistory.reduce((sum, record) => {
      return record.status === 'paid' ? sum + record.amount : sum;
    }, 0);

    res.json({
      success: true,
      data: {
        billingHistory,
        summary: {
          totalRecords: billingHistory.length,
          totalAmount,
          currency: 'USD',
          oldestRecord: billingHistory.length > 0 ? 
            billingHistory[billingHistory.length - 1].createdAt : null
        },
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: false // Mock implementation
        }
      },
      message: 'Billing history retrieved successfully'
    });

  } catch (error) {
    console.error('Get billing history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve billing history',
      message: 'Unable to load billing history. Please try again.',
      code: 'BILLING_HISTORY_ERROR'
    });
  }
};

/**
 * Stripe webhook handler
 * @route POST /api/subscriptions/webhook
 */
export const handleStripeWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('Stripe webhook received:', type);

    switch (type) {
      case 'customer.subscription.created':
        // Handle new subscription created
        break;
      
      case 'customer.subscription.updated':
        // Handle subscription changes
        break;
      
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        break;
      
      case 'invoice.payment_succeeded':
        // Handle successful payment
        const subscription = data.object.subscription;
        // Update subscription status and create billing record
        break;
      
      case 'invoice.payment_failed':
        // Handle failed payment
        break;
      
      default:
        console.log('Unhandled webhook type:', type);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({
      success: false,
      error: 'Webhook processing failed',
      code: 'WEBHOOK_ERROR'
    });
  }
};

export default {
  getSubscriptionPlans,
  getCurrentSubscription,
  createSubscription,
  upgradeSubscription,
  cancelSubscription,
  updatePaymentMethod,
  getBillingHistory,
  handleStripeWebhook
};