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

// Admin middleware (for campaign management)
const adminProtect = async (req, res, next) => {
  // For now, assume all authenticated users can manage campaigns
  // In production, check for admin role
  protect(req, res, next);
};

// Create email campaign
router.post('/campaigns', adminProtect, async (req, res) => {
  const { name, subject, content, templateId, targetAudience, scheduledAt } = req.body;

  try {
    if (!name || !subject) {
      return res.status(400).json({ message: 'Campaign name and subject are required' });
    }

    const newCampaign = await pool.query(
      `INSERT INTO email_campaigns (name, subject, content, template_id, target_audience, scheduled_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, subject, content, templateId, JSON.stringify(targetAudience), scheduledAt]
    );

    res.status(201).json(newCampaign.rows[0]);
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ message: 'Server error creating campaign' });
  }
});

// Get all campaigns
router.get('/campaigns', adminProtect, async (req, res) => {
  try {
    const campaigns = await pool.query(
      'SELECT * FROM email_campaigns ORDER BY created_at DESC'
    );

    res.json(campaigns.rows);
  } catch (error) {
    console.error('Campaigns fetch error:', error);
    res.status(500).json({ message: 'Server error fetching campaigns' });
  }
});

// Get campaign by ID
router.get('/campaigns/:id', adminProtect, async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await pool.query('SELECT * FROM email_campaigns WHERE id = $1', [id]);

    if (campaign.rows.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign.rows[0]);
  } catch (error) {
    console.error('Campaign fetch error:', error);
    res.status(500).json({ message: 'Server error fetching campaign' });
  }
});

// Update campaign
router.put('/campaigns/:id', adminProtect, async (req, res) => {
  const { id } = req.params;
  const { name, subject, content, templateId, targetAudience, scheduledAt, status } = req.body;

  try {
    const updatedCampaign = await pool.query(
      `UPDATE email_campaigns SET 
       name = $1, subject = $2, content = $3, template_id = $4, 
       target_audience = $5, scheduled_at = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, subject, content, templateId, JSON.stringify(targetAudience), scheduledAt, status, id]
    );

    if (updatedCampaign.rows.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(updatedCampaign.rows[0]);
  } catch (error) {
    console.error('Campaign update error:', error);
    res.status(500).json({ message: 'Server error updating campaign' });
  }
});

// Delete campaign
router.delete('/campaigns/:id', adminProtect, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCampaign = await pool.query('DELETE FROM email_campaigns WHERE id = $1 RETURNING *', [id]);

    if (deletedCampaign.rows.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Campaign deletion error:', error);
    res.status(500).json({ message: 'Server error deleting campaign' });
  }
});

// Send campaign to users
router.post('/campaigns/:id/send', adminProtect, async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await pool.query('SELECT * FROM email_campaigns WHERE id = $1', [id]);

    if (campaign.rows.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const campaignData = campaign.rows[0];
    const targetAudience = campaignData.target_audience || {};

    // Build user query based on target audience criteria
    let userQuery = 'SELECT id, email, first_name, last_name FROM users WHERE is_active = true';
    const queryParams = [];
    let paramCount = 0;

    if (targetAudience.marketingEmails !== undefined) {
      paramCount++;
      userQuery += ` AND marketing_emails = $${paramCount}`;
      queryParams.push(targetAudience.marketingEmails);
    }

    if (targetAudience.customerTier) {
      paramCount++;
      userQuery += ` AND customer_tier = $${paramCount}`;
      queryParams.push(targetAudience.customerTier);
    }

    const targetUsers = await pool.query(userQuery, queryParams);

    // Create campaign recipients
    for (const user of targetUsers.rows) {
      await pool.query(
        'INSERT INTO email_campaign_recipients (campaign_id, user_id) VALUES ($1, $2)',
        [id, user.id]
      );
    }

    // Update campaign status
    await pool.query(
      'UPDATE email_campaigns SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['sent', id]
    );

    res.json({ 
      message: 'Campaign sent successfully', 
      recipientsCount: targetUsers.rows.length 
    });
  } catch (error) {
    console.error('Campaign send error:', error);
    res.status(500).json({ message: 'Server error sending campaign' });
  }
});

// Get campaign analytics
router.get('/campaigns/:id/analytics', adminProtect, async (req, res) => {
  const { id } = req.params;

  try {
    const analytics = await pool.query(`
      SELECT 
        COUNT(*) as total_recipients,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened_count,
        COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_count,
        COUNT(CASE WHEN unsubscribed_at IS NOT NULL THEN 1 END) as unsubscribed_count
      FROM email_campaign_recipients 
      WHERE campaign_id = $1
    `, [id]);

    const result = analytics.rows[0];
    const totalRecipients = parseInt(result.total_recipients) || 0;
    const sentCount = parseInt(result.sent_count) || 0;
    const openedCount = parseInt(result.opened_count) || 0;
    const clickedCount = parseInt(result.clicked_count) || 0;
    const unsubscribedCount = parseInt(result.unsubscribed_count) || 0;

    res.json({
      totalRecipients,
      sentCount,
      openedCount,
      clickedCount,
      unsubscribedCount,
      openRate: totalRecipients > 0 ? (openedCount / totalRecipients * 100).toFixed(2) : 0,
      clickRate: totalRecipients > 0 ? (clickedCount / totalRecipients * 100).toFixed(2) : 0,
      unsubscribeRate: totalRecipients > 0 ? (unsubscribedCount / totalRecipients * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// Track email opens
router.get('/track/open/:campaignId/:userId', async (req, res) => {
  const { campaignId, userId } = req.params;

  try {
    await pool.query(
      'UPDATE email_campaign_recipients SET opened_at = CURRENT_TIMESTAMP WHERE campaign_id = $1 AND user_id = $2 AND opened_at IS NULL',
      [campaignId, userId]
    );

    // Return a 1x1 pixel transparent image
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pixel);
  } catch (error) {
    console.error('Email tracking error:', error);
    res.status(500).end();
  }
});

// Track email clicks
router.get('/track/click/:campaignId/:userId', async (req, res) => {
  const { campaignId, userId } = req.params;
  const { url } = req.query;

  try {
    await pool.query(
      'UPDATE email_campaign_recipients SET clicked_at = CURRENT_TIMESTAMP WHERE campaign_id = $1 AND user_id = $2 AND clicked_at IS NULL',
      [campaignId, userId]
    );

    // Redirect to the original URL
    res.redirect(url || '/');
  } catch (error) {
    console.error('Click tracking error:', error);
    res.redirect(url || '/');
  }
});

export default router;
