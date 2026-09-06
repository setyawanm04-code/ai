import { useState } from "react";
import { FileText, Sparkles, Copy, Check } from "lucide-react";
import { askAI } from "../lib/ai";
import { useSearchParams } from "react-router-dom";
import ProjectPicker from "../components/ProjectPicker";
import { StatusBanner } from "../components/StateComponents";

const DOC_TYPES = ["README", "Installation guide", "API documentation", "Architecture documentation", "User guide", "Changelog"];

export default function Documentation() {
  const [params] = useSearchParams();
  const projectId = params.get("project");
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await askAI({
        message: `Write a ${docType} in Markdown for this project. Project context (from the user, may be partial):\n${context || "(no additional context provided)"}\n\nKeep it concrete and usable — avoid generic filler.`,
        mode: "DOCUMENTATION",
        projectId: projectId ?? undefined,
      });
      setOutput(res.message);
    } catch (err: any) {
      setError({ message: err.message, code: err.code });
    } finally {
      setLoading(false);
    }
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 text-forge-500">
        <FileText size={20} />
        <span className="text-xs font-medium uppercase tracking-wide">Documentation Center</span>
      </div>
      <h1 className="mt-2 font-display text-2xl text-mist-50">Generate real documentation</h1>

      {!projectId && (
        <div className="mt-4">
          <StatusBanner state="NOT_ENOUGH_DATA" detail="No project selected — you can still generate generic documentation below, but it will be more useful once tied to a project." />
          <div className="mt-4"><ProjectPicker /></div>
        </div>
      )}

      <div className="mt-6 card p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {DOC_TYPES.map((t) => (
            <button key={t} onClick={() => setDocType(t)} className={`rounded-full border px-3 py-1.5 text-xs ${docType === t ? "border-forge-500 text-forge-400" : "border-ink-600 text-mist-400"}`}>
              {t}
            </button>
          ))}
        </div>
        <textarea
          className="input min-h-24"
          placeholder="Optional: paste relevant context (tech stack, key files, endpoints)…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
        <div className="flex justify-end">
          <button onClick={generate} disabled={loading} className="btn-primary">
            <Sparkles size={16} /> {loading ? "Writing…" : `Generate ${docType}`}
          </button>
        </div>
      </div>

      {error && <div className="mt-4"><StatusBanner state={error.code === "CONFIGURATION_REQUIRED" ? "CONFIGURATION_REQUIRED" : "FAILED"} detail={error.message} /></div>}

      {output && (
        <div className="mt-6 card p-5 animate-rise">
          <div className="mb-3 flex justify-end">
            <button onClick={copyOutput} className="btn-secondary !px-3 !py-1.5 text-xs">
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs text-mist-200">{output}</pre>
        </div>
      )}
    </div>
  );
}
