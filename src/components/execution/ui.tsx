import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  Clock,
  Plane,
  Ship,
  TrainFront,
  Truck,
} from "lucide-react";
import { cn } from "@/utils/cn";
import {
  delayLabel,
  fmtDT,
  isPastDue,
  msEffectiveStatus,
  shipProgress,
  nextMilestone,
  type ExcSeverity,
  type ExceptionX,
  type ExecShipment,
  type ExecStage,
  type Leg,
  type LegMode,
  type LegStatus,
  type MilestoneX,
} from "@/lib/execution";

/* ---------- Mode ---------- */

const MODE_ICON: Record<LegMode, React.ElementType> = {
  Road: Truck,
  Ocean: Ship,
  Air: Plane,
  Rail: TrainFront,
};

export function ModeIcon({ mode, size = 14, className }: { mode: LegMode; size?: number; className?: string }) {
  const I = MODE_ICON[mode];
  return <I size={size} className={className} aria-label={mode} />;
}

/* ---------- Badges ---------- */

const STAGE_TONE: Record<string, string> = {
  "In Transit": "bg-cyan/10 text-cyan",
  Transshipment: "bg-cyan/10 text-cyan",
  Pickup: "bg-accent/10 text-accent",
  "Gate-In": "bg-accent/10 text-accent",
  Documentation: "bg-accent/10 text-accent",
  Customs: "bg-warn/10 text-warn",
  Destination: "bg-ink/8 text-mist",
  Delivery: "bg-ink/8 text-mist",
  Completed: "bg-ok/10 text-ok",
  Cancelled: "bg-bad/10 text-bad",
};

export function StageBadge({ stage, exception }: { stage: ExecStage; exception?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium", STAGE_TONE[stage] ?? "bg-accent/10 text-accent")}>
        <span className="h-1 w-1 rounded-full bg-current" />
        {stage}
      </span>
      {exception && (
        <span className="inline-flex items-center gap-1 rounded-full bg-bad/10 px-2 py-0.5 text-[10.5px] font-medium text-bad">
          <AlertTriangle size={10} /> Exception
        </span>
      )}
    </span>
  );
}

const LEG_TONE: Record<LegStatus, string> = {
  Planned: "bg-ink/6 text-mute",
  Ready: "bg-accent/10 text-accent",
  "In Progress": "bg-cyan/10 text-cyan",
  Completed: "bg-ok/10 text-ok",
  Delayed: "bg-warn/10 text-warn",
  Exception: "bg-bad/10 text-bad",
  Cancelled: "bg-ink/6 text-mute-2",
};

