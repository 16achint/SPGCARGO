import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CalendarCheck,
  CheckCircle2,
  Files,
  Inbox,
  Package,
  Percent,
  TrendingUp,
} from "lucide-react";
import {
  DashboardSkeleton,
  Funnel,
  KpiCard,
  Panel,
  StackBar,
  Donut,
} from "@/components/app/shared/primitives";
import { TrendPanel } from "@/components/app/panels";
import { useApp } from "@/state/AppContext";
import {
  EXCEPTION_TREND,
  FUNNEL,
  MODE_MIX,
  SHIPMENTS,
  TOP_CUSTOMERS,
  TOP_ROUTES,
} from "@/lib/mock";

export default function ManagementOverview() {
  const { user } = useApp();
  const [phase, setPhase] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("ready"), 650);
    return () => window.clearTimeout(t);
  }, []);

  if (phase === "loading") return <DashboardSkeleton />;

  const statusParts = [
    { label: "In Transit", value: SHIPMENTS.filter((s) => ["In Transit", "Transshipment"].includes(s.status)).length, cls: "bg-cyan-2" },
    { label: "Pre-movement", value: SHIPMENTS.filter((s) => ["Confirmed", "Documentation", "Pickup", "Gate-in"].includes(s.status)).length, cls: "bg-accent" },
    { label: "Final leg", value: SHIPMENTS.filter((s) => ["Customs", "Destination", "Delivery"].includes(s.status)).length, cls: "bg-ok" },
    { label: "Exception", value: SHIPMENTS.filter((s) => s.status === "Exception").length, cls: "bg-bad" },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div>
        <p className="text-[12px] text-mute">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-1 text-[24px] font-medium tracking-tight text-mist sm:text-[28px]">
          Management Overview
        </h1>
        <p className="mt-1 text-[13px] text-mute">
          Strategic snapshot for {user.org} — commercial funnel, network health and profitability.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Enquiries" value={142} sub="+18 this week" trend="up" icon={<Inbox size={15} />} spark={[90, 101, 110, 118, 126, 135, 142]} />
        <KpiCard label="Quotes" value={86} sub="61% conversion" icon={<Files size={15} />} />
        <KpiCard label="Confirmed Shipments" value={54} sub="This month" icon={<CalendarCheck size={15} />} />
        <KpiCard label="Active Shipments" value={SHIPMENTS.length} sub="Live on network" icon={<Package size={15} />} />
        <KpiCard label="Completed" value={37} sub="Last 30 days" tone="ok" icon={<CheckCircle2 size={15} />} />
        <KpiCard label="Revenue" value={2.48} prefix="₹" suffix=" Cr" decimals={2} sub="+9% MoM" trend="up" icon={<Banknote size={15} />} />
        <KpiCard label="Gross Profit" value={4.58} prefix="₹" suffix=" Cr" decimals={2} sub="+6% MoM" tone="ok" icon={<TrendingUp size={15} />} />
        <KpiCard label="Gross Margin" value={18.5} suffix="%" decimals={1} sub="Target 18.0%" icon={<Percent size={15} />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Commercial Funnel" sub="Enquiry → Quote → Booking">
          <Funnel parts={FUNNEL} />
        </Panel>
        <Panel title="Shipment Mode Mix" sub="Share of active volume">
          <Donut parts={MODE_MIX.map((m) => ({ label: m.label, value: m.value }))} />
        </Panel>
        <Panel title="Fleet Status" sub="Active shipments by stage">
          <StackBar parts={statusParts} />
          <div className="mt-5 rounded-lg border border-bad/15 bg-bad/5 px-3 py-2.5">
            <p className="flex items-center gap-2 text-[12px] font-medium text-mist">
              <AlertTriangle size={13} className="text-bad" />
              7 open exceptions
            </p>
            <p className="mt-0.5 text-[11px] text-mute">2 critical · 5 warning · trend flat WoW</p>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Top Customers" sub="Revenue this month">
          <ul className="space-y-1">
            {TOP_CUSTOMERS.map((c, i) => (
              <li key={c.name} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-ink/3">
                <span className="w-4 text-[11px] font-medium text-mute-2">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-mist">{c.name}</span>
                <span className="text-[12px] font-medium text-mist">{c.revenue}</span>
                <span className={cnDelta(c.delta)}>{c.delta}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Top Routes" sub="Volume & reliability">
          <ul className="space-y-2.5">
            {TOP_ROUTES.map((r) => (
              <li key={r.lane}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="font-medium text-mist">{r.lane}</span>
                  <span className="text-mute-2">{r.volume} jobs · {r.onTime} on time</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink/6">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-2" style={{ width: `${(r.volume / TOP_ROUTES[0].volume) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <TrendPanel title="Exception Trend" sub="Open exceptions · 7 days" data={EXCEPTION_TREND} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} />
      </div>
    </div>
  );
}

function cnDelta(delta: string) {
  return `text-[11px] font-medium ${delta.startsWith("-") ? "text-bad" : "text-ok"}`;
}
