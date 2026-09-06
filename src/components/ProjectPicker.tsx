import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { EmptyState } from "./StateComponents";

interface Project {
  id: string;
  name: string;
}

export default function ProjectPicker({ basePath }: { basePath?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const path = basePath ?? location.pathname;

  useEffect(() => {
    supabase
      .from("projects")
      .select("id, name")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setProjects(data ?? []);
        setLoading(false);
      });
  }, []);

  if (!loading && projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Create a project first, then come back here."
        action={<Link to="/app/projects" className="btn-primary">Go to Projects</Link>}
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {projects.map((p) => (
        <Link key={p.id} to={`${path}?project=${p.id}`} className="card p-4 text-sm text-mist-200 hover:border-forge-500/40">
          {p.name}
        </Link>
      ))}
    </div>
  );
}
