import postgres from "postgres";
import { env } from "../env.js";

let sql: ReturnType<typeof postgres> | null = null;

export function db() {
  if (!sql) {
    const url = env().DATABASE_URL;
    sql = postgres(url, {
      max: 10,
      prepare: false, // required for pgbouncer transaction mode
      idle_timeout: 20,
      connect_timeout: 30,
    });
  }
  return sql;
}

export function dbDirect() {
  const e = env();
  const url = e.DATABASE_URL_DIRECT || e.DATABASE_URL;
  return postgres(url, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 30,
  });
}

export async function closeDb(): Promise<void> {
  if (sql) {
    await sql.end({ timeout: 5 });
    sql = null;
  }
}
