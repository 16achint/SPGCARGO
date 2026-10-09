import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useExecution } from "@/state/ExecutionContext";
import { useApp } from "@/state/AppContext";
import { VENDORS } from "@/lib/mock";
import {
  MODE_TRACKING_FIELDS,
  fmtDT,
  msEffectiveStatus,
  type Leg,
  type LegMode,
  type LegStatus,
  type MilestoneX,
} from "@/lib/execution";
import {
  Dialog,
  Drawer,
  Field,
  PageHead,
  SelectInput,
  TextArea,
  TextInput,
  Warn,
} from "@/components/commercial/ui";
import {
  JourneyTimeline,
  LegBadge,
  MilestoneTimeline,
  ModeIcon,
  PlannedActual,
  TrackingRef,
} from "@/components/execution/ui";
import { Panel } from "@/components/app/shared/primitives";
import { cn } from "@/utils/cn";

const MODE_DETAIL_FIELDS: Record<LegMode, string[]> = {
  Ocean: ["FCL/LCL", "Container Type", "Carrier", "Vessel", "Voyage", "POL", "POD", "Booking No."],
  Air: ["Airline", "Flight", "Airport of Departure", "Airport of Arrival"],
  Road: ["Transporter", "Vehicle Type", "Vehicle No.", "Driver", "Pickup Point", "Delivery Point"],
  Rail: ["Rail Operator", "Train/Service", "ICD", "Port/Terminal"],
};

