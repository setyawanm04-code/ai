import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { FilePlus, Trash2, Send, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { askAI } from "../lib/ai";
import ProjectPicker from "../components/ProjectPicker";
import { StatusBanner } from "../components/StateComponents";

interface FileRow {
  id: string;
  path: string;
  content: string;
  language: string;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const MODES = ["BUILD", "DEBUG", "EXPLAIN", "REFACTOR", "REVIEW", "TEST"];

export default function CodeStudio() {
  const [params] = useSearchParams();
  const projectId = params.get("project");

  const [files, setFiles] = useState<FileRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const [mode, setMode] = useState("BUILD");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<{ message: string; code?: string } | null>(null);

  const activeFile = files.find((f) => f.id === activeId) ?? null;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function loadFiles(pid: string) {
    const { data } = await supabase
      .from("project_files")
      .select("id, path, content, language")
      .eq("project_id", pid)
      .order("path");
    setFiles(data ?? []);
    if (data && data.length > 0) setActiveId(data[0].id);
  }

  useEffect(() => {
    if (projectId) loadFiles(projectId);
  }, [projectId]);

  function updateContent(value: string | undefined) {
    if (!activeFile) return;
    setFiles((prev) => prev.map((f) => (f.id === activeFile.id ? { ...f, content: value ?? "" } : f)));
    setDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveActiveFile(value ?? ""), 800);
  }

  async function saveActiveFile(content: string) {
    if (!activeFile) return;
    setSaving(true);
    await supabase
      .from("project_files")
      .update({ content, size: content.length, updated_at: new Date().toISOString() })
      .eq("id", activeFile.id);
    setSaving(false);
    setDirty(false);
  }

  async function createFile() {
    if (!projectId) return;
    const path = prompt("New file path (e.g. src/components/Button.tsx)");
    if (!path) return;
    const cleanPath = path.replace(/^\/+/, "");
    if (cleanPath.includes("..")) {
      alert("Invalid path.");
      return;
    }
    const { data, error } = await supabase
      .from("project_files")
      .insert({ project_id: projectId, path: cleanPath, content: "", language: guessLanguage(cleanPath) })
      .select("id, path, content, language")
      .single();
    if (!error && data) {
      setFiles((prev) => [...prev, data].sort((a, b) => a.path.localeCompare(b.path)));
      setActiveId(data.id);
    }
  }

  async function deleteFile(id: string) {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    await supabase.from("project_files").delete().eq("id", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeId === id) setActiveId(null);
  }

  async function sendChat() {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChat((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setChatLoading(true);
    setChatError(null);
    try {
      const res = await askAI({
        message: userMsg,
        mode,
        projectId: projectId ?? undefined,
        files: activeFile ? [{ path: activeFile.path, content: activeFile.content }] : [],
      });
      setChat((prev) => [...prev, { role: "assistant", content: res.message }]);
    } catch (err: any) {
      setChatError({ message: err.message, code: err.code });
    } finally {
      setChatLoading(false);
    }
  }

  if (!projectId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl text-mist-50">Code Studio</h1>
        <p className="mt-1 mb-6 text-mist-400">Pick a project to open its files.</p>
        <ProjectPicker />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Explorer */}
      <div className="w-56 shrink-0 overflow-y-auto border-r border-ink-700 bg-ink-900/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-mist-400">Files</p>
          <button onClick={createFile} className="text-mist-400 hover:text-forge-400" aria-label="New file">
            <FilePlus size={15} />
          </button>
        </div>
        {files.length === 0 && <p className="mt-4 text-xs text-mist-500">No files yet. Create one to start.</p>}
        <ul className="space-y-0.5">
          {files.map((f) => (
            <li key={f.id} className="group flex items-center justify-between rounded px-1.5 py-1 hover:bg-ink-800">
              <button
                onClick={() => setActiveId(f.id)}
                className={`truncate text-left text-xs ${activeId === f.id ? "text-forge-400" : "text-mist-300"}`}
                title={f.path}
              >
                {f.path}
              </button>
              <button onClick={() => deleteFile(f.id)} className="hidden text-mist-500 hover:text-signal-rose group-hover:block">
                <Trash2 size={12} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2 text-xs text-mist-400">
          <span>{activeFile?.path ?? "No file open"}</span>
          <span>{saving ? "Saving…" : dirty ? "Unsaved changes" : activeFile ? "Saved" : ""}</span>
        </div>
        <div className="flex-1">
          {activeFile ? (
            <Editor
              height="100%"
              theme="vs-dark"
              path={activeFile.path}
              defaultLanguage={activeFile.language}
              value={activeFile.content}
              onChange={updateContent}
              options={{ fontSize: 13, minimap: { enabled: false }, automaticLayout: true }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-mist-500">
              Select or create a file to start editing.
            </div>
          )}
        </div>
      </div>

      {/* AI panel */}
      <div className="flex w-80 shrink-0 flex-col border-l border-ink-700 bg-ink-900/40">
        <div className="flex items-center justify-between border-b border-ink-700 px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wide text-mist-400">AI Assistant</span>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="rounded border border-ink-600 bg-ink-900 px-1.5 py-0.5 text-[11px] text-mist-300">
            {MODES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {chat.length === 0 && (
            <p className="text-xs text-mist-500">
              Ask about {activeFile ? `“${activeFile.path}”` : "this project"} — e.g. "explain this file" or "find bugs here".
            </p>
          )}
          {chat.map((m, i) => (
            <div key={i} className={`rounded-lg p-2.5 text-xs ${m.role === "user" ? "bg-ink-800 text-mist-100" : "bg-forge-500/10 text-mist-200"}`}>
              <p className="mb-1 font-medium text-mist-400">{m.role === "user" ? "You" : "AI"}</p>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}
          {chatLoading && (
            <div className="flex items-center gap-2 text-xs text-mist-400">
              <Loader2 size={12} className="animate-spin" /> Thinking…
            </div>
          )}
          {chatError && (
            <StatusBanner
              state={chatError.code === "CONFIGURATION_REQUIRED" ? "CONFIGURATION_REQUIRED" : "FAILED"}
              detail={chatError.message}
            />
          )}
        </div>
        <div className="border-t border-ink-700 p-2.5">
          <div className="flex items-center gap-2">
            <input
              className="input !py-2 text-xs"
              placeholder="Ask the AI assistant…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
            />
            <button onClick={sendChat} disabled={chatLoading} className="btn-primary !px-2.5 !py-2">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function guessLanguage(path: string): string {
  const ext = path.split(".").pop() ?? "";
  const map: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
    css: "css", html: "html", json: "json", md: "markdown", sql: "sql", py: "python",
  };
  return map[ext] ?? "plaintext";
}
