import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import usersRouter from './routes/users.js';
import cartRouter from './routes/cart.js'; // Import cart routes
import loyaltyRouter from './routes/loyalty.js'; // Import loyalty routes
import marketingRouter from './routes/marketing.js'; // Import marketing routes
import analyticsRouter from './routes/analytics.js'; // Import analytics routes
import referralsRouter from './routes/referrals.js'; // Import referrals routes

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/cart', cartRouter); // Add cart routes
app.use('/api/loyalty', loyaltyRouter); // Add loyalty routes
app.use('/api/marketing', marketingRouter); // Add marketing routes
app.use('/api/analytics', analyticsRouter); // Add analytics routes
app.use('/api/referrals', referralsRouter); // Add referrals routes

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
