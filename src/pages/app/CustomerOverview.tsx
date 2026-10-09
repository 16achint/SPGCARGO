import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Anchor,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileWarning,
  FileText,
  Inbox,
  Package,
  Ship,
  Wallet,
} from "lucide-react";
import { DashboardSkeleton, KpiCard, Panel } from "@/components/app/shared/primitives";
import { useApp } from "@/state/AppContext";
import { DOCUMENTS, QUOTES, RFQS, SHIPMENTS } from "@/lib/mock";
import { cn } from "@/utils/cn";

export default function CustomerOverview() {
  const { user, pushToast } = useApp();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("ready"), 600);
    return () => window.clearTimeout(t);
  }, []);

  if (phase === "loading") return <DashboardSkeleton />;

  const mine = SHIPMENTS.filter((s) => s.customer === "Apex Components Pvt Ltd");
  const flagship = mine.find((s) => s.id === "SPG-SHP-001284")!;
  const myQuotes = QUOTES.filter((q) => q.customer === "Apex Components Pvt Ltd");
  const myRfqs = RFQS.filter((r) => r.customer === "Apex Components Pvt Ltd");
  const myDocs = DOCUMENTS.filter((d) => d.shipment === flagship.id);
  const myInvoicesDue = 1;

  return (
    <div className="p-4 sm:p-6">
      <div>
        <p className="text-[12px] text-mute">{user.org}</p>
        <h1 className="mt-1 text-[24px] font-medium tracking-tight text-mist sm:text-[28px]">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-[13px] text-mute">
          Your shipments, documents and invoices in one place.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Active Shipments" value={mine.length} icon={<Package size={15} />} />
        <KpiCard label="In Transit" value={mine.filter((s) => s.status === "In Transit").length} icon={<Ship size={15} />} />
        <KpiCard label="Arriving Soon" value={1} sub="Next 72 hours" icon={<Anchor size={15} />} />
        <KpiCard label="Quotes Awaiting" value={myQuotes.filter((q) => q.status === "Awaiting Customer").length} sub="Your decision needed" tone="warn" icon={<FileText size={15} />} />
        <KpiCard label="Documents Required" value={myDocs.filter((d) => d.state !== "Verified").length} tone="warn" icon={<FileWarning size={15} />} />
        <KpiCard label="Invoices Due" value={myInvoicesDue} sub="₹4,20,000" icon={<Wallet size={15} />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Recent Shipments" sub="Your active cargo" className="xl:col-span-2" bodyClass="p-3">
          <ul className="space-y-2.5">
            {mine.map((s) => {
              const progress =
                s.status === "In Transit" ? 62 : s.status === "Pickup" ? 12 : s.status === "Confirmed" ? 5 : 100;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      pushToast("info", s.id, "Shipment tracking opens in the Execution phase.");
                      navigate("/app/shipments");
                    }}
                    className="w-full rounded-xl border border-ink/8 bg-white p-3.5 text-left transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_10px_26px_-12px_rgba(13,33,56,0.25)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[12px] font-medium text-accent">{s.id}</span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10.5px] font-medium",
                          s.status === "Exception" ? "bg-bad/10 text-bad" : "bg-cyan/10 text-cyan",
                        )}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] font-medium text-mist">{s.route}</p>
                    <p className="mt-0.5 text-[11px] text-mute-2">{s.modes.join(" + ")} · ETA {s.eta}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/6">
                        <div className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-2" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-accent">
                        Track <ArrowRight size={11} />
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Tracking Preview" sub={flagship.id} bodyClass="p-4">
          <ol className="relative space-y-5 border-l border-ink/10 pl-5">
            {[
              { t: "Pune · Factory pickup", d: "06 Oct · Completed", done: true },
              { t: "Nhava Sheva · Vessel departure", d: "09 Oct · Completed", done: true },
              { t: "Singapore · In transit", d: "Arrives 12 Oct", done: false, active: true },
              { t: "Houston · Discharge & delivery", d: "ETA 18 Oct", done: false },
            ].map((m, i) => (
              <li key={i} className="relative">
                <span
                  className={cn(
                    "absolute -left-[26px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white",
                    m.done ? "border-ok" : m.active ? "border-cyan-2" : "border-ink/20",
                  )}
                >
                  {m.done ? (
                    <CheckCircle2 size={11} className="text-ok" />
                  ) : m.active ? (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-2" />
                  ) : null}
                </span>
                <p className={cn("text-[12.5px] font-medium", m.done ? "text-mute" : "text-mist")}>{m.t}</p>
                <p className="text-[11px] text-mute-2">{m.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-lg bg-paper/70 px-3 py-2 text-[11px] text-mute">
            <Clock size={11} className="mr-1 inline" />
            Next milestone: {flagship.nextMilestone}
          </p>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Open RFQs" sub="Rate requests you raised">
          <ul className="space-y-2">
            {myRfqs.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg border border-ink/6 bg-paper/60 px-3 py-2.5">
                <div>
                  <p className="font-mono text-[11px] text-accent">{r.id}</p>
                  <p className="text-[12px] font-medium text-mist">{r.lane}</p>
                </div>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10.5px] font-medium text-accent">{r.status}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Pending Actions" sub="Needs your attention">
          <ul className="space-y-2">
            {[
              { icon: FileText, t: "Accept or revise quote Q-7781", d: "Expires 14 Oct" },
              { icon: FileWarning, t: "Upload commercial invoice", d: "SHP-001238" },
              { icon: Wallet, t: "Settle invoice INV-1042", d: "Due 25 Oct · ₹4,20,000" },
            ].map((a) => (
              <li key={a.t} className="flex items-start gap-2.5 rounded-lg border border-ink/6 bg-paper/60 px-3 py-2.5">
                <a.icon size={14} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-[12px] font-medium text-mist">{a.t}</p>
                  <p className="text-[10.5px] text-mute-2">{a.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recent Documents" sub={flagship.id}>
          <ul className="space-y-2">
            {myDocs.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-lg border border-ink/6 bg-paper/60 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <Inbox size={13} className="text-mute-2" />
                  <div>
                    <p className="text-[12px] font-medium text-mist">{d.name}</p>
                    <p className="font-mono text-[10px] text-mute-2">{d.id}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    d.state === "Verified" ? "bg-ok/10 text-ok" : d.state === "Missing" ? "bg-bad/10 text-bad" : "bg-warn/10 text-warn",
                  )}
                >
                  {d.state}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
