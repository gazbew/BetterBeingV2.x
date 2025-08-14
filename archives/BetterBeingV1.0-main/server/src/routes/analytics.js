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

// Admin middleware
const adminProtect = async (req, res, next) => {
  protect(req, res, next);
};

// Log user activity
router.post('/activity', protect, async (req, res) => {
  const { activityType, activityData } = req.body;

  try {
    if (!activityType) {
      return res.status(400).json({ message: 'Activity type is required' });
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    const newActivity = await pool.query(
      'INSERT INTO user_activity_log (user_id, activity_type, activity_data, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, activityType, JSON.stringify(activityData), ipAddress, userAgent]
    );

    res.status(201).json(newActivity.rows[0]);
  } catch (error) {
    console.error('Activity logging error:', error);
    res.status(500).json({ message: 'Server error logging activity' });
  }
});

// Get user activity history
router.get('/activity/user/:userId', adminProtect, async (req, res) => {
  const { userId } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  try {
    const activities = await pool.query(
      'SELECT * FROM user_activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );

    res.json(activities.rows);
  } catch (error) {
    console.error('Activity fetch error:', error);
    res.status(500).json({ message: 'Server error fetching activities' });
  }
});

// Create customer segment
router.post('/segments', adminProtect, async (req, res) => {
  const { name, description, criteria } = req.body;

  try {
    if (!name || !criteria) {
      return res.status(400).json({ message: 'Segment name and criteria are required' });
    }

    const newSegment = await pool.query(
      'INSERT INTO customer_segments (name, description, criteria) VALUES ($1, $2, $3) RETURNING *',
      [name, description, JSON.stringify(criteria)]
    );

    res.status(201).json(newSegment.rows[0]);
  } catch (error) {
    console.error('Segment creation error:', error);
    res.status(500).json({ message: 'Server error creating segment' });
  }
});

// Get all customer segments
router.get('/segments', adminProtect, async (req, res) => {
  try {
    const segments = await pool.query('SELECT * FROM customer_segments WHERE is_active = true ORDER BY created_at DESC');

    res.json(segments.rows);
  } catch (error) {
    console.error('Segments fetch error:', error);
    res.status(500).json({ message: 'Server error fetching segments' });
  }
});

// Update customer segment
router.put('/segments/:id', adminProtect, async (req, res) => {
  const { id } = req.params;
  const { name, description, criteria, isActive } = req.body;

  try {
    const updatedSegment = await pool.query(
      'UPDATE customer_segments SET name = $1, description = $2, criteria = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, description, JSON.stringify(criteria), isActive, id]
    );

    if (updatedSegment.rows.length === 0) {
      return res.status(404).json({ message: 'Segment not found' });
    }

    res.json(updatedSegment.rows[0]);
  } catch (error) {
    console.error('Segment update error:', error);
    res.status(500).json({ message: 'Server error updating segment' });
  }
});

// Assign users to segment based on criteria
router.post('/segments/:id/assign', adminProtect, async (req, res) => {
  const { id } = req.params;

  try {
    const segment = await pool.query('SELECT * FROM customer_segments WHERE id = $1', [id]);
    
    if (segment.rows.length === 0) {
      return res.status(404).json({ message: 'Segment not found' });
    }

    const criteria = segment.rows[0].criteria;
    
    // Build user query based on segment criteria
    let userQuery = 'SELECT id FROM users WHERE is_active = true';
    const queryParams = [];
    let paramCount = 0;

    if (criteria.customerTier) {
      paramCount++;
      userQuery += ` AND customer_tier = $${paramCount}`;
      queryParams.push(criteria.customerTier);
    }

    if (criteria.minLoyaltyPoints !== undefined) {
      paramCount++;
      userQuery += ` AND loyalty_points >= $${paramCount}`;
      queryParams.push(criteria.minLoyaltyPoints);
    }

    if (criteria.marketingEmails !== undefined) {
      paramCount++;
      userQuery += ` AND marketing_emails = $${paramCount}`;
      queryParams.push(criteria.marketingEmails);
    }

    if (criteria.registeredAfter) {
      paramCount++;
      userQuery += ` AND created_at >= $${paramCount}`;
      queryParams.push(criteria.registeredAfter);
    }

    const matchingUsers = await pool.query(userQuery, queryParams);

    // Clear existing assignments for this segment
    await pool.query('DELETE FROM user_segments WHERE segment_id = $1', [id]);

    // Assign matching users to segment
    for (const user of matchingUsers.rows) {
      await pool.query(
        'INSERT INTO user_segments (user_id, segment_id) VALUES ($1, $2) ON CONFLICT (user_id, segment_id) DO NOTHING',
        [user.id, id]
      );
    }

    res.json({ 
      message: 'Users assigned to segment successfully', 
      assignedCount: matchingUsers.rows.length 
    });
  } catch (error) {
    console.error('Segment assignment error:', error);
    res.status(500).json({ message: 'Server error assigning users to segment' });
  }
});

// Get users in a segment
router.get('/segments/:id/users', adminProtect, async (req, res) => {
  const { id } = req.params;

  try {
    const users = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.customer_tier, u.loyalty_points, us.assigned_at
      FROM users u
      JOIN user_segments us ON u.id = us.user_id
      WHERE us.segment_id = $1
      ORDER BY us.assigned_at DESC
    `, [id]);

    res.json(users.rows);
  } catch (error) {
    console.error('Segment users fetch error:', error);
    res.status(500).json({ message: 'Server error fetching segment users' });
  }
});

// Analytics dashboard data
router.get('/dashboard', adminProtect, async (req, res) => {
  try {
    // Total users
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = true');
    
    // Total orders
    const totalOrders = await pool.query('SELECT COUNT(*) as count FROM orders');
    
    // Total revenue
    const totalRevenue = await pool.query('SELECT SUM(total) as revenue FROM orders WHERE status != \'cancelled\'');
    
    // Active campaigns
    const activeCampaigns = await pool.query('SELECT COUNT(*) as count FROM email_campaigns WHERE status = \'active\'');
    
    // Top customer tiers
    const customerTiers = await pool.query(`
      SELECT customer_tier, COUNT(*) as count 
      FROM users 
      WHERE is_active = true 
      GROUP BY customer_tier 
      ORDER BY count DESC
    `);

    // Recent user activities
    const recentActivities = await pool.query(`
      SELECT ual.activity_type, COUNT(*) as count
      FROM user_activity_log ual
      WHERE ual.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY ual.activity_type
      ORDER BY count DESC
      LIMIT 10
    `);

    // Monthly user registrations
    const monthlyRegistrations = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as registrations
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month
    `);

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalOrders: parseInt(totalOrders.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].revenue) || 0,
      activeCampaigns: parseInt(activeCampaigns.rows[0].count),
      customerTiers: customerTiers.rows,
      recentActivities: recentActivities.rows,
      monthlyRegistrations: monthlyRegistrations.rows
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// Get product recommendations for user
router.get('/recommendations/:userId', protect, async (req, res) => {
  const { userId } = req.params;
  const { type = 'all', limit = 10 } = req.query;

  try {
    let query = `
      SELECT pr.*, p.name, p.price, p.image_url, p.description
      FROM product_recommendations pr
      JOIN products p ON pr.product_id = p.id
      WHERE pr.user_id = $1 AND pr.expires_at > NOW()
    `;
    const params = [userId];

    if (type !== 'all') {
      query += ' AND pr.recommendation_type = $2';
      params.push(type);
    }

    query += ' ORDER BY pr.score DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const recommendations = await pool.query(query, params);

    res.json(recommendations.rows);
  } catch (error) {
    console.error('Recommendations fetch error:', error);
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
});

// Create product recommendation
router.post('/recommendations', adminProtect, async (req, res) => {
  const { userId, productId, recommendationType, score, expiresAt } = req.body;

  try {
    if (!userId || !productId || !recommendationType) {
      return res.status(400).json({ message: 'User ID, product ID, and recommendation type are required' });
    }

    const newRecommendation = await pool.query(
      'INSERT INTO product_recommendations (user_id, product_id, recommendation_type, score, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, productId, recommendationType, score || 0.5, expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)] // Default 30 days
    );

    res.status(201).json(newRecommendation.rows[0]);
  } catch (error) {
    console.error('Recommendation creation error:', error);
    res.status(500).json({ message: 'Server error creating recommendation' });
  }
});

export default router;
