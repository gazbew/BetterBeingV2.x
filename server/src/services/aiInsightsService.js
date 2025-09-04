import { UserWellnessProfile } from '../models/wellnessModels.js';

/**
 * AI Insights Service for generating wellness insights and analytics
 */
class AIInsightsService {
  constructor() {
    this.insightCache = new Map();
    this.globalTrends = this.initializeGlobalTrends();
  }

  /**
   * Generate comprehensive wellness insights for a user
   */
  async generateUserInsights(userProfile, timeframe = '30d') {
    const cacheKey = `${userProfile.userId}_${timeframe}`;
    
    if (this.insightCache.has(cacheKey)) {
      const cached = this.insightCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return cached.data;
      }
    }

    const insights = {
      personalInsights: await this.generatePersonalInsights(userProfile, timeframe),
      behaviorPatterns: await this.analyzeBehaviorPatterns(userProfile),
      correlationAnalysis: await this.analyzeCorrelations(userProfile),
      predictiveInsights: await this.generatePredictiveInsights(userProfile),
      benchmarkComparison: await this.compareToBenchmarks(userProfile),
      actionableRecommendations: await this.generateActionableRecommendations(userProfile)
    };

    // Cache the results
    this.insightCache.set(cacheKey, {
      data: insights,
      timestamp: Date.now()
    });

