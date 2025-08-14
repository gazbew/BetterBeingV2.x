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

// Get user's cart
router.get('/', protect, async (req, res) => {
  try {
    const cartItems = await pool.query(`
      SELECT 
        c.id as cart_id,
        c.quantity,
        c.size,
        p.id as product_id,
        p.name,
        p.price,
        p.image_url,
        p.in_stock,
        p.stock_count
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    res.json(cartItems.rows);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
});

// Add item to cart
router.post('/add', protect, async (req, res) => {
  const { productId, quantity = 1, size } = req.body;

  try {
    // Validation
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists and is in stock
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.rows[0].in_stock) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }

    // Check if item already exists in cart
    const existingItem = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2 AND ($3::VARCHAR IS NULL OR size = $3)',
      [req.user.id, productId, size]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      const updatedItem = await pool.query(
        'UPDATE cart SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [quantity, existingItem.rows[0].id]
      );
      
      res.json({ message: 'Cart updated', item: updatedItem.rows[0] });
    } else {
      // Add new item
      const newItem = await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity, size) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.user.id, productId, quantity, size]
      );
      
      res.status(201).json({ message: 'Item added to cart', item: newItem.rows[0] });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
});

// Update cart item quantity
router.put('/update/:cartItemId', protect, async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  try {
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Check if cart item belongs to user
    const cartItem = await pool.query('SELECT * FROM cart WHERE id = $1 AND user_id = $2', [cartItemId, req.user.id]);
    if (cartItem.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update quantity
    const updatedItem = await pool.query(
      'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, cartItemId]
    );

    res.json({ message: 'Cart item updated', item: updatedItem.rows[0] });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error updating cart' });
  }
});

// Remove item from cart
router.delete('/remove/:cartItemId', protect, async (req, res) => {
  const { cartItemId } = req.params;

  try {
    // Check if cart item belongs to user
    const cartItem = await pool.query('SELECT * FROM cart WHERE id = $1 AND user_id = $2', [cartItemId, req.user.id]);
    if (cartItem.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Remove item
    await pool.query('DELETE FROM cart WHERE id = $1', [cartItemId]);

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
});

// Clear entire cart
router.delete('/clear', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
});

// Get cart summary (total items and price)
router.get('/summary', protect, async (req, res) => {
  try {
    const summary = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(c.quantity) as total_quantity,
        SUM(c.quantity * p.price::numeric) as total_price
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `, [req.user.id]);

    const result = summary.rows[0];
    res.json({
      totalItems: parseInt(result.total_items) || 0,
      totalQuantity: parseInt(result.total_quantity) || 0,
      totalPrice: parseFloat(result.total_price) || 0
    });
  } catch (error) {
    console.error('Cart summary error:', error);
    res.status(500).json({ message: 'Server error fetching cart summary' });
  }
});

export default router;
