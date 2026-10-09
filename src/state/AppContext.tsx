import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NOTIFICATIONS, ROLE_META, ROLE_USERS, type AppNotification, type NotifType, type Role } from "@/lib/mock";

export interface Session {
  email: string;
  name: string;
  role: Role;
}

export interface Toast {
  id: number;
  kind: "success" | "info" | "error";
  title: string;
  desc?: string;
}

interface AppState {
  session: Session | null;
  setSession: (s: Session | null) => void;
  setRole: (r: Role) => void;
  user: (typeof ROLE_USERS)[Role];
  notifications: AppNotification[];
  markRead: (id: string, unread?: boolean) => void;
  markAllRead: () => void;
  addNotification: (n: { type: NotifType; title: string; record: string; desc: string; href?: string }) => void;
  unreadCount: number;
  toasts: Toast[];
  pushToast: (kind: Toast["kind"], title: string, desc?: string) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<AppState | null>(null);

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem("spg.session");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email && parsed.role) return parsed as Session;
    return { email: String(raw), name: ROLE_USERS.operations.name, role: "operations" };
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => readSession());
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    if (session) {
      sessionStorage.setItem("spg.session", JSON.stringify(session));
    } else {
      sessionStorage.removeItem("spg.session");
    }
  }, [session]);

  const setSession = useCallback((s: Session | null) => setSessionState(s), []);

  const setRole = useCallback((r: Role) => {
    setSessionState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, role: r, name: ROLE_USERS[r].name, email: ROLE_USERS[r].email };
      return next;
    });
  }, []);

  const markRead = useCallback((id: string, unread = false) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const addNotification = useCallback(
    (n: { type: NotifType; title: string; record: string; desc: string; href?: string }) => {
      setNotifications((prev) => [
        {
          id: "n-" + Math.random().toString(36).slice(2, 8),
          unread: true,
          time: "just now",
          ...n,
        },
        ...prev,
      ]);
    },
    [],
  );

  const pushToast = useCallback((kind: Toast["kind"], title: string, desc?: string) => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((prev) => [...prev, { id, kind, title, desc }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  const user = ROLE_USERS[session?.role ?? "operations"];

  const value = useMemo<AppState>(
    () => ({
      session,
      setSession,
      setRole,
      user,
      notifications,
      markRead,
      markAllRead,
      addNotification,
      unreadCount,
      toasts,
      pushToast,
      dismissToast,
    }),
    [session, setSession, setRole, user, notifications, markRead, markAllRead, addNotification, unreadCount, toasts, pushToast, dismissToast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function homeFor(role: Role) {
  return ROLE_META[role].home;
}
