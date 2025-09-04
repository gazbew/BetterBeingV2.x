# Better Being Premium Subscription System

## 🌟 Overview

The Better Being Premium Subscription System provides a comprehensive wellness platform with tiered subscription management, premium feature access control, and seamless payment processing integration.

## 📋 Subscription Tiers

### Free Tier - $0/month
- **Features:**
  - Basic wellness tracking
  - Limited daily recommendations (3/day)
  - Basic mood and energy logging
  - Weekly wellness summary
  - Community access (read-only)
- **Limits:**
  - 3 daily recommendations
  - 7-day analytics history
  - 2 custom goals
  - No AI coach sessions

### Premium Tier - $19.99/month ⭐ *Recommended*
- **Features:**
  - Unlimited AI coaching with personalized recommendations
  - Advanced wellness analytics and insights
  - Community circle access with mentorship
  - Personalized wellness plans and goal tracking
  - Premium content library access
  - Priority email support
  - Weekly live wellness sessions
- **Limits:**
  - Unlimited daily recommendations
  - 90-day analytics history
  - 10 custom goals
  - 20 community posts/month

### Pro Tier - $39.99/month
- **Features:**
  - Everything in Premium
  - Personalized 1:1 coaching sessions (2/month)
  - Advanced biometric integrations
  - Custom wellness program creation
  - Exclusive masterclass access
  - Direct coach messaging
  - Monthly wellness assessment calls
- **Limits:**
  - Unlimited daily recommendations
  - 365-day analytics history
  - Unlimited custom goals
  - 2 one-on-one coaching sessions/month

### Enterprise Tier - $99.99/month
- **Features:**
  - Everything in Pro
  - Team wellness dashboard and analytics
  - Admin panel for team management
  - Custom integrations and API access
  - Dedicated success manager
  - White-label options
  - Advanced reporting and compliance tools
  - SSO integration
- **Limits:**
  - All features unlimited
  - 4 one-on-one coaching sessions/month
  - Up to 50 team members
  - 5 admin users

## 🚀 API Endpoints

### Public Endpoints

#### GET `/api/subscriptions/plans`
Get all available subscription plans with pricing and features.

```javascript
// Response
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "premium",
        "name": "Premium Tier",
        "price": 19.99,
        "billingCycle": "monthly",
        "features": ["Unlimited AI coaching", "Advanced analytics"],
        "limits": { "dailyRecommendations": -1 },
        "recommended": true
      }
    ],
    "trialPeriod": {
      "available": true,
      "duration": 14,
      "tiersIncluded": ["premium", "pro"]
    }
  }
}
```

### Authenticated Endpoints

#### GET `/api/subscriptions/current`
Get current user's subscription details and usage statistics.

**Headers:** `Authorization: Bearer <jwt_token>`

```javascript
// Response
{
  "success": true,
  "data": {
    "subscription": {
      "tier": { "id": "premium", "name": "Premium Tier", "price": 19.99 },
      "status": "active",
      "isActive": true,
      "isPremium": true,
      "usage": {
        "dailyRecommendations": {
          "used": 15,
          "limit": "unlimited",
          "percentage": 0
        }
      },
      "billing": {
        "nextBillingDate": "2024-10-01",
        "nextBillingAmount": 19.99,
        "daysUntilRenewal": 23
      }
    }
  }
}
```

#### POST `/api/subscriptions/subscribe`
Create a new subscription or start a trial.

**Headers:** `Authorization: Bearer <jwt_token>`

```javascript
// Request Body
{
  "tierId": "premium",
  "billingCycle": "monthly",
  "paymentMethodId": "pm_card_123",
  "trialPeriod": true
}

// Response
{
  "success": true,
  "data": {
    "subscription": { /* subscription object */ },
    "trial": {
      "daysRemaining": 14,
      "trialEnd": "2024-09-15T00:00:00.000Z"
    }
  },
  "message": "Successfully started Premium Tier trial - 14 days free!"
}
```

#### PUT `/api/subscriptions/upgrade`
Upgrade to a higher subscription tier.

**Headers:** `Authorization: Bearer <jwt_token>`

```javascript
// Request Body
{
  "tierId": "pro",
  "billingCycle": "monthly"
}

// Response
{
  "success": true,
  "data": {
    "upgrade": {
      "from": "Premium Tier",
      "to": "Pro Tier",
      "prorationAmount": 13.33,
      "effectiveImmediately": true,
      "newFeatures": ["1:1 coaching", "Custom programs"]
    }
  },
  "message": "Successfully upgraded to Pro Tier!"
}
```

#### DELETE `/api/subscriptions/cancel`
Cancel subscription with options for immediate or end-of-period cancellation.

