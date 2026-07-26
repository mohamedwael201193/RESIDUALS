import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { loadEnv, env } from "./env.js";
import { log } from "./log.js";
import { router } from "./routes.js";
import { buildPaymentMiddleware } from "./x402.js";
import { mountInternalRoutes } from "./internal.js";

loadEnv();

const app = express();
// Required behind Render/Fly/Cloudflare so x402 resource URLs use https://
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: true,
    exposedHeaders: ["PAYMENT-REQUIRED", "PAYMENT-RESPONSE"],
  }),
);
app.use(express.json({ limit: "256kb" }));
// Paid buyer agents often replay as application/x-www-form-urlencoded.
app.use(express.urlencoded({ extended: true, limit: "256kb" }));
app.use(
  pinoHttp({
    logger: log,
    autoLogging: { ignore: (req) => req.url === "/health" },
  }),
);

// Payment middleware must wrap priced routes before handlers.
app.use(buildPaymentMiddleware());
app.use(router);
mountInternalRoutes(app);

app.use(
  (
    err: Error & { status?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const status = err.status ?? 500;
    log.error({ err }, "request failed");
    res.status(status).json({
      error: status === 500 ? "internal error" : err.message,
    });
  },
);

const port = env().PORT;
app.listen(port, () => {
  log.info({ port }, "residuals api listening");
});
