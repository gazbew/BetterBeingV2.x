// Wellness data models and schemas for the Better Being platform

export const WellnessMetrics = {
  MOOD: {
    EXCELLENT: 5,
    GOOD: 4,
    NEUTRAL: 3,
    LOW: 2,
    POOR: 1
  },
  ENERGY: {
    HIGH: 5,
    GOOD: 4,
    MODERATE: 3,
    LOW: 2,
    DEPLETED: 1
  },
  SLEEP_QUALITY: {
    EXCELLENT: 5,
    GOOD: 4,
    FAIR: 3,
    POOR: 2,
    TERRIBLE: 1
  },
  STRESS_LEVEL: {
    MINIMAL: 1,
    LOW: 2,
    MODERATE: 3,
    HIGH: 4,
    OVERWHELMING: 5
  }
};

export const WellnessGoals = {
  IMPROVE_SLEEP: 'improve_sleep',
  REDUCE_STRESS: 'reduce_stress',
  INCREASE_ENERGY: 'increase_energy',
  ENHANCE_MOOD: 'enhance_mood',
  BETTER_FOCUS: 'better_focus',
  WEIGHT_MANAGEMENT: 'weight_management',
  IMMUNE_SUPPORT: 'immune_support',
  DIGESTIVE_HEALTH: 'digestive_health'
};

export const ProductCategories = {
  ADAPTOGENS: 'adaptogens',
  MINERALS: 'minerals',
  VITAMINS: 'vitamins',
  HERBAL_TEAS: 'herbal_teas',
  ESSENTIAL_OILS: 'essential_oils',
  MINDFULNESS_TOOLS: 'mindfulness_tools',
  SLEEP_SUPPORT: 'sleep_support',
  IMMUNITY_BOOSTERS: 'immunity_boosters'
};

export class UserWellnessProfile {
  constructor(userId, data = {}) {
    this.userId = userId;
    this.currentMetrics = {
      mood: data.mood || WellnessMetrics.MOOD.NEUTRAL,
      energy: data.energy || WellnessMetrics.ENERGY.MODERATE,
      sleepQuality: data.sleepQuality || WellnessMetrics.SLEEP_QUALITY.FAIR,
      stressLevel: data.stressLevel || WellnessMetrics.STRESS_LEVEL.MODERATE
    };
    this.goals = data.goals || [];
    this.preferences = data.preferences || {};
    this.historicalData = data.historicalData || [];
    this.lastUpdated = new Date();
  }

  addMetricEntry(metrics) {
    this.historicalData.push({
      ...metrics,
      timestamp: new Date()
    });
    this.currentMetrics = { ...metrics };
    this.lastUpdated = new Date();
  }

  getWeeklyAverages() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekData = this.historicalData.filter(
      entry => new Date(entry.timestamp) >= weekAgo
    );

    if (weekData.length === 0) return this.currentMetrics;

    return {
      mood: this.calculateAverage(weekData, 'mood'),
      energy: this.calculateAverage(weekData, 'energy'),
      sleepQuality: this.calculateAverage(weekData, 'sleepQuality'),
      stressLevel: this.calculateAverage(weekData, 'stressLevel')
    };
  }

  getTrends() {
    if (this.historicalData.length < 2) return null;

    const recent = this.historicalData.slice(-7); // Last 7 entries
    const older = this.historicalData.slice(-14, -7); // Previous 7 entries

    if (older.length === 0) return null;

    const recentAvg = {
      mood: this.calculateAverage(recent, 'mood'),
      energy: this.calculateAverage(recent, 'energy'),
      sleepQuality: this.calculateAverage(recent, 'sleepQuality'),
      stressLevel: this.calculateAverage(recent, 'stressLevel')
    };

    const olderAvg = {
      mood: this.calculateAverage(older, 'mood'),
      energy: this.calculateAverage(older, 'energy'),
      sleepQuality: this.calculateAverage(older, 'sleepQuality'),
      stressLevel: this.calculateAverage(older, 'stressLevel')
    };

    return {
      mood: this.getTrendDirection(olderAvg.mood, recentAvg.mood),
      energy: this.getTrendDirection(olderAvg.energy, recentAvg.energy),
      sleepQuality: this.getTrendDirection(olderAvg.sleepQuality, recentAvg.sleepQuality),
      stressLevel: this.getTrendDirection(olderAvg.stressLevel, recentAvg.stressLevel, true) // Reverse for stress
    };
  }

  calculateAverage(data, metric) {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, entry) => acc + (entry[metric] || 0), 0);
    return Math.round((sum / data.length) * 10) / 10;
  }

  getTrendDirection(oldValue, newValue, reverse = false) {
    const threshold = 0.3;
    const diff = newValue - oldValue;
    
    if (Math.abs(diff) < threshold) return 'stable';
    
    if (reverse) {
      return diff > 0 ? 'worsening' : 'improving';
    } else {
      return diff > 0 ? 'improving' : 'declining';
    }
  }
}

