import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Sparkles, Code2, Bug, ShieldCheck, FileText, Rocket, ClipboardList,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { StatusBanner } from "../../components/StateComponents";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  template: string;
}

const QUICK_ACTIONS = [
  { icon: Code2, label: "Continue Coding", to: (id: string) => `/app/code?project=${id}` },
  { icon: Bug, label: "Fix Bugs", to: (id: string) => `/app/bugs?project=${id}` },
  { icon: ShieldCheck, label: "Run Security Scan", to: (id: string) => `/app/security?project=${id}` },
  { icon: FileText, label: "Generate Documentation", to: (id: string) => `/app/docs?project=${id}` },
  { icon: Rocket, label: "Deploy", to: (id: string) => `/app/deployment?project=${id}` },
  { icon: ClipboardList, label: "Product Planner", to: (id: string) => `/app/planner?project=${id}` },
];

export default function ProjectOverview() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [counts, setCounts] = useState<{ tasks: number; bugs: number } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, status, template")
        .eq("id", projectId)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
        return;
      }
      setProject(data);
      const [tasksRes, bugsRes] = await Promise.all([
        supabase.from("tasks").select("id", { count: "exact", head: true }).eq("project_id", projectId),
        supabase.from("bugs").select("id", { count: "exact", head: true }).eq("project_id", projectId).neq("status", "closed"),
      ]);
      setCounts({ tasks: tasksRes.count ?? 0, bugs: bugsRes.count ?? 0 });
    })();
  }, [projectId]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <StatusBanner state="PERMISSION_REQUIRED" detail="This project doesn't exist, or you don't have access to it." />
      </div>
    );
  }

  if (!project) {
    return <div className="mx-auto max-w-6xl px-6 py-10 text-mist-400">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-mist-50">{project.name}</h1>
          <p className="mt-1 text-mist-400">{project.description || "No description yet."}</p>
        </div>
        <span className="rounded-full border border-ink-600 px-3 py-1 text-xs capitalize text-mist-300">
          {project.status}
        </span>
      </div>

      <div className="mt-6 flex gap-6 text-sm text-mist-300">
        <span><strong className="text-mist-50">{counts?.tasks ?? "—"}</strong> tasks</span>
        <span><strong className="text-mist-50">{counts?.bugs ?? "—"}</strong> open bugs</span>
        <span className="text-mist-500">Template: {project.template}</span>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-display text-lg text-mist-50">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              to={a.to(project.id)}
              className="card flex flex-col items-start gap-2 p-4 text-sm text-mist-200 transition hover:border-forge-500/40"
            >
              <a.icon size={18} className="text-forge-500" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 card p-5">
        <div className="flex items-center gap-2 text-sm text-mist-300">
          <Sparkles size={16} className="text-forge-500" />
          Ask AI about this project from the Code Studio chat panel — it has access to this project's
          files, rules, and memory.
        </div>
      </div>
    </div>
  );
}
