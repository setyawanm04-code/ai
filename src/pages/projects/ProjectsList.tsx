import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, Briefcase, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { EmptyState } from "../../components/StateComponents";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  template: string;
  updated_at: string;
}

const TEMPLATES = [
  "Blank", "React + Vite", "React + Supabase", "Next.js", "Node API",
  "Landing Page", "SaaS", "Dashboard", "E-commerce", "Cashier", "Portfolio",
];

export default function ProjectsList() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("id, name, description, status, template, updated_at")
      .order("updated_at", { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-mist-50">Projects</h1>
          <p className="mt-1 text-mist-400">Everything you're building, in one place.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> New project
        </button>
      </div>

      {!loading && projects.length === 0 && (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="No projects yet"
          description="Create a blank project, pick a template, or start from an idea in the Idea Lab."
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={15} /> New project
            </button>
          }
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link key={p.id} to={`/app/projects/${p.id}`} className="card p-5 transition hover:border-forge-500/40">
            <div className="flex items-center justify-between">
              <p className="font-medium text-mist-50">{p.name}</p>
              <span className="rounded-full border border-ink-600 px-2 py-0.5 text-[11px] capitalize text-mist-300">
                {p.status}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-mist-400">{p.description || "No description yet."}</p>
            <p className="mt-4 text-xs text-mist-500">{p.template}</p>
          </Link>
        ))}
      </div>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    const { data, error } = await supabase
      .from("projects")
      .insert({ owner_id: user.id, name, description, template: template.toLowerCase().replace(/\s+/g, "-") })
      .select("id")
      .single();
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    // Owner is automatically granted access via RLS (owner_id match); also register explicit membership.
    if (data) {
      await supabase.from("project_members").insert({ project_id: data.id, user_id: user.id, role: "owner" });
      await supabase.from("project_settings").insert({ project_id: data.id, rules_md: DEFAULT_RULES });
    }
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 px-6 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-6 animate-rise" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-mist-50">New project</h2>
          <button onClick={onClose} className="text-mist-400 hover:text-mist-50"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Cashier POS System" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project for?" />
          </div>
          <div>
            <label className="label">Template</label>
            <select className="input" value={template} onChange={(e) => setTemplate(e.target.value)}>
              {TEMPLATES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-signal-rose">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Creating…" : "Create project"}
          </button>
        </form>
      </div>
    </div>
  );
}

const DEFAULT_RULES = `Use TypeScript.
Use Tailwind CSS.
Use Supabase.
Use reusable React components.
Never expose API keys.
Follow existing architecture.
`;
