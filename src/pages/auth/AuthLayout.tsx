import { ReactNode } from "react";
import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
      <div className="w-full max-w-sm animate-rise">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <Flame size={20} className="text-forge-500" />
          <span className="font-display text-base text-mist-50">DEVFORGE AI</span>
        </Link>
        <div className="card p-8">
          <h1 className="font-display text-xl text-mist-50">{title}</h1>
          <p className="mt-1 text-sm text-mist-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