export function LegBadge({ status }: { status: LegStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-medium", LEG_TONE[status])}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}

export const SEV_TONE: Record<ExcSeverity, string> = {
  Low: "bg-ink/6 text-mute",
  Medium: "bg-accent/10 text-accent",
  High: "bg-warn/10 text-warn",
  Critical: "bg-bad/10 text-bad",
};

export function SevBadge({ sev }: { sev: ExcSeverity }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium", SEV_TONE[sev])}>
      <AlertTriangle size={10} />
      {sev}
    </span>
  );
}

/* ---------- Planned vs actual ---------- */

export function PlannedActual({
  label,
  planned,
  actual,
}: {
  label: string;
  planned: string;
  actual?: string;
}) {
  const late = isPastDue(planned, actual);
  return (
    <div>
      <p className="text-[10.5px] text-mute-2">{label}</p>
      <p className="text-[12.5px] text-mist">
        <span className="text-mute">Plan</span> {fmtDT(planned)}
      </p>
      <p className={cn("text-[12.5px]", actual ? "text-ok" : late ? "text-warn" : "text-mute-2")}>
        <span className={actual ? "text-mute" : undefined}>Actual</span>{" "}
        {actual ? fmtDT(actual) : late ? delayLabel(planned) : "Pending"}
      </p>
    </div>
  );
}

/* ---------- Journey ---------- */

export function JourneyTimeline({
  shipment,
  onLegClick,
  compact,
}: {
  shipment: ExecShipment;
  onLegClick?: (leg: Leg) => void;
  compact?: boolean;
}) {
  return (
    <ol className="relative space-y-0">
      {shipment.legs.map((l, i) => {
        const active = l.status === "In Progress" || l.status === "Delayed" || l.status === "Exception";
        const done = l.status === "Completed";
        return (
          <li key={l.id} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                  done
                    ? "border-ok bg-ok/10 text-ok"
                    : active
                      ? "border-cyan bg-cyan/10 text-cyan"
                      : "border-ink/15 bg-white text-mute-2",
                )}
              >
                {done ? <Check size={13} /> : <ModeIcon mode={l.mode} size={13} />}
              </span>
              {i < shipment.legs.length - 1 && (
                <span className={cn("w-px flex-1", done ? "bg-ok/40" : "bg-ink/10")} style={{ minHeight: compact ? 28 : 44 }} />
              )}
            </div>
            <button
              type="button"
              onClick={() => onLegClick?.(l)}
              disabled={!onLegClick}
              className={cn(
                "mb-4 min-w-0 flex-1 rounded-xl border px-3.5 py-3 text-left transition",
                active ? "border-cyan/40 bg-cyan/4" : "border-ink/8 bg-white",
                onLegClick && "hover:border-accent/40 hover:shadow-sm",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12.5px] font-medium text-mist">
                  Leg {l.seq} · {l.mode} — {l.origin} → {l.destination}
                </p>
                <LegBadge status={l.status} />
              </div>
              {!compact && (
                <>
                  <p className="mt-1 text-[11.5px] text-mute">
                    {l.vendor ?? "Vendor unassigned"} · Dep {fmtDT(l.actualDep ?? l.plannedDep)} · Arr {fmtDT(l.actualArr ?? l.plannedArr)}
                  </p>
                  {Object.keys(l.tracking).length > 0 && (
                    <p className="mt-1 flex flex-wrap gap-2">
                      {Object.entries(l.tracking).slice(0, 3).map(([k, v]) => (
                        <TrackingRef key={k} k={k} v={v} />
                      ))}
                    </p>
                  )}
                </>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function TrackingRef({ k, v }: { k: string; v: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] text-mist-2">
      <span className="text-mute-2">{k}</span> {v}
    </span>
  );
}

/* ---------- Milestones ---------- */

export function MilestoneTimeline({
  shipment,
  onUpdate,
}: {
  shipment: ExecShipment;
  onUpdate?: (m: MilestoneX) => void;
}) {
  return (
    <ol className="relative space-y-0">
      {shipment.milestones.map((m, i) => {
        const st = msEffectiveStatus(m);
        const done = st === "Completed";
        const current = !done && shipment.milestones.findIndex((x) => !x.actual) === i;
        return (
          <li key={m.id} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white text-[10px]",
                  done
                    ? "border-ok text-ok"
                    : st === "Delayed"
                      ? "border-warn text-warn"
                      : st === "Exception"
                        ? "border-bad text-bad"
                        : current
                          ? "border-cyan text-cyan"
                          : "border-ink/15 text-mute-2",
                )}
              >
                {done ? <Check size={12} /> : st === "Delayed" || st === "Exception" ? <AlertTriangle size={11} /> : <Clock size={11} />}
              </span>
              {i < shipment.milestones.length - 1 && <span className={cn("w-px flex-1", done ? "bg-ok/40" : "bg-ink/10")} style={{ minHeight: 34 }} />}
            </div>
            <div className="mb-3.5 min-w-0 flex-1 pb-0.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={cn("text-[13px] font-medium", done ? "text-mute" : "text-mist")}>
                  {m.name}
                  {m.legId && <span className="ml-1.5 text-[10.5px] font-normal text-mute-2">· {m.legId.split("-")[0]}</span>}
                </p>
                <span className="flex items-center gap-2">
                  <MsBadge st={st} planned={m.planned} />
                  {onUpdate && !done && (
                    <button type="button" onClick={() => onUpdate(m)} className="text-[11px] font-medium text-accent hover:text-accent-2">
                      Update
                    </button>
                  )}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-mute">
                Plan {fmtDT(m.planned)}
                {m.actual && <span className="text-ok"> · Actual {fmtDT(m.actual)}</span>}
                <span className="text-mute-2"> · {m.owner}</span>
              </p>
              {m.customerRemark && (
                <p className="mt-1 rounded bg-accent/5 px-2 py-1 text-[11px] text-mist">
                  <span className="font-medium text-accent">Customer</span> · {m.customerRemark}
                </p>
              )}
              {m.internalRemark && (
                <p className="mt-1 rounded bg-warn/8 px-2 py-1 text-[11px] text-mist">
                  <span className="font-medium text-warn">Internal</span> · {m.internalRemark}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function MsBadge({ st, planned }: { st: string; planned: string }) {
  const tone =
    st === "Completed" ? "bg-ok/10 text-ok" : st === "Delayed" ? "bg-warn/10 text-warn" : st === "Exception" ? "bg-bad/10 text-bad" : st === "Due Soon" ? "bg-accent/10 text-accent" : "bg-ink/6 text-mute-2";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-medium", tone)}>
      {st === "Delayed" ? delayLabel(planned) : st}
    </span>
  );
}

/* ---------- Health strip ---------- */

export function HealthStrip({ s }: { s: ExecShipment }) {
  const prog = shipProgress(s);
  const next = nextMilestone(s);
  const openExc = s.exception;
  const items: { label: string; value: ReactNode; tone?: string }[] = [
    { label: "Overall Progress", value: `${prog}%` },
    { label: "On-Time Status", value: openExc ? "At Risk" : "On Schedule", tone: openExc ? "text-warn" : "text-ok" },
    { label: "Journey", value: `${s.legs.filter((l) => l.status === "Completed").length} of ${s.legs.length} legs complete` },
    { label: "Documents", value: `${s.docsReady} / ${s.docsTotal}` },
    { label: "Next Milestone", value: next?.name ?? "—" },
    { label: "ETA", value: s.eta },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-ink/8 bg-white px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-mute-2">{it.label}</p>
          <p className={cn("mt-0.5 truncate text-[14px] font-medium", it.tone ?? "text-mist")}>{it.value}</p>
        </div>
      ))}
      <div className="col-span-2 -mt-1 sm:col-span-3 xl:col-span-6">
        <div className="h-1.5 overflow-hidden rounded-full bg-ink/6">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-2 transition-all duration-700" style={{ width: `${prog}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Exception card ---------- */

export function ExceptionCard({
  e,
  onOpen,
  actions,
}: {
  e: ExceptionX;
  onOpen?: () => void;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink/8 bg-white p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <SevBadge sev={e.severity} />
          <span className="text-[13px] font-medium text-mist">{e.type}</span>
        </span>
        <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10.5px] font-medium text-mute">{e.status}</span>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-mute">{e.description}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-mute-2">
        <Link to={`/app/shipments/${e.shipmentId}`} className="font-mono text-accent hover:underline">{e.shipmentId}</Link>
        {e.legId && <span>Leg {e.legId.split("-")[0].replace("L", "")}</span>}
        <span>Owner {e.owner}</span>
        <span>Due {fmtDT(e.due)}</span>
      </div>
      {e.resolution && <p className="mt-2 rounded bg-ok/8 px-2 py-1.5 text-[11.5px] text-mist">Resolved · {e.resolution}</p>}
      <div className="mt-2 flex gap-3">
        {onOpen && (
          <button type="button" onClick={onOpen} className="text-[11.5px] font-medium text-accent">Open</button>
        )}
        {actions}
      </div>
    </div>
  );
}
