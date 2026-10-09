import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  SearchX,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { ShipmentStatus } from "@/lib/mock";

/* ---------- Status ---------- */

const STATUS_TONES: Record<ShipmentStatus, string> = {
  Confirmed: "bg-accent/10 text-accent",
  Documentation: "bg-cyan/10 text-cyan",
  Pickup: "bg-accent/10 text-accent",
  Customs: "bg-ink/8 text-mist",
  "Gate-in": "bg-cyan/10 text-cyan",
  "In Transit": "bg-cyan/10 text-cyan",
  Transshipment: "bg-cyan/10 text-cyan",
  Destination: "bg-ink/8 text-mist",
  Delivery: "bg-ink/8 text-mist",
  Completed: "bg-ok/10 text-ok",
  Exception: "bg-bad/10 text-bad",
};

export function StatusBadge({ status, className }: { status: ShipmentStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        STATUS_TONES[status],
        className,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function SevDot({ sev }: { sev: "critical" | "warning" | "info" }) {
  return (
    <span
      className={cn(
        "mt-1 h-2 w-2 shrink-0 rounded-full",
        sev === "critical" ? "bg-bad" : sev === "warning" ? "bg-warn" : "bg-accent",
      )}
      title={sev}
    />
  );
}

/* ---------- Count up ---------- */

export function useCountUp(target: number, run: boolean, duration = 900, decimals = 0) {
  const reduced = usePrefersReducedMotion();
  const [v, setV] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!run) return;
    if (reduced) {
      setV(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, reduced, duration]);

  return decimals > 0 ? v : Math.round(v);
}

/* ---------- Sparkline ---------- */

export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const w = 72;
  const h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((d, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((d - min) / range) * (h - 6)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-6 w-[72px]", className)} aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- KPI card ---------- */

export function KpiCard({
  label,
  value,
  suffix,
  prefix,
  sub,
  trend,
  icon,
  spark,
  tone = "default",
  decimals = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  sub?: string;
  trend?: "up" | "down";
  icon: ReactNode;
  spark?: number[];
  tone?: "default" | "warn" | "bad" | "ok";
  decimals?: number;
}) {
  const n = useCountUp(value, true, 900, decimals);
  const display = decimals > 0 ? n.toFixed(decimals) : String(n);
  return (
    <div className="group relative overflow-hidden rounded-xl border border-ink/8 bg-gradient-to-b from-white to-[#FBFDFF] p-4 shadow-[0_8px_24px_-12px_rgba(13,33,56,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(13,33,56,0.25)]">
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg",
            tone === "warn"
              ? "bg-warn/10 text-warn"
              : tone === "bad"
                ? "bg-bad/10 text-bad"
                : tone === "ok"
                  ? "bg-ok/10 text-ok"
                  : "bg-accent/10 text-accent",
          )}
        >
          {icon}
        </span>
        {spark && (
          <span className={tone === "warn" ? "text-warn/70" : tone === "bad" ? "text-bad/70" : "text-accent/60"}>
            <Sparkline data={spark} />
          </span>
        )}
      </div>
      <p className="mt-3 text-[26px] font-medium leading-none tracking-tight text-mist">
        {prefix}
        {display}
        {suffix}
      </p>
      <p className="mt-1.5 text-[12px] font-medium text-mute">{label}</p>
      {(sub || trend) && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-mute-2">
          {trend &&
            (trend === "up" ? (
              <ArrowUpRight size={12} className="text-ok" />
            ) : (
              <ArrowDownRight size={12} className="text-bad" />
            ))}
          {sub}
        </p>
      )}
    </div>
  );
}

/* ---------- Panel ---------- */

export function Panel({
  title,
  sub,
  action,
  children,
  className,
  bodyClass,
}: {
  title?: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClass?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-ink/8 bg-white shadow-[0_8px_24px_-14px_rgba(13,33,56,0.16)]",
        className,
      )}
    >
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-ink/6 px-4 py-3">
          <div>
            <h3 className="text-[13px] font-semibold tracking-tight text-mist">{title}</h3>
            {sub && <p className="mt-0.5 text-[11px] text-mute-2">{sub}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("flex-1", bodyClass ?? "p-4")}>{children}</div>
    </section>
  );
}

/* ---------- Mini charts ---------- */

