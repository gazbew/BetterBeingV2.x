import { 
  WellnessMetrics, 
  WellnessGoals, 
  ProductCategories, 
  WellnessRecommendation, 
  ProductRecommendation,
  mockProducts 
} from '../models/wellnessModels.js';

/**
 * AI-Powered Wellness Recommendation Engine
 * Analyzes user wellness data to provide personalized recommendations
 */
class AIRecommendationService {
  constructor() {
    this.seasonalFactors = this.getSeasonalFactors();
    this.timeOfDayFactors = this.getTimeOfDayFactors();
  }

  /**
   * Generate daily wellness recommendations based on current metrics
   */
  async generateDailyRecommendations(userProfile, timeContext = {}) {
    const currentHour = new Date().getHours();
    const season = this.getCurrentSeason();
    const recommendations = [];

    // Morning recommendations (6 AM - 11 AM)
    if (currentHour >= 6 && currentHour < 12) {
      recommendations.push(...this.getMorningRecommendations(userProfile, season));
    }
    // Afternoon recommendations (12 PM - 5 PM)
    else if (currentHour >= 12 && currentHour < 18) {
      recommendations.push(...this.getAfternoonRecommendations(userProfile, season));
    }
    // Evening recommendations (6 PM - 10 PM)
    else if (currentHour >= 18 && currentHour < 23) {
      recommendations.push(...this.getEveningRecommendations(userProfile, season));
    }
    // Late night/early morning (11 PM - 5 AM)
    else {
      recommendations.push(...this.getNightRecommendations(userProfile));
    }

    // Add stress-based recommendations if stress is high
    if (userProfile.currentMetrics.stressLevel >= 4) {
      recommendations.push(...this.getStressReliefRecommendations(userProfile));
    }

    // Add energy recommendations if energy is low
    if (userProfile.currentMetrics.energy <= 2) {
      recommendations.push(...this.getEnergyBoostRecommendations(userProfile));
    }

    return this.prioritizeAndLimit(recommendations, 6);
  }

