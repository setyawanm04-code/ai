import { useEffect, useState, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, X, Bug as BugIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import ProjectPicker from "../components/ProjectPicker";
import { EmptyState } from "../components/StateComponents";

type Status = "open" | "in_progress" | "fixed" | "verified" | "closed";
type Severity = "critical" | "high" | "medium" | "low";

interface Bug {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  severity: Severity;
  reproduction_steps: string | null;
}

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "text-signal-rose border-signal-rose/40",
  high: "text-signal-amber border-signal-amber/40",
  medium: "text-signal-violet border-signal-violet/40",
  low: "text-mist-400 border-ink-600",
};

export default function Bugs() {
  const [params] = useSearchParams();
  const projectId = params.get("project");
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [showModal, setShowModal] = useState(false);

  async function load(pid: string) {
    const { data } = await supabase
      .from("bugs")
      .select("id, title, description, status, severity, reproduction_steps")
      .eq("project_id", pid)
      .order("created_at", { ascending: false });
    setBugs(data ?? []);
  }

  useEffect(() => {
    if (projectId) load(projectId);
  }, [projectId]);

  async function updateStatus(id: string, status: Status) {
    setBugs((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    await supabase.from("bugs").update({ status }).eq("id", id);
  }

  if (!projectId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl text-mist-50">Bug Tracker</h1>
        <p className="mt-1 mb-6 text-mist-400">Pick a project to see its bugs.</p>
        <ProjectPicker />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-mist-50">Bug Tracker</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Report bug</button>
      </div>

      {bugs.length === 0 && (
        <div className="mt-6">
          <EmptyState icon={<BugIcon size={26} />} title="No bugs reported" description="Nice — or nobody's found one yet." />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {bugs.map((b) => (
          <div key={b.id} className="card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-mist-50">{b.title}</p>
                {b.description && <p className="mt-1 text-sm text-mist-400">{b.description}</p>}
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] capitalize ${SEVERITY_COLOR[b.severity]}`}>
                {b.severity}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {b.reproduction_steps && (
                <p className="text-xs text-mist-500">Repro: {b.reproduction_steps}</p>
              )}
              <select
                value={b.status}
                onChange={(e) => updateStatus(b.id, e.target.value as Status)}
                className="ml-auto rounded border border-ink-600 bg-ink-900 px-2 py-1 text-xs text-mist-300"
              >
                {(["open", "in_progress", "fixed", "verified", "closed"] as Status[]).map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <NewBugModal projectId={projectId} onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); load(projectId); }} />
      )}
    </div>
  );
}

function NewBugModal({ projectId, onClose, onCreated }: { projectId: string; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [steps, setSteps] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("bugs").insert({
      project_id: projectId, title, description, severity, reproduction_steps: steps,
    });
    setSaving(false);
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 px-6 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-mist-50">Report a bug</h2>
          <button onClick={onClose} className="text-mist-400 hover:text-mist-50"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="label">Reproduction steps</label>
            <textarea className="input" rows={2} value={steps} onChange={(e) => setSteps(e.target.value)} />
          </div>
          <div>
            <label className="label">Severity</label>
            <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "Reporting…" : "Report bug"}</button>
        </form>
      </div>
    </div>
  );
}
