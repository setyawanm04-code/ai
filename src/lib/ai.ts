import { supabase } from "./supabaseClient";

async function authedFetch(path: string, body: unknown) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("You must be signed in to use AI features.");

  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.message || json?.error || `Request failed (${res.status})`);
    (err as any).status = res.status;
    (err as any).code = json?.error;
    throw err;
  }
  return json;
}

export interface IdeaAnalysis {
  problem: string;
  targetUsers: string[];
  solution: string;
  features: string[];
  uniqueValueProposition: string;
  personas: { name: string; role: string; goals: string; frustrations: string }[];
  businessModel: string;
  monetizationIdeas: string[];
  risks: string[];
  mvpScope: string[];
  futureFeatures: string[];
  roadmap: { mvp: string[]; v1_1: string[]; v2: string[] };
}

export async function analyzeIdea(idea: string): Promise<{ result: IdeaAnalysis; provider: string }> {
  return authedFetch("/api/ai/idea", { idea });
}

export async function askAI(params: {
  message: string;
  mode?: string;
  projectId?: string;
  files?: { path: string; content: string }[];
}): Promise<{ message: string; mode: string; provider: string; warnings: string[] }> {
  return authedFetch("/api/ai/chat", params);
}
