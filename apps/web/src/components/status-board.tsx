"use client";

import { Copy, ExternalLink, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCallback } from "react";

export type StatusTone = "ready" | "error" | "warning" | "muted";

export type StatusItem = {
  label: string;
  value: string;
  tone: StatusTone;
  status?: React.ReactNode;
  hint?: string;
  href?: string;
  copyValue?: string;
  icon?: React.ReactNode;
};

const toneStyles: Record<StatusTone, string> = {
  ready: "text-bio-green drop-shadow-[0_0_3px_#39FF14]",
  error: "text-red-500 drop-shadow-[0_0_3px_#EF4444]",
  warning: "text-bio-gold drop-shadow-[0_0_3px_#D4AF37]",
  muted: "text-slate-600",
};

export function StatusBoard({ items }: { items: StatusItem[] }) {
  const handleCopy = useCallback((value?: string) => {
    if (!value) return;
    navigator.clipboard
      .writeText(value)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Copy failed"));
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 font-mono">
      <div className="mb-4 flex items-center gap-3 border-b border-bio-green/30 pb-3 text-sm text-bio-green/60">
        <Terminal size={16} />
        <span>STATUS</span>
      </div>
      {items.map((item) => (
        <div
          key={item.label}
          className="group relative border-l-4 border-l-bio-green/20 bg-black/40 px-5 py-3 transition-all hover:border-l-bio-green hover:bg-bio-green/5"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400 drop-shadow-[0_0_3px_rgba(148,163,184,0.6)]">
            <span className="font-bold">{item.label}</span>
            {item.href ? (
              <div className="flex items-center gap-2">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn("font-bold hover:underline", toneStyles[item.tone])}
                >
                  {item.status ??
                    `[${item.tone === "ready" ? "STABLE" : item.tone.toUpperCase()}]`}
                </a>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 transition hover:text-bio-green"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className={cn("font-bold", toneStyles[item.tone])}>
                  {item.status ??
                    `[${item.tone === "ready" ? "STABLE" : item.tone.toUpperCase()}]`}
                </span>
                {item.copyValue ? (
                  <button
                    type="button"
                    onClick={() => handleCopy(item.copyValue)}
                    className="text-slate-600 transition hover:text-bio-green"
                  >
                    <Copy size={14} />
                  </button>
                ) : null}
              </div>
            )}
          </div>
          {(item.value || item.icon) && (
            <div className="mt-2 flex items-center gap-3 text-sm font-bold tracking-wide text-bio-green drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">
              <span className="truncate">{item.value}</span>
              {item.icon}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
