import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import pool from './config/database.js';
import { cache } from './config/redis.js';
import { runMigrations } from './config/migrate.js';

// Route imports
import productsRouter from './routes/products.js';
import optimizedProductsRouter from './routes/optimized-products.js';
import ordersRouter from './routes/orders.js';
import usersRouter from './routes/users.js';
import cartRouter from './routes/cart.js';
import checkoutRouter from './routes/checkout.js';
import reviewsRouter from './routes/reviews.js';
import recommendationsRouter from './routes/recommendations.js';
import loyaltyRouter from './routes/loyalty.js';

// Middleware imports
import { 
  performanceMiddleware, 
  requestIdMiddleware, 
  createPerformanceRoutes,
  createRateLimiter 
} from './middleware/performance.js';
import {
  enhancedHelmet,
  xssProtection,
  securityHeaders,
  apiRateLimit,
  requestSizeLimits
} from './middleware/comprehensive-security.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3003;

// Enhanced security middleware
app.use(enhancedHelmet);
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Basic middleware with security limits
app.use(express.json(requestSizeLimits.json));
app.use(express.urlencoded(requestSizeLimits.urlencoded));

// Cookie parser for secure authentication
app.use(cookieParser());

// XSS Protection for all routes
app.use(xssProtection);

// Performance middleware
app.use(requestIdMiddleware);
app.use(performanceMiddleware);

// Enhanced rate limiting
app.use('/api', apiRateLimit);

// Initialize performance monitoring routes
createPerformanceRoutes(app);

// API Routes - Use optimized products route by default
app.use('/api/products', optimizedProductsRouter);
app.use('/api/products-legacy', productsRouter); // Keep legacy route for comparison
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', usersRouter); // Add auth alias for users routes
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/loyalty', loyaltyRouter);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id
  });
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(err.status || 500).json({ 
    error: message,
    requestId: req.id
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    requestId: req.id
  });
});

// Initialize server
const initializeServer = async () => {
  try {
    console.log('🚀 Initializing Better Being API Server...');
    
    // Run database migrations
    if (process.env.AUTO_MIGRATE !== 'false') {
      console.log('📋 Running database migrations...');
      await runMigrations();
    }
    
    // Connect to Redis (optional)
    try {
      await cache.connect();
      console.log('✅ Redis cache connected');
    } catch (error) {
      console.warn('⚠️ Redis not available:', error.message);
      console.log('🔄 Running without cache (performance may be reduced)');
    }
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 API Documentation: http://localhost:${PORT}/api/health`);
      console.log(`📊 Performance Metrics: http://localhost:${PORT}/api/metrics`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      
      server.close(async () => {
        try {
          await pool.end();
          console.log('✅ Database connections closed');
          
          if (cache.isAvailable()) {
            await cache.disconnect();
            console.log('✅ Redis connection closed');
          }
          
          console.log('👋 Server shutdown complete');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error.message);
          process.exit(1);
        }
      });
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('💥 Failed to initialize server:', error.message);
    process.exit(1);
  }
};

// Start the server
initializeServer();