import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import {
  inr,
  optionTotals,
  SERVICE_COPY,
  type BookingStatus,
  type QuoteStatus,
  type Rfq,
  type RfqStatus,
  type Customer,
  type QuoteOption,
  MODE_COPY,
  type TimelineItem,
} from "@/lib/commercial";
import { EmptyState, Panel } from "@/components/app/shared/primitives";

/* ---------- Badges ---------- */

const RFQ_TONE: Record<RfqStatus, string> = {
  New: "bg-accent/10 text-accent",
  Qualified: "bg-cyan/10 text-cyan",
  "Rate Sourcing": "bg-cyan/10 text-cyan",
  "Quote Preparation": "bg-ink/8 text-mist",
  "Quote Sent": "bg-accent/10 text-accent",
  "Awaiting Customer": "bg-warn/10 text-warn",
  Won: "bg-ok/10 text-ok",
  Lost: "bg-ink/8 text-mute",
};

const QUOTE_TONE: Record<QuoteStatus, string> = {
  Draft: "bg-ink/8 text-mist",
  "Awaiting Approval": "bg-warn/10 text-warn",
  Approved: "bg-ok/10 text-ok",
  Rejected: "bg-bad/10 text-bad",
  "Changes Requested": "bg-warn/10 text-warn",
  Sent: "bg-accent/10 text-accent",
  "Awaiting Customer": "bg-warn/10 text-warn",
  Accepted: "bg-ok/10 text-ok",
  "Rejected by Customer": "bg-bad/10 text-bad",
  Expired: "bg-ink/8 text-mute",
};

const BOOK_TONE: Record<BookingStatus, string> = {
  "Pending Confirmation": "bg-warn/10 text-warn",
  Confirmed: "bg-ok/10 text-ok",
  "Ready for Operations": "bg-cyan/10 text-cyan",
  Cancelled: "bg-ink/8 text-mute",
};

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium", className)}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function RfqBadge({ status }: { status: RfqStatus }) {
  return <Pill className={RFQ_TONE[status]}>{status}</Pill>;
}
export function QuoteBadge({ status }: { status: QuoteStatus }) {
  return <Pill className={QUOTE_TONE[status]}>{status}</Pill>;
}
export function BookingBadge({ status }: { status: BookingStatus }) {
  return <Pill className={BOOK_TONE[status]}>{status}</Pill>;
}

