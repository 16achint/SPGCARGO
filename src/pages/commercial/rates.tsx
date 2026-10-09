import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useCommercial } from "@/state/CommercialContext";
import {
  CHARGE_GROUPS,
  LOCATIONS,
  inr,
  type ChargeGroup,
  type Quote,
  type QuoteCharge,
  type QuoteOption,
  type Rate,
} from "@/lib/commercial";
import { VENDORS } from "@/lib/mock";
import {
  Drawer,
  EmptyCreate,
  Field,
  PageHead,
  Pill,
  RfqSummary,
  SelectInput,
  TextInput,
  Warn,
} from "@/components/commercial/ui";
import { FilterBarShell, FilterSelect, ClearFilters, opts } from "@/components/app/shared/Filters";
import { Panel } from "@/components/app/shared/primitives";
import { cn } from "@/utils/cn";

export default function RatesPage() {
  const { rates, addRate, nextRateId } = useCommercial();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<string[]>([]);
  const [vendor, setVendor] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    vendor: VENDORS[0],
    origin: "Pune, India",
    destination: "Houston, USA",
    mode: "Ocean",
    group: "Freight" as ChargeGroup,
    charge: "",
    currency: "INR",
    amount: 0,
    validFrom: "",
    validTo: "",
    notes: "",
  });
  const [err, setErr] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rates.filter((r) => {
      if (mode.length && !mode.includes(r.mode)) return false;
      if (vendor.length && !vendor.includes(r.vendor)) return false;
      if (status.length && !status.includes(r.status)) return false;
      if (!query) return true;
      return (
        r.vendor.toLowerCase().includes(query) ||
        r.origin.toLowerCase().includes(query) ||
        r.destination.toLowerCase().includes(query) ||
        r.charge.toLowerCase().includes(query)
      );
    });
  }, [rates, q, mode, vendor, status]);

  function save() {
    if (form.amount <= 0) { setErr("Amount must be greater than 0."); return; }
    if (form.validFrom && form.validTo && form.validTo < form.validFrom) { setErr("Valid To cannot precede Valid From."); return; }
    const r: Rate = {
      id: nextRateId(),
      vendor: form.vendor,
      origin: form.origin,
      destination: form.destination,
      mode: form.mode,
      group: form.group,
      charge: form.charge || form.group,
      currency: form.currency,
      amount: form.amount,
      validFrom: form.validFrom,
      validTo: form.validTo,
      status: "Active",
      notes: form.notes,
    };
    addRate(r);
    setOpen(false);
    setErr("");
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHead
        title="Rates"
        sub="Supplier rate book with validity, mode and charge type."
        actions={
          <>
            <button type="button" className="btn-secondary h-10 rounded-lg px-3 text-[13px]">Import Rates</button>
            <button type="button" className="btn-secondary h-10 rounded-lg px-3 text-[13px]">Export</button>
            <button type="button" onClick={() => setOpen(true)} className="btn-primary inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px]">
              <Plus size={14} /> Add Rate
            </button>
          </>
        }
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vendor, lane, charge..." className="h-9 w-[240px] rounded-lg border border-ink/10 bg-white pl-8 pr-3 text-[13px] focus:border-accent focus:outline-none" />
        </label>
        <FilterBarShell>
          <FilterSelect label="Mode" options={opts(["Ocean", "Air", "Road", "Rail"])} value={mode} onChange={setMode} />
          <FilterSelect label="Vendor" options={opts(VENDORS)} value={vendor} onChange={setVendor} />
          <FilterSelect label="Status" options={opts(["Active", "Expiring Soon", "Expired"])} value={status} onChange={setStatus} />
          {(mode.length || vendor.length || status.length) > 0 && <ClearFilters onClear={() => { setMode([]); setVendor([]); setStatus([]); }} />}
        </FilterBarShell>
      </div>
      <Panel className="mt-4" bodyClass="p-0">
        {filtered.length === 0 ? (
          <EmptyCreate title="No rates match." desc="Add a supplier rate or widen the search." cta="Add Rate" to="/app/rates" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-[12.5px]">
              <thead>
                <tr className="border-y border-ink/6 text-[10.5px] uppercase tracking-[0.12em] text-mute-2">
                  {["Vendor", "Origin", "Destination", "Mode", "Charge", "Amount", "From", "To", "Status"].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-ink/5">
                    <td className="px-3 py-3 font-medium">{r.vendor}</td>
                    <td className="px-3 py-3 text-mute">{r.origin}</td>
                    <td className="px-3 py-3 text-mute">{r.destination}</td>
                    <td className="px-3 py-3">{r.mode}</td>
                    <td className="px-3 py-3">{r.charge}</td>
                    <td className="px-3 py-3 font-medium">{inr(r.amount)}</td>
                    <td className="px-3 py-3 text-mute-2">{r.validFrom}</td>
                    <td className="px-3 py-3 text-mute-2">{r.validTo}</td>
                    <td className="px-3 py-3">
                      <Pill className={r.status === "Active" ? "bg-ok/10 text-ok" : r.status === "Expired" ? "bg-bad/10 text-bad" : "bg-warn/10 text-warn"}>{r.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <Drawer open={open} title="Add Rate" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Field label="Vendor">
            <SelectInput value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })}>
              {VENDORS.map((v) => <option key={v}>{v}</option>)}
            </SelectInput>
          </Field>
          <Field label="Origin">
            <SelectInput value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })}>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </SelectInput>
          </Field>
          <Field label="Destination">
            <SelectInput value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </SelectInput>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mode">
              <SelectInput value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                {["Ocean", "Air", "Road", "Rail"].map((m) => <option key={m}>{m}</option>)}
              </SelectInput>
            </Field>
            <Field label="Charge Type">
              <SelectInput value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value as ChargeGroup })}>
                {CHARGE_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </SelectInput>
            </Field>
          </div>
          <Field label="Charge name"><TextInput value={form.charge} onChange={(e) => setForm({ ...form, charge: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount"><TextInput type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></Field>
            <Field label="Currency">
              <SelectInput value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option>INR</option><option>USD</option>
              </SelectInput>
            </Field>
            <Field label="Valid From"><TextInput type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} /></Field>
            <Field label="Valid To"><TextInput type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} /></Field>
          </div>
          {err && <p className="text-[12px] text-bad">{err}</p>}
          <button type="button" onClick={save} className="btn-primary mt-2 h-10 w-full rounded-lg text-[13px]">Save Rate</button>
        </div>
      </Drawer>
    </div>
  );
}

