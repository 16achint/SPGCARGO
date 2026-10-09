import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  FileWarning,
  Files,
  Inbox,
  Package,
  RefreshCw,
  Ship,
  Stamp,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useApp } from "@/state/AppContext";
import {
  BRANCHES,
  CUSTOMERS,
  DOCUMENTS,
  INVOICES,
  QUOTES,
  RFQS,
  SHIPMENTS,
  type Role,
  type Shipment,
  type ShipmentStatus,
} from "@/lib/mock";
import {
  KpiCard,
  Panel,
  Skel,
  DashboardSkeleton,
  ErrorState,
  StackBar,
} from "@/components/app/shared/primitives";
import { FilterBarShell, FilterSelect, ClearFilters, opts } from "@/components/app/shared/Filters";
import { ShipmentsTable } from "@/components/app/shared/ShipmentsTable";
import {
  NeedsAttentionPanel,
  MilestonesPanel,
  ActivityPanel,
  ModeMixPanel,
  DocHealthPanel,
  CustomsPanel,
} from "@/components/app/panels";
import { NetworkPulse } from "@/components/app/NetworkPulse";
import { ShipmentHealthChart } from "@/components/app/ShipmentHealthChart";

const AppMap = lazy(() => import("@/components/app/AppMap"));

const ALL_STATUSES: ShipmentStatus[] = [
  "Confirmed",
  "Documentation",
  "Pickup",
  "Customs",
  "Gate-in",
  "In Transit",
  "Transshipment",
  "Destination",
  "Delivery",
  "Completed",
  "Exception",
];

type Filters = {
  date: string[];
  branch: string[];
  mode: string[];
  customer: string[];
  status: string[];
};

const EMPTY_FILTERS: Filters = { date: [], branch: [], mode: [], customer: [], status: [] };

