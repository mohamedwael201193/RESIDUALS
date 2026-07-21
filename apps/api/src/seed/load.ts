import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "../db/client.js";
import { embed, toPgVector } from "../embeddings.js";
import { loadEnv } from "../env.js";
import { log } from "../log.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

type SeedRow = {
  address: string;
  handle: string;
  topic: string;
  body: string;
  region?: string;
};

async function main() {
  loadEnv();
  const path = join(__dirname, "corpus.jsonl");
  const lines = readFileSync(path, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const sql = db();
  let ok = 0;
  for (const line of lines) {
    const row = JSON.parse(line) as SeedRow;
    const address = row.address.toLowerCase();
    await sql`
      INSERT INTO contributors (address, handle)
      VALUES (${address}, ${row.handle})
      ON CONFLICT (address) DO UPDATE SET handle = EXCLUDED.handle
    `;

    const exists = await sql`
      SELECT id FROM entries
      WHERE contributor = ${address} AND topic = ${row.topic}
      LIMIT 1
    `;
    if (exists.length) {
      log.info({ topic: row.topic }, "skip existing");
      continue;
    }

    const vector = await embed(`${row.topic}\n${row.body}`);
    const vec = toPgVector(vector);
    await sql`
      INSERT INTO entries (contributor, topic, body, region, embedding, status, distinct_payers)
      VALUES (
        ${address},
        ${row.topic},
        ${row.body},
        ${row.region ?? null},
        ${vec}::vector,
        ${"active"},
        ${2}
      )
    `;
    ok++;
    log.info({ ok, topic: row.topic }, "seeded");
    // gentle rate limit for Gemini free tier
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`seeded ${ok} new entries from ${lines.length} lines`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
