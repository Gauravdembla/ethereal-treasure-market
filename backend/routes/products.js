const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const database = require('../config/database');
const auth = require('../middleware/auth');

const db = database.getDb();

// Validation schemas
const productSchema = Joi.object({
  sku: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  price: Joi.number().positive().required(),
  original_price: Joi.number().positive().allow(null),
  category: Joi.string().allow(''),
  tags: Joi.string().allow(''),
  status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()),
  images: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    alt_text: Joi.string().allow(''),
    is_primary: Joi.boolean().default(false)
  })),
  available_quantity: Joi.number().integer().min(0).default(0)
});

// GET /api/products - Get all products with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const status = req.query.status || 'active';
    const search = req.query.search;

    let query = `
      SELECT p.*, i.available_quantity, i.reserved_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.status = ?
    `;
    let params = [status];

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    db.all(query, params, async (err, products) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get images and specifications for each product
      const productsWithDetails = await Promise.all(products.map(async (product) => {
        return new Promise((resolve) => {
          // Get images
          db.all(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, is_primary DESC',
            [product.id],
            (err, images) => {
              if (err) images = [];
              
              // Get specifications
              db.all(
                'SELECT spec_key, spec_value FROM product_specifications WHERE product_id = ?',
                [product.id],
                (err, specs) => {
                  if (err) specs = [];
                  
                  const specifications = {};
                  specs.forEach(spec => {
                    specifications[spec.spec_key] = spec.spec_value;
                  });

                  resolve({
                    ...product,
                    images: images || [],
                    specifications
                  });
                }
              );
            }
          );
        });
      }));

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM products WHERE status = ?';
      let countParams = [status];

      if (category) {
        countQuery += ' AND category = ?';
        countParams.push(category);
      }

      if (search) {
        countQuery += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      db.get(countQuery, countParams, (err, countResult) => {
        const total = countResult ? countResult.total : 0;
        const totalPages = Math.ceil(total / limit);

        res.json({
          products: productsWithDetails,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
  const productId = req.params.id;

  db.get(
    `SELECT p.*, i.available_quantity, i.reserved_quantity, i.reorder_level
     FROM products p
     LEFT JOIN inventory i ON p.id = i.product_id
     WHERE p.id = ?`,
    [productId],
    (err, product) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Get images
      db.all(
        'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, is_primary DESC',
        [productId],
        (err, images) => {
          if (err) images = [];

          // Get specifications
          db.all(
            'SELECT spec_key, spec_value FROM product_specifications WHERE product_id = ?',
            [productId],
            (err, specs) => {
              if (err) specs = [];

              const specifications = {};
              specs.forEach(spec => {
                specifications[spec.spec_key] = spec.spec_value;
              });

              res.json({
                ...product,
                images: images || [],
                specifications
              });
            }
          );
        }
      );
    }
  );
});

// POST /api/products - Create new product
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const productId = uuidv4();
    const {
      sku, name, description, price, original_price, category, tags, status,
      specifications, images, available_quantity
    } = value;

    // Check if SKU already exists
    db.get('SELECT id FROM products WHERE sku = ?', [sku], (err, existingProduct) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (existingProduct) {
        return res.status(400).json({ error: 'SKU already exists' });
      }

      // Insert product
      db.run(
        `INSERT INTO products (id, sku, name, description, price, original_price, category, tags, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [productId, sku, name, description, price, original_price, category, tags, status],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Insert inventory
          db.run(
            'INSERT INTO inventory (product_id, available_quantity) VALUES (?, ?)',
            [productId, available_quantity || 0],
            (err) => {
              if (err) console.error('Error creating inventory:', err);
            }
          );

          // Insert specifications
          if (specifications) {
            Object.entries(specifications).forEach(([key, value]) => {
              db.run(
                'INSERT INTO product_specifications (product_id, spec_key, spec_value) VALUES (?, ?, ?)',
                [productId, key, value],
                (err) => {
                  if (err) console.error('Error inserting specification:', err);
                }
              );
            });
          }

          // Insert images
          if (images && images.length > 0) {
            images.forEach((image, index) => {
              db.run(
                'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
                [productId, image.url, image.alt_text || '', image.is_primary || false, index],
                (err) => {
                  if (err) console.error('Error inserting image:', err);
                }
              );
            });
          }

          res.status(201).json({
            message: 'Product created successfully',
            productId,
            product: { id: productId, ...value }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const productId = req.params.id;
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      sku, name, description, price, original_price, category, tags, status,
      specifications, images, available_quantity
    } = value;

    // Check if product exists
    db.get('SELECT id FROM products WHERE id = ?', [productId], (err, product) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Update product
      db.run(
        `UPDATE products SET sku = ?, name = ?, description = ?, price = ?,
         original_price = ?, category = ?, tags = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [sku, name, description, price, original_price, category, tags, status, productId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Update inventory
          db.run(
            'UPDATE inventory SET available_quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE product_id = ?',
            [available_quantity || 0, productId],
            (err) => {
              if (err) {
                // If inventory doesn't exist, create it
                db.run(
                  'INSERT INTO inventory (product_id, available_quantity) VALUES (?, ?)',
                  [productId, available_quantity || 0]
                );
              }
            }
          );

          // Delete and re-insert specifications
          db.run('DELETE FROM product_specifications WHERE product_id = ?', [productId], (err) => {
            if (specifications) {
              Object.entries(specifications).forEach(([key, value]) => {
                db.run(
                  'INSERT INTO product_specifications (product_id, spec_key, spec_value) VALUES (?, ?, ?)',
                  [productId, key, value]
                );
              });
            }
          });

          // Delete and re-insert images
          db.run('DELETE FROM product_images WHERE product_id = ?', [productId], (err) => {
            if (images && images.length > 0) {
              images.forEach((image, index) => {
                db.run(
                  'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
                  [productId, image.url, image.alt_text || '', image.is_primary || false, index]
                );
              });
            }
          });

          res.json({
            message: 'Product updated successfully',
            product: { id: productId, ...value }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', auth, (req, res) => {
  const productId = req.params.id;

  db.get('SELECT id FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete product (CASCADE will handle related tables)
    db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Product deleted successfully' });
    });
  });
});

module.exports = router;
