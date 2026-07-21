import type { Express } from "express";
import { db } from "./db/client.js";
import { env } from "./env.js";
import { log } from "./log.js";
import { creditVault } from "./vault.js";

export function mountInternalRoutes(app: Express): void {
  app.post("/internal/sweep", async (req, res) => {
    const secret = req.headers["x-cron-secret"];
    if (secret !== env().CRON_SECRET) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      const result = await sweepPending();
      res.json(result);
    } catch (err) {
      log.error({ err }, "sweep failed");
      res.status(500).json({ error: "sweep failed" });
    }
  });
}

export async function sweepPending(): Promise<{
  credited: number;
  txHash: string | null;
  totalMicros: string;
}> {
  const vault = env().RESIDUALS_VAULT_ADDRESS;
  if (!vault) {
    return { credited: 0, txHash: null, totalMicros: "0" };
  }

  const rows = await db()`
    SELECT contributor, SUM(micros)::text AS micros, array_agg(id) AS ids
    FROM accruals
    WHERE settled_tx IS NULL
    GROUP BY contributor
    HAVING SUM(micros) > 0
  `;

  if (rows.length === 0) {
    return { credited: 0, txHash: null, totalMicros: "0" };
  }

  const contributors = rows.map((r) => String(r.contributor));
  const amounts = rows.map((r) => BigInt(r.micros as string));
  const allIds = rows.flatMap((r) => (r.ids as number[]));

  const txHash = await creditVault(contributors, amounts);

  await db()`
    UPDATE accruals
    SET settled_tx = ${txHash}
    WHERE id = ANY(${allIds}::bigint[])
  `;

  const total = amounts.reduce((a, b) => a + b, 0n);
  return {
    credited: contributors.length,
    txHash,
    totalMicros: total.toString(),
  };
}
