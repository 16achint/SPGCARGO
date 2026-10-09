export type Role =
  | "operations"
  | "sales"
  | "documentation"
  | "finance"
  | "management"
  | "admin"
  | "customer"
  | "vendor";

export const ROLE_META: Record<
  Role,
  { label: string; home: string; nav: string[] }
> = {
  operations: { label: "Operations", home: "/app/overview", nav: ["overview", "commercial", "execution", "network", "intelligence"] },
  sales: { label: "Sales", home: "/app/overview", nav: ["overview", "commercial", "intelligence"] },
  documentation: { label: "Documentation", home: "/app/overview", nav: ["overview", "execution", "network"] },
  finance: { label: "Finance", home: "/app/overview", nav: ["overview", "commercial", "finance", "intelligence"] },
  management: { label: "Management", home: "/app/management", nav: ["overview", "commercial", "execution", "finance", "intelligence", "admin"] },
  admin: { label: "Admin", home: "/app/overview", nav: ["overview", "commercial", "execution", "finance", "intelligence", "admin", "network"] },
  customer: { label: "Customer", home: "/app/customer", nav: ["customer"] },
  vendor: { label: "Vendor", home: "/app/vendor", nav: ["vendor"] },
};

export type ShipmentStatus =
  | "Confirmed"
  | "Documentation"
  | "Pickup"
  | "Customs"
  | "Gate-in"
  | "In Transit"
  | "Transshipment"
  | "Destination"
  | "Delivery"
  | "Completed"
  | "Exception";

export type Mode = "Road" | "Sea" | "Air" | "Rail";

export interface Shipment {
  id: string;
  customer: string;
  route: string;
  nodeIds: string[];
  modes: Mode[];
  status: ShipmentStatus;
  eta: string;
  nextMilestone: string;
  owner: string;
  branch: string;
  days: string;
}

export const CUSTOMERS = [
  "Apex Components Pvt Ltd",
  "Meridian Auto Systems",
  "BlueRock Chemicals",
  "Titan Appliances",
  "Nordic Fashions",
  "Sahara Textiles",
  "Orbital Pharma",
  "Keystone Machinery",
];

export const VENDORS = [
  "TransLine Haulage",
  "Meridian Ocean Freight",
  "SkyPort Air Cargo",
  "RailBridge ICD",
  "Gulf Gate Customs",
  "PortServe Terminals",
  "ColdChain Reefer",
  "Atlas Breakbulk",
  "Delta Docs LLP",
  "Harbor Logistics",
];

export const BRANCHES = ["Mumbai HQ", "Pune", "Singapore", "Houston"];

