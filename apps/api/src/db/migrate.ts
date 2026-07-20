import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dbDirect } from "./client.js";
import { loadEnv } from "../env.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  loadEnv();
  const sql = dbDirect();
  try {
    await sql`CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    const dir = join(__dirname, "../../migrations");
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const applied = await sql<{ count: string }[]>`
        SELECT count(*)::text AS count FROM schema_migrations WHERE id = ${file}
      `;
      if (Number(applied[0]?.count ?? "0") > 0) {
        console.log(`skip ${file}`);
        continue;
      }
      const body = readFileSync(join(dir, file), "utf8");
      console.log(`apply ${file}`);
      await sql.unsafe(body);
      await sql`INSERT INTO schema_migrations (id) VALUES (${file})`;
    }
    console.log("migrations complete");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
