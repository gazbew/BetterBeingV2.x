import aiRecommendationService from '../services/aiRecommendationService.js';
import aiInsightsService from '../services/aiInsightsService.js';
import { UserWellnessProfile } from '../models/wellnessModels.js';

/**
 * Recommendations Controller
 * Handles all AI-powered wellness recommendation endpoints
 */
class RecommendationsController {
  
  /**
   * Get daily personalized wellness recommendations
   * GET /api/recommendations/daily
   */
  async getDailyRecommendations(req, res) {
    try {
      const userId = req.user?.id || 'demo_user';
      const timeContext = {
        currentHour: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        season: this.getCurrentSeason()
      };

      // Get or create user wellness profile
      const userProfile = await this.getUserProfile(userId, req.query);

      // Generate AI-powered daily recommendations
      const recommendations = await aiRecommendationService.generateDailyRecommendations(
        userProfile, 
        timeContext
      );

      // Add contextual information
      const response = {
        success: true,
        data: {
          recommendations,
          context: {
            timeOfDay: this.getTimeOfDayLabel(timeContext.currentHour),
            personalizedFor: userId,
            basedOn: {
              currentMetrics: userProfile.currentMetrics,
              goals: userProfile.goals,
              historicalTrends: userProfile.historicalData.length > 0
            },
            lastUpdated: new Date().toISOString()
          },
          meta: {
            totalRecommendations: recommendations.length,
            highPriority: recommendations.filter(r => r.priority === 'high').length,
            categories: [...new Set(recommendations.map(r => r.category))]
          }
        },
        message: `Generated ${recommendations.length} personalized recommendations for your wellness journey.`
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Error generating daily recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate daily recommendations',
        message: 'Our AI is temporarily unavailable. Please try again in a few moments.',
        code: 'RECOMMENDATION_SERVICE_ERROR'
      });
    }
  }

  /**
   * Get personalized product recommendations
   * GET /api/recommendations/products
   */
  async getProductRecommendations(req, res) {
    try {
      const userId = req.user?.id || 'demo_user';
      const limit = Math.min(parseInt(req.query.limit) || 8, 20); // Max 20 products
      const category = req.query.category; // Optional category filter

      // Get user wellness profile
      const userProfile = await this.getUserProfile(userId, req.query);

      // Generate product recommendations
      let productRecommendations = await aiRecommendationService.generateProductRecommendations(
        userProfile,
        category ? 50 : limit // Get more if filtering by category
      );

      // Filter by category if specified
      if (category) {
        productRecommendations = productRecommendations
          .filter(rec => rec.category === category)
          .slice(0, limit);
      }

      // Enhance recommendations with additional context
      const enhancedRecommendations = productRecommendations.map(rec => ({
        ...rec,
        personalizedScore: Math.round(rec.confidence * 100),
        estimatedDelivery: this.calculateDeliveryTime(),
        suitabilityReason: rec.personalizedReason,
        similarUsers: this.generateSimilarUserStats(),
        sustainabilityBadge: rec.sustainabilityScore >= 4.0 ? 'eco_friendly' : null
      }));

      const response = {
        success: true,
        data: {
          products: enhancedRecommendations,
          userProfile: {
            primaryNeeds: this.identifyPrimaryNeeds(userProfile),
            wellnessGoals: userProfile.goals,
            currentFocus: this.getCurrentFocus(userProfile)
          },
          filters: {
            availableCategories: [...new Set(enhancedRecommendations.map(r => r.category))],
            priceRange: this.calculatePriceRange(enhancedRecommendations),
            sustainabilityOptions: ['all', 'eco_friendly']
          },
          meta: {
            totalProducts: enhancedRecommendations.length,
            averageRating: this.calculateAverageRating(enhancedRecommendations),
            recommendationEngine: 'AI-powered personalization v1.2'
          }
        },
        message: `Found ${enhancedRecommendations.length} products tailored to your wellness profile.`
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Error generating product recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate product recommendations',
        message: 'Unable to load personalized products right now. Please try again shortly.',
        code: 'PRODUCT_RECOMMENDATION_ERROR'
      });
    }
  }

  /**
   * Submit feedback on recommendations
   * POST /api/recommendations/feedback
   */
  async submitFeedback(req, res) {
    try {
      const { 
        recommendationId, 
        rating, 
        helpfulness, 
        followed, 
        effectiveness, 
        comments 
      } = req.body;

      // Validate required fields
      if (!recommendationId || rating === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required feedback data',
          message: 'Please provide recommendationId and rating.',
          code: 'INVALID_FEEDBACK_DATA'
        });
      }

      // Validate rating range
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Invalid rating value',
          message: 'Rating must be between 1 and 5.',
          code: 'INVALID_RATING_RANGE'
        });
      }

      // Process feedback through AI service
      const feedbackResult = await aiRecommendationService.processFeedback(
        recommendationId,
        {
          rating,
          helpfulness,
          followed,
          effectiveness,
          comments,
          userId: req.user?.id || 'demo_user',
          timestamp: new Date()
        }
      );

      // Generate personalized thank you message
      const thankYouMessage = this.generateThankYouMessage(rating, followed);

      const response = {
        success: true,
        data: {
          feedbackId: `fb_${Date.now()}_${recommendationId}`,
          processed: true,
          aiLearning: feedbackResult.learningUpdate,
          impact: {
            personalizedImprovements: 'Your feedback helps us provide better recommendations for you.',
            communityImprovements: 'Anonymous feedback patterns help improve recommendations for all users.',
            estimatedImprovement: `${Math.round(Math.random() * 5 + 2)}% better recommendations`
          },
          nextSteps: rating <= 2 ? [
            'We\'ll adjust future recommendations based on your feedback',
            'Consider updating your wellness goals if they\'ve changed',
            'Our support team will review low-rated recommendations'
          ] : [
            'Thank you for helping us improve!',
            'We\'ll continue personalizing recommendations based on your preferences',
            'Check back tomorrow for new suggestions'
          ]
        },
        message: thankYouMessage
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Error processing feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process feedback',
        message: 'We appreciate your feedback, but couldn\'t save it right now. Please try again.',
        code: 'FEEDBACK_PROCESSING_ERROR'
      });
    }
  }

  /**
   * Get comprehensive wellness insights and analytics
   * GET /api/recommendations/insights
   */
  async getWellnessInsights(req, res) {
    try {
      const userId = req.user?.id || 'demo_user';
      const timeframe = req.query.timeframe || '30d';
      const includeComparison = req.query.compare === 'true';

      // Get user wellness profile
      const userProfile = await this.getUserProfile(userId, req.query);

      // Generate comprehensive AI insights
      const insights = await aiInsightsService.generateUserInsights(userProfile, timeframe);

      // Add wellness insights from recommendation service
      const wellnessInsights = await aiRecommendationService.generateWellnessInsights(userProfile);

      // Combine insights
      const combinedInsights = {
        ...insights,
        overallScore: wellnessInsights.overallWellnessScore,
        recommendedActions: wellnessInsights.recommendedActions,
        nextCheckIn: wellnessInsights.nextCheckIn,
        aiInsights: wellnessInsights.insights
      };

      // Add comparison data if requested
      if (includeComparison) {
        combinedInsights.benchmarkComparison = await aiInsightsService.compareToBenchmarks(userProfile);
      }

      const response = {
        success: true,
        data: {
          insights: combinedInsights,
          timeframe: {
            period: timeframe,
            dataPoints: userProfile.historicalData.length,
            reliability: userProfile.historicalData.length >= 7 ? 'high' : 
                        userProfile.historicalData.length >= 3 ? 'medium' : 'low'
          },
          recommendations: {
            immediate: combinedInsights.recommendedActions.slice(0, 3),
            longTerm: combinedInsights.recommendedActions.slice(3),
            nextAnalysis: this.calculateNextAnalysisDate()
          },
          meta: {
            analysisVersion: 'v2.1',
            generatedAt: new Date().toISOString(),
            personalizedFor: userId,
            aiConfidence: this.calculateOverallConfidence(combinedInsights)
          }
        },
        message: 'Your personalized wellness insights are ready!'
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Error generating wellness insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate wellness insights',
        message: 'Unable to analyze your wellness data right now. Please try again later.',
        code: 'INSIGHTS_GENERATION_ERROR'
      });
    }
  }

  /**
   * Update user wellness profile data
   * POST /api/recommendations/profile
   */
  async updateWellnessProfile(req, res) {
    try {
      const userId = req.user?.id || 'demo_user';
      const { metrics, goals, preferences } = req.body;

      // Validate metrics if provided
      if (metrics) {
        const validationError = this.validateWellnessMetrics(metrics);
        if (validationError) {
          return res.status(400).json({
            success: false,
            error: 'Invalid wellness metrics',
            message: validationError,
            code: 'INVALID_METRICS'
          });
        }
      }

      // Get existing profile or create new one
      const existingProfile = await this.getUserProfile(userId);
      
      // Update metrics if provided
      if (metrics) {
        existingProfile.addMetricEntry(metrics);
      }

      // Update goals if provided
      if (goals && Array.isArray(goals)) {
        existingProfile.goals = goals;
      }

      // Update preferences if provided
      if (preferences) {
        existingProfile.preferences = { ...existingProfile.preferences, ...preferences };
      }

      // Save profile (in real app, this would save to database)
      this.saveUserProfile(userId, existingProfile);

      const response = {
        success: true,
        data: {
          profile: {
            currentMetrics: existingProfile.currentMetrics,
            goals: existingProfile.goals,
            preferences: existingProfile.preferences,
            historicalEntries: existingProfile.historicalData.length,
            lastUpdated: existingProfile.lastUpdated
          },
          impact: {
            recommendationsWillUpdate: true,
            insightsWillImprove: existingProfile.historicalData.length >= 7,
            trendsAvailable: existingProfile.historicalData.length >= 14
          },
          nextSteps: [
            'Your recommendations will be updated based on this new data',
            existingProfile.historicalData.length < 7 ? 'Continue daily tracking for better insights' : 'Check your updated insights',
            'Consider setting specific wellness goals if you haven\'t already'
          ]
        },
        message: 'Your wellness profile has been updated successfully!'
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Error updating wellness profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update wellness profile',
        message: 'Unable to save your wellness data right now. Please try again.',
        code: 'PROFILE_UPDATE_ERROR'
      });
    }
  }

  // Private helper methods

  async getUserProfile(userId, queryData = {}) {
    // In a real application, this would fetch from database
    // For now, we'll create a mock profile with some historical data
    
    const mockData = {
      mood: parseInt(queryData.mood) || 3,
      energy: parseInt(queryData.energy) || 3,
      sleepQuality: parseInt(queryData.sleepQuality) || 3,
      stressLevel: parseInt(queryData.stressLevel) || 3
    };

    const profile = new UserWellnessProfile(userId, {
      mood: mockData.mood,
      energy: mockData.energy,
      sleepQuality: mockData.sleepQuality,
      stressLevel: mockData.stressLevel,
      goals: queryData.goals ? queryData.goals.split(',') : ['improve_sleep', 'reduce_stress'],
      preferences: {
        preferredTime: queryData.preferredTime || 'morning',
        difficulty: queryData.difficulty || 'moderate'
      }
    });

    // Add some mock historical data for demo purposes
    this.addMockHistoricalData(profile);

    return profile;
  }

  addMockHistoricalData(profile) {
    const days = 14; // Add 2 weeks of mock data
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate realistic variations around current metrics
      const variation = () => Math.random() * 0.8 - 0.4; // ±0.4 variation

      profile.historicalData.push({
        mood: Math.max(1, Math.min(5, profile.currentMetrics.mood + variation())),
        energy: Math.max(1, Math.min(5, profile.currentMetrics.energy + variation())),
        sleepQuality: Math.max(1, Math.min(5, profile.currentMetrics.sleepQuality + variation())),
        stressLevel: Math.max(1, Math.min(5, profile.currentMetrics.stressLevel + variation())),
        timestamp: date
      });
    }
  }

  saveUserProfile(userId, profile) {
    // In a real application, this would save to database
    console.log(`Saving profile for user ${userId}:`, profile);
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  getTimeOfDayLabel(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  identifyPrimaryNeeds(userProfile) {
    const needs = [];
    const metrics = userProfile.currentMetrics;

    if (metrics.sleepQuality <= 3) needs.push('Sleep Support');
    if (metrics.stressLevel >= 4) needs.push('Stress Management');
    if (metrics.energy <= 3) needs.push('Energy Enhancement');
    if (metrics.mood <= 3) needs.push('Mood Support');

    return needs.length > 0 ? needs : ['General Wellness'];
  }

  getCurrentFocus(userProfile) {
    const metrics = userProfile.currentMetrics;
    
    // Find the metric that needs most attention
    const scores = {
      sleep: 6 - metrics.sleepQuality, // Higher score = more attention needed
      stress: metrics.stressLevel,
      energy: 6 - metrics.energy,
      mood: 6 - metrics.mood
    };

    const topConcern = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    
    const focusMap = {
      sleep: 'Improving Sleep Quality',
      stress: 'Managing Stress Levels',
      energy: 'Boosting Energy',
      mood: 'Enhancing Mood'
    };

    return focusMap[topConcern] || 'Overall Wellness';
  }

  calculateDeliveryTime() {
    return {
      standard: '5-7 business days',
      express: '2-3 business days',
      sameDay: 'Available in select areas'
    };
  }

  generateSimilarUserStats() {
    return {
      percentageWithSimilarGoals: Math.floor(Math.random() * 30 + 40), // 40-70%
      averageRating: Math.round((Math.random() * 1 + 4) * 10) / 10, // 4.0-5.0
      recommendationRate: Math.floor(Math.random() * 20 + 75) // 75-95%
    };
  }

  calculatePriceRange(recommendations) {
    const prices = recommendations.map(r => r.price).filter(p => p);
    if (prices.length === 0) return { min: 0, max: 0 };
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 100) / 100
    };
  }

  calculateAverageRating(recommendations) {
    const ratings = recommendations.map(r => r.userReviews?.rating).filter(r => r);
    if (ratings.length === 0) return 0;
    
    return Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10) / 10;
  }

  generateThankYouMessage(rating, followed) {
    if (rating >= 4 && followed) {
      return 'Thank you for the positive feedback! We\'re glad our recommendation was helpful.';
    } else if (rating >= 4) {
      return 'Thanks for the great rating! We hope you\'ll try the recommendation when you have time.';
    } else if (rating <= 2) {
      return 'Thank you for your honest feedback. We\'ll work to improve our recommendations.';
    } else {
      return 'Thanks for your feedback! We\'ll use this to make better recommendations.';
    }
  }

  calculateNextAnalysisDate() {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }

  calculateOverallConfidence(insights) {
    // Simple confidence calculation based on data availability and consistency
    const dataPoints = insights.personalInsights?.length || 0;
    const hasCorrelations = insights.correlationAnalysis?.insights?.length > 0;
    const hasTrends = insights.predictiveInsights?.length > 0;
    
    let confidence = 0.5; // Base confidence
    
    if (dataPoints >= 7) confidence += 0.2;
    if (hasCorrelations) confidence += 0.15;
    if (hasTrends) confidence += 0.15;
    
    return Math.round(Math.min(confidence, 0.95) * 100); // Max 95% confidence
  }

  validateWellnessMetrics(metrics) {
    const requiredFields = ['mood', 'energy', 'sleepQuality', 'stressLevel'];
    
    for (const field of requiredFields) {
      if (metrics[field] === undefined) {
        return `Missing required field: ${field}`;
      }
      
      if (typeof metrics[field] !== 'number' || metrics[field] < 1 || metrics[field] > 5) {
        return `${field} must be a number between 1 and 5`;
      }
    }
    
    return null;
  }
}

export default new RecommendationsController();