const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
require('dotenv').config();

const db = database.getDb();

const sampleProducts = [
  {
    id: 'amethyst-cluster',
    sku: 'AME-001',
    name: 'Amethyst Cluster',
    description: 'Divine Protection & Peace - Enhance your spiritual connection with this beautiful amethyst cluster. Known for its calming properties and ability to promote clarity of mind.',
    price: 2499,
    original_price: 3499,
    category: 'Crystals',
    tags: 'amethyst,crystal,healing,meditation,spiritual',
    status: 'active',
    available_quantity: 12,
    specifications: {
      'Weight': '200-300g',
      'Size': '8-10cm cluster',
      'Origin': 'Brazil',
      'Chakra': 'Crown Chakra',
      'Element': 'Air'
    },
    images: [
      { url: '/assets/product-amethyst.jpg', alt_text: 'Amethyst Cluster Main View', is_primary: true },
      { url: '/assets/banner-1.jpg', alt_text: 'Amethyst Lifestyle 1', is_primary: false },
      { url: '/assets/banner-2.jpg', alt_text: 'Amethyst Lifestyle 2', is_primary: false }
    ]
  },
  {
    id: 'angel-oracle-cards',
    sku: 'AOC-001',
    name: 'Angel Oracle Cards',
    description: 'Spiritual Guidance & Wisdom - Connect with angelic guidance through these beautifully illustrated oracle cards. Perfect for daily inspiration and spiritual growth.',
    price: 1899,
    original_price: 2299,
    category: 'Oracle Cards',
    tags: 'oracle,cards,angels,guidance,divination',
    status: 'active',
    available_quantity: 8,
    specifications: {
      'Cards': '44 Oracle Cards',
      'Size': '3.5 x 5 inches',
      'Material': 'Premium Cardstock',
      'Guidebook': 'Included',
      'Language': 'English'
    },
    images: [
      { url: '/assets/product-angel-cards.jpg', alt_text: 'Angel Oracle Cards Deck', is_primary: true },
      { url: '/assets/banner-3.jpg', alt_text: 'Oracle Cards Lifestyle', is_primary: false }
    ]
  },
  {
    id: 'healing-candle',
    sku: 'HC-001',
    name: 'Healing Candle',
    description: 'Aromatherapy & Relaxation - Hand-poured soy candle infused with essential oils for healing and relaxation. Creates a peaceful atmosphere for meditation.',
    price: 899,
    original_price: 1199,
    category: 'Candles',
    tags: 'candle,aromatherapy,healing,relaxation,meditation',
    status: 'active',
    available_quantity: 15,
    specifications: {
      'Burn Time': '40 hours',
      'Wax': '100% Natural Soy Wax',
      'Fragrance': 'Pure Lavender Essential Oil',
      'Size': '3 x 4 inches',
      'Weight': '300g'
    },
    images: [
      { url: '/assets/product-candle.jpg', alt_text: 'Healing Candle', is_primary: true },
      { url: '/assets/banner-4.jpg', alt_text: 'Candle Ambiance', is_primary: false }
    ]
  },
  {
    id: 'chakra-journal',
    sku: 'CJ-001',
    name: 'Chakra Journal',
    description: 'Mindfulness & Self-Discovery - Beautiful journal designed for chakra work and spiritual journaling. Includes guided prompts and chakra information.',
    price: 1299,
    original_price: 1599,
    category: 'Journals',
    tags: 'journal,chakra,mindfulness,writing,spiritual',
    status: 'active',
    available_quantity: 6,
    specifications: {
      'Pages': '200 lined pages',
      'Size': '6 x 8 inches',
      'Cover': 'Hardcover with gold foil',
      'Paper': 'Acid-free premium paper',
      'Binding': 'Lay-flat binding'
    },
    images: [
      { url: '/assets/product-journal.jpg', alt_text: 'Chakra Journal', is_primary: true },
      { url: '/assets/banner-5.jpg', alt_text: 'Journal Lifestyle', is_primary: false }
    ]
  },
  {
    id: 'rose-quartz-heart',
    sku: 'RQH-001',
    name: 'Rose Quartz Heart',
    description: 'Love & Compassion - Beautiful rose quartz heart crystal for attracting love and promoting self-compassion. Perfect for heart chakra healing.',
    price: 799,
    original_price: 999,
    category: 'Crystals',
    tags: 'rose quartz,crystal,love,heart chakra,healing',
    status: 'active',
    available_quantity: 20,
    specifications: {
      'Weight': '50-80g',
      'Size': '4-5cm heart',
      'Origin': 'Madagascar',
      'Chakra': 'Heart Chakra',
      'Element': 'Water'
    },
    images: [
      { url: '/assets/product-rose-quartz.jpg', alt_text: 'Rose Quartz Heart', is_primary: true },
      { url: '/assets/banner-1.jpg', alt_text: 'Rose Quartz Lifestyle', is_primary: false }
    ]
  },
  {
    id: 'chakra-kit',
    sku: 'CK-001',
    name: 'Chakra Balancing Kit',
    description: 'Complete Chakra Healing - Complete set of 7 chakra stones with cleansing sage and instruction guide. Everything you need for chakra balancing.',
    price: 3499,
    original_price: 4299,
    category: 'Crystal Sets',
    tags: 'chakra,crystal set,healing,meditation,complete kit',
    status: 'active',
    available_quantity: 5,
    specifications: {
      'Stones': '7 Chakra Crystals',
      'Includes': 'Sage bundle, instruction guide',
      'Pouch': 'Velvet storage pouch',
      'Size': 'Tumbled stones 2-3cm each',
      'Origin': 'Various (Brazil, India, Madagascar)'
    },
    images: [
      { url: '/assets/product-chakra-kit.jpg', alt_text: 'Chakra Balancing Kit', is_primary: true },
      { url: '/assets/banner-2.jpg', alt_text: 'Chakra Kit Lifestyle', is_primary: false }
    ]
  }
];

async function seedDatabase() {
  console.log('🌱 Seeding database with sample products...');

  try {
    for (const productData of sampleProducts) {
      const { 
        id, sku, name, description, price, original_price, category, tags, status,
        available_quantity, specifications, images 
      } = productData;

      // Insert product
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT OR REPLACE INTO products (id, sku, name, description, price, original_price, category, tags, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, sku, name, description, price, original_price, category, tags, status],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });

      // Insert inventory
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT OR REPLACE INTO inventory (product_id, available_quantity) VALUES (?, ?)',
          [id, available_quantity],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });

      // Insert specifications
      if (specifications) {
        // Delete existing specifications
        await new Promise((resolve) => {
          db.run('DELETE FROM product_specifications WHERE product_id = ?', [id], () => resolve());
        });

        for (const [key, value] of Object.entries(specifications)) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO product_specifications (product_id, spec_key, spec_value) VALUES (?, ?, ?)',
              [id, key, value],
              function(err) {
                if (err) reject(err);
                else resolve(this);
              }
            );
          });
        }
      }

      // Insert images
      if (images) {
        // Delete existing images
        await new Promise((resolve) => {
          db.run('DELETE FROM product_images WHERE product_id = ?', [id], () => resolve());
        });

        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
              [id, image.url, image.alt_text, image.is_primary, i],
              function(err) {
                if (err) reject(err);
                else resolve(this);
              }
            );
          });
        }
      }

      console.log(`✅ Seeded product: ${name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📦 Added ${sampleProducts.length} products with inventory and specifications`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
}

// Run seeding
seedDatabase();

module.exports = seedDatabase;
