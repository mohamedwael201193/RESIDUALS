import pino from "pino";
import { env } from "./env.js";

export const log = pino({
  level: env().NODE_ENV === "production" ? "info" : "debug",
  base: { service: "residuals-api" },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "PAYMENT-REQUIRED",
      "payment",
      "privateKey",
    ],
    remove: true,
  },
});