/* ---------------- Rate evaluation ---------------- */

export function RateEvalPage() {
  const { rfqId } = useParams();
  const { rfqById, customerById, rates, addQuote, nextQuoteId, quotes } = useCommercial();
  const navigate = useNavigate();
  const rfq = rfqById(rfqId ?? "");
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  if (!rfq) return <div className="p-6">RFQ not found.</div>;
  const customer = customerById(rfq.customerId);

  const relevant = rates.filter((r) => {
    const lane =
      r.origin.includes(rfq.origin.split(",")[0]) ||
      r.destination.includes(rfq.destination.split(",")[0]) ||
      r.origin.includes("Nhava") ||
      r.destination.includes("Houston") ||
      r.destination.includes("Nhava");
    return lane;
  });

  const grouped = CHARGE_GROUPS.map((g) => ({
    g,
    rows: relevant.filter((r) => r.group === g),
  })).filter((x) => x.rows.length);

  const picked = rates.filter((r) => selected.includes(r.id));
  const total = picked.reduce((a, r) => a + r.amount, 0);
  const expiredPicked = picked.filter((r) => r.status === "Expired");
  const expiring = picked.filter((r) => r.status === "Expiring Soon");

  function toggle(id: string, status: Rate["status"]) {
    if (status === "Expired") return;
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function createQuote() {
    if (!rfq) return;
    const charges: QuoteCharge[] = picked.map((r) => ({
      id: "qc-" + r.id,
      group: r.group,
      vendor: r.vendor,
      cost: r.amount,
      marginType: "pct",
      margin: 12,
      currency: r.currency,
      rateId: r.id,
    }));
    const opt: QuoteOption = {
      id: "opt-a",
      name: "Option A",
      tag: "BALANCED",
      mode: rfq.mode,
      transitDays: Math.max(10, ...picked.map((p) => p.transitDays ?? 0)),
      charges,
    };
    const existing = quotes.find((q) => q.rfqId === rfq.id && q.status === "Draft");
    const q: Quote = existing
      ? { ...existing, options: [opt, ...existing.options.filter((o) => o.id !== "opt-a")] }
      : {
          id: nextQuoteId(),
          version: 1,
          rfqId: rfq.id,
          customerId: rfq.customerId,
          options: [opt],
          validUntil: "2026-10-28",
          status: "Draft",
          owner: "N. Verghese",
          created: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
          locked: false,
          versions: [{ version: 1, created: "just now", by: "N. Verghese", status: "Draft" }],
        };
    addQuote(q);
    navigate(`/app/quotes/${q.id}`);
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHead
        title="Rate Evaluation"
        sub={`${rfq.id} · ${customer?.company}`}
        actions={
          <>
            <button type="button" onClick={() => setSaved(true)} className="btn-secondary h-10 rounded-lg px-4 text-[13px]">Save Evaluation</button>
            <button type="button" disabled={picked.length === 0} onClick={createQuote} className="btn-primary h-10 rounded-lg px-4 text-[13px] disabled:opacity-50">Create Quote Option</button>
          </>
        }
      />
      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <RfqSummary rfq={rfq} customer={customer} />
          {grouped.length === 0 && (
            <Panel>
              <p className="text-[14px] font-medium text-mist">No valid rates found for this route.</p>
              <p className="mt-1 text-[13px] text-mute">Add a rate or modify origin / destination.</p>
              <div className="mt-3 flex gap-2">
                <Link to="/app/rates" className="btn-primary inline-flex h-9 items-center rounded-lg px-3 text-[12.5px]">Add Rate</Link>
                <Link to={`/app/rfqs/${rfq.id}`} className="btn-secondary inline-flex h-9 items-center rounded-lg px-3 text-[12.5px]">Modify Search</Link>
              </div>
            </Panel>
          )}
          {grouped.map(({ g, rows }) => (
            <Panel key={g} title={g} sub={`${rows.length} component${rows.length === 1 ? "" : "s"}`}>
              <div className="space-y-2">
                {compareHint(rows)}
                {rows.map((r) => {
                  const on = selected.includes(r.id);
                  const disabled = r.status === "Expired";
                  return (
                    <button
                      key={r.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggle(r.id, r.status)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                        disabled ? "cursor-not-allowed opacity-45" : on ? "border-accent bg-accent/5" : "border-ink/8 hover:border-ink/20",
                      )}
                    >
                      <span className={cn("flex h-4 w-4 items-center justify-center rounded border", on ? "border-accent bg-accent text-white" : "border-ink/20")}>
                        {on && "✓"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-mist">{r.vendor}</span>
                        <span className="block text-[11px] text-mute">{r.charge}{r.transitDays ? ` · ${r.transitDays} days` : ""}</span>
                      </span>
                      <span className="text-right">
                        <span className="block text-[13px] font-medium">{inr(r.amount)}</span>
                        <span className="block text-[10.5px] text-mute-2">{r.validTo}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          ))}
        </div>
        <aside className="xl:sticky xl:top-4 h-fit space-y-3">
          <Panel title="Live cost summary">
            {picked.length === 0 ? (
              <p className="text-[12.5px] text-mute-2">Select rate components to build expected cost.</p>
            ) : (
              <ul className="space-y-1.5 text-[12.5px]">
                {picked.map((r) => (
                  <li key={r.id} className="flex justify-between">
                    <span className="text-mute">{r.group}</span>
                    <span>{inr(r.amount)}</span>
                  </li>
                ))}
                <li className="mt-2 flex justify-between border-t border-ink/8 pt-2 font-medium">
                  <span>Total expected cost</span>
                  <span className="text-accent">{inr(total)}</span>
                </li>
              </ul>
            )}
            {expiredPicked.length > 0 && <div className="mt-3"><Warn>Expired rates cannot be selected.</Warn></div>}
            {expiring.length > 0 && <div className="mt-3"><Warn>{expiring.length} selected rate{expiring.length > 1 ? "s" : ""} expire soon.</Warn></div>}
            {saved && <p className="mt-3 text-[12px] text-ok">Evaluation saved to this RFQ.</p>}
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function compareHint(rows: Rate[]) {
  if (rows.length < 2) return null;
  const lowest = [...rows].sort((a, b) => a.amount - b.amount)[0];
  const fastest = [...rows].filter((r) => r.transitDays).sort((a, b) => (a.transitDays ?? 99) - (b.transitDays ?? 99))[0];
  return (
    <p className="mb-2 text-[11px] text-mute-2">
      Lowest cost · {lowest.vendor} · Fastest · {fastest?.vendor ?? "—"}
    </p>
  );
}


