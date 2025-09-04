# Better Being Wellness API

🌟 **AI-Powered Wellness Recommendations Engine**

A comprehensive backend API that provides personalized wellness recommendations, product suggestions, and AI-driven insights for the Better Being wellness platform.

## 🚀 Features

### AI-Powered Recommendations
- **Daily Wellness Suggestions**: Personalized recommendations based on current mood, energy, sleep, and stress levels
- **Smart Product Recommendations**: AI-curated wellness products aligned with user needs and goals
- **Intelligent Timing**: Context-aware recommendations based on time of day and seasonal factors
- **Continuous Learning**: Feedback-driven AI that improves recommendations over time

### Wellness Analytics
- **Comprehensive Insights**: Deep analysis of wellness patterns and trends
- **Correlation Analysis**: Identify relationships between different wellness metrics
- **Predictive Insights**: AI-generated predictions about wellness trajectory
- **Benchmark Comparisons**: Compare progress against population benchmarks

### Robust Architecture
- **Enterprise-grade Security**: JWT authentication, rate limiting, input validation
- **Comprehensive Logging**: Structured logging with performance monitoring
- **Error Handling**: Detailed error responses with helpful suggestions
- **Scalable Design**: Modular architecture ready for production deployment

## 📋 API Endpoints

### Core Recommendations
```http
GET    /api/recommendations/daily      # Daily wellness recommendations
GET    /api/recommendations/products   # Personalized product recommendations
POST   /api/recommendations/feedback   # Submit feedback to improve AI
GET    /api/recommendations/insights   # Comprehensive wellness analytics
POST   /api/recommendations/profile    # Update wellness profile
```

### System Health
```http
GET    /health                         # System health check
GET    /api/recommendations/health     # Service-specific health
GET    /api/recommendations/demo       # Demo data and documentation
```

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Quick Start

1. **Clone and Navigate**
   ```bash
   cd server
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Verify Installation**
   ```bash
   curl http://localhost:3001/health
   ```

### Environment Variables

Key configuration options in `.env`:

```bash
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
VALID_API_KEYS=your-api-key-1,your-api-key-2

# AI Configuration
AI_SERVICE_TIMEOUT=30000
AI_CONFIDENCE_THRESHOLD=0.3
AI_MAX_RECOMMENDATIONS=20

# Features
ENABLE_PRODUCT_RECOMMENDATIONS=true
ENABLE_AI_INSIGHTS=true
WELLNESS_HISTORY_RETENTION_DAYS=365
```

## 🧠 AI Wellness Engine

### Recommendation Logic

The AI analyzes multiple factors to provide personalized recommendations:

**User Context**
- Current wellness metrics (mood, energy, sleep, stress)
- Historical patterns and trends
- Personal wellness goals
- Time of day and seasonal factors

**Recommendation Types**
- **Activities**: Movement, mindfulness, breathwork
- **Products**: Supplements, teas, aromatherapy
- **Lifestyle**: Sleep hygiene, nutrition, stress management

**Intelligence Features**
- Pattern recognition in wellness data
- Correlation analysis between metrics
- Seasonal wellness adjustments
- Learning from user feedback

### Sample AI Logic

```javascript
// Morning energy boost recommendation
if (userProfile.currentMetrics.energy <= 3 && currentHour < 12) {
  recommendations.push({
    title: '10-Minute Morning Energizer',
    description: 'Light stretching and breathing to boost natural energy',
    confidence: 0.8,
    personalizedReason: 'Your energy levels have been low recently. This routine can help naturally boost morning energy.'
  });
}

// Product recommendation based on sleep quality
if (userProfile.currentMetrics.sleepQuality <= 3) {
  recommendProduct({
    name: 'Chelated Magnesium Complex',
    reason: 'Based on your sleep quality scores, magnesium may help improve rest and recovery',
    confidence: calculateProductRelevanceScore(product, userProfile)
  });
}
```

## 📊 API Usage Examples

### Get Daily Recommendations
```bash
curl "http://localhost:3001/api/recommendations/daily?mood=3&energy=2&sleepQuality=3&stressLevel=4&goals=improve_sleep,reduce_stress"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "morning_energy_1693847234567",
        "type": "activity",
        "title": "10-Minute Morning Energizer",
        "description": "Light stretching and deep breathing to boost morning energy naturally",
        "category": "movement",
        "priority": "high",
        "timeOfDay": "morning",
        "duration": 10,
        "confidence": 0.8,
        "personalizedReason": "Your energy levels have been low recently. This gentle routine can help naturally boost your morning energy."
      }
    ],
    "context": {
      "timeOfDay": "morning",
      "basedOn": {
        "currentMetrics": {
          "mood": 3,
          "energy": 2,
          "sleepQuality": 3,
          "stressLevel": 4
        }
      }
    }
  }
}
```

### Get Product Recommendations
```bash
curl "http://localhost:3001/api/recommendations/products?limit=5&mood=3&energy=2&category=adaptogens"
```

### Submit Feedback
```bash
curl -X POST "http://localhost:3001/api/recommendations/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "recommendationId": "morning_energy_1693847234567",
    "rating": 5,
    "followed": true,
    "effectiveness": 4,
    "comments": "Really helpful morning routine!"
  }'
```

### Get Wellness Insights
```bash
curl "http://localhost:3001/api/recommendations/insights?timeframe=30d&compare=true&mood=4&energy=3"
```

## 🔒 Authentication & Security

### Optional Authentication
The API supports both authenticated and demo modes:

**Authenticated Requests:**
```bash
curl -H "Authorization: Bearer your-jwt-token" \
  "http://localhost:3001/api/recommendations/daily"
