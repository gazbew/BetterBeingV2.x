import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();

// Middleware to protect admin routes
const adminProtect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // For now, all authenticated users are considered admin
    // In production, add proper role checking
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Helper function to create slug from name
const createSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, featured, popular, search, sort, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        sc.name as subcategory_name,
        array_agg(DISTINCT pb.benefit) as benefits,
        array_agg(DISTINCT pi.ingredient) as ingredients,
        array_agg(DISTINCT pt.tag) as tags,
        json_agg(DISTINCT jsonb_build_object('size', ps.size, 'price', ps.price, 'original_price', ps.original_price)) as sizes
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN product_benefits pb ON p.id = pb.product_id
      LEFT JOIN product_ingredients pi ON p.id = pi.product_id
      LEFT JOIN product_tags pt ON p.id = pt.product_id
      LEFT JOIN product_sizes ps ON p.id = ps.product_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;
    
    if (category) {
      paramCount++;
      query += ` AND c.slug = $${paramCount}`;
      queryParams.push(category);
    }
    
    if (subcategory) {
      paramCount++;
      query += ` AND sc.slug = $${paramCount}`;
      queryParams.push(subcategory);
    }
    
    if (featured === 'true') {
      query += ` AND p.is_featured = true`;
    }
    
    if (popular === 'true') {
      query += ` AND p.is_popular = true`;
    }
    
    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` GROUP BY p.id, c.name, sc.name`;
    
    // Sorting
    switch (sort) {
      case 'price-low':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price-high':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'rating':
        query += ` ORDER BY p.rating DESC`;
        break;
      case 'popular':
        query += ` ORDER BY p.reviews_count DESC`;
        break;
      default:
        query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
    }
    
    // Pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamNum = 0;
    
    if (category) {
      countParamNum++;
      countQuery += ` AND c.slug = $${countParamNum}`;
      countParams.push(category);
    }
    
    if (subcategory) {
      countParamNum++;
      countQuery += ` AND sc.slug = $${countParamNum}`;
      countParams.push(subcategory);
    }
    
    if (featured === 'true') {
      countQuery += ` AND p.is_featured = true`;
    }
    
    if (popular === 'true') {
      countQuery += ` AND p.is_popular = true`;
    }
    
    if (search) {
      countParamNum++;
      countQuery += ` AND (p.name ILIKE $${countParamNum} OR p.description ILIKE $${countParamNum})`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      products: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        sc.name as subcategory_name,
        array_agg(DISTINCT pb.benefit) as benefits,
        array_agg(DISTINCT pi.ingredient) as ingredients,
        array_agg(DISTINCT pt.tag) as tags,
        json_agg(DISTINCT jsonb_build_object('size', ps.size, 'price', ps.price, 'original_price', ps.original_price)) as sizes
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN product_benefits pb ON p.id = pb.product_id
      LEFT JOIN product_ingredients pi ON p.id = pi.product_id
      LEFT JOIN product_tags pt ON p.id = pt.product_id
      LEFT JOIN product_sizes ps ON p.id = ps.product_id
      WHERE p.id = $1
      GROUP BY p.id, c.name, sc.name
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        json_agg(
          json_build_object(
            'id', sc.id,
            'name', sc.name,
            'slug', sc.slug,
            'description', sc.description
          )
        ) as subcategories
      FROM categories c
      LEFT JOIN subcategories sc ON c.id = sc.category_id
      GROUP BY c.id
      ORDER BY c.name
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ========== ADMIN ROUTES ==========

// Create new product
router.post('/admin/products', adminProtect, async (req, res) => {
  const {
    sku, name, description, longDescription, price, originalPrice, categoryId, subcategoryId,
    imageUrl, isPopular, isFeatured, inStock, stockCount, usageInstructions, warnings,
    benefits, ingredients, tags, sizes
  } = req.body;

  try {
    if (!sku || !name || !price || !categoryId) {
      return res.status(400).json({ message: 'SKU, name, price, and category are required' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create product
      const slug = createSlug(name);
      const newProduct = await client.query(
        `INSERT INTO products 
         (sku, name, slug, description, long_description, price, original_price, category_id, subcategory_id, 
          image_url, is_popular, is_featured, in_stock, stock_count, usage_instructions, warnings) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
         RETURNING *`,
        [
          sku, name, slug, description, longDescription, price, originalPrice, categoryId, subcategoryId,
          imageUrl, isPopular || false, isFeatured || false, inStock !== false, stockCount || 0,
          usageInstructions, warnings
        ]
      );

      const productId = newProduct.rows[0].id;

      // Add benefits
      if (benefits && benefits.length > 0) {
        for (const benefit of benefits) {
          await client.query(
            'INSERT INTO product_benefits (product_id, benefit) VALUES ($1, $2)',
            [productId, benefit]
          );
        }
      }

      // Add ingredients
      if (ingredients && ingredients.length > 0) {
        for (const ingredient of ingredients) {
          await client.query(
            'INSERT INTO product_ingredients (product_id, ingredient) VALUES ($1, $2)',
            [productId, ingredient]
          );
        }
      }

      // Add tags
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          await client.query(
            'INSERT INTO product_tags (product_id, tag) VALUES ($1, $2)',
            [productId, tag]
          );
        }
      }

      // Add sizes
      if (sizes && sizes.length > 0) {
        for (const size of sizes) {
          await client.query(
            'INSERT INTO product_sizes (product_id, size, price, original_price) VALUES ($1, $2, $3, $4)',
            [productId, size.size, size.price, size.originalPrice]
          );
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Product created successfully',
        product: newProduct.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// Update product
router.put('/admin/products/:id', adminProtect, async (req, res) => {
  const { id } = req.params;
  const {
    sku, name, description, longDescription, price, originalPrice, categoryId, subcategoryId,
    imageUrl, isPopular, isFeatured, inStock, stockCount, usageInstructions, warnings,
    benefits, ingredients, tags, sizes
  } = req.body;

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update product
      const slug = createSlug(name);
      const updatedProduct = await client.query(
        `UPDATE products SET 
         sku = $1, name = $2, slug = $3, description = $4, long_description = $5, 
         price = $6, original_price = $7, category_id = $8, subcategory_id = $9, 
         image_url = $10, is_popular = $11, is_featured = $12, in_stock = $13, 
         stock_count = $14, usage_instructions = $15, warnings = $16, updated_at = CURRENT_TIMESTAMP
         WHERE id = $17 RETURNING *`,
        [
          sku, name, slug, description, longDescription, price, originalPrice, categoryId, subcategoryId,
          imageUrl, isPopular, isFeatured, inStock, stockCount, usageInstructions, warnings, id
        ]
      );

      if (updatedProduct.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Product not found' });
      }

      // Delete existing related data
      await client.query('DELETE FROM product_benefits WHERE product_id = $1', [id]);
      await client.query('DELETE FROM product_ingredients WHERE product_id = $1', [id]);
      await client.query('DELETE FROM product_tags WHERE product_id = $1', [id]);
      await client.query('DELETE FROM product_sizes WHERE product_id = $1', [id]);

      // Re-add benefits
      if (benefits && benefits.length > 0) {
        for (const benefit of benefits) {
          await client.query(
            'INSERT INTO product_benefits (product_id, benefit) VALUES ($1, $2)',
            [id, benefit]
          );
        }
      }

      // Re-add ingredients
      if (ingredients && ingredients.length > 0) {
        for (const ingredient of ingredients) {
          await client.query(
            'INSERT INTO product_ingredients (product_id, ingredient) VALUES ($1, $2)',
            [id, ingredient]
          );
        }
      }

      // Re-add tags
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          await client.query(
            'INSERT INTO product_tags (product_id, tag) VALUES ($1, $2)',
            [id, tag]
          );
        }
      }

      // Re-add sizes
      if (sizes && sizes.length > 0) {
        for (const size of sizes) {
          await client.query(
            'INSERT INTO product_sizes (product_id, size, price, original_price) VALUES ($1, $2, $3, $4)',
            [id, size.size, size.price, size.originalPrice]
          );
        }
      }

      await client.query('COMMIT');

      res.json({
        message: 'Product updated successfully',
        product: updatedProduct.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// Delete product
router.delete('/admin/products/:id', adminProtect, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (deletedProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// Create category
router.post('/admin/categories', adminProtect, async (req, res) => {
  const { name, description, icon } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const slug = createSlug(name);
    const newCategory = await pool.query(
      'INSERT INTO categories (name, slug, description, icon) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, slug, description, icon]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory.rows[0]
    });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ message: 'Server error creating category' });
  }
});

// Create subcategory
router.post('/admin/subcategories', adminProtect, async (req, res) => {
  const { categoryId, name, description } = req.body;

  try {
    if (!categoryId || !name) {
      return res.status(400).json({ message: 'Category ID and name are required' });
    }

    const slug = createSlug(name);
    const newSubcategory = await pool.query(
      'INSERT INTO subcategories (category_id, name, slug, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [categoryId, name, slug, description]
    );

    res.status(201).json({
      message: 'Subcategory created successfully',
      subcategory: newSubcategory.rows[0]
    });
  } catch (error) {
    console.error('Subcategory creation error:', error);
    res.status(500).json({ message: 'Server error creating subcategory' });
  }
});

export default router;