**Headers:** `Authorization: Bearer <jwt_token>`

```javascript
// Request Body
{
  "immediate": false,
  "reason": "too_expensive",
  "feedback": "Great service but budget constraints"
}

// Response
{
  "success": true,
  "data": {
    "cancellation": {
      "immediate": false,
      "effectiveDate": "2024-10-01",
      "accessUntil": "2024-10-01",
      "refundEligible": false
    },
    "reactivation": {
      "available": true,
      "discountOffer": {
        "percentage": 25,
        "validUntil": "2024-09-08"
      }
    }
  }
}
```

#### POST `/api/subscriptions/payment-method`
Update payment method for active subscription.

**Headers:** `Authorization: Bearer <jwt_token>`

```javascript
// Request Body
{
  "paymentMethodId": "pm_new_card_456",
  "setAsDefault": true
}

// Response
{
  "success": true,
  "data": {
    "paymentMethod": {
      "type": "card",
      "last4": "4242",
      "brand": "visa",
      "expiryMonth": 12,
      "expiryYear": 2025
    },
    "subscription": {
      "nextBillingDate": "2024-10-01",
      "nextBillingAmount": 19.99
    }
  }
}
```

#### GET `/api/subscriptions/billing-history`
Get billing history and downloadable invoices.

**Headers:** `Authorization: Bearer <jwt_token>`
**Query Params:** `?limit=10&offset=0&status=paid`

```javascript
// Response
{
  "success": true,
  "data": {
    "billingHistory": [
      {
        "id": "inv_123",
        "amount": 19.99,
        "currency": "usd",
        "status": "paid",
        "description": "Premium Tier - monthly subscription",
        "paidAt": "2024-09-01T10:00:00.000Z",
        "downloadUrl": "https://invoice.stripe.com/inv_123/pdf"
      }
    ],
    "summary": {
      "totalRecords": 5,
      "totalAmount": 99.95,
      "currency": "USD"
    }
  }
}
```

### Premium Feature Endpoints

#### GET `/api/subscriptions/premium-analytics`
Access advanced analytics (Premium+ required).

**Headers:** `Authorization: Bearer <jwt_token>`

```javascript
// Response (Premium+ users)
{
  "success": true,
  "data": {
    "analytics": {
      "wellnessTrends": {
        "mood": { "current": 4.2, "trend": "+12%", "period": "30d" },
        "energy": { "current": 3.8, "trend": "+8%", "period": "30d" }
      },
      "insights": [
        "Your mood has improved 12% this month",
        "Morning meditation shows strongest correlation with better sleep"
      ]
    }
  }
}

// Response (Free users)
{
  "success": false,
  "error": "Feature access denied",
  "code": "PREMIUM_SUBSCRIPTION_REQUIRED",
  "upgradeUrl": "https://app.betterbeing.com/subscription/upgrade"
}
```

#### GET `/api/subscriptions/pro-coaching`
Access 1:1 coaching features (Pro+ required).

**Headers:** `Authorization: Bearer <jwt_token>`

#### GET `/api/subscriptions/enterprise-admin`
Enterprise admin dashboard (Enterprise + Admin role required).

**Headers:** `Authorization: Bearer <jwt_token>`

### Webhook Endpoint

#### POST `/api/subscriptions/webhook`
Stripe webhook handler for subscription events.

**Headers:** `stripe-signature: <webhook_signature>`

## 🛡️ Security & Middleware

### Authentication Middleware
- JWT token validation
- User context attachment
- Token expiration handling
- Refresh token recommendations

### Subscription Middleware
- Subscription status loading
- Feature access control
- Usage limit enforcement
- Premium feature gating

### Validation Middleware
- Request data validation using Joi
- Input sanitization
- Error response formatting
- Type conversion and defaults

### Rate Limiting
- IP-based rate limiting (100 requests/15min)
- User-specific rate limiting for premium features
- Webhook endpoint exclusions

## 💳 Payment Integration

### Stripe Integration
- Secure payment processing
- PCI compliance
- Multiple payment methods (cards, PayPal, Apple Pay)
- Automatic invoice generation
- Webhook event handling

### Mock Implementation
Current implementation uses mock Stripe services for development:
- `createStripeSubscription()` - Creates mock subscriptions
- `validateStripePayment()` - Validates payment methods
- `processStripeWebhook()` - Handles webhook events

