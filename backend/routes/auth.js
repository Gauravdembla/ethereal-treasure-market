const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const database = require('../config/database');
const auth = require('../middleware/auth');

const db = database.getDb();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
  role: Joi.string().valid('admin', 'manager').default('admin')
});

// POST /api/auth/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    db.get(
      'SELECT * FROM admin_users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        db.run(
          'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/register - Register new admin (protected route)
router.post('/register', auth, async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, name, role } = value;

    // Check if user already exists
    db.get(
      'SELECT id FROM admin_users WHERE email = ?',
      [email],
      async (err, existingUser) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (existingUser) {
          return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        db.run(
          'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
          [email, passwordHash, name, role],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
              message: 'User registered successfully',
              user: {
                id: this.lastID,
                email,
                name,
                role
              }
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', auth, (req, res) => {
  res.json({
    user: req.user
  });
});

// POST /api/auth/change-password - Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current user with password
    db.get(
      'SELECT password_hash FROM admin_users WHERE id = ?',
      [req.user.id],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        db.run(
          'UPDATE admin_users SET password_hash = ? WHERE id = ?',
          [newPasswordHash, req.user.id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            res.json({ message: 'Password changed successfully' });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/users - Get all admin users (admin only)
router.get('/users', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  db.all(
    'SELECT id, email, name, role, created_at, last_login FROM admin_users ORDER BY created_at DESC',
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ users });
    }
  );
});

module.exports = router;
