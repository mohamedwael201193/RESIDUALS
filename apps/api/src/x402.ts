import {
  paymentMiddleware,
  x402ResourceServer,
} from "@okxweb3/x402-express";
import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server";
import {
  bazaarResourceServerExtension,
  declareDiscoveryExtension,
} from "@x402/extensions/bazaar";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { env } from "./env.js";

const NETWORK = "eip155:196" as const;

const ASK_DESCRIPTION =
  "1) POST JSON {\"query\":\"…\"} with a practical how-to question (3-500 chars). 2) After x402 settlement, receive an answer composed only from retrieved contributor entries plus citations. 3) A published share of the 0.03 USD₮0 fee accrues to cited contributors.";

/**
 * v1-style discovery block that OKX buyer agents look for on accepts[].
 * Without this, paid replay POSTs an empty body → 400 "query must be 3-500 chars".
 */
export const ASK_OUTPUT_SCHEMA = {
  input: {
    type: "http",
    method: "POST",
    discoverable: true,
    bodyType: "json",
    bodyFields: {
      query: {
        type: "string",
        description: "Practical how-to question (3-500 characters)",
        minLength: 3,
        maxLength: 500,
      },
    },
    body: {
      query: "How do I open a business bank account in Singapore?",
    },
    schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          minLength: 3,
          maxLength: 500,
          description: "Practical how-to question",
        },
      },
      required: ["query"],
      additionalProperties: true,
    },
  },
  output: {
    type: "json",
    example: {
      answer: "Concrete steps composed from retrieved contributor entries.",
      charged: true,
      fee: "0.03",
      paidMicros: "30000",
      queryId: 1,
      citations: [
        {
          entryId: 1,
          handle: "mina.k",
          topic: "Singapore freelancing bank account",
          score: 0.78,
        },
      ],
    },
  },
} as const;

const askDiscoveryExtensions = declareDiscoveryExtension({
  input: {
    query: "How do I open a business bank account in Singapore?",
  },
  inputSchema: {
    properties: {
      query: {
        type: "string",
        minLength: 3,
        maxLength: 500,
        description: "Practical how-to question",
      },
    },
    required: ["query"],
  },
  bodyType: "json",
  output: {
    example: ASK_OUTPUT_SCHEMA.output.example,
  },
});

/** Exported for unit tests — mutates decoded PAYMENT-REQUIRED JSON. */
export function injectAskInputSchema(headerValue: string): string {
  try {
    const challenge = JSON.parse(
      Buffer.from(headerValue, "base64").toString("utf8"),
    ) as {
      accepts?: Array<Record<string, unknown>>;
      extensions?: Record<string, unknown> | null;
      resource?: Record<string, unknown>;
      [k: string]: unknown;
    };

    if (Array.isArray(challenge.accepts)) {
      challenge.accepts = challenge.accepts.map((a) => ({
        ...a,
        outputSchema: ASK_OUTPUT_SCHEMA,
      }));
    }

    // Keep bazaar extension if middleware already set it; otherwise attach ours.
    const ext = { ...(challenge.extensions ?? {}) };
    if (!ext.bazaar) {
      Object.assign(ext, askDiscoveryExtensions);
    }
    // Also expose v1 alias some buyers scan at the top level.
    ext.outputSchema = ASK_OUTPUT_SCHEMA;
    challenge.extensions = ext;

    if (challenge.resource && typeof challenge.resource === "object") {
      challenge.resource = {
        ...challenge.resource,
        description: ASK_DESCRIPTION,
        mimeType: "application/json",
      };
    }

    return Buffer.from(JSON.stringify(challenge), "utf8").toString("base64");
  } catch {
    return headerValue;
  }
}

/**
 * Wrap Express res so PAYMENT-REQUIRED always carries outputSchema.input
 * (POST + JSON body + required query) for OKX buyer agents.
 */
