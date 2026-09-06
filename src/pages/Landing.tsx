import { Link } from "react-router-dom";
import {
  Flame, Lightbulb, ClipboardList, Palette, KanbanSquare, FlaskConical,
  ShieldCheck, FileText, Rocket, Briefcase, GraduationCap, ArrowRight,
  Github, Database,
} from "lucide-react";

const PIPELINE = [
  "Think", "Plan", "Design", "Build", "Debug", "Test", "Secure", "Document", "Deploy", "Showcase",
];

const FEATURES = [
  { icon: Lightbulb, title: "Idea Lab", copy: "Turn a one-line idea into personas, an MVP scope, and a roadmap." },
  { icon: ClipboardList, title: "Product Planner", copy: "Features, user stories, and acceptance criteria in one workspace." },
  { icon: Palette, title: "UI/UX Studio", copy: "Sitemaps, user flows, and a design system before a line of code exists." },
  { icon: KanbanSquare, title: "Project Management", copy: "A Kanban board that understands your codebase, not just your tickets." },
  { icon: FlaskConical, title: "Testing", copy: "Generate real test cases and read honest pass/fail results — never fabricated." },
  { icon: ShieldCheck, title: "Security", copy: "Secret scanning, RLS checks, and dependency review before you ship." },
  { icon: FileText, title: "Documentation", copy: "README, API docs, and architecture notes generated from your actual project." },
  { icon: Rocket, title: "Deployment", copy: "One dashboard for build status, environments, and release history." },
  { icon: Briefcase, title: "Portfolio", copy: "Turn finished projects into a public showcase, automatically." },
  { icon: GraduationCap, title: "Learning", copy: "Ask the same AI that built your project to explain how it works." },
];