export const SHIPMENTS: Shipment[] = [
  { id: "SPG-SHP-001284", customer: "Apex Components Pvt Ltd", route: "Pune → Houston", nodeIds: ["pune", "nhava", "singapore", "houston"], modes: ["Road", "Sea", "Sea", "Road"], status: "In Transit", eta: "18 Oct", nextMilestone: "Houston Arrival", owner: "A. Sharma", branch: "Mumbai HQ", days: "12d ago" },
  { id: "SPG-SHP-001279", customer: "Meridian Auto Systems", route: "Shanghai → Rotterdam", nodeIds: ["shanghai", "rotterdam"], modes: ["Sea"], status: "In Transit", eta: "12 Oct", nextMilestone: "Rotterdam Berth", owner: "R. Iyer", branch: "Mumbai HQ", days: "9d ago" },
  { id: "SPG-SHP-001271", customer: "BlueRock Chemicals", route: "Hamburg → Nhava Sheva", nodeIds: ["hamburg", "nhava"], modes: ["Sea"], status: "Exception", eta: "—", nextMilestone: "Berth Delay", owner: "A. Sharma", branch: "Mumbai HQ", days: "14d ago" },
  { id: "SPG-SHP-001265", customer: "Orbital Pharma", route: "New York → Pune", nodeIds: ["ny", "pune"], modes: ["Air", "Road"], status: "In Transit", eta: "22 Oct", nextMilestone: "Pune Warehouse In", owner: "K. Patel", branch: "Pune", days: "3d ago" },
  { id: "SPG-SHP-001258", customer: "Titan Appliances", route: "Busan → Los Angeles", nodeIds: ["busan", "la"], modes: ["Sea"], status: "Destination", eta: "09 Oct", nextMilestone: "Customs Clearance", owner: "R. Iyer", branch: "Houston", days: "18d ago" },
  { id: "SPG-SHP-001252", customer: "Nordic Fashions", route: "Jebel Ali → Rotterdam", nodeIds: ["dubai", "rotterdam"], modes: ["Sea", "Road"], status: "In Transit", eta: "15 Oct", nextMilestone: "Port Discharge", owner: "S. Khan", branch: "Mumbai HQ", days: "8d ago" },
  { id: "SPG-SHP-001246", customer: "Sahara Textiles", route: "Singapore → Santos", nodeIds: ["singapore", "santos"], modes: ["Sea"], status: "Customs", eta: "21 Oct", nextMilestone: "Santos Clearance", owner: "K. Patel", branch: "Singapore", days: "11d ago" },
  { id: "SPG-SHP-001240", customer: "Keystone Machinery", route: "Nhava Sheva → Jebel Ali", nodeIds: ["nhava", "dubai"], modes: ["Sea"], status: "Transshipment", eta: "17 Oct", nextMilestone: "Djibouti Transfer", owner: "S. Khan", branch: "Mumbai HQ", days: "13d ago" },
  { id: "SPG-SHP-001238", customer: "Apex Components Pvt Ltd", route: "Pune → Nhava Sheva", nodeIds: ["pune", "nhava"], modes: ["Road"], status: "Pickup", eta: "11 Oct", nextMilestone: "Factory Pickup", owner: "A. Sharma", branch: "Pune", days: "1d ago" },
  { id: "SPG-SHP-001233", customer: "Meridian Auto Systems", route: "Rotterdam → New York", nodeIds: ["rotterdam", "ny"], modes: ["Sea"], status: "Documentation", eta: "26 Oct", nextMilestone: "BL Issuance", owner: "R. Iyer", branch: "Mumbai HQ", days: "4d ago" },
  { id: "SPG-SHP-001229", customer: "BlueRock Chemicals", route: "Pune → Jebel Ali", nodeIds: ["pune", "dubai"], modes: ["Road", "Sea"], status: "Confirmed", eta: "29 Oct", nextMilestone: "Rate Confirmation", owner: "S. Khan", branch: "Mumbai HQ", days: "2d ago" },
  { id: "SPG-SHP-001224", customer: "Orbital Pharma", route: "Houston → Nhava Sheva", nodeIds: ["houston", "nhava"], modes: ["Sea"], status: "Exception", eta: "—", nextMilestone: "Customs Hold", owner: "K. Patel", branch: "Houston", days: "16d ago" },
  { id: "SPG-SHP-001219", customer: "Titan Appliances", route: "Shanghai → Singapore", nodeIds: ["shanghai", "singapore"], modes: ["Sea"], status: "In Transit", eta: "14 Oct", nextMilestone: "Singapore Arrival", owner: "R. Iyer", branch: "Singapore", days: "7d ago" },
  { id: "SPG-SHP-001214", customer: "Nordic Fashions", route: "Pune → New York", nodeIds: ["pune", "ny"], modes: ["Air"], status: "In Transit", eta: "13 Oct", nextMilestone: "NYC Delivery", owner: "K. Patel", branch: "Pune", days: "5d ago" },
  { id: "SPG-SHP-001208", customer: "Keystone Machinery", route: "Nhava Sheva → Hamburg", nodeIds: ["nhava", "hamburg"], modes: ["Sea"], status: "Gate-in", eta: "24 Oct", nextMilestone: "CFS Gate-in", owner: "A. Sharma", branch: "Mumbai HQ", days: "6d ago" },
  { id: "SPG-SHP-001202", customer: "Sahara Textiles", route: "Singapore → Rotterdam", nodeIds: ["singapore", "rotterdam"], modes: ["Sea", "Rail"], status: "In Transit", eta: "20 Oct", nextMilestone: "Rail Rake Load", owner: "S. Khan", branch: "Singapore", days: "10d ago" },
  { id: "SPG-SHP-001196", customer: "Meridian Auto Systems", route: "Pune → Jebel Ali", nodeIds: ["pune", "dubai"], modes: ["Road", "Sea"], status: "Documentation", eta: "27 Oct", nextMilestone: "Customs Filing", owner: "A. Sharma", branch: "Pune", days: "3d ago" },
  { id: "SPG-SHP-001188", customer: "BlueRock Chemicals", route: "Los Angeles → Nhava Sheva", nodeIds: ["la", "nhava"], modes: ["Sea"], status: "In Transit", eta: "23 Oct", nextMilestone: "Mumbai Berth", owner: "R. Iyer", branch: "Mumbai HQ", days: "12d ago" },
  { id: "SPG-SHP-001180", customer: "Titan Appliances", route: "Pune → Nhava Sheva", nodeIds: ["pune", "nhava"], modes: ["Road"], status: "Pickup", eta: "12 Oct", nextMilestone: "Container Load", owner: "K. Patel", branch: "Pune", days: "1d ago" },
  { id: "SPG-SHP-001173", customer: "Orbital Pharma", route: "Jebel Ali → Houston", nodeIds: ["dubai", "houston"], modes: ["Sea"], status: "In Transit", eta: "16 Oct", nextMilestone: "Houston Discharge", owner: "S. Khan", branch: "Houston", days: "15d ago" },
];

