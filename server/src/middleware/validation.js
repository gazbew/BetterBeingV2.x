import Joi from 'joi';

/**
 * Validation middleware for Better Being API
 * Uses Joi for request validation with wellness-specific schemas
 */

// Common wellness metrics schema
const wellnessMetricsSchema = Joi.object({
  mood: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'Mood must be a number',
    'number.integer': 'Mood must be a whole number',
    'number.min': 'Mood must be at least 1',
    'number.max': 'Mood must be no more than 5'
  }),
  energy: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'Energy must be a number',
    'number.integer': 'Energy must be a whole number', 
    'number.min': 'Energy must be at least 1',
    'number.max': 'Energy must be no more than 5'
  }),
  sleepQuality: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'Sleep quality must be a number',
    'number.integer': 'Sleep quality must be a whole number',
    'number.min': 'Sleep quality must be at least 1',
    'number.max': 'Sleep quality must be no more than 5'
  }),
  stressLevel: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'Stress level must be a number',
    'number.integer': 'Stress level must be a whole number',
    'number.min': 'Stress level must be at least 1',
    'number.max': 'Stress level must be no more than 5'
  })
});

// Wellness goals validation
const wellnessGoals = [
  'improve_sleep',
  'reduce_stress',
  'increase_energy', 
  'enhance_mood',
  'better_focus',
  'weight_management',
  'immune_support',
  'digestive_health'
];

const goalsSchema = Joi.string().valid(...wellnessGoals).messages({
  'any.only': `Goals must be one of: ${wellnessGoals.join(', ')}`
});

// Product categories validation
const productCategories = [
  'adaptogens',
  'minerals',
  'vitamins',
  'herbal_teas',
  'essential_oils',
  'mindfulness_tools', 
  'sleep_support',
  'immunity_boosters'
];

const categorySchema = Joi.string().valid(...productCategories).messages({
  'any.only': `Category must be one of: ${productCategories.join(', ')}`
});

/**
 * Daily recommendations query validation
 */
const dailyRecommendationQuerySchema = Joi.object({
  ...wellnessMetricsSchema.describe().keys,
  goals: Joi.string().pattern(/^[a-z_,]+$/).optional().messages({
    'string.pattern.base': 'Goals must be comma-separated values with only letters and underscores'
  }),
  preferredTime: Joi.string().valid('morning', 'afternoon', 'evening', 'anytime').optional(),
  difficulty: Joi.string().valid('easy', 'moderate', 'challenging').optional()
}).messages({
  'object.unknown': 'Unknown query parameter: {{#label}}'
});

/**
 * Product recommendations query validation  
 */
const productRecommendationQuerySchema = Joi.object({
  ...wellnessMetricsSchema.describe().keys,
  limit: Joi.number().integer().min(1).max(20).optional().messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be a whole number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 20'
  }),
  category: categorySchema.optional(),
  goals: Joi.string().pattern(/^[a-z_,]+$/).optional(),
  priceMin: Joi.number().min(0).optional().messages({
    'number.min': 'Minimum price cannot be negative'
  }),
  priceMax: Joi.number().min(0).optional().messages({
    'number.min': 'Maximum price cannot be negative'
  })
}).messages({
  'object.unknown': 'Unknown query parameter: {{#label}}'
});

/**
 * Feedback submission body validation
 */
const feedbackBodySchema = Joi.object({
  recommendationId: Joi.string().required().messages({
    'any.required': 'Recommendation ID is required',
    'string.empty': 'Recommendation ID cannot be empty'
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'any.required': 'Rating is required',
    'number.base': 'Rating must be a number',
    'number.integer': 'Rating must be a whole number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must be no more than 5'
  }),
  helpfulness: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'Helpfulness must be a number',
    'number.integer': 'Helpfulness must be a whole number',
    'number.min': 'Helpfulness must be at least 1',
    'number.max': 'Helpfulness must be no more than 5'
  }),
  followed: Joi.boolean().optional().messages({
    'boolean.base': 'Followed must be true or false'
  }),
  effectiveness: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'Effectiveness must be a number',
    'number.integer': 'Effectiveness must be a whole number',
    'number.min': 'Effectiveness must be at least 1',
    'number.max': 'Effectiveness must be no more than 5'
  }),
  comments: Joi.string().max(1000).optional().messages({
    'string.max': 'Comments cannot exceed 1000 characters'
  }),
  anonymous: Joi.boolean().optional().default(false)
}).messages({
  'object.unknown': 'Unknown field: {{#label}}'
});

