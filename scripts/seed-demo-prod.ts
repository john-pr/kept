/**
 * One-shot helper: run the demo seed against the PRODUCTION Neon branch.
 *
 *   npm run db:seed:demo:prod
 *
 * Reads credentials from `.env.production` (gitignored) so no connection string
 * has to be pasted on the command line. Delegates to `scripts/seed-demo.ts`,
 * which prints the target host before it writes and is idempotent.
 */
import { resolve } from "node:path";
import { config } from "dotenv";

const envPath = resolve(process.cwd(), ".env.production");
const result = config({ path: envPath, override: true });

if (result.error) {
  console.error(`Could not read ${envPath} — run this from the repo root.`);
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error(`${envPath} has no DATABASE_URL.`);
  process.exit(1);
}

// Skip the interactive confirmation in seed-demo.ts.
process.env.SEED_DEMO_YES = "1";

// Import AFTER the env is loaded — seed-demo.ts reads DATABASE_URL at module load.
import("./seed-demo").catch((error) => {
  console.error(error);
  process.exit(1);
});
