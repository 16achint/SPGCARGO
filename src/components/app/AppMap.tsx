import { useState } from "react";
import worldMap from "@/assets/images/world-map.jpg";
import { MAP, NODES, arcPath, project, routePath } from "@/lib/geo";
import { SHIPMENTS, type Mode } from "@/lib/mock";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/utils/cn";

function statusColor(s: string) {
  if (s === "Exception") return "#EF6461";
  if (s === "In Transit" || s === "Transshipment") return "#4CC9F0";
  if (s === "Completed") return "rgba(148,175,204,0.35)";
  return "#287FFF";
}

export default function AppMap({
  modeFilter = [],
  onOpen,
  className,
}: {
  modeFilter?: string[];
  onOpen: (id: string) => void;
  className?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();

  const visible = SHIPMENTS.filter(
    (s) => modeFilter.length === 0 || modeFilter.some((m) => s.modes.includes(m as Mode)),
  );

  const hoverShipment = visible.find((s) => s.id === hover);

  return (
    <div className={cn("relative h-full min-h-[340px] w-full overflow-hidden rounded-xl bg-[#050B12]", className)}>
      <img
        src={worldMap}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        style={{ filter: "saturate(0.5) brightness(0.68) contrast(1.08)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050B12] via-transparent to-[#050B12]/40" />

      <svg
        viewBox={`0 0 ${MAP.w} ${MAP.h}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Active shipment movement map"
      >
        {visible.map((s) => {
          const d = routePath(s.nodeIds);
          if (!d) return null;
          const isHover = hover === s.id;
          const dimOthers = hover != null && !isHover;
          return (
            <g key={s.id}>
              <path
                d={d}
                fill="none"
                stroke={statusColor(s.status)}
                strokeWidth={isHover ? 2.4 : 1.2}
                strokeOpacity={dimOthers ? 0.15 : isHover ? 1 : 0.55}
                className="transition-all duration-200"
              />
              {isHover && (
                <path
                  d={d}
                  fill="none"
                  stroke={statusColor(s.status)}
                  strokeWidth="1"
                  strokeDasharray="4 10"
                  className="anim-dash"
                />
              )}
              {/* Wide invisible hit area */}
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth="14"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onOpen(s.id)}
              />
              {!reduced && s.status === "In Transit" && (
                <circle r="2.6" fill="#64D8F4">
                  <animateMotion dur="16s" repeatCount="indefinite">
                    <mpath path={d} />
                  </animateMotion>
                </circle>
              )}
            </g>
          );
        })}

        {NODES.map((n) => {
          const p = project(n.lat, n.lng);
          const isExceptionNode = n.id === "hamburg";
          return (
            <g key={n.id} transform={`translate(${p.x} ${p.y})`}>
              <circle r={isExceptionNode ? 4 : 2.4} fill={isExceptionNode ? "#EF6461" : "#8B9BAD"} fillOpacity={isExceptionNode ? 0.9 : 0.5} />
              <circle r={isExceptionNode ? 8 : 0} fill="none" stroke="#EF6461" strokeOpacity="0.4" className="node-ring" />
            </g>
          );
        })}
      </svg>

      {/* Preview chip */}
      <div
        className={cn(
          "pointer-events-none absolute right-3 top-3 w-[220px] rounded-xl bg-white p-3 opacity-0 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)] transition-all duration-200",
          hoverShipment && "opacity-100",
        )}
      >
        {hoverShipment && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-medium text-accent">
                {hoverShipment.id}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[9.5px] font-medium"
                style={{
                  background:
                    hoverShipment.status === "Exception" ? "#FDF0EF" : "#EEF6FD",
                  color: hoverShipment.status === "Exception" ? "#D14340" : "#1C6FE8",
                }}
              >
                {hoverShipment.status}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] font-medium text-[#10263D]">
              {hoverShipment.route}
            </p>
            <p className="mt-0.5 text-[10.5px] text-[#5C7086]">{hoverShipment.customer}</p>
            <div className="mt-1.5 flex gap-1">
              {hoverShipment.modes.map((m, i) => (
                <span key={i} className="rounded bg-[#0D2138]/6 px-1.5 py-0.5 text-[9.5px] font-medium text-[#2C4258]">
                  {m}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 rounded-lg bg-[#07111D]/80 px-3 py-2 text-[10px] text-[#9FB0C4] backdrop-blur-sm">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4CC9F0]" /> In transit
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#287FFF]" /> Scheduled
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#EF6461]" /> Exception
        </span>
      </div>
    </div>
  );
}

export { arcPath };