export const FLAGSHIP_ID = "SPG-SHP-001284";

export type DocState = "Verified" | "Pending Review" | "Missing";

export const DOCUMENTS: { id: string; name: string; shipment: string; state: DocState }[] = [
  { id: "DOC-2210", name: "Commercial Invoice", shipment: FLAGSHIP_ID, state: "Verified" },
  { id: "DOC-2211", name: "Packing List", shipment: FLAGSHIP_ID, state: "Verified" },
  { id: "DOC-2212", name: "Bill of Lading", shipment: FLAGSHIP_ID, state: "Verified" },
  { id: "DOC-2213", name: "Certificate of Origin", shipment: FLAGSHIP_ID, state: "Pending Review" },
  { id: "DOC-2214", name: "Customs Declaration", shipment: FLAGSHIP_ID, state: "Missing" },
  { id: "DOC-2215", name: "Insurance Certificate", shipment: FLAGSHIP_ID, state: "Verified" },
  { id: "DOC-2198", name: "Bill of Lading", shipment: "SPG-SHP-001279", state: "Verified" },
  { id: "DOC-2199", name: "Commercial Invoice", shipment: "SPG-SHP-001279", state: "Verified" },
  { id: "DOC-2200", name: "Fumigation Certificate", shipment: "SPG-SHP-001279", state: "Pending Review" },
  { id: "DOC-2186", name: "Customs Declaration", shipment: "SPG-SHP-001271", state: "Missing" },
  { id: "DOC-2187", name: "Dangerous Goods Declaration", shipment: "SPG-SHP-001271", state: "Verified" },
  { id: "DOC-2188", name: "Bill of Lading", shipment: "SPG-SHP-001271", state: "Verified" },
  { id: "DOC-2172", name: "Airway Bill", shipment: "SPG-SHP-001265", state: "Verified" },
  { id: "DOC-2173", name: "Temperature Log", shipment: "SPG-SHP-001265", state: "Pending Review" },
  { id: "DOC-2174", name: "DS-2000", shipment: "SPG-SHP-001265", state: "Missing" },
  { id: "DOC-2160", name: "Commercial Invoice", shipment: "SPG-SHP-001258", state: "Verified" },
  { id: "DOC-2161", name: "ISF Filing", shipment: "SPG-SHP-001258", state: "Pending Review" },
  { id: "DOC-2150", name: "Bill of Lading", shipment: "SPG-SHP-001252", state: "Verified" },
  { id: "DOC-2151", name: "Packing List", shipment: "SPG-SHP-001252", state: "Verified" },
  { id: "DOC-2140", name: "Customs Filing", shipment: "SPG-SHP-001246", state: "Pending Review" },
  { id: "DOC-2141", name: "COO", shipment: "SPG-SHP-001246", state: "Verified" },
  { id: "DOC-2130", name: "House BL", shipment: "SPG-SHP-001240", state: "Verified" },
  { id: "DOC-2131", name: "Transit Document", shipment: "SPG-SHP-001240", state: "Missing" },
  { id: "DOC-2120", name: "Rate Confirmation", shipment: "SPG-SHP-001238", state: "Verified" },
  { id: "DOC-2121", name: "Commercial Invoice", shipment: "SPG-SHP-001238", state: "Pending Review" },
  { id: "DOC-2110", name: "Booking Confirmation", shipment: "SPG-SHP-001233", state: "Verified" },
  { id: "DOC-2111", name: "Insurance Certificate", shipment: "SPG-SHP-001233", state: "Missing" },
  { id: "DOC-2100", name: "Packing List", shipment: "SPG-SHP-001224", state: "Verified" },
  { id: "DOC-2101", name: "Customs Bond", shipment: "SPG-SHP-001224", state: "Pending Review" },
  { id: "DOC-2090", name: "Bill of Lading", shipment: "SPG-SHP-001219", state: "Verified" },
];