function withAskInputSchema(res: Response): void {
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = ((
    name: string,
    value: string | number | readonly string[],
  ) => {
    if (
      String(name).toLowerCase() === "payment-required" &&
      typeof value === "string"
    ) {
      return originalSetHeader(name, injectAskInputSchema(value));
    }
    return originalSetHeader(name, value);
  }) as typeof res.setHeader;

  const originalWriteHead = res.writeHead.bind(res);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (res as any).writeHead = (
    statusCode: number,
    ...rest: unknown[]
  ) => {
    // If headers were set via writeHead(status, headers), patch there too.
    if (rest.length && rest[0] && typeof rest[0] === "object" && !Array.isArray(rest[0])) {
      const headers = rest[0] as Record<string, unknown>;
      for (const key of Object.keys(headers)) {
        if (key.toLowerCase() === "payment-required" && typeof headers[key] === "string") {
          headers[key] = injectAskInputSchema(headers[key] as string);
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (originalWriteHead as any)(statusCode, ...rest);
  };
}

export function buildPaymentMiddleware(): RequestHandler {
  const e = env();
  const facilitatorClient = new OKXFacilitatorClient({
    apiKey: e.OKX_API_KEY,
    secretKey: e.OKX_SECRET_KEY,
    passphrase: e.OKX_PASSPHRASE,
  });

  const resourceServer = new x402ResourceServer(facilitatorClient);
  resourceServer.register(NETWORK, new ExactEvmScheme());
  // Enrich bazaar discovery (method / path) into PaymentRequired.extensions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resourceServer.registerExtension(bazaarResourceServerExtension as any);

  const price = `$${e.QUERY_PRICE_USD}`;
  const accept = {
    scheme: "exact" as const,
    network: NETWORK,
    payTo: e.PAY_TO as `0x${string}`,
    price,
  };

  const askRoute = {
    accepts: [accept],
    description: ASK_DESCRIPTION,
    mimeType: "application/json",
    extensions: {
      ...askDiscoveryExtensions,
    },
  };

  const inner = paymentMiddleware(
    {
      // Advertise the same POST+JSON input schema on both verbs so whichever
      // the buyer probes first still tells the pay flow to replay with a body.
      "GET /ask": askRoute,
      "POST /ask": askRoute,
    },
    resourceServer,
  );

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path === "/ask" || req.url?.startsWith("/ask")) {
      withAskInputSchema(res);
    }
    return inner(req, res, next);
  };
}

function asEthAddress(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) return null;
  return value.toLowerCase();
}

function decodeBase64Json(hdr: string): unknown {
  return JSON.parse(Buffer.from(hdr, "base64").toString("utf8"));
}

/**
 * Payer identity from the paid retry.
 * OKX express middleware does not set req.locals — read PAYMENT-SIGNATURE
 * (authorization.from). Fallbacks: locals / payment-response.
 */
export function extractPayer(req: {
  headers: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locals?: any;
}): string | null {
  try {
    const locals = req.locals;
    const fromLocals = asEthAddress(
      locals?.payment?.payload?.authorization?.from ||
        locals?.payer ||
        locals?.paymentResponse?.payer,
    );
    if (fromLocals) return fromLocals;
  } catch {
    /* ignore */
  }

  const sigHdr =
    (req.headers["payment-signature"] as string | undefined) ||
    (req.headers["PAYMENT-SIGNATURE"] as string | undefined) ||
    (req.headers["x-payment"] as string | undefined);
  if (sigHdr) {
    try {
      const json = decodeBase64Json(sigHdr) as {
        payload?: { authorization?: { from?: string } };
      };
      const from = asEthAddress(json?.payload?.authorization?.from);
      if (from) return from;
    } catch {
      /* ignore */
    }
  }

  const respHdr =
    (req.headers["payment-response"] as string | undefined) ||
    (req.headers["PAYMENT-RESPONSE"] as string | undefined);
  if (!respHdr) return null;
  try {
    const json = decodeBase64Json(respHdr) as { payer?: string };
    return asEthAddress(json.payer);
  } catch {
    return null;
  }
}
