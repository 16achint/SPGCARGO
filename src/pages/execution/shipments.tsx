import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useExecution } from "@/state/ExecutionContext";
import { useCommercial } from "@/state/CommercialContext";
import { useApp } from "@/state/AppContext";
import {
  STAGE_FLOW,
  currentLeg,
  fmtDT,
  nextMilestone,
  type ExecShipment,
  type ExecStage,
} from "@/lib/execution";
import { OWNERS, optionTotals, inr } from "@/lib/commercial";
import {
  Dialog,
  Field,
  InheritedBanner,
  KpiStrip,
  PageHead,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/commercial/ui";
import {
  ExceptionCard,
  HealthStrip,
  JourneyTimeline,
  LegBadge,
  ModeIcon,
  PlannedActual,
  StageBadge,
  TrackingRef,
} from "@/components/execution/ui";
import { FilterBarShell, FilterSelect, ClearFilters, opts } from "@/components/app/shared/Filters";
import { Panel, Skel } from "@/components/app/shared/primitives";
import { cn } from "@/utils/cn";

const SAVED_VIEWS = [
  { id: "all", label: "All" },
  { id: "mine", label: "My Shipments" },
  { id: "delayed", label: "Delayed" },
  { id: "exceptions", label: "Exceptions" },
  { id: "pickup", label: "Pickup Due" },
  { id: "arriving", label: "Arriving Today" },
];

export default function ShipmentsPage() {
  const { shipments } = useExecution();
  const { user, pushToast } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [view, setView] = useState("all");
  const [mode, setMode] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [owner, setOwner] = useState<string[]>([]);
  const [menu, setMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return shipments.filter((s) => {
      if (view === "mine" && s.owner !== user.name.split(" ")[0][0] + ". " + user.name.split(" ")[1]) {
        if (s.owner !== "A. Sharma") return false;
      }
      if (view === "delayed" && !s.legs.some((l) => l.status === "Delayed")) return false;
      if (view === "exceptions" && !s.exception) return false;
      if (view === "pickup" && s.stage !== "Pickup") return false;
      if (view === "arriving" && !["Destination", "Delivery"].includes(s.stage)) return false;
      if (mode.length && !s.legs.some((l) => mode.includes(l.mode))) return false;
      if (status.length && !status.includes(s.stage)) return false;
      if (owner.length && !owner.includes(s.owner)) return false;
      if (!query) return true;
      const trackHit = s.legs.some((l) => Object.values(l.tracking).some((v) => v.toLowerCase().includes(query)));
      return (
        s.id.toLowerCase().includes(query) ||
        s.customer.toLowerCase().includes(query) ||
        s.origin.toLowerCase().includes(query) ||
        s.destination.toLowerCase().includes(query) ||
        trackHit
      );
    });
  }, [shipments, q, view, mode, status, owner, user.name]);

  const kpi = {
    active: shipments.filter((s) => !["Completed", "Cancelled"].includes(s.stage)).length,
    transit: shipments.filter((s) => ["In Transit", "Transshipment"].includes(s.stage)).length,
    delayed: shipments.filter((s) => s.legs.some((l) => l.status === "Delayed")).length,
    exception: shipments.filter((s) => s.exception).length,
    arriving: shipments.filter((s) => ["Destination", "Delivery"].includes(s.stage)).length,
    pickup: shipments.filter((s) => s.stage === "Pickup").length,
    completed: shipments.filter((s) => s.stage === "Completed").length,
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHead
        title="Shipments"
        sub="Monitor and manage active multimodal shipments."
        actions={
          <>
            <button type="button" onClick={() => pushToast("info", "Export started")} className="btn-secondary h-10 rounded-lg px-3 text-[13px]">Export</button>
            <Link to="/app/bookings" className="btn-primary inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px]">
              <Plus size={14} /> Create Shipment
            </Link>
          </>
        }
      />
      <div className="mt-5">
        <KpiStrip
          items={[
            { label: "Active", value: kpi.active },
            { label: "In Transit", value: kpi.transit, tone: "text-cyan" },
            { label: "Delayed", value: kpi.delayed, tone: "text-warn" },
            { label: "Exception", value: kpi.exception, tone: "text-bad" },
            { label: "Arriving", value: kpi.arriving },
            { label: "Pickup Due", value: kpi.pickup },
            { label: "Completed", value: kpi.completed, tone: "text-ok" },
          ]}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-ink/5 p-0.5">
          {SAVED_VIEWS.map((v) => (
            <button key={v.id} type="button" onClick={() => setView(v.id)} className={cn("whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12px]", view === v.id ? "bg-white font-medium text-mist shadow-sm" : "text-mute")}>
              {v.label}
            </button>
          ))}
        </div>
        <label className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, customer, container, BL..." className="h-9 w-[250px] rounded-lg border border-ink/10 bg-white pl-8 pr-3 text-[13px] focus:border-accent focus:outline-none" />
        </label>
        <FilterBarShell>
          <FilterSelect label="Mode" options={opts(["Road", "Ocean", "Air", "Rail"])} value={mode} onChange={setMode} />
          <FilterSelect label="Status" options={opts(STAGE_FLOW.slice(4))} value={status} onChange={setStatus} />
          <FilterSelect label="Owner" options={opts(OWNERS)} value={owner} onChange={setOwner} />
          {(mode.length || status.length || owner.length) > 0 && <ClearFilters onClear={() => { setMode([]); setStatus([]); setOwner([]); }} />}
        </FilterBarShell>
      </div>

      <Panel className="mt-4" bodyClass="p-0">
        {filtered.length === 0 ? (
          <p className="p-10 text-center text-[13px] text-mute">No shipments match your filters.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1060px] text-left text-[12.5px]">
                <thead>
                  <tr className="border-y border-ink/6 text-[10.5px] uppercase tracking-[0.12em] text-mute-2">
                    {["Shipment ID", "Customer", "Route", "Modes", "Current Leg", "Next Milestone", "ETA", "Status", "Owner", ""].map((h) => (
                      <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const cur = currentLeg(s);
                    const next = nextMilestone(s);
                    return (
                      <tr key={s.id} onClick={() => navigate(`/app/shipments/${s.id}`)} className="cursor-pointer border-b border-ink/5 transition hover:bg-accent/4">
                        <td className="px-3 py-3 font-mono text-[11.5px] font-medium text-accent">{s.id}</td>
                        <td className="px-3 py-3">{s.customer}</td>
                        <td className="px-3 py-3 text-mute">{s.origin.split(",")[0]} → {s.destination.split(",")[0]}</td>
                        <td className="px-3 py-3">
                          <span className="flex gap-1.5 text-mute">
                            {[...new Set(s.legs.map((l) => l.mode))].map((m) => <ModeIcon key={m} mode={m} size={13} />)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {cur ? `Leg ${cur.seq} of ${s.legs.length}` : "—"}
                          {cur && <span className="block text-[10.5px] text-mute-2">{cur.status}</span>}
                        </td>
                        <td className="px-3 py-3 text-mute">{next?.name ?? "—"}</td>
                        <td className="px-3 py-3 font-medium">{s.eta}</td>
                        <td className="px-3 py-3"><StageBadge stage={s.stage} exception={s.exception} /></td>
                        <td className="px-3 py-3 text-mute">{s.owner}</td>
                        <td className="relative px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <button type="button" aria-label={`Actions for ${s.id}`} onClick={() => setMenu(menu === s.id ? null : s.id)} className="rounded-md p-1 text-mute-2 hover:bg-ink/5">
                            <MoreHorizontal size={15} />
                          </button>
                          {menu === s.id && (
                            <div className="absolute right-3 top-10 z-20 w-44 rounded-lg border border-ink/10 bg-white py-1 shadow-lg">
                              {[
                                ["Open Shipment", `/app/shipments/${s.id}`],
                                ["Open Journey", `/app/shipments/${s.id}/journey`],
                                ["Milestones", `/app/shipments/${s.id}/milestones`],
                              ].map(([l, to]) => (
                                <Link key={l} to={to} className="block px-3 py-2 text-[12px] text-mist hover:bg-ink/4">{l}</Link>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 p-3 lg:hidden">
              {filtered.map((s) => {
                const cur = currentLeg(s);
                const next = nextMilestone(s);
                return (
                  <button key={s.id} type="button" onClick={() => navigate(`/app/shipments/${s.id}`)} className="w-full rounded-xl border border-ink/8 bg-white p-3.5 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[12px] font-medium text-accent">{s.id}</span>
                      <StageBadge stage={s.stage} exception={s.exception} />
                    </div>
                    <p className="mt-1.5 text-[13.5px] font-medium text-mist">{s.origin.split(",")[0]} → {s.destination.split(",")[0]}</p>
                    <p className="text-[11.5px] text-mute">{s.customer}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-mute-2">
                      <span>{cur ? `Leg ${cur.seq}/${s.legs.length} · ${cur.mode}` : "No legs"}</span>
                      <span>{next?.name ?? ""} · ETA {s.eta}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}

/* ---------------- New shipment from booking ---------------- */

export function ShipmentNewPage() {
  const [params] = useSearchParams();
  const bookingId = params.get("booking") ?? "";
  const { bookings, quoteById, rfqById, customerById } = useCommercial();
  const { createShipment } = useExecution();
  const booking = bookings.find((b) => b.id === bookingId) ?? bookings.find((b) => b.status === "Confirmed" || b.status === "Ready for Operations");

  const [owner, setOwner] = useState("A. Sharma");
  const [team, setTeam] = useState("Mumbai Ops");
  const [internalRef, setInternalRef] = useState("");
  const [start, setStart] = useState("2026-10-14");
  const [end, setEnd] = useState("2026-10-28");
  const [priority, setPriority] = useState<"Normal" | "High" | "Critical">("Normal");
  const [notes, setNotes] = useState("");
  const [created, setCreated] = useState<ExecShipment | null>(null);

  if (!booking) {
    return (
      <div className="p-6">
        <p className="text-mist">A confirmed booking is required to create a shipment.</p>
        <Link to="/app/bookings" className="mt-3 inline-block text-[13px] text-accent">Open bookings</Link>
      </div>
    );
  }

  const quote = quoteById(booking.quoteId);
  const rfq = rfqById(booking.rfqId);
  const customer = customerById(booking.customerId);
  const opt = quote?.options.find((o) => o.id === booking.optionId);

  function submit() {
    if (!booking || !rfq) return;
    const s = createShipment({
      customer: customer?.company ?? "—",
      customerId: booking.customerId,
      bookingId: booking.id,
      rfqId: booking.rfqId,
      quoteId: booking.quoteId,
      origin: rfq.origin,
      destination: rfq.destination,
      nodeIds: ["pune", "nhava"],
      cargo: `${rfq.cargo.commodity} · ${rfq.cargo.packages} ${rfq.cargo.packageType}`,
      service: rfq.service,
      owner,
      team,
      internalRef,
      priority,
      stage: "Booking",
      exception: false,
      eta: "TBC",
      created: "2026-10-12 14:00",
      plannedStart: start + " 09:00",
      plannedEnd: end + " 18:00",
      notes: notes ? [{ id: "nt-0", time: "2026-10-12 14:00", by: owner, text: notes }] : [],
      legs: [],
      milestones: [{ id: "M0", name: "Booking", planned: "2026-10-12 12:00", actual: "2026-10-12 12:00", status: "Completed", owner, customerVisible: true }],
      docsReady: 0,
      docsTotal: 4,
    });
    setCreated(s);
  }

  if (created) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-ink/8 bg-white p-8 text-center">
          <p className="eyebrow">Shipment created</p>
          <h1 className="mt-2 font-mono text-[24px] text-mist">{created.id}</h1>
          <p className="mt-2 text-[13px] text-mute">{created.origin} → {created.destination}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to={`/app/shipments/${created.id}/journey`} className="btn-primary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">Build Journey</Link>
            <Link to={`/app/shipments/${created.id}`} className="btn-secondary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">View Shipment</Link>
            <Link to="/app/shipments" className="h-10 px-3 text-[13px] leading-10 text-mute">Return to Shipments</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHead title="Create Master Shipment" sub={`From confirmed booking ${booking.id}`} />
      <div className="mt-4">
        <InheritedBanner>Inherited from Booking — commercial context stays linked and read-only.</InheritedBanner>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Panel title="Inherited from booking">
            <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
              <Info k="Customer" v={customer?.company ?? "—"} />
              <Info k="Booking" v={booking.id} />
              <Info k="RFQ" v={booking.rfqId} />
              <Info k="Quote" v={`${booking.quoteId} · ${opt?.name ?? ""}`} />
              <Info k="Origin" v={rfq?.origin ?? "—"} />
              <Info k="Destination" v={rfq?.destination ?? "—"} />
              <Info k="Cargo" v={rfq ? `${rfq.cargo.commodity} · ${rfq.cargo.packages} ${rfq.cargo.packageType}` : "—"} />
              <Info k="Service" v={rfq?.service ?? "—"} />
              <Info k="Selling price" v={opt ? inr(optionTotals(opt).selling) : "—"} />
              <Info k="Planned pickup" v={booking.plannedPickup || "TBC"} />
            </dl>
          </Panel>
          <Panel title="Operational setup">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Shipment Owner">
                <SelectInput value={owner} onChange={(e) => setOwner(e.target.value)}>
                  {OWNERS.map((o) => <option key={o}>{o}</option>)}
                </SelectInput>
              </Field>
              <Field label="Operations Team">
                <SelectInput value={team} onChange={(e) => setTeam(e.target.value)}>
                  {["Mumbai Ops", "Pune Ops", "Singapore Ops", "Houston Ops"].map((t) => <option key={t}>{t}</option>)}
                </SelectInput>
              </Field>
              <Field label="Internal Reference"><TextInput value={internalRef} onChange={(e) => setInternalRef(e.target.value)} placeholder="OPS-..." /></Field>
              <Field label="Priority">
                <SelectInput value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
                  <option>Normal</option><option>High</option><option>Critical</option>
                </SelectInput>
              </Field>
              <Field label="Planned Start"><TextInput type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
              <Field label="Planned Completion"><TextInput type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
              <Field label="Operational Notes" className="sm:col-span-2"><TextArea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
            </div>
          </Panel>
          <button type="button" onClick={submit} className="btn-primary h-11 rounded-lg px-5 text-[14px]">Create Shipment</button>
        </div>
        <aside className="space-y-3">
          <Panel title="What happens next">
            <ol className="list-decimal space-y-1.5 pl-4 text-[12.5px] text-mute">
              <li>Shipment ID is generated.</li>
              <li>Build the multimodal journey legs.</li>
              <li>Assign vendors and tracking references.</li>
              <li>Plan milestones and start execution.</li>
            </ol>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] text-mute-2">{k}</dt>
      <dd className="text-mist">{v}</dd>
    </div>
  );
}

/* ---------------- Shipment 360 ---------------- */

const TABS = ["Overview", "Journey", "Milestones", "Vendors", "Documents", "Customs", "Warehouse", "Costs", "Invoices", "Profitability", "Activity"];

export function Shipment360Page() {
  const { shipmentId } = useParams();
  const { byId, activityFor, exceptionsFor, setStage, cancelShipment, addNote, patchShipment } = useExecution();
  const { pushToast, session } = useApp();
  const navigate = useNavigate();
  const s = byId(shipmentId ?? "");
  const [tab, setTab] = useState("Overview");
  const [statusOpen, setStatusOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  if (!s) {
    return (
      <div className="p-6">
        <p className="text-mist">Unable to load shipment.</p>
        <button type="button" onClick={() => navigate(0)} className="btn-primary mt-3 h-9 rounded-lg px-3 text-[13px]">Retry</button>
      </div>
    );
  }

  const cur = currentLeg(s);
  const next = nextMilestone(s);
  const excs = exceptionsFor(s.id).filter((e) => e.status !== "Resolved" && e.status !== "Closed");
  const acts = activityFor(s.id);
  const stageIdx = STAGE_FLOW.indexOf(s.stage);
  const allowedNext = STAGE_FLOW.slice(Math.max(stageIdx, 4), stageIdx + 3).filter((x) => x !== s.stage) as ExecStage[];
  const isOps = session?.role !== "customer" && session?.role !== "vendor";

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[13px] font-medium text-accent">{s.id}</p>
          <h1 className="mt-1 text-[22px] font-medium tracking-tight text-mist sm:text-[25px]">
            {s.origin.split(",")[0]} → {s.destination.split(",")[0]}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-mute">
            <StageBadge stage={s.stage} exception={s.exception} />
            <span>{s.customer}</span>
            {s.priority !== "Normal" && <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-medium", s.priority === "Critical" ? "bg-bad/10 text-bad" : "bg-warn/10 text-warn")}>{s.priority} priority</span>}
            <span>Owner {s.owner}</span>
          </div>
        </div>
        {isOps && s.stage !== "Cancelled" && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setStatusOpen(true)} className="btn-primary h-10 rounded-lg px-3.5 text-[13px]">Update Status</button>
            <Link to={`/app/shipments/${s.id}/journey`} className="btn-secondary inline-flex h-10 items-center rounded-lg px-3.5 text-[13px]">Add Leg</Link>
            <Link to={`/app/shipments/${s.id}/milestones`} className="btn-secondary inline-flex h-10 items-center rounded-lg px-3.5 text-[13px]">Milestones</Link>
            <button type="button" onClick={() => setNoteOpen(true)} className="btn-secondary h-10 rounded-lg px-3.5 text-[13px]">Add Note</button>
            <button type="button" onClick={() => setCancelOpen(true)} className="h-10 rounded-lg border border-bad/25 px-3.5 text-[13px] text-bad hover:bg-bad/5">Cancel</button>
          </div>
        )}
      </div>

      {s.stage === "Cancelled" && s.cancelled && (
        <div className="mt-4 rounded-xl border border-bad/25 bg-bad/5 px-4 py-3 text-[13px] text-mist">
          Cancelled · {s.cancelled.reason}{s.cancelled.note ? ` — ${s.cancelled.note}` : ""}
        </div>
      )}

      <div className="mt-5"><HealthStrip s={s} /></div>

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-ink/8">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn("shrink-0 border-b-2 px-3 py-2.5 text-[13px] transition", tab === t ? "border-accent font-medium text-mist" : "border-transparent text-mute hover:text-mist")}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "Overview" && (
          <div className="grid gap-4 xl:grid-cols-3">
            <Panel title="Shipment summary" className="xl:col-span-1">
              <dl className="space-y-2.5 text-[13px]">
                <Info k="Customer" v={s.customer} />
                <Info k="Booking / RFQ" v={`${s.bookingId ?? "—"} · ${s.rfqId ?? "—"}`} />
                <Info k="Quote" v={s.quoteId ?? "—"} />
                <Info k="Cargo" v={s.cargo} />
                <Info k="Service" v={s.service} />
                <Info k="Created" v={fmtDT(s.created)} />
                <Info k="Planned window" v={`${fmtDT(s.plannedStart)} → ${fmtDT(s.plannedEnd)}`} />
                <Info k="Current ETA" v={s.eta} />
              </dl>
            </Panel>
            <Panel
              title="Current leg"
              className="xl:col-span-1"
              action={<Link to={`/app/shipments/${s.id}/journey`} className="text-[11.5px] font-medium text-accent">Open Journey</Link>}
            >
              {cur ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 text-[13.5px] font-medium text-mist">
                      <ModeIcon mode={cur.mode} size={15} className="text-accent" />
                      Leg {cur.seq} · {cur.origin} → {cur.destination}
                    </p>
                    <LegBadge status={cur.status} />
                  </div>
                  <p className="text-[12.5px] text-mute">{cur.vendor ?? "Vendor unassigned"}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <PlannedActual label="Departure" planned={cur.plannedDep} actual={cur.actualDep} />
                    <PlannedActual label="Arrival" planned={cur.plannedArr} actual={cur.actualArr} />
                  </div>
                  {Object.keys(cur.tracking).length > 0 && (
                    <p className="flex flex-wrap gap-1.5">
                      {Object.entries(cur.tracking).map(([k, v]) => <TrackingRef key={k} k={k} v={v} />)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-[13px] text-mute">No journey legs created yet.</p>
                  <Link to={`/app/shipments/${s.id}/journey`} className="btn-primary mt-3 inline-flex h-9 items-center rounded-lg px-3 text-[12.5px]">Build Journey</Link>
                </div>
              )}
            </Panel>
            <div className="space-y-4">
              <Panel title="Next milestone">
                {next ? (
                  <>
                    <p className="text-[14px] font-medium text-mist">{next.name}</p>
                    <p className="mt-1 text-[12px] text-mute">Plan {fmtDT(next.planned)} · {next.owner}</p>
                  </>
                ) : (
                  <p className="text-[12.5px] text-mute-2">All milestones complete.</p>
                )}
              </Panel>
              <Panel title={`Exceptions (${excs.length})`}>
                {excs.length === 0 ? (
                  <p className="flex items-center gap-2 text-[12.5px] text-mist"><span className="h-1.5 w-1.5 rounded-full bg-ok" /> Everything looks on track.</p>
                ) : (
                  <div className="space-y-2">
                    {excs.map((e) => <ExceptionCard key={e.id} e={e} onOpen={() => navigate("/app/control-tower/exceptions")} />)}
                  </div>
                )}
              </Panel>
            </div>
            <Panel title="Journey snapshot" className="xl:col-span-2">
              {s.legs.length === 0 ? (
                <p className="text-[13px] text-mute-2">No journey legs created yet.</p>
              ) : (
                <JourneyTimeline shipment={s} compact onLegClick={() => navigate(`/app/shipments/${s.id}/journey`)} />
              )}
            </Panel>
            <Panel title="Recent activity">
              <ul className="space-y-3">
                {acts.slice(0, 6).map((a) => (
                  <li key={a.id}>
                    <p className="text-[12.5px] text-mist">{a.summary}</p>
                    <p className="text-[10.5px] text-mute-2">{fmtDT(a.time)} · {a.by} · {a.action}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        )}
        {tab === "Journey" && (
          <Panel title="Journey" action={<Link to={`/app/shipments/${s.id}/journey`} className="text-[11.5px] font-medium text-accent">Open Journey Builder</Link>}>
            {s.legs.length === 0 ? <p className="text-[13px] text-mute-2">No journey legs created yet.</p> : <JourneyTimeline shipment={s} onLegClick={() => navigate(`/app/shipments/${s.id}/journey`)} />}
          </Panel>
        )}
        {tab === "Milestones" && (
          <Panel title="Milestones" action={<Link to={`/app/shipments/${s.id}/milestones`} className="text-[11.5px] font-medium text-accent">Open Milestones</Link>}>
            <MilestonePreview sid={s.id} />
          </Panel>
        )}
        {tab === "Vendors" && (
          <Panel title="Assigned vendors" bodyClass="p-0">
            {s.legs.filter((l) => l.vendor).length === 0 ? (
              <p className="p-6 text-[13px] text-mute-2">No vendors assigned yet. Assign from the Journey Builder.</p>
            ) : (
              s.legs.filter((l) => l.vendor).map((l) => (
                <div key={l.id} className="flex items-center justify-between border-b border-ink/5 px-4 py-3 text-[13px] last:border-0">
                  <span className="flex items-center gap-2"><ModeIcon mode={l.mode} size={13} className="text-mute-2" /> {l.vendor}</span>
                  <span className="text-mute">Leg {l.seq} · {l.origin} → {l.destination}</span>
                  <LegBadge status={l.status} />
                </div>
              ))
            )}
          </Panel>
        )}
        {tab === "Documents" && (
          <Panel title="Documents">
            <p className="text-[13px] text-mute">{s.docsReady} of {s.docsTotal} documents ready. The full document vault opens in the Document Control phase.</p>
            <button type="button" onClick={() => pushToast("info", "Upload queued", "Document vault arrives next phase.")} className="btn-secondary mt-3 h-9 rounded-lg px-3 text-[12.5px]">Upload Document</button>
          </Panel>
        )}
        {["Customs", "Warehouse", "Costs", "Invoices", "Profitability"].includes(tab) && (
          <Panel>
            <div className="py-8 text-center">
              <p className="text-[14px] font-medium text-mist">{tab} workspace</p>
              <p className="mx-auto mt-1 max-w-sm text-[12.5px] text-mute">Reserved on the master shipment. Deep {tab.toLowerCase()} workflows open in a later CargoOS phase.</p>
            </div>
          </Panel>
        )}
        {tab === "Activity" && (
          <Panel title="Activity history">
            <ul className="space-y-4">
              {acts.map((a) => (
                <li key={a.id} className="relative border-l border-ink/10 pl-4">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-accent" />
                  <p className="text-[13px] text-mist"><span className="font-medium">{a.action}</span> — {a.summary}</p>
                  <p className="text-[11px] text-mute-2">{fmtDT(a.time)} · {a.by}</p>
                </li>
              ))}
              {s.notes.map((n) => (
                <li key={n.id} className="relative border-l border-ink/10 pl-4">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-warn" />
                  <p className="text-[13px] text-mist"><span className="font-medium">Note</span> — {n.text}</p>
                  <p className="text-[11px] text-mute-2">{fmtDT(n.time)} · {n.by} · Internal</p>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      {/* Status dialog */}
      <Dialog open={statusOpen} title="Update shipment status" onClose={() => setStatusOpen(false)}>
        <p className="text-[12.5px] text-mute">Current stage · <strong className="text-mist">{s.stage}</strong></p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {allowedNext.map((st) => (
            <button key={st} type="button" onClick={() => { setStage(s.id, st); if (st === "Completed") patchShipment(s.id, { exception: false }); setStatusOpen(false); }} className="rounded-lg border border-ink/10 px-3 py-2.5 text-[13px] text-mist transition hover:border-accent/40 hover:bg-accent/5">
              {st}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-mute-2">Only adjacent stages are offered to avoid unsafe jumps.</p>
      </Dialog>

      {/* Cancel */}
      <Dialog open={cancelOpen} title={`Cancel ${s.id}?`} onClose={() => setCancelOpen(false)}>
        <p className="text-[12.5px] text-mute">This is a significant action. History is preserved, but execution stops.</p>
        <Field label="Cancellation Reason" required className="mt-3">
          <SelectInput value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
            <option value="">Select reason…</option>
            {["Customer cancelled", "Commercial change", "Cargo not ready", "Force majeure", "Other"].map((r) => <option key={r}>{r}</option>)}
          </SelectInput>
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary h-9 rounded-lg px-3 text-[13px]" onClick={() => setCancelOpen(false)}>Keep shipment</button>
          <button type="button" disabled={!cancelReason} onClick={() => { cancelShipment(s.id, cancelReason); setCancelOpen(false); }} className="h-9 rounded-lg bg-bad px-3 text-[13px] text-white disabled:opacity-50">Cancel Shipment</button>
        </div>
      </Dialog>

      {/* Note */}
      <Dialog open={noteOpen} title="Add internal note" onClose={() => setNoteOpen(false)}>
        <Field label="Note">
          <TextArea value={noteText} onChange={(e) => setNoteText(e.target.value)} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary h-9 rounded-lg px-3 text-[13px]" onClick={() => setNoteOpen(false)}>Cancel</button>
          <button type="button" disabled={!noteText.trim()} onClick={() => { addNote(s.id, noteText.trim()); setNoteText(""); setNoteOpen(false); }} className="btn-primary h-9 rounded-lg px-3 text-[13px] disabled:opacity-50">Save Note</button>
        </div>
      </Dialog>
    </div>
  );
}

function MilestonePreview({ sid }: { sid: string }) {
  const { byId } = useExecution();
  const s = byId(sid);
  if (!s) return null;
  const upcoming = s.milestones.filter((m) => !m.actual).slice(0, 4);
  return (
    <ul className="space-y-2.5">
      {upcoming.length === 0 && <p className="text-[12.5px] text-mute-2">All milestones complete.</p>}
      {upcoming.map((m) => (
        <li key={m.id} className="flex items-center justify-between rounded-lg border border-ink/6 bg-paper/60 px-3 py-2.5 text-[12.5px]">
          <span className="font-medium text-mist">{m.name}</span>
          <span className="text-mute-2">{fmtDT(m.planned)}</span>
        </li>
      ))}
    </ul>
  );
}

export { Skel };