/**
 * Wellness insights query validation
 */
const insightsQuerySchema = Joi.object({
  ...wellnessMetricsSchema.describe().keys,
  timeframe: Joi.string().valid('7d', '30d', '90d', '180d').optional().messages({
    'any.only': 'Timeframe must be one of: 7d, 30d, 90d, 180d'
  }),
  compare: Joi.string().valid('true', 'false').optional().messages({
    'any.only': 'Compare must be "true" or "false"'
  }),
  includePatterns: Joi.string().valid('true', 'false').optional(),
  includeCorrelations: Joi.string().valid('true', 'false').optional(),
  includePredictions: Joi.string().valid('true', 'false').optional()
}).messages({
  'object.unknown': 'Unknown query parameter: {{#label}}'
});

/**
 * Profile update body validation
 */
const profileUpdateSchema = Joi.object({
  metrics: wellnessMetricsSchema.optional(),
  goals: Joi.array().items(goalsSchema).max(8).optional().messages({
    'array.max': 'Cannot have more than 8 wellness goals'
  }),
  preferences: Joi.object({
    preferredTime: Joi.string().valid('morning', 'afternoon', 'evening', 'anytime').optional(),
    difficulty: Joi.string().valid('easy', 'moderate', 'challenging').optional(),
    notificationEnabled: Joi.boolean().optional(),
    language: Joi.string().valid('en', 'es', 'fr', 'de').optional(),
    units: Joi.string().valid('metric', 'imperial').optional(),
    privacy: Joi.object({
      shareData: Joi.boolean().optional(),
      anonymousAnalytics: Joi.boolean().optional()
    }).optional()
  }).optional()
}).min(1).messages({
  'object.min': 'At least one field (metrics, goals, or preferences) must be provided',
  'object.unknown': 'Unknown field: {{#label}}'
});

/**
 * Generic validation middleware factory
 */
const createValidationMiddleware = (schema, target = 'query') => {
  return (req, res, next) => {
    let dataToValidate;
    
    switch (target) {
      case 'body':
        dataToValidate = req.body;
        break;
      case 'params':
        dataToValidate = req.params;
        break;
      case 'query':
      default:
        dataToValidate = req.query;
        break;
    }

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'The request contains invalid data. Please check the errors below.',
        code: 'VALIDATION_ERROR',
        details: errorDetails,
        validationTarget: target
      });
    }

    // Replace original data with validated and converted values
    switch (target) {
      case 'body':
        req.body = value;
        break;
      case 'params':
        req.params = value;
        break;
      case 'query':
      default:
        req.query = value;
        break;
    }

    next();
  };
};

/**
 * Custom validation for goals string to array conversion
 */
const processGoalsString = (req, res, next) => {
  if (req.query.goals && typeof req.query.goals === 'string') {
    const goals = req.query.goals.split(',').map(g => g.trim()).filter(g => g);
    
    // Validate each goal
    const invalidGoals = goals.filter(goal => !wellnessGoals.includes(goal));
    
    if (invalidGoals.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wellness goals',
        message: `Invalid goals: ${invalidGoals.join(', ')}`,
        code: 'INVALID_GOALS',
        validGoals: wellnessGoals
      });
    }
    
    req.query.goals = goals;
  }
  
  next();
};

