import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CalendarCheck,
  ChevronLeft,
  Database,
  FileText,
  Files,
  Handshake,
  Inbox,
  LayoutGrid,
  LifeBuoy,
  Package,
  Radar,
  ScrollText,
  Settings,
  Ship,
  Stamp,
  UserCog,
  Users,
  UsersRound,
  Warehouse,
  Wallet,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useApp } from "@/state/AppContext";
import { Logo } from "@/components/ui/Logo";
import { ROLE_META, type Role } from "@/lib/mock";
import { useCommercial } from "@/state/CommercialContext";
import { useExecution } from "@/state/ExecutionContext";

interface Item {
  id: string;
  label: string;
  icon: React.ElementType;
  to: string;
  badge?: number;
  badgeTone?: "accent" | "warn";
}

function buildGroups(role: Role, rfqNewCount: number, activeShipments = 0, openExceptions = 0): { key: string; label?: string; items: Item[] }[] {
  const overviewTo =
    role === "customer"
      ? "/app/customer"
      : role === "vendor"
        ? "/app/vendor"
        : role === "management"
          ? "/app/management"
          : "/app/overview";

  const all: Record<string, { key: string; label?: string; items: Item[] }> = {
    overview: {
      key: "overview",
      items: [{ id: "overview", label: "Overview", icon: LayoutGrid, to: overviewTo }],
    },
    commercial: {
      key: "commercial",
      label: "Commercial",
      items: [
        { id: "customers", label: "Customers", icon: Users, to: "/app/customers" },
        { id: "rfqs", label: "RFQs", icon: Inbox, to: "/app/rfqs", badge: rfqNewCount || undefined, badgeTone: "accent" },
        { id: "rates", label: "Rates", icon: Ship, to: "/app/rates" },
        { id: "quotes", label: "Quotations", icon: FileText, to: "/app/quotes" },
        { id: "bookings", label: "Bookings", icon: CalendarCheck, to: "/app/bookings" },
      ],
    },
    execution: {
      key: "execution",
      label: "Execution",
      items: [
        { id: "shipments", label: "Shipments", icon: Package, to: "/app/shipments", badge: activeShipments || undefined, badgeTone: "accent" },
        { id: "control-tower", label: "Control Tower", icon: Radar, to: "/app/control-tower", badge: openExceptions || undefined, badgeTone: "warn" },
        { id: "documents", label: "Documents", icon: Files, to: "/app/documents", badge: 6, badgeTone: "warn" },
        { id: "customs", label: "Customs", icon: Stamp, to: "/app/customs" },
        { id: "warehouse", label: "Warehouse", icon: Warehouse, to: "/app/warehouse" },
      ],
    },
    network: {
      key: "network",
      label: "Network",
      items: [{ id: "vendors", label: "Vendors", icon: Handshake, to: "/app/vendors" }],
    },
    finance: {
      key: "finance",
      label: "Finance",
      items: [{ id: "finance", label: "Finance", icon: Wallet, to: "/app/finance" }],
    },
    intelligence: {
      key: "intelligence",
      label: "Intelligence",
      items: [{ id: "reports", label: "Reports", icon: BarChart3, to: "/app/reports" }],
    },
    admin: {
      key: "admin",
      label: "Administration",
      items: [
        { id: "admin/users", label: "Users & Roles", icon: UsersRound, to: "/app/admin/users" },
        { id: "admin/roles", label: "Roles", icon: UserCog, to: "/app/admin/roles" },
        { id: "admin/master-data", label: "Master Data", icon: Database, to: "/app/admin/master-data" },
        { id: "admin/audit", label: "Audit Logs", icon: ScrollText, to: "/app/admin/audit" },
      ],
    },
    customer: {
      key: "customer",
      label: "Workspace",
      items: [
        { id: "customer/overview", label: "My Overview", icon: LayoutGrid, to: "/app/customer" },
        { id: "customer/shipments", label: "My Shipments", icon: Package, to: "/app/shipments" },
        { id: "customer/rfqs", label: "My RFQs", icon: Inbox, to: "/app/customer/rfqs" },
        { id: "customer/quotes", label: "My Quotes", icon: FileText, to: "/app/customer/quotes" },
        { id: "customer/docs", label: "Documents", icon: Files, to: "/app/documents" },
        { id: "customer/invoices", label: "Invoices", icon: Wallet, to: "/app/finance" },
      ],
    },
    vendor: {
      key: "vendor",
      label: "Workspace",
      items: [
        { id: "vendor/overview", label: "My Jobs", icon: LayoutGrid, to: "/app/vendor" },
        { id: "vendor/jobs", label: "Job Requests", icon: Package, to: "/app/shipments" },
        { id: "vendor/docs", label: "Documents", icon: Files, to: "/app/documents" },
        { id: "vendor/invoices", label: "Invoices", icon: Wallet, to: "/app/finance" },
      ],
    },
  };

  const order = [
    "overview",
    "commercial",
    "execution",
    "network",
    "finance",
    "intelligence",
    "admin",
    "customer",
    "vendor",
  ];
  return order
    .filter((k) => {
      if (k === "overview") return true;
      if (role === "customer" || role === "vendor") return k === role;
      return ROLE_META[role].nav.includes(k);
    })
    .map((k) => all[k]);
}

