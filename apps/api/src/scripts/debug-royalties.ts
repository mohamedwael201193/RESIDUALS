import { loadEnv } from "../env.js";
import { db } from "../db/client.js";

async function main() {
  loadEnv();
  const sql = db();
  const entries = await sql`
    SELECT id, contributor, distinct_payers FROM entries WHERE id = 1
  `;
  const seen = await sql`
    SELECT payer, entry_id FROM payer_entry_seen WHERE entry_id = 1
  `;
  const acc = await sql`
    SELECT id, contributor, entry_id, query_id, micros
    FROM accruals ORDER BY id DESC LIMIT 10
  `;
  const contrib = await sql`
    SELECT address FROM contributors
    WHERE address = '0x1111111111111111111111111111111111111111'
  `;
  console.log(JSON.stringify({ entries, seen, acc, contrib }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