/**
 * Sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs to prevent XSS
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>\"']/g, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Subscription validation schemas
const subscriptionTiers = ['free', 'premium', 'pro', 'enterprise'];
const billingCycles = ['monthly', 'yearly'];

const subscriptionDataSchema = Joi.object({
  tierId: Joi.string().valid(...subscriptionTiers).required().messages({
    'any.required': 'Subscription tier is required',
    'any.only': `Tier must be one of: ${subscriptionTiers.join(', ')}`
  }),
  billingCycle: Joi.string().valid(...billingCycles).optional().default('monthly').messages({
    'any.only': `Billing cycle must be one of: ${billingCycles.join(', ')}`
  }),
  paymentMethodId: Joi.string().when('tierId', {
    is: Joi.valid('premium', 'pro', 'enterprise'),
    then: Joi.required().messages({
      'any.required': 'Payment method is required for paid subscriptions'
    }),
    otherwise: Joi.optional()
  }),
  trialPeriod: Joi.boolean().optional().default(false),
  metadata: Joi.object().optional()
}).messages({
  'object.unknown': 'Unknown field: {{#label}}'
});

const subscriptionUpgradeSchema = Joi.object({
  tierId: Joi.string().valid(...subscriptionTiers.filter(t => t !== 'free')).required().messages({
    'any.required': 'New subscription tier is required',
    'any.only': `Upgrade tier must be one of: ${subscriptionTiers.filter(t => t !== 'free').join(', ')}`
  }),
  billingCycle: Joi.string().valid(...billingCycles).optional().messages({
    'any.only': `Billing cycle must be one of: ${billingCycles.join(', ')}`
  })
}).messages({
  'object.unknown': 'Unknown field: {{#label}}'
});

const cancellationDataSchema = Joi.object({
  immediate: Joi.boolean().optional().default(false),
  reason: Joi.string().valid(
    'too_expensive', 'not_using', 'missing_features', 'poor_experience', 
    'technical_issues', 'found_alternative', 'other'
  ).optional().messages({
    'any.only': 'Reason must be a valid cancellation reason'
  }),
  feedback: Joi.string().max(1000).optional().messages({
    'string.max': 'Feedback cannot exceed 1000 characters'
  })
}).messages({
  'object.unknown': 'Unknown field: {{#label}}'
});

const paymentMethodDataSchema = Joi.object({
  paymentMethodId: Joi.string().required().messages({
    'any.required': 'Payment method ID is required',
    'string.empty': 'Payment method ID cannot be empty'
  }),
  setAsDefault: Joi.boolean().optional().default(true)
}).messages({
  'object.unknown': 'Unknown field: {{#label}}'
});

const billingHistoryQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).optional().default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be a whole number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 50'
  }),
  offset: Joi.number().integer().min(0).optional().default(0).messages({
    'number.base': 'Offset must be a number',
    'number.integer': 'Offset must be a whole number',
    'number.min': 'Offset cannot be negative'
  }),
  status: Joi.string().valid('paid', 'pending', 'failed', 'refunded').optional()
}).messages({
  'object.unknown': 'Unknown query parameter: {{#label}}'
});

// Export validation middleware functions
const validationMiddleware = {
  validateDailyRecommendationQuery: [
    sanitizeInput,
    createValidationMiddleware(dailyRecommendationQuerySchema, 'query'),
    processGoalsString
  ],

  validateProductRecommendationQuery: [
    sanitizeInput,
    createValidationMiddleware(productRecommendationQuerySchema, 'query'),
    processGoalsString
  ],

  validateFeedbackBody: [
    sanitizeInput,
    createValidationMiddleware(feedbackBodySchema, 'body')
  ],

  validateInsightsQuery: [
    sanitizeInput,
    createValidationMiddleware(insightsQuerySchema, 'query')
  ],

  validateProfileUpdate: [
    sanitizeInput,
    createValidationMiddleware(profileUpdateSchema, 'body')
  ],

  // Subscription validation middleware
  validateSubscriptionData: [
    sanitizeInput,
    createValidationMiddleware(subscriptionDataSchema, 'body')
  ],

  validateSubscriptionUpgrade: [
    sanitizeInput,
    createValidationMiddleware(subscriptionUpgradeSchema, 'body')
  ],

  validateCancellationData: [
    sanitizeInput,
    createValidationMiddleware(cancellationDataSchema, 'body')
  ],

  validatePaymentMethodData: [
    sanitizeInput,
    createValidationMiddleware(paymentMethodDataSchema, 'body')
  ],

  validateBillingHistoryQuery: [
    sanitizeInput,
    createValidationMiddleware(billingHistoryQuerySchema, 'query')
  ],

  // Generic validators
  validateWellnessMetrics: createValidationMiddleware(wellnessMetricsSchema),
  sanitizeInput
};

// Flatten middleware arrays
Object.keys(validationMiddleware).forEach(key => {
  if (Array.isArray(validationMiddleware[key])) {
    const middlewareArray = validationMiddleware[key];
    validationMiddleware[key] = (req, res, next) => {
      let index = 0;
      
      const runNext = (error) => {
        if (error) return next(error);
        
        if (index >= middlewareArray.length) {
          return next();
        }
        
        const middleware = middlewareArray[index++];
        middleware(req, res, runNext);
      };
      
      runNext();
    };
  }
});

export default validationMiddleware;