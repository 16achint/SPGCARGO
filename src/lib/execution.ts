export type LegMode = "Road" | "Ocean" | "Air" | "Rail";

export type LegStatus =
  | "Planned"
  | "Ready"
  | "In Progress"
  | "Completed"
  | "Delayed"
  | "Exception"
  | "Cancelled";

export type ExecStage =
  | "Enquiry"
  | "Quoted"
  | "Confirmed"
  | "Booking"
  | "Documentation"
  | "Pickup"
  | "Customs"
  | "Gate-In"
  | "In Transit"
  | "Transshipment"
  | "Destination"
  | "Delivery"
  | "Completed"
  | "Cancelled";

export const STAGE_FLOW: ExecStage[] = [
  "Enquiry",
  "Quoted",
  "Confirmed",
  "Booking",
  "Documentation",
  "Pickup",
  "Customs",
  "Gate-In",
  "In Transit",
  "Transshipment",
  "Destination",
  "Delivery",
  "Completed",
];

export interface Leg {
  id: string;
  seq: number;
  mode: LegMode;
  origin: string;
  destination: string;
  vendor?: string;
  plannedDep: string;
  plannedArr: string;
  actualDep?: string;
  actualArr?: string;
  status: LegStatus;
  tracking: Record<string, string>;
  details: Record<string, string>;
  notes?: string;
}

export type MsStatus = "Upcoming" | "Due Soon" | "Completed" | "Delayed" | "Exception" | "Skipped";

export interface MilestoneX {
  id: string;
  name: string;
  legId?: string;
  planned: string;
  actual?: string;
  status: MsStatus;
  owner: string;
  internalRemark?: string;
  customerRemark?: string;
  customerVisible: boolean;
  custom?: boolean;
}

export type ExcSeverity = "Low" | "Medium" | "High" | "Critical";
export type ExcStatus = "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed";

export const EXC_TYPES = [
  "Delay",
  "Document Missing",
  "Vehicle Breakdown",
  "Customs Hold",
  "Port Hold",
  "Cargo Damage",
  "Vendor No-Show",
  "Missed Connection",
  "Weather",
  "Capacity Issue",
  "Address Issue",
  "Other",
];

export interface ExceptionX {
  id: string;
  type: string;
  severity: ExcSeverity;
  shipmentId: string;
  legId?: string;
  description: string;
  owner: string;
  opened: string;
  due: string;
  customerVisible: boolean;
  status: ExcStatus;
  resolution?: string;
  rootCause?: string;
}

export interface ExecActivity {
  id: string;
  shipmentId: string;
  time: string;
  by: string;
  action: string;
  summary: string;
}

export interface ExecShipment {
  id: string;
  customer: string;
  customerId?: string;
  bookingId?: string;
  rfqId?: string;
  quoteId?: string;
  origin: string;
  destination: string;
  nodeIds: string[];
  cargo: string;
  service: string;
  owner: string;
  team?: string;
  internalRef?: string;
  priority: "Normal" | "High" | "Critical";
  stage: ExecStage;
  exception: boolean;
  cancelled?: { reason: string; note?: string };
  eta: string;
  created: string;
  plannedStart: string;
  plannedEnd: string;
  notes: { id: string; time: string; by: string; text: string; legId?: string }[];
  legs: Leg[];
  milestones: MilestoneX[];
  docsReady: number;
  docsTotal: number;
}

/* Mock "now" keeps delay logic deterministic */
export const MOCK_NOW = new Date("2026-10-12T14:00:00");

export function parsePlan(s: string) {
  const t = Date.parse(s.replace(" ", "T"));
  return Number.isNaN(t) ? null : new Date(t);
}

export function isPastDue(planned: string, actual?: string) {
  if (actual) return false;
  const p = parsePlan(planned);
  return p !== null && p.getTime() < MOCK_NOW.getTime();
}