export function Money({ value, className }: { value: number; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{inr(value)}</span>;
}

/* ---------- Page chrome ---------- */

export function PageHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[24px] font-medium tracking-tight text-mist sm:text-[26px]">{title}</h1>
        {sub && <p className="mt-1 text-[13px] text-mute">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function KpiStrip({ items }: { items: { label: string; value: string | number; tone?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
      {items.map((k) => (
        <div key={k.label} className="rounded-xl border border-ink/8 bg-white px-3 py-3 shadow-[0_6px_18px_-12px_rgba(13,33,56,0.2)]">
          <p className={cn("text-[20px] font-medium tracking-tight", k.tone ?? "text-mist")}>{k.value}</p>
          <p className="mt-0.5 text-[11px] text-mute">{k.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Stepper ---------- */

export function Stepper({
  steps,
  current,
  onJump,
}: {
  steps: string[];
  current: number;
  onJump?: (i: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-1 sm:gap-0">
      {steps.map((s, i) => {
        const done = i < current;
        const on = i === current;
        return (
          <li key={s} className="flex items-center">
            <button
              type="button"
              onClick={() => onJump?.(i)}
              className={cn(
                "flex items-center gap-2 rounded-full px-2 py-1 text-[12px] transition sm:px-3",
                on ? "bg-accent/10 font-medium text-accent" : done ? "text-mist" : "text-mute-2",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                  on ? "bg-accent text-white" : done ? "bg-ok text-white" : "bg-ink/8 text-mute",
                )}
              >
                {done ? <Check size={12} /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < steps.length - 1 && <span className="mx-1 hidden h-px w-6 bg-ink/10 sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}

export function StepFooter({
  onBack,
  onNext,
  nextLabel = "Continue",
  disabled,
  backHidden,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
  backHidden?: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-ink/8 bg-workspace/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {!backHidden ? (
        <button type="button" onClick={onBack} className="btn-secondary inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px]">
          <ChevronLeft size={14} />
          Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={onNext}
        className="btn-primary inline-flex h-10 items-center gap-1.5 rounded-lg px-5 text-[13px] disabled:opacity-50"
      >
        {nextLabel}
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

/* ---------- Field ---------- */

export function Field({
  label,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[12px] font-medium text-mist/80">
        {label}
        {required && <span className="ml-0.5 text-bad">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-[11.5px] text-bad">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[11.5px] text-mute-2">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputCls =
  "h-11 w-full rounded-lg border border-ink/12 bg-white px-3 text-[13.5px] text-mist placeholder:text-mute-2 transition focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const { error, className, ...rest } = props;
  return <input className={cn(inputCls, error && "border-bad focus:border-bad focus:ring-bad/10", className)} {...rest} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  const { error, className, children, ...rest } = props;
  return (
    <select className={cn(inputCls, error && "border-bad", className)} {...rest}>
      {children}
    </select>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      className={cn(inputCls, "h-auto min-h-[88px] py-2.5", className)}
      {...rest}
    />
  );
}

/* ---------- Dialog ---------- */

export function Dialog({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div role="dialog" aria-modal className="relative w-full max-w-md rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_30px_80px_-20px_rgba(5,11,18,0.45)]">
        <div className="mb-3 flex items-start justify-between">
          <h2 className="text-[16px] font-medium text-mist">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-mute-2 hover:bg-ink/5">
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  title,
  children,
  onClose,
  wide,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal
        className={cn(
          "absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-[-24px_0_60px_-20px_rgba(5,11,18,0.35)] sm:max-w-[440px]",
          wide && "sm:max-w-[560px]",
        )}
      >
        <header className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-mist">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-mute-2 hover:bg-ink/5">
            <X size={16} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

/* ---------- Summaries ---------- */

export function RouteLine({ origin, destination }: { origin: string; destination: string }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium text-mist">
      <span>{origin || "Origin"}</span>
      <span className="text-mute-2">→</span>
      <span>{destination || "Destination"}</span>
    </p>
  );
}

export function RfqSummary({ rfq, customer }: { rfq: Rfq; customer?: Customer }) {
  return (
    <div className="rounded-xl border border-ink/8 bg-paper/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mute-2">RFQ summary</p>
      <p className="mt-1 font-mono text-[12px] text-accent">{rfq.id}</p>
      <p className="mt-1 text-[14px] font-medium text-mist">{customer?.company}</p>
      <RouteLine origin={rfq.origin} destination={rfq.destination} />
      <p className="mt-2 text-[12px] text-mute">
        {rfq.mode} · {SERVICE_COPY[rfq.service].title} · {rfq.cargo.commodity}
      </p>
      <p className="mt-1 text-[11.5px] text-mute-2">
        {rfq.cargo.packages} {rfq.cargo.packageType.toLowerCase()}s · {rfq.cargo.weight.toLocaleString()} {rfq.cargo.weightUnit} · {rfq.cargo.volume} {rfq.cargo.volumeUnit}
      </p>
    </div>
  );
}

export function InheritedBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-[12px] text-mist">
      <Lock size={13} className="text-accent" />
      {children}
    </div>
  );
}

export function CommercialBox({ opt }: { opt: QuoteOption }) {
  const t = optionTotals(opt);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Expected cost" value={inr(t.cost)} />
      <Stat label="Selling price" value={inr(t.selling)} />
      <Stat label="Gross profit" value={inr(t.profit)} />
      <Stat label="Gross margin" value={`${t.margin.toFixed(1)}%`} accent />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-ink/8 bg-white px-3 py-2.5">
      <p className="text-[10.5px] text-mute-2">{label}</p>
      <p className={cn("mt-0.5 text-[15px] font-medium tabular-nums", accent ? "text-accent" : "text-mist")}>{value}</p>
    </div>
  );
}

export function ActivityTimeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-[12.5px] text-mute-2">No activity yet.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l border-ink/10 pl-5">
      {items.map((t) => (
        <li key={t.id} className="relative">
          <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-accent" />
          <p className="text-[12.5px] text-mist">{t.text}</p>
          <p className="mt-0.5 text-[11px] text-mute-2">
            {t.time} · {t.by}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function QuoteOptionCard({
  opt,
  selected,
  onSelect,
  customerView,
}: {
  opt: QuoteOption;
  selected?: boolean;
  onSelect?: () => void;
  customerView?: boolean;
}) {
  const t = optionTotals(opt);
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border p-5 transition",
        selected ? "border-accent bg-accent/5 shadow-[0_16px_40px_-18px_rgba(28,111,232,0.45)]" : "border-ink/10 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10.5px] font-semibold tracking-[0.16em] text-cyan">{opt.tag}</p>
          <h3 className="mt-1 text-[16px] font-medium text-mist">{opt.name}</h3>
          <p className="mt-0.5 text-[12px] text-mute">{opt.mode}</p>
        </div>
        <p className="text-right">
          <span className="block text-[22px] font-medium tracking-tight text-mist">{inr(t.selling)}</span>
          <span className="text-[12px] text-mute">{opt.transitDays} days</span>
        </p>
      </div>
      <ul className="mt-4 space-y-1 text-[12px] text-mute">
        {opt.charges.slice(0, 5).map((c) => (
          <li key={c.id} className="flex justify-between">
            <span>{c.group}</span>
            {customerView ? <span>{inr(c.marginType === "pct" ? c.cost * (1 + c.margin / 100) : c.cost + c.margin)}</span> : <span>{inr(c.cost)}</span>}
          </li>
        ))}
      </ul>
      {!customerView && (
        <p className="mt-3 text-[11.5px] text-mute-2">
          Cost {inr(t.cost)} · Margin {t.margin.toFixed(1)}%
        </p>
      )}
      {onSelect && (
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "mt-4 h-10 rounded-lg text-[13px] font-medium",
            selected ? "btn-primary" : "btn-secondary",
          )}
        >
          {selected ? "Selected" : "Select option"}
        </button>
      )}
    </article>
  );
}

export function EmptyCreate({
  title,
  desc,
  cta,
  to,
}: {
  title: string;
  desc: string;
  cta: string;
  to: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-[15px] font-medium text-mist">{title}</p>
      <p className="max-w-sm text-[13px] text-mute">{desc}</p>
      <Link to={to} className="btn-primary inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px]">
        <Plus size={14} />
        {cta}
      </Link>
    </div>
  );
}

export function Warn({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warn/25 bg-warn/8 px-3 py-2.5 text-[12.5px] text-mist">
      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warn" />
      <div>{children}</div>
    </div>
  );
}

export function ToggleYesNo({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  required?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-medium text-mist/80">
        {label}
        {required && <span className="ml-0.5 text-bad">*</span>}
      </p>
      <div className="inline-flex rounded-lg border border-ink/10 bg-white p-0.5">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "h-9 min-w-[72px] rounded-md px-3 text-[13px] font-medium transition",
              value === v ? (v ? "bg-accent text-white" : "bg-ink/80 text-white") : "text-mute hover:text-mist",
            )}
          >
            {v ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CardChoice<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; title: string; blurb: string }[];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-xl border p-4 text-left transition",
            value === o.id ? "border-accent bg-accent/5 ring-1 ring-accent/30" : "border-ink/10 bg-white hover:border-ink/20",
          )}
        >
          <p className="text-[14px] font-medium text-mist">{o.title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-mute">{o.blurb}</p>
        </button>
      ))}
    </div>
  );
}

export { Search, Panel, EmptyState, MODE_COPY, SERVICE_COPY };
