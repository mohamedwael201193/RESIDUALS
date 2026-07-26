import { isEthAddress, normalizeAddress, formatUsdDisplay } from "@residuals/shared";
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import {
  contributorPublishCount24h,
  isNearDuplicate,
} from "./antifarm.js";
import { runAsk } from "./ask.js";
import { db } from "./db/client.js";
import { embed, toPgVector } from "./embeddings.js";
import { env } from "./env.js";
import { log } from "./log.js";
import { contributorBalances } from "./royalties.js";
import { extractPayer } from "./x402.js";

export const router = Router();

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const started = Date.now();
    let dbOk = false;
    try {
      await db()`SELECT 1`;
      dbOk = true;
    } catch (err) {
      log.error({ err }, "health db");
    }
    // Keep deploy healthchecks fast: do NOT call external embeddings here.
    // Embeddings are verified on /sample and paid /ask paths.
    const deep = String(_req.query.deep ?? "") === "1";
    let embedOk: boolean | null = null;
    let embedError: string | null = null;
    if (deep) {
      embedOk = false;
      try {
        const v = await embed("residuals health check");
        embedOk = v.length === env().EMBEDDINGS_DIMENSIONS;
        if (!embedOk) {
          embedError = `dim ${v.length} != ${env().EMBEDDINGS_DIMENSIONS}`;
        }
      } catch (err) {
        log.error({ err }, "health embed");
        embedError = err instanceof Error ? err.message : String(err);
      }
    }
    const ok = dbOk && (embedOk === null || embedOk);
    res.status(ok ? 200 : 503).json({
      ok,
      service: "residuals",
      latencyMs: Date.now() - started,
      deps: { database: dbOk, embeddings: embedOk },
      embedError,
      vault: env().RESIDUALS_VAULT_ADDRESS || null,
      agentId: env().AGENT_ID || null,
    });
  }),
);

async function handleSample(req: Request, res: Response) {
  const q =
    typeof req.query.q === "string"
      ? req.query.q
      : typeof req.body?.q === "string"
        ? req.body.q
        : "";
  const result = await runAsk({ q, payer: null, charge: false, sample: true });
  res.json({
    answer: result.answer,
    charged: false,
    fee: "0",
    entryIds: result.entryIds,
    scores: result.scores,
    queryId: result.queryId,
    citations: result.citations,
  });
}

router.get("/sample", asyncHandler(handleSample));
router.post("/sample", asyncHandler(handleSample));

async function handleAsk(req: Request, res: Response) {
  const q =
    typeof req.query.q === "string"
      ? req.query.q
      : typeof req.body?.q === "string"
        ? req.body.q
        : "";
  const payer = extractPayer(req);
  const result = await runAsk({ q, payer, charge: true, sample: false });
  // No-charge path: if nothing retrieved, still 200 (payment already settled by middleware).
  // Documented: we prefer not charging for non-answers — middleware settles before handler.
  // When relevance fails, we return clear message; fee was collected by x402 (known tradeoff).
  res.json({
    answer: result.answer,
    charged: result.charged,
    fee: env().QUERY_PRICE_USD,
    paidMicros: result.paidMicros,
    paidDisplay: formatUsdDisplay(BigInt(result.paidMicros)),
    entryIds: result.entryIds,
    scores: result.scores,
    queryId: result.queryId,
    citations: result.citations,
    payer,
  });
}

router.get("/ask", asyncHandler(handleAsk));
router.post("/ask", asyncHandler(handleAsk));

const contributeSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  handle: z.string().min(2).max(40),
  topic: z.string().min(3).max(120),
  body: z.string().min(80).max(2000),
  region: z.string().max(80).optional(),
});

