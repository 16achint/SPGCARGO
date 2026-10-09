import { useId, useMemo } from "react";
import worldMap from "@/assets/images/world-map.jpg";
import {
  AMBIENT_ROUTES,
  MAP,
  NODES,
  PRIMARY_ROUTE,
  arcPath,
  project,
  routePath,
} from "@/lib/geo";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/utils/cn";

type Intensity = "hero" | "login" | "tower";

type NetworkMapProps = {
  intensity?: Intensity;
  showLabels?: boolean;
  className?: string;
  highlightExceptions?: boolean;
};

export function NetworkMap({
  intensity = "hero",
  showLabels = true,
  className,
  highlightExceptions = false,
}: NetworkMapProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const reduced = usePrefersReducedMotion();

  const primary = useMemo(() => routePath(PRIMARY_ROUTE), []);
  const ambient = useMemo(
    () => AMBIENT_ROUTES.map((r) => routePath(r)),
    [],
  );

  const primaryPts = PRIMARY_ROUTE.map((id) => {
    const n = NODES.find((x) => x.id === id)!;
    return { ...n, ...project(n.lat, n.lng) };
  });

  const dim = intensity === "login" ? 0.9 : 1;
  const showAmbient = intensity !== "login";

  return (
    <div className={cn("relative h-full w-full", className)}>
      <img
        src={worldMap}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.46]"
        style={{ filter: "saturate(0.5) brightness(0.7) contrast(1.08)" }}
      />
      {intensity === "login" ? (
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/5 to-ink/25" />
      ) : intensity === "tower" ? (
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/40" />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/45" />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-60" />

      <svg
        viewBox={`0 0 ${MAP.w} ${MAP.h}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Global logistics network map"
        style={{ opacity: dim }}
      >
        <defs>
          <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`${uid}-route`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1C6FE8" stopOpacity="0.15" />
            <stop offset="40%" stopColor="#4CC9F0" />
            <stop offset="100%" stopColor="#287FFF" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {showAmbient &&
          ambient.map((d, i) => (
            <path
              key={`amb-${i}`}
              d={d}
              fill="none"
              stroke="rgba(76,201,240,0.16)"
              strokeWidth="1"
            />
          ))}

        {showAmbient &&
          ambient.map((d, i) => (
            <path
              key={`ambd-${i}`}
              d={d}
              fill="none"
              stroke="rgba(100,216,244,0.35)"
              strokeWidth="1"
              className="anim-dash"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}

        <path
          id={`${uid}-main`}
          d={primary}
          fill="none"
          stroke={`url(#${uid}-route)`}
          strokeWidth={intensity === "login" ? 1.6 : 2.2}
          filter={`url(#${uid}-glow)`}
        />
        <path
          d={primary}
          fill="none"
          stroke="#64D8F4"
          strokeWidth="1.2"
          strokeDasharray="5 12"
          className="anim-dash"
          opacity="0.85"
        />

        {NODES.map((n) => {
          const p = project(n.lat, n.lng);
          const isPrimary = PRIMARY_ROUTE.includes(n.id as (typeof PRIMARY_ROUTE)[number]);
          const isException =
            highlightExceptions && (n.id === "hamburg" || n.id === "santos");
          return (
            <g key={n.id} transform={`translate(${p.x} ${p.y})`}>
              {isPrimary && (
                <circle
                  r="10"
                  fill="none"
                  stroke={isException ? "#EF6461" : "#4CC9F0"}
                  strokeOpacity="0.45"
                  className="node-ring"
                />
              )}
              <circle
                r={isPrimary ? 3.4 : 2}
                fill={
                  isException ? "#EF6461" : isPrimary ? "#64D8F4" : "#8B9BAD"
                }
                className={isPrimary ? "anim-pulse-dot" : undefined}
              />
            </g>
          );
        })}

        {!reduced && (
          <>
            <circle r="3.6" fill="#F7FAFC" filter={`url(#${uid}-glow)`}>
              <animateMotion dur="18s" repeatCount="indefinite">
                <mpath href={`#${uid}-main`} />
              </animateMotion>
            </circle>
            <circle r="2.2" fill="#4CC9F0">
              <animateMotion dur="18s" begin="6s" repeatCount="indefinite">
                <mpath href={`#${uid}-main`} />
              </animateMotion>
            </circle>
            {showAmbient &&
              ambient.slice(0, 3).map((d, i) => (
                <g key={`c-${i}`}>
                  <path id={`${uid}-a${i}`} d={d} fill="none" stroke="none" />
                  <circle r="2" fill="#287FFF" opacity="0.8">
                    <animateMotion
                      dur={`${14 + i * 3}s`}
                      begin={`${i * 2}s`}
                      repeatCount="indefinite"
                    >
                      <mpath href={`#${uid}-a${i}`} />
                    </animateMotion>
                  </circle>
                </g>
              ))}
          </>
        )}

        {showLabels &&
          primaryPts.map((n) => (
            <g key={`lbl-${n.id}`}>
              <text
                x={n.x + 8}
                y={n.y - 8}
                fill="#EDF3F8"
                fontSize="11"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="500"
              >
                {n.name}
              </text>
            </g>
          ))}
      </svg>

      {intensity === "hero" && (
        <JourneyOverlay reduced={reduced} />
      )}
    </div>
  );
}

function JourneyOverlay({ reduced }: { reduced: boolean }) {
  const steps = [
    { label: "Pune Factory", mode: "Origin" },
    { label: "Nhava Sheva", mode: "Road · Truck" },
    { label: "Singapore", mode: "Ocean · Vessel" },
    { label: "Houston Port", mode: "Ocean · Vessel" },
    { label: "Customer", mode: "Road · Last mile" },
  ];

  return (
    <ol className="pointer-events-none absolute bottom-3 left-3 hidden max-w-[220px] flex-col gap-0 sm:flex">
      {steps.map((s, i) => (
        <li key={s.label} className="flex gap-2.5">
          <span className="flex flex-col items-center">
            <span
              className={cn(
                "mt-0.5 h-1.5 w-1.5 rounded-full",
                i <= 2 ? "bg-cyan-2" : "bg-fog/40",
                !reduced && i === 2 && "anim-pulse-dot",
              )}
            />
            {i < steps.length - 1 && (
              <span className="my-0.5 h-5 w-px bg-white/15" />
            )}
          </span>
          <span className="-mt-0.5 pb-2">
            <span className="block text-[11px] font-medium text-[#EDF3F8]/90">
              {s.label}
            </span>
            <span className="block text-[10px] text-fog">{s.mode}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function MiniRoute({ className }: { className?: string }) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const reduced = usePrefersReducedMotion();
  const a = { x: 28, y: 78 };
  const b = { x: 150, y: 42 };
  const c = { x: 280, y: 70 };
  const d = arcPath(a, b) + " " + arcPath(b, c);

  return (
    <svg
      viewBox="0 0 310 110"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <defs>
        <filter id={`${uid}-g`}>
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        id={`${uid}-p`}
        d={d}
        fill="none"
        stroke="#4CC9F0"
        strokeWidth="1.6"
        filter={`url(#${uid}-g)`}
        opacity="0.9"
      />
      <path
        d={d}
        fill="none"
        stroke="#64D8F4"
        strokeWidth="1"
        strokeDasharray="4 8"
        className="anim-dash"
      />
      {[a, b, c].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="#64D8F4" />
        </g>
      ))}
      <text x={a.x - 10} y={a.y + 16} fill="#8B9BAD" fontSize="9">
        Mumbai
      </text>
      <text x={b.x - 18} y={b.y - 10} fill="#EDF3F8" fontSize="9">
        Singapore
      </text>
      <text x={c.x - 22} y={c.y + 16} fill="#8B9BAD" fontSize="9">
        Houston
      </text>
      {!reduced && (
        <circle r="3" fill="#F7FAFC">
          <animateMotion dur="10s" repeatCount="indefinite">
            <mpath href={`#${uid}-p`} />
          </animateMotion>
        </circle>
      )}
    </svg>
  );
}
