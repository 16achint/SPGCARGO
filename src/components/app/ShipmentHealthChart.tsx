import type { Shipment } from "@/lib/mock";

type Stage = { label: string; value: number; color: string; detail: string };

export function ShipmentHealthChart({ shipments }: { shipments: Shipment[] }) {
  const stages: Stage[] = [
    {
      label: "Moving",
      value: shipments.filter((s) => s.status === "In Transit" || s.status === "Transshipment").length,
      color: "bg-cyan",
      detail: "In transit or transfer",
    },
    {
      label: "Attention",
      value: shipments.filter((s) => s.status === "Exception" || s.status === "Customs").length,
      color: "bg-bad",
      detail: "Exceptions or clearance",
    },
    {
      label: "Documentation",
      value: shipments.filter((s) => s.status === "Documentation" || s.status === "Gate-in").length,
      color: "bg-warn",
      detail: "Docs and gate-in",
    },
    {
      label: "Planned",
      value: shipments.filter((s) => ["Confirmed", "Pickup", "Destination", "Delivery", "Completed"].includes(s.status)).length,
      color: "bg-accent",
      detail: "Confirmed or completing",
    },
  ];
  const max = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <section className="rounded-lg border border-ink/6 bg-white px-3 py-3" aria-label="Shipment health by stage">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-mist">Shipment Health by Stage</p>
          <p className="mt-0.5 text-[10px] text-mute-2">Current filtered shipment distribution</p>
        </div>
        <span className="rounded-full bg-ok/10 px-2 py-1 text-[10px] font-medium text-ok">{shipments.length} total</span>
      </div>
      <div className="mt-4 space-y-3">
        {stages.map((stage) => (
          <div key={stage.label} className="grid grid-cols-[84px_1fr_24px] items-center gap-2">
            <div>
              <p className="text-[10.5px] font-medium text-mist">{stage.label}</p>
              <p className="text-[9.5px] text-mute-2">{stage.detail}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink/6">
              <div className={`h-full rounded-full ${stage.color}`} style={{ width: `${(stage.value / max) * 100}%` }} />
            </div>
            <span className="text-right text-[11px] font-semibold text-mist">{stage.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
