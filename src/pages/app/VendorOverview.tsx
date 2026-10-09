import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Clock,
  FileWarning,
  FileText,
  MapPin,
  Package,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { DashboardSkeleton, KpiCard, Panel, StatusBadge, PositiveState } from "@/components/app/shared/primitives";
import { useApp } from "@/state/AppContext";
import { JOB_REQUESTS, SHIPMENTS, type ShipmentStatus } from "@/lib/mock";
import { cn } from "@/utils/cn";

export default function VendorOverview() {
  const { user, pushToast } = useApp();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [jobs, setJobs] = useState(JOB_REQUESTS);

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("ready"), 550);
    return () => window.clearTimeout(t);
  }, []);

  if (phase === "loading") return <DashboardSkeleton />;

  const newReqs = jobs.filter((j) => j.status === "New");
  const active = jobs.filter((j) => j.status === "Accepted" || j.status === "In Progress");

  function respond(id: string, accept: boolean) {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: accept ? "Accepted" : "Completed" } : j)),
    );
    pushToast(
      accept ? "success" : "info",
      accept ? `Job ${id} accepted` : `Job ${id} declined`,
      accept ? "Pickup slot reserved in your schedule." : "The request has been returned to operations.",
    );
  }

  const statusOf = (id: string): ShipmentStatus => {
    const s = SHIPMENTS.find((x) => x.id === id);
    return s ? s.status : "In Transit";
  };

  return (
    <div className="p-4 sm:p-6">
      <div>
        <p className="text-[12px] text-mute">{user.org}</p>
        <h1 className="mt-1 text-[24px] font-medium tracking-tight text-mist sm:text-[28px]">
          Vendor Workspace
        </h1>
        <p className="mt-1 text-[13px] text-mute">
          Job requests, pickups and settlements for your fleet.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="New Job Requests" value={newReqs.length} icon={<Package size={15} />} tone={newReqs.length ? "default" : undefined} />
        <KpiCard label="Active Jobs" value={active.length} icon={<Truck size={15} />} />
        <KpiCard label="Pickup Due" value={1} sub="Today · 10:30" tone="warn" icon={<Clock size={15} />} />
        <KpiCard label="POD Pending" value={1} sub="Awaiting upload" icon={<FileText size={15} />} />
        <KpiCard label="Invoices Pending" value={2} sub="₹1.8L" icon={<Wallet size={15} />} />
      </div>

      <Panel
        title="New Job Requests"
        sub="Accept or decline before the pickup window"
        className="mt-4"
        bodyClass="p-3"
      >
        {newReqs.length === 0 ? (
          <PositiveState title="No new requests right now." />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {newReqs.map((j) => (
              <li key={j.id} className="rounded-xl border border-ink/8 bg-white p-4 transition hover:border-accent/30">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-accent">{j.shipment}</span>
                  <StatusBadge status={statusOf(j.shipment)} />
                </div>
                <div className="mt-3 space-y-1.5 text-[12px]">
                  <p className="flex items-center gap-2 text-mist">
                    <MapPin size={12} className="text-mute-2" />
                    {j.pickup}
                  </p>
                  <p className="flex items-center gap-2 text-mist">
                    <MapPin size={12} className="text-cyan" />
                    {j.destination}
                  </p>
                  <p className="flex items-center gap-2 text-mute">
                    <Clock size={12} className="text-mute-2" />
                    {j.date} · <Truck size={12} className="text-mute-2" /> {j.cargo}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => respond(j.id, true)}
                    className="btn-primary inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-[12.5px]"
                  >
                    <Check size={14} />
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => respond(j.id, false)}
                    className="btn-secondary inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-[12.5px]"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Active Jobs" sub="Scheduled and in progress" className="xl:col-span-1" bodyClass="p-3">
          <ul className="space-y-2">
            {active.map((j) => (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => {
                    pushToast("info", j.id, "Job detail opens in the Execution phase.");
                    navigate("/app/shipments");
                  }}
                  className="w-full rounded-lg border border-ink/6 bg-paper/60 px-3 py-2.5 text-left transition hover:border-accent/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10.5px] text-accent">{j.shipment}</span>
                    <span className={cn("text-[10.5px] font-medium", j.status === "In Progress" ? "text-cyan" : "text-mute")}>
                      {j.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-mist">{j.destination}</p>
                  <p className="text-[10.5px] text-mute-2">{j.date} · {j.cargo}</p>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Documents Pending" sub="Uploads required from you">
          <ul className="space-y-2">
            {[
              { t: "Proof of Delivery (POD)", s: "SPG-SHP-001258", due: "1 day overdue" },
              { t: "Tally Sheet", s: "SPG-SHP-001202", due: "Due tomorrow" },
            ].map((d) => (
              <li key={d.t} className="flex items-start gap-2.5 rounded-lg border border-warn/20 bg-warn/5 px-3 py-2.5">
                <FileWarning size={14} className="mt-0.5 shrink-0 text-warn" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-mist">{d.t}</p>
                  <p className="font-mono text-[10px] text-mute-2">{d.s}</p>
                </div>
                <span className="shrink-0 text-[10.5px] font-medium text-warn">{d.due}</span>
              </li>
            ))}
            <li className="rounded-lg border border-ink/6 bg-paper/60 px-3 py-2.5">
              <button
                type="button"
                onClick={() => pushToast("success", "Upload started", "Document vault opens in the Docs phase.")}
                className="text-[12px] font-medium text-accent transition hover:text-accent-2"
              >
                + Upload document
              </button>
            </li>
          </ul>
        </Panel>

        <Panel title="Invoices Pending" sub="Awaiting settlement">
          <ul className="space-y-2">
            {[
              { id: "BI-884", s: "SPG-SHP-001208", amt: "₹42,000", due: "10 Oct" },
              { id: "BI-881", s: "SPG-SHP-001196", amt: "₹1,38,000", due: "15 Oct" },
            ].map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-lg border border-ink/6 bg-paper/60 px-3 py-2.5">
                <div>
                  <p className="font-mono text-[11px] text-accent">{i.id}</p>
                  <p className="font-mono text-[10px] text-mute-2">{i.s}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12.5px] font-medium text-mist">{i.amt}</p>
                  <p className="text-[10px] text-mute-2">Due {i.due}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