export default function JourneyPage() {
  const { shipmentId } = useParams();
  const { byId, addLeg, removeLeg, moveLeg, log } = useExecution();
  const { pushToast, session } = useApp();
  const s = byId(shipmentId ?? "");
  const [addOpen, setAddOpen] = useState(false);
  const [drawerLeg, setDrawerLeg] = useState<string | null>(null);
  const [deleteLeg, setDeleteLeg] = useState<Leg | null>(null);
  const isOps = session?.role !== "customer" && session?.role !== "vendor";

  if (!s) return <div className="p-6">Unable to load shipment. <Link to="/app/shipments" className="text-accent">Back</Link></div>;

  const executionStarted = s.legs.some((l) => l.status !== "Planned" && l.status !== "Ready");
  const modes = [...new Set(s.legs.map((l) => l.mode))];
  const continuityWarnings = s.legs
    .slice(0, -1)
    .map((l, i) => ({ a: l, b: s.legs[i + 1] }))
    .filter(({ a, b }) => a.destination.split(",")[0].trim().toLowerCase() !== b.origin.split(",")[0].trim().toLowerCase());

  const leg = s.legs.find((l) => l.id === drawerLeg) ?? null;

  return (
    <div className="p-4 sm:p-6">
      <PageHead
        title="Journey Builder"
        sub={`${s.id} · ${s.customer}`}
        actions={
          <>
            <Link to={`/app/shipments/${s.id}`} className="btn-secondary inline-flex h-10 items-center rounded-lg px-3.5 text-[13px]">Back to Shipment</Link>
            {isOps && (
              <button type="button" onClick={() => setAddOpen(true)} className="btn-primary inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px]">
                <Plus size={14} /> Add Leg
              </button>
            )}
          </>
        }
      />

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {continuityWarnings.map(({ a, b }) => (
            <Warn key={a.id + b.id}>
              Continuity gap: Leg {a.seq} ends at <strong>{a.destination}</strong> but Leg {b.seq} starts at <strong>{b.origin}</strong>. Verify handoff.
            </Warn>
          ))}
          {s.legs.length === 0 ? (
            <Panel>
              <div className="py-10 text-center">
                <p className="text-[14px] font-medium text-mist">No journey legs created yet.</p>
                <p className="mt-1 text-[12.5px] text-mute">A shipment needs at least one leg before execution can begin.</p>
                <button type="button" onClick={() => setAddOpen(true)} className="btn-primary mt-4 inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px]">
                  <Plus size={14} /> Build Journey
                </button>
              </div>
            </Panel>
          ) : (
            <Panel title="Execution view" sub="Click a leg to manage vendor, dates, tracking and milestones">
              <ol className="space-y-3">
                {s.legs.map((l, i) => {
                  const active = ["In Progress", "Delayed", "Exception"].includes(l.status);
                  return (
                    <li key={l.id} className={cn("rounded-xl border p-4 transition", active ? "border-cyan/40 bg-cyan/4" : "border-ink/8 bg-white")}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <button type="button" onClick={() => setDrawerLeg(l.id)} className="flex items-center gap-2.5 text-left">
                          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", active ? "bg-cyan/15 text-cyan" : l.status === "Completed" ? "bg-ok/10 text-ok" : "bg-ink/6 text-mute")}>
                            <ModeIcon mode={l.mode} size={16} />
                          </span>
                          <span>
                            <span className="block text-[13.5px] font-medium text-mist">Leg {l.seq} · {l.origin} → {l.destination}</span>
                            <span className="block text-[11.5px] text-mute">{l.mode} · {l.vendor ?? "Vendor unassigned"}</span>
                          </span>
                        </button>
                        <span className="flex items-center gap-2">
                          <LegBadge status={l.status} />
                          {isOps && !executionStarted && (
                            <span className="flex gap-0.5">
                              <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => moveLeg(s.id, l.id, -1)} className="rounded p-1 text-mute-2 hover:bg-ink/5 disabled:opacity-30"><ArrowUp size={13} /></button>
                              <button type="button" aria-label="Move down" disabled={i === s.legs.length - 1} onClick={() => moveLeg(s.id, l.id, 1)} className="rounded p-1 text-mute-2 hover:bg-ink/5 disabled:opacity-30"><ArrowDown size={13} /></button>
                            </span>
                          )}
                          {isOps && l.status === "Planned" && (
                            <button type="button" aria-label="Delete leg" onClick={() => setDeleteLeg(l)} className="rounded p-1 text-bad/70 hover:bg-bad/5"><Trash2 size={13} /></button>
                          )}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <PlannedActual label="Departure" planned={l.plannedDep} actual={l.actualDep} />
                        <PlannedActual label="Arrival" planned={l.plannedArr} actual={l.actualArr} />
                        <div className="col-span-2">
                          <p className="text-[10.5px] text-mute-2">Tracking</p>
                          {Object.keys(l.tracking).length === 0 ? (
                            <p className="text-[12px] text-warn">Reference missing</p>
                          ) : (
                            <p className="mt-0.5 flex flex-wrap gap-1.5">
                              {Object.entries(l.tracking).map(([k, v]) => <TrackingRef key={k} k={k} v={v} />)}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Panel>
          )}
        </div>
        <aside className="space-y-3">
          <Panel title="Journey summary">
            <dl className="space-y-2 text-[12.5px]">
              <Sum k="Total Legs" v={String(s.legs.length)} />
              <Sum k="Modes" v={modes.join(" + ") || "—"} />
              <Sum k="Planned Start" v={fmtDT(s.legs[0]?.plannedDep)} />
              <Sum k="Planned End" v={fmtDT(s.legs[s.legs.length - 1]?.plannedArr)} />
              <Sum k="Completed" v={`${s.legs.filter((l) => l.status === "Completed").length} legs`} />
            </dl>
          </Panel>
          {s.legs.length > 0 && (
            <Panel title="Route">
              <JourneyTimeline shipment={s} compact />
            </Panel>
          )}
        </aside>
      </div>

      <AddLegDrawer open={addOpen} onClose={() => setAddOpen(false)} onSave={(l) => { addLeg(s.id, l); setAddOpen(false); }} prevDestination={s.legs[s.legs.length - 1]?.destination} />
      {leg && <LegDrawer sid={s.id} leg={leg} onClose={() => setDrawerLeg(null)} isOps={isOps} />}

      <Dialog open={deleteLeg !== null} title={`Delete Leg ${deleteLeg?.seq}?`} onClose={() => setDeleteLeg(null)}>
        <p className="text-[13px] text-mute">This planned leg will be removed from the journey.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary h-9 rounded-lg px-3 text-[13px]" onClick={() => setDeleteLeg(null)}>Keep</button>
          <button
            type="button"
            className="h-9 rounded-lg bg-bad px-3 text-[13px] text-white"
            onClick={() => {
              if (deleteLeg) removeLeg(s.id, deleteLeg.id);
              setDeleteLeg(null);
              pushToast("info", "Leg removed");
              log(s.id, "Journey updated", "Planned leg deleted.");
            }}
          >
            Delete Leg
          </button>
        </div>
      </Dialog>
    </div>
  );
}

function Sum({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-mute">{k}</dt>
      <dd className="font-medium text-mist">{v}</dd>
    </div>
  );
}

/* ---------- Add leg ---------- */

function AddLegDrawer({
  open,
  onClose,
  onSave,
  prevDestination,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (leg: Omit<Leg, "id" | "seq">) => void;
  prevDestination?: string;
}) {
  const [mode, setMode] = useState<LegMode>("Road");
  const [origin, setOrigin] = useState(prevDestination ?? "");
  const [destination, setDestination] = useState("");
  const [vendor, setVendor] = useState("");
  const [dep, setDep] = useState("2026-10-14T09:00");
  const [arr, setArr] = useState("2026-10-14T18:00");
  const [notes, setNotes] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  const errs = {
    origin: !origin.trim() ? "Origin is required." : "",
    destination: !destination.trim() ? "Destination is required." : "",
    dates: dep && arr && arr < dep ? "Arrival cannot precede departure." : "",
  };
  const valid = !errs.origin && !errs.destination && !errs.dates;

  function save() {
    setTouched(true);
    if (!valid) return;
    onSave({
      mode,
      origin: origin.trim(),
      destination: destination.trim(),
      vendor: vendor || undefined,
      plannedDep: dep.replace("T", " "),
      plannedArr: arr.replace("T", " "),
      status: "Planned",
      tracking: {},
      details,
      notes: notes || undefined,
    });
    setOrigin(destination);
    setDestination("");
    setVendor("");
    setDetails({});
    setTouched(false);
  }

  return (
    <Drawer open={open} title="Add Journey Leg" onClose={onClose} wide>
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-[12px] font-medium text-mist/80">Mode <span className="text-bad">*</span></p>
          <div className="grid grid-cols-4 gap-2">
            {(["Road", "Ocean", "Air", "Rail"] as LegMode[]).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} className={cn("flex flex-col items-center gap-1.5 rounded-xl border py-3 text-[12px] font-medium transition", mode === m ? "border-accent bg-accent/5 text-accent" : "border-ink/10 text-mute hover:border-ink/20")}>
                <ModeIcon mode={m} size={17} />
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Origin" required error={touched ? errs.origin : ""}>
            <TextInput value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </Field>
          <Field label="Destination" required error={touched ? errs.destination : ""}>
            <TextInput value={destination} onChange={(e) => setDestination(e.target.value)} />
          </Field>
          <Field label="Vendor / Carrier">
            <SelectInput value={vendor} onChange={(e) => setVendor(e.target.value)}>
              <option value="">Assign later…</option>
              {VENDORS.map((v) => <option key={v}>{v}</option>)}
            </SelectInput>
          </Field>
          <div />
          <Field label="Planned Departure" required>
            <TextInput type="datetime-local" value={dep} onChange={(e) => setDep(e.target.value)} />
          </Field>
          <Field label="Planned Arrival" required error={errs.dates}>
            <TextInput type="datetime-local" value={arr} onChange={(e) => setArr(e.target.value)} />
          </Field>
        </div>
        <div className="rounded-xl border border-ink/8 bg-paper/60 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute-2">{mode} details</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {MODE_DETAIL_FIELDS[mode].map((f) => (
              <Field key={f} label={f}>
                <TextInput value={details[f] ?? ""} onChange={(e) => setDetails((d) => ({ ...d, [f]: e.target.value }))} />
              </Field>
            ))}
          </div>
        </div>
        <Field label="Notes">
          <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <button type="button" onClick={save} className="btn-primary h-11 w-full rounded-lg text-[13.5px]">Add Leg to Journey</button>
      </div>
    </Drawer>
  );
}

/* ---------- Leg drawer ---------- */

function LegDrawer({ sid, leg, onClose, isOps }: { sid: string; leg: Leg; onClose: () => void; isOps: boolean }) {
  const { byId, patchLeg, log } = useExecution();
  const { pushToast } = useApp();
  const s = byId(sid)!;
  const [vendor, setVendor] = useState(leg.vendor ?? "");
  const [trackKey, setTrackKey] = useState(MODE_TRACKING_FIELDS[leg.mode][0]);
  const [trackVal, setTrackVal] = useState("");
  const [actualDep, setActualDep] = useState(leg.actualDep?.replace(" ", "T") ?? "");
  const [actualArr, setActualArr] = useState(leg.actualArr?.replace(" ", "T") ?? "");
  const legMilestones = s.milestones.filter((m) => m.legId?.startsWith(leg.id.split("-")[0]));

  function saveVendor() {
    patchLeg(sid, leg.id, { vendor: vendor || undefined });
    log(sid, "Vendor assigned", `${vendor} assigned to Leg ${leg.seq}.`);
    pushToast("success", "Vendor assigned", vendor);
  }

  function addTracking() {
    if (!trackVal.trim()) return;
    patchLeg(sid, leg.id, { tracking: { ...leg.tracking, [trackKey]: trackVal.trim() } });
    log(sid, "Tracking added", `${trackKey} ${trackVal} on Leg ${leg.seq}.`);
    setTrackVal("");
  }

  function saveActuals() {
    const p: Partial<Leg> = {};
    if (actualDep) p.actualDep = actualDep.replace("T", " ");
    if (actualArr) p.actualArr = actualArr.replace("T", " ");
    if (actualArr) p.status = "Completed";
    else if (actualDep) p.status = "In Progress";
    patchLeg(sid, leg.id, p);
    log(sid, "Actual movement recorded", `Leg ${leg.seq} ${actualArr ? "completed" : "departed"}.`);
    pushToast("success", "Leg updated", actualArr ? "Marked completed" : "Departure recorded");
  }

  function setStatus(st: LegStatus) {
    patchLeg(sid, leg.id, { status: st });
    log(sid, "Leg status changed", `Leg ${leg.seq} → ${st}.`);
  }

  return (
    <Drawer open title={`Leg ${leg.seq} · ${leg.mode}`} onClose={onClose} wide>
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium text-mist">{leg.origin} → {leg.destination}</p>
            <LegBadge status={leg.status} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <PlannedActual label="Departure" planned={leg.plannedDep} actual={leg.actualDep} />
            <PlannedActual label="Arrival" planned={leg.plannedArr} actual={leg.actualArr} />
          </div>
        </div>

        {Object.keys(leg.details).filter((k) => leg.details[k]).length > 0 && (
          <div className="rounded-xl border border-ink/8 bg-paper/60 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute-2">{leg.mode} details</p>
            <dl className="grid grid-cols-2 gap-2 text-[12px]">
              {Object.entries(leg.details).filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><dt className="text-mute-2">{k}</dt><dd className="text-mist">{v}</dd></div>
              ))}
            </dl>
          </div>
        )}

        {isOps && (
          <>
            <div>
              <p className="mb-1.5 text-[12px] font-medium text-mist/80">Vendor / Carrier</p>
              <div className="flex gap-2">
                <SelectInput value={vendor} onChange={(e) => setVendor(e.target.value)} className="flex-1">
                  <option value="">Unassigned</option>
                  {VENDORS.map((v) => <option key={v}>{v}</option>)}
                </SelectInput>
                <button type="button" onClick={saveVendor} className="btn-secondary h-11 rounded-lg px-3 text-[12.5px]">Assign</button>
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[12px] font-medium text-mist/80">Tracking references</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {Object.entries(leg.tracking).map(([k, v]) => <TrackingRef key={k} k={k} v={v} />)}
                {Object.keys(leg.tracking).length === 0 && <span className="text-[12px] text-mute-2">None yet</span>}
              </div>
              <div className="flex gap-2">
                <SelectInput value={trackKey} onChange={(e) => setTrackKey(e.target.value)} className="w-[150px]">
                  {MODE_TRACKING_FIELDS[leg.mode].map((f) => <option key={f}>{f}</option>)}
                </SelectInput>
                <TextInput value={trackVal} onChange={(e) => setTrackVal(e.target.value)} placeholder="Reference" className="flex-1" />
                <button type="button" onClick={addTracking} className="btn-secondary h-11 rounded-lg px-3 text-[12.5px]">Add</button>
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[12px] font-medium text-mist/80">Record actual movement</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Actual Departure"><TextInput type="datetime-local" value={actualDep} onChange={(e) => setActualDep(e.target.value)} /></Field>
                <Field label="Actual Arrival"><TextInput type="datetime-local" value={actualArr} onChange={(e) => setActualArr(e.target.value)} /></Field>
              </div>
              <button type="button" onClick={saveActuals} className="btn-primary mt-2 h-10 w-full rounded-lg text-[13px]">Save Movement</button>
            </div>

            <div>
              <p className="mb-1.5 text-[12px] font-medium text-mist/80">Quick status</p>
              <div className="flex flex-wrap gap-1.5">
                {(["Ready", "In Progress", "Delayed", "Completed"] as LegStatus[]).map((st) => (
                  <button key={st} type="button" onClick={() => setStatus(st)} className={cn("rounded-lg border px-2.5 py-1.5 text-[12px] transition", leg.status === st ? "border-accent bg-accent/8 text-accent" : "border-ink/10 text-mute hover:text-mist")}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {legMilestones.length > 0 && (
          <div>
            <p className="mb-2 text-[12px] font-medium text-mist/80">Milestones on this leg</p>
            <ul className="space-y-1.5">
              {legMilestones.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-lg border border-ink/6 bg-paper/60 px-3 py-2 text-[12px]">
                  <span className="text-mist">{m.name}</span>
                  <span className={cn(m.actual ? "text-ok" : msEffectiveStatus(m) === "Delayed" ? "text-warn" : "text-mute-2")}>
                    {m.actual ? "Completed" : msEffectiveStatus(m)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* ---------------- Milestones page ---------------- */

export function MilestonesPage() {
  const { shipmentId } = useParams();
  const { byId, patchMilestone, addMilestone, log } = useExecution();
  const { pushToast, session } = useApp();
  const s = byId(shipmentId ?? "");
  const [editing, setEditing] = useState<MilestoneX | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const isOps = session?.role !== "customer" && session?.role !== "vendor";

  if (!s) return <div className="p-6">Unable to load shipment.</div>;

  return (
    <div className="p-4 sm:p-6">
      <PageHead
        title="Milestones"
        sub={`${s.id} · ${s.origin.split(",")[0]} → ${s.destination.split(",")[0]}`}
        actions={
          <>
            <Link to={`/app/shipments/${s.id}`} className="btn-secondary inline-flex h-10 items-center rounded-lg px-3.5 text-[13px]">Back to Shipment</Link>
            {isOps && (
              <button type="button" onClick={() => setAddOpen(true)} className="btn-primary inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px]">
                <Plus size={14} /> Add Milestone
              </button>
            )}
          </>
        }
      />
      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel title="Milestone timeline" sub="Planned vs actual across the journey">
          {s.milestones.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-mute">No milestones planned yet.</p>
              <button type="button" onClick={() => setAddOpen(true)} className="btn-primary mt-3 h-9 rounded-lg px-3 text-[12.5px]">Add Milestone</button>
            </div>
          ) : (
            <MilestoneTimeline shipment={s} onUpdate={isOps ? setEditing : undefined} />
          )}
        </Panel>
        <aside className="space-y-3">
          <Panel title="Summary">
            <dl className="space-y-2 text-[12.5px]">
              <Sum k="Total" v={String(s.milestones.length)} />
              <Sum k="Completed" v={String(s.milestones.filter((m) => m.actual).length)} />
              <Sum k="Delayed" v={String(s.milestones.filter((m) => msEffectiveStatus(m) === "Delayed").length)} />
              <Sum k="Customer visible" v={String(s.milestones.filter((m) => m.customerVisible).length)} />
            </dl>
          </Panel>
        </aside>
      </div>

      {editing && (
        <UpdateMilestoneDrawer
          m={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            patchMilestone(s.id, editing.id, patch);
            log(s.id, "Milestone updated", `${editing.name} ${patch.actual ? "marked complete" : "updated"}.`);
            pushToast("success", "Milestone updated", editing.name);
            setEditing(null);
          }}
        />
      )}

      <AddMilestoneDrawer
        open={addOpen}
        legs={s.legs}
        onClose={() => setAddOpen(false)}
        onSave={(m) => {
          addMilestone(s.id, m);
          setAddOpen(false);
        }}
      />
    </div>
  );
}

function UpdateMilestoneDrawer({
  m,
  onClose,
  onSave,
}: {
  m: MilestoneX;
  onClose: () => void;
  onSave: (p: Partial<MilestoneX>) => void;
}) {
  const [actual, setActual] = useState("2026-10-12T14:00");
  const [internal, setInternal] = useState(m.internalRemark ?? "");
  const [customer, setCustomer] = useState(m.customerRemark ?? "");

  return (
    <Drawer open title={`Update · ${m.name}`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-[12.5px] text-mute">Planned {fmtDT(m.planned)} · Owner {m.owner}</p>
        <Field label="Actual Date & Time">
          <TextInput type="datetime-local" value={actual} onChange={(e) => setActual(e.target.value)} />
        </Field>
        <Field label="Internal Remark" hint="Visible only to CargoOS users.">
          <TextArea value={internal} onChange={(e) => setInternal(e.target.value)} className="border-warn/30 bg-warn/5" />
        </Field>
        <Field label="Customer-visible Remark" hint="Will appear on customer tracking.">
          <TextArea value={customer} onChange={(e) => setCustomer(e.target.value)} className="border-accent/25 bg-accent/5" />
        </Field>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSave({ actual: actual.replace("T", " "), status: "Completed", internalRemark: internal || undefined, customerRemark: customer || undefined })}
            className="btn-primary h-10 flex-1 rounded-lg text-[13px]"
          >
            Mark Complete
          </button>
          <button
            type="button"
            onClick={() => onSave({ internalRemark: internal || undefined, customerRemark: customer || undefined })}
            className="btn-secondary h-10 flex-1 rounded-lg text-[13px]"
          >
            Save Update
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function AddMilestoneDrawer({
  open,
  legs,
  onClose,
  onSave,
}: {
  open: boolean;
  legs: Leg[];
  onClose: () => void;
  onSave: (m: Omit<MilestoneX, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [legId, setLegId] = useState("");
  const [planned, setPlanned] = useState("2026-10-15T10:00");
  const [owner, setOwner] = useState("A. Sharma");
  const [visible, setVisible] = useState(false);

  return (
    <Drawer open={open} title="Add Custom Milestone" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Milestone Name" required>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cargo Stuffing, Survey, Port Hold Released" />
        </Field>
        <Field label="Linked Leg">
          <SelectInput value={legId} onChange={(e) => setLegId(e.target.value)}>
            <option value="">Shipment level</option>
            {legs.map((l) => <option key={l.id} value={l.id}>Leg {l.seq} · {l.origin} → {l.destination}</option>)}
          </SelectInput>
        </Field>
        <Field label="Planned Date & Time">
          <TextInput type="datetime-local" value={planned} onChange={(e) => setPlanned(e.target.value)} />
        </Field>
        <Field label="Owner">
          <TextInput value={owner} onChange={(e) => setOwner(e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-[13px] text-mist">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="accent-accent" />
          Customer visible
        </label>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), legId: legId || undefined, planned: planned.replace("T", " "), status: "Upcoming", owner, customerVisible: visible, custom: true })}
          className="btn-primary h-11 w-full rounded-lg text-[13.5px] disabled:opacity-50"
        >
          Add Milestone
        </button>
      </div>
    </Drawer>
  );
}
