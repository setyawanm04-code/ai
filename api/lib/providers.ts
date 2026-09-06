// AI provider abstraction. Gemini is primary; OpenRouter is an optional fallback.
// Both API keys live only in server environment variables — see .env.example.
// This module is imported exclusively by files under /api, never by /src.

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

/** Picks Gemini first, falls back to OpenRouter only if configured. */
export async function generateWithFallback(prompt: string, opts?: GenerateOptions): Promise<{ text: string; provider: string }> {
  if (GeminiProvider.isConfigured()) {
    try {
      const text = await GeminiProvider.generateText(prompt, opts);
      return { text, provider: "gemini" };
    } catch (err) {
      if (!OpenRouterProvider.isConfigured()) throw err;
      // fall through to OpenRouter
    }
  }
  if (OpenRouterProvider.isConfigured()) {
    const text = await OpenRouterProvider.generateText(prompt, opts);
    return { text, provider: "openrouter" };
  }
  throw new ProviderUnavailableError(
    "No AI provider is configured. Set GEMINI_API_KEY (and optionally OPENROUTER_API_KEY) on the server."
  );
}

export class ProviderError extends Error {}
export class ProviderUnavailableError extends Error {}