export function StackBar({
  parts,
  className,
}: {
  parts: { label: string; value: number; cls: string }[];
  className?: string;
}) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  return (
    <div className={className}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-ink/6">
        {parts.map((p) => (
          <div
            key={p.label}
            className={cn("h-full transition-all duration-700", p.cls)}
            style={{ width: `${(p.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {parts.map((p) => (
          <span key={p.label} className="inline-flex items-center gap-1.5 text-[11px] text-mute">
            <span className={cn("h-1.5 w-1.5 rounded-full", p.cls)} />
            {p.label}
            <span className="font-medium text-mist">{p.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const DONUT_COLORS = ["#1C6FE8", "#0BA6D4", "#0E9F6E", "#B45309"];

export function Donut({
  parts,
  size = 116,
}: {
  parts: { label: string; value: number }[];
  size?: number;
}) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const r = 40;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }} role="img" aria-label="Mode mix">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#EEF2F6" strokeWidth="12" />
        {parts.map((p, i) => {
          const frac = p.value / total;
          const dash = frac * c;
          const el = (
            <circle
              key={p.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
              strokeWidth="12"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-acc * c + c / 4}
              strokeLinecap="butt"
            />
          );
          acc += frac;
          return el;
        })}
        <text x="50" y="47" textAnchor="middle" fontSize="15" fontWeight="600" fill="#10263D">
          {total}
        </text>
        <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#5C7086">
          ACTIVE
        </text>
      </svg>
      <ul className="space-y-1.5">
        {parts.map((p, i) => (
          <li key={p.label} className="flex items-center gap-2 text-[12px] text-mute">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            {p.label}
            <span className="font-medium text-mist">{p.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Funnel({ parts }: { parts: { label: string; value: number }[] }) {
  const max = Math.max(...parts.map((p) => p.value)) || 1;
  return (
    <div className="space-y-3">
      {parts.map((p, i) => (
        <div key={p.label}>
          <div className="mb-1 flex items-center justify-between text-[12px]">
            <span className="text-mute">{p.label}</span>
            <span className="font-medium text-mist">
              {p.value}
              {i > 0 && (
                <span className="ml-1.5 text-[10px] text-mute-2">
                  {Math.round((p.value / parts[i - 1].value) * 100)}%
                </span>
              )}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/6">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-2 transition-all duration-700"
              style={{ width: `${(p.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- States ---------- */

export function Skel({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-ink/8", className)} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skel className="h-3 w-28" />
          <Skel className="h-7 w-64" />
        </div>
        <Skel className="hidden h-9 w-64 sm:block" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skel key={i} className="h-[118px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skel className="h-[380px] rounded-xl xl:col-span-2" />
        <Skel className="h-[380px] rounded-xl" />
      </div>
      <Skel className="h-[320px] rounded-xl" />
    </div>
  );
}

export function EmptyState({
  title = "Nothing matches these filters.",
  desc,
  onClear,
}: {
  title?: string;
  desc?: string;
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink/5 text-mute-2">
        <SearchX size={20} />
      </span>
      <div>
        <p className="text-[14px] font-medium text-mist">{title}</p>
        {desc && <p className="mt-1 text-[12px] text-mute-2">{desc}</p>}
      </div>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-ink/12 px-3 py-1.5 text-[12px] font-medium text-mist transition hover:border-cyan/40"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-bad/10 text-bad">
        <AlertTriangle size={20} />
      </span>
      <div>
        <p className="text-[14px] font-medium text-mist">Unable to load shipment overview.</p>
        <p className="mt-1 text-[12px] text-mute-2">
          The network gateway did not respond. This is usually temporary.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-white transition hover:brightness-105"
      >
        <RotateCcw size={14} />
        Retry
      </button>
    </div>
  );
}

export function PositiveState({ title = "Everything looks on track." }: { title?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-ok/20 bg-ok/5 px-4 py-3">
      <span className="h-2 w-2 rounded-full bg-ok" />
      <p className="text-[12px] text-mist">{title}</p>
    </div>
  );
}

/* ---------- Misc ---------- */

export function SegTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg bg-ink/5 p-0.5">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[12px] font-medium transition",
            value === t.id ? "bg-white text-mist shadow-sm" : "text-mute hover:text-mist",
          )}
        >
          {t.label}
          {typeof t.count === "number" && (
            <span className={cn("ml-1.5", value === t.id ? "text-accent" : "text-mute-2")}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-ink/12 bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-mute-2">
      {children}
    </kbd>
  );
}