### Production Setup
Replace mock services with actual Stripe integration:
```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

## 🏗️ Architecture

### Models
- **`UserSubscription`** - Core subscription model with usage tracking
- **`BillingHistory`** - Transaction and invoice records
- **`SubscriptionTiers`** - Feature definitions and pricing
- **`MockSubscriptionDatabase`** - In-memory storage for demo

### Services
- **`stripeService.js`** - Payment processing (mock implementation)
- **`premiumFeaturesService.js`** - Feature access control and recommendations

### Controllers
- **`subscriptionController.js`** - API endpoint handlers
- Comprehensive error handling
- Response formatting
- Business logic orchestration

### Middleware
- **`subscription.js`** - Premium feature middleware
- **`auth.js`** - Authentication and authorization
- **`validation.js`** - Request validation with subscription schemas

## 🧪 Testing

### Demo Script
Run the comprehensive test suite:

```bash
# Full test suite
node test-subscription-api.js

# Quick tests only
node test-subscription-api.js --quick

# Test specific user type
node test-subscription-api.js --user premium

# Help and options
node test-subscription-api.js --help
```

### Test Scenarios
- ✅ API health checks
- ✅ Subscription plan retrieval
- ✅ User subscription status
- ✅ Subscription creation with trials
- ✅ Tier upgrades with proration
- ✅ Payment method updates
- ✅ Billing history access
- ✅ Premium feature access control
- ✅ Usage limit enforcement
- ✅ Cancellation workflows

### Test Users
```javascript
const testUsers = {
  freeUser: { id: 'test_user_free', subscriptionTier: 'free' },
  premiumUser: { id: 'test_user_premium', subscriptionTier: 'premium' },
  proUser: { id: 'test_user_pro', subscriptionTier: 'pro' }
};
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Setup
Create `.env` file:
```env
PORT=3001
JWT_SECRET=better-being-wellness-secret-key-2024
FRONTEND_URL=http://localhost:3000
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Start Server
```bash
npm run dev
```

### 4. Test API
```bash
# Test subscription endpoints
node test-subscription-api.js

# Check health
curl http://localhost:3001/health

# Get subscription plans
curl http://localhost:3001/api/subscriptions/plans
```

## 📊 Usage Analytics

### Tracking Events
The system automatically tracks:
- Subscription creation/cancellation
- Feature usage by tier
- Payment method updates
- Billing events
- Usage limit hits

### Analytics Data
```javascript
{
  userId: 'user_123',
  subscriptionTier: 'premium',
  eventType: 'daily_recommendation',
  metadata: { source: 'mobile_app' },
  timestamp: '2024-09-01T10:00:00.000Z'
}
```

## 🔄 Usage Limits & Features

### Daily Recommendations
- **Free:** 3/day
- **Premium+:** Unlimited

### AI Coach Sessions
- **Free:** 0
- **Premium+:** Unlimited

### Analytics History
- **Free:** 7 days
- **Premium:** 90 days
- **Pro:** 365 days
- **Enterprise:** Unlimited

### Community Posts
- **Free:** 0/month
- **Premium:** 20/month
- **Pro+:** Unlimited

### 1:1 Coaching
- **Free/Premium:** 0/month
- **Pro:** 2/month
- **Enterprise:** 4/month

## 🛠️ Production Considerations

### Database Integration
Replace mock database with production database:
- PostgreSQL for ACID compliance
- Redis for session storage
- MongoDB for analytics data

### Stripe Integration
- Set up production Stripe account
- Configure webhook endpoints
- Implement subscription lifecycle management
- Add payment method management

### Monitoring & Logging
- Subscription event logging
- Payment failure alerts
- Usage analytics
- Performance monitoring

### Security
- PCI compliance for payment processing
- Data encryption at rest
- Secure webhook signature validation
- Rate limiting and DDoS protection

## 📚 API Documentation

Complete API documentation available at:
- Development: `http://localhost:3001/api/subscriptions/demo`
- Production: `https://docs.betterbeing.com/api/subscriptions`

### Response Format
All API responses follow a consistent format:
```javascript
{
  "success": boolean,
  "data": object,      // Present on success
  "error": string,     // Present on error
  "message": string,   // Human-readable message
  "code": string       // Error code for client handling
}
```

### Error Codes
- `SUBSCRIPTION_UPGRADE_REQUIRED` - Feature requires higher tier
- `USAGE_LIMIT_EXCEEDED` - Monthly usage limit reached
- `PAYMENT_FAILED` - Payment processing error
- `SUBSCRIPTION_INACTIVE` - Subscription not active
- `FEATURE_NOT_FOUND` - Invalid feature requested

## 🤝 Support

For technical support or questions:
- Email: support@betterbeing.com
- Documentation: https://docs.betterbeing.com
- GitHub Issues: https://github.com/betterbeing/api/issues

---

**Better Being Wellness Platform** - Empowering wellness through premium subscription experiences! 🌟