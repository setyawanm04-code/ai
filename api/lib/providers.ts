// AI provider abstraction. Gemini is the documented default; OpenAI and OpenRouter
// are supported alternates. All API keys live only in server environment variables
// — see .env.example. This module is imported exclusively by files under /api, never by /src.

export interface GenerateOptions {
  systemInstruction?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  generateText(prompt: string, opts?: GenerateOptions): Promise<string>;
}

const GEMINI_MODEL = "gemini-2.0-flash";

export const GeminiProvider: AIProvider = {
  name: "gemini",
  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  },
  async generateText(prompt, opts = {}) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ProviderUnavailableError(
        "GEMINI_API_KEY is not configured on the server. AI features are unavailable until this is set."
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const body: Record<string, unknown> = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: opts.maxOutputTokens ?? 2048,
        temperature: opts.temperature ?? 0.7,
      },
    };
    if (opts.systemInstruction) {
      body.systemInstruction = { parts: [{ text: opts.systemInstruction }] };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new ProviderError(`Gemini request failed (${res.status}): ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
    if (!text) {
      throw new ProviderError("Gemini returned an empty response.");
    }
    return text;
  },
};

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const OpenAIProvider: AIProvider = {
  name: "openai",
  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
  },
  async generateText(prompt, opts = {}) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new ProviderUnavailableError(
        "OPENAI_API_KEY is not configured on the server. AI features are unavailable until this is set."
      );
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          ...(opts.systemInstruction ? [{ role: "system", content: opts.systemInstruction }] : []),
          { role: "user", content: prompt },
        ],
        max_tokens: opts.maxOutputTokens ?? 2048,
        temperature: opts.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new ProviderError(`OpenAI request failed (${res.status}): ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    if (!text) {
      throw new ProviderError("OpenAI returned an empty response.");
    }
    return text;
  },
};

export const OpenRouterProvider: AIProvider = {
  name: "openrouter",
  isConfigured() {
    return Boolean(process.env.OPENROUTER_API_KEY);
  },
  async generateText(prompt, opts = {}) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new ProviderUnavailableError("OPENROUTER_API_KEY is not configured on the server.");
    }
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          ...(opts.systemInstruction ? [{ role: "system", content: opts.systemInstruction }] : []),
          { role: "user", content: prompt },
        ],
        max_tokens: opts.maxOutputTokens ?? 2048,
        temperature: opts.temperature ?? 0.7,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new ProviderError(`OpenRouter request failed (${res.status}): ${errText.slice(0, 300)}`);
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    if (!text) throw new ProviderError("OpenRouter returned an empty response.");
    return text;
  },
};

/**
 * Tries each configured provider in order and returns the first success.
 * Order: Gemini → OpenAI → OpenRouter. Only providers with a set API key are
 * attempted — an unconfigured provider is skipped, never silently faked.
 * Set AI_PROVIDER=openai (or "gemini" / "openrouter") to force a specific one first.
 */
export async function generateWithFallback(prompt: string, opts?: GenerateOptions): Promise<{ text: string; provider: string }> {
  const all: AIProvider[] = [GeminiProvider, OpenAIProvider, OpenRouterProvider];

  const forced = process.env.AI_PROVIDER?.toLowerCase();
  const ordered = forced
    ? [...all.filter((p) => p.name === forced), ...all.filter((p) => p.name !== forced)]
    : all;

  let lastErr: unknown;
  for (const provider of ordered) {
    if (!provider.isConfigured()) continue;
    try {
      const text = await provider.generateText(prompt, opts);
      return { text, provider: provider.name };
    } catch (err) {
      lastErr = err;
      // try the next configured provider
    }
  }

  if (lastErr) throw lastErr;
  throw new ProviderUnavailableError(
    "No AI provider is configured. Set GEMINI_API_KEY, OPENAI_API_KEY, or OPENROUTER_API_KEY on the server."
  );
}

export class ProviderError extends Error {}
export class ProviderUnavailableError extends Error {}