export const INVOICES: {
  id: string;
  customer: string;
  amount: string;
  due: string;
  status: "Paid" | "Due" | "Overdue";
}[] = [
  { id: "INV-1042", customer: "Apex Components Pvt Ltd", amount: "₹4,20,000", due: "25 Oct", status: "Due" },
  { id: "INV-1041", customer: "Meridian Auto Systems", amount: "₹11,85,000", due: "20 Oct", status: "Due" },
  { id: "INV-1039", customer: "Titan Appliances", amount: "₹6,40,000", due: "10 Oct", status: "Overdue" },
  { id: "INV-1038", customer: "Orbital Pharma", amount: "₹2,30,000", due: "18 Oct", status: "Due" },
  { id: "INV-1035", customer: "BlueRock Chemicals", amount: "₹8,12,000", due: "02 Oct", status: "Overdue" },
  { id: "INV-1033", customer: "Nordic Fashions", amount: "₹3,95,000", due: "15 Oct", status: "Paid" },
  { id: "INV-1031", customer: "Sahara Textiles", amount: "₹5,60,000", due: "08 Oct", status: "Paid" },
  { id: "INV-1029", customer: "Keystone Machinery", amount: "₹14,20,000", due: "30 Oct", status: "Due" },
  { id: "INV-1026", customer: "Meridian Auto Systems", amount: "₹7,45,000", due: "01 Oct", status: "Paid" },
  { id: "INV-1024", customer: "Apex Components Pvt Ltd", amount: "₹3,15,000", due: "28 Sep", status: "Paid" },
];

export const RFQS: {
  id: string;
  customer: string;
  lane: string;
  mode: Mode;
  status: "New" | "In Review" | "Quoted" | "Closed";
  age: string;
}[] = [
  { id: "RFQ-3310", customer: "Apex Components Pvt Ltd", lane: "Pune → Houston", mode: "Sea", status: "New", age: "2h" },
  { id: "RFQ-3309", customer: "Meridian Auto Systems", lane: "Shanghai → Rotterdam", mode: "Sea", status: "In Review", age: "6h" },
  { id: "RFQ-3305", customer: "Orbital Pharma", lane: "Pune → New York", mode: "Air", status: "New", age: "1d" },
  { id: "RFQ-3301", customer: "BlueRock Chemicals", lane: "Jebel Ali → Nhava Sheva", mode: "Sea", status: "Quoted", age: "2d" },
  { id: "RFQ-3297", customer: "Titan Appliances", lane: "Pune → Jebel Ali", mode: "Sea", status: "Quoted", age: "3d" },
  { id: "RFQ-3292", customer: "Nordic Fashions", lane: "Singapore → Rotterdam", mode: "Sea", status: "In Review", age: "4d" },
  { id: "RFQ-3288", customer: "Sahara Textiles", lane: "Pune → Santos", mode: "Sea", status: "New", age: "5d" },
  { id: "RFQ-3284", customer: "Keystone Machinery", lane: "Nhava Sheva → Hamburg", mode: "Sea", status: "Closed", age: "6d" },
  { id: "RFQ-3280", customer: "Meridian Auto Systems", lane: "Pune → Jebel Ali", mode: "Road", status: "Quoted", age: "7d" },
  { id: "RFQ-3275", customer: "Orbital Pharma", lane: "Houston → Nhava Sheva", mode: "Sea", status: "Closed", age: "8d" },
  { id: "RFQ-3271", customer: "BlueRock Chemicals", lane: "Pune → Jebel Ali", mode: "Air", status: "In Review", age: "9d" },
  { id: "RFQ-3266", customer: "Titan Appliances", lane: "Busan → Los Angeles", mode: "Sea", status: "Closed", age: "10d" },
];

