import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  MapPin,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { Shipment } from "@/lib/mock";
import { StatusBadge } from "./primitives";
import { EmptyState } from "./primitives";

const PAGE = 8;

type SortKey = "id" | "eta" | "status";

export function ShipmentsTable({
  shipments,
  onClearFilters,
  onOpen,
}: {
  shipments: Shipment[];
  onClearFilters?: () => void;
  onOpen: (s: Shipment) => void;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("id");
  const [dir, setDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(0);
  const [menu, setMenu] = useState<string | null>(null);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = query
      ? shipments.filter(
          (s) =>
            s.id.toLowerCase().includes(query) ||
            s.customer.toLowerCase().includes(query) ||
            s.route.toLowerCase().includes(query),
        )
      : shipments;
    return [...filtered].sort((a, b) => {
      const av = String(a[sort]);
      const bv = String(b[sort]);
      return av.localeCompare(bv) * dir;
    });
  }, [shipments, q, sort, dir]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const pageRows = rows.slice(page * PAGE, page * PAGE + PAGE);

  function toggleSort(k: SortKey) {
    if (sort === k) setDir((d) => (d === 1 ? -1 : 1));
    else {
      setSort(k);
      setDir(-1);
    }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort === k ? (
      dir === 1 ? (
        <ChevronUp size={12} />
      ) : (
        <ChevronDown size={12} />
      )
    ) : null;

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No active shipments match these filters."
        desc="Try widening the mode, customer or status filters."
        onClear={onClearFilters}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3">
        <label className="relative block w-full max-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute-2" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search shipments..."
            className="h-9 w-full rounded-lg border border-ink/10 bg-white pl-8 pr-3 text-[13px] text-mist placeholder:text-mute-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
        </label>
        <span className="text-[11px] text-mute-2">
          {rows.length} of {shipments.length} shipments
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden flex-1 overflow-x-auto md:block">
        <table className="w-full min-w-[920px] text-left text-[12.5px]">
          <thead>
            <tr className="border-y border-ink/6 text-[10.5px] uppercase tracking-[0.12em] text-mute-2">
              <Th onClick={() => toggleSort("id")}>
                Shipment <SortIcon k="id" />
              </Th>
              <th className="px-3 py-2.5 font-semibold">Customer</th>
              <th className="px-3 py-2.5 font-semibold">Route</th>
              <th className="px-3 py-2.5 font-semibold">Mode</th>
              <Th onClick={() => toggleSort("status")}>
                Stage <SortIcon k="status" />
              </Th>
              <th className="px-3 py-2.5 font-semibold">Next Milestone</th>
              <Th onClick={() => toggleSort("eta")}>
                ETA <SortIcon k="eta" />
              </Th>
              <th className="px-3 py-2.5 font-semibold">Owner</th>
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {pageRows.map((s) => (
              <tr
                key={s.id}
                onClick={() => onOpen(s)}
                className="group cursor-pointer border-b border-ink/5 transition-colors hover:bg-accent/4"
              >
                <td className="px-4 py-3 font-mono text-[12px] font-medium text-accent">{s.id}</td>
                <td className="px-3 py-3 text-mist">{s.customer}</td>
                <td className="px-3 py-3 text-mute">{s.route}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex flex-wrap gap-1">
                    {s.modes.map((m, i) => (
                      <span
                        key={i}
                        className="rounded bg-ink/5 px-1.5 py-0.5 text-[10.5px] font-medium text-mist-2"
                      >
                        {m}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-3 py-3 text-mute">{s.nextMilestone}</td>
                <td className="px-3 py-3 font-medium text-mist">{s.eta}</td>
                <td className="px-3 py-3 text-mute">{s.owner}</td>
                <td className="relative px-3 py-3">
                  <button
                    type="button"
                    aria-label={`Actions for ${s.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenu(menu === s.id ? null : s.id);
                    }}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-md text-mute-2 transition hover:bg-ink/6 hover:text-mist",
                      menu === s.id && "bg-ink/6 text-mist",
                    )}
                  >
                    <MoreHorizontal size={15} />
                  </button>
                  {menu === s.id && (
                    <div
                      className="absolute right-3 top-11 z-20 w-44 overflow-hidden rounded-lg border border-ink/10 bg-white py-1 shadow-[0_16px_40px_-10px_rgba(13,33,56,0.3)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[
                        { label: "View Shipment", icon: <MapPin size={13} /> },
                        { label: "Open Tracking", icon: <MapPin size={13} /> },
                        { label: "View Documents", icon: <FileText size={13} /> },
                      ].map((a) => (
                        <button
                          key={a.label}
                          type="button"
                          onClick={() => {
                            setMenu(null);
                            onOpen(s);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-mist transition hover:bg-ink/4"
                        >
                          {a.icon}
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 px-4 pb-4 md:hidden">
        {pageRows.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onOpen(s)}
            className="w-full rounded-xl border border-ink/8 bg-white p-3 text-left transition hover:border-accent/30"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] font-medium text-accent">{s.id}</span>
              <StatusBadge status={s.status} />
            </div>
            <p className="mt-2 text-[13px] font-medium text-mist">{s.route}</p>
            <p className="mt-0.5 text-[11.5px] text-mute">{s.customer}</p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-mute-2">
              <span>Next · {s.nextMilestone}</span>
              <span className="font-medium text-mist">ETA {s.eta}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-ink/6 px-4 py-2.5">
        <span className="text-[11px] text-mute-2">
          Page {page + 1} of {pages}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink/10 text-mute transition hover:text-mist disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink/10 text-mute transition hover:text-mist disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Th({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <th className="px-3 py-2.5 font-semibold">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 uppercase tracking-[0.12em] transition hover:text-mist"
      >
        {children}
      </button>
    </th>
  );
}
