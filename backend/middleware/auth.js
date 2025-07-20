const jwt = require('jsonwebtoken');
const database = require('../config/database');

const db = database.getDb();

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists in database
    db.get(
      'SELECT id, email, name, role FROM admin_users WHERE id = ?',
      [decoded.userId],
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user) {
          return res.status(401).json({ error: 'Invalid token. User not found.' });
        }
        
        req.user = user;
        next();
      }
    );
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;
