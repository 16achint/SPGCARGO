import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useCommercial } from "@/state/CommercialContext";
import { useApp } from "@/state/AppContext";
import {
  LOCATIONS,
  MODE_COPY,
  SERVICE_COPY,
  type Cargo,
  type ModeChoice,
  type Rfq,
  type RfqStatus,
  type ServiceType,
} from "@/lib/commercial";
import {
  ActivityTimeline,
  CardChoice,
  Dialog,
  EmptyCreate,
  Field,
  KpiStrip,
  PageHead,
  RouteLine,
  RfqBadge,
  RfqSummary,
  SelectInput,
  StepFooter,
  Stepper,
  TextArea,
  TextInput,
  ToggleYesNo,
} from "@/components/commercial/ui";
import { FilterBarShell, FilterSelect, ClearFilters, opts } from "@/components/app/shared/Filters";
import { Panel } from "@/components/app/shared/primitives";
import { cn } from "@/utils/cn";

const PIPE: RfqStatus[] = [
  "New",
  "Qualified",
  "Rate Sourcing",
  "Quote Preparation",
  "Quote Sent",
  "Awaiting Customer",
  "Won",
  "Lost",
];

export default function RfqsPage() {
  const { rfqs, customers, updateRfq } = useCommercial();
  const navigate = useNavigate();
  const [view, setView] = useState<"pipeline" | "table">(() => (localStorage.getItem("spg.rfqView") as "pipeline" | "table") || "pipeline");
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);

  function setV(v: "pipeline" | "table") {
    setView(v);
    localStorage.setItem("spg.rfqView", v);
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rfqs.filter((r) => {
      if (mode.length && !mode.includes(r.mode)) return false;
      if (status.length && !status.includes(r.status)) return false;
      if (!query) return true;
      const c = customers.find((x) => x.id === r.customerId);
      return (
        r.id.toLowerCase().includes(query) ||
        r.origin.toLowerCase().includes(query) ||
        r.destination.toLowerCase().includes(query) ||
        (c?.company.toLowerCase().includes(query) ?? false)
      );
    });
  }, [rfqs, q, mode, status, customers]);

  const kpis = PIPE.map((s) => ({ label: s, value: rfqs.filter((r) => r.status === s).length }));
  const won = rfqs.filter((r) => r.status === "Won").length;
  const closed = rfqs.filter((r) => r.status === "Won" || r.status === "Lost").length;

  return (
    <div className="p-4 sm:p-6">
      <PageHead
        title="RFQs & Enquiries"
        sub="Capture demand, evaluate rates and convert to quotation."
        actions={
          <Link to="/app/rfqs/new" className="btn-primary inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px]">
            <Plus size={14} /> New RFQ
          </Link>
        }
      />
      <div className="mt-5">
        <KpiStrip
          items={[
            ...kpis.slice(0, 7).map((k) => ({ label: k.label, value: k.value })),
            { label: "Conversion", value: closed ? `${Math.round((won / closed) * 100)}%` : "—" },
          ]}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg bg-ink/5 p-0.5">
          {(["pipeline", "table"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setV(v)} className={cn("rounded-md px-3 py-1.5 text-[12px] capitalize", view === v ? "bg-white font-medium text-mist shadow-sm" : "text-mute")}>
              {v}
            </button>
          ))}
        </div>
        <label className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search RFQ, customer, lane..." className="h-9 w-[240px] rounded-lg border border-ink/10 bg-white pl-8 pr-3 text-[13px] focus:border-accent focus:outline-none" />
        </label>
        <FilterBarShell>
          <FilterSelect label="Mode" options={opts(["Ocean", "Air", "Road", "Rail", "Multimodal"])} value={mode} onChange={setMode} />
          <FilterSelect label="Status" options={opts(PIPE)} value={status} onChange={setStatus} />
          {(mode.length || status.length) > 0 && <ClearFilters onClear={() => { setMode([]); setStatus([]); }} />}
        </FilterBarShell>
      </div>

      {filtered.length === 0 ? (
        <Panel className="mt-4">
          <EmptyCreate title="No RFQs match your filters." desc="Create an enquiry to start rate evaluation." cta="New RFQ" to="/app/rfqs/new" />
        </Panel>
      ) : view === "pipeline" ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {PIPE.map((col) => {
            const cards = filtered.filter((r) => r.status === col);
            return (
              <div key={col} className="w-[220px] shrink-0">
                <p className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-mute-2">
                  {col} <span>{cards.length}</span>
                </p>
                <div className="space-y-2">
                  {cards.map((r) => {
                    const c = customers.find((x) => x.id === r.customerId);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => navigate(`/app/rfqs/${r.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowRight") {
                            const i = PIPE.indexOf(r.status);
                            if (i < PIPE.length - 1) updateRfq(r.id, { status: PIPE[i + 1] });
                          }
                          if (e.key === "ArrowLeft") {
                            const i = PIPE.indexOf(r.status);
                            if (i > 0) updateRfq(r.id, { status: PIPE[i - 1] });
                          }
                        }}
                        className="w-full rounded-xl border border-ink/8 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-accent/30"
                      >
                        <p className="font-mono text-[10.5px] text-accent">{r.id}</p>
                        <p className="mt-1 truncate text-[12.5px] font-medium text-mist">{c?.company}</p>
                        <p className="mt-0.5 truncate text-[11px] text-mute">{r.origin} → {r.destination}</p>
                        <div className="mt-2 flex items-center justify-between text-[10.5px] text-mute-2">
                          <span>{r.mode}</span>
                          <span>{r.owner}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Panel className="mt-4" bodyClass="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-[12.5px]">
              <thead>
                <tr className="border-y border-ink/6 text-[10.5px] uppercase tracking-[0.12em] text-mute-2">
                  {["RFQ No.", "Customer", "Origin", "Destination", "Mode", "Service", "Cargo", "Pickup", "Status", "Owner"].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const c = customers.find((x) => x.id === r.customerId);
                  return (
                    <tr key={r.id} onClick={() => navigate(`/app/rfqs/${r.id}`)} className="cursor-pointer border-b border-ink/5 hover:bg-accent/4">
                      <td className="px-3 py-3 font-mono text-[11.5px] text-accent">{r.id}</td>
                      <td className="px-3 py-3">{c?.company}</td>
                      <td className="px-3 py-3 text-mute">{r.origin}</td>
                      <td className="px-3 py-3 text-mute">{r.destination}</td>
                      <td className="px-3 py-3">{r.mode}</td>
                      <td className="px-3 py-3">{r.service}</td>
                      <td className="px-3 py-3">{r.cargo.commodity}</td>
                      <td className="px-3 py-3">{r.pickupDate}</td>
                      <td className="px-3 py-3"><RfqBadge status={r.status} /></td>
                      <td className="px-3 py-3 text-mute">{r.owner}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

/* ---------------- Create ---------------- */

const STEPS = ["Customer & Route", "Cargo", "Mode & Service", "Requirements", "Review"];

const emptyCargo = (): Cargo => ({
  commodity: "",
  description: "",
  packages: 1,
  packageType: "Pallet",
  weight: 0,
  weightUnit: "KG",
  volume: 0,
  volumeUnit: "CBM",
  value: 0,
  currency: "INR",
  hazardous: false,
  tempControlled: false,
});

export function RfqNewPage() {
  const [params] = useSearchParams();
  const { customers, addRfq, nextRfqId } = useCommercial();
  const { session } = useApp();
  const navigate = useNavigate();
  const pre = params.get("customer") ?? "";
  const [step, setStep] = useState(0);
  const [leave, setLeave] = useState(false);
  const [custQ, setCustQ] = useState("");
  const [locFocus, setLocFocus] = useState<"o" | "d" | null>(null);
  const [haz, setHaz] = useState<boolean | null>(null);
  const [temp, setTemp] = useState<boolean | null>(null);
  const [form, setForm] = useState<Partial<Rfq>>({
    customerId: pre,
    origin: "",
    destination: "",
    pickupDate: "",
    deliveryDate: "",
    cargo: emptyCargo(),
    mode: undefined,
    service: undefined,
    insurance: false,
    customs: true,
    warehouse: false,
    pickup: true,
    delivery: true,
    owner: session?.role === "sales" ? "N. Verghese" : "A. Sharma",
  });

  function set<K extends keyof Rfq>(k: K, v: Rfq[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const cargo = form.cargo ?? emptyCargo();
  function setCargo(patch: Partial<Cargo>) {
    set("cargo", { ...cargo, ...patch });
  }

  const custHits = customers.filter((c) => {
    const q = custQ.toLowerCase();
    return !q || c.company.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
  }).slice(0, 6);
  const selected = customers.find((c) => c.id === form.customerId);

  const locHits = (q: string) =>
    LOCATIONS.filter((l) => l.toLowerCase().includes(q.toLowerCase())).slice(0, 6);

  const errors = {
    customer: !form.customerId ? "Select a customer." : "",
    origin: !form.origin ? "Origin is required." : "",
    dest: !form.destination ? "Destination is required." : "",
    commodity: !cargo.commodity.trim() ? "Commodity is required." : "",
    haz: haz === null ? "Confirm whether cargo is hazardous." : "",
    temp: temp === null ? "Confirm temperature-control requirement." : "",
    mode: !form.mode ? "Select a mode." : "",
    service: !form.service ? "Select a service type." : "",
  };

  function canNext() {
    if (step === 0) return !errors.customer && !errors.origin && !errors.dest;
    if (step === 1) return !errors.commodity && haz !== null && temp !== null;
    if (step === 2) return !errors.mode && !errors.service;
    return true;
  }

  const [created, setCreated] = useState<Rfq | null>(null);

  function save() {
    const rfq: Rfq = {
      id: nextRfqId(),
      customerId: form.customerId!,
      customerRef: form.customerRef,
      origin: form.origin!,
      destination: form.destination!,
      pickupDate: form.pickupDate || "",
      deliveryDate: form.deliveryDate || "",
      cargo: { ...cargo, hazardous: haz === true, tempControlled: temp === true },
      mode: form.mode!,
      service: form.service!,
      ocean: form.ocean,
      air: form.air,
      road: form.road,
      rail: form.rail,
      insurance: !!form.insurance,
      customs: !!form.customs,
      warehouse: !!form.warehouse,
      pickup: !!form.pickup,
      delivery: !!form.delivery,
      special: form.special,
      internalNotes: form.internalNotes,
      status: "New",
      owner: form.owner || "N. Verghese",
      created: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    };
    addRfq(rfq);
    setCreated(rfq);
  }

  if (created) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-ink/8 bg-white p-8 text-center">
          <p className="eyebrow">RFQ created</p>
          <h1 className="mt-2 font-mono text-[22px] text-mist">{created.id}</h1>
          <p className="mt-2 text-[13px] text-mute">{selected?.company}</p>
          <RouteLine origin={created.origin} destination={created.destination} />
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to={`/app/rfqs/${created.id}/rates`} className="btn-primary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">Evaluate Rates</Link>
            <Link to={`/app/rfqs/${created.id}`} className="btn-secondary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">View RFQ</Link>
            <button type="button" onClick={() => { setCreated(null); setStep(0); }} className="h-10 px-3 text-[13px] text-mute">Create another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHead title="New RFQ" sub="Customer, route, cargo, mode and service — captured once." actions={<button type="button" onClick={() => setLeave(true)} className="text-[13px] text-mute">Cancel</button>} />
      <div className="mt-5"><Stepper steps={STEPS} current={step} onJump={(i) => i <= step && setStep(i)} /></div>
      <div className="mx-auto mt-8 max-w-3xl">
        {step === 0 && (
          <div className="space-y-4">
            <Field label="Customer" required error={errors.customer}>
              {selected ? (
                <div className="flex items-center justify-between rounded-lg border border-ink/12 bg-white px-3 py-2.5">
                  <div>
                    <p className="text-[13.5px] font-medium">{selected.company}</p>
                    <p className="font-mono text-[11px] text-mute-2">{selected.id}</p>
                  </div>
                  <button type="button" className="text-[12px] text-accent" onClick={() => set("customerId", "")}>Change</button>
                </div>
              ) : (
                <div className="relative">
                  <TextInput value={custQ} onChange={(e) => setCustQ(e.target.value)} placeholder="Search existing customer..." />
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-ink/10 bg-white shadow-lg">
                    {custHits.map((c) => (
                      <button key={c.id} type="button" onClick={() => { set("customerId", c.id); setCustQ(""); }} className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-ink/4">
                        <span>{c.company}</span>
                        <span className="font-mono text-[11px] text-mute-2">{c.id}</span>
                      </button>
                    ))}
                    <Link to="/app/customers/new" className="block border-t border-ink/6 px-3 py-2 text-[12.5px] text-accent">+ Create customer</Link>
                  </div>
                </div>
              )}
            </Field>
            <Field label="Customer Reference">
              <TextInput value={form.customerRef ?? ""} onChange={(e) => set("customerRef", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Origin" required error={errors.origin}>
                <div className="relative">
                  <TextInput value={form.origin ?? ""} onFocus={() => setLocFocus("o")} onChange={(e) => set("origin", e.target.value)} />
                  {locFocus === "o" && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-ink/10 bg-white shadow-lg">
                      {locHits(form.origin ?? "").map((l) => (
                        <button key={l} type="button" onClick={() => { set("origin", l); setLocFocus(null); }} className="block w-full px-3 py-2 text-left text-[13px] hover:bg-ink/4">{l}</button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Destination" required error={errors.dest}>
                <div className="relative">
                  <TextInput value={form.destination ?? ""} onFocus={() => setLocFocus("d")} onChange={(e) => set("destination", e.target.value)} />
                  {locFocus === "d" && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-ink/10 bg-white shadow-lg">
                      {locHits(form.destination ?? "").map((l) => (
                        <button key={l} type="button" onClick={() => { set("destination", l); setLocFocus(null); }} className="block w-full px-3 py-2 text-left text-[13px] hover:bg-ink/4">{l}</button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Pickup Date"><TextInput type="date" value={form.pickupDate ?? ""} onChange={(e) => set("pickupDate", e.target.value)} /></Field>
              <Field label="Requested Delivery"><TextInput type="date" value={form.deliveryDate ?? ""} onChange={(e) => set("deliveryDate", e.target.value)} /></Field>
            </div>
            {form.origin && form.destination && (
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cyan">Route</p>
                <RouteLine origin={form.origin} destination={form.destination} />
              </div>
            )}
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Commodity" required error={errors.commodity} className="sm:col-span-2">
              <TextInput value={cargo.commodity} onChange={(e) => setCargo({ commodity: e.target.value })} />
            </Field>
            <Field label="Cargo Description" className="sm:col-span-2">
              <TextArea value={cargo.description} onChange={(e) => setCargo({ description: e.target.value })} />
            </Field>
            <Field label="Packages"><TextInput type="number" value={cargo.packages} onChange={(e) => setCargo({ packages: Number(e.target.value) })} /></Field>
            <Field label="Package Type">
              <SelectInput value={cargo.packageType} onChange={(e) => setCargo({ packageType: e.target.value })}>
                {["Pallet", "Crate", "Carton", "Drum", "Bale", "Case"].map((p) => <option key={p}>{p}</option>)}
              </SelectInput>
            </Field>
            <Field label="Gross Weight"><TextInput type="number" value={cargo.weight || ""} onChange={(e) => setCargo({ weight: Number(e.target.value) })} /></Field>
            <Field label="Weight Unit">
              <SelectInput value={cargo.weightUnit} onChange={(e) => setCargo({ weightUnit: e.target.value as "KG" | "MT" })}>
                <option>KG</option><option>MT</option>
              </SelectInput>
            </Field>
            <Field label="Volume"><TextInput type="number" value={cargo.volume || ""} onChange={(e) => setCargo({ volume: Number(e.target.value) })} /></Field>
            <Field label="Cargo Value"><TextInput type="number" value={cargo.value || ""} onChange={(e) => setCargo({ value: Number(e.target.value) })} /></Field>
            <Field label="Dimensions"><TextInput value={cargo.dims ?? ""} onChange={(e) => setCargo({ dims: e.target.value })} placeholder="L × W × H" /></Field>
            <Field label="Container Type"><TextInput value={cargo.containerType ?? ""} onChange={(e) => setCargo({ containerType: e.target.value })} placeholder="40HC" /></Field>
            <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
              <ToggleYesNo label="Hazardous" required value={haz} onChange={(v) => { setHaz(v); setCargo({ hazardous: v }); }} />
              <ToggleYesNo label="Temperature Controlled" required value={temp} onChange={(v) => { setTemp(v); setCargo({ tempControlled: v }); }} />
            </div>
            {haz && (
              <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3 rounded-xl border border-warn/20 bg-warn/5 p-3">
                <Field label="UN Number"><TextInput value={cargo.unNumber ?? ""} onChange={(e) => setCargo({ unNumber: e.target.value })} /></Field>
                <Field label="Hazard Class"><TextInput value={cargo.hazardClass ?? ""} onChange={(e) => setCargo({ hazardClass: e.target.value })} /></Field>
                <Field label="Packing Group"><TextInput value={cargo.packingGroup ?? ""} onChange={(e) => setCargo({ packingGroup: e.target.value })} /></Field>
                <Field label="Special Handling" className="sm:col-span-3"><TextInput value={cargo.hazInstructions ?? ""} onChange={(e) => setCargo({ hazInstructions: e.target.value })} /></Field>
              </div>
            )}
            {temp && (
              <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3 rounded-xl border border-cyan/20 bg-cyan/5 p-3">
                <Field label="Min Temp"><TextInput type="number" value={cargo.tempMin ?? ""} onChange={(e) => setCargo({ tempMin: Number(e.target.value) })} /></Field>
                <Field label="Max Temp"><TextInput type="number" value={cargo.tempMax ?? ""} onChange={(e) => setCargo({ tempMax: Number(e.target.value) })} /></Field>
                <Field label="Unit">
                  <SelectInput value={cargo.tempUnit ?? "C"} onChange={(e) => setCargo({ tempUnit: e.target.value as "C" | "F" })}>
                    <option value="C">°C</option><option value="F">°F</option>
                  </SelectInput>
                </Field>
              </div>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-[12px] font-medium text-mist/80">Mode</p>
              <CardChoice
                value={(form.mode as ModeChoice) ?? ""}
                onChange={(v) => set("mode", v)}
                options={(Object.keys(MODE_COPY) as ModeChoice[]).map((id) => ({ id, title: id === "Recommend" ? "Recommend Best" : id, blurb: MODE_COPY[id] }))}
              />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-mist/80">Service type</p>
              <CardChoice
                value={(form.service as ServiceType) ?? ""}
                onChange={(v) => set("service", v)}
                options={(Object.keys(SERVICE_COPY) as ServiceType[]).map((id) => ({ id, title: `${id} · ${SERVICE_COPY[id].title}`, blurb: SERVICE_COPY[id].blurb }))}
              />
            </div>
            {(form.mode === "Ocean" || form.mode === "Multimodal") && (
              <div className="grid gap-3 sm:grid-cols-3 rounded-xl border border-ink/8 p-4">
                <Field label="FCL / LCL">
                  <SelectInput value={form.ocean?.type ?? "FCL"} onChange={(e) => set("ocean", { ...form.ocean, type: e.target.value as "FCL" | "LCL" })}>
                    <option>FCL</option><option>LCL</option>
                  </SelectInput>
                </Field>
                <Field label="Container Type"><TextInput value={form.ocean?.container ?? cargo.containerType ?? ""} onChange={(e) => set("ocean", { type: form.ocean?.type ?? "FCL", container: e.target.value })} /></Field>
              </div>
            )}
            {form.mode === "Air" && (
              <Field label="Priority">
                <SelectInput value={form.air?.priority ?? "Standard"} onChange={(e) => set("air", { priority: e.target.value as "Priority" | "Standard" })}>
                  <option>Priority</option><option>Standard</option>
                </SelectInput>
              </Field>
            )}
            {(form.mode === "Road" || form.mode === "Multimodal") && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="FTL / PTL">
                  <SelectInput value={form.road?.type ?? "FTL"} onChange={(e) => set("road", { ...form.road, type: e.target.value as "FTL" | "PTL" })}>
                    <option>FTL</option><option>PTL</option>
                  </SelectInput>
                </Field>
                <Field label="Vehicle Type"><TextInput value={form.road?.vehicle ?? ""} onChange={(e) => set("road", { type: form.road?.type ?? "FTL", vehicle: e.target.value })} /></Field>
              </div>
            )}
            {form.mode === "Rail" && (
              <Field label="Rail movement">
                <SelectInput value={form.rail?.type ?? "Container"} onChange={(e) => set("rail", { type: e.target.value as "Container" | "ICD" | "Port Movement" })}>
                  <option>Container</option><option>ICD</option><option>Port Movement</option>
                </SelectInput>
              </Field>
            )}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(["insurance", "customs", "warehouse", "pickup", "delivery"] as const).map((k) => (
                <label key={k} className="flex items-center justify-between rounded-xl border border-ink/8 bg-white px-4 py-3 text-[13px] capitalize">
                  {k} required
                  <input type="checkbox" checked={!!form[k]} onChange={(e) => set(k, e.target.checked)} className="accent-accent" />
                </label>
              ))}
            </div>
            <Field label="Special Instructions">
              <TextArea value={form.special ?? ""} onChange={(e) => set("special", e.target.value)} />
            </Field>
            <Field label="Internal Notes" hint="Visible only to CargoOS users.">
              <TextArea value={form.internalNotes ?? ""} onChange={(e) => set("internalNotes", e.target.value)} className="border-warn/30 bg-warn/5" />
            </Field>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-3">
            {[
              ["Customer", selected?.company ?? "—"],
              ["Route", `${form.origin} → ${form.destination}`],
              ["Cargo", `${cargo.commodity} · ${cargo.packages} ${cargo.packageType} · ${cargo.weight} ${cargo.weightUnit}`],
              ["Mode", `${form.mode} · ${form.service ? SERVICE_COPY[form.service].title : ""}`],
              ["Dates", `Pickup ${form.pickupDate || "TBC"} · Delivery ${form.deliveryDate || "TBC"}`],
              ["Requirements", [form.insurance && "Insurance", form.customs && "Customs", form.warehouse && "Warehouse", form.pickup && "Pickup", form.delivery && "Delivery"].filter(Boolean).join(" · ") || "None"],
            ].map(([h, v]) => (
              <div key={h} className="rounded-xl border border-ink/8 bg-white px-4 py-3">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-mute-2">{h}</p>
                <p className="mt-1 text-[13.5px] text-mist">{v}</p>
              </div>
            ))}
          </div>
        )}
        <StepFooter
          backHidden={step === 0}
          onBack={() => setStep((s) => s - 1)}
          nextLabel={step === 4 ? "Create RFQ" : "Continue"}
          disabled={!canNext()}
          onNext={() => {
            if (!canNext()) return;
            if (step === 4) save();
            else setStep((s) => s + 1);
          }}
        />
      </div>
      <Dialog open={leave} title="Leave without saving?" onClose={() => setLeave(false)}>
        <p className="text-[13px] text-mute">This RFQ has not been created yet.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary h-9 rounded-lg px-3 text-[13px]" onClick={() => setLeave(false)}>Keep editing</button>
          <button type="button" className="h-9 rounded-lg bg-bad px-3 text-[13px] text-white" onClick={() => navigate("/app/rfqs")}>Discard</button>
        </div>
      </Dialog>
    </div>
  );
}

/* ---------------- Detail ---------------- */

export function RfqDetailPage() {
  const { rfqId } = useParams();
  const { rfqById, customerById, quotes, notes, addNote, timelineFor } = useCommercial();
  const { session } = useApp();
  const rfq = rfqById(rfqId ?? "");
  const [tab, setTab] = useState("Overview");
  const [note, setNote] = useState("");
  const [vis, setVis] = useState<"internal" | "customer">("internal");
  if (!rfq) return <div className="p-6">RFQ not found. <Link to="/app/rfqs" className="text-accent">Back</Link></div>;
  const c = customerById(rfq.customerId);
  const related = quotes.filter((q) => q.rfqId === rfq.id);
  const comm = notes.filter((n) => n.rfqId === rfq.id);
  const isCustomer = session?.role === "customer";

  const cta =
    rfq.status === "New" || rfq.status === "Qualified" || rfq.status === "Rate Sourcing"
      ? { to: `/app/rfqs/${rfq.id}/rates`, label: "Evaluate Rates" }
      : { to: `/app/rfqs/${rfq.id}/quote`, label: "Build Quote" };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[12px] text-accent">{rfq.id}</p>
          <h1 className="mt-1 text-[24px] font-medium text-mist">{c?.company}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-mute">
            <RfqBadge status={rfq.status} />
            <span>Owner {rfq.owner}</span>
            <span>· {rfq.created}</span>
          </div>
        </div>
        {!isCustomer && (
          <Link to={cta.to} className="btn-primary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">{cta.label}</Link>
        )}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="flex gap-1 overflow-x-auto border-b border-ink/8">
            {["Overview", "Rates", "Quotes", "Documents", "Communication", "Activity"].map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={cn("shrink-0 border-b-2 px-3 py-2.5 text-[13px]", tab === t ? "border-accent font-medium text-mist" : "border-transparent text-mute")}>{t}</button>
            ))}
          </div>
          <div className="mt-5">
            {tab === "Overview" && (
              <div className="space-y-4">
                <Panel title="Route & cargo">
                  <RouteLine origin={rfq.origin} destination={rfq.destination} />
                  <p className="mt-2 text-[13px] text-mute">{rfq.mode} · {SERVICE_COPY[rfq.service].title}</p>
                  <p className="mt-2 text-[13px]">{rfq.cargo.commodity} — {rfq.cargo.description}</p>
                  <p className="mt-1 text-[12px] text-mute-2">{rfq.cargo.packages} {rfq.cargo.packageType} · {rfq.cargo.weight.toLocaleString()} {rfq.cargo.weightUnit} · {rfq.cargo.volume} CBM</p>
                  {rfq.cargo.hazardous && <p className="mt-2 text-[12px] text-warn">Hazardous · {rfq.cargo.unNumber} · Class {rfq.cargo.hazardClass}</p>}
                  {rfq.cargo.tempControlled && <p className="mt-1 text-[12px] text-cyan">Temp controlled {rfq.cargo.tempMin}–{rfq.cargo.tempMax}°{rfq.cargo.tempUnit}</p>}
                </Panel>
                <Panel title="Requirements">
                  <p className="text-[13px] text-mute">{[rfq.insurance && "Insurance", rfq.customs && "Customs", rfq.warehouse && "Warehouse", rfq.pickup && "Pickup", rfq.delivery && "Delivery"].filter(Boolean).join(" · ")}</p>
                  {rfq.special && <p className="mt-2 text-[13px]">{rfq.special}</p>}
                  {rfq.internalNotes && !isCustomer && <p className="mt-3 rounded-lg bg-warn/8 px-3 py-2 text-[12px] text-mist">Internal · {rfq.internalNotes}</p>}
                </Panel>
              </div>
            )}
            {tab === "Rates" && (
              <Panel title="Rate evaluation">
                <p className="text-[13px] text-mute">Open the pricing workstation to select cost components.</p>
                <Link to={`/app/rfqs/${rfq.id}/rates`} className="mt-3 inline-flex text-[13px] font-medium text-accent">Evaluate rates →</Link>
              </Panel>
            )}
            {tab === "Quotes" && (
              <Panel bodyClass="p-0">
                {related.length === 0 ? <p className="p-6 text-[13px] text-mute-2">No quotations yet.</p> : related.map((q) => (
                  <Link key={q.id} to={`/app/quotes/${q.id}`} className="flex items-center justify-between border-b border-ink/5 px-4 py-3 text-[13px] last:border-0 hover:bg-ink/3">
                    <span className="font-mono text-accent">{q.id}-V{q.version}</span>
                    <span className="text-mute">{q.status}</span>
                  </Link>
                ))}
              </Panel>
            )}
            {tab === "Documents" && (
              <Panel><p className="text-[13px] text-mute">Document vault opens in the Document Control phase. KYC files remain on the customer record.</p></Panel>
            )}
            {tab === "Communication" && (
              <div>
                <ul className="space-y-3">
                  {comm.map((n) => (
                    <li key={n.id} className="rounded-xl border border-ink/8 bg-white px-4 py-3">
                      <p className="text-[12.5px] text-mist">{n.text}</p>
                      <p className="mt-1 text-[11px] text-mute-2">{n.time} · {n.by} · {n.visibility}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl border border-ink/8 bg-white p-3">
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full resize-none text-[13px] outline-none" placeholder="Add a note..." />
                  <div className="mt-2 flex items-center justify-between">
                    <select value={vis} onChange={(e) => setVis(e.target.value as "internal" | "customer")} className="text-[12px] text-mute">
                      <option value="internal">Internal</option>
                      <option value="customer">Customer-visible</option>
                    </select>
                    <button
                      type="button"
                      disabled={!note.trim()}
                      onClick={() => { addNote({ rfqId: rfq.id, text: note.trim(), visibility: vis }); setNote(""); }}
                      className="btn-primary h-8 rounded-lg px-3 text-[12px]"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            )}
            {tab === "Activity" && <ActivityTimeline items={timelineFor("rfq", rfq.id)} />}
          </div>
        </div>
        <aside className="space-y-3">
          <RfqSummary rfq={rfq} customer={c} />
          <Panel title="Pending actions">
            <ul className="space-y-2 text-[12.5px]">
              <li>Evaluate supplier rates</li>
              <li>Confirm pickup window {rfq.pickupDate || "TBC"}</li>
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

export { MoreHorizontal };
