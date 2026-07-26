export type Citation = {
  entryId: number;
  handle: string;
  topic?: string;
  score?: number;
  micros?: number;
  snippet?: string;
  contributor?: string;
};

export type AskResult = {
  answer: string;
  citations: Citation[];
  charged?: boolean;
  queryId?: number;
  message?: string;
};

export type LedgerItem = {
  id: number;
  query: string;
  paidMicros: number;
  charged: boolean;
  createdAt: string;
  citations: Citation[];
};

export type LedgerResponse = {
  items: LedgerItem[];
  total?: number;
  limit: number;
  offset: number;
};

export type ContributeBody = {
  address: string;
  handle: string;
  topic: string;
  body: string;
  region?: string;
};

export type ContributeResult = {
  id: number;
  status?: string | undefined;
  handle?: string | undefined;
  topic?: string | undefined;
};

export type ContributorStats = {
  address: string;
  handle?: string;
  accruedMicros: number;
  settledMicros: number;
  withdrawableMicros: number;
  entryCount?: number;
};

export type HealthResponse = {
  ok: boolean;
  db?: boolean;
  embeddings?: boolean;
  queryCount?: number;
  entryCount?: number;
  contributorCount?: number;
  timestamp?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly paymentRequired: boolean;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.paymentRequired = status === 402;
  }
}
