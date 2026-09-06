import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Sparkles, ArrowRight } from "lucide-react";
import { analyzeIdea, IdeaAnalysis } from "../lib/ai";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { StatusBanner } from "../components/StateComponents";

export default function IdeaLab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdeaAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleGenerate() {
    if (!idea.trim()) return;
    setLoading(true);
    setError(null);
    setErrorCode(null);
    setResult(null);
    try {
      const { result } = await analyzeIdea(idea);
      setResult(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setErrorCode(err.code ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function handleTurnIntoProject() {
    if (!result || !user) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("projects")
      .insert({
        owner_id: user.id,
        name: idea.slice(0, 60),
        description: result.solution,
        template: "blank",
      })
      .select("id")
      .single();
    setCreating(false);
    if (!error && data) {
      await supabase.from("project_members").insert({ project_id: data.id, user_id: user.id, role: "owner" });
      await supabase.from("project_memory").insert([
        { project_id: data.id, key: "Problem", value: result.problem, important: true },
        { project_id: data.id, key: "Unique value proposition", value: result.uniqueValueProposition, important: true },
        { project_id: data.id, key: "MVP scope", value: result.mvpScope.join(", ") },
      ]);
      navigate(`/app/projects/${data.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center gap-2 text-signal-violet">
        <Lightbulb size={20} />
        <span className="text-xs font-medium uppercase tracking-wide">Idea Lab</span>
      </div>
      <h1 className="mt-2 font-display text-2xl text-mist-50">Turn a rough idea into a plan</h1>
      <p className="mt-1 text-mist-400">
        Describe what you want to build in plain language. The AI treats this as data to analyze —
        never as instructions to follow.
      </p>

      <div className="mt-6 card p-5">
        <textarea
          className="input min-h-28"
          placeholder='e.g. "I want to build an online cashier system for small businesses."'
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <button onClick={handleGenerate} disabled={loading || !idea.trim()} className="btn-primary">
            <Sparkles size={16} /> {loading ? "Analyzing…" : "Generate Idea"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <StatusBanner
            state={errorCode === "CONFIGURATION_REQUIRED" ? "CONFIGURATION_REQUIRED" : "FAILED"}
            detail={error}
          />
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6 animate-rise">
          <Section title="Problem">{result.problem}</Section>
          <Section title="Solution">{result.solution}</Section>
          <Section title="Unique value proposition">{result.uniqueValueProposition}</Section>

          <ListSection title="Target users" items={result.targetUsers} />
          <ListSection title="Core features" items={result.features} />

          {result.personas?.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-mist-200">User personas</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.personas.map((p, i) => (
                  <div key={i} className="card p-4 text-sm">
                    <p className="font-medium text-mist-50">{p.name} · {p.role}</p>
                    <p className="mt-1 text-mist-400">Goals: {p.goals}</p>
                    <p className="mt-1 text-mist-400">Frustrations: {p.frustrations}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ListSection title="MVP scope" items={result.mvpScope} />
          <ListSection title="Future features" items={result.futureFeatures} />
          <ListSection title="Risks" items={result.risks} />
          <ListSection title="Monetization ideas" items={result.monetizationIdeas} />

          <div>
            <h3 className="mb-2 text-sm font-medium text-mist-200">Roadmap</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <RoadmapCol label="MVP" items={result.roadmap.mvp} />
              <RoadmapCol label="Version 1.1" items={result.roadmap.v1_1} />
              <RoadmapCol label="Version 2" items={result.roadmap.v2} />
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleTurnIntoProject} disabled={creating} className="btn-primary">
              {creating ? "Creating project…" : "Turn Into Project"} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-medium text-mist-200">{title}</h3>
      <p className="text-sm text-mist-400">{children}</p>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-medium text-mist-200">{title}</h3>
      <ul className="list-inside list-disc space-y-1 text-sm text-mist-400">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

function RoadmapCol({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-forge-400">{label}</p>
      <ul className="mt-2 space-y-1 text-sm text-mist-300">
        {items?.map((it, i) => <li key={i}>· {it}</li>) ?? <li className="text-mist-500">—</li>}
      </ul>
    </div>
  );
}
