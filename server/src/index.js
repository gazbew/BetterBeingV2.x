import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Import routes
import recommendationsRoutes from './routes/recommendations.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import authMiddleware from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './middleware/logger.js';

// Import services
import { generateDailyInsights } from './services/aiInsightsService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'Better Being Wellness API'
  });
});

// API routes
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Better Being Wellness API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      recommendations: '/api/recommendations',
      subscriptions: '/api/subscriptions'
    },
    documentation: 'https://docs.betterbeing.com/api'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /health',
      'GET /api/recommendations/daily',
      'GET /api/recommendations/products',
      'POST /api/recommendations/feedback',
      'GET /api/recommendations/insights',
      'GET /api/subscriptions/plans',
      'GET /api/subscriptions/current',
      'POST /api/subscriptions/subscribe'
    ]
  });
});

// Error handling middleware
app.use(errorHandler);

// Scheduled tasks
// Generate daily wellness insights at 6 AM
cron.schedule('0 6 * * *', () => {
  console.log('Running daily wellness insights generation...');
  generateDailyInsights()
    .then(() => console.log('Daily insights generated successfully'))
    .catch(err => console.error('Error generating daily insights:', err));
});

// Weekly wellness trend analysis on Sundays at 8 AM
cron.schedule('0 8 * * 0', () => {
  console.log('Running weekly wellness trend analysis...');
  // Implementation for weekly trends would go here
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  console.log(`
🌟 Better Being Wellness API Server Started
🔗 Server running on port ${PORT}
🏥 Health check: http://localhost:${PORT}/health
📋 API Base: http://localhost:${PORT}/api
🧠 AI Recommendations: http://localhost:${PORT}/api/recommendations
⏰ Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

export default app;