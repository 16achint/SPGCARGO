import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { useCommercial } from "@/state/CommercialContext";
import { useApp } from "@/state/AppContext";
import {
  inr,
  OWNERS,
  type Contact,
  type ContactType,
  type Customer,
  type CustomerCategory,
  type CustomerStatus,
  type KycDoc,
} from "@/lib/commercial";
import { SHIPMENTS } from "@/lib/mock";
import {
  ActivityTimeline,
  BookingBadge,
  Dialog,
  EmptyCreate,
  Field,
  KpiStrip,
  PageHead,
  Pill,
  QuoteBadge,
  RfqBadge,
  SelectInput,
  StepFooter,
  Stepper,
  TextArea,
  TextInput,
} from "@/components/commercial/ui";
import { FilterBarShell, FilterSelect, ClearFilters, opts } from "@/components/app/shared/Filters";
import { Panel } from "@/components/app/shared/primitives";
import { cn } from "@/utils/cn";

const CAT: CustomerCategory[] = ["OEM", "Trader", "Manufacturer", "Distributor", "3PL"];
const STAT: CustomerStatus[] = ["Active", "On Hold", "Prospect", "Inactive"];
const TERMS = ["Net 15", "Net 21", "Net 30", "Net 45", "LC at sight", "Advance 50%"];

