import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const location = useLocation();

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950 px-6">
        <div className="card max-w-md p-8 text-center animate-rise">
          <p className="text-xs font-medium uppercase tracking-wide text-signal-amber mb-3">
            Configuration required
          </p>
          <h1 className="font-display text-xl text-mist-50 mb-2">Supabase isn't connected yet</h1>
          <p className="text-sm text-mist-300">
            Set <code className="text-forge-400">VITE_SUPABASE_URL</code> and{" "}
            <code className="text-forge-400">VITE_SUPABASE_ANON_KEY</code> in your environment
            to enable accounts and data.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="h-8 w-8 rounded-full border-2 border-forge-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
