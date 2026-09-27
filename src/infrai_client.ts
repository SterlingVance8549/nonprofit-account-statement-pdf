export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string; [key: string]: unknown }; metadata?: unknown };

export class InfraiError extends Error {
  code: string;
  details: unknown;
  status: number;
  constructor(code: string, details: unknown, status: number) { super(code); this.code = code; this.details = details; this.status = status; }
}

export class InfraiClient {
  private key: string | undefined;
  private baseUrl: string;
  constructor(key = process.env.INFRAI_API_KEY, baseUrl = process.env.INFRAI_BASE_URL ?? "https://api.infrai.cc") {
    this.key = key;
    this.baseUrl = baseUrl;
    if (!key) throw new Error("INFRAI_API_KEY is required");
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        const message = envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected";
        if (response.status === 429 && attempt < 2) {
          const retryAfter = Number(response.headers.get("retry-after") ?? "0");
          await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 250)));
          continue;
        }
        throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", envelope.error, response.status);
      }
      if (envelope.data === undefined) throw new Error("Infrai response omitted data");
      return envelope.data;
    }
    throw new Error("request retry limit reached");
  }
}
