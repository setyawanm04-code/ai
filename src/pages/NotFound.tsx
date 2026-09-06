import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center">
      <Flame size={24} className="text-forge-500" />
      <h1 className="mt-4 font-display text-3xl text-mist-50">404</h1>
      <p className="mt-2 text-mist-400">This page doesn't exist, or you don't have access to it.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