  /**
   * Generate personalized product recommendations
   */
  async generateProductRecommendations(userProfile, limit = 8) {
    const recommendations = [];
    const userNeeds = this.analyzeUserNeeds(userProfile);

    for (const [productId, product] of Object.entries(mockProducts)) {
      const score = this.calculateProductRelevanceScore(product, userProfile, userNeeds);
      
      if (score > 0.3) { // Minimum relevance threshold
        const recommendation = new ProductRecommendation({
          id: `product_${productId}_${Date.now()}`,
          type: 'product',
          title: `Try ${product.name}`,
          description: product.description,
          category: product.category,
          priority: score > 0.7 ? 'high' : score > 0.5 ? 'medium' : 'low',
          timeOfDay: this.getOptimalTimeForProduct(product),
          benefits: product.benefits,
          targetMetrics: product.targetMetrics,
          personalizedReason: this.generatePersonalizedReason(product, userProfile, userNeeds),
          confidence: score,
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          price: product.price,
          dosage: product.dosage,
          ingredients: product.ingredients,
          sustainabilityScore: product.sustainabilityScore,
          userReviews: product.userReviews
        });

        recommendations.push(recommendation);
      }
    }

    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Generate AI-powered wellness insights based on user data trends
   */
  async generateWellnessInsights(userProfile) {
    const trends = userProfile.getTrends();
    const weeklyAverages = userProfile.getWeeklyAverages();
    const insights = [];

    // Trend analysis insights
    if (trends) {
      insights.push(...this.generateTrendInsights(trends, userProfile));
    }

    // Pattern recognition insights
    insights.push(...this.generatePatternInsights(userProfile));

    // Goal progress insights
    if (userProfile.goals.length > 0) {
      insights.push(...this.generateGoalProgressInsights(userProfile, weeklyAverages));
    }

    // Seasonal wellness insights
    insights.push(...this.generateSeasonalInsights(weeklyAverages));

    return {
      insights,
      overallWellnessScore: this.calculateOverallWellnessScore(weeklyAverages),
      recommendedActions: this.generateRecommendedActions(weeklyAverages, trends),
      nextCheckIn: this.getNextCheckInRecommendation(userProfile)
    };
  }

  /**
   * Process user feedback on recommendations to improve AI
   */
  async processFeedback(recommendationId, feedback) {
    // In a real implementation, this would update ML models
    // For now, we'll simulate learning from feedback
    
    const feedbackData = {
      recommendationId,
      rating: feedback.rating,
      helpfulness: feedback.helpfulness,
      followed: feedback.followed,
      effectiveness: feedback.effectiveness,
      comments: feedback.comments,
      timestamp: new Date()
    };

    // Simulate ML model update
    console.log('AI Learning from feedback:', feedbackData);

    return {
      success: true,
      message: 'Thank you for your feedback! Our AI will learn from this to provide better recommendations.',
      learningUpdate: this.simulateMLUpdate(feedbackData)
    };
  }

  // Private helper methods

  getMorningRecommendations(userProfile, season) {
    const recommendations = [];

    // Energy-based morning routines
    if (userProfile.currentMetrics.energy <= 3) {
      recommendations.push(new WellnessRecommendation({
        id: `morning_energy_${Date.now()}`,
        type: 'activity',
        title: '10-Minute Morning Energizer',
        description: 'Light stretching and deep breathing to boost morning energy naturally',
        category: 'movement',
        priority: 'high',
        timeOfDay: 'morning',
        duration: 10,
        difficulty: 'easy',
        benefits: ['Increased energy', 'Better circulation', 'Mood boost'],
        targetMetrics: ['energy', 'mood'],
        personalizedReason: 'Your energy levels have been low recently. This gentle routine can help naturally boost your morning energy.',
        confidence: 0.8
      }));
    }

    // Mood support for morning
    if (userProfile.currentMetrics.mood <= 3) {
      recommendations.push(new WellnessRecommendation({
        id: `morning_mood_${Date.now()}`,
        type: 'lifestyle',
        title: 'Gratitude & Intention Setting',
        description: 'Start your day with 5 minutes of gratitude practice and positive intention setting',
        category: 'mindfulness',
        priority: 'medium',
        timeOfDay: 'morning',
        duration: 5,
        difficulty: 'easy',
        benefits: ['Improved mood', 'Positive mindset', 'Reduced anxiety'],
        targetMetrics: ['mood'],
        personalizedReason: 'Based on your recent mood patterns, starting the day with gratitude can help set a positive tone.',
        confidence: 0.7
      }));
    }

    return recommendations;
  }

  getAfternoonRecommendations(userProfile, season) {
    const recommendations = [];

    // Afternoon energy dip management
    if (userProfile.currentMetrics.energy <= 3) {
      recommendations.push(new WellnessRecommendation({
        id: `afternoon_energy_${Date.now()}`,
        type: 'activity',
        title: 'Power Walk Break',
        description: '15-minute outdoor walk to combat afternoon energy dip',
        category: 'movement',
        priority: 'medium',
        timeOfDay: 'afternoon',
        duration: 15,
        difficulty: 'easy',
        benefits: ['Energy boost', 'Mental clarity', 'Vitamin D'],
        targetMetrics: ['energy'],
        personalizedReason: 'A midday walk can naturally boost your energy without caffeine.',
        confidence: 0.75
      }));
    }

    return recommendations;
  }

  getEveningRecommendations(userProfile, season) {
    const recommendations = [];

    // Sleep preparation based on sleep quality
    if (userProfile.currentMetrics.sleepQuality <= 3) {
      recommendations.push(new WellnessRecommendation({
        id: `evening_sleep_${Date.now()}`,
        type: 'lifestyle',
        title: 'Digital Sunset Routine',
        description: 'Create a 1-hour wind-down routine with reduced screen time and calming activities',
        category: 'sleep_hygiene',
        priority: 'high',
        timeOfDay: 'evening',
        duration: 60,
        difficulty: 'moderate',
        benefits: ['Better sleep quality', 'Reduced stress', 'Improved recovery'],
        targetMetrics: ['sleep', 'stress'],
        personalizedReason: 'Your sleep quality could improve with a consistent evening routine that helps your body prepare for rest.',
        confidence: 0.85
      }));
    }

    // Stress reduction for evening
    if (userProfile.currentMetrics.stressLevel >= 4) {
      recommendations.push(new WellnessRecommendation({
        id: `evening_stress_${Date.now()}`,
        type: 'activity',
        title: 'Progressive Muscle Relaxation',
        description: 'Guided relaxation technique to release physical and mental tension',
        category: 'relaxation',
        priority: 'high',
        timeOfDay: 'evening',
        duration: 20,
        difficulty: 'easy',
        benefits: ['Stress relief', 'Muscle tension release', 'Better sleep preparation'],
        targetMetrics: ['stress', 'sleep'],
        personalizedReason: 'Your stress levels are elevated. This technique can help you unwind and prepare for restful sleep.',
        confidence: 0.8
      }));
    }

    return recommendations;
  }

  getNightRecommendations(userProfile) {
    return [
      new WellnessRecommendation({
        id: `night_sleep_${Date.now()}`,
        type: 'lifestyle',
        title: 'Optimize Sleep Environment',
        description: 'Ensure your bedroom is cool (65-68°F), dark, and quiet for optimal sleep',
        category: 'sleep_hygiene',
        priority: 'medium',
        timeOfDay: 'night',
        duration: 10,
        difficulty: 'easy',
        benefits: ['Better sleep quality', 'Faster sleep onset', 'Deeper sleep'],
        targetMetrics: ['sleep'],
        personalizedReason: 'Creating an optimal sleep environment can significantly improve your sleep quality.',
        confidence: 0.9
      })
    ];
  }

  getStressReliefRecommendations(userProfile) {
    return [
      new WellnessRecommendation({
        id: `stress_relief_${Date.now()}`,
        type: 'activity',
        title: '4-7-8 Breathing Technique',
        description: 'Calming breath work to activate your parasympathetic nervous system',
        category: 'breathwork',
        priority: 'high',
        timeOfDay: 'anytime',
        duration: 5,
        difficulty: 'easy',
        benefits: ['Immediate stress relief', 'Anxiety reduction', 'Better emotional regulation'],
        targetMetrics: ['stress'],
        personalizedReason: 'Your stress levels are high. This breathing technique can provide immediate relief.',
        confidence: 0.9
      })
    ];
  }

  getEnergyBoostRecommendations(userProfile) {
    return [
      new WellnessRecommendation({
        id: `energy_boost_${Date.now()}`,
        type: 'lifestyle',
        title: 'Hydration & Electrolyte Check',
        description: 'Ensure proper hydration with electrolyte-rich water or herbal tea',
        category: 'nutrition',
        priority: 'medium',
        timeOfDay: 'anytime',
        duration: 2,
        difficulty: 'easy',
        benefits: ['Increased energy', 'Better mental clarity', 'Improved physical performance'],
        targetMetrics: ['energy'],
        personalizedReason: 'Dehydration is a common cause of fatigue. Proper hydration can quickly boost energy levels.',
        confidence: 0.7
      })
    ];
  }

  analyzeUserNeeds(userProfile) {
    const needs = {
      stressReduction: userProfile.currentMetrics.stressLevel >= 3,
      sleepSupport: userProfile.currentMetrics.sleepQuality <= 3,
      energyBoost: userProfile.currentMetrics.energy <= 3,
      moodSupport: userProfile.currentMetrics.mood <= 3,
      overallWellness: true
    };

    // Add goal-based needs
    userProfile.goals.forEach(goal => {
      switch (goal) {
        case WellnessGoals.REDUCE_STRESS:
          needs.stressReduction = true;
          break;
        case WellnessGoals.IMPROVE_SLEEP:
          needs.sleepSupport = true;
          break;
        case WellnessGoals.INCREASE_ENERGY:
          needs.energyBoost = true;
          break;
        case WellnessGoals.ENHANCE_MOOD:
          needs.moodSupport = true;
          break;
      }
    });

    return needs;
  }

  calculateProductRelevanceScore(product, userProfile, userNeeds) {
    let score = 0;
    const maxScore = 1.0;

    // Check if product targets user's problem areas
    product.targetMetrics.forEach(metric => {
      switch (metric) {
        case 'stress':
          if (userNeeds.stressReduction) score += 0.3;
          break;
        case 'sleep':
          if (userNeeds.sleepSupport) score += 0.3;
          break;
        case 'energy':
          if (userNeeds.energyBoost) score += 0.3;
          break;
        case 'mood':
          if (userNeeds.moodSupport) score += 0.3;
          break;
      }
    });

    // Boost score for high-quality products
    if (product.userReviews.rating >= 4.5) score += 0.1;
    if (product.sustainabilityScore >= 4.0) score += 0.1;

    // Seasonal adjustments
    const season = this.getCurrentSeason();
    if (season === 'winter' && product.category === ProductCategories.VITAMINS) {
      score += 0.1; // Boost vitamins in winter
    }

    return Math.min(score, maxScore);
  }

  generatePersonalizedReason(product, userProfile, userNeeds) {
    const reasons = [];

    if (userNeeds.stressReduction && product.targetMetrics.includes('stress')) {
      reasons.push('to help manage your current stress levels');
    }
    if (userNeeds.sleepSupport && product.targetMetrics.includes('sleep')) {
      reasons.push('to support your sleep quality improvement goals');
    }
    if (userNeeds.energyBoost && product.targetMetrics.includes('energy')) {
      reasons.push('to naturally boost your energy levels');
    }
    if (userNeeds.moodSupport && product.targetMetrics.includes('mood')) {
      reasons.push('to support your mood and emotional well-being');
    }

    const primaryReason = reasons.length > 0 ? reasons[0] : 'to support your overall wellness journey';
    
    return `Based on your current wellness profile, this product is recommended ${primaryReason}. Its high-quality ingredients and positive user reviews make it a trusted choice for your wellness goals.`;
  }

  getOptimalTimeForProduct(product) {
    if (product.category === ProductCategories.SLEEP_SUPPORT || 
        product.targetMetrics.includes('sleep')) {
      return 'evening';
    }
    if (product.category === ProductCategories.VITAMINS || 
        product.targetMetrics.includes('energy')) {
      return 'morning';
    }
    return 'anytime';
  }

  generateTrendInsights(trends, userProfile) {
    const insights = [];

    Object.entries(trends).forEach(([metric, trend]) => {
      if (trend === 'improving') {
        insights.push({
          type: 'positive_trend',
          title: `Your ${metric} is improving!`,
          description: `Great news! Your ${metric} has shown consistent improvement over the past week.`,
          confidence: 0.8
        });
      } else if (trend === 'declining' || trend === 'worsening') {
        insights.push({
          type: 'concern_trend',
          title: `${metric.charAt(0).toUpperCase() + metric.slice(1)} needs attention`,
          description: `Your ${metric} has been declining recently. Consider focusing on activities that support this area.`,
          confidence: 0.7
        });
      }
    });

    return insights;
  }

  generatePatternInsights(userProfile) {
    // Simulate pattern recognition
    const insights = [];
    
    if (userProfile.historicalData.length >= 7) {
      // Check for weekly patterns
      const weekdayAverage = this.getWeekdayAverage(userProfile.historicalData);
      const weekendAverage = this.getWeekendAverage(userProfile.historicalData);
      
      if (weekdayAverage.mood < weekendAverage.mood - 0.5) {
        insights.push({
          type: 'pattern',
          title: 'Weekend vs Weekday Pattern Detected',
          description: 'Your mood tends to be significantly better on weekends. Consider incorporating more weekend-like activities into your weekday routine.',
          confidence: 0.6
        });
      }
    }

    return insights;
  }

  calculateOverallWellnessScore(metrics) {
    // Simple weighted average for overall wellness score
    const weights = {
      mood: 0.3,
      energy: 0.25,
      sleepQuality: 0.3,
      stressLevel: 0.15 // Inverted scoring for stress
    };

    const score = (
      metrics.mood * weights.mood +
      metrics.energy * weights.energy +
      metrics.sleepQuality * weights.sleepQuality +
      (6 - metrics.stressLevel) * weights.stressLevel // Invert stress score
    ) / 5 * 100;

    return Math.round(score);
  }

  prioritizeAndLimit(recommendations, limit) {
    return recommendations
      .sort((a, b) => {
        // Sort by priority, then confidence
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, limit);
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  getSeasonalFactors() {
    return {
      spring: { energy: 0.1, mood: 0.1 },
      summer: { energy: 0.2, mood: 0.15 },
      fall: { mood: -0.1, sleep: 0.1 },
      winter: { mood: -0.15, sleep: 0.1, energy: -0.1 }
    };
  }

  getTimeOfDayFactors() {
    return {
      morning: { energy: 0.1 },
      afternoon: { energy: -0.1 },
      evening: { stress: 0.1 },
      night: { sleep: 0.2 }
    };
  }

  simulateMLUpdate(feedbackData) {
    // Simulate machine learning model update
    return {
      modelVersion: '1.2.3',
      improvementAreas: ['recommendation_relevance', 'timing_optimization'],
      expectedImpact: 'Improved recommendation accuracy by 2-5%'
    };
  }

  getWeekdayAverage(data) {
    const weekdayData = data.filter(entry => {
      const day = new Date(entry.timestamp).getDay();
      return day >= 1 && day <= 5; // Monday to Friday
    });

    return this.calculateAverageMetrics(weekdayData);
  }

  getWeekendAverage(data) {
    const weekendData = data.filter(entry => {
      const day = new Date(entry.timestamp).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });

    return this.calculateAverageMetrics(weekendData);
  }

  calculateAverageMetrics(data) {
    if (data.length === 0) return { mood: 0, energy: 0, sleepQuality: 0, stressLevel: 0 };

    return {
      mood: data.reduce((sum, entry) => sum + entry.mood, 0) / data.length,
      energy: data.reduce((sum, entry) => sum + entry.energy, 0) / data.length,
      sleepQuality: data.reduce((sum, entry) => sum + entry.sleepQuality, 0) / data.length,
      stressLevel: data.reduce((sum, entry) => sum + entry.stressLevel, 0) / data.length
    };
  }

  generateGoalProgressInsights(userProfile, weeklyAverages) {
    // Implementation for goal progress tracking
    return [];
  }

  generateSeasonalInsights(weeklyAverages) {
    const season = this.getCurrentSeason();
    const insights = [];

    if (season === 'winter' && weeklyAverages.mood < 3) {
      insights.push({
        type: 'seasonal',
        title: 'Winter Blues Support',
        description: 'Winter months can affect mood and energy. Consider light therapy, vitamin D, and maintaining social connections.',
        confidence: 0.7
      });
    }

    return insights;
  }

  generateRecommendedActions(weeklyAverages, trends) {
    const actions = [];

    if (weeklyAverages.sleepQuality < 3) {
      actions.push('Focus on improving sleep hygiene and evening routines');
    }

    if (weeklyAverages.stressLevel > 3.5) {
      actions.push('Incorporate daily stress management practices');
    }

    if (weeklyAverages.energy < 3) {
      actions.push('Evaluate nutrition, hydration, and movement patterns');
    }

    return actions;
  }

  getNextCheckInRecommendation(userProfile) {
    const lastUpdate = new Date(userProfile.lastUpdated);
    const daysSinceUpdate = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate >= 7) {
      return {
        recommended: true,
        reason: 'Weekly wellness check-in',
        suggestedTime: 'tomorrow morning'
      };
    }

    return {
      recommended: false,
      nextSuggested: new Date(Date.now() + (7 - daysSinceUpdate) * 24 * 60 * 60 * 1000)
    };
  }
}

export default new AIRecommendationService();