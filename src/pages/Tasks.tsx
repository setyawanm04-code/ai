import { useEffect, useState, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import ProjectPicker from "../components/ProjectPicker";

type Status = "backlog" | "todo" | "in_progress" | "review" | "done";

const COLUMNS: { key: Status; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: string;
}

export default function Tasks() {
  const [params] = useSearchParams();
  const projectId = params.get("project");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);

  async function load(pid: string) {
    const { data } = await supabase
      .from("tasks")
      .select("id, title, description, status, priority")
      .eq("project_id", pid)
      .order("created_at", { ascending: true });
    setTasks(data ?? []);
  }

  useEffect(() => {
    if (projectId) load(projectId);
  }, [projectId]);

  async function moveTask(id: string, status: Status) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    await supabase.from("tasks").update({ status }).eq("id", id);
  }

  if (!projectId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl text-mist-50">Tasks</h1>
        <p className="mt-1 mb-6 text-mist-400">Pick a project to see its board.</p>
        <ProjectPicker />
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h1 className="font-display text-2xl text-mist-50">Kanban board</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> New task</button>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-3 lg:grid-cols-5">
        {COLUMNS.map((col) => (
          <div key={col.key} className="min-w-[220px]">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-mist-400">
              {col.label} <span className="text-mist-600">{tasks.filter((t) => t.status === col.key).length}</span>
            </p>
            <div className="space-y-2">
              {tasks.filter((t) => t.status === col.key).map((t) => (
                <div key={t.id} className="card p-3">
                  <p className="text-sm text-mist-50">{t.title}</p>
                  {t.description && <p className="mt-1 line-clamp-2 text-xs text-mist-400">{t.description}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded-full border border-ink-600 px-2 py-0.5 text-[10px] capitalize text-mist-400">{t.priority}</span>
                    <select
                      value={t.status}
                      onChange={(e) => moveTask(t.id, e.target.value as Status)}
                      className="rounded border border-ink-600 bg-ink-900 px-1.5 py-0.5 text-[10px] text-mist-300"
                    >
                      {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <NewTaskModal projectId={projectId} onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); load(projectId); }} />
      )}
    </div>
  );
}

function NewTaskModal({ projectId, onClose, onCreated }: { projectId: string; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("tasks").insert({ project_id: projectId, title, description, priority });
    setSaving(false);
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 px-6 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-mist-50">New task</h2>
          <button onClick={onClose} className="text-mist-400 hover:text-mist-50"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "Creating…" : "Create task"}</button>
        </form>
      </div>
    </div>
  );
}
