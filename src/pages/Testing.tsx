import { FlaskConical } from "lucide-react";
import { StatusBanner } from "../components/StateComponents";

export default function Testing() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 text-forge-500">
        <FlaskConical size={20} />
        <span className="text-xs font-medium uppercase tracking-wide">Testing Center</span>
      </div>
      <h1 className="mt-2 font-display text-2xl text-mist-50">Test results, never fabricated</h1>
      <p className="mt-1 text-mist-400">
        DEVFORGE AI's core stack runs on Vercel Serverless Functions, which are not a persistent
        execution environment for arbitrary test suites.
      </p>

      <div className="mt-6">
        <StatusBanner
          state="UNAVAILABLE"
          detail="Runtime execution is unavailable in this deployment environment. Code and tests can still be generated and reviewed, but they cannot be run here. Connect an optional sandbox execution provider to enable real pass/fail results, or run `npm test` locally / in CI."
        />
      </div>

      <div className="mt-8 card p-5">
        <h2 className="font-display text-lg text-mist-50">What is available right now</h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-mist-300">
          <li>AI-generated unit, integration, and E2E test cases for a file or feature (via the Code Studio chat, TEST mode)</li>
          <li>Static code review for likely bugs, missing edge cases, and untested branches</li>
          <li>A place to record real coverage numbers once you run tests locally or in CI, so the rest of the workspace can reference them honestly</li>
        </ul>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="font-display text-lg text-mist-50">Wiring up real execution (optional)</h2>
        <p className="mt-2 text-sm text-mist-400">
          To get real ✓/✕ results instead of generated test code, add a sandbox execution provider
          (e.g. a containerized runner reachable over HTTP) and implement{" "}
          <code className="text-forge-400">SandboxExecutionProvider</code> in place of{" "}
          <code className="text-forge-400">UnavailableExecutionProvider</code>. This is optional —
          the rest of DEVFORGE AI works without it.
        </p>
      </div>
    </div>
  );
}
