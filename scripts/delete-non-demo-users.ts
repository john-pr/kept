import "dotenv/config";
import readline from "readline";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@kept.app";

function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "yes");
    });
  });
}

async function main() {
  const dbHost = new URL(process.env.DATABASE_URL ?? "").host;

  const demoUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!demoUser) {
    throw new Error(`Demo user (${DEMO_EMAIL}) not found — refusing to run, this would wipe everyone.`);
  }

  const usersToDelete = await prisma.user.findMany({
    where: { email: { not: DEMO_EMAIL } },
    select: { id: true, email: true },
  });

  if (usersToDelete.length === 0) {
    console.log("No non-demo users found. Nothing to do.");
    return;
  }

  console.log(`Target database: ${dbHost}`);
  console.log(`This will permanently delete ${usersToDelete.length} user(s) and all their items, collections, and item types:`);
  for (const user of usersToDelete) {
    console.log(`  - ${user.email}`);
  }
  console.log(`\n"${DEMO_EMAIL}" and their content will be kept.`);

  const proceedFlag = process.argv.includes("--yes");
  const confirmed = proceedFlag || (await confirm("\nType \"yes\" to continue: "));
  if (!confirmed) {
    console.log("Aborted.");
    return;
  }

  const { count: deletedUsers } = await prisma.user.deleteMany({
    where: { email: { not: DEMO_EMAIL } },
  });

  const { count: deletedTokens } = await prisma.verificationToken.deleteMany({
    where: { identifier: { not: DEMO_EMAIL } },
  });

  const { count: deletedTags } = await prisma.tag.deleteMany({
    where: { items: { none: {} } },
  });

  console.log("\nDone.");
  console.log({ deletedUsers, deletedVerificationTokens: deletedTokens, deletedOrphanedTags: deletedTags });
}

main()
  .catch((error) => {
    console.error("Cleanup failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
