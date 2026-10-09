import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  Database,
  FileText,
  Files,
  Handshake,
  Inbox,
  Package,
  Radar,
  ScrollText,
  Ship,
  Stamp,
  UserCog,
  Users,
  UsersRound,
  Warehouse,
  Wallet,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { useApp, homeFor } from "@/state/AppContext";
import { SKelPreview } from "./placeholderPreview";

interface Meta {
  title: string;
  blurb: string;
  phase: string;
  icon: LucideIcon;
  preview: "table" | "cards" | "list";
}

const META: Record<string, Meta> = {
  "/app/customers": { title: "Customers", blurb: "Manage customer master, contacts, authorisations and communication history.", phase: "Commercial Phase", icon: Users, preview: "table" },
  "/app/rfqs": { title: "RFQs", blurb: "Capture rate enquiries, assign analysts and track response turnaround.", phase: "Commercial Phase", icon: Inbox, preview: "table" },
  "/app/rates": { title: "Rates", blurb: "Carrier and vendor rate book with validity windows and lane coverage.", phase: "Commercial Phase", icon: Ship, preview: "list" },
  "/app/quotes": { title: "Quotations", blurb: "Build, review and send quotations directly from the master shipment.", phase: "Commercial Phase", icon: FileText, preview: "table" },
  "/app/bookings": { title: "Bookings", blurb: "Confirm capacity with carriers and lock equipment for every leg.", phase: "Commercial Phase", icon: CalendarCheck, preview: "table" },
  "/app/shipments": { title: "Shipments", blurb: "Manage multimodal shipments, journey legs, milestones and exceptions.", phase: "Shipment Execution Phase", icon: Package, preview: "table" },
  "/app/control-tower": { title: "Control Tower", blurb: "Network-level visibility of movement, risk and exceptions in real time.", phase: "Shipment Execution Phase", icon: Radar, preview: "cards" },
  "/app/documents": { title: "Documents", blurb: "The digital document vault — every file bound to its shipment.", phase: "Document Control Phase", icon: Files, preview: "list" },
  "/app/customs": { title: "Customs", blurb: "Filings, assessments and clearance tracking across jurisdictions.", phase: "Document Control Phase", icon: Stamp, preview: "table" },
  "/app/warehouse": { title: "Warehouse", blurb: "Inbound, storage, cross-dock and dispatch operations.", phase: "Execution Phase", icon: Warehouse, preview: "cards" },
  "/app/vendors": { title: "Vendors", blurb: "Carrier and service partner network with allocation and performance.", phase: "Network Phase", icon: Handshake, preview: "table" },
  "/app/finance": { title: "Finance", blurb: "Invoices, bills, settlements and per-shipment profitability.", phase: "Finance Phase", icon: Wallet, preview: "table" },
  "/app/reports": { title: "Reports", blurb: "Operational and commercial intelligence across the network.", phase: "Intelligence Phase", icon: BarChart3, preview: "list" },
  "/app/admin/users": { title: "Users & Roles", blurb: "Provision users and assign role-based access across branches.", phase: "Administration", icon: UsersRound, preview: "table" },
  "/app/admin/roles": { title: "Roles", blurb: "Define permission sets per function, branch and data scope.", phase: "Administration", icon: UserCog, preview: "list" },
  "/app/admin/master-data": { title: "Master Data", blurb: "Lanes, parties, equipment and classification masters.", phase: "Administration", icon: Database, preview: "list" },
  "/app/admin/audit": { title: "Audit Logs", blurb: "Immutable record of every significant action in CargoOS.", phase: "Administration", icon: ScrollText, preview: "table" },
};

const FALLBACK: Meta = {
  title: "Module",
  blurb: "This area of CargoOS is being prepared.",
  phase: "Upcoming Phase",
  icon: Package,
  preview: "list",
};

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { session, pushToast } = useApp();
  const meta = META[pathname] ?? FALLBACK;

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="glass-strong overflow-hidden rounded-2xl">
          <div className="relative p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan-2 text-white shadow-[0_12px_28px_-8px_rgba(28,111,232,0.5)]">
              <meta.icon size={22} strokeWidth={1.8} />
            </span>
            <h1 className="mt-5 text-[26px] font-medium tracking-tight text-mist sm:text-[30px]">
              {meta.title}
            </h1>
            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-mute">{meta.blurb}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(homeFor(session?.role ?? "operations"))}
                className="btn-primary inline-flex h-10 items-center rounded-lg px-4 text-[13px]"
              >
                Return to Overview
              </button>
              <button
                type="button"
                onClick={() => pushToast("info", "We will be in touch", "You will be notified when this module opens.")}
                className="btn-secondary inline-flex h-10 items-center rounded-lg px-4 text-[13px]"
              >
                Notify Me
              </button>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-3 py-1.5 text-[11px] font-medium text-accent">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Coming in the {meta.phase}
              </span>
            </div>
          </div>
          <div className="border-t border-ink/6 bg-paper/50 p-4 sm:p-5">
            <SKelPreview kind={meta.preview} />
          </div>
        </div>
        <p className="mt-4 text-center text-[11.5px] text-mute-2">
          Deep workflows open in later phases. You can still explore the live overview today.
        </p>
      </div>
    </div>
  );
}
