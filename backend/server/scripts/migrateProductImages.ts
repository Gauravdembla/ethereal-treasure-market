import 'dotenv/config';
import { ensureMongoConnection } from '../utils/mongo';
import { ProductModel } from '../models/Product';

/**
 * Migration script to populate the images array from the legacy image field
 * for products that don't have images populated yet.
 */
const migrateProductImages = async () => {
  try {
    await ensureMongoConnection();
    console.log('Connected to MongoDB');

    // Find all products that have an image but empty images array
    const products = await ProductModel.find({
      image: { $exists: true, $ne: null, $ne: '' },
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } }
      ]
    });

    console.log(`Found ${products.length} products to migrate`);

    let updatedCount = 0;
    for (const product of products) {
      if (product.image) {
        product.images = [
          {
            url: product.image,
            altText: product.name,
            isPrimary: true,
            sortOrder: 0,
          }
        ];
        await product.save();
        updatedCount++;
        console.log(`✓ Updated product: ${product.name}`);
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateProductImages();

