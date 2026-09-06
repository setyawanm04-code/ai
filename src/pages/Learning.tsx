import { useState } from "react";
import { GraduationCap, Sparkles } from "lucide-react";
import { askAI } from "../lib/ai";
import { StatusBanner } from "../components/StateComponents";

const CATEGORIES = ["HTML", "CSS", "JavaScript", "TypeScript", "React", "PHP", "Laravel", "Flutter", "SQL", "Git", "API", "UI/UX"];

export default function Learning() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [question, setQuestion] = useState("");
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await askAI({
        message: `Category: ${category}. ${beginnerMode ? "Explain like I'm a complete beginner, using simple language and a small concrete example." : "Give a clear, technically precise explanation."} Question: ${question}`,
        mode: "EXPLAIN",
      });
      setAnswer(res.message);
    } catch (err: any) {
      setError({ message: err.message, code: err.code });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 text-signal-violet">
        <GraduationCap size={20} />
        <span className="text-xs font-medium uppercase tracking-wide">Learning Center</span>
      </div>
      <h1 className="mt-2 font-display text-2xl text-mist-50">Ask, and actually understand</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`rounded-full border px-3 py-1.5 text-xs ${category === c ? "border-forge-500 text-forge-400" : "border-ink-600 text-mist-400"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 card p-5 space-y-4">
        <textarea className="input min-h-20" placeholder="What do you want explained?" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-mist-300">
          <input type="checkbox" checked={beginnerMode} onChange={(e) => setBeginnerMode(e.target.checked)} className="accent-forge-500" />
          Explain Like I'm a Beginner
        </label>
        <div className="flex justify-end">
          <button onClick={ask} disabled={loading || !question.trim()} className="btn-primary">
            <Sparkles size={16} /> {loading ? "Thinking…" : "Ask"}
          </button>
        </div>
      </div>

      {error && <div className="mt-4"><StatusBanner state={error.code === "CONFIGURATION_REQUIRED" ? "CONFIGURATION_REQUIRED" : "FAILED"} detail={error.message} /></div>}

      {answer && (
        <div className="mt-6 card p-5 animate-rise">
          <pre className="whitespace-pre-wrap font-sans text-sm text-mist-200">{answer}</pre>
        </div>
      )}
    </div>
  );
}
