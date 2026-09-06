// Server-side AI safety limits.
// CRITICAL: these are enforced here, in serverless functions, never trusted from the client.
// A request from the browser can claim anything; only these values are authoritative.

export const LIMITS = {
  MAX_AI_REQUESTS_PER_MINUTE: intEnv("MAX_AI_REQUESTS_PER_MINUTE", 10),
  MAX_AI_REQUESTS_PER_DAY: intEnv("MAX_AI_REQUESTS_PER_DAY", 200),
  MAX_INPUT_CHARS: intEnv("MAX_INPUT_CHARS", 12000),
  MAX_OUTPUT_TOKENS: intEnv("MAX_OUTPUT_TOKENS", 2048),
  MAX_CONTEXT_TOKENS: intEnv("MAX_CONTEXT_TOKENS", 8000),
  MAX_FILES_PER_REQUEST: intEnv("MAX_FILES_PER_REQUEST", 10),
  MAX_FILE_SIZE: intEnv("MAX_FILE_SIZE", 200_000),
  MAX_GENERATED_FILES: intEnv("MAX_GENERATED_FILES", 20),
  MAX_MULTI_FILE_CHANGES: intEnv("MAX_MULTI_FILE_CHANGES", 8),
  MAX_AGENT_STEPS: intEnv("MAX_AGENT_STEPS", 12),
  MAX_PROJECT_SIZE: intEnv("MAX_PROJECT_SIZE", 5_000_000),
  MAX_CONCURRENT_AI_TASKS: intEnv("MAX_CONCURRENT_AI_TASKS", 2),
};

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * In-memory sliding-window rate limiter.
 *
 * Honest limitation: this resets whenever the serverless function's execution
 * context is recycled, and does not coordinate across concurrent instances.
 * That's a real gap, not a hidden one. For durable, cross-instance rate
 * limiting, plug in a shared store (e.g. Upstash Redis) behind this same
 * interface — it is intentionally optional, not required, for the app to run.
 */
const requestLog = new Map<string, number[]>();

export function checkRateLimit(userId: string): { ok: boolean; reason?: string } {
  const now = Date.now();
  const minuteAgo = now - 60_000;
  const dayAgo = now - 86_400_000;

  const timestamps = (requestLog.get(userId) || []).filter((t) => t > dayAgo);

  const lastMinute = timestamps.filter((t) => t > minuteAgo).length;
  if (lastMinute >= LIMITS.MAX_AI_REQUESTS_PER_MINUTE) {
    return { ok: false, reason: "Too many requests. Please wait a moment before trying again." };
  }
  if (timestamps.length >= LIMITS.MAX_AI_REQUESTS_PER_DAY) {
    return { ok: false, reason: "Daily AI request limit reached for this account." };
  }

  timestamps.push(now);
  requestLog.set(userId, timestamps);
  return { ok: true };
}

export function validateInputSize(input: string): { ok: boolean; reason?: string } {
  if (input.length > LIMITS.MAX_INPUT_CHARS) {
    return {
      ok: false,
      reason: "Request too large. Try selecting fewer files or splitting the task.",
    };
  }
  return { ok: true };
}