export const QUOTES: {
  id: string;
  customer: string;
  lane: string;
  amount: string;
  status: "Draft" | "In Review" | "Awaiting Customer" | "Accepted" | "Expiring";
  valid: string;
}[] = [
  { id: "Q-7781", customer: "Apex Components Pvt Ltd", lane: "Pune → Houston", amount: "₹4,20,000", status: "Awaiting Customer", valid: "14 Oct" },
  { id: "Q-7779", customer: "Meridian Auto Systems", lane: "Shanghai → Rotterdam", amount: "₹11,85,000", status: "In Review", valid: "16 Oct" },
  { id: "Q-7775", customer: "Orbital Pharma", lane: "Pune → New York", amount: "₹2,30,000", status: "Expiring", valid: "11 Oct" },
  { id: "Q-7770", customer: "BlueRock Chemicals", lane: "Jebel Ali → Nhava Sheva", amount: "₹8,12,000", status: "Accepted", valid: "20 Oct" },
  { id: "Q-7766", customer: "Titan Appliances", lane: "Pune → Jebel Ali", amount: "₹6,40,000", status: "Awaiting Customer", valid: "13 Oct" },
  { id: "Q-7761", customer: "Nordic Fashions", lane: "Singapore → Rotterdam", amount: "₹3,95,000", status: "Draft", valid: "18 Oct" },
  { id: "Q-7758", customer: "Sahara Textiles", lane: "Pune → Santos", amount: "₹5,60,000", status: "In Review", valid: "19 Oct" },
  { id: "Q-7752", customer: "Keystone Machinery", lane: "Nhava Sheva → Hamburg", amount: "₹14,20,000", status: "Accepted", valid: "22 Oct" },
  { id: "Q-7749", customer: "Meridian Auto Systems", lane: "Pune → Jebel Ali", amount: "₹7,45,000", status: "Expiring", valid: "12 Oct" },
  { id: "Q-7744", customer: "Apex Components Pvt Ltd", lane: "Pune → Jebel Ali", amount: "₹3,15,000", status: "Draft", valid: "21 Oct" },
];

export const JOB_REQUESTS: {
  id: string;
  shipment: string;
  pickup: string;
  destination: string;
  date: string;
  cargo: string;
  status: "New" | "Accepted" | "In Progress" | "Completed";
}[] = [
  { id: "J-512", shipment: "SPG-SHP-001238", pickup: "Pune · Apex Plant", destination: "Nhava Sheva CFS", date: "Today · 10:30", cargo: "2 × 40ft HC", status: "New" },
  { id: "J-511", shipment: "SPG-SHP-001180", pickup: "Pune · Titan DC", destination: "Nhava Sheva Gate 4", date: "Tomorrow · 09:00", cargo: "4 × 20ft", status: "New" },
  { id: "J-509", shipment: "SPG-SHP-001229", pickup: "Mumbai · CFS East", destination: "Jebel Ali Port", date: "15 Oct", cargo: "1 × 40ft RF", status: "Accepted" },
  { id: "J-506", shipment: "SPG-SHP-001284", pickup: "Nhava Sheva CFS", destination: "Customer DC · Thane", date: "19 Oct", cargo: "2 × 40ft HC", status: "In Progress" },
  { id: "J-498", shipment: "SPG-SHP-001202", pickup: "ICD Mundha", destination: "Nhava Sheva Yard", date: "13 Oct", cargo: "6 × 20ft", status: "In Progress" },
  { id: "J-492", shipment: "SPG-SHP-001208", pickup: "Pune · Factory 2", destination: "ICD Tulsihall", date: "09 Oct", cargo: "3 × 40ft", status: "Completed" },
];

export type Severity = "critical" | "warning" | "info";

