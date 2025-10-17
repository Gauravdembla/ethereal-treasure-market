import { ProductModel } from "../models/Product";
import { ReviewModel } from "../models/Review";

export const seedReviewsFromStaticData = async () => {
  try {
    const products = await ProductModel.find().lean();
    let createdCount = 0;

    for (const p of products) {
      const productId = String((p as any)._id || (p as any).id);
      const existing = await ReviewModel.countDocuments({ product_id: productId });
      if (existing > 0) continue;

      const names = [
        "Jessica T.",
        "Mark S.",
        "Sophia R.",
        "Emma R.",
        "David L.",
        "Sarah M.",
      ];
      const emails = [
        "jessica.t@example.com",
        "mark.s@example.com",
        "sophia.r@example.com",
        "emma.r@example.com",
        "david.l@example.com",
        "sarah.m@example.com",
      ];
      const sampleTexts = [
        "Absolutely love this product! The quality is amazing.",
        "Great quality and fast shipping. Very satisfied.",
        "Beautiful craftsmanship and powerful energy.",
        "Good quality, arrived well packaged.",
      ];

      const numReviews = 3 + (productId.charCodeAt(0) % 2); // 3 or 4
      const docs = Array.from({ length: numReviews }).map((_, idx) => ({
        product_id: productId,
        product_name: (p as any).name,
        customer_name: names[(idx + productId.length) % names.length],
        customer_email: emails[(idx + productId.length) % emails.length],
        rating: 4 + ((idx + productId.length) % 2),
        review_text: sampleTexts[(idx + productId.length) % sampleTexts.length],
        verified: true,
        status: "published",
      }));

      // Insert only non-duplicates by (product_id, customer_email)
      for (const doc of docs) {
        try {
          await ReviewModel.create(doc);
        } catch (e) {
          // ignore duplicates
        }
      }
      createdCount += docs.length;
    }

    if (createdCount > 0) {
      console.log(`Seeded ${createdCount} reviews across ${products.length} products.`);
    } else {
      console.log("Reviews already present. Skipping reviews seed.");
    }
  } catch (error) {
    console.error("Failed to seed reviews", error);
  }
};