export function delayLabel(planned: string) {
  const p = parsePlan(planned);
  if (!p) return "";
  const mins = Math.max(0, Math.round((MOCK_NOW.getTime() - p.getTime()) / 60000));
  const h = Math.floor(mins / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `Delayed by ${d}d ${h % 24}h`;
  if (h > 0) return `Delayed by ${h}h ${mins % 60}m`;
  return `Delayed by ${mins}m`;
}

export function fmtDT(s?: string) {
  if (!s) return "—";
  const d = parsePlan(s);
  if (!d) return s;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function shipProgress(s: ExecShipment) {
  const total = s.legs.length || 1;
  const done = s.legs.filter((l) => l.status === "Completed").length;
  const active = s.legs.some((l) => l.status === "In Progress") ? 0.5 : 0;
  return Math.min(100, Math.round(((done + active) / total) * 100));
}

export function currentLeg(s: ExecShipment) {
  return (
    s.legs.find((l) => l.status === "In Progress" || l.status === "Delayed" || l.status === "Exception") ??
    s.legs.find((l) => l.status !== "Completed" && l.status !== "Cancelled")
  );
}

export function nextMilestone(s: ExecShipment) {
  return s.milestones.find((m) => !m.actual && m.status !== "Skipped");
}

export function msEffectiveStatus(m: MilestoneX): MsStatus {
  if (m.actual) return "Completed";
  if (m.status === "Exception" || m.status === "Skipped") return m.status;
  if (isPastDue(m.planned)) return "Delayed";
  const p = parsePlan(m.planned);
  if (p && p.getTime() - MOCK_NOW.getTime() < 24 * 3600 * 1000) return "Due Soon";
  return "Upcoming";
}

export const MODE_TRACKING_FIELDS: Record<LegMode, string[]> = {
  Ocean: ["Container No.", "BL No.", "Booking No.", "Vessel", "Voyage"],
  Air: ["AWB", "Flight", "Airline"],
  Road: ["LR No.", "Vehicle No.", "Driver"],
  Rail: ["Rail Ref", "Train/Service", "Container No."],
};

export const MS_TEMPLATES: Record<LegMode, string[]> = {
  Road: ["Pickup", "Delivery"],
  Ocean: ["Gate-In", "Vessel Departed", "Destination Arrival"],
  Air: ["Flight Departed", "Destination Arrival"],
  Rail: ["Rail Departed", "Destination Arrival"],
};

/* ---------------- Seed ---------------- */

const A = "SPG-SHP-001284";

function leg(p: Partial<Leg> & Pick<Leg, "id" | "seq" | "mode" | "origin" | "destination" | "plannedDep" | "plannedArr" | "status">): Leg {
  return { tracking: {}, details: {}, ...p };
}

export const SEED_EXEC: ExecShipment[] = [
  {
    id: A,
    customer: "Apex Components Pvt Ltd",
    customerId: "CUST-000001",
    bookingId: "SPG-BKG-000128",
    rfqId: "SPG-RFQ-000128",
    quoteId: "SPG-QUO-000128",
    origin: "Pune, India",
    destination: "Houston, USA",
    nodeIds: ["pune", "nhava", "singapore", "houston"],
    cargo: "Precision auto components · 48 pallets · 18,400 KG",
    service: "Door to Door",
    owner: "A. Sharma",
    team: "Mumbai Ops",
    internalRef: "OPS-APX-224",
    priority: "High",
    stage: "In Transit",
    exception: true,
    eta: "18 Oct",
    created: "2026-09-30 10:20",
    plannedStart: "2026-10-06 09:00",
    plannedEnd: "2026-10-19 18:00",
    docsReady: 12,
    docsTotal: 13,
    notes: [
      { id: "nt-1", time: "2026-10-08 11:00", by: "A. Sharma", text: "Customer requested daily status until Houston arrival." },
    ],
    legs: [
      leg({
        id: "L1", seq: 1, mode: "Road", origin: "Pune Factory", destination: "Nhava Sheva",
        vendor: "TransLine Haulage",
        plannedDep: "2026-10-06 09:00", plannedArr: "2026-10-06 18:00",
        actualDep: "2026-10-06 09:20", actualArr: "2026-10-06 17:40",
        status: "Completed",
        tracking: { "LR No.": "LR-88214", "Vehicle No.": "MH12 AB 4471" },
        details: { "Vehicle Type": "32 ft SXL", Driver: "S. Pawar" },
      }),
      leg({
        id: "L2", seq: 2, mode: "Ocean", origin: "Nhava Sheva", destination: "Singapore",
        vendor: "Meridian Ocean Freight",
        plannedDep: "2026-10-08 06:00", plannedArr: "2026-10-11 20:00",
        actualDep: "2026-10-08 07:10", actualArr: "2026-10-11 19:05",
        status: "Completed",
        tracking: { "Container No.": "MSCU1234567", "BL No.": "MOFBL88412", Vessel: "MV Northern Star", Voyage: "NS-412E" },
        details: { "FCL/LCL": "FCL", "Container Type": "40HC", POL: "INNSA", POD: "SGSIN" },
      }),
      leg({
        id: "L3", seq: 3, mode: "Ocean", origin: "Singapore", destination: "Houston Port",
        vendor: "Meridian Ocean Freight",
        plannedDep: "2026-10-12 10:00", plannedArr: "2026-10-17 22:00",
        actualDep: "2026-10-12 12:42",
        status: "In Progress",
        tracking: { "Container No.": "MSCU1234567", "BL No.": "MOFBL88412", Vessel: "MV Coral Meridian", Voyage: "CM-209W" },
        details: { "FCL/LCL": "FCL", "Container Type": "40HC", POL: "SGSIN", POD: "USHOU" },
      }),
      leg({
        id: "L4", seq: 4, mode: "Road", origin: "Houston Port", destination: "Houston Customer DC",
        vendor: "Harbor Logistics",
        plannedDep: "2026-10-18 09:00", plannedArr: "2026-10-18 14:00",
        status: "Planned",
        details: { "Vehicle Type": "53 ft trailer" },
      }),
    ],
    milestones: [
      { id: "M1", name: "Booking", planned: "2026-09-30 12:00", actual: "2026-09-30 11:40", status: "Completed", owner: "N. Verghese", customerVisible: true },
      { id: "M2", name: "Pickup", legId: "L1", planned: "2026-10-06 09:00", actual: "2026-10-06 09:20", status: "Completed", owner: "A. Sharma", customerVisible: true, customerRemark: "Cargo collected from Pune plant." },
      { id: "M3", name: "Gate-In", legId: "L2", planned: "2026-10-07 15:00", actual: "2026-10-07 14:10", status: "Completed", owner: "A. Sharma", customerVisible: true },
      { id: "M4", name: "Vessel Departed", legId: "L2", planned: "2026-10-08 06:00", actual: "2026-10-08 07:10", status: "Completed", owner: "A. Sharma", customerVisible: true },
      { id: "M5", name: "Transshipment", legId: "L3", planned: "2026-10-12 10:00", actual: "2026-10-12 12:42", status: "Completed", owner: "A. Sharma", customerVisible: true, customerRemark: "Connected at Singapore." },
      { id: "M6", name: "Destination Arrival", legId: "L3", planned: "2026-10-17 22:00", status: "Upcoming", owner: "A. Sharma", customerVisible: true },
      { id: "M7", name: "Customs", legId: "L3", planned: "2026-10-18 06:00", status: "Upcoming", owner: "K. Patel", customerVisible: false },
      { id: "M8", name: "Delivery", legId: "L4", planned: "2026-10-18 14:00", status: "Upcoming", owner: "A. Sharma", customerVisible: true },
      { id: "M9", name: "POD", legId: "L4", planned: "2026-10-19 12:00", status: "Upcoming", owner: "Docs Team", customerVisible: true },
    ],
  },
  {
    id: "SPG-SHP-001271",
    customer: "BlueRock Chemicals",
    origin: "Hamburg, Germany",
    destination: "Nhava Sheva, India",
    nodeIds: ["hamburg", "nhava"],
    cargo: "Industrial solvents · ISO tanks",
    service: "Port to Port",
    owner: "A. Sharma",
    priority: "Critical",
    stage: "In Transit",
    exception: true,
    eta: "—",
    created: "2026-09-26 09:00",
    plannedStart: "2026-09-28 08:00",
    plannedEnd: "2026-10-14 20:00",
    docsReady: 4,
    docsTotal: 6,
    notes: [],
    legs: [
      leg({ id: "L1", seq: 1, mode: "Ocean", origin: "Hamburg", destination: "Nhava Sheva", vendor: "Atlas Breakbulk", plannedDep: "2026-09-28 08:00", plannedArr: "2026-10-11 20:00", actualDep: "2026-09-28 10:30", status: "Delayed", tracking: { "BL No.": "ABBL55120", Vessel: "MV Elbe Trader" } }),
    ],
    milestones: [
      { id: "M1", name: "Vessel Departed", legId: "L1", planned: "2026-09-28 08:00", actual: "2026-09-28 10:30", status: "Completed", owner: "A. Sharma", customerVisible: true },
      { id: "M2", name: "Destination Arrival", legId: "L1", planned: "2026-10-11 20:00", status: "Delayed", owner: "A. Sharma", customerVisible: true },
    ],
  },
  {
    id: "SPG-SHP-001265",
    customer: "Orbital Pharma",
    origin: "New York, USA",
    destination: "Pune, India",
    nodeIds: ["ny", "pune"],
    cargo: "APIs · cool chain · 12 drums",
    service: "Door to Door",
    owner: "K. Patel",
    priority: "High",
    stage: "In Transit",
    exception: false,
    eta: "22 Oct",
    created: "2026-10-08 12:00",
    plannedStart: "2026-10-10 08:00",
    plannedEnd: "2026-10-22 18:00",
    docsReady: 5,
    docsTotal: 6,
    notes: [],
    legs: [
      leg({ id: "L1", seq: 1, mode: "Air", origin: "New York JFK", destination: "Mumbai BOM", vendor: "SkyPort Air Cargo", plannedDep: "2026-10-10 22:00", plannedArr: "2026-10-12 04:00", actualDep: "2026-10-10 22:40", actualArr: "2026-10-12 03:30", status: "Completed", tracking: { AWB: "098-44121130", Flight: "SP-441" } }),
      leg({ id: "L2", seq: 2, mode: "Road", origin: "Mumbai BOM", destination: "Pune DC", vendor: "ColdChain Reefer", plannedDep: "2026-10-12 10:00", plannedArr: "2026-10-12 16:00", actualDep: "2026-10-12 10:05", status: "In Progress", tracking: { "Vehicle No.": "MH14 RT 9921" } }),
    ],
    milestones: [
      { id: "M1", name: "Flight Departed", legId: "L1", planned: "2026-10-10 22:00", actual: "2026-10-10 22:40", status: "Completed", owner: "K. Patel", customerVisible: true },
      { id: "M2", name: "Customs", legId: "L1", planned: "2026-10-12 08:00", actual: "2026-10-12 09:10", status: "Completed", owner: "K. Patel", customerVisible: false },
      { id: "M3", name: "Delivery", legId: "L2", planned: "2026-10-12 16:00", status: "Due Soon", owner: "K. Patel", customerVisible: true },
    ],
  },
  {
    id: "SPG-SHP-001202",
    customer: "Sahara Textiles",
    origin: "Singapore",
    destination: "Rotterdam, Netherlands",
    nodeIds: ["singapore", "rotterdam"],
    cargo: "Cotton yarn · 6 × 20ft",
    service: "Port to Door",
    owner: "S. Khan",
    priority: "Normal",
    stage: "In Transit",
    exception: false,
    eta: "20 Oct",
    created: "2026-10-01 10:00",
    plannedStart: "2026-10-03 06:00",
    plannedEnd: "2026-10-21 18:00",
    docsReady: 6,
    docsTotal: 6,
    notes: [],
    legs: [
      leg({ id: "L1", seq: 1, mode: "Ocean", origin: "Singapore", destination: "Rotterdam", vendor: "Meridian Ocean Freight", plannedDep: "2026-10-03 06:00", plannedArr: "2026-10-19 18:00", actualDep: "2026-10-03 06:30", status: "In Progress", tracking: { "BL No.": "MOFBL90210" } }),
      leg({ id: "L2", seq: 2, mode: "Rail", origin: "Rotterdam", destination: "Venlo ICD", vendor: "RailBridge ICD", plannedDep: "2026-10-20 08:00", plannedArr: "2026-10-20 14:00", status: "Planned", tracking: {} }),
    ],
    milestones: [
      { id: "M1", name: "Vessel Departed", legId: "L1", planned: "2026-10-03 06:00", actual: "2026-10-03 06:30", status: "Completed", owner: "S. Khan", customerVisible: true },
      { id: "M2", name: "Destination Arrival", legId: "L1", planned: "2026-10-19 18:00", status: "Upcoming", owner: "S. Khan", customerVisible: true },
      { id: "M3", name: "Rail Departed", legId: "L2", planned: "2026-10-20 08:00", status: "Upcoming", owner: "S. Khan", customerVisible: true },
    ],
  },
  {
    id: "SPG-SHP-001238",
    customer: "Apex Components Pvt Ltd",
    customerId: "CUST-000001",
    origin: "Pune, India",
    destination: "Nhava Sheva, India",
    nodeIds: ["pune", "nhava"],
    cargo: "Cast housings · 2 × 40HC",
    service: "Door to Port",
    owner: "A. Sharma",
    priority: "Normal",
    stage: "Pickup",
    exception: false,
    eta: "13 Oct",
    created: "2026-10-10 09:00",
    plannedStart: "2026-10-12 10:30",
    plannedEnd: "2026-10-13 18:00",
    docsReady: 2,
    docsTotal: 4,
    notes: [],
    legs: [
      leg({ id: "L1", seq: 1, mode: "Road", origin: "Pune · Apex Plant", destination: "Nhava Sheva CFS", vendor: "TransLine Haulage", plannedDep: "2026-10-12 10:30", plannedArr: "2026-10-12 19:00", status: "Ready", tracking: {} }),
    ],
    milestones: [
      { id: "M1", name: "Pickup", legId: "L1", planned: "2026-10-12 10:30", status: "Due Soon", owner: "A. Sharma", customerVisible: true },
      { id: "M2", name: "Gate-In", legId: "L1", planned: "2026-10-13 11:00", status: "Upcoming", owner: "A. Sharma", customerVisible: true },
    ],
  },
  {
    id: "SPG-SHP-001208",
    customer: "Keystone Machinery",
    origin: "Nhava Sheva, India",
    destination: "Hamburg, Germany",
    nodeIds: ["nhava", "hamburg"],
    cargo: "CNC parts · 3 × 40ft",
    service: "Port to Port",
    owner: "A. Sharma",
    priority: "Normal",
    stage: "Gate-In",
    exception: false,
    eta: "24 Oct",
    created: "2026-10-04 15:00",
    plannedStart: "2026-10-11 08:00",
    plannedEnd: "2026-10-25 18:00",
    docsReady: 3,
    docsTotal: 5,
    notes: [],
    legs: [
      leg({ id: "L1", seq: 1, mode: "Ocean", origin: "Nhava Sheva", destination: "Hamburg", vendor: "Harbor Logistics", plannedDep: "2026-10-13 06:00", plannedArr: "2026-10-24 18:00", status: "Ready", tracking: { "Booking No.": "HLBK-3321" } }),
    ],
    milestones: [
      { id: "M1", name: "Gate-In", legId: "L1", planned: "2026-10-11 15:00", actual: "2026-10-11 11:12", status: "Completed", owner: "A. Sharma", customerVisible: true },
      { id: "M2", name: "Vessel Departed", legId: "L1", planned: "2026-10-13 06:00", status: "Upcoming", owner: "A. Sharma", customerVisible: true },
    ],
  },
  {
    id: "SPG-SHP-001173",
    customer: "Orbital Pharma",
    origin: "Jebel Ali, UAE",
    destination: "Houston, USA",
    nodeIds: ["dubai", "houston"],
    cargo: "Lab equipment · LCL",
    service: "Port to Port",
    owner: "S. Khan",
    priority: "Normal",
    stage: "Destination",
    exception: false,
    eta: "16 Oct",
    created: "2026-09-27 08:00",
    plannedStart: "2026-09-29 08:00",
    plannedEnd: "2026-10-17 18:00",
    docsReady: 5,
    docsTotal: 5,
    notes: [],
    legs: [
      leg({ id: "L1", seq: 1, mode: "Ocean", origin: "Jebel Ali", destination: "Houston", vendor: "Meridian Ocean Freight", plannedDep: "2026-09-29 08:00", plannedArr: "2026-10-16 08:00", actualDep: "2026-09-29 08:30", actualArr: "2026-10-12 06:00", status: "Completed", tracking: { "BL No.": "MOFBL77001" } }),
    ],
    milestones: [
      { id: "M1", name: "Destination Arrival", legId: "L1", planned: "2026-10-16 08:00", actual: "2026-10-12 06:00", status: "Completed", owner: "S. Khan", customerVisible: true },
      { id: "M2", name: "Customs", legId: "L1", planned: "2026-10-13 10:00", status: "Due Soon", owner: "K. Patel", customerVisible: false },
    ],
  },
];

export const SEED_EXCEPTIONS: ExceptionX[] = [
  {
    id: "EXC-301",
    type: "Port Hold",
    severity: "Critical",
    shipmentId: "SPG-SHP-001271",
    legId: "L1",
    description: "Hamburg berth window missed — vessel waiting at anchorage. Revised berthing awaited.",
    owner: "A. Sharma",
    opened: "2026-10-11 09:40",
    due: "2026-10-12 18:00",
    customerVisible: true,
    status: "In Progress",
  },
  {
    id: "EXC-298",
    type: "Document Missing",
    severity: "High",
    shipmentId: A,
    legId: "L3",
    description: "Customs declaration for US import not yet filed. Required before Houston arrival.",
    owner: "K. Patel",
    opened: "2026-10-10 16:20",
    due: "2026-10-15 12:00",
    customerVisible: false,
    status: "Assigned",
  },
  {
    id: "EXC-292",
    type: "Customs Hold",
    severity: "Medium",
    shipmentId: "SPG-SHP-001173",
    description: "Random inspection selected at Houston. Awaiting exam slot.",
    owner: "K. Patel",
    opened: "2026-10-12 08:10",
    due: "2026-10-14 18:00",
    customerVisible: true,
    status: "Open",
  },
];

export const SEED_EXEC_ACTIVITY: ExecActivity[] = [
  { id: "ea-1", shipmentId: A, time: "2026-10-12 12:42", by: "A. Sharma", action: "Milestone updated", summary: "Transshipment marked complete — departed Singapore on MV Coral Meridian." },
  { id: "ea-2", shipmentId: A, time: "2026-10-10 16:20", by: "K. Patel", action: "Exception reported", summary: "Customs declaration missing for US import (EXC-298)." },
  { id: "ea-3", shipmentId: A, time: "2026-10-08 07:15", by: "A. Sharma", action: "Actual departure recorded", summary: "Leg 2 vessel departed Nhava Sheva at 07:10." },
  { id: "ea-4", shipmentId: A, time: "2026-10-06 17:45", by: "A. Sharma", action: "Leg completed", summary: "Road leg Pune Factory → Nhava Sheva completed." },
  { id: "ea-5", shipmentId: A, time: "2026-09-30 11:40", by: "N. Verghese", action: "Shipment created", summary: "Master shipment created from booking SPG-BKG-000128." },
  { id: "ea-6", shipmentId: "SPG-SHP-001271", time: "2026-10-11 09:40", by: "A. Sharma", action: "Exception reported", summary: "Port hold at Hamburg (EXC-301)." },
];

export const OPS_FEED = [
  { time: "14:12", text: "SPG-SHP-001284 departed Singapore on MV Coral Meridian." },
  { time: "14:07", text: "SPG-SHP-001265 customs clearance completed at BOM." },
  { time: "13:58", text: "SPG-SHP-001271 marked delayed — Hamburg berth window missed." },
  { time: "13:46", text: "Vendor accepted pickup for SPG-SHP-001238." },
  { time: "13:33", text: "SPG-SHP-001173 arrived at Houston — 4 days early." },
  { time: "13:21", text: "Gate-in completed for SPG-SHP-001208 at Nhava Sheva." },
  { time: "13:05", text: "Rail slot confirmed for SPG-SHP-001202 at Rotterdam." },
  { time: "12:52", text: "Tracking reference MSCU1234567 refreshed from carrier feed." },
];

export const BOARD = {
  departures: [
    { time: "06:00 · 13 Oct", shipment: "SPG-SHP-001208", mode: "Ocean", location: "Nhava Sheva", customer: "Keystone Machinery", status: "Scheduled" },
    { time: "10:30 · Today", shipment: "SPG-SHP-001238", mode: "Road", location: "Pune", customer: "Apex Components", status: "On Time" },
    { time: "12:42 · Today", shipment: "SPG-SHP-001284", mode: "Ocean", location: "Singapore", customer: "Apex Components", status: "Completed" },
    { time: "08:00 · 20 Oct", shipment: "SPG-SHP-001202", mode: "Rail", location: "Rotterdam", customer: "Sahara Textiles", status: "Scheduled" },
  ],
  arrivals: [
    { time: "16:00 · Today", shipment: "SPG-SHP-001265", mode: "Road", location: "Pune DC", customer: "Orbital Pharma", status: "On Time" },
    { time: "19:30 · Today", shipment: "SPG-SHP-001271", mode: "Ocean", location: "Hamburg", customer: "BlueRock Chemicals", status: "Delayed" },
    { time: "22:00 · 17 Oct", shipment: "SPG-SHP-001284", mode: "Ocean", location: "Houston Port", customer: "Apex Components", status: "Scheduled" },
    { time: "06:00 · 12 Oct", shipment: "SPG-SHP-001173", mode: "Ocean", location: "Houston", customer: "Orbital Pharma", status: "Completed" },
  ],
};

export function nextShipmentId(ids: string[]) {
  const nums = ids.map((i) => parseInt(i.slice(-6), 10)).filter((n) => !Number.isNaN(n));
  return `SPG-SHP-${String(Math.max(0, ...nums) + 1).padStart(6, "0")}`;
}

export function nowExec() {
  return "2026-10-12 " + String(MOCK_NOW.getHours()).padStart(2, "0") + ":" + String(MOCK_NOW.getMinutes()).padStart(2, "0");
}