export const ATTENTION: {
  id: string;
  severity: Severity;
  title: string;
  entity: string;
  reason: string;
  due: string;
  owner: string;
}[] = [
  { id: "at-1", severity: "critical", title: "Shipment delayed by 8 hours", entity: "SPG-SHP-001271", reason: "Hamburg berth window missed", due: "2h overdue", owner: "A. Sharma" },
  { id: "at-2", severity: "critical", title: "Customs clearance pending", entity: "SPG-SHP-001224", reason: "US customs hold — bond required", due: "Due today", owner: "K. Patel" },
  { id: "at-3", severity: "warning", title: "Commercial invoice missing", entity: "SPG-SHP-001238", reason: "Blocking gate-in paperwork", due: "Due in 3h", owner: "Docs Team" },
  { id: "at-4", severity: "warning", title: "Pickup due within 90 minutes", entity: "SPG-SHP-001238", reason: "Pune factory · 10:30 slot", due: "1h 15m", owner: "TransLine Haulage" },
  { id: "at-5", severity: "warning", title: "POD overdue", entity: "SPG-SHP-001258", reason: "LA delivery completed, POD not uploaded", due: "1d overdue", owner: "Vendor" },
  { id: "at-6", severity: "info", title: "Quote approval pending", entity: "Q-7781", reason: "Awaiting customer decision", due: "Expires 14 Oct", owner: "Sales" },
  { id: "at-7", severity: "info", title: "Transshipment transfer scheduled", entity: "SPG-SHP-001240", reason: "Djibouti vessel change", due: "Tomorrow", owner: "Ops" },
];

export const MILESTONES: {
  time: string;
  day: "Today" | "Tomorrow";
  label: string;
  shipment: string;
  state: "on-schedule" | "due-soon" | "delayed" | "completed";
}[] = [
  { time: "09:15", day: "Today", label: "Factory Pickup", shipment: "SPG-SHP-001238", state: "due-soon" },
  { time: "10:30", day: "Today", label: "Customs Filing", shipment: "SPG-SHP-001296", state: "on-schedule" },
  { time: "12:45", day: "Today", label: "Vessel Departure", shipment: FLAGSHIP_ID, state: "on-schedule" },
  { time: "15:10", day: "Today", label: "CFS Gate-in", shipment: "SPG-SHP-001208", state: "on-schedule" },
  { time: "18:30", day: "Today", label: "Berth Assignment", shipment: "SPG-SHP-001271", state: "delayed" },
  { time: "09:00", day: "Tomorrow", label: "Destination Arrival", shipment: "SPG-SHP-001278", state: "on-schedule" },
  { time: "11:20", day: "Tomorrow", label: "Customs Clearance", shipment: "SPG-SHP-001246", state: "on-schedule" },
  { time: "16:00", day: "Tomorrow", label: "Last-mile Handoff", shipment: "SPG-SHP-001114", state: "completed" },
];

export const ACTIVITY: {
  time: string;
  text: string;
  shipment: string;
  icon: "ship" | "doc" | "delay" | "customs" | "vendor" | "milestone";
}[] = [
  { time: "12:42", text: "Shipment departed Singapore — vessel MV Northern Star", shipment: FLAGSHIP_ID, icon: "ship" },
  { time: "12:36", text: "POD uploaded and verified", shipment: "SPG-SHP-001240", icon: "doc" },
  { time: "12:31", text: "Shipment marked delayed — berth window missed", shipment: "SPG-SHP-001271", icon: "delay" },
  { time: "12:12", text: "Customs clearance completed", shipment: "SPG-SHP-001287", icon: "customs" },
  { time: "11:58", text: "Vendor accepted pickup request J-512", shipment: "SPG-SHP-001238", icon: "vendor" },
  { time: "11:40", text: "Bill of Lading issued by carrier", shipment: "SPG-SHP-001279", icon: "doc" },
  { time: "11:12", text: "Container gate-in at CFS East", shipment: "SPG-SHP-001208", icon: "milestone" },
  { time: "10:55", text: "Rate confirmed with Meridian Ocean Freight", shipment: "SPG-SHP-001229", icon: "vendor" },
  { time: "10:31", text: "DS-2000 filed for US import", shipment: "SPG-SHP-001265", icon: "customs" },
  { time: "10:04", text: "Shipment status moved to In Transit", shipment: "SPG-SHP-001219", icon: "milestone" },
  { time: "09:47", text: "Reefer temperature log attached", shipment: "SPG-SHP-001265", icon: "doc" },
  { time: "09:20", text: "Transshipment schedule updated", shipment: "SPG-SHP-001240", icon: "ship" },
];