router.post(
  "/contribute",
  asyncHandler(async (req, res) => {
    const parsed = contributeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const data = parsed.data;
    const address = normalizeAddress(data.address);
    if (!isEthAddress(address)) {
      res.status(400).json({ error: "invalid address" });
      return;
    }

    const publishes = await contributorPublishCount24h(address);
    if (publishes >= 10) {
      res.status(429).json({ error: "publish rate limit: max 10 entries / 24h" });
      return;
    }

    const vector = await embed(`${data.topic}\n${data.body}`);
    const vec = toPgVector(vector);
    if (await isNearDuplicate(vec, address)) {
      res.status(409).json({ error: "near-duplicate of your existing entry" });
      return;
    }

    const sql = db();
    await sql`
      INSERT INTO contributors (address, handle)
      VALUES (${address}, ${data.handle})
      ON CONFLICT (address) DO UPDATE SET handle = EXCLUDED.handle
    `;

    const [row] = await sql`
      INSERT INTO entries (contributor, topic, body, region, embedding, status)
      VALUES (
        ${address},
        ${data.topic},
        ${data.body},
        ${data.region ?? null},
        ${vec}::vector,
        ${"active"}
      )
      RETURNING id, created_at
    `;

    res.status(201).json({
      id: Number(row!.id),
      contributor: address,
      topic: data.topic,
      createdAt: row!.created_at,
    });
  }),
);

router.get(
  "/ledger",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    const offset = Math.max(Number(req.query.offset ?? 0), 0);
    const rows = await db()`
      SELECT
        q.id,
        q.query_hash,
        q.query_text,
        q.payer,
        q.paid_micros,
        q.entry_ids,
        q.scores,
        q.charged,
        q.created_at,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'contributor', a.contributor,
                'entryId', a.entry_id,
                'micros', a.micros,
                'handle', c.handle,
                'topic', e.topic
              )
              ORDER BY a.id
            )
            FROM accruals a
            LEFT JOIN contributors c ON c.address = a.contributor
            LEFT JOIN entries e ON e.id = a.entry_id
            WHERE a.query_id = q.id
          ),
          '[]'::json
        ) AS royalties
      FROM queries q
      ORDER BY q.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    res.json({
      items: rows.map((r) => {
        const queryText =
          typeof r.query_text === "string" && r.query_text.trim()
            ? r.query_text.trim()
            : null;
        return {
          id: Number(r.id),
          query: queryText,
          queryHash: r.query_hash,
          payer: r.payer,
          paidMicros: String(r.paid_micros),
          paidDisplay: formatUsdDisplay(BigInt(r.paid_micros)),
          entryIds: r.entry_ids,
          scores: r.scores,
          charged: r.charged,
          createdAt: r.created_at,
          royalties: (
            r.royalties as Array<{
              micros: number;
              contributor: string;
              entryId: number;
              handle?: string;
              topic?: string;
            }>
          ).map((x) => ({
            ...x,
            entryId: Number(x.entryId),
            micros: Number(x.micros),
            display: `+${formatUsdDisplay(BigInt(x.micros))}`,
          })),
          // Alias for web clients that expect citations[]
          citations: (
            r.royalties as Array<{
              micros: number;
              contributor: string;
              entryId: number;
              handle?: string;
              topic?: string;
            }>
          ).map((x) => ({
            entryId: Number(x.entryId),
            handle: x.handle || `${x.contributor.slice(0, 6)}…${x.contributor.slice(-4)}`,
            topic: x.topic,
            contributor: x.contributor,
            micros: Number(x.micros),
          })),
        };
      }),
      limit,
      offset,
    });
  }),
);

router.get(
  "/contributor/:address",
  asyncHandler(async (req, res) => {
    const address = String(req.params.address ?? "");
    if (!isEthAddress(address)) {
      res.status(400).json({ error: "invalid address" });
      return;
    }
    const bal = await contributorBalances(address);
    res.json({
      ...bal,
      accruedDisplay: formatUsdDisplay(BigInt(bal.accruedMicros)),
      settledDisplay: formatUsdDisplay(BigInt(bal.settledMicros)),
      pendingDisplay: formatUsdDisplay(BigInt(bal.pendingMicros)),
      vault: env().RESIDUALS_VAULT_ADDRESS || null,
    });
  }),
);
