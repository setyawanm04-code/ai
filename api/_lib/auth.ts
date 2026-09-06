import { createClient } from "@supabase/supabase-js";

// Service-role client — server-only. NEVER import this file from src/ (client code).
// The service role key bypasses RLS, so every function using it must manually
// scope queries to the authenticated user.
export function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("CONFIGURATION_REQUIRED: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Verifies the bearer token from an incoming request against Supabase Auth
 * and returns the authenticated user. Throws on missing/invalid token.
 * Never trust a user id sent in the request body — always resolve it here.
 */
export async function requireUser(req: Request): Promise<{ id: string; email?: string }> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw new AuthError("Missing authentication token.");
  }

  const admin = getAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) {
    throw new AuthError("Invalid or expired session.");
  }
  return { id: data.user.id, email: data.user.email ?? undefined };
}

export class AuthError extends Error {}
