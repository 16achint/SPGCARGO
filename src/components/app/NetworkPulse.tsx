import type { Shipment } from "@/lib/mock";

function points(values: number[], width: number, height: number, pad: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = pad + (index / (values.length - 1)) * (width - pad * 2);
      const y = height - pad - ((value - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

export function NetworkPulse({ shipments }: { shipments: Shipment[] }) {
  const active = shipments.length;
  const inTransit = shipments.filter((s) => s.status === "In Transit" || s.status === "Transshipment").length;
  const exceptions = shipments.filter((s) => s.status === "Exception").length;
  const activeTrend = [Math.max(active - 5, 0), Math.max(active - 3, 0), Math.max(active - 4, 0), Math.max(active - 2, 0), Math.max(active - 1, 0), Math.max(active - 2, 0), active];
  const transitTrend = [Math.max(inTransit - 2, 0), Math.max(inTransit - 1, 0), Math.max(inTransit - 2, 0), Math.max(inTransit - 1, 0), inTransit, Math.max(inTransit - 1, 0), inTransit];
  const width = 520;
  const height = 76;
  const pad = 5;
  const activePoints = points(activeTrend, width, height, pad);
  const transitPoints = points(transitTrend, width, height, pad);
  const last = activePoints.split(" ").at(-1)?.split(",") ?? ["0", "0"];

  return (
    <section className="rounded-lg border border-ink/6 bg-paper/70 px-3 py-2.5" aria-label="Network pulse for the last seven days">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-mist">Network Pulse</p>
          <p className="mt-0.5 text-[10px] text-mute-2">Active shipment movement · last 7 days</p>
        </div>
        <div className="flex gap-3 text-[10px]">
          <span className="text-mute"><b className="font-semibold text-mist">{inTransit}</b> in transit</span>
          <span className="text-mute"><b className="font-semibold text-bad">{exceptions}</b> exceptions</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 h-[68px] w-full" role="img" aria-label={`${active} active shipments and ${inTransit} in transit`}>
        {[20, 40, 60].map((y) => <line key={y} x1="0" x2={width} y1={y} y2={y} stroke="rgba(13,33,56,0.08)" strokeWidth="1" />)}
        <polyline points={transitPoints} fill="none" stroke="#0BA6D4" strokeWidth="1.6" strokeDasharray="4 4" />
        <polyline points={activePoints} fill="none" stroke="#1C6FE8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r="3.5" fill="#fff" stroke="#1C6FE8" strokeWidth="2" />
      </svg>
      <div className="mt-0.5 flex justify-between text-[9.5px] text-mute-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'].map((day) => <span key={day}>{day}</span>)}
      </div>
    </section>
  );
}
