import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import crypto from 'crypto';

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

// Generate referral code for user
router.post('/generate-code', protect, async (req, res) => {
  try {
    // Check if user already has a referral code
    const existingUser = await pool.query('SELECT referral_code FROM users WHERE id = $1', [req.user.id]);
    
    if (existingUser.rows[0]?.referral_code) {
      return res.json({ referralCode: existingUser.rows[0].referral_code });
    }

    // Generate unique referral code
    let referralCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      
      const existingCode = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
      if (existingCode.rows.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ message: 'Unable to generate unique referral code' });
    }

    // Update user with referral code
    await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [referralCode, req.user.id]);

    res.json({ referralCode });
  } catch (error) {
    console.error('Referral code generation error:', error);
    res.status(500).json({ message: 'Server error generating referral code' });
  }
});

// Get user's referral code and stats
router.get('/my-referrals', protect, async (req, res) => {
  try {
    const user = await pool.query('SELECT referral_code FROM users WHERE id = $1', [req.user.id]);
    
    if (!user.rows[0]?.referral_code) {
      return res.json({ 
        referralCode: null, 
        totalReferrals: 0, 
        completedReferrals: 0, 
        totalRewardPoints: 0,
        referrals: []
      });
    }

    const referralCode = user.rows[0].referral_code;

    // Get referral statistics
    const referralStats = await pool.query(`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
        COALESCE(SUM(reward_points), 0) as total_reward_points
      FROM referrals 
      WHERE referrer_id = $1
    `, [req.user.id]);

    // Get detailed referral list
    const referrals = await pool.query(`
      SELECT 
        r.*,
        u.first_name,
        u.last_name,
        u.email,
        u.created_at as user_registered_at
      FROM referrals r
      JOIN users u ON r.referred_id = u.id
      WHERE r.referrer_id = $1
      ORDER BY r.created_at DESC
    `, [req.user.id]);

    const stats = referralStats.rows[0];

    res.json({
      referralCode,
      totalReferrals: parseInt(stats.total_referrals),
      completedReferrals: parseInt(stats.completed_referrals),
      totalRewardPoints: parseInt(stats.total_reward_points),
      referrals: referrals.rows
    });
  } catch (error) {
    console.error('Referral stats fetch error:', error);
    res.status(500).json({ message: 'Server error fetching referral stats' });
  }
});

// Apply referral code during registration
router.post('/apply-code', async (req, res) => {
  const { referralCode, newUserId } = req.body;

  try {
    if (!referralCode || !newUserId) {
      return res.status(400).json({ message: 'Referral code and new user ID are required' });
    }

    // Find referrer
    const referrer = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
    
    if (referrer.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    const referrerId = referrer.rows[0].id;

    // Check if referral already exists
    const existingReferral = await pool.query(
      'SELECT id FROM referrals WHERE referrer_id = $1 AND referred_id = $2',
      [referrerId, newUserId]
    );

    if (existingReferral.rows.length > 0) {
      return res.status(400).json({ message: 'Referral already exists' });
    }

    // Create referral record
    const newReferral = await pool.query(
      'INSERT INTO referrals (referrer_id, referred_id, referral_code, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [referrerId, newUserId, referralCode, 'pending']
    );

    // Update referred user's referred_by field
    await pool.query('UPDATE users SET referred_by = $1 WHERE id = $2', [referrerId, newUserId]);

    res.status(201).json(newReferral.rows[0]);
  } catch (error) {
    console.error('Referral application error:', error);
    res.status(500).json({ message: 'Server error applying referral code' });
  }
});

// Complete referral (called when referred user makes first purchase)
router.post('/complete/:referralId', async (req, res) => {
  const { referralId } = req.params;
  const { rewardPoints = 100 } = req.body; // Default 100 points reward

  try {
    // Get referral details
    const referral = await pool.query('SELECT * FROM referrals WHERE id = $1', [referralId]);
    
    if (referral.rows.length === 0) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    if (referral.rows[0].status === 'completed') {
      return res.status(400).json({ message: 'Referral already completed' });
    }

    const referralData = referral.rows[0];

    // Update referral status
    await pool.query(
      'UPDATE referrals SET status = $1, reward_points = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['completed', rewardPoints, referralId]
    );

    // Add loyalty points to referrer
    await pool.query(
      'UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2',
      [rewardPoints, referralData.referrer_id]
    );

    // Create loyalty transaction record
    await pool.query(
      'INSERT INTO loyalty_transactions (user_id, transaction_type, points, description) VALUES ($1, $2, $3, $4)',
      [
        referralData.referrer_id, 
        'earned', 
        rewardPoints, 
        'Referral reward - friend completed first purchase'
      ]
    );

    res.json({ message: 'Referral completed successfully', rewardPoints });
  } catch (error) {
    console.error('Referral completion error:', error);
    res.status(500).json({ message: 'Server error completing referral' });
  }
});

// Reward referral (called by admin or automatically)
router.post('/reward/:referralId', protect, async (req, res) => {
  const { referralId } = req.params;

  try {
    const referral = await pool.query('SELECT * FROM referrals WHERE id = $1', [referralId]);
    
    if (referral.rows.length === 0) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    if (referral.rows[0].status !== 'completed') {
      return res.status(400).json({ message: 'Referral must be completed before rewarding' });
    }

    // Update referral as rewarded
    await pool.query(
      'UPDATE referrals SET rewarded_at = CURRENT_TIMESTAMP WHERE id = $1',
      [referralId]
    );

    res.json({ message: 'Referral rewarded successfully' });
  } catch (error) {
    console.error('Referral reward error:', error);
    res.status(500).json({ message: 'Server error rewarding referral' });
  }
});

// Get referral leaderboard
router.get('/leaderboard', async (req, res) => {
  const { limit = 10 } = req.query;

  try {
    const leaderboard = await pool.query(`
      SELECT 
        u.first_name,
        u.last_name,
        u.customer_tier,
        COUNT(r.id) as total_referrals,
        COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_referrals,
        COALESCE(SUM(r.reward_points), 0) as total_points
      FROM users u
      LEFT JOIN referrals r ON u.id = r.referrer_id
      WHERE u.referral_code IS NOT NULL
      GROUP BY u.id, u.first_name, u.last_name, u.customer_tier
      HAVING COUNT(r.id) > 0
      ORDER BY completed_referrals DESC, total_referrals DESC
      LIMIT $1
    `, [limit]);

    res.json(leaderboard.rows);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

// Validate referral code
router.get('/validate/:code', async (req, res) => {
  const { code } = req.params;

  try {
    const referrer = await pool.query(
      'SELECT id, first_name, last_name FROM users WHERE referral_code = $1',
      [code]
    );

    if (referrer.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    res.json({ 
      valid: true, 
      referrer: referrer.rows[0] 
    });
  } catch (error) {
    console.error('Referral code validation error:', error);
    res.status(500).json({ message: 'Server error validating referral code' });
  }
});

export default router;