export function Dock({
  collapsed,
  onToggle,
  className,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  className?: string;
}) {
  const { session, user } = useApp();
  const { rfqs } = useCommercial();
  const { shipments, exceptions } = useExecution();
  const role = session?.role ?? "operations";
  const groups = buildGroups(
    role,
    rfqs.filter((r) => r.status === "New").length,
    shipments.filter((s) => !["Completed", "Cancelled"].includes(s.stage)).length,
    exceptions.filter((e) => e.status !== "Resolved" && e.status !== "Closed").length,
  );

  return (
    <nav
      aria-label="Application"
      className={cn(
        "flex h-full flex-col bg-gradient-to-b from-[#06101B] to-[#081522] text-white/80 transition-[width] duration-300",
        collapsed ? "w-[74px]" : "w-[248px]",
        className,
      )}
    >
      <div className={cn("flex h-[60px] items-center border-b border-white/6", collapsed ? "justify-center px-2" : "justify-between px-4")}>
        {collapsed ? (
          <Logo compact dark className="!gap-0 [&>span:last-child]:hidden" />
        ) : (
          <Logo dark />
        )}
        {!collapsed && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse navigation"
            className="hidden h-7 w-7 items-center justify-center rounded-md text-white/40 transition hover:bg-white/8 hover:text-white xl:inline-flex"
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 [scrollbar-width:thin]">
        {groups.map((g) => (
          <div key={g.key} className="mb-1.5">
            {g.label && !collapsed && (
              <p className="px-4 pb-1 pt-3 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/30">
                {g.label}
              </p>
            )}
            {g.label && collapsed && <div className="mx-3 my-2 h-px bg-white/8" />}
            <ul className="space-y-0.5 px-2">
              {g.items.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex items-center gap-3 rounded-lg py-2 text-[13px] transition-colors duration-150",
                        collapsed ? "justify-center px-0" : "px-3",
                        isActive
                          ? "bg-[#287FFF]/16 font-medium text-white"
                          : "text-white/55 hover:bg-white/6 hover:text-white",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-cyan-2" />
                        )}
                        <item.icon size={16} strokeWidth={1.8} className="shrink-0" />
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {!collapsed && item.badge != null && (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-px text-[10px] font-semibold",
                              item.badgeTone === "warn"
                                ? "bg-warn/20 text-warn"
                                : "bg-accent/25 text-[#8FC1FF]",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/6 p-2">
        <div className={cn("flex gap-1", collapsed && "flex-col")}>
          <DockButton icon={LifeBuoy} label="Help" collapsed={collapsed} />
          <DockButton icon={Settings} label="Settings" collapsed={collapsed} />
          {onToggle && (
            <DockButton
              icon={ChevronLeft}
              label={collapsed ? "Expand" : "Collapse"}
              collapsed={collapsed}
              onClick={onToggle}
              spin={collapsed}
            />
          )}
        </div>
        <div
          className={cn(
            "mt-2 flex items-center gap-2.5 rounded-lg p-2",
            collapsed && "justify-center",
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-cyan-2 text-[11px] font-semibold text-white">
            {user.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-white">{user.name}</span>
              <span className="block truncate text-[10.5px] text-white/40">{user.branch}</span>
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

function DockButton({
  icon: Icon,
  label,
  collapsed,
  onClick,
  spin,
}: {
  icon: React.ElementType;
  label: string;
  collapsed?: boolean;
  onClick?: () => void;
  spin?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-white/50 transition hover:bg-white/6 hover:text-white",
        !collapsed && "px-3 text-[12px]",
      )}
    >
      <Icon size={15} className={cn(spin && "rotate-180 transition-transform")} />
      {!collapsed && label}
    </button>
  );
}