const STATS = [
  { value: "13", label: "connected workspaces, one context" },
  { value: "0", label: "API keys ever sent to your browser" },
  { value: "$0", label: "required infra to run the core stack" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-950">
      <SiteHeader />
      <Hero />
      <Pipeline />
      <Features />
      <Stats />
      <StackSection />
      <Testimonials />
      <ClosingCTA />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-800/80 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-forge-500" />
          <span className="font-display text-base tracking-tight text-mist-50">DEVFORGE AI</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-mist-300 md:flex">
          <a href="#pipeline" className="hover:text-mist-50">Workflow</a>
          <a href="#features" className="hover:text-mist-50">Features</a>
          <a href="#stack" className="hover:text-mist-50">Stack</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-mist-300 hover:text-mist-50">Sign in</Link>
          <Link to="/signup" className="btn-primary !px-4 !py-2 text-sm">Start Building</Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-20 md:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #2FD495 0%, transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-600 px-3.5 py-1.5 text-xs text-mist-300">
          <span className="h-1.5 w-1.5 rounded-full bg-forge-500" />
          An engineering workspace, not another chat window
        </p>
        <h1 className="font-display text-5xl leading-[1.05] text-mist-50 md:text-7xl">
          Build. Debug. Ship.
          <br />
          With AI.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist-300">
          Your AI-powered software engineering and product development workspace —
          from a rough idea to a documented, deployed, portfolio-ready project.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup" className="btn-primary shadow-forge">
            Start Building <ArrowRight size={16} />
          </Link>
          <a href="#features" className="btn-secondary">
            Explore Features
          </a>
        </div>
      </div>

      <HeroMockup />
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl animate-rise">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-ink-700 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-signal-rose/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-signal-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-forge-500/70" />
          <span className="ml-3 text-xs text-mist-400">devforge.ai/app/projects/cashier-pos</span>
        </div>
        <div className="grid grid-cols-1 gap-px bg-ink-700 md:grid-cols-3">
          <div className="col-span-1 bg-ink-900 p-4 text-xs text-mist-400">
            <p className="mb-2 font-medium text-mist-200">Explorer</p>
            <ul className="space-y-1.5 font-mono">
              <li className="text-forge-400">src/</li>
              <li className="pl-3">AuthContext.tsx</li>
              <li className="pl-3">Checkout.tsx</li>
              <li>supabase/</li>
              <li className="pl-3">schema.sql</li>
            </ul>
          </div>
          <div className="col-span-1 bg-ink-950 p-4 font-mono text-xs text-mist-300 md:col-span-1">
            <p className="text-signal-violet">function</p>
            <p><span className="text-forge-400">applyDiscount</span>(total, code) &#123;</p>
            <p className="pl-3 text-mist-400">// AI: validates code server-side</p>
            <p className="pl-3">return total * rate;</p>
            <p>&#125;</p>
          </div>
          <div className="col-span-1 bg-ink-900 p-4 text-xs">
            <p className="mb-2 font-medium text-mist-200">AI Assistant · BUILD</p>
            <p className="text-mist-400">
              Found 2 places computing totals inline. Extracting to a shared{" "}
              <code className="text-forge-400">pricing.ts</code> module and adding tests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pipeline() {
  return (
    <section id="pipeline" className="border-y border-ink-800 bg-ink-900/40 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl text-mist-50">One path, from idea to production</h2>
        <p className="mt-2 max-w-lg text-mist-400">
          Every module in DEVFORGE AI shares the same project context, so nothing gets re-explained twice.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-4">
          {PIPELINE.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-ink-600 bg-ink-800 px-4 py-2 text-sm text-mist-100">
                {step}
              </span>
              {i < PIPELINE.length - 1 && <span className="text-ink-500">—</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl text-mist-50">Everything a build needs, connected</h2>
        <p className="mt-2 max-w-xl text-mist-400">
          Not a code editor bolted onto a chatbot — a workspace where product, design, and engineering share one brain.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <f.icon size={20} className="text-forge-500" strokeWidth={1.7} />
              <h3 className="mt-4 font-medium text-mist-50">{f.title}</h3>
              <p className="mt-1.5 text-sm text-mist-400">{f.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-ink-800 bg-ink-900/40 px-6 py-16">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 text-center sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="font-display text-4xl text-forge-400">{s.value}</p>
            <p className="mt-2 text-sm text-mist-400">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StackSection() {
  return (
    <section id="stack" className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-display text-3xl text-mist-50">Built on a stack you can actually run</h2>
        <p className="mt-2 text-mist-400">
          The core workspace runs on free tiers: React and Vite in the browser, Vercel functions on the
          server, Supabase for data and auth, and Gemini for AI — no VPS, no mandatory paid services.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {["React", "Vite", "TypeScript", "Tailwind CSS", "Vercel Functions", "Supabase", "Gemini API", "GitHub"].map((t) => (
            <span key={t} className="rounded-full border border-ink-600 px-4 py-2 text-sm text-mist-200">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm text-mist-400">
          <Github size={15} /> Repository-first workflow
          <span className="mx-2 text-ink-600">·</span>
          <Database size={15} /> Row Level Security on every table
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { name: "Product-minded developer", role: "Solo builder", quote: "I stopped losing the thread between what I planned and what I actually shipped." },
    { name: "Bootcamp graduate", role: "Portfolio project", quote: "Having the roadmap, the code, and the docs in one place made my final project easy to defend." },
    { name: "Small team lead", role: "Internal tool", quote: "The security center caught an exposed key before it ever reached a commit." },
  ];
  return (
    <section className="border-y border-ink-800 bg-ink-900/40 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl text-mist-50">What builders are figuring out</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {quotes.map((q) => (
            <blockquote key={q.name} className="card p-6">
              <p className="text-mist-200">"{q.quote}"</p>
              <footer className="mt-4 text-sm text-mist-400">
                {q.name} · {q.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="px-6 py-24 text-center">
      <h2 className="font-display text-3xl text-mist-50 md:text-4xl">
        From idea to production, built around you.
      </h2>
      <div className="mt-8">
        <Link to="/signup" className="btn-primary shadow-forge">
          Start Building <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-ink-800 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-mist-400 sm:flex-row">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-forge-500" />
          DEVFORGE AI
        </div>
        <p>Build. Debug. Ship. With AI.</p>
      </div>
    </footer>
  );
}