    return insights;
  }

  /**
   * Generate daily insights for all users (scheduled task)
   */
  async generateDailyInsights() {
    console.log('Generating daily wellness insights...');
    
    // In a real implementation, this would process all users
    // For now, we'll update global trends and patterns
    
    const globalInsights = {
      timestamp: new Date(),
      trends: {
        mostCommonChallenges: ['sleep_quality', 'stress_management', 'energy_levels'],
        emergingPatterns: [
          'Increased stress levels on Mondays',
          'Better sleep quality correlates with evening routine consistency',
          'Energy levels improve with morning movement practices'
        ],
        seasonalAdjustments: this.getSeasonalAdjustments(),
        wellness_score_improvements: this.calculateGlobalImprovements()
      },
      recommendations: {
        communityFocus: 'Stress management and sleep optimization',
        recommendedContent: [
          'Sleep hygiene workshop',
          'Mindfulness meditation series',
          'Natural energy boosting techniques'
        ]
      }
    };

    // Store global insights (in a real app, this would go to a database)
    this.globalTrends = globalInsights;
    
    console.log('Daily insights generated successfully');
    return globalInsights;
  }

  /**
   * Analyze behavior patterns from user data
   */
  async analyzeBehaviorPatterns(userProfile) {
    const patterns = [];
    const data = userProfile.historicalData;

    if (data.length < 7) {
      return [{
        type: 'insufficient_data',
        title: 'Building Your Wellness Profile',
        description: 'Keep tracking your wellness metrics to unlock personalized behavior insights.',
        confidence: 1.0
      }];
    }

    // Weekly rhythm analysis
    const weeklyPattern = this.analyzeWeeklyRhythm(data);
    if (weeklyPattern) {
      patterns.push(weeklyPattern);
    }

    // Time-of-day patterns
    const dailyPattern = this.analyzeDailyRhythm(data);
    if (dailyPattern) {
      patterns.push(dailyPattern);
    }

    // Streak analysis
    const streaks = this.analyzeStreaks(data);
    patterns.push(...streaks);

    // Correlation patterns
    const correlations = this.findMetricCorrelations(data);
    patterns.push(...correlations);

    return patterns;
  }

  /**
   * Analyze correlations between different wellness metrics
   */
  async analyzeCorrelations(userProfile) {
    const data = userProfile.historicalData;
    
    if (data.length < 10) {
      return {
        message: 'More data needed for correlation analysis',
        requiredDataPoints: 10 - data.length
      };
    }

    const correlations = {
      sleepMood: this.calculateCorrelation(data, 'sleepQuality', 'mood'),
      sleepEnergy: this.calculateCorrelation(data, 'sleepQuality', 'energy'),
      stressSleep: this.calculateCorrelation(data, 'stressLevel', 'sleepQuality'),
      stressMood: this.calculateCorrelation(data, 'stressLevel', 'mood'),
      energyMood: this.calculateCorrelation(data, 'energy', 'mood')
    };

    const insights = [];

    // Interpret correlations
    if (Math.abs(correlations.sleepMood) > 0.6) {
      insights.push({
        type: 'strong_correlation',
        metrics: ['sleep', 'mood'],
        correlation: correlations.sleepMood,
        insight: correlations.sleepMood > 0 
          ? 'Your mood strongly correlates with sleep quality. Prioritizing sleep could significantly improve your mood.'
          : 'There\'s an unusual inverse relationship between your sleep and mood. Consider discussing this pattern with a healthcare provider.',
        confidence: Math.abs(correlations.sleepMood)
      });
    }

    if (Math.abs(correlations.stressSleep) > 0.6) {
      insights.push({
        type: 'strong_correlation',
        metrics: ['stress', 'sleep'],
        correlation: correlations.stressSleep,
        insight: 'Your stress levels strongly impact your sleep quality. Managing stress could be key to better rest.',
        confidence: Math.abs(correlations.stressSleep)
      });
    }

    return {
      correlationMatrix: correlations,
      insights,
      recommendations: this.generateCorrelationRecommendations(correlations)
    };
  }

  /**
   * Generate predictive insights based on current trends
   */
  async generatePredictiveInsights(userProfile) {
    const trends = userProfile.getTrends();
    const predictions = [];

    if (!trends) {
      return [{
        type: 'trend_establishment',
        title: 'Trend Analysis Coming Soon',
        description: 'Continue tracking for another week to see predictive insights about your wellness journey.',
        timeframe: '7 days'
      }];
    }

    Object.entries(trends).forEach(([metric, trend]) => {
      if (trend === 'improving') {
        predictions.push({
          type: 'positive_prediction',
          metric,
          prediction: `If current trends continue, your ${metric} could improve by 15-25% over the next 2 weeks.`,
          confidence: 0.7,
          timeframe: '14 days'
        });
      } else if (trend === 'declining' || trend === 'worsening') {
        predictions.push({
          type: 'concern_prediction',
          metric,
          prediction: `Without intervention, your ${metric} may continue to decline. Early action could prevent this.`,
          confidence: 0.6,
          timeframe: '7 days',
          urgency: 'medium'
        });
      }
    });

    // Seasonal predictions
    const seasonalPrediction = this.generateSeasonalPredictions(userProfile);
    if (seasonalPrediction) {
      predictions.push(seasonalPrediction);
    }

    return predictions;
  }

  /**
   * Compare user metrics to population benchmarks
   */
  async compareToBenchmarks(userProfile) {
    const weeklyAvg = userProfile.getWeeklyAverages();
    
    // Population benchmarks (simulated)
    const benchmarks = {
      mood: { average: 3.4, good: 4.0, excellent: 4.5 },
      energy: { average: 3.2, good: 3.8, excellent: 4.3 },
      sleepQuality: { average: 3.3, good: 3.9, excellent: 4.4 },
      stressLevel: { average: 3.1, good: 2.5, excellent: 2.0 } // Lower is better for stress
    };

    const comparison = {};

    Object.entries(benchmarks).forEach(([metric, benchmark]) => {
      const userValue = weeklyAvg[metric];
      let status, message;

      if (metric === 'stressLevel') {
        // Lower is better for stress
        if (userValue <= benchmark.excellent) {
          status = 'excellent';
          message = 'Your stress levels are exceptionally well-managed!';
        } else if (userValue <= benchmark.good) {
          status = 'good';
          message = 'You\'re managing stress better than most people.';
        } else if (userValue <= benchmark.average) {
          status = 'average';
          message = 'Your stress levels are about average. There\'s room for improvement.';
        } else {
          status = 'below_average';
          message = 'Your stress levels are higher than average. Consider stress management techniques.';
        }
      } else {
        // Higher is better for other metrics
        if (userValue >= benchmark.excellent) {
          status = 'excellent';
          message = `Your ${metric} is in the excellent range!`;
        } else if (userValue >= benchmark.good) {
          status = 'good';
          message = `Your ${metric} is above average - great job!`;
        } else if (userValue >= benchmark.average) {
          status = 'average';
          message = `Your ${metric} is about average with room to grow.`;
        } else {
          status = 'below_average';
          message = `Your ${metric} is below average. Let\'s work on improving this.`;
        }
      }

      comparison[metric] = {
        userValue,
        benchmark: benchmark.average,
        status,
        message,
        percentile: this.calculatePercentile(userValue, benchmark, metric === 'stressLevel')
      };
    });

    return {
      overallRanking: this.calculateOverallRanking(comparison),
      metricComparisons: comparison,
      improvementOpportunities: this.identifyImprovementOpportunities(comparison)
    };
  }

  // Helper methods for analysis

  analyzeWeeklyRhythm(data) {
    // Group data by day of week
    const dayGroups = {};
    
    data.forEach(entry => {
      const dayOfWeek = new Date(entry.timestamp).getDay();
      if (!dayGroups[dayOfWeek]) dayGroups[dayOfWeek] = [];
      dayGroups[dayOfWeek].push(entry);
    });

    // Find patterns
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayAverages = {};

    Object.entries(dayGroups).forEach(([day, entries]) => {
      if (entries.length > 0) {
        dayAverages[day] = {
          mood: entries.reduce((sum, e) => sum + e.mood, 0) / entries.length,
          energy: entries.reduce((sum, e) => sum + e.energy, 0) / entries.length,
          stress: entries.reduce((sum, e) => sum + e.stressLevel, 0) / entries.length
        };
      }
    });

    // Find the best and worst days
    let bestDay, worstDay;
    let bestScore = -1, worstScore = 6;

    Object.entries(dayAverages).forEach(([day, avg]) => {
      const score = (avg.mood + avg.energy - avg.stress) / 3;
      if (score > bestScore) {
        bestScore = score;
        bestDay = dayNames[parseInt(day)];
      }
      if (score < worstScore) {
        worstScore = score;
        worstDay = dayNames[parseInt(day)];
      }
    });

    if (bestDay && worstDay && bestDay !== worstDay) {
      return {
        type: 'weekly_rhythm',
        title: `${bestDay}s vs ${worstDay}s Pattern`,
        description: `Your wellness tends to be highest on ${bestDay}s and lowest on ${worstDay}s. Consider what makes ${bestDay}s special and how to incorporate those elements into ${worstDay}s.`,
        bestDay,
        worstDay,
        confidence: 0.6
      };
    }

    return null;
  }

  analyzeDailyRhythm(data) {
    // This would analyze time-of-day patterns if we had timestamp granularity
    // For now, return a general insight about daily rhythms
    return {
      type: 'daily_rhythm',
      title: 'Daily Rhythm Awareness',
      description: 'Consider tracking the time of day you feel most energetic and plan important activities during these peak hours.',
      confidence: 0.5
    };
  }

  analyzeStreaks(data) {
    const streaks = [];
    
    // Analyze improvement streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let lastScore = 0;

    data.forEach(entry => {
      const score = (entry.mood + entry.energy + entry.sleepQuality - entry.stressLevel) / 4;
      
      if (score > lastScore) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
      
      lastScore = score;
    });

    if (bestStreak >= 3) {
      streaks.push({
        type: 'improvement_streak',
        title: `${bestStreak}-Day Improvement Streak`,
        description: `You achieved a ${bestStreak}-day streak of improving wellness scores. Great consistency!`,
        streakLength: bestStreak,
        confidence: 0.8
      });
    }

    return streaks;
  }

  findMetricCorrelations(data) {
    const patterns = [];

    // Simple pattern detection
    const sleepMoodCorr = this.calculateCorrelation(data, 'sleepQuality', 'mood');
    
    if (Math.abs(sleepMoodCorr) > 0.5) {
      patterns.push({
        type: 'correlation_pattern',
        title: 'Sleep-Mood Connection',
        description: sleepMoodCorr > 0 
          ? 'Your mood consistently improves with better sleep quality.'
          : 'There\'s an interesting inverse relationship between your sleep and mood that may warrant attention.',
        correlation: sleepMoodCorr,
        confidence: Math.abs(sleepMoodCorr)
      });
    }

    return patterns;
  }

  calculateCorrelation(data, metric1, metric2) {
    if (data.length < 3) return 0;

    const values1 = data.map(entry => entry[metric1]);
    const values2 = data.map(entry => entry[metric2]);

    const mean1 = values1.reduce((a, b) => a + b) / values1.length;
    const mean2 = values2.reduce((a, b) => a + b) / values2.length;

    const numerator = data.reduce((sum, entry, i) => {
      return sum + (values1[i] - mean1) * (values2[i] - mean2);
    }, 0);

    const denominator = Math.sqrt(
      values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) *
      values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  }

  generatePersonalInsights(userProfile, timeframe) {
    const insights = [];
    const weeklyAvg = userProfile.getWeeklyAverages();

    // Strengths identification
    const strengths = [];
    if (weeklyAvg.mood >= 4) strengths.push('mood management');
    if (weeklyAvg.energy >= 4) strengths.push('energy levels');
    if (weeklyAvg.sleepQuality >= 4) strengths.push('sleep quality');
    if (weeklyAvg.stressLevel <= 2) strengths.push('stress management');

    if (strengths.length > 0) {
      insights.push({
        type: 'strength_recognition',
        title: 'Your Wellness Strengths',
        description: `You're doing exceptionally well with: ${strengths.join(', ')}. These are areas where you can maintain your current approach.`,
        confidence: 0.9
      });
    }

    // Areas for growth
    const growthAreas = [];
    if (weeklyAvg.mood < 3) growthAreas.push('mood support');
    if (weeklyAvg.energy < 3) growthAreas.push('energy optimization');
    if (weeklyAvg.sleepQuality < 3) growthAreas.push('sleep improvement');
    if (weeklyAvg.stressLevel > 3.5) growthAreas.push('stress reduction');

    if (growthAreas.length > 0) {
      insights.push({
        type: 'growth_opportunity',
        title: 'Areas for Growth',
        description: `Focus areas for improvement: ${growthAreas.join(', ')}. Small, consistent changes in these areas can lead to significant wellness improvements.`,
        confidence: 0.8
      });
    }

    return insights;
  }

  generateActionableRecommendations(userProfile) {
    const weeklyAvg = userProfile.getWeeklyAverages();
    const recommendations = [];

    // Sleep recommendations
    if (weeklyAvg.sleepQuality < 3.5) {
      recommendations.push({
        category: 'sleep',
        priority: 'high',
        action: 'Establish a consistent bedtime routine',
        timeframe: '2 weeks',
        expectedImpact: 'Improve sleep quality by 20-30%'
      });
    }

    // Stress recommendations
    if (weeklyAvg.stressLevel > 3.5) {
      recommendations.push({
        category: 'stress',
        priority: 'high',
        action: 'Practice 10 minutes of daily mindfulness meditation',
        timeframe: '3 weeks',
        expectedImpact: 'Reduce stress levels by 15-25%'
      });
    }

    // Energy recommendations
    if (weeklyAvg.energy < 3.5) {
      recommendations.push({
        category: 'energy',
        priority: 'medium',
        action: 'Add 15 minutes of morning movement to your routine',
        timeframe: '2 weeks',
        expectedImpact: 'Increase energy levels by 20-35%'
      });
    }

    return recommendations;
  }

  generateSeasonalPredictions(userProfile) {
    const currentSeason = this.getCurrentSeason();
    const nextSeason = this.getNextSeason();
    
    const seasonalImpacts = {
      spring: { mood: 0.2, energy: 0.15 },
      summer: { mood: 0.3, energy: 0.2, sleep: -0.1 },
      fall: { mood: -0.1, energy: -0.05 },
      winter: { mood: -0.2, energy: -0.15, sleep: 0.1 }
    };

    const impact = seasonalImpacts[nextSeason];
    
    if (impact) {
      const predictions = [];
      Object.entries(impact).forEach(([metric, change]) => {
        if (Math.abs(change) > 0.1) {
          predictions.push(`${change > 0 ? 'improved' : 'decreased'} ${metric}`);
        }
      });

      if (predictions.length > 0) {
        return {
          type: 'seasonal_prediction',
          title: `${nextSeason.charAt(0).toUpperCase() + nextSeason.slice(1)} Seasonal Outlook`,
          prediction: `As we transition to ${nextSeason}, you may experience ${predictions.join(', ')}. Plan accordingly with seasonal wellness strategies.`,
          confidence: 0.6,
          timeframe: '30-60 days'
        };
      }
    }

    return null;
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  getNextSeason() {
    const seasons = ['winter', 'spring', 'summer', 'fall'];
    const currentIndex = seasons.indexOf(this.getCurrentSeason());
    return seasons[(currentIndex + 1) % 4];
  }

  getSeasonalAdjustments() {
    const season = this.getCurrentSeason();
    
    const adjustments = {
      winter: {
        focus: 'Mood support and immune health',
        recommendations: ['Vitamin D supplementation', 'Light therapy', 'Warm, grounding practices']
      },
      spring: {
        focus: 'Energy renewal and detox support',
        recommendations: ['Gentle cleansing practices', 'Increased movement', 'Fresh, seasonal nutrition']
      },
      summer: {
        focus: 'Cooling and hydration',
        recommendations: ['Adequate hydration', 'Cooling foods', 'Sun protection practices']
      },
      fall: {
        focus: 'Immune preparation and grounding',
        recommendations: ['Immune-supporting herbs', 'Routine establishment', 'Warming practices']
      }
    };

    return adjustments[season];
  }

  calculateGlobalImprovements() {
    // Simulated global improvement metrics
    return {
      averageWellnessScore: 73.5,
      monthOverMonthImprovement: 2.3,
      topImprovementAreas: ['Sleep Quality', 'Stress Management', 'Energy Levels'],
      userEngagement: {
        dailyTracking: '78%',
        recommendationAdoption: '65%',
        goalCompletion: '42%'
      }
    };
  }

  calculateOverallRanking(comparison) {
    const scores = Object.values(comparison).map(c => {
      switch (c.status) {
        case 'excellent': return 4;
        case 'good': return 3;
        case 'average': return 2;
        case 'below_average': return 1;
        default: return 2;
      }
    });

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (averageScore >= 3.5) return 'top_quartile';
    if (averageScore >= 3) return 'above_average';
    if (averageScore >= 2.5) return 'average';
    return 'needs_improvement';
  }

  calculatePercentile(userValue, benchmark, lowerIsBetter = false) {
    // Simplified percentile calculation
    const { average, good, excellent } = benchmark;
    
    if (lowerIsBetter) {
      if (userValue <= excellent) return 90;
      if (userValue <= good) return 75;
      if (userValue <= average) return 50;
      return 25;
    } else {
      if (userValue >= excellent) return 90;
      if (userValue >= good) return 75;
      if (userValue >= average) return 50;
      return 25;
    }
  }

  identifyImprovementOpportunities(comparison) {
    return Object.entries(comparison)
      .filter(([, data]) => data.status === 'below_average')
      .map(([metric]) => ({
        metric,
        opportunity: `Focus on improving ${metric} for better overall wellness`,
        priority: 'high'
      }));
  }

  generateCorrelationRecommendations(correlations) {
    const recommendations = [];
    
    if (Math.abs(correlations.sleepMood) > 0.6) {
      recommendations.push('Prioritize sleep hygiene to improve mood stability');
    }
    
    if (Math.abs(correlations.stressSleep) > 0.6) {
      recommendations.push('Implement evening stress reduction practices for better sleep');
    }
    
    if (Math.abs(correlations.energyMood) > 0.6) {
      recommendations.push('Focus on energy management strategies to support mood');
    }

    return recommendations;
  }

  initializeGlobalTrends() {
    return {
      timestamp: new Date(),
      trends: {
        mostCommonChallenges: ['sleep_quality', 'stress_management', 'energy_levels'],
        emergingPatterns: [],
        seasonalAdjustments: this.getSeasonalAdjustments(),
        wellness_score_improvements: {
          averageWellnessScore: 70.0,
          monthOverMonthImprovement: 0,
          topImprovementAreas: [],
          userEngagement: {
            dailyTracking: '0%',
            recommendationAdoption: '0%',
            goalCompletion: '0%'
          }
        }
      }
    };
  }
}

export const generateDailyInsights = async () => {
  const service = new AIInsightsService();
  return await service.generateDailyInsights();
};

export default new AIInsightsService();