import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, KanbanSquare, Bug, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { EmptyState } from "../components/StateComponents";

interface Stats {
  projects: number;
  activeProjects: number;
  tasks: number;
  openBugs: number;
  aiRequests: number;
}

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const [projectsRes, tasksRes, bugsRes, aiRes] = await Promise.all([
        supabase.from("projects").select("id, name, status, updated_at").eq("owner_id", user!.id).order("updated_at", { ascending: false }),
        supabase.from("tasks").select("id", { count: "exact", head: true }),
        supabase.from("bugs").select("id", { count: "exact", head: true }).neq("status", "closed"),
        supabase.from("ai_requests").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);

      if (cancelled) return;

      const projectRows = projectsRes.data ?? [];
      setProjects(projectRows.slice(0, 5));
      setStats({
        projects: projectRows.length,
        activeProjects: projectRows.filter((p) => p.status === "active").length,
        tasks: tasksRes.count ?? 0,
        openBugs: bugsRes.count ?? 0,
        aiRequests: aiRes.count ?? 0,
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const greeting = getGreeting();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl text-mist-50">{greeting} 👋</h1>
      <p className="mt-1 text-mist-400">Here's where your workspace stands.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Briefcase} label="Projects" value={stats?.projects} loading={loading} />
        <StatCard icon={KanbanSquare} label="Tasks" value={stats?.tasks} loading={loading} />
        <StatCard icon={Bug} label="Open bugs" value={stats?.openBugs} loading={loading} />
        <StatCard icon={Sparkles} label="AI requests" value={stats?.aiRequests} loading={loading} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg text-mist-50">Continue working</h2>
            <Link to="/app/projects" className="text-sm text-forge-400 hover:underline">View all</Link>
          </div>

          {!loading && projects.length === 0 && (
            <EmptyState
              title="No projects yet"
              description="Start in the Idea Lab, or create a project directly to begin."
              action={
                <Link to="/app/idea-lab" className="btn-primary">
                  Go to Idea Lab <ArrowRight size={15} />
                </Link>
              }
            />
          )}

          <div className="space-y-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/app/projects/${p.id}`}
                className="card flex items-center justify-between p-4 transition hover:border-forge-500/40"
              >
                <div>
                  <p className="font-medium text-mist-50">{p.name}</p>
                  <p className="text-xs text-mist-400">
                    Updated {new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full border border-ink-600 px-2.5 py-1 text-xs capitalize text-mist-300">
                  {p.status}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg text-mist-50">AI recommendation</h2>
          <div className="card p-5">
            {stats?.openBugs ? (
              <p className="text-sm text-mist-300">
                You have <strong className="text-mist-50">{stats.openBugs}</strong> open bug
                {stats.openBugs === 1 ? "" : "s"}. Want the Debug Center to take a first pass?
              </p>
            ) : (
              <p className="text-sm text-mist-400">
                No open bugs right now — nothing urgent to recommend.
              </p>
            )}
            <Link to="/app/bugs" className="mt-4 inline-flex text-sm text-forge-400 hover:underline">
              Open Bug Tracker →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Briefcase;
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <div className="card p-5">
      <Icon size={18} className="text-forge-500" />
      <p className="mt-3 text-2xl font-semibold text-mist-50">
        {loading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-ink-700" /> : value ?? 0}
      </p>
      <p className="mt-0.5 text-xs text-mist-400">{label}</p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