export class WellnessRecommendation {
  constructor(data) {
    this.id = data.id;
    this.type = data.type; // 'activity', 'product', 'lifestyle'
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.priority = data.priority || 'medium'; // low, medium, high
    this.timeOfDay = data.timeOfDay; // morning, afternoon, evening, anytime
    this.duration = data.duration; // in minutes
    this.difficulty = data.difficulty || 'easy'; // easy, moderate, challenging
    this.benefits = data.benefits || [];
    this.targetMetrics = data.targetMetrics || [];
    this.contraindications = data.contraindications || [];
    this.personalizedReason = data.personalizedReason;
    this.confidence = data.confidence || 0.8; // 0-1 score
    this.createdAt = new Date();
  }
}

export class ProductRecommendation extends WellnessRecommendation {
  constructor(data) {
    super(data);
    this.productId = data.productId;
    this.productName = data.productName;
    this.productImage = data.productImage;
    this.price = data.price;
    this.dosage = data.dosage;
    this.ingredients = data.ingredients || [];
    this.brandInfo = data.brandInfo;
    this.sustainabilityScore = data.sustainabilityScore;
    this.userReviews = data.userReviews || { rating: 0, count: 0 };
  }
}

// Mock product database
export const mockProducts = {
  adaptogen_ashwagandha: {
    id: 'adaptogen_ashwagandha',
    name: 'Premium Ashwagandha Root Extract',
    category: ProductCategories.ADAPTOGENS,
    price: 34.99,
    image: '/products/ashwagandha.jpg',
    description: 'Organic ashwagandha root extract to support stress response and energy levels',
    ingredients: ['Organic Ashwagandha Root Extract', 'Black Pepper Extract'],
    dosage: '300mg, 1-2 capsules daily',
    benefits: ['Stress reduction', 'Energy support', 'Mood balance'],
    targetMetrics: ['stress', 'energy', 'mood'],
    sustainabilityScore: 4.5,
    userReviews: { rating: 4.6, count: 234 }
  },
  mineral_magnesium: {
    id: 'mineral_magnesium',
    name: 'Chelated Magnesium Complex',
    category: ProductCategories.MINERALS,
    price: 28.99,
    image: '/products/magnesium.jpg',
    description: 'Highly bioavailable magnesium for sleep support and muscle relaxation',
    ingredients: ['Magnesium Glycinate', 'Magnesium Malate', 'Magnesium Taurate'],
    dosage: '400mg, 1-2 capsules before bed',
    benefits: ['Better sleep', 'Muscle relaxation', 'Stress relief'],
    targetMetrics: ['sleep', 'stress'],
    sustainabilityScore: 4.2,
    userReviews: { rating: 4.4, count: 189 }
  },
  herbal_chamomile_tea: {
    id: 'herbal_chamomile_tea',
    name: 'Organic Chamomile Evening Blend',
    category: ProductCategories.HERBAL_TEAS,
    price: 16.99,
    image: '/products/chamomile-tea.jpg',
    description: 'Soothing chamomile tea blend for evening relaxation and better sleep',
    ingredients: ['Organic Chamomile Flowers', 'Lavender', 'Passionflower'],
    dosage: '1 tea bag, 30 minutes before bed',
    benefits: ['Sleep support', 'Relaxation', 'Digestive comfort'],
    targetMetrics: ['sleep', 'stress'],
    sustainabilityScore: 4.8,
    userReviews: { rating: 4.7, count: 156 }
  },
  essential_oil_lavender: {
    id: 'essential_oil_lavender',
    name: 'Pure Lavender Essential Oil',
    category: ProductCategories.ESSENTIAL_OILS,
    price: 22.99,
    image: '/products/lavender-oil.jpg',
    description: 'Therapeutic grade lavender oil for aromatherapy and relaxation',
    ingredients: ['100% Pure Lavandula Angustifolia'],
    dosage: '2-3 drops in diffuser or diluted topically',
    benefits: ['Sleep improvement', 'Stress reduction', 'Mood enhancement'],
    targetMetrics: ['sleep', 'stress', 'mood'],
    sustainabilityScore: 4.6,
    userReviews: { rating: 4.5, count: 298 }
  },
  vitamin_d3_k2: {
    id: 'vitamin_d3_k2',
    name: 'Vitamin D3 + K2 Complex',
    category: ProductCategories.VITAMINS,
    price: 31.99,
    image: '/products/vitamin-d3-k2.jpg',
    description: 'Synergistic D3 and K2 formula for mood support and immune function',
    ingredients: ['Vitamin D3 (Cholecalciferol)', 'Vitamin K2 (MK-7)', 'MCT Oil'],
    dosage: '1000 IU D3 + 45mcg K2, 1 capsule daily',
    benefits: ['Mood support', 'Immune function', 'Bone health'],
    targetMetrics: ['mood', 'energy'],
    sustainabilityScore: 4.1,
    userReviews: { rating: 4.3, count: 167 }
  }
};