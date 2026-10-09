import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Plus, Search } from "lucide-react";
import { useExecution } from "@/state/ExecutionContext";
import { useApp } from "@/state/AppContext";
import {
  BOARD,
  EXC_TYPES,
  OPS_FEED,
  currentLeg,
  fmtDT,
  nextMilestone,
  type ExcSeverity,
  type ExceptionX,
  type ExecShipment,
} from "@/lib/execution";
import { OWNERS } from "@/lib/commercial";
import {
  Dialog,
  Drawer,
  Field,
  KpiStrip,
  PageHead,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/commercial/ui";
import {
  ExceptionCard,
  JourneyTimeline,
  ModeIcon,
  SevBadge,
  StageBadge,
} from "@/components/execution/ui";
import { FilterBarShell, FilterSelect, ClearFilters, opts } from "@/components/app/shared/Filters";
import { Panel, SegTabs, Skel } from "@/components/app/shared/primitives";
import { cn } from "@/utils/cn";

const AppMap = lazy(() => import("@/components/app/AppMap"));

export default function ControlTowerPage() {
  const { shipments, exceptions } = useExecution();
  const [preview, setPreview] = useState<ExecShipment | null>(null);
  const [mode, setMode] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [board, setBoard] = useState<"departures" | "arrivals">("departures");
  const [reportFor, setReportFor] = useState<ExecShipment | null>(null);

  const active = shipments.filter((s) => !["Completed", "Cancelled"].includes(s.stage));
  const openExc = exceptions.filter((e) => e.status !== "Resolved" && e.status !== "Closed");

  const feedShipments = useMemo(
    () =>
      active.filter((s) => {
        if (mode.length && !s.legs.some((l) => mode.includes(l.mode))) return false;
        if (status.length && !status.includes(s.stage)) return false;
        return true;
      }),
    [active, mode, status],
  );

  return (
    <div className="p-4 sm:p-6">
      <PageHead
        title="Control Tower"
        sub="Live movement, risk and network monitoring across all active shipments."
        actions={
          <Link to="/app/control-tower/exceptions" className="btn-secondary inline-flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-[13px]">
            <AlertTriangle size={14} className="text-warn" /> Exception Center ({openExc.length})
          </Link>
        }
      />
      <div className="mt-5">
        <KpiStrip
          items={[
            { label: "Active Shipments", value: active.length },
            { label: "On Time", value: active.filter((s) => !s.exception && !s.legs.some((l) => l.status === "Delayed")).length, tone: "text-ok" },
            { label: "At Risk", value: active.filter((s) => s.exception && !s.legs.some((l) => l.status === "Delayed")).length, tone: "text-warn" },
            { label: "Delayed", value: active.filter((s) => s.legs.some((l) => l.status === "Delayed")).length, tone: "text-warn" },
            { label: "Critical Exceptions", value: openExc.filter((e) => e.severity === "Critical").length, tone: "text-bad" },
            { label: "Arrivals Today", value: 2 },
            { label: "Departures Today", value: 2 },
          ]}
        />
      </div>

      <div className="mt-4">
        <FilterBarShell>
          <FilterSelect label="Mode" options={opts(["Road", "Ocean", "Air", "Rail"])} value={mode} onChange={setMode} />
          <FilterSelect label="Status" options={opts(["Pickup", "Gate-In", "In Transit", "Transshipment", "Destination", "Delivery"])} value={status} onChange={setStatus} />
          {(mode.length || status.length) > 0 && <ClearFilters onClear={() => { setMode([]); setStatus([]); }} />}
        </FilterBarShell>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Network map" sub="Click a route to open the shipment preview" className="xl:col-span-2" bodyClass="h-[380px] p-3 sm:h-[440px]">
          <Suspense fallback={<Skel className="h-full w-full" />}>
            <AppMap
              modeFilter={mode.map((m) => (m === "Ocean" ? "Sea" : m))}
              onOpen={(id) => {
                const s = shipments.find((x) => x.id === id) ?? feedShipments[0];
                if (s) setPreview(s);
              }}
            />
          </Suspense>
        </Panel>
        <div className="space-y-4">
          <Panel title="Live operations feed" bodyClass="p-0">
            <ul className="max-h-[210px] overflow-y-auto">
              {OPS_FEED.map((f, i) => (
                <li key={i} className="flex gap-3 border-b border-ink/5 px-4 py-2.5 text-[12px] last:border-0">
                  <span className="shrink-0 font-mono text-[11px] text-mute-2">{f.time}</span>
                  <span className="text-mist">{f.text}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel
            title="Arrivals & departures"
            action={
              <SegTabs
                tabs={[{ id: "departures" as const, label: "Departures" }, { id: "arrivals" as const, label: "Arrivals" }]}
                value={board}
                onChange={setBoard}
              />
            }
            bodyClass="p-0"
          >
            <ul>
              {BOARD[board].map((r, i) => (
                <li key={i} className="flex items-center gap-3 border-b border-ink/5 px-4 py-2.5 text-[12px] last:border-0">
                  <span className="w-[86px] shrink-0 font-mono text-[10.5px] text-mute">{r.time}</span>
                  <button type="button" onClick={() => { const s = shipments.find((x) => x.id === r.shipment); if (s) setPreview(s); }} className="font-mono text-[11px] text-accent hover:underline">
                    {r.shipment.slice(-6)}
                  </button>
                  <span className="min-w-0 flex-1 truncate text-mute">{r.location}</span>
                  <span className={cn("text-[10.5px] font-medium", r.status === "Delayed" ? "text-warn" : r.status === "Completed" ? "text-ok" : "text-mute-2")}>{r.status}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title="Active shipments" sub="Filtered network list" className="mt-4" bodyClass="p-0">
        {feedShipments.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-mute">No active shipments for the selected filters.</p>
        ) : (
          <ul className="divide-y divide-ink/5">
            {feedShipments.map((s) => {
              const cur = currentLeg(s);
              return (
                <li key={s.id}>
                  <button type="button" onClick={() => setPreview(s)} className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition hover:bg-accent/4">
                    <span className="font-mono text-[11.5px] font-medium text-accent">{s.id}</span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-mist">{s.origin.split(",")[0]} → {s.destination.split(",")[0]}</span>
                    <span className="hidden gap-1.5 text-mute sm:flex">
                      {[...new Set(s.legs.map((l) => l.mode))].map((m) => <ModeIcon key={m} mode={m} size={13} />)}
                    </span>
                    <span className="hidden text-[11.5px] text-mute-2 md:inline">{cur ? `Leg ${cur.seq}/${s.legs.length}` : "—"}</span>
                    <StageBadge stage={s.stage} exception={s.exception} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {/* Preview drawer */}
      {preview && (
        <Drawer open title={preview.id} onClose={() => setPreview(null)} wide>
          <ShipPreview s={preview} onReport={() => { setReportFor(preview); setPreview(null); }} />
        </Drawer>
      )}

      {reportFor && (
        <ReportExceptionDialog s={reportFor} onClose={() => setReportFor(null)} />
      )}
    </div>
  );
}

function ShipPreview({ s, onReport }: { s: ExecShipment; onReport: () => void }) {
  const { exceptionsFor } = useExecution();
  const navigate = useNavigate();
  const cur = currentLeg(s);
  const next = nextMilestone(s);
  const excs = exceptionsFor(s.id).filter((e) => e.status !== "Resolved" && e.status !== "Closed");
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-medium text-mist">{s.customer}</p>
        <p className="text-[12.5px] text-mute">{s.origin} → {s.destination}</p>
        <div className="mt-2"><StageBadge stage={s.stage} exception={s.exception} /></div>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-[12.5px]">
        <div><dt className="text-mute-2">Current leg</dt><dd className="text-mist">{cur ? `Leg ${cur.seq} · ${cur.mode}` : "—"}</dd></div>
        <div><dt className="text-mute-2">Stage location</dt><dd className="text-mist">{cur ? cur.origin : s.origin}</dd></div>
        <div><dt className="text-mute-2">Next milestone</dt><dd className="text-mist">{next?.name ?? "—"}</dd></div>
        <div><dt className="text-mute-2">ETA</dt><dd className="text-mist">{s.eta}</dd></div>
        <div><dt className="text-mute-2">Owner</dt><dd className="text-mist">{s.owner}</dd></div>
        <div><dt className="text-mute-2">Exceptions</dt><dd className={excs.length ? "text-bad" : "text-ok"}>{excs.length || "None"}</dd></div>
      </dl>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute-2">Journey</p>
        <JourneyTimeline shipment={s} compact />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-ink/8 pt-4">
        <button type="button" onClick={() => navigate(`/app/shipments/${s.id}`)} className="btn-primary h-10 flex-1 rounded-lg text-[13px]">Open Shipment</button>
        <button type="button" onClick={() => navigate(`/app/shipments/${s.id}/journey`)} className="btn-secondary h-10 rounded-lg px-3 text-[13px]">Journey</button>
        <button type="button" onClick={onReport} className="h-10 rounded-lg border border-bad/25 px-3 text-[13px] text-bad hover:bg-bad/5">Report Exception</button>
      </div>
    </div>
  );
}

export function ReportExceptionDialog({ s, onClose }: { s: ExecShipment; onClose: () => void }) {
  const { reportException } = useExecution();
  const [type, setType] = useState(EXC_TYPES[0]);
  const [severity, setSeverity] = useState<ExcSeverity>("Medium");
  const [legId, setLegId] = useState("");
  const [desc, setDesc] = useState("");
  const [owner, setOwner] = useState("A. Sharma");
  const [due, setDue] = useState("2026-10-14T18:00");
  const [visible, setVisible] = useState(false);

  return (
    <Dialog open title={`Report exception · ${s.id}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Exception Type">
            <SelectInput value={type} onChange={(e) => setType(e.target.value)}>
              {EXC_TYPES.map((t) => <option key={t}>{t}</option>)}
            </SelectInput>
          </Field>
          <Field label="Severity">
            <SelectInput value={severity} onChange={(e) => setSeverity(e.target.value as ExcSeverity)}>
              {["Low", "Medium", "High", "Critical"].map((x) => <option key={x}>{x}</option>)}
            </SelectInput>
          </Field>
        </div>
        <Field label="Related Leg">
          <SelectInput value={legId} onChange={(e) => setLegId(e.target.value)}>
            <option value="">Shipment level</option>
            {s.legs.map((l) => <option key={l.id} value={l.id}>Leg {l.seq} · {l.origin} → {l.destination}</option>)}
          </SelectInput>
        </Field>
        <Field label="Description" required>
          <TextArea value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Owner">
            <SelectInput value={owner} onChange={(e) => setOwner(e.target.value)}>
              {OWNERS.map((o) => <option key={o}>{o}</option>)}
            </SelectInput>
          </Field>
          <Field label="Expected Resolution">
            <TextInput type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-mist">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="accent-accent" />
          Customer visible
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary h-9 rounded-lg px-3 text-[13px]" onClick={onClose}>Cancel</button>
          <button
            type="button"
            disabled={!desc.trim()}
            onClick={() => {
              reportException({ type, severity, shipmentId: s.id, legId: legId || undefined, description: desc.trim(), owner, due: due.replace("T", " "), customerVisible: visible });
              onClose();
            }}
            className="h-9 rounded-lg bg-bad px-3 text-[13px] text-white disabled:opacity-50"
          >
            Report Exception
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ---------------- Exception Center ---------------- */

export function ExceptionCenterPage() {
  const { exceptions, patchException, resolveException, shipments } = useExecution();
  const { pushToast } = useApp();
  const [q, setQ] = useState("");
  const [sev, setSev] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [resolving, setResolving] = useState<ExceptionX | null>(null);
  const [assigning, setAssigning] = useState<ExceptionX | null>(null);
  const [resolution, setResolution] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [newOwner, setNewOwner] = useState(OWNERS[0]);
  const [reportFor, setReportFor] = useState<ExecShipment | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return exceptions.filter((e) => {
      if (sev.length && !sev.includes(e.severity)) return false;
      if (status.length && !status.includes(e.status)) return false;
      if (!query) return true;
      return e.id.toLowerCase().includes(query) || e.shipmentId.toLowerCase().includes(query) || e.type.toLowerCase().includes(query) || e.description.toLowerCase().includes(query);
    });
  }, [exceptions, q, sev, status]);

  const open = exceptions.filter((e) => e.status !== "Resolved" && e.status !== "Closed");

  return (
    <div className="p-4 sm:p-6">
      <PageHead
        title="Exceptions"
        sub="Global operational exception queue across all shipments."
        actions={
          <>
            <Link to="/app/control-tower" className="btn-secondary inline-flex h-10 items-center rounded-lg px-3.5 text-[13px]">Control Tower</Link>
            <button type="button" onClick={() => setReportFor(shipments[0])} className="btn-primary inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px]">
              <Plus size={14} /> Report Exception
            </button>
          </>
        }
      />
      <div className="mt-5">
        <KpiStrip
          items={[
            { label: "Critical", value: open.filter((e) => e.severity === "Critical").length, tone: "text-bad" },
            { label: "High", value: open.filter((e) => e.severity === "High").length, tone: "text-warn" },
            { label: "Open", value: open.length },
            { label: "Overdue", value: open.filter((e) => e.due < "2026-10-12 14:00").length, tone: "text-warn" },
            { label: "Resolved Today", value: exceptions.filter((e) => e.status === "Resolved").length, tone: "text-ok" },
          ]}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exception, shipment, type..." className="h-9 w-[250px] rounded-lg border border-ink/10 bg-white pl-8 pr-3 text-[13px] focus:border-accent focus:outline-none" />
        </label>
        <FilterBarShell>
          <FilterSelect label="Severity" options={opts(["Low", "Medium", "High", "Critical"])} value={sev} onChange={setSev} />
          <FilterSelect label="Status" options={opts(["Open", "Assigned", "In Progress", "Resolved", "Closed"])} value={status} onChange={setStatus} />
          {(sev.length || status.length) > 0 && <ClearFilters onClear={() => { setSev([]); setStatus([]); }} />}
        </FilterBarShell>
      </div>

      {filtered.length === 0 ? (
        <Panel className="mt-4">
          <p className="flex items-center justify-center gap-2 py-10 text-[13.5px] text-mist">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            No active exceptions. Everything looks on track.
          </p>
        </Panel>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {filtered.map((e) => (
            <ExceptionCard
              key={e.id}
              e={e}
              actions={
                e.status !== "Resolved" && e.status !== "Closed" ? (
                  <>
                    <button type="button" onClick={() => { setAssigning(e); setNewOwner(e.owner); }} className="text-[11.5px] font-medium text-mist hover:text-accent">Assign</button>
                    <button type="button" onClick={() => { setResolving(e); setResolution(""); setRootCause(""); }} className="text-[11.5px] font-medium text-ok">Resolve</button>
                    <Link to={`/app/shipments/${e.shipmentId}`} className="text-[11.5px] text-mute-2 hover:text-mist">Open Shipment</Link>
                  </>
                ) : (
                  <Link to={`/app/shipments/${e.shipmentId}`} className="text-[11.5px] text-mute-2 hover:text-mist">Open Shipment</Link>
                )
              }
            />
          ))}
        </div>
      )}

      {/* Assign */}
      <Dialog open={assigning !== null} title={`Assign ${assigning?.id}`} onClose={() => setAssigning(null)}>
        <Field label="Owner">
          <SelectInput value={newOwner} onChange={(e) => setNewOwner(e.target.value)}>
            {OWNERS.map((o) => <option key={o}>{o}</option>)}
          </SelectInput>
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary h-9 rounded-lg px-3 text-[13px]" onClick={() => setAssigning(null)}>Cancel</button>
          <button
            type="button"
            onClick={() => {
              if (assigning) {
                patchException(assigning.id, { owner: newOwner, status: "Assigned" });
                pushToast("success", "Exception assigned", `${assigning.id} → ${newOwner}`);
              }
              setAssigning(null);
            }}
            className="btn-primary h-9 rounded-lg px-3 text-[13px]"
          >
            Assign
          </button>
        </div>
      </Dialog>

      {/* Resolve */}
      <Dialog open={resolving !== null} title={`Resolve ${resolving?.id}`} onClose={() => setResolving(null)}>
        <Field label="Resolution Note" required>
          <TextArea value={resolution} onChange={(e) => setResolution(e.target.value)} />
        </Field>
        <Field label="Root Cause (optional)" className="mt-3">
          <TextInput value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary h-9 rounded-lg px-3 text-[13px]" onClick={() => setResolving(null)}>Cancel</button>
          <button
            type="button"
            disabled={!resolution.trim()}
            onClick={() => {
              if (resolving) resolveException(resolving.id, resolution.trim(), rootCause || undefined);
              setResolving(null);
            }}
            className="h-9 rounded-lg bg-ok px-3 text-[13px] text-white disabled:opacity-50"
          >
            Resolve Exception
          </button>
        </div>
      </Dialog>

      {reportFor && <ReportExceptionDialog s={reportFor} onClose={() => setReportFor(null)} />}
    </div>
  );
}

export { SevBadge, fmtDT };
