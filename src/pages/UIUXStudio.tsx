import { useState } from "react";
import { Palette, Sparkles } from "lucide-react";
import { askAI } from "../lib/ai";
import { StatusBanner } from "../components/StateComponents";

const STYLES = ["Modern", "Minimal", "Professional", "Dark", "Glassmorphism", "SaaS", "Material", "Custom"];

export default function UIUXStudio() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await askAI({
        message: `Design a sitemap and screen-by-screen user flow for: "${prompt}". Visual style: ${style}. Present it as an indented text outline (Login → Dashboard → sub-screens), followed by a short list of core UI components needed and a suggested color/typography direction for a ${style} aesthetic.`,
        mode: "UIUX",
      });
      setOutput(res.message);
    } catch (err: any) {
      setError({ message: err.message, code: err.code });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 text-signal-violet">
        <Palette size={20} />
        <span className="text-xs font-medium uppercase tracking-wide">UI/UX Studio</span>
      </div>
      <h1 className="mt-2 font-display text-2xl text-mist-50">Plan screens before you build them</h1>
      <p className="mt-1 text-mist-400">Describe the product; get a sitemap, user flow, and a starting design direction.</p>

      <div className="mt-6 card p-5 space-y-4">
        <textarea
          className="input min-h-24"
          placeholder='e.g. "A modern dashboard for a school management system."'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`rounded-full border px-3 py-1.5 text-xs ${style === s ? "border-forge-500 text-forge-400" : "border-ink-600 text-mist-400"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={generate} disabled={loading || !prompt.trim()} className="btn-primary">
            <Sparkles size={16} /> {loading ? "Designing…" : "Generate flow"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <StatusBanner state={error.code === "CONFIGURATION_REQUIRED" ? "CONFIGURATION_REQUIRED" : "FAILED"} detail={error.message} />
        </div>
      )}

      {output && (
        <div className="mt-6 card p-5 animate-rise">
          <pre className="whitespace-pre-wrap font-sans text-sm text-mist-200">{output}</pre>
        </div>
      )}
    </div>
  );
}
