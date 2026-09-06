import { useEffect, useState, FormEvent } from "react";
import { Plus, X, Star, Globe, Lock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { EmptyState } from "../components/StateComponents";

interface PortfolioProject {
  id: string;
  title: string;
  description: string | null;
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  is_public: boolean;
}

export default function Portfolio() {
  const { user } = useAuth();
  const [items, setItems] = useState<PortfolioProject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("portfolio_projects")
      .select("id, title, description, technologies, github_url, live_url, featured, is_public")
      .eq("user_id", user.id)
      .order("featured", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  async function toggleVisibility(id: string, isPublic: boolean) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, is_public: !isPublic } : p)));
    await supabase.from("portfolio_projects").update({ is_public: !isPublic }).eq("id", id);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-mist-50">Portfolio</h1>
          <p className="mt-1 text-mist-400">Showcase finished projects publicly.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Add project</button>
      </div>

      {!loading && items.length === 0 && (
        <div className="mt-8">
          <EmptyState title="Nothing showcased yet" description="Add a finished project to start building your public portfolio." action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={15} /> Add project</button>} />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <div key={p.id} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-medium text-mist-50">
                {p.featured && <Star size={14} className="text-signal-amber" />}
                {p.title}
              </p>
              <button onClick={() => toggleVisibility(p.id, p.is_public)} className="text-mist-400 hover:text-forge-400" title="Toggle visibility">
                {p.is_public ? <Globe size={15} /> : <Lock size={15} />}
              </button>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-mist-400">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.technologies?.map((t) => (
                <span key={t} className="rounded-full border border-ink-600 px-2 py-0.5 text-[10px] text-mist-400">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <NewPortfolioModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
}

function NewPortfolioModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from("portfolio_projects").insert({
      user_id: user.id,
      title,
      description,
      technologies: technologies.split(",").map((t) => t.trim()).filter(Boolean),
      github_url: githubUrl || null,
      live_url: liveUrl || null,
    });
    setSaving(false);
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 px-6 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-mist-50">Add to portfolio</h2>
          <button onClick={onClose} className="text-mist-400 hover:text-mist-50"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Title</label><input required className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div><label className="label">Technologies (comma-separated)</label><input className="input" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, Supabase, Tailwind" /></div>
          <div><label className="label">GitHub URL</label><input className="input" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} /></div>
          <div><label className="label">Live demo URL</label><input className="input" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} /></div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "Saving…" : "Add project"}</button>
        </form>
      </div>
    </div>
  );
}
