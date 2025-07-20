const bcrypt = require('bcryptjs');
const database = require('../config/database');
require('dotenv').config();

const db = database.getDb();

async function initializeDatabase() {
  console.log('🔄 Initializing database...');

  try {
    // Wait for database tables to be created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@etherealtreasure.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin user already exists
    db.get(
      'SELECT id FROM admin_users WHERE email = ?',
      [adminEmail],
      async (err, existingAdmin) => {
        if (err) {
          console.error('Error checking for existing admin:', err);
          return;
        }

        if (existingAdmin) {
          console.log('✅ Admin user already exists');
        } else {
          // Create admin user
          const saltRounds = 12;
          const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

          db.run(
            'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
            [adminEmail, passwordHash, 'System Administrator', 'admin'],
            function(err) {
              if (err) {
                console.error('Error creating admin user:', err);
              } else {
                console.log('✅ Default admin user created');
                console.log(`📧 Email: ${adminEmail}`);
                console.log(`🔑 Password: ${adminPassword}`);
                console.log('⚠️  Please change the default password after first login!');
              }
            }
          );
        }
      }
    );

    console.log('✅ Database initialization completed');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Run initialization
initializeDatabase();

module.exports = initializeDatabase;
