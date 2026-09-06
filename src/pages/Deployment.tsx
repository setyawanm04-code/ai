import { ReactNode } from "react";
import { Rocket, Github } from "lucide-react";
import { StatusBanner } from "../components/StateComponents";

export default function Deployment() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 text-forge-500">
        <Rocket size={20} />
        <span className="text-xs font-medium uppercase tracking-wide">Deployment Center</span>
      </div>
      <h1 className="mt-2 font-display text-2xl text-mist-50">Deployment status</h1>
      <p className="mt-1 text-mist-400">
        This shows real deployment state once your project is connected to Vercel and GitHub —
        it never displays invented statuses.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatusCard title="Production" />
        <StatusCard title="Preview" />
        <StatusCard title="GitHub" icon={<Github size={16} />} />
        <StatusCard title="Last deployment" />
      </div>

      <div className="mt-8 card p-5">
        <h2 className="font-display text-lg text-mist-50">Connect deployment</h2>
        <p className="mt-2 text-sm text-mist-400">
          Deploying is intentionally kept outside this workspace's automatic control: connect your
          repository to Vercel directly (import the project at{" "}
          <span className="text-forge-400">vercel.com/new</span>), and set the environment variables
          from <code className="text-forge-400">.env.example</code> in the Vercel project settings.
          Once connected, this page can read real build and deployment status via the Vercel API.
        </p>
      </div>
    </div>
  );
}

function StatusCard({ title, icon }: { title: string; icon?: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-mist-50">
        {icon}
        {title}
      </div>
      <div className="mt-3">
        <StatusBanner state="CONFIGURATION_REQUIRED" detail="Not connected yet." />
      </div>
    </div>
  );
}
