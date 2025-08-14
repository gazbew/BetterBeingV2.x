import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

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

// Register a new user
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    const newUser = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, created_at',
      [email, hashedPassword, firstName, lastName]
    );

    // Generate token
    const token = generateToken(newUser.rows[0].id);

    res.status(201).json({
      user: newUser.rows[0],
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.rows[0].id);

    res.json({
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        first_name: user.rows[0].first_name,
        last_name: user.rows[0].last_name,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const userProfile = await pool.query(
      'SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userProfile.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userProfile.rows[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  const {
    firstName, lastName, phone, dateOfBirth, gender, addressLine1, addressLine2, city, province, postalCode, country,
    marketingEmails, marketingSMS, newsletterSubscribed
  } = req.body;

  try {
    const updatedUser = await pool.query(
      `UPDATE users SET 
        first_name = $1, last_name = $2, phone = $3, date_of_birth = $4, gender = $5, 
        address_line1 = $6, address_line2 = $7, city = $8, province = $9, postal_code = $10, country = $11,
        marketing_emails = $12, marketing_sms = $13, newsletter_subscribed = $14,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $15 RETURNING id, email, first_name, last_name, phone, updated_at, date_of_birth, gender,
      address_line1, address_line2, city, province, postal_code, country, 
      marketing_emails, marketing_sms, newsletter_subscribed`,
      [
        firstName, lastName, phone, dateOfBirth, gender, addressLine1, addressLine2, city, province, postalCode, country,
        marketingEmails, marketingSMS, newsletterSubscribed, req.user.id
      ]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Update user preferences
router.put('/preferences', protect, async (req, res) => {
  const { marketingEmails, marketingSMS, newsletterSubscribed } = req.body;

  try {
    const updatedPreferences = await pool.query(
      'UPDATE users SET marketing_emails = $1, marketing_sms = $2, newsletter_subscribed = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, marketing_emails, marketing_sms, newsletter_subscribed',
      [marketingEmails, marketingSMS, newsletterSubscribed, req.user.id]
    );

    if (updatedPreferences.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedPreferences.rows[0]);
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
});

export default router;
