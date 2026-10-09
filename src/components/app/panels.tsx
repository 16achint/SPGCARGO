import { Anchor, CheckCircle2, Clock, FileText, Plane, Radar, Ship, Stamp, Truck, TrainFront, User } from "lucide-react";
import { cn } from "@/utils/cn";
import { ACTIVITY, ATTENTION, CUSTOMS_STATUS, DOC_HEALTH, MILESTONES, MODE_MIX } from "@/lib/mock";
import { Panel, PositiveState, SevDot, StackBar, Donut } from "./shared/primitives";

/* ---------- Needs Attention ---------- */

export function NeedsAttentionPanel({ onOpen }: { onOpen: (entity: string) => void }) {
  const items = ATTENTION;
  return (
    <Panel
      title="Needs Attention"
      sub="Prioritised across operations and vendors"
      className="h-full"
      bodyClass="flex flex-col"
    >
      {items.length === 0 ? (
        <PositiveState title="Everything looks on track." />
      ) : (
        <ul className="divide-y divide-ink/5">
          {items.map((a) => (
            <li key={a.id} className="group py-3 first:pt-1 last:pb-1">
              <div className="flex gap-3">
                <SevDot sev={a.severity} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug text-mist">{a.title}</p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-accent">{a.entity}</p>
                  <p className="mt-1 text-[11.5px] text-mute">{a.reason}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-mute-2">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} />
                      {a.due}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <User size={11} />
                      {a.owner}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpen(a.entity)}
                      className="ml-auto text-[11px] font-medium text-accent opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                    >
                      Open →
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* ---------- Milestones ---------- */

const MS_STATE: Record<string, { cls: string; label: string }> = {
  "on-schedule": { cls: "bg-ok/10 text-ok", label: "On schedule" },
  "due-soon": { cls: "bg-warn/10 text-warn", label: "Due soon" },
  delayed: { cls: "bg-bad/10 text-bad", label: "Delayed" },
  completed: { cls: "bg-ink/6 text-mute-2", label: "Completed" },
};

export function MilestonesPanel() {
  const today = MILESTONES.filter((m) => m.day === "Today");
  const tomorrow = MILESTONES.filter((m) => m.day === "Tomorrow");
  return (
    <Panel title="Upcoming Milestones" sub="Next 48 hours" className="h-full" bodyClass="">
      {[["Today", today], ["Tomorrow", tomorrow]].map(([label, list]) => (
        <div key={String(label)} className="border-b border-ink/5 px-4 py-3 last:border-0">
          <p className="pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mute-2">
            {String(label)}
          </p>
          <ul className="space-y-2.5">
            {(list as typeof MILESTONES).map((m, i) => (
              <li key={`${m.time}-${m.shipment}-${i}`} className="flex items-center gap-3">
                <span className="w-10 shrink-0 font-mono text-[11px] text-mute">{m.time}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-mist">{m.label}</span>
                  <span className="block font-mono text-[10px] text-mute-2">{m.shipment}</span>
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", MS_STATE[m.state].cls)}>
                  {MS_STATE[m.state].label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Panel>
  );
}

/* ---------- Activity ---------- */

const ACT_ICON: Record<string, React.ElementType> = {
  ship: Ship,
  doc: FileText,
  delay: Clock,
  customs: Stamp,
  vendor: Truck,
  milestone: CheckCircle2,
};

export function ActivityPanel({ limit = 8 }: { limit?: number }) {
  return (
    <Panel
      title="Recent Activity"
      sub="Live operational feed"
      action={
        <button
          type="button"
          className="text-[11.5px] font-medium text-accent transition hover:text-accent-2"
        >
          View all
        </button>
      }
      className="h-full"
      bodyClass=""
    >
      <ul className="px-4 py-3">
        {ACTIVITY.slice(0, limit).map((a, i) => {
          const Icon = ACT_ICON[a.icon] ?? Anchor;
          return (
            <li key={i} className="flex gap-3 py-2.5">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink/4 text-mute-2">
                <Icon size={13} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] leading-snug text-mist">{a.text}</p>
                <p className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-mute-2">
                  {a.shipment}
                  <span className="font-sans">{a.time}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* ---------- Summary widgets ---------- */

const MODE_ICON: Record<string, React.ElementType> = {
  sea: Ship,
  road: Truck,
  air: Plane,
  rail: TrainFront,
};

export function ModeMixPanel() {
  return (
    <Panel title="Shipments by Mode" sub="Share of active fleet" className="h-full">
      <Donut parts={MODE_MIX.map((m) => ({ label: m.label, value: m.value }))} />
      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-ink/6 pt-4">
        {MODE_MIX.map((m) => {
          const Icon = MODE_ICON[m.icon];
          return (
            <div key={m.label} className="flex flex-col items-center gap-1 text-center">
              <Icon size={15} className="text-mute-2" />
              <span className="text-[13px] font-medium text-mist">{m.value}</span>
              <span className="text-[10px] text-mute-2">{m.label}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function DocHealthPanel() {
  return (
    <Panel title="Document Health" sub="All active shipments" className="h-full">
      <StackBar
        parts={DOC_HEALTH.map((d) => ({
          label: d.label,
          value: d.value,
          cls: d.tone === "ok" ? "bg-ok" : d.tone === "warn" ? "bg-warn" : "bg-bad",
        }))}
      />
    </Panel>
  );
}

export function CustomsPanel() {
  return (
    <Panel title="Customs Pipeline" sub="Open filings" className="h-full">
      <ul className="space-y-2">
        {CUSTOMS_STATUS.map((c) => (
          <li key={c.label} className="flex items-center justify-between text-[12px]">
            <span className="text-mute">{c.label}</span>
            <span className="rounded-full bg-ink/5 px-2 py-0.5 font-medium text-mist">{c.value}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function TrendPanel({
  title,
  sub,
  data,
  labels,
}: {
  title: string;
  sub?: string;
  data: number[];
  labels?: string[];
}) {
  const max = Math.max(...data) || 1;
  return (
    <Panel title={title} sub={sub} className="h-full">
      <div className="flex h-[92px] items-end gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="group flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-accent/70 to-cyan-2/80 transition-all duration-500 group-hover:from-accent group-hover:to-cyan-2"
              style={{ height: `${(d / max) * 100}%`, minHeight: 4 }}
            />
            {labels && (
              <span className="text-[9px] text-mute-2">{labels[i]}</span>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function RadarPanel() {
  return (
    <div className="flex items-center justify-center gap-2 text-[11px] text-mute-2">
      <Radar size={13} />
      Network telemetry
    </div>
  );
}
