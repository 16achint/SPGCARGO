import { NetworkMap } from "@/components/network/NetworkMap";
import { Logo } from "@/components/ui/Logo";
import { DEMO_SHIPMENT } from "@/lib/geo";

export function AuthVisualPanel() {
  return (
    <div className="relative hidden h-full overflow-hidden bg-ink lg:block">
      <NetworkMap intensity="login" showLabels />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/25" />
      <div className="absolute left-8 top-8">
        <Logo dark />
      </div>
      <div className="absolute bottom-10 left-8 max-w-md">
        <p className="text-[28px] font-medium leading-tight tracking-tight text-[#F7FAFC]">
          Every shipment.
          <br />
          Every movement.
          <br />
          One operating system.
        </p>
        <div className="glass mt-6 inline-flex items-center gap-4 rounded-xl px-4 py-3">
          <span className="font-mono text-[12px] text-cyan">{DEMO_SHIPMENT.id}</span>
          <span className="h-3 w-px bg-ink/10" />
          <span className="text-[12px] text-mist/80">
            {DEMO_SHIPMENT.origin} → {DEMO_SHIPMENT.destination}
          </span>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] tracking-wide text-accent">
            {DEMO_SHIPMENT.status}
          </span>
        </div>
        <p className="mt-3 text-[12px] text-fog">ETA {DEMO_SHIPMENT.eta}</p>
      </div>
    </div>
  );
}
