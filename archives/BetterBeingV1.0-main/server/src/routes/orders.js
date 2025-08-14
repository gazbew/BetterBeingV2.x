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

// Generate order number
const generateOrderNumber = () => {
  return 'ORD-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
};

// Create a new order from cart
router.post('/create-from-cart', protect, async (req, res) => {
  const { shippingAddress, billingAddress, paymentMethod } = req.body;

  try {
    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get cart items with product details
      const cartItems = await client.query(`
        SELECT 
          c.product_id,
          c.quantity,
          c.size,
          p.name,
          p.price,
          p.stock_count,
          p.in_stock
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = $1
      `, [req.user.id]);

      if (cartItems.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Check stock availability
      for (const item of cartItems.rows) {
        if (!item.in_stock || item.stock_count < item.quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
            message: `Insufficient stock for ${item.name}` 
          });
        }
      }

      // Calculate totals
      const subtotal = cartItems.rows.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
      }, 0);
      
      const tax = subtotal * 0.15; // 15% VAT for South Africa
      const shipping = subtotal > 500 ? 0 : 50; // Free shipping over R500
      const total = subtotal + tax + shipping;

      // Create order
      const orderNumber = generateOrderNumber();
      const newOrder = await client.query(
        `INSERT INTO orders (user_id, order_number, status, subtotal, tax, shipping, total, shipping_address, billing_address) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          req.user.id, 
          orderNumber, 
          'pending', 
          subtotal, 
          tax, 
          shipping, 
          total, 
          JSON.stringify(shippingAddress), 
          JSON.stringify(billingAddress || shippingAddress)
        ]
      );

      const orderId = newOrder.rows[0].id;

      // Insert order items and update stock
      for (const item of cartItems.rows) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price, size) 
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.product_id, item.quantity, item.price, item.size]
        );

        // Update product stock
        await client.query(
          'UPDATE products SET stock_count = stock_count - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Clear cart
      await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

      // Add loyalty points (1 point per rand spent)
      const loyaltyPoints = Math.floor(total);
      await client.query(
        'UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2',
        [loyaltyPoints, req.user.id]
      );

      // Log loyalty transaction
      await client.query(
        'INSERT INTO loyalty_transactions (user_id, order_id, transaction_type, points, description) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, orderId, 'earned', loyaltyPoints, `Order ${orderNumber} - Loyalty points earned`]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Order created successfully',
        order: newOrder.rows[0],
        loyaltyPointsEarned: loyaltyPoints
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Create order with specific items
router.post('/', protect, async (req, res) => {
  const { orderItems, shippingAddress, billingAddress, paymentMethod } = req.body;

  try {
    // Validate order items
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate products and calculate total
      let subtotal = 0;
      const validatedItems = [];

      for (const item of orderItems) {
        const product = await client.query(
          'SELECT * FROM products WHERE id = $1',
          [item.productId]
        );

        if (product.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ message: `Product not found: ${item.productId}` });
        }

        const productData = product.rows[0];
        if (!productData.in_stock || productData.stock_count < item.quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
            message: `Insufficient stock for ${productData.name}` 
          });
        }

        const itemTotal = parseFloat(productData.price) * item.quantity;
        subtotal += itemTotal;
        
        validatedItems.push({
          ...item,
          price: productData.price,
          name: productData.name
        });
      }

      const tax = subtotal * 0.15; // 15% VAT
      const shipping = subtotal > 500 ? 0 : 50; // Free shipping over R500
      const total = subtotal + tax + shipping;

      // Create order
      const orderNumber = generateOrderNumber();
      const newOrder = await client.query(
        `INSERT INTO orders (user_id, order_number, status, subtotal, tax, shipping, total, shipping_address, billing_address) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          req.user.id,
          orderNumber,
          'pending',
          subtotal,
          tax,
          shipping,
          total,
          JSON.stringify(shippingAddress),
          JSON.stringify(billingAddress || shippingAddress)
        ]
      );

      const orderId = newOrder.rows[0].id;

      // Insert order items and update stock
      for (const item of validatedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price, size) 
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.productId, item.quantity, item.price, item.size]
        );

        // Update product stock
        await client.query(
          'UPDATE products SET stock_count = stock_count - $1 WHERE id = $2',
          [item.quantity, item.productId]
        );
      }

      // Add loyalty points
      const loyaltyPoints = Math.floor(total);
      await client.query(
        'UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2',
        [loyaltyPoints, req.user.id]
      );

      // Log loyalty transaction
      await client.query(
        'INSERT INTO loyalty_transactions (user_id, order_id, transaction_type, points, description) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, orderId, 'earned', loyaltyPoints, `Order ${orderNumber} - Loyalty points earned`]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Order created successfully',
        order: newOrder.rows[0],
        loyaltyPointsEarned: loyaltyPoints
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await pool.query(`
      SELECT 
        o.*,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.json(orders.rows);
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get order details by ID
router.get('/:orderId', protect, async (req, res) => {
  const { orderId } = req.params;

  try {
    // Get order details
    const order = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get order items with product details
    const orderItems = await pool.query(`
      SELECT 
        oi.*,
        p.name,
        p.image_url,
        p.description
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);

    res.json({
      ...order.rows[0],
      items: orderItems.rows
    });
  } catch (error) {
    console.error('Order details fetch error:', error);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
});

// Update order status (admin function)
router.put('/:orderId/status', protect, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedOrder = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (updatedOrder.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ 
      message: 'Order status updated successfully', 
      order: updatedOrder.rows[0] 
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

// Cancel order
router.put('/:orderId/cancel', protect, async (req, res) => {
  const { orderId } = req.params;

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if order can be cancelled
      const order = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
        [orderId, req.user.id]
      );

      if (order.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Order not found' });
      }

      const orderData = order.rows[0];
      if (['shipped', 'delivered', 'cancelled'].includes(orderData.status)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Order cannot be cancelled' });
      }

      // Get order items to restore stock
      const orderItems = await client.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [orderId]
      );

      // Restore stock for each item
      for (const item of orderItems.rows) {
        await client.query(
          'UPDATE products SET stock_count = stock_count + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Update order status
      await client.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['cancelled', orderId]
      );

      // Reverse loyalty points if any
      const loyaltyPoints = Math.floor(parseFloat(orderData.total));
      await client.query(
        'UPDATE users SET loyalty_points = loyalty_points - $1 WHERE id = $2',
        [loyaltyPoints, req.user.id]
      );

      // Log loyalty reversal
      await client.query(
        'INSERT INTO loyalty_transactions (user_id, order_id, transaction_type, points, description) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, orderId, 'redeemed', loyaltyPoints, `Order ${orderData.order_number} cancelled - Points reversed`]
      );

      await client.query('COMMIT');

      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({ message: 'Server error cancelling order' });
  }
});

export default router;
