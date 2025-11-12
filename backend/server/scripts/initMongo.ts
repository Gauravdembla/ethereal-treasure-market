import 'dotenv/config';
import { ensureMongoConnection } from '../utils/mongo';
import { ProductModel } from '../models/Product';
import AddressModel from '../models/Address';

const bootstrap = async () => {
  try {
    await ensureMongoConnection();

    await ProductModel.createCollection().catch(() => undefined);
    await AddressModel.createCollection().catch(() => undefined);

    await ProductModel.createIndexes();
    await AddressModel.createIndexes();

    console.log('MongoDB initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB initialization failed:', error);
    process.exit(1);
  }
};

bootstrap();
