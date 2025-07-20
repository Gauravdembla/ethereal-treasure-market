const express = require('express');
const router = express.Router();
const Joi = require('joi');
const database = require('../config/database');
const auth = require('../middleware/auth');

const db = database.getDb();

// Validation schemas
const inventoryUpdateSchema = Joi.object({
  available_quantity: Joi.number().integer().min(0).required(),
  reserved_quantity: Joi.number().integer().min(0).default(0),
  reorder_level: Joi.number().integer().min(0).default(5)
});

// GET /api/inventory - Get all inventory with low stock alerts
router.get('/', auth, (req, res) => {
  const lowStockOnly = req.query.low_stock === 'true';
  
  let query = `
    SELECT 
      i.*,
      p.name,
      p.sku,
      p.price,
      p.status,
      (i.available_quantity <= i.reorder_level) as is_low_stock
    FROM inventory i
    JOIN products p ON i.product_id = p.id
  `;
  
  if (lowStockOnly) {
    query += ' WHERE i.available_quantity <= i.reorder_level';
  }
  
  query += ' ORDER BY i.available_quantity ASC, p.name';

  db.all(query, [], (err, inventory) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const summary = {
      total_products: inventory.length,
      low_stock_count: inventory.filter(item => item.is_low_stock).length,
      out_of_stock_count: inventory.filter(item => item.available_quantity === 0).length,
      total_value: inventory.reduce((sum, item) => sum + (item.available_quantity * item.price), 0)
    };

    res.json({
      inventory,
      summary
    });
  });
});

// GET /api/inventory/:productId - Get inventory for specific product
router.get('/:productId', auth, (req, res) => {
  const productId = req.params.productId;

  db.get(
    `SELECT 
      i.*,
      p.name,
      p.sku,
      p.price,
      p.status
    FROM inventory i
    JOIN products p ON i.product_id = p.id
    WHERE i.product_id = ?`,
    [productId],
    (err, inventory) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!inventory) {
        return res.status(404).json({ error: 'Inventory not found for this product' });
      }

      res.json(inventory);
    }
  );
});

// PUT /api/inventory/:productId - Update inventory for specific product
router.put('/:productId', auth, (req, res) => {
  const productId = req.params.productId;
  const { error, value } = inventoryUpdateSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { available_quantity, reserved_quantity, reorder_level } = value;

  // Check if product exists
  db.get('SELECT id FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update or insert inventory
    db.run(
      `INSERT OR REPLACE INTO inventory 
       (product_id, available_quantity, reserved_quantity, reorder_level, last_updated)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [productId, available_quantity, reserved_quantity, reorder_level],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({
          message: 'Inventory updated successfully',
          inventory: {
            product_id: productId,
            available_quantity,
            reserved_quantity,
            reorder_level,
            is_low_stock: available_quantity <= reorder_level
          }
        });
      }
    );
  });
});

// POST /api/inventory/:productId/adjust - Adjust inventory (add/subtract stock)
router.post('/:productId/adjust', auth, (req, res) => {
  const productId = req.params.productId;
  const { adjustment, reason } = req.body;

  if (!adjustment || typeof adjustment !== 'number') {
    return res.status(400).json({ error: 'Adjustment amount is required and must be a number' });
  }

  // Get current inventory
  db.get(
    'SELECT * FROM inventory WHERE product_id = ?',
    [productId],
    (err, inventory) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!inventory) {
        return res.status(404).json({ error: 'Inventory not found for this product' });
      }

      const newQuantity = inventory.available_quantity + adjustment;

      if (newQuantity < 0) {
        return res.status(400).json({ 
          error: 'Adjustment would result in negative inventory',
          current_quantity: inventory.available_quantity,
          attempted_adjustment: adjustment
        });
      }

      // Update inventory
      db.run(
        'UPDATE inventory SET available_quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE product_id = ?',
        [newQuantity, productId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Log the adjustment (you could create an inventory_logs table for this)
          console.log(`Inventory adjusted for product ${productId}: ${adjustment} (${reason || 'No reason provided'})`);

          res.json({
            message: 'Inventory adjusted successfully',
            previous_quantity: inventory.available_quantity,
            adjustment,
            new_quantity: newQuantity,
            reason: reason || null
          });
        }
      );
    }
  );
});

// GET /api/inventory/reports/low-stock - Get low stock report
router.get('/reports/low-stock', auth, (req, res) => {
  db.all(
    `SELECT 
      p.id,
      p.name,
      p.sku,
      p.price,
      i.available_quantity,
      i.reorder_level,
      (i.reorder_level - i.available_quantity) as shortage
    FROM inventory i
    JOIN products p ON i.product_id = p.id
    WHERE i.available_quantity <= i.reorder_level
    ORDER BY shortage DESC, p.name`,
    [],
    (err, lowStockItems) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const totalShortage = lowStockItems.reduce((sum, item) => sum + Math.max(0, item.shortage), 0);
      const estimatedRestockCost = lowStockItems.reduce((sum, item) => {
        const neededQuantity = Math.max(0, item.shortage);
        return sum + (neededQuantity * item.price);
      }, 0);

      res.json({
        low_stock_items: lowStockItems,
        summary: {
          total_items: lowStockItems.length,
          total_shortage: totalShortage,
          estimated_restock_cost: estimatedRestockCost
        }
      });
    }
  );
});

module.exports = router;
