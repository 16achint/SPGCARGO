import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Anchor,
  CheckCheck,
  CheckCircle2,
  FileText,
  Files,
  Stamp,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/state/AppContext";
import type { NotifType } from "@/lib/mock";
import { SegTabs } from "./shared/primitives";

const TYPE_ICON: Record<NotifType, { icon: React.ElementType; cls: string }> = {
  delayed: { icon: AlertTriangle, cls: "bg-warn/10 text-warn" },
  document: { icon: Files, cls: "bg-cyan/10 text-cyan" },
  quote: { icon: FileText, cls: "bg-accent/10 text-accent" },
  pickup: { icon: Truck, cls: "bg-accent/10 text-accent" },
  customs: { icon: Stamp, cls: "bg-warn/10 text-warn" },
  arrival: { icon: Anchor, cls: "bg-ok/10 text-ok" },
  pod: { icon: CheckCircle2, cls: "bg-ok/10 text-ok" },
  invoice: { icon: Wallet, cls: "bg-warn/10 text-warn" },
};

export function NotificationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications, markRead, markAllRead, unreadCount, pushToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) window.setTimeout(() => closeRef.current?.focus(), 40);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const items = tab === "all" ? notifications : notifications.filter((n) => n.unread);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            type="button"
            aria-label="Close notifications"
            className="absolute inset-0 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-label="Notifications"
            className="absolute inset-y-0 right-0 flex w-[min(100%,390px)] flex-col bg-white shadow-[-24px_0_60px_-20px_rgba(5,11,18,0.35)]"
            initial={reduced ? false : { x: 400 }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: 420 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-center justify-between border-b border-ink/8 px-4 py-3.5">
              <div>
                <h2 className="text-[14px] font-semibold text-mist">Notifications</h2>
                <p className="mt-0.5 text-[11px] text-mute-2">{unreadCount} unread</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    markAllRead();
                    pushToast("success", "All notifications marked read");
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] text-mute transition hover:bg-ink/5 hover:text-mist"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mute transition hover:bg-ink/5 hover:text-mist"
                >
                  <X size={16} />
                </button>
              </div>
            </header>
            <div className="border-b border-ink/6 px-4 py-2.5">
              <SegTabs
                tabs={[
                  { id: "all" as const, label: "All", count: notifications.length },
                  { id: "unread" as const, label: "Unread", count: unreadCount },
                ]}
                value={tab}
                onChange={setTab}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 && (
                <p className="px-4 py-10 text-center text-[12.5px] text-mute-2">
                  You are all caught up.
                </p>
              )}
              {items.map((n) => {
                const t = TYPE_ICON[n.type];
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "relative flex gap-3 border-b border-ink/5 px-4 py-3 transition hover:bg-ink/3",
                      !n.unread && "opacity-65",
                    )}
                  >
                    {n.unread && (
                      <span className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent" />
                    )}
                    <span className={cn("mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", t.cls)}>
                      <t.icon size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-[12.5px] font-medium text-mist">{n.title}</p>
                        <span className="shrink-0 text-[10.5px] text-mute-2">{n.time}</span>
                      </div>
                      <p className="mt-0.5 font-mono text-[10.5px] text-accent">{n.record}</p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-mute">{n.desc}</p>
                      <div className="mt-1.5 flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            markRead(n.id);
                            onClose();
                            if (n.href) navigate(n.href);
                          }}
                          className="text-[11px] font-medium text-accent transition hover:text-accent-2"
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => markRead(n.id, !n.unread)}
                          className="text-[11px] text-mute-2 transition hover:text-mist"
                        >
                          Mark {n.unread ? "read" : "unread"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