export default function CustomersPage() {
  const { customers, rfqs, quotes } = useCommercial();
  const { pushToast } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [category, setCategory] = useState<string[]>([]);
  const [owner, setOwner] = useState<string[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [menu, setMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return customers.filter((c) => {
      if (status.length && !status.includes(c.status)) return false;
      if (category.length && !category.includes(c.category)) return false;
      if (owner.length && !owner.includes(c.owner)) return false;
      if (terms.length && !terms.includes(c.creditTerms)) return false;
      if (!query) return true;
      return (
        c.company.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.gstin.toLowerCase().includes(query) ||
        c.contacts[0]?.name.toLowerCase().includes(query)
      );
    });
  }, [customers, q, status, category, owner, terms]);

  const pageSize = 8;
  const rows = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const hasF = status.length + category.length + owner.length + terms.length > 0;

  return (
    <div className="p-4 sm:p-6">
      <PageHead
        title="Customers"
        sub="Manage customer profiles, contacts, commercial terms and activity."
        actions={
          <>
            <button type="button" onClick={() => pushToast("info", "Import queued")} className="btn-secondary h-10 rounded-lg px-3 text-[13px]">
              Import
            </button>
            <button type="button" onClick={() => pushToast("info", "Export started")} className="btn-secondary h-10 rounded-lg px-3 text-[13px]">
              Export
            </button>
            <Link to="/app/customers/new" className="btn-primary inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px]">
              <Plus size={14} /> New Customer
            </Link>
          </>
        }
      />
      <div className="mt-5">
        <KpiStrip
          items={[
            { label: "Total Customers", value: customers.length },
            { label: "Active", value: customers.filter((c) => c.status === "Active").length, tone: "text-ok" },
            { label: "Open RFQs", value: rfqs.filter((r) => !["Won", "Lost"].includes(r.status)).length },
            { label: "Active Quotes", value: quotes.filter((q) => !["Accepted", "Expired", "Rejected by Customer"].includes(q.status)).length },
            { label: "Outstanding", value: inr(customers.reduce((a, c) => a + c.outstanding, 0)) },
          ]}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute-2" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            placeholder="Search company, GSTIN, contact..."
            className="h-9 w-[240px] rounded-lg border border-ink/10 bg-white pl-8 pr-3 text-[13px] focus:border-accent focus:outline-none"
          />
        </label>
        <FilterBarShell>
          <FilterSelect label="Status" options={opts(STAT)} value={status} onChange={setStatus} />
          <FilterSelect label="Category" options={opts(CAT)} value={category} onChange={setCategory} />
          <FilterSelect label="Owner" options={opts(OWNERS)} value={owner} onChange={setOwner} />
          <FilterSelect label="Credit Terms" options={opts(TERMS)} value={terms} onChange={setTerms} />
          {hasF && (
            <ClearFilters
              onClear={() => {
                setStatus([]); setCategory([]); setOwner([]); setTerms([]);
              }}
            />
          )}
        </FilterBarShell>
      </div>

      <Panel className="mt-4" bodyClass="p-0">
        {filtered.length === 0 ? (
          <EmptyCreate title="No customers yet." desc="Add a customer to start the commercial flow." cta="Create Customer" to="/app/customers/new" />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1080px] text-left text-[12.5px]">
                <thead>
                  <tr className="border-y border-ink/6 text-[10.5px] uppercase tracking-[0.12em] text-mute-2">
                    {["Customer ID", "Company", "Category", "GSTIN", "Primary Contact", "Credit Terms", "Open RFQs", "Active Shipments", "Outstanding", "Status", "Owner", ""].map((h) => (
                      <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => {
                    const open = rfqs.filter((r) => r.customerId === c.id && !["Won", "Lost"].includes(r.status)).length;
                    const ships = SHIPMENTS.filter((s) => s.customer === c.company).length;
                    const primary = c.contacts.find((x) => x.primary) ?? c.contacts[0];
                    return (
                      <tr
                        key={c.id}
                        onClick={() => navigate(`/app/customers/${c.id}`)}
                        className="cursor-pointer border-b border-ink/5 transition hover:bg-accent/4"
                      >
                        <td className="px-3 py-3 font-mono text-[11.5px] text-accent">{c.id}</td>
                        <td className="px-3 py-3 font-medium text-mist">{c.company}</td>
                        <td className="px-3 py-3 text-mute">{c.category}</td>
                        <td className="px-3 py-3 font-mono text-[11px] text-mute">{c.gstin}</td>
                        <td className="px-3 py-3">
                          <p className="text-mist">{primary?.name}</p>
                          <p className="text-[10.5px] text-mute-2">{primary?.email}</p>
                        </td>
                        <td className="px-3 py-3 text-mute">{c.creditTerms}</td>
                        <td className="px-3 py-3">{open}</td>
                        <td className="px-3 py-3">{ships}</td>
                        <td className="px-3 py-3 font-medium">{inr(c.outstanding)}</td>
                        <td className="px-3 py-3">
                          <Pill className={c.status === "Active" ? "bg-ok/10 text-ok" : "bg-ink/8 text-mute"}>{c.status}</Pill>
                        </td>
                        <td className="px-3 py-3 text-mute">{c.owner}</td>
                        <td className="relative px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <button type="button" aria-label="Actions" onClick={() => setMenu(menu === c.id ? null : c.id)} className="rounded-md p-1 text-mute-2 hover:bg-ink/5">
                            <MoreHorizontal size={15} />
                          </button>
                          {menu === c.id && (
                            <div className="absolute right-3 top-10 z-20 w-44 overflow-hidden rounded-lg border border-ink/10 bg-white py-1 shadow-lg">
                              {[
                                ["View Customer", `/app/customers/${c.id}`],
                                ["Create RFQ", `/app/rfqs/new?customer=${c.id}`],
                                ["View Shipments", "/app/shipments"],
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
            <div className="space-y-2 p-3 md:hidden">
              {rows.map((c) => (
                <button key={c.id} type="button" onClick={() => navigate(`/app/customers/${c.id}`)} className="w-full rounded-xl border border-ink/8 bg-white p-3 text-left">
                  <div className="flex justify-between">
                    <span className="font-medium text-mist">{c.company}</span>
                    <Pill className="bg-ok/10 text-ok">{c.status}</Pill>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-accent">{c.id}</p>
                  <p className="mt-1 text-[12px] text-mute">{c.city} · {c.creditTerms}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-between border-t border-ink/6 px-4 py-2.5 text-[11px] text-mute-2">
              <span>{filtered.length} customers</span>
              <div className="flex gap-1">
                <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-ink/10 px-2 py-1 disabled:opacity-40">Prev</button>
                <button type="button" disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-ink/10 px-2 py-1 disabled:opacity-40">Next</button>
              </div>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}

/* ---------------- New Customer ---------------- */

const STEPS = ["Company", "Compliance", "Contacts", "Commercial", "KYC", "Review"];

const blankContact = (): Contact => ({
  id: "c" + Math.random().toString(36).slice(2, 7),
  name: "",
  designation: "",
  email: "",
  phone: "",
  type: "Primary",
  primary: true,
});

export function CustomerNewPage() {
  const { customers, addCustomer, nextCustomerId } = useCommercial();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<Customer | null>(null);
  const [form, setForm] = useState(() => ({
    id: nextCustomerId(),
    company: "",
    category: "OEM" as CustomerCategory,
    address: "",
    city: "",
    state: "",
    country: "India",
    postal: "",
    website: "",
    industry: "",
    gstin: "",
    pan: "",
    iec: "",
    contacts: [blankContact()],
    billingAddress: "",
    creditTerms: "Net 30",
    creditDays: 30,
    currency: "INR",
    paymentTerms: "30 days from invoice",
    owner: "N. Verghese",
    creditLimit: 0,
    kyc: [
      { name: "GST Certificate" },
      { name: "PAN" },
      { name: "IEC" },
      { name: "Company Registration" },
      { name: "Other KYC" },
    ] as KycDoc[],
    status: "Active" as CustomerStatus,
  }));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [leave, setLeave] = useState(false);

  const dupId = customers.some((c) => c.id === form.id);
  const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const primary = form.contacts.find((c) => c.primary) ?? form.contacts[0];

  const errors = {
    company: !form.company.trim() ? "Company name is required." : "",
    id: !form.id.trim() ? "Customer ID is required." : dupId ? "This Customer ID already exists." : "",
    contact: !primary?.name.trim() ? "Primary contact name is required." : "",
    email: primary && !emailOk(primary.email) ? "Enter a valid email." : "",
    phone: primary && primary.phone.replace(/\D/g, "").length < 10 ? "Enter a valid phone number." : "",
  };

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function canNext() {
    if (step === 0) return !errors.company;
    if (step === 1) return !errors.id;
    if (step === 2) return !errors.contact && !errors.email && !errors.phone;
    return true;
  }

  function save() {
    const c: Customer = {
      ...form,
      outstanding: 0,
      ytdRevenue: 0,
      margin: 0,
      billingAddress: form.billingAddress || form.address,
    };
    addCustomer(c);
    setDone(c);
  }

  if (done) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-ink/8 bg-white p-8 text-center">
          <p className="eyebrow">Customer created</p>
          <h1 className="mt-2 text-[26px] font-medium text-mist">{done.company}</h1>
          <p className="mt-1 font-mono text-[13px] text-accent">{done.id}</p>
          <p className="mt-3 text-[13px] text-mute">
            Primary contact {done.contacts[0]?.name} · {done.contacts[0]?.email}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to={`/app/customers/${done.id}`} className="btn-primary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">View Customer</Link>
            <Link to={`/app/rfqs/new?customer=${done.id}`} className="btn-secondary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">Create RFQ</Link>
            <Link to="/app/customers" className="h-10 px-4 text-[13px] text-mute hover:text-mist">Return to Customers</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHead
        title="New Customer"
        sub="Capture company, compliance, contacts and commercial terms."
        actions={
          <button type="button" onClick={() => setLeave(true)} className="text-[13px] text-mute hover:text-mist">
            Cancel
          </button>
        }
      />
      <div className="mt-5">
        <Stepper steps={STEPS} current={step} onJump={(i) => i <= step && setStep(i)} />
      </div>
      <div className="mx-auto mt-8 max-w-3xl">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company Name" required error={touched.company ? errors.company : ""} className="sm:col-span-2">
              <TextInput value={form.company} error={Boolean(touched.company && errors.company)} onBlur={() => setTouched((t) => ({ ...t, company: true }))} onChange={(e) => set("company", e.target.value)} />
            </Field>
            <Field label="Customer Category">
              <SelectInput value={form.category} onChange={(e) => set("category", e.target.value as CustomerCategory)}>
                {CAT.map((c) => <option key={c}>{c}</option>)}
              </SelectInput>
            </Field>
            <Field label="Industry">
              <TextInput value={form.industry} onChange={(e) => set("industry", e.target.value)} />
            </Field>
            <Field label="Registered Address" className="sm:col-span-2">
              <TextInput value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
            <Field label="City"><TextInput value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="State"><TextInput value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
            <Field label="Country"><TextInput value={form.country} onChange={(e) => set("country", e.target.value)} /></Field>
            <Field label="Postal Code"><TextInput value={form.postal} onChange={(e) => set("postal", e.target.value)} /></Field>
            <Field label="Website" className="sm:col-span-2">
              <TextInput value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="company.com" />
            </Field>
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer ID" required error={errors.id} className="sm:col-span-2">
              <TextInput value={form.id} error={Boolean(errors.id)} onChange={(e) => set("id", e.target.value.toUpperCase())} />
            </Field>
            <Field label="GSTIN"><TextInput value={form.gstin} onChange={(e) => set("gstin", e.target.value.toUpperCase())} /></Field>
            <Field label="PAN"><TextInput value={form.pan} onChange={(e) => set("pan", e.target.value.toUpperCase())} /></Field>
            <Field label="IEC" className="sm:col-span-2"><TextInput value={form.iec} onChange={(e) => set("iec", e.target.value)} /></Field>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            {form.contacts.map((ct, i) => (
              <div key={ct.id} className="rounded-xl border border-ink/8 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[12px] font-medium text-mist">Contact {i + 1}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        set("contacts", form.contacts.map((x) => ({ ...x, primary: x.id === ct.id })))
                      }
                      className={cn("text-[11.5px]", ct.primary ? "font-medium text-accent" : "text-mute")}
                    >
                      {ct.primary ? "Primary" : "Set primary"}
                    </button>
                    {form.contacts.length > 1 && (
                      <button type="button" onClick={() => set("contacts", form.contacts.filter((x) => x.id !== ct.id))} className="text-[11.5px] text-bad">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" required error={ct.primary && touched.contact ? errors.contact : ""}>
                    <TextInput value={ct.name} onBlur={() => setTouched((t) => ({ ...t, contact: true }))} onChange={(e) => set("contacts", form.contacts.map((x) => x.id === ct.id ? { ...x, name: e.target.value } : x))} />
                  </Field>
                  <Field label="Designation">
                    <TextInput value={ct.designation} onChange={(e) => set("contacts", form.contacts.map((x) => x.id === ct.id ? { ...x, designation: e.target.value } : x))} />
                  </Field>
                  <Field label="Email" required error={ct.primary && touched.email ? errors.email : ""}>
                    <TextInput value={ct.email} onBlur={() => setTouched((t) => ({ ...t, email: true }))} onChange={(e) => set("contacts", form.contacts.map((x) => x.id === ct.id ? { ...x, email: e.target.value } : x))} />
                  </Field>
                  <Field label="Phone" required error={ct.primary && touched.phone ? errors.phone : ""}>
                    <TextInput value={ct.phone} onBlur={() => setTouched((t) => ({ ...t, phone: true }))} onChange={(e) => set("contacts", form.contacts.map((x) => x.id === ct.id ? { ...x, phone: e.target.value } : x))} />
                  </Field>
                  <Field label="Contact Type">
                    <SelectInput value={ct.type} onChange={(e) => set("contacts", form.contacts.map((x) => x.id === ct.id ? { ...x, type: e.target.value as ContactType } : x))}>
                      {["Primary", "Commercial", "Operations", "Finance", "Other"].map((t) => <option key={t}>{t}</option>)}
                    </SelectInput>
                  </Field>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => set("contacts", [...form.contacts, { ...blankContact(), primary: false, type: "Commercial" }])} className="text-[13px] font-medium text-accent">
              + Add Contact
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Billing Address" className="sm:col-span-2">
              <TextArea value={form.billingAddress} onChange={(e) => set("billingAddress", e.target.value)} placeholder="Defaults to registered address" />
            </Field>
            <Field label="Credit Terms">
              <SelectInput value={form.creditTerms} onChange={(e) => set("creditTerms", e.target.value)}>
                {TERMS.map((t) => <option key={t}>{t}</option>)}
              </SelectInput>
            </Field>
            <Field label="Credit Days">
              <TextInput type="number" value={form.creditDays} onChange={(e) => set("creditDays", Number(e.target.value))} />
            </Field>
            <Field label="Preferred Currency">
              <SelectInput value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                {["INR", "USD", "EUR"].map((c) => <option key={c}>{c}</option>)}
              </SelectInput>
            </Field>
            <Field label="Payment Terms">
              <TextInput value={form.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} />
            </Field>
            <Field label="Sales Owner">
              <SelectInput value={form.owner} onChange={(e) => set("owner", e.target.value)}>
                {OWNERS.map((o) => <option key={o}>{o}</option>)}
              </SelectInput>
            </Field>
            <Field label="Credit Limit (optional)">
              <TextInput type="number" value={form.creditLimit || ""} onChange={(e) => set("creditLimit", Number(e.target.value))} />
            </Field>
          </div>
        )}
        {step === 4 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {form.kyc.map((k) => (
              <div key={k.name} className="rounded-xl border border-dashed border-ink/15 bg-white p-4">
                <p className="text-[13px] font-medium text-mist">{k.name}</p>
                {k.file ? (
                  <div className="mt-2 flex items-center justify-between text-[12px]">
                    <span className="text-mute">{k.file}</span>
                    <button type="button" className="text-bad" onClick={() => set("kyc", form.kyc.map((x) => x.name === k.name ? { ...x, file: undefined } : x))}>Remove</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => set("kyc", form.kyc.map((x) => x.name === k.name ? { ...x, file: `${k.name.replace(/\s/g, "-")}.pdf` } : x))}
                    className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent"
                  >
                    <Upload size={13} /> Upload
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {step === 5 && (
          <div className="space-y-4">
            {[
              ["Company", `${form.company} · ${form.category} · ${form.city || "—"}`],
              ["Compliance", `${form.id} · GSTIN ${form.gstin || "—"} · PAN ${form.pan || "—"}`],
              ["Contacts", form.contacts.map((c) => `${c.name} (${c.type})`).join(", ")],
              ["Commercial", `${form.creditTerms} · ${form.currency} · Owner ${form.owner}`],
              ["Documents", form.kyc.filter((k) => k.file).map((k) => k.name).join(", ") || "None uploaded"],
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
          nextLabel={step === 5 ? "Save Customer" : "Continue"}
          disabled={!canNext()}
          onNext={() => {
            setTouched({ company: true, contact: true, email: true, phone: true });
            if (!canNext()) return;
            if (step === 5) save();
            else setStep((s) => s + 1);
          }}
        />
      </div>
      <Dialog open={leave} title="Discard this customer?" onClose={() => setLeave(false)}>
        <p className="text-[13px] text-mute">Unsaved details will be lost.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary h-9 rounded-lg px-3 text-[13px]" onClick={() => setLeave(false)}>Keep editing</button>
          <button type="button" className="h-9 rounded-lg bg-bad px-3 text-[13px] text-white" onClick={() => navigate("/app/customers")}>Discard</button>
        </div>
      </Dialog>
    </div>
  );
}

/* ---------------- 360 ---------------- */

export function Customer360Page() {
  const { customerId } = useParams();
  const { customerById, rfqsFor, quotesFor, bookingsFor, timelineFor } = useCommercial();
  const { pushToast } = useApp();
  const c = customerById(customerId ?? "");
  const [tab, setTab] = useState("Overview");
  if (!c) {
    return (
      <div className="p-6">
        <p className="text-mist">Customer not found.</p>
        <Link to="/app/customers" className="mt-3 inline-block text-[13px] text-accent">Back to customers</Link>
      </div>
    );
  }
  const rfqs = rfqsFor(c.id);
  const quotes = quotesFor(c.id);
  const bookings = bookingsFor(c.id);
  const ships = SHIPMENTS.filter((s) => s.customer === c.company);
  const tabs = ["Overview", "Contacts", "RFQs", "Quotes", "Shipments", "Documents", "Finance", "Activity"];

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[12px] text-accent">{c.id}</p>
          <h1 className="mt-1 text-[26px] font-medium tracking-tight text-mist">{c.company}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-mute">
            <Pill className={c.status === "Active" ? "bg-ok/10 text-ok" : "bg-ink/8 text-mute"}>{c.status}</Pill>
            <span>Owner {c.owner}</span>
            <span>·</span>
            <span>{c.creditTerms}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/app/rfqs/new?customer=${c.id}`} className="btn-primary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">Create RFQ</Link>
          <button type="button" onClick={() => pushToast("info", "Edit opens in a later refinement")} className="btn-secondary h-10 rounded-lg px-4 text-[13px]">Edit</button>
          <button type="button" onClick={() => pushToast("info", "Upload queued")} className="btn-secondary h-10 rounded-lg px-3 text-[13px]"><Upload size={14} /></button>
        </div>
      </div>
      <div className="mt-5">
        <KpiStrip
          items={[
            { label: "Open RFQs", value: rfqs.filter((r) => !["Won", "Lost"].includes(r.status)).length },
            { label: "Active Quotes", value: quotes.filter((q) => ["Draft", "Awaiting Approval", "Awaiting Customer", "Sent"].includes(q.status)).length },
            { label: "Active Shipments", value: ships.length },
            { label: "YTD Revenue", value: inr(c.ytdRevenue) },
            { label: "Outstanding", value: inr(c.outstanding) },
            { label: "Gross Margin", value: `${c.margin.toFixed(1)}%` },
          ]}
        />
      </div>
      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-ink/8">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-[13px] transition",
              tab === t ? "border-accent font-medium text-mist" : "border-transparent text-mute hover:text-mist",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "Overview" && (
          <div className="grid gap-4 xl:grid-cols-3">
            <Panel title="Company" className="xl:col-span-2">
              <dl className="grid gap-3 sm:grid-cols-2 text-[13px]">
                <Item k="Address" v={`${c.address}, ${c.city} ${c.postal}`} />
                <Item k="Industry" v={c.industry || "—"} />
                <Item k="GSTIN" v={c.gstin} />
                <Item k="PAN" v={c.pan} />
                <Item k="IEC" v={c.iec} />
                <Item k="Website" v={c.website || "—"} />
              </dl>
            </Panel>
            <Panel title="Commercial terms">
              <dl className="space-y-2 text-[13px]">
                <Item k="Credit" v={`${c.creditTerms} · ${c.creditDays} days`} />
                <Item k="Currency" v={c.currency} />
                <Item k="Payment" v={c.paymentTerms} />
                <Item k="Owner" v={c.owner} />
              </dl>
            </Panel>
            <Panel title="Recent RFQs" className="xl:col-span-2" bodyClass="p-0">
              <ul>
                {rfqs.slice(0, 5).map((r) => (
                  <li key={r.id}>
                    <Link to={`/app/rfqs/${r.id}`} className="flex items-center justify-between px-4 py-2.5 text-[12.5px] hover:bg-ink/3">
                      <span className="font-mono text-accent">{r.id}</span>
                      <span className="text-mute">{r.origin} → {r.destination}</span>
                      <RfqBadge status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Activity">
              <ActivityTimeline items={timelineFor("customer", c.id)} />
            </Panel>
          </div>
        )}
        {tab === "Contacts" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {c.contacts.map((ct) => (
              <div key={ct.id} className="rounded-xl border border-ink/8 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-mist">{ct.name}</p>
                  {ct.primary && <Pill className="bg-accent/10 text-accent">Primary</Pill>}
                </div>
                <p className="mt-1 text-[12px] text-mute">{ct.designation} · {ct.type}</p>
                <p className="mt-2 text-[12.5px]">{ct.email}</p>
                <p className="text-[12.5px] text-mute">{ct.phone}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "RFQs" && (
          <Panel bodyClass="p-0">
            {rfqs.map((r) => (
              <Link key={r.id} to={`/app/rfqs/${r.id}`} className="flex items-center justify-between border-b border-ink/5 px-4 py-3 text-[13px] last:border-0 hover:bg-ink/3">
                <span className="font-mono text-accent">{r.id}</span>
                <span>{r.origin} → {r.destination}</span>
                <RfqBadge status={r.status} />
              </Link>
            ))}
          </Panel>
        )}
        {tab === "Quotes" && (
          <Panel bodyClass="p-0">
            {quotes.map((q) => (
              <Link key={q.id} to={`/app/quotes/${q.id}`} className="flex items-center justify-between border-b border-ink/5 px-4 py-3 text-[13px] last:border-0 hover:bg-ink/3">
                <span className="font-mono text-accent">{q.id}-V{q.version}</span>
                <QuoteBadge status={q.status} />
              </Link>
            ))}
          </Panel>
        )}
        {["Shipments", "Documents", "Finance"].includes(tab) && (
          <div className="rounded-xl border border-ink/8 bg-white p-8 text-center">
            <FileText className="mx-auto text-mute-2" size={22} />
            <p className="mt-3 text-[14px] font-medium text-mist">{tab} for {c.company}</p>
            <p className="mt-1 text-[13px] text-mute">This view opens in a later CargoOS phase. Commercial records above are live.</p>
          </div>
        )}
        {tab === "Activity" && (
          <Panel title="Activity">
            <ActivityTimeline items={[...timelineFor("customer", c.id), ...rfqs.flatMap((r) => timelineFor("rfq", r.id))].slice(0, 12)} />
          </Panel>
        )}
        {tab === "Quotes" && bookings.length > 0 && (
          <p className="mt-3 text-[12px] text-mute">{bookings.length} related booking(s) · {bookings.map((b) => b.id).join(", ")}</p>
        )}
      </div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] text-mute-2">{k}</dt>
      <dd className="text-mist">{v}</dd>
    </div>
  );
}

export { BookingBadge };
