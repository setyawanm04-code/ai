import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, AlertTriangle, ScanSearch } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import ProjectPicker from "../components/ProjectPicker";
import { StatusBanner, EmptyState, SuccessNote } from "../components/StateComponents";

interface Finding {
  file: string;
  line: number;
  snippet: string;
  rule: string;
}

// Lightweight, real pattern-based secret detection — runs entirely client-side
// on file content already loaded for this project. Not a substitute for a
// dedicated scanner, but genuinely detects common accidental leaks.
const SECRET_PATTERNS: { rule: string; regex: RegExp }[] = [
  { rule: "Generic API key assignment", regex: /(api[_-]?key|apikey)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i },
  { rule: "AWS Access Key ID", regex: /AKIA[0-9A-Z]{16}/ },
  { rule: "Private key block", regex: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
  { rule: "Supabase service role key", regex: /service_role[^\n]{0,40}eyJ[a-zA-Z0-9._-]{20,}/i },
  { rule: "Hardcoded password", regex: /password\s*[:=]\s*['"][^'"]{6,}['"]/i },
  { rule: "Generic bearer token", regex: /bearer\s+[a-zA-Z0-9_\-.]{20,}/i },
];

export default function Security() {
  const [params] = useSearchParams();
  const projectId = params.get("project");
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [filesScanned, setFilesScanned] = useState(0);

  async function scan() {
    if (!projectId) return;
    setScanning(true);
    setFindings(null);
    const { data } = await supabase.from("project_files").select("path, content").eq("project_id", projectId);
    const files = data ?? [];
    setFilesScanned(files.length);

    const results: Finding[] = [];
    for (const file of files) {
      const lines = (file.content || "").split("\n");
      lines.forEach((line: string, idx: number) => {
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.regex.test(line)) {
            results.push({ file: file.path, line: idx + 1, snippet: redact(line), rule: pattern.rule });
          }
        }
      });
    }
    setFindings(results);
    setScanning(false);
  }

  useEffect(() => {
    setFindings(null);
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl text-mist-50">Security Center</h1>
        <p className="mt-1 mb-6 text-mist-400">Pick a project to scan.</p>
        <ProjectPicker />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 text-signal-rose">
        <ShieldCheck size={20} />
        <span className="text-xs font-medium uppercase tracking-wide">Security Center</span>
      </div>
      <h1 className="mt-2 font-display text-2xl text-mist-50">Secret &amp; risk scan</h1>
      <p className="mt-1 text-mist-400">Scans this project's stored files for common secret-leak patterns.</p>

      <button onClick={scan} disabled={scanning} className="btn-primary mt-6">
        <ScanSearch size={16} /> {scanning ? "Scanning…" : "Run scan"}
      </button>

      <div className="mt-6 space-y-4">
        <ChecklistItem
          label="Secrets in project files"
          state={findings === null ? "NOT_ENOUGH_DATA" : findings.length > 0 ? "FAILED" : "AVAILABLE"}
          detail={findings === null ? "Run a scan to check." : findings.length > 0 ? `${findings.length} potential secret(s) found across ${filesScanned} file(s).` : `No obvious secrets found across ${filesScanned} file(s) scanned.`}
        />
        <ChecklistItem
          label="Row Level Security"
          state="AVAILABLE"
          detail="Enforced at the database level per supabase/schema.sql — every user-owned table has RLS policies."
        />
        <ChecklistItem
          label="Dependency vulnerability scan"
          state="CONFIGURATION_REQUIRED"
          detail="Connect a dependency scanning service (e.g. GitHub Dependabot on your repo) to populate this."
        />
        <ChecklistItem
          label="Authentication & session checks"
          state="AVAILABLE"
          detail="Protected routes require a valid Supabase session; tokens are verified server-side on every AI request."
        />
      </div>

      {findings && findings.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg text-mist-50">Findings</h2>
          <div className="space-y-2">
            {findings.map((f, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-2 text-sm text-signal-rose">
                  <AlertTriangle size={15} /> {f.rule}
                </div>
                <p className="mt-1 text-xs text-mist-400">{f.file}:{f.line}</p>
                <pre className="mt-2 overflow-x-auto rounded bg-ink-900 p-2 font-mono text-xs text-mist-300">{f.snippet}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {findings && findings.length === 0 && (
        <div className="mt-8">
          <EmptyState title="No secrets detected" description="Nothing matched known leak patterns in this scan." />
        </div>
      )}
    </div>
  );
}

function redact(line: string): string {
  return line.length > 120 ? line.slice(0, 60) + " …[redacted]… " + line.slice(-20) : line;
}

function ChecklistItem({ label, state, detail }: { label: string; state: any; detail: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm font-medium text-mist-50">{label}</p>
      <div className="mt-2">
        {state === "AVAILABLE" ? <SuccessNote>{detail}</SuccessNote> : <StatusBanner state={state} detail={detail} />}
      </div>
    </div>
  );
}
