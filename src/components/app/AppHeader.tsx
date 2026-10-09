import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LifeBuoy,
  LogOut,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useApp } from "@/state/AppContext";
import { ROLE_META, ROLE_USERS, type Role } from "@/lib/mock";
import { Kbd } from "./shared/primitives";

const CREATE_ACTIONS: { label: string; role: Role[]; to: string }[] = [
  { label: "New RFQ", role: ["operations", "sales", "management", "admin", "customer"], to: "/app/rfqs/new" },
  { label: "New Quote", role: ["operations", "sales", "management", "admin"], to: "/app/rfqs" },
  { label: "New Customer", role: ["sales", "management", "admin", "operations"], to: "/app/customers/new" },
  { label: "New Rate", role: ["sales", "admin"], to: "/app/rates" },
  { label: "Upload Document", role: ["operations", "documentation", "management", "admin", "customer"], to: "/app/documents" },
  { label: "Add Vendor", role: ["operations", "admin", "management"], to: "/app/vendors" },
];

export function AppHeader({
  onMenu,
  onSearch,
  onNotifications,
}: {
  onMenu: () => void;
  onSearch: () => void;
  onNotifications: () => void;
}) {
  const { unreadCount, pushToast, session } = useApp();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const createRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!createOpen && !profileOpen) return;
    const onDown = (e: MouseEvent) => {
      if (createRef.current && !createRef.current.contains(e.target as Node)) setCreateOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCreateOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [createOpen, profileOpen]);

  return (
    <header className="relative z-40 flex h-[60px] shrink-0 items-center gap-2 border-b border-ink/8 bg-white/70 px-4 backdrop-blur-md">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 text-mist lg:hidden"
      >
        <Menu size={17} />
      </button>

      <Breadcrumb />

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onSearch}
          className="hidden h-9 items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 text-[12.5px] text-mute-2 transition hover:border-ink/20 hover:text-mist sm:inline-flex sm:w-[220px] lg:w-[300px]"
        >
          <Search size={14} />
          <span className="flex-1 truncate text-left">Search shipment, RFQ, customer...</span>
          <span className="hidden items-center gap-0.5 lg:inline-flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 text-mist sm:hidden"
        >
          <Search size={16} />
        </button>

        <div ref={createRef} className="relative">
          <button
            type="button"
            onClick={() => setCreateOpen((o) => !o)}
            aria-expanded={createOpen}
            className="btn-primary inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13px]"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Create</span>
          </button>
          {createOpen && (
            <div className="absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-xl border border-ink/10 bg-white py-1.5 shadow-[0_20px_50px_-12px_rgba(13,33,56,0.3)]">
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-2">
                Quick Create
              </p>
              {CREATE_ACTIONS.filter((a) => a.role.includes(session?.role ?? "operations")).map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => {
                    setCreateOpen(false);
                    navigate(a.to);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-mist transition hover:bg-ink/4"
                >
                  <Plus size={13} className="text-accent" />
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onNotifications}
          aria-label={`Notifications, ${unreadCount} unread`}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-mute transition hover:bg-ink/5 hover:text-mist"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[9.5px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-label="Help"
          onClick={() => pushToast("info", "Help center", "CargoOS support is available 24×5.")}
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-mute transition hover:bg-ink/5 hover:text-mist md:inline-flex"
        >
          <LifeBuoy size={16} />
        </button>

        <div ref={profileRef} className="relative">
          <ProfileButton open={profileOpen} onToggle={() => setProfileOpen((o) => !o)} />
          {profileOpen && <ProfileMenu onClose={() => setProfileOpen(false)} />}
        </div>
      </div>
    </header>
  );
}

function ProfileButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { user, session } = useApp();
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        "ml-1 flex h-10 items-center gap-2.5 rounded-lg pl-1.5 pr-2 transition hover:bg-ink/5",
        open && "bg-ink/5",
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-cyan-2 text-[10.5px] font-semibold text-white">
        {initials}
      </span>
      <span className="hidden min-w-0 text-left md:block">
        <span className="block max-w-[120px] truncate text-[12px] font-medium leading-tight text-mist">
          {user.name}
        </span>
        <span className="block text-[10.5px] leading-tight text-mute-2">
          {ROLE_META[session?.role ?? "operations"].label}
        </span>
      </span>
      <ChevronDown size={13} className="hidden text-mute-2 md:block" />
    </button>
  );
}

function ProfileMenu({ onClose }: { onClose: () => void }) {
  const { user, session, setRole, setSession, pushToast } = useApp();
  const navigate = useNavigate();
  const role = session?.role ?? "operations";

  const roles = Object.keys(ROLE_USERS) as Role[];

  return (
    <div className="absolute right-0 top-12 z-30 w-64 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-[0_20px_50px_-12px_rgba(13,33,56,0.3)]">
      <div className="border-b border-ink/6 bg-paper px-4 py-3">
        <p className="text-[13px] font-medium text-mist">{user.name}</p>
        <p className="mt-0.5 text-[11.5px] text-mute-2">{user.email}</p>
        <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2 py-0.5 text-[10.5px] font-medium text-accent">
          {ROLE_META[role].label} · {user.branch}
        </p>
      </div>
      <div className="py-1">
        {[
          { label: "My Profile", icon: User },
          { label: "Preferences", icon: SlidersHorizontal },
          { label: "Help", icon: LifeBuoy },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => {
              onClose();
              pushToast("info", a.label, "Available in a later phase.");
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] text-mist transition hover:bg-ink/4"
          >
            <a.icon size={14} className="text-mute-2" />
            {a.label}
          </button>
        ))}
        <div className="my-1 border-t border-ink/6" />
        <p className="px-4 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-2">
          Switch demo role
        </p>
        <div className="grid grid-cols-2 gap-1 px-2 pb-2">
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                onClose();
                setRole(r);
                navigate(ROLE_META[r].home);
                pushToast("success", `Viewing as ${ROLE_META[r].label}`, "Demo role switched.");
              }}
              className={cn(
                "rounded-md px-2 py-1.5 text-left text-[11.5px] capitalize transition",
                r === role
                  ? "bg-accent/10 font-medium text-accent"
                  : "text-mute hover:bg-ink/5 hover:text-mist",
              )}
            >
              {ROLE_META[r].label}
            </button>
          ))}
        </div>
        <div className="my-1 border-t border-ink/6" />
        <button
          type="button"
          onClick={() => {
            setSession(null);
            navigate("/login");
          }}
          className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] text-bad transition hover:bg-bad/5"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function Breadcrumb() {
  const { pathname } = useLocation();

  const map: Record<string, [string, string]> = {
    "/app/overview": ["Workspace", "Operations Overview"],
    "/app/management": ["Workspace", "Management Overview"],
    "/app/customer": ["Workspace", "Customer Overview"],
    "/app/vendor": ["Workspace", "Vendor Overview"],
  };
  const known = map[pathname];
  let crumb: [string, string];
  if (known) {
    crumb = known;
  } else if (pathname === "/app") {
    crumb = ["Workspace", "Overview"];
  } else {
    const seg = pathname.split("/").filter(Boolean);
    const last = seg[seg.length - 1] ?? "Overview";
    crumb = ["CargoOS", last.charAt(0).toUpperCase() + last.slice(1).replace("-", " ")];
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5 text-[13px]">
      <span className="hidden text-mute-2 sm:inline">{crumb[0]}</span>
      <span className="hidden text-mute-2/60 sm:inline">/</span>
      <span className="truncate font-medium text-mist">{crumb[1]}</span>
    </div>
  );
}
