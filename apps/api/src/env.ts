import { z } from "zod";

const ethAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "invalid eth address");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),

  OKX_API_KEY: z.string().min(1),
  OKX_SECRET_KEY: z.string().min(1),
  OKX_PASSPHRASE: z.string().min(1),
  OKX_BASE_URL: z.string().url().default("https://web3.okx.com"),

  XLAYER_RPC_URL: z.string().url(),
  CHAIN_ID: z.coerce.number().int().default(196),
  USDT0_ADDRESS: ethAddress,
  PAY_TO: ethAddress,
  OPERATOR_PRIVATE_KEY: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "invalid private key"),
  RESIDUALS_VAULT_ADDRESS: ethAddress.optional().or(z.literal("")),

  DATABASE_URL: z.string().min(1),
  DATABASE_URL_DIRECT: z.string().optional().or(z.literal("")),

  EMBEDDINGS_PROVIDER: z
    .enum(["gemini", "openai", "openrouter"])
    .default("gemini"),
  EMBEDDINGS_API_KEY: z.string().min(1),
  EMBEDDINGS_MODEL: z.string().min(1),
  EMBEDDINGS_TIMEOUT_MS: z.coerce.number().int().positive().default(4000),
  EMBEDDINGS_DIMENSIONS: z.coerce.number().int().positive().default(768),

  CEREBRAS_API_KEY: z.string().optional().default(""),
  CEREBRAS_MODEL: z.string().optional().default("llama3.3-70b"),
  SAMBANOVA_API_KEY: z.string().optional().default(""),
  SAMBANOVA_MODEL: z.string().optional().default(""),
  TOGETHER_API_KEY: z.string().optional().default(""),
  TOGETHER_MODEL: z.string().optional().default(""),
  OPENROUTER_API_KEY: z.string().optional().default(""),
  OPENROUTER_MODEL: z.string().optional().default(""),
  GROQ_API_KEY: z.string().optional().default(""),
  GROQ_MODEL: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().optional().default("gemini-2.0-flash"),
  NVIDIA_API_KEY: z.string().optional().default(""),
  NVIDIA_BASE_URL: z.string().optional().default(""),
  NVIDIA_MODEL: z.string().optional().default(""),
  LLM_API_KEY: z.string().optional().default(""),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(3000),

  PUBLIC_BASE_URL: z.string().optional().default(""),
  QUERY_PRICE_USD: z.string().default("0.03"),
  ROYALTY_BPS: z.coerce.number().int().min(0).max(10000).default(5000),
  MIN_RELEVANCE: z.coerce.number().min(0).max(1).default(0.4),
  TOP_K: z.coerce.number().int().positive().default(4),
  ADMIN_TOKEN: z.string().min(16),
  CRON_SECRET: z.string().min(16),
  AGENT_ID: z.string().optional().default(""),

  UPSTASH_REDIS_REST_URL: z.string().optional().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(""),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): Env {
  const cleaned = { ...raw };
  // Prefer non-empty NVIDIA key if duplicated
  if (!cleaned.NVIDIA_API_KEY || cleaned.NVIDIA_API_KEY === '""') {
    delete cleaned.NVIDIA_API_KEY;
  } else {
    cleaned.NVIDIA_API_KEY = cleaned.NVIDIA_API_KEY.replace(/^"|"$/g, "");
  }

  const parsed = schema.safeParse(cleaned);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${msg}`);
  }
  return parsed.data;
}

export function env(): Env {
  if (!cached) cached = loadEnv();
  return cached;
}

export function resetEnvCache(): void {
  cached = null;
}
