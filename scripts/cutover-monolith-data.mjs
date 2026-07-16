#!/usr/bin/env node
/**
 * One-shot cutover: copy users + goals (+ events) from the legacy web monolith DB
 * (DATABASE_URL) into auth_db and goals_db.
 *
 * Prerequisites:
 *   - AUTH_DATABASE_URL / GOALS_DATABASE_URL already migrated (yarn migrate:be)
 *   - DATABASE_URL points at the old Neon/monolith database
 *
 * Analytics is rebuilt from live Kafka events after cutover — not migrated here.
 *
 * Usage: node scripts/cutover-monolith-data.mjs [--dry-run]
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") });

const dryRun = process.argv.includes("--dry-run");

const { DATABASE_URL, AUTH_DATABASE_URL, GOALS_DATABASE_URL } = process.env;

if (!DATABASE_URL || !AUTH_DATABASE_URL || !GOALS_DATABASE_URL) {
  console.error(
    "DATABASE_URL, AUTH_DATABASE_URL, and GOALS_DATABASE_URL are required",
  );
  process.exit(1);
}

async function main() {
  const source = new pg.Pool({ connectionString: DATABASE_URL });
  const auth = new pg.Pool({ connectionString: AUTH_DATABASE_URL });
  const goals = new pg.Pool({ connectionString: GOALS_DATABASE_URL });

  try {
    const { rows: users } = await source.query(
      `SELECT id, name, email, "passwordHash", "createdAt", "updatedAt" FROM "User"`,
    );
    const { rows: goalsRows } = await source.query(
      `SELECT id, "userId", name, description, period, type,
              "targetOccurrences", "targetDuration", "targetAmount",
              category, "createdAt", "updatedAt"
       FROM "Goal"`,
    );
    const { rows: events } = await source.query(
      `SELECT id, "goalId", type, occurrences, duration, amount, "occurredAt"
       FROM "GoalEvent"`,
    );

    console.log(
      `Found ${users.length} users, ${goalsRows.length} goals, ${events.length} events`,
    );
    if (dryRun) {
      console.log("Dry run — no writes performed.");
      return;
    }

    const authClient = await auth.connect();
    try {
      await authClient.query("BEGIN");
      for (const user of users) {
        await authClient.query(
          `INSERT INTO "User" (id, name, email, "passwordHash", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             "passwordHash" = EXCLUDED."passwordHash",
             "updatedAt" = EXCLUDED."updatedAt"`,
          [
            user.id,
            user.name,
            user.email,
            user.passwordHash,
            user.createdAt,
            user.updatedAt,
          ],
        );
      }
      await authClient.query("COMMIT");
      console.log(`Upserted ${users.length} users into auth_db`);
    } catch (error) {
      await authClient.query("ROLLBACK");
      throw error;
    } finally {
      authClient.release();
    }

    const goalsClient = await goals.connect();
    try {
      await goalsClient.query("BEGIN");
      for (const goal of goalsRows) {
        await goalsClient.query(
          `INSERT INTO "Goal" (
             id, "userId", name, description, period, type,
             "targetOccurrences", "targetDuration", "targetAmount",
             category, "createdAt", "updatedAt"
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             period = EXCLUDED.period,
             type = EXCLUDED.type,
             "targetOccurrences" = EXCLUDED."targetOccurrences",
             "targetDuration" = EXCLUDED."targetDuration",
             "targetAmount" = EXCLUDED."targetAmount",
             category = EXCLUDED.category,
             "updatedAt" = EXCLUDED."updatedAt"`,
          [
            goal.id,
            goal.userId,
            goal.name,
            goal.description,
            goal.period,
            goal.type,
            goal.targetOccurrences,
            goal.targetDuration,
            goal.targetAmount,
            goal.category,
            goal.createdAt,
            goal.updatedAt,
          ],
        );
      }
      for (const event of events) {
        await goalsClient.query(
          `INSERT INTO "GoalEvent" (
             id, "goalId", type, occurrences, duration, amount, "occurredAt"
           ) VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (id) DO NOTHING`,
          [
            event.id,
            event.goalId,
            event.type,
            event.occurrences,
            event.duration,
            event.amount,
            event.occurredAt,
          ],
        );
      }
      await goalsClient.query("COMMIT");
      console.log(
        `Upserted ${goalsRows.length} goals and ${events.length} events into goals_db`,
      );
    } catch (error) {
      await goalsClient.query("ROLLBACK");
      throw error;
    } finally {
      goalsClient.release();
    }

    console.log("Cutover complete. Point API_GATEWAY_URL at the new stack.");
  } finally {
    await source.end();
    await auth.end();
    await goals.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
