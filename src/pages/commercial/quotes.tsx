import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Lock, Plus, Search } from "lucide-react";
import { useCommercial } from "@/state/CommercialContext";
import { useApp } from "@/state/AppContext";
import {
  CHARGE_GROUPS,
  REJECT_REASONS,
  inr,
  isExpired,
  optionTotals,
  sellingOf,
  type Quote,
  type QuoteCharge,
  type QuoteOption,
  type QuoteStatus,
} from "@/lib/commercial";
import {
  CommercialBox,
  Dialog,
  EmptyCreate,
  Field,
  InheritedBanner,
  KpiStrip,
  PageHead,
  QuoteBadge,
  QuoteOptionCard,
  SelectInput,
  TextArea,
  TextInput,
  Warn,
} from "@/components/commercial/ui";
import { FilterBarShell, FilterSelect, ClearFilters, opts } from "@/components/app/shared/Filters";
import { Panel } from "@/components/app/shared/primitives";
import { Logo } from "@/components/ui/Logo";

const QSTAT: QuoteStatus[] = [
  "Draft",
  "Awaiting Approval",
  "Approved",
  "Sent",
  "Awaiting Customer",
  "Accepted",
  "Rejected",
  "Rejected by Customer",
  "Expired",
];

export default function QuotesPage() {
  const { quotes, customers, rfqs } = useCommercial();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return quotes.filter((x) => {
      if (status.length && !status.includes(x.status)) return false;
      if (!query) return true;
      const c = customers.find((c) => c.id === x.customerId);
      return x.id.toLowerCase().includes(query) || x.rfqId.toLowerCase().includes(query) || (c?.company.toLowerCase().includes(query) ?? false);
    });
  }, [quotes, q, status, customers]);

  const counts = (s: QuoteStatus) => quotes.filter((x) => x.status === s).length;

  return (
    <div className="p-4 sm:p-6">
      <PageHead title="Quotations" sub="Build options, apply margin and send a customer-ready quote." />
      <div className="mt-5">
        <KpiStrip
          items={[
            { label: "Draft", value: counts("Draft") },
            { label: "Awaiting Approval", value: counts("Awaiting Approval") },
            { label: "Sent", value: counts("Sent") + counts("Awaiting Customer") },
            { label: "Awaiting Customer", value: counts("Awaiting Customer") },
            { label: "Accepted", value: counts("Accepted"), tone: "text-ok" },
            { label: "Rejected", value: counts("Rejected") + counts("Rejected by Customer") },
            { label: "Expired", value: counts("Expired") },
          ]}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search quote, RFQ, customer..." className="h-9 w-[240px] rounded-lg border border-ink/10 bg-white pl-8 pr-3 text-[13px] focus:border-accent focus:outline-none" />
        </label>
        <FilterBarShell>
          <FilterSelect label="Status" options={opts(QSTAT)} value={status} onChange={setStatus} />
          {status.length > 0 && <ClearFilters onClear={() => setStatus([])} />}
        </FilterBarShell>
      </div>
      <Panel className="mt-4" bodyClass="p-0">
        {filtered.length === 0 ? (
          <EmptyCreate title="No quotations yet." desc="Evaluate rates on an RFQ to create the first option." cta="Open RFQs" to="/app/rfqs" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-[12.5px]">
              <thead>
                <tr className="border-y border-ink/6 text-[10.5px] uppercase tracking-[0.12em] text-mute-2">
                  {["Quote ID", "RFQ", "Customer", "Route", "Version", "Options", "Selling", "Margin", "Valid Until", "Status", "Owner"].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((x) => {
                  const c = customers.find((c) => c.id === x.customerId);
                  const r = rfqs.find((r) => r.id === x.rfqId);
                  const primary = x.options[0] ? optionTotals(x.options[0]) : { selling: 0, margin: 0 };
                  return (
                    <tr key={x.id} onClick={() => navigate(`/app/quotes/${x.id}`)} className="cursor-pointer border-b border-ink/5 hover:bg-accent/4">
                      <td className="px-3 py-3 font-mono text-[11.5px] text-accent">{x.id}</td>
                      <td className="px-3 py-3 font-mono text-[11px]">{x.rfqId}</td>
                      <td className="px-3 py-3">{c?.company}</td>
                      <td className="px-3 py-3 text-mute">{r ? `${r.origin.split(",")[0]} → ${r.destination.split(",")[0]}` : "—"}</td>
                      <td className="px-3 py-3">V{x.version}</td>
                      <td className="px-3 py-3">{x.options.length}</td>
                      <td className="px-3 py-3 font-medium">{inr(primary.selling)}</td>
                      <td className="px-3 py-3">{primary.margin.toFixed(1)}%</td>
                      <td className="px-3 py-3">{x.validUntil}</td>
                      <td className="px-3 py-3"><QuoteBadge status={x.status} /></td>
                      <td className="px-3 py-3 text-mute">{x.owner}</td>
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

/* ---------------- Builder / Detail ---------------- */

export function QuoteBuilderPage() {
  const { quoteId, rfqId } = useParams();
  const [params] = useSearchParams();
  const { quotes, rfqById, customerById, rates, saveQuote, requestApproval, sendQuote, newQuoteVersion, addQuote, nextQuoteId } = useCommercial();
  const { session } = useApp();
  const navigate = useNavigate();
  const rfqParam = params.get("rfq") ?? rfqId;

  const existing = quotes.find((q) => q.id === quoteId);
  const [draft, setDraft] = useState<Quote | null>(existing ?? null);
  const rfqForNew = rfqById(rfqParam ?? "");
  const spawned = useRef(false);

  useEffect(() => {
    setDraft(existing ?? null);
  }, [quoteId]);

  useEffect(() => {
    if (spawned.current || quoteId || !rfqForNew) return;
    spawned.current = true;
    const q: Quote = {
      id: nextQuoteId(),
      version: 1,
      rfqId: rfqForNew.id,
      customerId: rfqForNew.customerId,
      options: [blankOption("Option A", "BALANCED")],
      validUntil: "2026-10-28",
      status: "Draft",
      owner: "N. Verghese",
      created: "just now",
      locked: false,
      versions: [{ version: 1, created: "just now", by: "N. Verghese", status: "Draft" }],
    };
    addQuote(q);
    navigate(`/app/quotes/${q.id}`, { replace: true });
  }, [quoteId, rfqForNew, addQuote, nextQuoteId, navigate]);

  const quote = draft ?? existing;
  if (!quote) {
    if (rfqForNew) return <div className="p-6 text-[13px] text-mute">Creating quotation…</div>;
    return <div className="p-6">Quote not found. <Link to="/app/quotes" className="text-accent">Back</Link></div>;
  }

  const rfq = rfqById(quote.rfqId);
  const customer = customerById(quote.customerId);
  const locked = quote.locked || quote.status === "Accepted";
  const canApprove = session?.role === "management" || session?.role === "admin";
  const isSales = session?.role === "sales" || session?.role === "admin" || session?.role === "operations";

  function patch(p: Partial<Quote>) {
    if (locked) return;
    const next = { ...quote!, ...p };
    setDraft(next);
  }

  function patchOpt(id: string, p: Partial<QuoteOption>) {
    patch({ options: quote!.options.map((o) => (o.id === id ? { ...o, ...p } : o)) });
  }

  function patchCharge(optId: string, chId: string, p: Partial<QuoteCharge>) {
    patch({
      options: quote!.options.map((o) =>
        o.id === optId ? { ...o, charges: o.charges.map((c) => (c.id === chId ? { ...c, ...p } : c)) } : o,
      ),
    });
  }

  const validityWarn = quote.options.some((o) =>
    o.charges.some((c) => {
      const rate = rates.find((r) => r.id === c.rateId);
      return rate && rate.validTo && quote.validUntil && rate.validTo < quote.validUntil;
    }),
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[12px] text-accent">{quote.id} · V{quote.version}</p>
          <h1 className="mt-1 text-[24px] font-medium text-mist">{customer?.company}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-mute">
            <QuoteBadge status={quote.status} />
            {locked && <span className="inline-flex items-center gap-1 text-ok"><Lock size={12} /> Accepted — Locked</span>}
            <span>RFQ {quote.rfqId}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSales && !locked && (
            <>
              <button type="button" onClick={() => { saveQuote(quote); setDraft(quote); }} className="btn-secondary h-10 rounded-lg px-3 text-[13px]">Save Draft</button>
              <Link to={`/app/quotes/${quote.id}/preview`} className="btn-secondary inline-flex h-10 items-center rounded-lg px-3 text-[13px]">Preview</Link>
              {quote.status === "Draft" || quote.status === "Changes Requested" ? (
                <button type="button" onClick={() => { saveQuote(quote); requestApproval(quote.id); }} className="btn-primary h-10 rounded-lg px-4 text-[13px]">Request Approval</button>
              ) : null}
              {(quote.status === "Approved" || quote.status === "Sent") && (
                <button type="button" onClick={() => sendQuote(quote.id)} className="btn-primary h-10 rounded-lg px-4 text-[13px]">Send to Customer</button>
              )}
            </>
          )}
          {canApprove && quote.status === "Awaiting Approval" && (
            <Link to={`/app/quotes/${quote.id}/approval`} className="btn-primary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">Review Approval</Link>
          )}
          {quote.status === "Accepted" && (
            <>
              <Link to={`/app/bookings/new?quote=${quote.id}`} className="btn-primary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">Create Booking</Link>
              {isSales && (
                <button type="button" onClick={() => { const n = newQuoteVersion(quote.id); navigate(`/app/quotes/${n.id}`); }} className="btn-secondary h-10 rounded-lg px-3 text-[13px]">Create New Version</button>
              )}
            </>
          )}
        </div>
      </div>

      {rfq && (
        <p className="mt-3 text-[13px] text-mute">
          {rfq.origin} → {rfq.destination} · {rfq.cargo.commodity} · Valid until{" "}
          <input
            type="date"
            disabled={locked}
            value={quote.validUntil}
            onChange={(e) => patch({ validUntil: e.target.value })}
            className="ml-1 rounded border border-ink/10 bg-white px-2 py-0.5 text-[12px]"
          />
        </p>
      )}
      {validityWarn && <div className="mt-3"><Warn>2 selected rate components expire before this quotation.</Warn></div>}

      <div className="mt-5 space-y-5">
        {quote.options.map((opt) => {
          const t = optionTotals(opt);
          return (
            <Panel
              key={opt.id}
              title={`${opt.name} · ${opt.tag}`}
              sub={`${opt.mode} · ${opt.transitDays} days`}
              action={
                !locked && quote.options.length > 1 ? (
                  <button type="button" className="text-[12px] text-bad" onClick={() => patch({ options: quote.options.filter((o) => o.id !== opt.id) })}>Delete</button>
                ) : null
              }
            >
              <div className="mb-4 grid gap-3 sm:grid-cols-4">
                <Field label="Option name"><TextInput disabled={locked} value={opt.name} onChange={(e) => patchOpt(opt.id, { name: e.target.value })} /></Field>
                <Field label="Tag"><TextInput disabled={locked} value={opt.tag} onChange={(e) => patchOpt(opt.id, { tag: e.target.value })} /></Field>
                <Field label="Transit days"><TextInput disabled={locked} type="number" value={opt.transitDays} onChange={(e) => patchOpt(opt.id, { transitDays: Number(e.target.value) })} /></Field>
                <Field label="Mode"><TextInput disabled={locked} value={opt.mode} onChange={(e) => patchOpt(opt.id, { mode: e.target.value })} /></Field>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-[12.5px]">
                  <thead>
                    <tr className="border-y border-ink/6 text-[10.5px] uppercase tracking-[0.12em] text-mute-2">
                      {["Component", "Vendor", "Cost", "Margin type", "Margin", "Selling"].map((h) => (
                        <th key={h} className="px-2 py-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {opt.charges.map((c) => (
                      <tr key={c.id} className="border-b border-ink/5">
                        <td className="px-2 py-2">{c.group}</td>
                        <td className="px-2 py-2 text-mute">{c.vendor}</td>
                        <td className="px-2 py-2">{inr(c.cost)}</td>
                        <td className="px-2 py-2">
                          <select disabled={locked} value={c.marginType} onChange={(e) => patchCharge(opt.id, c.id, { marginType: e.target.value as "pct" | "fixed" })} className="rounded border border-ink/10 bg-white px-1 py-1 text-[12px]">
                            <option value="pct">%</option>
                            <option value="fixed">Fixed</option>
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input disabled={locked} type="number" value={c.margin} onChange={(e) => patchCharge(opt.id, c.id, { margin: Number(e.target.value) })} className="w-20 rounded border border-ink/10 px-2 py-1" />
                        </td>
                        <td className="px-2 py-2 font-medium">{inr(sellingOf(c))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!locked && (
                <button
                  type="button"
                  onClick={() =>
                    patchOpt(opt.id, {
                      charges: [
                        ...opt.charges,
                        { id: "qc-" + Math.random().toString(36).slice(2, 6), group: "Other", vendor: "—", cost: 0, marginType: "pct", margin: 10, currency: "INR" },
                      ],
                    })
                  }
                  className="mt-3 text-[12.5px] font-medium text-accent"
                >
                  + Add charge
                </button>
              )}
              <div className="mt-4"><CommercialBox opt={opt} /></div>
              <p className="mt-2 text-[11.5px] text-mute-2">Supplier cost {inr(t.cost)} · Markup {inr(t.profit)} · Selling {inr(t.selling)}</p>
            </Panel>
          );
        })}
        {!locked && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => patch({ options: [...quote.options, blankOption(`Option ${String.fromCharCode(65 + quote.options.length)}`, "CUSTOM")] })}
              className="btn-secondary inline-flex h-9 items-center gap-1 rounded-lg px-3 text-[12.5px]"
            >
              <Plus size={13} /> Add Option
            </button>
            {quote.options[0] && (
              <button
                type="button"
                onClick={() => {
                  const src = quote.options[0];
                  patch({ options: [...quote.options, { ...src, id: "opt-" + Math.random().toString(36).slice(2, 5), name: src.name + " copy" }] });
                }}
                className="btn-secondary h-9 rounded-lg px-3 text-[12.5px]"
              >
                Duplicate Option
              </button>
            )}
          </div>
        )}
      </div>

      <Panel title="Option comparison" className="mt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {quote.options.map((o) => {
            const t = optionTotals(o);
            return (
              <div key={o.id} className="rounded-xl border border-ink/8 p-4">
                <p className="text-[10.5px] font-semibold tracking-[0.14em] text-cyan">{o.tag}</p>
                <p className="mt-1 text-[16px] font-medium">{inr(t.selling)}</p>
                <p className="text-[12px] text-mute">{o.transitDays} days · {t.margin.toFixed(1)}% margin</p>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Version history" className="mt-4">
        <ul className="space-y-2 text-[13px]">
          {quote.versions.map((v) => (
            <li key={v.version} className="flex justify-between">
              <span>V{v.version} · {v.by}</span>
              <span className="text-mute-2">{v.created} · {v.status}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function blankOption(name: string, tag: string): QuoteOption {
  return {
    id: "opt-" + Math.random().toString(36).slice(2, 6),
    name,
    tag,
    mode: "Ocean",
    transitDays: 14,
    charges: CHARGE_GROUPS.slice(0, 4).map((g) => ({
      id: "qc-" + Math.random().toString(36).slice(2, 6),
      group: g,
      vendor: "—",
      cost: 0,
      marginType: "pct" as const,
      margin: 12,
      currency: "INR",
    })),
  };
}

/* ---------------- Approval ---------------- */

export function QuoteApprovalPage() {
  const { quoteId } = useParams();
  const { quoteById, customerById, rfqById, approveQuote, rejectQuote, requestChanges } = useCommercial();
  const { session } = useApp();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [mode, setMode] = useState<"reject" | "changes" | null>(null);
  const q = quoteById(quoteId ?? "");
  if (!q) return <div className="p-6">Quote not found.</div>;
  const c = customerById(q.customerId);
  const rfq = rfqById(q.rfqId);
  const allowed = session?.role === "management" || session?.role === "admin";

  return (
    <div className="p-4 sm:p-6">
      <PageHead title="Quote Approval" sub={`${q.id} V${q.version} · ${c?.company}`} />
      <InheritedBanner>Internal commercial review — supplier cost is visible here only.</InheritedBanner>
      {rfq && <p className="text-[13px] text-mute">{rfq.origin} → {rfq.destination} · expires {q.validUntil}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {q.options.map((o) => {
          const t = optionTotals(o);
          return (
            <div key={o.id} className="rounded-xl border border-ink/8 bg-white p-4">
              <p className="text-[10.5px] tracking-[0.14em] text-cyan">{o.tag}</p>
              <p className="mt-1 text-[18px] font-medium">{inr(t.selling)}</p>
              <p className="text-[12px] text-mute">Cost {inr(t.cost)} · GP {inr(t.profit)} · {t.margin.toFixed(1)}%</p>
              <p className="mt-1 text-[12px] text-mute-2">{o.transitDays} days</p>
            </div>
          );
        })}
      </div>
      {!allowed && <p className="mt-4 text-[13px] text-mute">Only Management or Admin can approve this quotation.</p>}
      {allowed && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => { approveQuote(q.id); navigate(`/app/quotes/${q.id}`); }} className="btn-primary h-10 rounded-lg px-4 text-[13px]">Approve</button>
          <button type="button" onClick={() => setMode("changes")} className="btn-secondary h-10 rounded-lg px-4 text-[13px]">Request Changes</button>
          <button type="button" onClick={() => setMode("reject")} className="h-10 rounded-lg border border-bad/30 px-4 text-[13px] text-bad">Reject</button>
        </div>
      )}
      <Dialog open={mode !== null} title={mode === "reject" ? "Reject quotation" : "Request changes"} onClose={() => setMode(null)}>
        <Field label="Comment" required>
          <TextArea value={comment} onChange={(e) => setComment(e.target.value)} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary h-9 rounded-lg px-3 text-[13px]" onClick={() => setMode(null)}>Cancel</button>
          <button
            type="button"
            disabled={!comment.trim()}
            onClick={() => {
              if (mode === "reject") rejectQuote(q.id, comment.trim());
              else requestChanges(q.id, comment.trim());
              setMode(null);
              navigate(`/app/quotes/${q.id}`);
            }}
            className="btn-primary h-9 rounded-lg px-3 text-[13px] disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </Dialog>
    </div>
  );
}

/* ---------------- Customer preview ---------------- */

export function QuotePreviewPage() {
  const { quoteId } = useParams();
  const { quoteById, customerById, rfqById, acceptQuote, rejectByCustomer } = useCommercial();
  const { session } = useApp();
  const navigate = useNavigate();
  const q = quoteById(quoteId ?? "");
  const [pick, setPick] = useState<string | null>(q?.acceptedOptionId ?? q?.options[1]?.id ?? q?.options[0]?.id ?? null);
  const [confirm, setConfirm] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [comment, setComment] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);

  if (!q) return <div className="p-6">Quote not found.</div>;
  const c = customerById(q.customerId);
  const rfq = rfqById(q.rfqId);
  const expired = isExpired(q.validUntil) || q.status === "Expired";
  const selected = q.options.find((o) => o.id === pick);
  const isCustomer = session?.role === "customer";
  const canAct = isCustomer && (q.status === "Awaiting Customer" || q.status === "Sent") && !expired && !q.locked;

  return (
    <div className="min-h-full bg-paper p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-ink/8 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Logo />
            <div className="text-right text-[12px] text-mute">
              <p className="font-mono text-accent">{q.id}-V{q.version}</p>
              <p>{c?.company}</p>
              <p>Issued {q.created}</p>
              <p>Valid until {q.validUntil}</p>
            </div>
          </div>
          <h1 className="mt-6 text-[26px] font-medium tracking-tight text-mist">Quotation</h1>
          {rfq && (
            <p className="mt-2 text-[14px] text-mute">
              {rfq.cargo.commodity} · {rfq.origin} → {rfq.destination} · {SERVICE_COPY_SAFE(rfq.service)}
            </p>
          )}
          {expired && (
            <div className="mt-4">
              <Warn>
                <strong>QUOTE EXPIRED.</strong> Acceptance is disabled.{" "}
                <button type="button" className="font-medium text-accent" onClick={() => navigate("/app/rfqs/new")}>Request a new quote</button>
              </Warn>
            </div>
          )}
          {q.status === "Accepted" && (
            <div className="mt-4 rounded-lg border border-ok/25 bg-ok/8 px-3 py-2 text-[13px] text-mist">
              Accepted — Locked · {q.options.find((o) => o.id === q.acceptedOptionId)?.name}
            </div>
          )}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {q.options.map((o) => (
              <QuoteOptionCard
                key={o.id}
                opt={o}
                customerView
                selected={pick === o.id}
                onSelect={canAct ? () => setPick(o.id) : undefined}
              />
            ))}
          </div>
          <div className="mt-6">
            <button type="button" onClick={() => setTermsOpen((v) => !v)} className="text-[13px] font-medium text-accent">
              {termsOpen ? "Hide" : "Show"} terms
            </button>
            {termsOpen && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] text-mute">
                <li>Validity as stated. Rates subject to space and equipment.</li>
                <li>Payment terms inherit the customer commercial record.</li>
                <li>Exclusions: duties, destination taxes, storage beyond free time.</li>
                <li>Insurance included only where shown on the selected option.</li>
              </ul>
            )}
          </div>
          {canAct && (
            <div className="sticky bottom-3 mt-6 flex flex-wrap gap-2 rounded-xl border border-ink/8 bg-white/95 p-3 shadow-lg backdrop-blur">
              <button type="button" disabled={!pick} onClick={() => setConfirm(true)} className="btn-primary h-11 flex-1 rounded-lg text-[14px] disabled:opacity-50">Accept Option</button>
              <button type="button" onClick={() => setRejectOpen(true)} className="btn-secondary h-11 rounded-lg px-4 text-[13px]">Reject Quote</button>
              <button type="button" onClick={() => navigate(`/app/rfqs/${q.rfqId}`)} className="h-11 px-3 text-[13px] text-mute">Ask Question</button>
            </div>
          )}
        </div>
      </div>
      <Dialog open={confirm} title="Accept this option?" onClose={() => setConfirm(false)}>
        {selected && (
          <>
            <p className="text-[13px] text-mute">
              {selected.name} · {inr(optionTotals(selected).selling)} · {selected.transitDays} days · valid {q.validUntil}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn-secondary h-9 rounded-lg px-3 text-[13px]" onClick={() => setConfirm(false)}>Cancel</button>
              <button
                type="button"
                onClick={() => {
                  acceptQuote(q.id, selected.id);
                  setConfirm(false);
                }}
                className="btn-primary h-9 rounded-lg px-3 text-[13px]"
              >
                Accept Quote
              </button>
            </div>
          </>
        )}
      </Dialog>
      <Dialog open={rejectOpen} title="Reject quotation" onClose={() => setRejectOpen(false)}>
        <Field label="Reason">
          <SelectInput value={reason} onChange={(e) => setReason(e.target.value)}>
            {REJECT_REASONS.map((r) => <option key={r}>{r}</option>)}
          </SelectInput>
        </Field>
        <Field label="Comment" className="mt-3">
          <TextArea value={comment} onChange={(e) => setComment(e.target.value)} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary h-9 rounded-lg px-3 text-[13px]" onClick={() => setRejectOpen(false)}>Cancel</button>
          <button
            type="button"
            onClick={() => {
              rejectByCustomer(q.id, reason, comment);
              setRejectOpen(false);
            }}
            className="h-9 rounded-lg bg-bad px-3 text-[13px] text-white"
          >
            Reject
          </button>
        </div>
      </Dialog>
    </div>
  );
}

function SERVICE_COPY_SAFE(s: string) {
  return s;
}

export function CustomerQuotesPage() {
  const { quotes } = useCustomerScoped();
  const navigate = useNavigate();
  return (
    <div className="p-4 sm:p-6">
      <PageHead title="My Quotes" sub="Review, accept or reject quotations issued to you." />
      <Panel className="mt-5" bodyClass="p-0">
        {quotes.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-mute">No quotations yet.</p>
        ) : (
          quotes.map((q) => {
            const t = q.options[0] ? optionTotals(q.options[0]) : { selling: 0 };
            return (
              <button key={q.id} type="button" onClick={() => navigate(`/app/customer/quotes/${q.id}`)} className="flex w-full items-center justify-between border-b border-ink/5 px-4 py-3 text-left last:border-0 hover:bg-ink/3">
                <div>
                  <p className="font-mono text-[12px] text-accent">{q.id}</p>
                  <p className="text-[12px] text-mute">V{q.version} · {inr(t.selling)}</p>
                </div>
                <QuoteBadge status={q.status} />
              </button>
            );
          })
        )}
      </Panel>
    </div>
  );
}

function useCustomerScoped() {
  const { quotes, customers } = useCommercial();
  const { session } = useApp();
  const mine = customers.find((c) => c.company === "Apex Components Pvt Ltd");
  return {
    quotes: session?.role === "customer" ? quotes.filter((q) => q.customerId === mine?.id) : quotes,
    customers,
    sessionRole: session?.role,
  };
}

export function CustomerRfqsPage() {
  const { rfqs, customers } = useCommercial();
  const { session } = useApp();
  const mine = customers.find((c) => c.company === "Apex Components Pvt Ltd");
  const list = session?.role === "customer" ? rfqs.filter((r) => r.customerId === mine?.id) : rfqs;
  const navigate = useNavigate();
  return (
    <div className="p-4 sm:p-6">
      <PageHead
        title="My RFQs"
        sub="Enquiries you have placed with SPG CargoOS."
        actions={<Link to="/app/rfqs/new" className="btn-primary inline-flex h-10 items-center rounded-lg px-4 text-[13px]">New RFQ</Link>}
      />
      <Panel className="mt-5" bodyClass="p-0">
        {list.map((r) => (
          <button key={r.id} type="button" onClick={() => navigate(`/app/rfqs/${r.id}`)} className="flex w-full items-center justify-between border-b border-ink/5 px-4 py-3 text-left last:border-0 hover:bg-ink/3">
            <div>
              <p className="font-mono text-[12px] text-accent">{r.id}</p>
              <p className="text-[12px] text-mute">{r.origin} → {r.destination}</p>
            </div>
            <span className="text-[12px] text-mute">{r.status}</span>
          </button>
        ))}
      </Panel>
    </div>
  );
}
