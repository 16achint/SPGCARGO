import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FileText,
  Inbox,
  Package,
  Plus,
  Radar,
  Search,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useApp } from "@/state/AppContext";
import { useCommercial } from "@/state/CommercialContext";
import { useExecution } from "@/state/ExecutionContext";
import {
  DOCUMENTS,
  INVOICES,
  VENDORS,
} from "@/lib/mock";
import { Kbd } from "./shared/primitives";

interface Cmd {
  id: string;
  kind: string;
  primary: string;
  secondary: string;
  icon: React.ElementType;
  run: () => void;
}

const NAV_CMDS: { id: string; label: string; to: string }[] = [
  { id: "nav-overview", label: "Go to Overview", to: "/app/overview" },
  { id: "nav-shipments", label: "Go to Shipments", to: "/app/shipments" },
  { id: "nav-control-tower", label: "Go to Control Tower", to: "/app/control-tower" },
  { id: "nav-documents", label: "Go to Documents", to: "/app/documents" },
  { id: "nav-quotes", label: "Go to Quotations", to: "/app/quotes" },
  { id: "nav-rfqs", label: "Go to RFQs", to: "/app/rfqs" },
  { id: "nav-customers", label: "Go to Customers", to: "/app/customers" },
  { id: "nav-bookings", label: "Go to Bookings", to: "/app/bookings" },
  { id: "nav-rates", label: "Go to Rates", to: "/app/rates" },
  { id: "nav-vendors", label: "Go to Vendors", to: "/app/vendors" },
  { id: "nav-finance", label: "Go to Finance", to: "/app/finance" },
  { id: "nav-reports", label: "Go to Reports", to: "/app/reports" },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { pushToast } = useApp();
  const commercial = useCommercial();
  const execution = useExecution();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const recents: Cmd[] = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("spg.recent");
      if (!raw) return [];
      const ids = JSON.parse(raw) as { kind: string; id: string }[];
      return ids
        .map((r) => findRecord(r.kind, r.id))
        .filter(Boolean)
        .slice(0, 4) as Cmd[];
    } catch {
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const all = useMemo<Cmd[]>(() => {
    const nav = NAV_CMDS.map<Cmd>((n) => ({
      id: n.id,
      kind: "Navigation",
      primary: n.label,
      secondary: n.to,
      icon: Radar,
      run: () => navigate(n.to),
    }));
    const ships = execution.shipments.map<Cmd>((s) => {
      const refs = s.legs.flatMap((l) => Object.values(l.tracking)).join(" ");
      return {
        id: s.id,
        kind: "Shipment",
        primary: s.id,
        secondary: `${s.origin.split(",")[0]} → ${s.destination.split(",")[0]} · ${s.customer}${refs ? ` · ${refs}` : ""}`,
        icon: Package,
        run: () => navigate(`/app/shipments/${s.id}`),
      };
    });
    const rfqs = commercial.rfqs.map<Cmd>((r) => ({
      id: r.id,
      kind: "RFQ",
      primary: r.id,
      secondary: `${r.origin} → ${r.destination}`,
      icon: Inbox,
      run: () => navigate(`/app/rfqs/${r.id}`),
    }));
    const quotes = commercial.quotes.map<Cmd>((r) => ({
      id: r.id,
      kind: "Quote",
      primary: r.id,
      secondary: `${r.rfqId} · V${r.version}`,
      icon: FileText,
      run: () => navigate(`/app/quotes/${r.id}`),
    }));
    const customers = commercial.customers.map<Cmd>((c) => ({
      id: c.id,
      kind: "Customer",
      primary: c.company,
      secondary: `${c.id} · ${c.city}`,
      icon: Users,
      run: () => navigate(`/app/customers/${c.id}`),
    }));
    const bookings = commercial.bookings.map<Cmd>((b) => ({
      id: b.id,
      kind: "Booking",
      primary: b.id,
      secondary: b.quoteId,
      icon: FileText,
      run: () => navigate(`/app/bookings/${b.id}`),
    }));
    const vendors = VENDORS.map<Cmd>((v) => ({
      id: v,
      kind: "Vendor",
      primary: v,
      secondary: "Vendor record",
      icon: Users,
      run: () => navigate("/app/vendors"),
    }));
    const docs = DOCUMENTS.slice(0, 12).map<Cmd>((d) => ({
      id: d.id,
      kind: "Document",
      primary: d.name,
      secondary: `${d.shipment} · ${d.state}`,
      icon: FileText,
      run: () => navigate("/app/documents"),
    }));
    const invoices = INVOICES.map<Cmd>((i) => ({
      id: i.id,
      kind: "Invoice",
      primary: i.id,
      secondary: `${i.customer} · ${i.amount}`,
      icon: Wallet,
      run: () => navigate("/app/finance"),
    }));
    return [...nav, ...ships, ...rfqs, ...quotes, ...customers, ...bookings, ...vendors, ...docs, ...invoices];
  }, [navigate, commercial, execution.shipments]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return all
      .filter(
        (c) =>
          c.primary.toLowerCase().includes(query) ||
          c.secondary.toLowerCase().includes(query) ||
          c.kind.toLowerCase().includes(query),
      )
      .slice(0, 12);
  }, [all, q]);

  const shown: Cmd[] = useMemo(() => {
    if (q.trim()) return results;
    const liveRecents: Cmd[] = recents.map((r) => ({
      ...r,
      run: () => navigate(r.kind === "Shipment" ? "/app/shipments" : "/app"),
    }));
    const quick: Cmd[] = [
      {
        id: "qc-rfq",
        kind: "Quick Actions",
        primary: "New RFQ",
        secondary: "Create a rate enquiry",
        icon: Plus,
        run: () => pushToast("info", "New RFQ", "Full workflow ships in the next phase."),
      },
      {
        id: "qc-quote",
        kind: "Quick Actions",
        primary: "New Quote",
        secondary: "Create a quotation",
        icon: Plus,
        run: () => pushToast("info", "New Quote", "Full workflow ships in the next phase."),
      },
    ];
    return [...quick, ...liveRecents, ...all.filter((c) => c.kind === "Navigation").slice(0, 6)];
  }, [q, results, recents, all, pushToast, navigate]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setIdx(0), [q]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${idx}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [idx]);

  function run(cmd: Cmd) {
    const recent = [{ kind: cmd.kind, id: cmd.id }, ...sessionReadRecent()].slice(0, 5);
    sessionStorage.setItem("spg.recent", JSON.stringify(recent));
    cmd.run();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_40px_100px_-20px_rgba(5,11,18,0.5)]"
            initial={reduced ? false : { y: -12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={reduced ? undefined : { y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-ink/8 px-4">
              <Search size={16} className="text-mute-2" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setIdx((i) => Math.min(i + 1, shown.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setIdx((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter" && shown[idx]) {
                    run(shown[idx]);
                  } else if (e.key === "Escape") {
                    onClose();
                  }
                }}
                placeholder="Search shipments, RFQs, customers, documents..."
                className="h-12 flex-1 bg-transparent text-[14px] text-mist placeholder:text-mute-2 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-mute-2 transition hover:bg-ink/5 hover:text-mist"
              >
                <X size={15} />
              </button>
            </div>
            <div ref={listRef} className="max-h-[46vh] overflow-y-auto py-2">
              {shown.length === 0 && (
                <p className="px-4 py-8 text-center text-[13px] text-mute-2">
                  No results for “{q}”. Try a shipment ID like SPG-SHP-001284.
                </p>
              )}
              {shown.map((c, i) => {
                const prevKind = i > 0 ? shown[i - 1].kind : undefined;
                const header = c.kind !== prevKind;
                return (
                  <div key={`${c.kind}-${c.id}`}>
                    {header && (
                      <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mute-2">
                        {c.kind === "Shipment" ? "Shipments" : c.kind === "Quick Actions" ? "Quick Actions" : c.kind === "RFQ" ? "RFQs" : c.kind === "Quote" ? "Quotations" : c.kind === "Customer" ? "Customers" : c.kind === "Vendor" ? "Vendors" : c.kind === "Document" ? "Documents" : c.kind === "Invoice" ? "Invoices" : c.kind === "Navigation" ? "Navigation" : "Recent"}
                      </p>
                    )}
                    <button
                      type="button"
                      data-idx={i}
                      onMouseEnter={() => setIdx(i)}
                      onClick={() => run(c)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition",
                        i === idx ? "bg-accent/8" : "hover:bg-ink/3",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          i === idx ? "bg-accent/15 text-accent" : "bg-ink/5 text-mute-2",
                        )}
                      >
                        <c.icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-[13px]", i === idx ? "font-medium text-mist" : "text-mist")}>
                          {c.primary}
                        </span>
                        <span className="block truncate text-[11px] text-mute-2">{c.secondary}</span>
                      </span>
                      {i === idx && <Kbd>↵</Kbd>}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 border-t border-ink/8 bg-paper px-4 py-2 text-[10.5px] text-mute-2">
              <span className="inline-flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
              <span className="inline-flex items-center gap-1"><Kbd>↵</Kbd> open</span>
              <span className="inline-flex items-center gap-1"><Kbd>esc</Kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function findRecord(kind: string, id: string): Cmd | null {
  if (kind === "Shipment" && id.startsWith("SPG-SHP-")) {
    return { id, kind, primary: id, secondary: "Recent shipment", icon: Package, run: () => undefined };
  }
  return null;
}

function sessionReadRecent(): { kind: string; id: string }[] {
  try {
    const raw = sessionStorage.getItem("spg.recent");
    return raw ? (JSON.parse(raw) as { kind: string; id: string }[]) : [];
  } catch {
    return [];
  }
}
