import {
  paymentMiddleware,
  x402ResourceServer,
} from "@okxweb3/x402-express";
import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server";
import type { RequestHandler } from "express";
import { env } from "./env.js";

const NETWORK = "eip155:196" as const;

export function buildPaymentMiddleware(): RequestHandler {
  const e = env();
  const facilitatorClient = new OKXFacilitatorClient({
    apiKey: e.OKX_API_KEY,
    secretKey: e.OKX_SECRET_KEY,
    passphrase: e.OKX_PASSPHRASE,
  });

  const resourceServer = new x402ResourceServer(facilitatorClient);
  resourceServer.register(NETWORK, new ExactEvmScheme());

  const price = `$${e.QUERY_PRICE_USD}`;
  const accept = {
    scheme: "exact" as const,
    network: NETWORK,
    payTo: e.PAY_TO as `0x${string}`,
    price,
  };

  return paymentMiddleware(
    {
      "GET /ask": {
        accepts: [accept],
        description:
          "1) Submit a practical how-to question. 2) Receive an answer composed only from retrieved contributor entries. 3) A published share of the query fee accrues to cited contributors.",
        mimeType: "application/json",
      },
      "POST /ask": {
        accepts: [accept],
        description:
          "1) Submit a practical how-to question. 2) Receive an answer composed only from retrieved contributor entries. 3) A published share of the query fee accrues to cited contributors.",
        mimeType: "application/json",
      },
    },
    resourceServer,
  );
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
