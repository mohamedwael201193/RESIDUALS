/**
 * Assert unpaid /ask 402 challenge carries outputSchema.input (Tanjiro root cause).
 * Buyer agents only put JSON { query } on the paid replay when this is present.
 */
import { loadEnv, env } from "../env.js";

function decodePaymentRequired(hdr: string | null): Record<string, unknown> | null {
  if (!hdr) return null;
  try {
    return JSON.parse(Buffer.from(hdr, "base64").toString("utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

type Check = { name: string; ok: boolean; detail?: unknown };

async function probe(path: string, method: string, body?: unknown): Promise<Check[]> {
  const base = (env().PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  const opts: RequestInit = { method };
  if (body !== undefined) {
    opts.headers = { "content-type": "application/json" };
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(`${base}${path}`, opts);
  const challenge = decodePaymentRequired(r.headers.get("payment-required"));
  const accepts = (challenge?.accepts as Array<Record<string, unknown>> | undefined) ?? [];
  const a0 = accepts[0] ?? {};
  const outputSchema = a0.outputSchema as
    | {
        input?: {
          type?: string;
          method?: string;
          bodyType?: string;
          body?: Record<string, unknown>;
          schema?: { required?: string[]; properties?: Record<string, unknown> };
        };
        output?: unknown;
      }
    | undefined;
  const input = outputSchema?.input;
  const extensions = (challenge?.extensions ?? {}) as Record<string, unknown>;
  const bazaar = extensions.bazaar as
    | { info?: { input?: { bodyType?: string; body?: unknown }; inputSchema?: unknown } }
    | undefined;

  const checks: Check[] = [
    { name: `${method} ${path} status 402`, ok: r.status === 402, detail: r.status },
    {
      name: `${method} ${path} accepts[0].outputSchema.input exists`,
      ok: !!input && typeof input === "object",
      detail: input ? Object.keys(input) : null,
    },
    {
      name: `${method} ${path} input.type=http`,
      ok: input?.type === "http",
      detail: input?.type,
    },
    {
      name: `${method} ${path} input.method=POST`,
      ok: input?.method === "POST",
      detail: input?.method,
    },
    {
      name: `${method} ${path} input.bodyType=json`,
      ok: input?.bodyType === "json",
      detail: input?.bodyType,
    },
    {
      name: `${method} ${path} schema.required includes query`,
      ok: Array.isArray(input?.schema?.required) && input!.schema!.required!.includes("query"),
      detail: input?.schema?.required,
    },
    {
      name: `${method} ${path} body.query example string`,
      ok: typeof input?.body?.query === "string" && String(input.body.query).length >= 3,
      detail: input?.body?.query,
    },
    {
      name: `${method} ${path} outputSchema.output present`,
      ok: !!outputSchema?.output,
    },
    {
      name: `${method} ${path} extensions.bazaar OR extensions.outputSchema`,
      ok: !!bazaar || !!extensions.outputSchema,
      detail: {
        hasBazaar: !!bazaar,
        hasExtOutputSchema: !!extensions.outputSchema,
      },
    },
    {
      name: `${method} ${path} amount/network/asset match listing`,
      ok:
        a0.network === "eip155:196" &&
        a0.amount === "30000" &&
        String(a0.asset || "").toLowerCase() ===
          "0x779ded0c9e1022225f8e0630b35a9b54be713736",
      detail: { network: a0.network, amount: a0.amount, asset: a0.asset, payTo: a0.payTo },
    },
  ];

  console.log(
    JSON.stringify(
      {
        path,
        method,
        status: r.status,
        outputSchemaInput: input ?? null,
        bazaarInfo: bazaar?.info ?? null,
        acceptKeys: Object.keys(a0),
      },
      null,
      2,
    ),
  );

  return checks;
}

async function main() {
  loadEnv();
  const all: Check[] = [];
  all.push(...(await probe("/ask", "GET")));
  all.push(
    ...(await probe("/ask", "POST", {
      /* empty body — buyer before schema-aware fill */
    })),
  );

  let failed = 0;
  for (const c of all) {
    const mark = c.ok ? "PASS" : "FAIL";
    if (!c.ok) failed += 1;
    console.log(`${mark}  ${c.name}`, c.detail !== undefined ? JSON.stringify(c.detail) : "");
  }
  console.log(JSON.stringify({ total: all.length, failed, pass: failed === 0 }, null, 2));
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