export type NotifType =
  | "delayed"
  | "document"
  | "quote"
  | "pickup"
  | "customs"
  | "arrival"
  | "pod"
  | "invoice";

export type AppNotification = {
  id: string;
  type: NotifType;
  title: string;
  record: string;
  desc: string;
  time: string;
  unread: boolean;
  href?: string;
};

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n-24", type: "delayed", title: "Shipment delayed", record: "SPG-SHP-001271", desc: "Hamburg berth delayed by 8 hours. New ETA being revised.", time: "12 min ago", unread: true },
  { id: "n-23", type: "pickup", title: "Pickup due soon", record: "SPG-SHP-001238", desc: "Factory pickup window opens in 90 minutes.", time: "26 min ago", unread: true },
  { id: "n-22", type: "document", title: "Document missing", record: "SPG-SHP-001238", desc: "Commercial invoice is required before gate-in.", time: "1h ago", unread: true },
  { id: "n-21", type: "customs", title: "Customs hold", record: "SPG-SHP-001224", desc: "US customs hold — bond amount required to release.", time: "2h ago", unread: true },
  { id: "n-20", type: "quote", title: "Quote awaiting approval", record: "SPG-QUO-000118", desc: "Orbital Pharma air quote needs internal review.", time: "3h ago", unread: true, href: "/app/quotes/SPG-QUO-000118/approval" },
  { id: "n-19", type: "invoice", title: "Invoice overdue", record: "INV-1039", desc: "₹6,40,000 invoice to Titan Appliances is 9 days overdue.", time: "5h ago", unread: true },
  { id: "n-18", type: "pod", title: "POD pending", record: "SPG-SHP-001258", desc: "Delivery completed at LA. Waiting for vendor POD upload.", time: "6h ago", unread: true },
  { id: "n-17", type: "arrival", title: "Destination reached", record: "SPG-SHP-001219", desc: "Container discharged at Singapore — next leg rail.", time: "8h ago", unread: false },
  { id: "n-16", type: "document", title: "COO pending review", record: FLAGSHIP_ID, desc: "Certificate of Origin submitted, needs verification.", time: "1d ago", unread: false },
  { id: "n-15", type: "delayed", title: "Vessel schedule change", record: "SPG-SHP-001240", desc: "Djibouti transshipment vessel changed — 6h later.", time: "1d ago", unread: false },
  { id: "n-14", type: "customs", title: "Clearance completed", record: "SPG-SHP-001287", desc: "Santos customs clearance completed in 41 hours.", time: "1d ago", unread: false },
  { id: "n-13", type: "quote", title: "New RFQ received", record: "RFQ-3310", desc: "Apex Components requested Pune → Houston sea rate.", time: "2d ago", unread: false },
  { id: "n-12", type: "invoice", title: "Invoice paid", record: "INV-1033", desc: "Nordic Fashions settled ₹3,95,000.", time: "2d ago", unread: false },
  { id: "n-11", type: "pod", title: "POD verified", record: "SPG-SHP-001240", desc: "Proof of delivery uploaded and matched.", time: "2d ago", unread: false },
  { id: "n-10", type: "pickup", title: "Pickup completed", record: "SPG-SHP-001180", desc: "4 containers loaded at Titan DC, Pune.", time: "3d ago", unread: false },
  { id: "n-09", type: "document", title: "Insurance cert missing", record: "SPG-SHP-001233", desc: "Required before booking confirmation with carrier.", time: "3d ago", unread: false },
  { id: "n-08", type: "arrival", title: "Gate-in completed", record: "SPG-SHP-001208", desc: "Container checked in at CFS East, Nhava Sheva.", time: "4d ago", unread: false },
  { id: "n-07", type: "quote", title: "Quote accepted", record: "Q-7770", desc: "BlueRock Chemicals accepted ₹8,12,000 quote.", time: "4d ago", unread: false },
  { id: "n-06", type: "delayed", title: "Reefer reefer alarm cleared", record: "SPG-SHP-001265", desc: "Temperature excursion resolved by carrier.", time: "5d ago", unread: false },
  { id: "n-05", type: "invoice", title: "Invoice issued", record: "INV-1042", desc: "₹4,20,000 issued to Apex Components.", time: "5d ago", unread: false },
  { id: "n-04", type: "customs", title: "Filing submitted", record: "SPG-SHP-001296", desc: "Import filing submitted for assessment.", time: "6d ago", unread: false },
  { id: "n-03", type: "document", title: "BL verified", record: "SPG-SHP-001279", desc: "Master BL verified against booking.", time: "6d ago", unread: false },
  { id: "n-02", type: "pod", title: "Last-mile scheduled", record: FLAGSHIP_ID, desc: "Thane DC delivery planned for 19 Oct, 09:00.", time: "6d ago", unread: false },
  { id: "n-01", type: "arrival", title: "Shipment created", record: FLAGSHIP_ID, desc: "Pune → Houston multimodal job opened.", time: "12d ago", unread: false },
];

