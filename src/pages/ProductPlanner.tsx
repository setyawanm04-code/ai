import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { EmptyState } from "../components/StateComponents";
import ProjectPicker from "../components/ProjectPicker";

interface MemoryRow {
  id: string;
  key: string;
  value: string;
  important: boolean;
}

export default function ProductPlanner() {
  const [params] = useSearchParams();
  const projectId = params.get("project");
  const [rows, setRows] = useState<MemoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  async function load(pid: string) {
    setLoading(true);
    const { data } = await supabase
      .from("project_memory")
      .select("id, key, value, important")
      .eq("project_id", pid)
      .order("important", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (projectId) load(projectId);
  }, [projectId]);

  async function addEntry() {
    if (!projectId || !newKey.trim() || !newValue.trim()) return;
    await supabase.from("project_memory").insert({ project_id: projectId, key: newKey, value: newValue });
    setNewKey("");
    setNewValue("");
    load(projectId);
  }

  async function remove(id: string) {
    await supabase.from("project_memory").delete().eq("id", id);
    if (projectId) load(projectId);
  }

  if (!projectId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl text-mist-50">Product Planner</h1>
        <p className="mt-1 mb-6 text-mist-400">Pick a project to plan for.</p>
        <ProjectPicker />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl text-mist-50">Product Planner</h1>
      <p className="mt-1 text-mist-400">
        Overview, features, and decisions for this project — this doubles as project memory the AI
        assistant reads before every request.
      </p>

      <div className="mt-6 card p-5">
        <h2 className="mb-3 text-sm font-medium text-mist-200">Add planning note</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <input className="input" placeholder="Key (e.g. Target users)" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <input className="input" placeholder="Value" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          <button onClick={addEntry} className="btn-primary"><Plus size={16} /></button>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {!loading && rows.length === 0 && (
          <EmptyState title="No planning notes yet" description="Add product overview, features, or user stories above, or generate them from an idea in the Idea Lab." />
        )}
        {rows.map((r) => (
          <div key={r.id} className="card flex items-start justify-between gap-4 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-forge-400">{r.key}</p>
              <p className="mt-1 text-sm text-mist-200">{r.value}</p>
            </div>
            <button onClick={() => remove(r.id)} className="text-mist-500 hover:text-signal-rose">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
