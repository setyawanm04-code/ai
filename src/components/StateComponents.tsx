import { ReactNode } from "react";
import clsx from "clsx";
import { AlertTriangle, Lock, Inbox, XCircle, CheckCircle2, HelpCircle } from "lucide-react";

/**
 * Every module in DEVFORGE AI must distinguish real states rather than
 * inventing results. See PROJECT_HEALTH / SECURITY_TRANSPARENCY in the spec.
 */
export type CapabilityState =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "CONFIGURATION_REQUIRED"
  | "PERMISSION_REQUIRED"
  | "FAILED"
  | "NOT_ENOUGH_DATA";

export function StatusBanner({ state, detail }: { state: CapabilityState; detail?: string }) {
  if (state === "AVAILABLE") return null;

  const map: Record<Exclude<CapabilityState, "AVAILABLE">, { icon: ReactNode; label: string; tone: string }> = {
    UNAVAILABLE: {
      icon: <XCircle size={16} />,
      label: "Unavailable in this deployment",
      tone: "border-mist-400/30 bg-mist-400/5 text-mist-300",
    },
    CONFIGURATION_REQUIRED: {
      icon: <AlertTriangle size={16} />,
      label: "Configuration required",
      tone: "border-signal-amber/30 bg-signal-amber/10 text-signal-amber",
    },
    PERMISSION_REQUIRED: {
      icon: <Lock size={16} />,
      label: "Permission required",
      tone: "border-signal-violet/30 bg-signal-violet/10 text-signal-violet",
    },
    FAILED: {
      icon: <XCircle size={16} />,
      label: "Request failed",
      tone: "border-signal-rose/30 bg-signal-rose/10 text-signal-rose",
    },
    NOT_ENOUGH_DATA: {
      icon: <HelpCircle size={16} />,
      label: "Not enough data",
      tone: "border-mist-400/30 bg-mist-400/5 text-mist-300",
    },
  };
  const cfg = map[state];

  return (
    <div className={clsx("flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm", cfg.tone)}>
      {cfg.icon}
      <div>
        <p className="font-medium">{cfg.label}</p>
        {detail && <p className="mt-0.5 text-mist-300/90">{detail}</p>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-600 py-16 px-6 text-center">
      <div className="mb-4 text-mist-400">{icon ?? <Inbox size={28} />}</div>
      <h3 className="font-display text-lg text-mist-50">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-mist-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SuccessNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-forge-500/30 bg-forge-500/10 px-3 py-2 text-sm text-forge-400">
      <CheckCircle2 size={16} />
      {children}
    </div>
  );
}
