/**
 * Run publications seeder from your machine.
 * Uses DATABASE_URL from .env — point it at prod to seed prod.
 *
 *   npm run db:seed-publications
 *   # or with explicit URL:
 *   DATABASE_URL='postgresql://...' npx tsx scripts/seed-publications.ts
 */
import "dotenv/config";
import { runSeedPublications } from "../server/seed/publications";

runSeedPublications()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
