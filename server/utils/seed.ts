import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { build } from "esbuild";
import { ProductModel } from "../models/Product";

const parsePriceString = (value?: string) => {
  if (!value) return undefined;
  const numeric = Number(String(value).replace(/,/g, ""));
  return Number.isNaN(numeric) ? undefined : numeric;
};

const computeSeedQuantity = (productId: string) => {
  if (!productId) return 0;
  const hash = productId.split("").reduce((acc, char) => {
    acc = (acc << 5) - acc + char.charCodeAt(0);
    return acc & acc;
  }, 0);
  return Math.abs(hash % 16) + 5;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nodeRequire = createRequire(import.meta.url);

const loadStaticProducts = async () => {
  const projectRoot = path.resolve(__dirname, "../../");
  const entryFile = path.resolve(projectRoot, "src/data/products.ts");

  const result = await build({
    entryPoints: [entryFile],
    bundle: true,
    platform: "node",
    format: "cjs",
    write: false,
    absWorkingDir: projectRoot,
    tsconfig: path.resolve(projectRoot, "tsconfig.json"),
    loader: {
      ".ts": "ts",
      ".tsx": "ts",
      ".js": "js",
      ".jsx": "jsx",
      ".json": "json",
      ".jpg": "dataurl",
      ".jpeg": "dataurl",
      ".png": "dataurl",
      ".gif": "dataurl",
      ".svg": "dataurl",
    },
    define: {
      "import.meta.env": "{}",
    },
  });

  const [output] = result.outputFiles || [];
  if (!output) {
    throw new Error("Failed to bundle static product data");
  }

  const module = { exports: {} as { PRODUCTS: ProductSeed[] } };
  const requireFn = (specifier: string) => {
    if (specifier === "path") {
      return path;
    }
    return nodeRequire(specifier);
  };

  const fn = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    output.text
  );

  fn(module.exports, requireFn, module, entryFile, path.dirname(entryFile));

  if (!module.exports.PRODUCTS) {
    throw new Error("Static product module did not export PRODUCTS");
  }

  return module.exports.PRODUCTS;
};

type ProductSeed = {
  id: string;
  sku: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: string;
  originalPrice?: string;
  image: string;
  rating?: number;
  benefits?: string[];
  specifications?: Record<string, string>;
  category: string;
  inStock?: boolean;
  featured?: boolean;
};

export const seedProductsFromStaticData = async () => {
  const existingCount = await ProductModel.countDocuments();
  if (existingCount > 0) {
    console.log(`Products already present in database (count: ${existingCount}). Skipping seed.`);
    return;
  }

  try {
    const rawProducts = await loadStaticProducts();

    const documents = rawProducts.map((product) => {
      const price = parsePriceString(product.price) ?? 0;
      const originalPrice = parsePriceString(product.originalPrice);
      const availableQuantity = computeSeedQuantity(product.id);

      return {
        sku: product.sku,
        name: product.name,
        description: product.description,
        detailedDescription: product.detailedDescription ?? product.description,
        price,
        originalPrice,
        image: product.image,
        rating: product.rating ?? 5,
        benefits: product.benefits ?? [],
        specifications: product.specifications ?? {},
        category: product.category,
        inStock: product.inStock ?? availableQuantity > 0,
        featured: product.featured ?? false,
        availableQuantity,
        tags: [] as string[],
      };
    });

    await ProductModel.insertMany(documents, { ordered: false });
    console.log(`Seeded ${documents.length} products into MongoDB.`);
  } catch (error) {
    console.error("Failed to seed products from static data", error);
  }
};