export default function OverviewPage() {
  const { session, user, pushToast } = useApp();
  const role: Role = session?.role ?? "operations";
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [seed, setSeed] = useState(0);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    setPhase("loading");
    const fail = new URLSearchParams(window.location.search).get("error") === "1";
    const t = window.setTimeout(
      () => setPhase(fail ? "error" : "ready"),
      role === "operations" ? 750 : 550,
    );
    return () => window.clearTimeout(t);
  }, [seed, role]);

  const filtered = useMemo(
    () =>
      SHIPMENTS.filter(
        (s) =>
          (filters.mode.length === 0 ||
            filters.mode.some((m) => s.modes.includes(m as Shipment["modes"][number]))) &&
          (filters.customer.length === 0 || filters.customer.includes(s.customer)) &&
          (filters.status.length === 0 || filters.status.includes(s.status)) &&
          (filters.branch.length === 0 || filters.branch.includes(s.branch)),
      ),
    [filters],
  );

  const hasFilters =
    filters.branch.length + filters.mode.length + filters.customer.length + filters.status.length > 0;

  function openShipment(s: Shipment | string) {
    const id = typeof s === "string" ? s : s.id;
    pushToast("info", id, "Full shipment 360 opens in the Execution phase.");
    navigate("/app/shipments");
  }

  function retry() {
    navigate(window.location.pathname, { replace: true });
    setSeed((x) => x + 1);
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const kpis = useMemo(() => buildKpis(role, filtered), [role, filtered]);

  if (phase === "loading") return <DashboardSkeleton />;
  if (phase === "error") return <ErrorState onRetry={retry} />;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] text-mute">
            {greeting}, {user.name.split(" ")[0]} · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-[24px] font-medium tracking-tight text-mist sm:text-[28px]">
            {role === "sales"
              ? "Sales Overview"
              : role === "finance"
                ? "Finance Overview"
                : role === "documentation"
                  ? "Documentation Overview"
                  : role === "admin"
                    ? "Administration Overview"
                    : "Operations Overview"}
          </h1>
          <p className="mt-1 text-[13px] text-mute">
            {role === "operations"
              ? "Monitor active shipments, milestones and exceptions across your network."
              : role === "sales"
                ? "Track enquiries, RFQs, quotes and follow-ups across your book of business."
                : role === "finance"
                  ? "Receivables, payables and profitability across active jobs."
                  : role === "documentation"
                    ? "Document pipeline, filings and verification status."
                    : "Platform health, usage and module status."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect
            label="Last 7 days"
            icon={<CalendarDays size={13} />}
            options={opts(["Today", "Last 7 days", "Last 30 days"])}
            value={filters.date}
            onChange={(v) => setFilters((f) => ({ ...f, date: v }))}
            multiple={false}
          />
          <FilterSelect
            label="Branch"
            options={opts(BRANCHES)}
            value={filters.branch}
            onChange={(v) => setFilters((f) => ({ ...f, branch: v }))}
          />
          <button
            type="button"
            aria-label="Refresh"
            onClick={() => {
              setSpinning(true);
              setSeed((x) => x + 1);
              window.setTimeout(() => setSpinning(false), 900);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 bg-white text-mute transition hover:text-mist"
          >
            <RefreshCw size={14} className={cn(spinning && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4">
        <FilterBarShell>
          <FilterSelect label="Mode" options={opts(["Road", "Sea", "Air", "Rail"])} value={filters.mode} onChange={(v) => setFilters((f) => ({ ...f, mode: v }))} />
          <FilterSelect label="Customer" options={opts(CUSTOMERS)} value={filters.customer} onChange={(v) => setFilters((f) => ({ ...f, customer: v }))} />
          <FilterSelect label="Status" options={opts(ALL_STATUSES)} value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} />
          {hasFilters && <ClearFilters onClear={() => setFilters(EMPTY_FILTERS)} />}
        </FilterBarShell>
      </div>

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} icon={<k.icon size={15} strokeWidth={1.7} />} />
        ))}
      </div>

      {/* Role-specific body */}
      {role === "operations" && (
        <>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Panel
              title="Shipment Network"
              sub="Live movement across active lanes"
              className="xl:col-span-2"
              bodyClass="p-3"
            >
              <div className="space-y-3">
                <Suspense fallback={<Skel className="h-[240px] w-full" />}>
                  <AppMap className="h-[240px] min-h-0" modeFilter={filters.mode} onOpen={openShipment} />
                </Suspense>
                <NetworkPulse shipments={filtered} />
                <ShipmentHealthChart shipments={filtered} />
              </div>
            </Panel>
            <NeedsAttentionPanel onOpen={openShipment} />
          </div>

          <Panel
            title="Active Shipments"
            sub="All lanes · sorted by recency"
            className="mt-4"
            bodyClass="p-0"
          >
            <ShipmentsTable
              shipments={filtered}
              onClearFilters={() => setFilters(EMPTY_FILTERS)}
              onOpen={openShipment}
            />
          </Panel>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <MilestonesPanel />
            <ModeMixPanel />
            <ActivityPanel />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DocHealthPanel />
            <CustomsPanel />
          </div>
        </>
      )}

      {role === "sales" && (
        <>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Panel title="Open RFQs" sub="Newest first" className="xl:col-span-2" bodyClass="p-0">
              <MiniTable
                rows={RFQS.slice(0, 6)}
                cols={[
                  { key: "id", label: "RFQ", mono: true },
                  { key: "customer", label: "Customer" },
                  { key: "lane", label: "Lane" },
                  { key: "mode", label: "Mode" },
                  { key: "status", label: "Status" },
                  { key: "age", label: "Age", align: "right" },
                ]}
              />
            </Panel>
            <QuotesPanel />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ActivityPanel />
            <Panel title="Follow-ups Due" sub="Next 5 days">
              <ul className="space-y-2.5">
                {QUOTES.filter((q) => q.status === "Awaiting Customer" || q.status === "Expiring").map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink/6 bg-paper/60 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-medium text-mist">{q.customer}</p>
                      <p className="font-mono text-[10.5px] text-accent">{q.id} · {q.lane}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-warn/10 px-2 py-0.5 text-[10.5px] font-medium text-warn">
                      {q.status === "Expiring" ? `Expires ${q.valid}` : "Chase"}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </>
      )}

      {role === "finance" && (
        <>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Panel title="Customer Invoices" sub="Current cycle" className="xl:col-span-2" bodyClass="p-0">
              <MiniTable
                rows={INVOICES.slice(0, 7)}
                cols={[
                  { key: "id", label: "Invoice", mono: true },
                  { key: "customer", label: "Customer" },
                  { key: "amount", label: "Amount" },
                  { key: "due", label: "Due" },
                  { key: "status", label: "Status" },
                ]}
              />
            </Panel>
            <Panel title="Cost Preview" sub="Rolling 30 days">
              <div className="space-y-4">
                <CostRow label="Expected cost" value={341} max={420} cls="bg-cyan-2" />
                <CostRow label="Actual cost" value={318} max={420} cls="bg-accent" />
                <CostRow label="Revenue" value={420} max={420} cls="bg-ok" />
              </div>
              <StackBar
                className="mt-5 border-t border-ink/6 pt-4"
                parts={[
                  { label: "Within budget", value: 71, cls: "bg-ok" },
                  { label: "Over budget", value: 19, cls: "bg-warn" },
                  { label: "Unallocated", value: 10, cls: "bg-ink/15" },
                ]}
              />
            </Panel>
          </div>
          <div className="mt-4">
            <ActivityPanel />
          </div>
        </>
      )}

      {role === "documentation" && (
        <>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Panel title="Document Queue" sub="Oldest pending first" className="xl:col-span-2" bodyClass="p-0">
              <MiniTable
                rows={DOCUMENTS.filter((d) => d.state !== "Verified").slice(0, 7)}
                cols={[
                  { key: "id", label: "Doc", mono: true },
                  { key: "name", label: "Document" },
                  { key: "shipment", label: "Shipment", mono: true },
                  { key: "state", label: "State" },
                ]}
              />
            </Panel>
            <div className="space-y-4">
              <DocHealthPanel />
              <CustomsPanel />
            </div>
          </div>
          <div className="mt-4">
            <ActivityPanel />
          </div>
        </>
      )}

      {role === "admin" && (
        <>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Panel title="Module Status" sub="Deployment phases" className="xl:col-span-2" bodyClass="p-3">
              <ul className="grid gap-2 sm:grid-cols-2">
                {MODULES.map((m) => (
                  <li key={m.name} className="flex items-center justify-between rounded-lg border border-ink/6 bg-paper/60 px-3 py-2.5">
                    <span className="text-[12.5px] font-medium text-mist">{m.name}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", m.live ? "bg-ok/10 text-ok" : "bg-ink/6 text-mute-2")}>
                      {m.live ? "Live" : m.phase}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
            <ActivityPanel />
          </div>
        </>
      )}
    </div>
  );
}

const MODULES = [
  { name: "Overview", live: true },
  { name: "Shipments", live: false, phase: "Execution" },
  { name: "Control Tower", live: false, phase: "Execution" },
  { name: "Documents", live: false, phase: "Docs" },
  { name: "Customs", live: false, phase: "Docs" },
  { name: "RFQs & Quotes", live: false, phase: "Commercial" },
  { name: "Finance", live: false, phase: "Finance" },
  { name: "Reports", live: false, phase: "Intelligence" },
];

type KpiDef = {
  label: string;
  value: number;
  sub?: string;
  trend?: "up" | "down";
  icon: React.ElementType;
  tone?: "default" | "warn" | "bad" | "ok";
  spark?: number[];
  suffix?: string;
  prefix?: string;
  decimals?: number;
};

function buildKpis(role: Role, filtered: Shipment[]): KpiDef[] {
  const inTransit = filtered.filter((s) => ["In Transit", "Transshipment"].includes(s.status)).length;
  const delayed = filtered.filter((s) => s.status === "Exception").length;
  const pickups = filtered.filter((s) => s.status === "Pickup").length;
  const docsPending = DOCUMENTS.filter((d) => d.state !== "Verified").length;

  if (role === "sales") {
    return [
      { label: "New Enquiries", value: RFQS.filter((r) => r.status === "New").length, sub: "Last 24 hours", icon: Inbox, trend: "up", spark: [2, 3, 2, 4, 3, 3, 3] },
      { label: "Open RFQs", value: RFQS.filter((r) => r.status !== "Closed").length, sub: "Across all lanes", icon: Files, spark: [8, 9, 11, 10, 12, 11, 9] },
      { label: "Quotes In Progress", value: QUOTES.filter((q) => q.status === "In Review" || q.status === "Draft").length, sub: "Being prepared", icon: FileWarning },
      { label: "Awaiting Customer", value: QUOTES.filter((q) => q.status === "Awaiting Customer").length, sub: "Need follow-up", tone: "warn", icon: Users },
      { label: "Expiring Quotes", value: QUOTES.filter((q) => q.status === "Expiring").length, sub: "Next 72 hours", tone: "warn", icon: AlertTriangle },
      { label: "Conversion", value: 61, suffix: "%", sub: "Enquiry → booking", icon: Ship, trend: "up", tone: "ok" },
    ];
  }

  if (role === "finance") {
    const due = INVOICES.filter((i) => i.status === "Due").length;
    const overdue = INVOICES.filter((i) => i.status === "Overdue").length;
    return [
      { label: "Customer Invoices", value: INVOICES.length, sub: "₹57.9L total", icon: Wallet },
      { label: "Due", value: due, sub: "This cycle", icon: CalendarDays, tone: "warn" },
      { label: "Overdue", value: overdue, sub: "₹14.5L outstanding", tone: "bad", icon: AlertTriangle },
      { label: "Vendor Bills", value: 5, sub: "₹41.2L payable", icon: Files },
      { label: "Gross Profit", value: 7.9, suffix: "L", prefix: "₹", decimals: 1, sub: "Current month", icon: Wallet, tone: "ok" },
      { label: "Gross Margin", value: 18.8, suffix: "%", decimals: 1, sub: "Target 18.0%", icon: Ship },
    ];
  }

  if (role === "documentation") {
    const missing = DOCUMENTS.filter((d) => d.state === "Missing").length;
    const pending = DOCUMENTS.filter((d) => d.state === "Pending Review").length;
    const verified = DOCUMENTS.filter((d) => d.state === "Verified").length;
    return [
      { label: "Pending Review", value: pending, sub: "In verification queue", icon: Files, tone: "warn" },
      { label: "Missing", value: missing, sub: "Blocking shipments", tone: "bad", icon: FileWarning },
      { label: "Verified", value: verified, sub: "This cycle", tone: "ok", icon: FileWarning },
      { label: "Customs Docs", value: 4, sub: "Open filings", icon: Stamp },
      { label: "PODs Due", value: 2, sub: "Vendor uploads", tone: "warn", icon: Truck },
      { label: "Avg Verification", value: 6.2, suffix: "h", decimals: 1, sub: "Last 30 days", icon: Files },
    ];
  }

  if (role === "admin") {
    return [
      { label: "Active Users", value: 34, sub: "Across 4 branches", icon: Users, trend: "up" },
      { label: "Branches", value: 4, sub: "2 international", icon: Users },
      { label: "Active Shipments", value: filtered.length, sub: "Live on network", icon: Package },
      { label: "Exceptions", value: delayed, sub: "Requires attention", tone: "bad", icon: AlertTriangle },
      { label: "Audit Events", value: 1284, sub: "Last 7 days", icon: Files },
      { label: "Uptime", value: 99.9, suffix: "%", decimals: 1, sub: "30-day average", tone: "ok", icon: Ship },
    ];
  }

  const pct = filtered.length ? Math.round((inTransit / filtered.length) * 100) : 0;
  return [
    { label: "Active Shipments", value: filtered.length, sub: "+8 this week", trend: "up", icon: Package, spark: [16, 17, 18, 17, 19, 19, 20] },
    { label: "In Transit", value: inTransit, sub: `${pct}% of active`, icon: Ship, spark: [10, 12, 11, 13, 12, 14, inTransit || 1] },
    { label: "Delayed", value: delayed, sub: "2 critical lanes", tone: "warn", icon: AlertTriangle },
    { label: "Exceptions", value: 7, sub: "Requires attention", tone: "bad", icon: AlertTriangle },
    { label: "Pickups Due", value: pickups, sub: "Next 24 hours", icon: Truck },
    { label: "Documents Pending", value: docsPending, sub: "3 blocking", tone: "warn", icon: FileWarning },
  ];
}

function QuotesPanel() {
  return (
    <Panel title="Quotes Awaiting Decision" sub="Customer action required" bodyClass="p-3">
      <ul className="space-y-2">
        {QUOTES.filter((q) => q.status === "Awaiting Customer" || q.status === "Expiring").map((q) => (
          <li key={q.id} className="rounded-lg border border-ink/6 bg-paper/60 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-accent">{q.id}</span>
              <span className="text-[11.5px] font-medium text-mist">{q.amount}</span>
            </div>
            <p className="mt-1 text-[12px] text-mist">{q.customer}</p>
            <p className="text-[10.5px] text-mute-2">{q.lane} · valid {q.valid}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function CostRow({ label, value, max, cls }: { label: string; value: number; max: number; cls: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[12px]">
        <span className="text-mute">{label}</span>
        <span className="font-medium text-mist">₹{value}L</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/6">
        <div className={cn("h-full rounded-full transition-all duration-700", cls)} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function MiniTable<T extends Record<string, string>>({
  rows,
  cols,
}: {
  rows: T[];
  cols: { key: keyof T; label: string; mono?: boolean; align?: "right" }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-[12.5px]">
        <thead>
          <tr className="border-y border-ink/6 text-[10.5px] uppercase tracking-[0.12em] text-mute-2">
            {cols.map((c) => (
              <th key={c.label} className={cn("px-4 py-2.5 font-semibold", c.align === "right" && "text-right")}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-ink/4 transition-colors last:border-0 hover:bg-accent/4">
              {cols.map((c) => (
                <td
                  key={String(c.key)}
                  className={cn(
                    "px-4 py-2.5",
                    c.mono && "font-mono text-[11.5px] text-accent",
                    c.align === "right" && "text-right",
                  )}
                >
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
