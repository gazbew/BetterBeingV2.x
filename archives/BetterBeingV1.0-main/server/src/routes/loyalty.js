import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Get user loyalty points
router.get('/points', protect, async (req, res) => {
  try {
    const points = await pool.query('SELECT loyalty_points FROM users WHERE id = $1', [req.user.id]);

    if (points.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(points.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching loyalty points' });
  }
});

// Add loyalty points
router.post('/points/add', protect, async (req, res) => {
  const { points, description } = req.body;

  try {
    if (!points || points <= 0) {
      return res.status(400).json({ message: 'Invalid points value' });
    }

    const newTransaction = await pool.query(
      `INSERT INTO loyalty_transactions (user_id, transaction_type, points, description) 
      VALUES ($1, 'earned', $2, $3) RETURNING *`,
      [req.user.id, points, description]
    );

    await pool.query(
      'UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2',
      [points, req.user.id]
    );

    res.status(201).json(newTransaction.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding loyalty points' });
  }
});

// Redeem loyalty points
router.post('/points/redeem', protect, async (req, res) => {
  const { points, description } = req.body;

  try {
    const currentUser = await pool.query('SELECT loyalty_points FROM users WHERE id = $1', [req.user.id]);

    if (currentUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.rows[0].loyalty_points < points) {
      return res.status(400).json({ message: 'Insufficient loyalty points' });
    }

    const newTransaction = await pool.query(
      `INSERT INTO loyalty_transactions (user_id, transaction_type, points, description) 
      VALUES ($1, 'redeemed', -$2, $3) RETURNING *`,
      [req.user.id, points, description]
    );

    await pool.query(
      'UPDATE users SET loyalty_points = loyalty_points - $1 WHERE id = $2',
      [points, req.user.id]
    );

    res.status(201).json(newTransaction.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error redeeming loyalty points' });
  }
});

// Get loyalty transactions
router.get('/transactions', protect, async (req, res) => {
  try {
    const transactions = await pool.query('SELECT * FROM loyalty_transactions WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);

    res.json(transactions.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

export default router;

