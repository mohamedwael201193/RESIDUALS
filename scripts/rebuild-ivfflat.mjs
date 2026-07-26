import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

const envPath = resolve("d:/route/okx/residuals/.env");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  if (!(m[1] in process.env) || !process.env[m[1]]) {
    process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const url = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
const sql = postgres(url, { max: 1, prepare: false });
await sql.unsafe(`
  DROP INDEX IF EXISTS entries_embedding_ivfflat;
  CREATE INDEX entries_embedding_ivfflat
    ON entries USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
`);
const [{ c }] = await sql`SELECT count(*)::int AS c FROM entries WHERE status='active'`;
console.log("ivfflat rebuilt; active entries =", c);
await sql.end({ timeout: 5 });
