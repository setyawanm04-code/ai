import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  LayoutGrid, Lightbulb, ClipboardList, Palette, KanbanSquare, Bug, Code2,
  FlaskConical, Database, ShieldCheck, FileText, Rocket, Briefcase,
  GraduationCap, Search, Bell, Settings, LogOut, Command, Flame,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const NAV = [
  { to: "/app", label: "Home", icon: LayoutGrid, end: true },
  { to: "/app/projects", label: "Projects", icon: Briefcase },
  { to: "/app/idea-lab", label: "Idea Lab", icon: Lightbulb },
  { to: "/app/planner", label: "Product Planner", icon: ClipboardList },
  { to: "/app/uiux", label: "UI/UX Studio", icon: Palette },
  { to: "/app/tasks", label: "Tasks", icon: KanbanSquare },
  { to: "/app/bugs", label: "Bugs", icon: Bug },
  { to: "/app/code", label: "Code Studio", icon: Code2 },
  { to: "/app/testing", label: "Testing", icon: FlaskConical },
  { to: "/app/database", label: "Database", icon: Database },
  { to: "/app/security", label: "Security", icon: ShieldCheck },
  { to: "/app/docs", label: "Documentation", icon: FileText },
  { to: "/app/deployment", label: "Deployment", icon: Rocket },
  { to: "/app/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/app/learning", label: "Learning", icon: GraduationCap },
];

export default function Shell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen bg-ink-950 text-mist-50">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-700 bg-ink-900/60 md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <Flame size={20} className="text-forge-500" />
          <span className="font-display text-base tracking-tight">DEVFORGE AI</span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-forge-500/10 text-forge-400"
                    : "text-mist-300 hover:bg-ink-800 hover:text-mist-50"
                )
              }
            >
              <item.icon size={17} strokeWidth={1.8} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-700 p-3">
          <button
            onClick={() => navigate("/app/settings")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-mist-300 hover:bg-ink-800 hover:text-mist-50"
          >
            <Settings size={17} strokeWidth={1.8} />
            Settings
          </button>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-mist-300 hover:bg-ink-800 hover:text-signal-rose"
          >
            <LogOut size={17} strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-ink-700 bg-ink-950/80 px-5 py-3 backdrop-blur">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 rounded-full border border-ink-600 px-3.5 py-1.5 text-sm text-mist-400 hover:border-mist-300"
          >
            <Search size={14} />
            Search or jump to…
            <kbd className="ml-2 flex items-center gap-0.5 rounded border border-ink-600 px-1.5 py-0.5 text-[10px] text-mist-400">
              <Command size={10} />K
            </kbd>
          </button>
          <div className="flex items-center gap-4">
            <button className="relative text-mist-300 hover:text-mist-50" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forge-500/20 text-xs font-semibold text-forge-400">
                {(user?.email ?? "U")[0].toUpperCase()}
              </div>
              <span className="hidden text-mist-300 sm:inline">{user?.email}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const filtered = NAV.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/70 pt-32 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-ink-600 bg-ink-900 shadow-2xl animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-ink-700 px-4 py-3">
          <Search size={16} className="text-mist-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a workspace section…"
            className="w-full bg-transparent text-sm text-mist-50 placeholder:text-mist-400 focus:outline-none"
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-mist-400">No matches.</p>
          )}
          {filtered.map((item) => (
            <button
              key={item.to}
              onClick={() => {
                navigate(item.to);
                onClose();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-mist-200 hover:bg-ink-800"
            >
              <item.icon size={16} className="text-mist-400" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
