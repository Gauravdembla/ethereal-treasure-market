import dotenv from "dotenv";
import { ensureMongoConnection } from "../utils/mongo";
import { ReviewModel } from "../models/Review";

/*
  Backfill script: add user_id field to existing reviews that don't have it.
  - Sets user_id = null where the field is missing
  - Safe to run multiple times

  Usage:
    npm run init:mongo   # optional, to ensure DB/collections exist
    npm run backfill:reviews:userId
*/

async function main() {
  dotenv.config();
  await ensureMongoConnection();

  const filter = { user_id: { $exists: false } } as const;
  const update = { $set: { user_id: null } } as const;

  const result = await ReviewModel.updateMany(filter, update);
  console.log(`Backfill complete. Matched: ${result.matchedCount ?? (result as any).n}, Modified: ${result.modifiedCount ?? (result as any).nModified}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
