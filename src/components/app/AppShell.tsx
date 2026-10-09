import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { Dock } from "./Dock";
import { AppHeader } from "./AppHeader";
import { CommandPalette } from "./CommandPalette";
import { NotificationDrawer } from "./NotificationDrawer";
import { useApp } from "@/state/AppContext";
import { CommercialProvider } from "@/state/CommercialContext";
import { ExecutionProvider } from "@/state/ExecutionContext";
import { cn } from "@/utils/cn";

export default function AppShell() {
  return (
    <CommercialProvider>
      <ExecutionProvider>
        <AppShellInner />
      </ExecutionProvider>
    </CommercialProvider>
  );
}

function AppShellInner() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("spg.dock") === "1",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { toasts, dismissToast } = useApp();

  useEffect(() => {
    localStorage.setItem("spg.dock", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="flex min-h-[100svh] bg-[#06101B] text-mist lg:h-[100svh] lg:overflow-hidden">
      <div className="hidden h-full shrink-0 lg:block">
        <Dock collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col lg:p-3">
        <div className="relative flex min-h-[100svh] flex-col overflow-hidden bg-workspace lg:min-h-0 lg:flex-1 lg:rounded-2xl lg:shadow-[0_30px_90px_-25px_rgba(0,0,0,0.65)]">
          <AppHeader
            onMenu={() => setMobileOpen(true)}
            onSearch={() => setPaletteOpen(true)}
            onNotifications={() => setNotifOpen(true)}
          />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-ink/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-[272px]"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -290 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Dock collapsed={false} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[95] flex w-[min(92vw,340px)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 shadow-[0_20px_50px_-12px_rgba(5,11,18,0.4)]",
                t.kind === "success"
                  ? "border-ok/25"
                  : t.kind === "error"
                    ? "border-bad/25"
                    : "border-ink/10",
              )}
              role="status"
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  t.kind === "success"
                    ? "bg-ok/10 text-ok"
                    : t.kind === "error"
                      ? "bg-bad/10 text-bad"
                      : "bg-accent/10 text-accent",
                )}
              >
                {t.kind === "success" ? (
                  <CheckCircle2 size={15} />
                ) : t.kind === "error" ? (
                  <AlertTriangle size={15} />
                ) : (
                  <Info size={15} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-mist">{t.title}</p>
                {t.desc && <p className="mt-0.5 text-[11.5px] text-mute">{t.desc}</p>}
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismissToast(t.id)}
                className="rounded-md p-1 text-mute-2 transition hover:bg-ink/5 hover:text-mist"
              >
                <X size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
