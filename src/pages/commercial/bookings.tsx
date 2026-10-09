import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useCommercial } from "@/state/CommercialContext";
import { useApp } from "@/state/AppContext";
import { inr, optionTotals, OWNERS, type Booking } from "@/lib/commercial";
import {
  ActivityTimeline,
  BookingBadge,
  EmptyCreate,
  Field,
  InheritedBanner,
  KpiStrip,
  PageHead,
  QuoteOptionCard,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/commercial/ui";
import { FilterBarShell, FilterSelect, ClearFilters, opts } from "@/components/app/shared/Filters";
import { Panel } from "@/components/app/shared/primitives";

export default function BookingsPage() {
  const { bookings, customers, quotes, rfqs } = useCommercial();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return bookings.filter((b) => {
      if (status.length && !status.includes(b.status)) return false;
      if (!query) return true;
      const c = customers.find((x) => x.id === b.customerId);
      return b.id.toLowerCase().includes(query) || b.quoteId.toLowerCase().includes(query) || (c?.company.toLowerCase().includes(query) ?? false);
    });
  }, [bookings, q, status, customers]);

  const count = (s: string) => bookings.filter((b) => b.status === s).length;

  return (
    <div className="p-4 sm:p-6">
      <PageHead title="Bookings" sub="Confirm accepted quotations and hand off to operations." />
      <div className="mt-5">
        <KpiStrip
          items={[
            { label: "Pending Confirmation", value: count("Pending Confirmation") },
            { label: "Confirmed", value: count("Confirmed"), tone: "text-ok" },
            { label: "Ready for Operations", value: count("Ready for Operations") },
            { label: "Cancelled", value: count("Cancelled") },
          ]}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search booking, quote, customer..." className="h-9 w-[240px] rounded-lg border border-ink/10 bg-white pl-8 pr-3 text-[13px] focus:border-accent focus:outline-none" />
        </label>
        <FilterBarShell>
          <FilterSelect label="Status" options={opts(["Pending Confirmation", "Confirmed", "Ready for Operations", "Cancelled"])} value={status} onChange={setStatus} />
          {status.length > 0 && <ClearFilters onClear={() => setStatus([])} />}
        </FilterBarShell>
      </div>
      <Panel className="mt-4" bodyClass="p-0">
        {filtered.length === 0 ? (
          <EmptyCreate title="No bookings available." desc="Accept a quotation to generate a booking." cta="Open Quotes" to="/app/quotes" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-[12.5px]">
              <thead>
                <tr className="border-y border-ink/6 text-[10.5px] uppercase tracking-[0.12em] text-mute-2">
                  {["Booking ID", "Quote", "Customer", "Route", "Mode", "Confirmation", "Status", "Ops Owner"].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const c = customers.find((x) => x.id === b.customerId);
                  const rfq = rfqs.find((r) => r.id === b.rfqId);
                  const q = quotes.find((x) => x.id === b.quoteId);
                  const opt = q?.options.find((o) => o.id === b.optionId);
                  return (
                    <tr key={b.id} onClick={() => navigate(`/app/bookings/${b.id}`)} className="cursor-pointer border-b border-ink/5 hover:bg-accent/4">
                      <td className="px-3 py-3 font-mono text-[11.5px] text-accent">{b.id}</td>
                      <td className="px-3 py-3 font-mono text-[11px]">{b.quoteId}</td>
                      <td className="px-3 py-3">{c?.company}</td>
                      <td className="px-3 py-3 text-mute">{rfq ? `${rfq.origin.split(",")[0]} → ${rfq.destination.split(",")[0]}` : "—"}</td>
                      <td className="px-3 py-3">{opt?.mode ?? rfq?.mode}</td>
                      <td className="px-3 py-3">{b.confirmationDate || "—"}</td>
                      <td className="px-3 py-3"><BookingBadge status={b.status} /></td>
                      <td className="px-3 py-3 text-mute">{b.opsOwner}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

export function BookingNewPage() {
  const [params] = useSearchParams();
  const quoteId = params.get("quote") ?? "";
  const { quoteById, customerById, rfqById, addBooking, nextBookingId, confirmBooking } = useCommercial();
  const { session } = useApp();
  const navigate = useNavigate();
  const quote = quoteById(quoteId);
  const [opsOwner, setOpsOwner] = useState("A. Sharma");
  const [carrierRef, setCarrierRef] = useState("");
  const [pickup, setPickup] = useState("");
  const [dep, setDep] = useState("");
  const [arr, setArr] = useState("");
  const [notes, setNotes] = useState("");
  const [ref, setRef] = useState("");

  if (!quote) {
    return (
      <div className="p-6">
        <p className="text-mist">Select an accepted quote to create a booking.</p>
        <Link to="/app/quotes" className="mt-3 inline-block text-[13px] text-accent">Open quotations</Link>
      </div>
    );
  }
  if (quote.status !== "Accepted" || !quote.acceptedOptionId) {
    return (
      <div className="p-6">
        <p className="text-mist">This quotation has not been accepted yet.</p>
        <Link to={`/app/quotes/${quote.id}/preview`} className="mt-3 inline-block text-[13px] text-accent">Open customer quote</Link>
      </div>
    );
  }

  const customer = customerById(quote.customerId);
  const rfq = rfqById(quote.rfqId);
  const opt = quote.options.find((o) => o.id === quote.acceptedOptionId)!;
  const t = optionTotals(opt);
  const canConfirm = session?.role === "operations" || session?.role === "admin" || session?.role === "sales" || session?.role === "management";

  function submit() {
    if (!quote) return;
    const b: Booking = {
      id: nextBookingId(),
      quoteId: quote.id,
      optionId: opt.id,
      customerId: quote.customerId,
      rfqId: quote.rfqId,
      confirmationDate: "",
      opsOwner,
      carrierRef,
      plannedPickup: pickup,
      plannedDeparture: dep,
      plannedArrival: arr,
      notes,
      status: "Pending Confirmation",
      bookingRef: ref,
    };
    addBooking(b);
    confirmBooking(b.id);
    navigate(`/app/bookings/${b.id}`);
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHead title="Confirm Booking" sub={`From accepted quote ${quote.id}-V${quote.version}`} />
      <div className="mt-4">
        <InheritedBanner>Inherited from accepted quote — customer, cargo, route and selling price are locked.</InheritedBanner>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Panel title="Inherited commercial data">
            <dl className="grid gap-3 sm:grid-cols-2 text-[13px]">
              <Row k="Customer" v={customer?.company ?? ""} />
              <Row k="Quote" v={`${quote.id} V${quote.version}`} />
              <Row k="Selected option" v={`${opt.name} — ${opt.tag}`} />
              <Row k="Origin" v={rfq?.origin ?? ""} />
              <Row k="Destination" v={rfq?.destination ?? ""} />
              <Row k="Cargo" v={rfq ? `${rfq.cargo.commodity} · ${rfq.cargo.packages} ${rfq.cargo.packageType}` : ""} />
              <Row k="Mode / Service" v={`${opt.mode} · ${rfq?.service ?? ""}`} />
              <Row k="Selling price" v={inr(t.selling)} />
            </dl>
          </Panel>
          <Panel title="Operational fields">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Booking Reference"><TextInput value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Carrier / internal ref" /></Field>
              <Field label="Assigned Operations Owner">
                <SelectInput value={opsOwner} onChange={(e) => setOpsOwner(e.target.value)}>
                  {OWNERS.map((o) => <option key={o}>{o}</option>)}
                </SelectInput>
              </Field>
              <Field label="Carrier Reference"><TextInput value={carrierRef} onChange={(e) => setCarrierRef(e.target.value)} /></Field>
              <Field label="Planned Pickup"><TextInput type="date" value={pickup} onChange={(e) => setPickup(e.target.value)} /></Field>
              <Field label="Planned Departure"><TextInput type="date" value={dep} onChange={(e) => setDep(e.target.value)} /></Field>
              <Field label="Planned Arrival"><TextInput type="date" value={arr} onChange={(e) => setArr(e.target.value)} /></Field>
              <Field label="Notes" className="sm:col-span-2"><TextArea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
            </div>
          </Panel>
          {canConfirm && (
            <button type="button" onClick={submit} className="btn-primary h-11 rounded-lg px-5 text-[14px]">Confirm Booking</button>
          )}
        </div>
        <aside>
          <QuoteOptionCard opt={opt} customerView />
        </aside>
      </div>
    </div>
  );
}

export function BookingDetailPage() {
  const { bookingId } = useParams();
  const { bookingById, quoteById, customerById, rfqById, timelineFor } = useCommercial();
  const { pushToast } = useApp();
  const b = bookingById(bookingId ?? "");
  if (!b) return <div className="p-6">Booking not found.</div>;
  const q = quoteById(b.quoteId);
  const c = customerById(b.customerId);
  const rfq = rfqById(b.rfqId);
  const opt = q?.options.find((o) => o.id === b.optionId);
  const t = opt ? optionTotals(opt) : null;
  const success = b.status === "Confirmed" || b.status === "Ready for Operations";

  return (
    <div className="p-4 sm:p-6">
      {success && (
        <div className="mb-5 rounded-2xl border border-ok/20 bg-ok/8 p-5">
          <p className="eyebrow text-ok">Booking confirmed</p>
          <h1 className="mt-1 font-mono text-[22px] text-mist">{b.id}</h1>
          <p className="mt-2 text-[13px] text-mute">Commercial handoff is ready for shipment setup.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={`/app/shipments/new?booking=${b.id}`} className="btn-primary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">Create Master Shipment</Link>
            <Link to="/app/bookings" className="btn-secondary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">All bookings</Link>
          </div>
        </div>
      )}
      <PageHead title={b.id} sub={`${c?.company} · ${q?.id}`} />
      <div className="mt-4 flex items-center gap-2">
        <BookingBadge status={b.status} />
        <span className="text-[12px] text-mute">Ops owner {b.opsOwner}</span>
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Panel title="Inherited from quote">
          <dl className="grid gap-2 text-[13px] sm:grid-cols-2">
            <Row k="Customer" v={c?.company ?? ""} />
            <Row k="Route" v={rfq ? `${rfq.origin} → ${rfq.destination}` : ""} />
            <Row k="Option" v={opt ? `${opt.name} · ${opt.tag}` : ""} />
            <Row k="Selling" v={t ? inr(t.selling) : "—"} />
          </dl>
        </Panel>
        <Panel title="Operations">
          <dl className="grid gap-2 text-[13px] sm:grid-cols-2">
            <Row k="Pickup" v={b.plannedPickup || "TBC"} />
            <Row k="Departure" v={b.plannedDeparture || "TBC"} />
            <Row k="Arrival" v={b.plannedArrival || "TBC"} />
            <Row k="Carrier ref" v={b.carrierRef || "—"} />
          </dl>
        </Panel>
        <Panel title="Activity" className="xl:col-span-2">
          <ActivityTimeline items={timelineFor("booking", b.id)} />
        </Panel>
      </div>
      <p className="mt-4 text-[12px] text-mute-2">
        Full master-shipment setup opens in the Shipment Execution phase.{" "}
        <button type="button" className="text-accent" onClick={() => pushToast("info", "Shipment workspace", "Coming in the next phase.")}>Notify me</button>
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] text-mute-2">{k}</dt>
      <dd className="text-mist">{v}</dd>
    </div>
  );
}
