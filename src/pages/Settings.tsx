import { useEffect, useState, FormEvent } from "react";
import { Settings as SettingsIcon, Github } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { StatusBanner, SuccessNote } from "../components/StateComponents";

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, headline, bio")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? "");
        setHeadline(data?.headline ?? "");
        setBio(data?.bio ?? "");
        setLoading(false);
      });
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, headline, bio, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-mist-300">
        <SettingsIcon size={20} />
        <span className="text-xs font-medium uppercase tracking-wide">Settings</span>
      </div>
      <h1 className="mt-2 font-display text-2xl text-mist-50">Your account</h1>

      <div className="mt-6 card p-5">
        <h2 className="text-sm font-medium text-mist-200">Email</h2>
        <p className="mt-1 text-sm text-mist-400">{user?.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 card space-y-4 p-5">
        <h2 className="text-sm font-medium text-mist-200">Profile</h2>
        {loading ? (
          <p className="text-sm text-mist-500">Loading…</p>
        ) : (
          <>
            <div>
              <label className="label">Full name</label>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label">Headline</label>
              <input className="input" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Full-stack developer" />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            {saved && <SuccessNote>Profile updated.</SuccessNote>}
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </>
        )}
      </form>

      <div className="mt-6 card p-5">
        <h2 className="flex items-center gap-2 text-sm font-medium text-mist-200">
          <Github size={16} /> GitHub connection
        </h2>
        <div className="mt-3">
          <StatusBanner
            state="CONFIGURATION_REQUIRED"
            detail="GitHub OAuth requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to be set on the server. Not connected."
          />
        </div>
      </div>
    </div>
  );
}