```

**Demo Mode:**
```bash
curl "http://localhost:3001/api/recommendations/daily?mood=3&energy=4"
```

### Security Features
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive request validation with Joi
- **Security Headers**: Helmet.js for security headers
- **Error Handling**: Detailed but secure error responses
- **Request Logging**: Comprehensive logging without sensitive data

## 🏗 Architecture Overview

```
server/
├── src/
│   ├── controllers/          # Request handlers
│   │   └── recommendationsController.js
│   ├── services/            # Business logic
│   │   ├── aiRecommendationService.js
│   │   └── aiInsightsService.js
│   ├── models/              # Data models
│   │   └── wellnessModels.js
│   ├── routes/              # API routes
│   │   └── recommendations.js
│   ├── middleware/          # Express middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── logger.js
│   └── index.js             # Main server file
├── package.json
├── .env.example
└── README.md
```

### Key Components

**Controllers**: Handle HTTP requests and responses
- Input validation and sanitization
- Business logic delegation
- Response formatting

**Services**: Core business logic and AI processing
- Recommendation generation algorithms
- Wellness data analysis
- Machine learning simulation

**Models**: Data structures and validation
- Wellness metrics definitions
- User profile management
- Product catalog

**Middleware**: Cross-cutting concerns
- Authentication and authorization
- Request validation and sanitization
- Error handling and logging
- Rate limiting and security

## 🎯 Wellness Data Models

### Wellness Metrics (1-5 scale)
```javascript
{
  mood: 3,           // 1=poor, 5=excellent
  energy: 2,         // 1=depleted, 5=high
  sleepQuality: 3,   // 1=terrible, 5=excellent
  stressLevel: 4     // 1=minimal, 5=overwhelming
}
```

### Wellness Goals
- `improve_sleep` - Better sleep quality and duration
- `reduce_stress` - Stress management and resilience
- `increase_energy` - Natural energy enhancement
- `enhance_mood` - Emotional well-being and balance
- `better_focus` - Concentration and mental clarity
- `weight_management` - Healthy weight support
- `immune_support` - Immune system strengthening
- `digestive_health` - Digestive wellness

### Product Categories
- `adaptogens` - Stress-reducing herbs
- `minerals` - Essential minerals and electrolytes
- `vitamins` - Nutritional supplements
- `herbal_teas` - Wellness-focused teas
- `essential_oils` - Aromatherapy oils
- `mindfulness_tools` - Meditation and relaxation aids
- `sleep_support` - Sleep enhancement products
- `immunity_boosters` - Immune system support

## 📈 Monitoring & Analytics

### Request Logging
Every request is logged with:
- Request details (method, URL, headers)
- User context (authenticated/demo)
- Response metrics (status, duration)
- Wellness-specific data (metrics, recommendations)
- Performance indicators

### Performance Monitoring
- Request duration tracking
- Slow query identification
- AI processing time monitoring
- Rate limit tracking

### Health Checks
- Basic system health: `GET /health`
- Service-specific health: `GET /api/recommendations/health`
- Dependency status monitoring

## 🧪 Testing & Development

### Demo Endpoints
```bash
# Get demo data and examples
curl http://localhost:3001/api/recommendations/demo

# Test with sample data
curl "http://localhost:3001/api/recommendations/daily?mood=4&energy=3&sleepQuality=2&stressLevel=3"
```

### Development Features
- Comprehensive error messages
- Request/response logging
- Hot reload with nodemon
- Environment-specific configurations

### Production Considerations
- JWT token validation
- Database integration ready
- Caching layer support
- Horizontal scaling ready
- Comprehensive error handling

## 🔄 Scheduled Tasks

### Daily Insights Generation
- **Schedule**: Every day at 6:00 AM
- **Function**: Generates global wellness insights and trends
- **Purpose**: Community insights and AI improvement

### Weekly Trend Analysis  
- **Schedule**: Sundays at 8:00 AM
- **Function**: Analyzes weekly wellness patterns
- **Purpose**: Long-term trend identification

## 🚀 Deployment

### Production Environment
```bash
# Set production environment
NODE_ENV=production

# Use PM2 for process management
npm install -g pm2
pm2 start src/index.js --name "wellness-api"

# Monitor
pm2 monit
pm2 logs wellness-api
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3001
CMD ["node", "src/index.js"]
```

### Environment Variables (Production)
Ensure these are set in production:
- `JWT_SECRET` - Strong, unique JWT secret
- `NODE_ENV=production`
- `FRONTEND_URL` - Your production frontend URL
- Database and Redis connection strings
- API keys for external services

## 📚 Documentation

### API Documentation
- Interactive docs available in development mode
- Postman collection available
- OpenAPI/Swagger specification planned

### Code Documentation
- Comprehensive inline comments
- JSDoc annotations
- Architecture decision records

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- Use ESLint configuration
- Follow naming conventions
- Add comprehensive error handling
- Include logging for debugging
- Write meaningful commit messages

## 📄 License

This project is proprietary software for the Better Being wellness platform.

---

## 🆘 Support & Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port 3001
lsof -ti:3001
kill -9 <PID>
```

**JWT Token Errors**
- Ensure JWT_SECRET is set in .env
- Check token format: "Bearer <token>"
- Verify token hasn't expired

**Rate Limiting**
- Default: 100 requests per 15 minutes
- Adjust in .env: `API_RATE_LIMIT_MAX_REQUESTS`
- Use different IPs or wait for reset

### Debug Mode
```bash
DEBUG=* npm run dev
```

### Support Contacts
- Technical Issues: [Create GitHub Issue]
- Security Concerns: security@betterbeing.com
- General Questions: api-support@betterbeing.com

---

**Built with ❤️ for the Better Being wellness community**