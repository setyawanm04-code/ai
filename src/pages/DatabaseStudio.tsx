import { useState } from "react";
import { Database, Sparkles } from "lucide-react";
import { askAI } from "../lib/ai";
import { StatusBanner } from "../components/StateComponents";

export default function DatabaseStudio() {
  const [requirement, setRequirement] = useState("");
  const [loading, setLoading] = useState(false);
  const [sql, setSql] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  async function generateSchema() {
    if (!requirement.trim()) return;
    setLoading(true);
    setError(null);
    setSql(null);
    try {
      const res = await askAI({
        message: `Generate a PostgreSQL schema (CREATE TABLE statements, with uuid primary keys, foreign keys, and row level security policies for Supabase) for this requirement:\n\n${requirement}\n\nReturn only SQL in a single fenced code block.`,
        mode: "DATABASE",
      });
      setSql(res.message);
    } catch (err: any) {
      setError({ message: err.message, code: err.code });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 text-forge-500">
        <Database size={20} />
        <span className="text-xs font-medium uppercase tracking-wide">Database Studio</span>
      </div>
      <h1 className="mt-2 font-display text-2xl text-mist-50">Design your schema</h1>
      <p className="mt-1 text-mist-400">
        Describe what you need to store; get a migration-ready schema with RLS. Review before
        applying — dangerous migrations should always be run manually and confirmed.
      </p>

      <div className="mt-6 card p-5 space-y-4">
        <textarea
          className="input min-h-24"
          placeholder='e.g. "Products, orders, and order items for an online store, with per-user data isolation."'
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
        />
        <div className="flex justify-end">
          <button onClick={generateSchema} disabled={loading || !requirement.trim()} className="btn-primary">
            <Sparkles size={16} /> {loading ? "Generating…" : "Generate schema"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <StatusBanner state="PERMISSION_REQUIRED" detail="Applying migrations directly from this workspace requires connecting a database with elevated credentials, which DEVFORGE AI does not do automatically. Copy the SQL below into the Supabase SQL editor after reviewing it." />
      </div>

      {error && (
        <div className="mt-4">
          <StatusBanner state={error.code === "CONFIGURATION_REQUIRED" ? "CONFIGURATION_REQUIRED" : "FAILED"} detail={error.message} />
        </div>
      )}

      {sql && (
        <pre className="mt-6 overflow-x-auto rounded-xl border border-ink-700 bg-ink-900 p-4 font-mono text-xs text-mist-200">
          {sql}
        </pre>
      )}
    </div>
  );
}