export const FUNNEL = [
  { label: "Enquiries", value: 142 },
  { label: "Quotes", value: 86 },
  { label: "Bookings", value: 54 },
];

export const MODE_MIX = [
  { label: "Ocean", value: 46, icon: "sea" },
  { label: "Road", value: 31, icon: "road" },
  { label: "Air", value: 12, icon: "air" },
  { label: "Rail", value: 11, icon: "rail" },
];

export const DOC_HEALTH = [
  { label: "Complete", value: 68, tone: "ok" },
  { label: "Pending", value: 24, tone: "warn" },
  { label: "Missing", value: 8, tone: "bad" },
];

export const CUSTOMS_STATUS = [
  { label: "Not Started", value: 12 },
  { label: "Filed", value: 9 },
  { label: "Assessment", value: 6 },
  { label: "Cleared", value: 4 },
];

export const TOP_CUSTOMERS = [
  { name: "Apex Components Pvt Ltd", revenue: "₹48.2L", delta: "+12%" },
  { name: "Meridian Auto Systems", revenue: "₹36.9L", delta: "+8%" },
  { name: "Keystone Machinery", revenue: "₹29.4L", delta: "+21%" },
  { name: "BlueRock Chemicals", revenue: "₹22.1L", delta: "-4%" },
  { name: "Orbital Pharma", revenue: "₹18.6L", delta: "+6%" },
];

export const TOP_ROUTES = [
  { lane: "Pune → Houston", volume: 24, onTime: "96%" },
  { lane: "Shanghai → Rotterdam", volume: 19, onTime: "91%" },
  { lane: "Jebel Ali → Nhava Sheva", volume: 17, onTime: "98%" },
  { lane: "Pune → Jebel Ali", volume: 15, onTime: "94%" },
  { lane: "Singapore → Rotterdam", volume: 12, onTime: "89%" },
];

export const EXCEPTION_TREND = [3, 5, 2, 4, 6, 4, 7];

export const DEMO_USER = {
  name: "Marco Reyes",
  email: "marco.r@example.org",
  branch: "Mumbai HQ",
};

export const ROLE_USERS: Record<Role, { name: string; email: string; branch: string; org: string }> = {
  operations: { ...DEMO_USER, org: "SPG Logistics" },
  sales: { name: "Nisha Verghese", email: "nisha.v@spgcargoos.com", branch: "Mumbai HQ", org: "SPG Logistics" },
  documentation: { name: "Rohan Bhatt", email: "rohan.b@spgcargoos.com", branch: "Mumbai HQ", org: "SPG Logistics" },
  finance: { name: "Ananya Rao", email: "ananya.r@spgcargoos.com", branch: "Mumbai HQ", org: "SPG Logistics" },
  management: { name: "Vikram Singh", email: "vikram.s@spgcargoos.com", branch: "Corporate", org: "SPG Logistics" },
  admin: { name: "Meera Kulkarni", email: "meera.k@spgcargoos.com", branch: "Corporate", org: "SPG Logistics" },
  customer: { name: "Priya Nair", email: "priya.nair@apexcomponents.com", branch: "Pune", org: "Apex Components Pvt Ltd" },
  vendor: { name: "Sanjay Verma", email: "sanjay@translinehaulage.com", branch: "Pune", org: "TransLine Haulage" },
};
