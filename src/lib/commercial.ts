export type CustomerStatus = "Active" | "On Hold" | "Prospect" | "Inactive";
export type CustomerCategory = "OEM" | "Trader" | "Manufacturer" | "Distributor" | "3PL";
export type ContactType = "Primary" | "Commercial" | "Operations" | "Finance" | "Other";

export interface Contact {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  type: ContactType;
  primary: boolean;
}

export interface KycDoc {
  name: string;
  file?: string;
}

export interface Customer {
  id: string;
  company: string;
  category: CustomerCategory;
  address: string;
  city: string;
  state: string;
  country: string;
  postal: string;
  website?: string;
  industry?: string;
  gstin: string;
  pan: string;
  iec: string;
  contacts: Contact[];
  billingAddress: string;
  creditTerms: string;
  creditDays: number;
  currency: string;
  paymentTerms: string;
  owner: string;
  creditLimit?: number;
  kyc: KycDoc[];
  status: CustomerStatus;
  outstanding: number;
  ytdRevenue: number;
  margin: number;
}

export type RfqStatus =
  | "New"
  | "Qualified"
  | "Rate Sourcing"
  | "Quote Preparation"
  | "Quote Sent"
  | "Awaiting Customer"
  | "Won"
  | "Lost";

export type ModeChoice = "Recommend" | "Ocean" | "Air" | "Road" | "Rail" | "Multimodal";
export type ServiceType = "P2P" | "D2P" | "P2D" | "D2D";

export interface Cargo {
  commodity: string;
  description: string;
  packages: number;
  packageType: string;
  weight: number;
  weightUnit: "KG" | "MT";
  volume: number;
  volumeUnit: "CBM";
  dims?: string;
  value: number;
  currency: string;
  containerType?: string;
  hazardous: boolean;
  unNumber?: string;
  hazardClass?: string;
  packingGroup?: string;
  hazInstructions?: string;
  tempControlled: boolean;
  tempMin?: number;
  tempMax?: number;
  tempUnit?: "C" | "F";
  tempInstructions?: string;
}

export interface Rfq {
  id: string;
  customerId: string;
  customerRef?: string;
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string;
  cargo: Cargo;
  mode: ModeChoice;
  service: ServiceType;
  ocean?: { type: "FCL" | "LCL"; container?: string; reefer?: boolean; breakbulk?: boolean; odc?: boolean };
  air?: { priority: "Priority" | "Standard"; handling?: string };
  road?: { type: "FTL" | "PTL"; mile?: "First Mile" | "Last Mile" | "Both"; vehicle?: string };
  rail?: { type: "Container" | "ICD" | "Port Movement" };
  insurance: boolean;
  customs: boolean;
  warehouse: boolean;
  pickup: boolean;
  delivery: boolean;
  special?: string;
  internalNotes?: string;
  status: RfqStatus;
  owner: string;
  created: string;
}

export type ChargeGroup =
  | "Freight"
  | "Origin"
  | "Transport"
  | "Customs"
  | "Documentation"
  | "Handling"
  | "Port"
  | "Warehouse"
  | "Destination"
  | "Insurance"
  | "Taxes"
  | "Other";

export type RateStatus = "Active" | "Expiring Soon" | "Expired";

export interface Rate {
  id: string;
  vendor: string;
  origin: string;
  destination: string;
  mode: string;
  group: ChargeGroup;
  charge: string;
  currency: string;
  amount: number;
  validFrom: string;
  validTo: string;
  transitDays?: number;
  status: RateStatus;
  notes?: string;
}

export type QuoteStatus =
  | "Draft"
  | "Awaiting Approval"
  | "Approved"
  | "Rejected"
  | "Changes Requested"
  | "Sent"
  | "Awaiting Customer"
  | "Accepted"
  | "Rejected by Customer"
  | "Expired";

export interface QuoteCharge {
  id: string;
  group: ChargeGroup;
  vendor: string;
  cost: number;
  marginType: "pct" | "fixed";
  margin: number;
  currency: string;
  rateId?: string;
}

export interface QuoteOption {
  id: string;
  name: string;
  tag: string;
  mode: string;
  transitDays: number;
  charges: QuoteCharge[];
}

export interface QuoteVersion {
  version: number;
  created: string;
  by: string;
  status: QuoteStatus;
}

export interface Quote {
  id: string;
  version: number;
  rfqId: string;
  customerId: string;
  options: QuoteOption[];
  validUntil: string;
  status: QuoteStatus;
  owner: string;
  created: string;
  approvedBy?: string;
  acceptedOptionId?: string;
  rejectReason?: string;
  rejectComment?: string;
  changeComment?: string;
  locked: boolean;
  versions: QuoteVersion[];
}

export type BookingStatus = "Pending Confirmation" | "Confirmed" | "Ready for Operations" | "Cancelled";

export interface Booking {
  id: string;
  quoteId: string;
  optionId: string;
  customerId: string;
  rfqId: string;
  confirmationDate: string;
  opsOwner: string;
  carrierRef?: string;
  plannedPickup?: string;
  plannedDeparture?: string;
  plannedArrival?: string;
  notes?: string;
  status: BookingStatus;
  bookingRef?: string;
}

export interface TimelineItem {
  id: string;
  entityType: "customer" | "rfq" | "quote" | "booking";
  entityId: string;
  time: string;
  text: string;
  by: string;
}

export interface CommNote {
  id: string;
  rfqId: string;
  time: string;
  by: string;
  text: string;
  visibility: "internal" | "customer";
}

export const LOCATIONS = [
  "Pune, India",
  "Nhava Sheva, India",
  "Mumbai, India",
  "ICD Tumb, India",
  "Singapore",
  "Houston, USA",
  "Shanghai, China",
  "Rotterdam, Netherlands",
  "Hamburg, Germany",
  "Jebel Ali, UAE",
  "Los Angeles, USA",
  "New York, USA",
  "Busan, South Korea",
  "Santos, Brazil",
  "Dallas, USA",
];

export const CHARGE_GROUPS: ChargeGroup[] = [
  "Freight",
  "Origin",
  "Transport",
  "Customs",
  "Documentation",
  "Handling",
  "Port",
  "Warehouse",
  "Destination",
  "Insurance",
  "Taxes",
  "Other",
];

export const OWNERS = ["A. Sharma", "N. Verghese", "R. Iyer", "S. Khan", "K. Patel"];

export function inr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function sellingOf(c: QuoteCharge) {
  return c.marginType === "pct" ? c.cost * (1 + c.margin / 100) : c.cost + c.margin;
}

export function optionTotals(opt: QuoteOption) {
  const cost = opt.charges.reduce((a, c) => a + c.cost, 0);
  const selling = opt.charges.reduce((a, c) => a + sellingOf(c), 0);
  const profit = selling - cost;
  const margin = selling > 0 ? (profit / selling) * 100 : 0;
  return { cost, selling, profit, margin };
}

export function quoteTotals(q: Quote) {
  return q.options.map((o) => ({ id: o.id, name: o.name, ...optionTotals(o), transit: o.transitDays }));
}

export function nextNum(ids: string[], prefix: string) {
  const nums = ids.map((id) => {
    const m = id.match(/(\d+)\s*$/);
    return m ? parseInt(m[1], 10) : 0;
  });
  const n = Math.max(0, ...nums) + 1;
  return `${prefix}${String(n).padStart(6, "0")}`;
}

export function nowStamp() {
  const d = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]}, ${hh}:${mm}`;
}

export function ageOf(isoOrStamp: string) {
  // Seeded ages stay as-is if they look like "2h"
  if (/^\d+[hdwm]$/.test(isoOrStamp)) return isoOrStamp;
  return "just now";
}

export function isExpired(date: string) {
  // Treat dates like "08 Oct" in current year as past if day < 10 for demo of expired quotes
  // Simple parse: "DD Mon YYYY" or "YYYY-MM-DD"
  const t = Date.parse(date.includes("-") ? date : date + " 2026");
  if (Number.isNaN(t)) return false;
  return t < Date.now();
}

export function rateStatus(validTo: string): RateStatus {
  const t = Date.parse(validTo.includes("-") ? validTo : validTo + " 2026");
  if (Number.isNaN(t)) return "Active";
  const days = (t - Date.now()) / 86400000;
  if (days < 0) return "Expired";
  if (days < 14) return "Expiring Soon";
  return "Active";
}

function contact(partial: Omit<Contact, "id"> & { id?: string }): Contact {
  return { id: partial.id ?? cryptoRandom(), ...partial };
}

function cryptoRandom() {
  return "c" + Math.random().toString(36).slice(2, 8);
}

const apexCargo: Cargo = {
  commodity: "Precision auto components",
  description: "Machined aluminium housings, packed on pallets",
  packages: 48,
  packageType: "Pallet",
  weight: 18400,
  weightUnit: "KG",
  volume: 32.4,
  volumeUnit: "CBM",
  dims: "120 × 100 × 110 cm",
  value: 4200000,
  currency: "INR",
  containerType: "40HC",
  hazardous: false,
  tempControlled: false,
};

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: "CUST-000001",
    company: "Apex Components Pvt Ltd",
    category: "OEM",
    address: "Plot 14, MIDC Chakan",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    postal: "410501",
    website: "apexcomponents.com",
    industry: "Automotive",
    gstin: "27AABCA1234M1Z5",
    pan: "AABCA1234M",
    iec: "0314012345",
    contacts: [
      contact({ id: "ct-1", name: "Priya Nair", designation: "Logistics Head", email: "priya.nair@apexcomponents.com", phone: "+91 98220 11420", type: "Primary", primary: true }),
      contact({ id: "ct-2", name: "Rahul Deshmukh", designation: "Finance Manager", email: "rahul.d@apexcomponents.com", phone: "+91 98220 11881", type: "Finance", primary: false }),
    ],
    billingAddress: "Plot 14, MIDC Chakan, Pune 410501",
    creditTerms: "Net 30",
    creditDays: 30,
    currency: "INR",
    paymentTerms: "30 days from BL date",
    owner: "N. Verghese",
    creditLimit: 25000000,
    kyc: [{ name: "GST Certificate", file: "GST-Apex.pdf" }, { name: "IEC", file: "IEC-Apex.pdf" }],
    status: "Active",
    outstanding: 420000,
    ytdRevenue: 4820000,
    margin: 18.4,
  },
  {
    id: "CUST-000002",
    company: "Meridian Auto Systems",
    category: "Manufacturer",
    address: "12 Sector 8, Gurgaon",
    city: "Gurugram",
    state: "Haryana",
    country: "India",
    postal: "122001",
    industry: "Automotive",
    gstin: "06AAMCM8821P1Z2",
    pan: "AAMCM8821P",
    iec: "0515008811",
    contacts: [contact({ id: "ct-3", name: "Vikrant Mehra", designation: "SCM Director", email: "vikrant@meridianauto.com", phone: "+91 98100 33421", type: "Primary", primary: true })],
    billingAddress: "12 Sector 8, Gurugram 122001",
    creditTerms: "Net 45",
    creditDays: 45,
    currency: "INR",
    paymentTerms: "45 days from invoice",
    owner: "N. Verghese",
    creditLimit: 40000000,
    kyc: [{ name: "GST Certificate", file: "GST-Meridian.pdf" }],
    status: "Active",
    outstanding: 1185000,
    ytdRevenue: 3690000,
    margin: 16.2,
  },
  {
    id: "CUST-000003",
    company: "BlueRock Chemicals",
    category: "Manufacturer",
    address: "Dahej SEZ, Bharuch",
    city: "Bharuch",
    state: "Gujarat",
    country: "India",
    postal: "392130",
    industry: "Chemicals",
    gstin: "24AADCB4410Q1Z8",
    pan: "AADCB4410Q",
    iec: "0808011220",
    contacts: [contact({ id: "ct-4", name: "Ankit Shah", designation: "Export Manager", email: "ankit.shah@bluerock.in", phone: "+91 98795 22010", type: "Primary", primary: true })],
    billingAddress: "Dahej SEZ, Bharuch 392130",
    creditTerms: "LC at sight",
    creditDays: 0,
    currency: "USD",
    paymentTerms: "Letter of credit",
    owner: "S. Khan",
    kyc: [{ name: "IEC", file: "IEC-BlueRock.pdf" }, { name: "PAN", file: "PAN-BlueRock.pdf" }],
    status: "Active",
    outstanding: 812000,
    ytdRevenue: 2210000,
    margin: 14.8,
  },
  {
    id: "CUST-000004",
    company: "Titan Appliances",
    category: "OEM",
    address: "Hosur Road, Bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    postal: "560100",
    industry: "Consumer electronics",
    gstin: "29AAACT9988C1Z1",
    pan: "AAACT9988C",
    iec: "0707011990",
    contacts: [contact({ id: "ct-5", name: "Meera Iyer", designation: "Import Lead", email: "meera.iyer@titanapp.com", phone: "+91 98450 22190", type: "Primary", primary: true })],
    billingAddress: "Hosur Road, Bengaluru 560100",
    creditTerms: "Net 30",
    creditDays: 30,
    currency: "INR",
    paymentTerms: "30 days",
    owner: "R. Iyer",
    kyc: [{ name: "GST Certificate", file: "GST-Titan.pdf" }],
    status: "Active",
    outstanding: 640000,
    ytdRevenue: 1840000,
    margin: 19.1,
  },
  {
    id: "CUST-000005",
    company: "Nordic Fashions",
    category: "Trader",
    address: "Andheri East, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postal: "400069",
    industry: "Apparel",
    gstin: "27AABCN7766F1Z3",
    pan: "AABCN7766F",
    iec: "0312098877",
    contacts: [contact({ id: "ct-6", name: "Sofia D'Souza", designation: "Buyer", email: "sofia@nordicfashions.com", phone: "+91 98200 11876", type: "Primary", primary: true })],
    billingAddress: "Andheri East, Mumbai 400069",
    creditTerms: "Advance 50%",
    creditDays: 15,
    currency: "INR",
    paymentTerms: "50% advance, 50% against BL",
    owner: "N. Verghese",
    kyc: [{ name: "GST Certificate", file: "GST-Nordic.pdf" }],
    status: "Active",
    outstanding: 0,
    ytdRevenue: 980000,
    margin: 21.4,
  },
  {
    id: "CUST-000006",
    company: "Sahara Textiles",
    category: "Manufacturer",
    address: "Ring Road, Surat",
    city: "Surat",
    state: "Gujarat",
    country: "India",
    postal: "395002",
    industry: "Textiles",
    gstin: "24AAMCS4411H1Z9",
    pan: "AAMCS4411H",
    iec: "0808112233",
    contacts: [contact({ id: "ct-7", name: "Imran Qureshi", designation: "Logistics", email: "imran@saharatextiles.in", phone: "+91 98251 00912", type: "Primary", primary: true })],
    billingAddress: "Ring Road, Surat 395002",
    creditTerms: "Net 21",
    creditDays: 21,
    currency: "INR",
    paymentTerms: "21 days",
    owner: "S. Khan",
    kyc: [{ name: "IEC", file: "IEC-Sahara.pdf" }],
    status: "Active",
    outstanding: 0,
    ytdRevenue: 1560000,
    margin: 17.0,
  },
  {
    id: "CUST-000007",
    company: "Orbital Pharma",
    category: "Manufacturer",
    address: "Genome Valley, Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    postal: "500078",
    industry: "Pharmaceuticals",
    gstin: "36AABCO2210L1Z4",
    pan: "AABCO2210L",
    iec: "0909114455",
    contacts: [contact({ id: "ct-8", name: "Dr. Kavya Reddy", designation: "Supply Chain", email: "kavya@orbitalpharma.com", phone: "+91 98480 33410", type: "Primary", primary: true })],
    billingAddress: "Genome Valley, Hyderabad 500078",
    creditTerms: "Net 30",
    creditDays: 30,
    currency: "USD",
    paymentTerms: "30 days",
    owner: "K. Patel",
    creditLimit: 12000000,
    kyc: [{ name: "GST Certificate", file: "GST-Orbital.pdf" }, { name: "Company Registration", file: "CIN-Orbital.pdf" }],
    status: "Active",
    outstanding: 230000,
    ytdRevenue: 1860000,
    margin: 22.6,
  },
  {
    id: "CUST-000008",
    company: "Keystone Machinery",
    category: "Distributor",
    address: "Peenya Industrial Area",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    postal: "560058",
    industry: "Industrial machinery",
    gstin: "29AADCK9090R1Z6",
    pan: "AADCK9090R",
    iec: "0707223344",
    contacts: [contact({ id: "ct-9", name: "Arjun Rao", designation: "GM Operations", email: "arjun.rao@keystone.in", phone: "+91 98454 77821", type: "Primary", primary: true })],
    billingAddress: "Peenya Industrial Area, Bengaluru 560058",
    creditTerms: "Net 45",
    creditDays: 45,
    currency: "INR",
    paymentTerms: "45 days",
    owner: "A. Sharma",
    kyc: [{ name: "GST Certificate", file: "GST-Keystone.pdf" }],
    status: "Prospect",
    outstanding: 1420000,
    ytdRevenue: 2940000,
    margin: 15.5,
  },
];

export const SEED_RFQS: Rfq[] = [
  {
    id: "SPG-RFQ-000128",
    customerId: "CUST-000001",
    customerRef: "APX-HOU-24-09",
    origin: "Pune, India",
    destination: "Houston, USA",
    pickupDate: "2026-10-06",
    deliveryDate: "2026-10-22",
    cargo: apexCargo,
    mode: "Multimodal",
    service: "D2D",
    ocean: { type: "FCL", container: "40HC" },
    road: { type: "FTL", mile: "Both", vehicle: "32 ft" },
    insurance: true,
    customs: true,
    warehouse: false,
    pickup: true,
    delivery: true,
    special: "Keep pallets upright. No stacking.",
    internalNotes: "Strategic account — match last-year transit if possible.",
    status: "Awaiting Customer",
    owner: "N. Verghese",
    created: "09 Oct, 10:12",
  },
  {
    id: "SPG-RFQ-000129",
    customerId: "CUST-000001",
    origin: "Pune, India",
    destination: "Jebel Ali, UAE",
    pickupDate: "2026-10-18",
    deliveryDate: "2026-10-28",
    cargo: { ...apexCargo, commodity: "Cast housings", packages: 24, weight: 9200, volume: 16, containerType: "20GP" },
    mode: "Ocean",
    service: "D2P",
    ocean: { type: "FCL", container: "20GP" },
    insurance: false,
    customs: true,
    warehouse: false,
    pickup: true,
    delivery: false,
    status: "New",
    owner: "N. Verghese",
    created: "11 Oct, 09:40",
  },
  {
    id: "SPG-RFQ-000121",
    customerId: "CUST-000002",
    origin: "Shanghai, China",
    destination: "Rotterdam, Netherlands",
    pickupDate: "2026-10-08",
    deliveryDate: "2026-11-02",
    cargo: { commodity: "Gear assemblies", description: "Automotive gears in wooden crates", packages: 60, packageType: "Crate", weight: 24000, weightUnit: "KG", volume: 41, volumeUnit: "CBM", value: 9800000, currency: "INR", containerType: "40HC", hazardous: false, tempControlled: false },
    mode: "Ocean",
    service: "P2P",
    ocean: { type: "FCL", container: "40HC" },
    insurance: true,
    customs: true,
    warehouse: false,
    pickup: false,
    delivery: false,
    status: "Rate Sourcing",
    owner: "R. Iyer",
    created: "08 Oct, 16:20",
  },
  {
    id: "SPG-RFQ-000118",
    customerId: "CUST-000007",
    origin: "Pune, India",
    destination: "New York, USA",
    pickupDate: "2026-10-12",
    deliveryDate: "2026-10-16",
    cargo: { commodity: "APIs", description: "Active pharmaceutical ingredients, DG class 6.1", packages: 12, packageType: "Drum", weight: 840, weightUnit: "KG", volume: 2.1, volumeUnit: "CBM", value: 12500000, currency: "INR", hazardous: true, unNumber: "UN2811", hazardClass: "6.1", packingGroup: "II", hazInstructions: "Keep dry, segregated", tempControlled: true, tempMin: 2, tempMax: 8, tempUnit: "C", tempInstructions: "Continuous logger required" },
    mode: "Air",
    service: "D2D",
    air: { priority: "Priority", handling: "DG + cool chain" },
    insurance: true,
    customs: true,
    warehouse: true,
    pickup: true,
    delivery: true,
    status: "Quote Preparation",
    owner: "K. Patel",
    created: "07 Oct, 11:05",
  },
  {
    id: "SPG-RFQ-000114",
    customerId: "CUST-000003",
    origin: "Jebel Ali, UAE",
    destination: "Nhava Sheva, India",
    pickupDate: "2026-10-04",
    deliveryDate: "2026-10-18",
    cargo: { commodity: "Solvents", description: "Industrial solvents in ISO tanks", packages: 2, packageType: "ISO tank", weight: 42000, weightUnit: "KG", volume: 48, volumeUnit: "CBM", value: 6100000, currency: "INR", hazardous: true, unNumber: "UN1268", hazardClass: "3", packingGroup: "II", tempControlled: false },
    mode: "Ocean",
    service: "P2P",
    ocean: { type: "FCL", container: "ISO tank" },
    insurance: true,
    customs: true,
    warehouse: false,
    pickup: false,
    delivery: false,
    status: "Won",
    owner: "S. Khan",
    created: "02 Oct, 09:12",
  },
  {
    id: "SPG-RFQ-000110",
    customerId: "CUST-000004",
    origin: "Pune, India",
    destination: "Jebel Ali, UAE",
    pickupDate: "2026-10-15",
    deliveryDate: "2026-10-26",
    cargo: { commodity: "Kitchen appliances", description: "Boxed appliances on pallets", packages: 90, packageType: "Pallet", weight: 12800, weightUnit: "KG", volume: 54, volumeUnit: "CBM", value: 3400000, currency: "INR", containerType: "40HC", hazardous: false, tempControlled: false },
    mode: "Ocean",
    service: "D2P",
    ocean: { type: "FCL", container: "40HC" },
    insurance: false,
    customs: true,
    warehouse: false,
    pickup: true,
    delivery: false,
    status: "Quote Sent",
    owner: "R. Iyer",
    created: "05 Oct, 14:44",
  },
  {
    id: "SPG-RFQ-000107",
    customerId: "CUST-000005",
    origin: "Singapore",
    destination: "Rotterdam, Netherlands",
    pickupDate: "2026-10-20",
    deliveryDate: "2026-11-12",
    cargo: { commodity: "Ready garments", description: "Cartons of apparel", packages: 220, packageType: "Carton", weight: 6400, weightUnit: "KG", volume: 38, volumeUnit: "CBM", value: 2100000, currency: "INR", hazardous: false, tempControlled: false },
    mode: "Ocean",
    service: "P2D",
    ocean: { type: "LCL" },
    insurance: true,
    customs: true,
    warehouse: true,
    pickup: false,
    delivery: true,
    status: "Qualified",
    owner: "N. Verghese",
    created: "06 Oct, 10:18",
  },
  {
    id: "SPG-RFQ-000102",
    customerId: "CUST-000006",
    origin: "Pune, India",
    destination: "Santos, Brazil",
    pickupDate: "2026-10-22",
    deliveryDate: "2026-11-20",
    cargo: { commodity: "Cotton yarn", description: "Bales of combed yarn", packages: 40, packageType: "Bale", weight: 20000, weightUnit: "KG", volume: 44, volumeUnit: "CBM", value: 1800000, currency: "INR", containerType: "40HC", hazardous: false, tempControlled: false },
    mode: "Ocean",
    service: "P2P",
    ocean: { type: "FCL", container: "40HC" },
    insurance: false,
    customs: true,
    warehouse: false,
    pickup: false,
    delivery: false,
    status: "New",
    owner: "S. Khan",
    created: "09 Oct, 17:02",
  },
  {
    id: "SPG-RFQ-000098",
    customerId: "CUST-000008",
    origin: "Nhava Sheva, India",
    destination: "Hamburg, Germany",
    pickupDate: "2026-09-28",
    deliveryDate: "2026-10-22",
    cargo: { commodity: "CNC parts", description: "Precision machinery parts", packages: 16, packageType: "Crate", weight: 9600, weightUnit: "KG", volume: 18, volumeUnit: "CBM", value: 7600000, currency: "INR", containerType: "20GP", hazardous: false, tempControlled: false },
    mode: "Ocean",
    service: "P2P",
    ocean: { type: "FCL", container: "20GP" },
    insurance: true,
    customs: true,
    warehouse: false,
    pickup: false,
    delivery: false,
    status: "Won",
    owner: "A. Sharma",
    created: "22 Sep, 12:00",
  },
  {
    id: "SPG-RFQ-000094",
    customerId: "CUST-000002",
    origin: "Pune, India",
    destination: "Jebel Ali, UAE",
    pickupDate: "2026-10-02",
    deliveryDate: "2026-10-09",
    cargo: { commodity: "Samples", description: "Prototype parts", packages: 4, packageType: "Carton", weight: 180, weightUnit: "KG", volume: 0.8, volumeUnit: "CBM", value: 240000, currency: "INR", hazardous: false, tempControlled: false },
    mode: "Air",
    service: "D2D",
    air: { priority: "Standard" },
    insurance: false,
    customs: true,
    warehouse: false,
    pickup: true,
    delivery: true,
    status: "Lost",
    owner: "N. Verghese",
    created: "28 Sep, 09:30",
  },
  {
    id: "SPG-RFQ-000090",
    customerId: "CUST-000007",
    origin: "Houston, USA",
    destination: "Nhava Sheva, India",
    pickupDate: "2026-09-18",
    deliveryDate: "2026-10-12",
    cargo: { commodity: "Lab equipment", description: "Instruments in flight cases", packages: 8, packageType: "Case", weight: 1200, weightUnit: "KG", volume: 6, volumeUnit: "CBM", value: 8900000, currency: "INR", hazardous: false, tempControlled: false },
    mode: "Ocean",
    service: "P2D",
    ocean: { type: "LCL" },
    insurance: true,
    customs: true,
    warehouse: true,
    pickup: false,
    delivery: true,
    status: "Won",
    owner: "K. Patel",
    created: "12 Sep, 15:10",
  },
  {
    id: "SPG-RFQ-000086",
    customerId: "CUST-000004",
    origin: "Busan, South Korea",
    destination: "Los Angeles, USA",
    pickupDate: "2026-09-10",
    deliveryDate: "2026-10-02",
    cargo: { commodity: "Compressors", description: "Appliance compressors", packages: 200, packageType: "Carton", weight: 16000, weightUnit: "KG", volume: 52, volumeUnit: "CBM", value: 4100000, currency: "INR", containerType: "40HC", hazardous: false, tempControlled: false },
    mode: "Ocean",
    service: "P2P",
    ocean: { type: "FCL", container: "40HC" },
    insurance: true,
    customs: true,
    warehouse: false,
    pickup: false,
    delivery: false,
    status: "Lost",
    owner: "R. Iyer",
    created: "04 Sep, 11:22",
  },
];

export const SEED_RATES: Rate[] = [
  { id: "RT-101", vendor: "Meridian Ocean Freight", origin: "Nhava Sheva, India", destination: "Houston, USA", mode: "Ocean", group: "Freight", charge: "Ocean freight 40HC", currency: "INR", amount: 245000, validFrom: "2026-09-01", validTo: "2026-12-31", transitDays: 28, status: "Active" },
  { id: "RT-102", vendor: "Harbor Logistics", origin: "Nhava Sheva, India", destination: "Houston, USA", mode: "Ocean", group: "Freight", charge: "Ocean freight 40HC", currency: "INR", amount: 268000, validFrom: "2026-09-01", validTo: "2026-11-15", transitDays: 24, status: "Active" },
  { id: "RT-103", vendor: "Atlas Breakbulk", origin: "Nhava Sheva, India", destination: "Houston, USA", mode: "Ocean", group: "Freight", charge: "Ocean freight 40HC", currency: "INR", amount: 232000, validFrom: "2026-09-01", validTo: "2026-12-15", transitDays: 32, status: "Active" },
  { id: "RT-104", vendor: "TransLine Haulage", origin: "Pune, India", destination: "Nhava Sheva, India", mode: "Road", group: "Transport", charge: "First mile 32ft", currency: "INR", amount: 28000, validFrom: "2026-08-01", validTo: "2026-12-31", transitDays: 1, status: "Active" },
  { id: "RT-105", vendor: "Harbor Logistics", origin: "Pune, India", destination: "Nhava Sheva, India", mode: "Road", group: "Transport", charge: "First mile 32ft", currency: "INR", amount: 31000, validFrom: "2026-08-01", validTo: "2026-10-20", transitDays: 1, status: "Expiring Soon" },
  { id: "RT-106", vendor: "PortServe Terminals", origin: "Nhava Sheva, India", destination: "Nhava Sheva, India", mode: "Ocean", group: "Origin", charge: "THC + documentation", currency: "INR", amount: 18500, validFrom: "2026-07-01", validTo: "2026-12-31", status: "Active" },
  { id: "RT-107", vendor: "Gulf Gate Customs", origin: "Nhava Sheva, India", destination: "Nhava Sheva, India", mode: "Ocean", group: "Customs", charge: "Export filing", currency: "INR", amount: 8500, validFrom: "2026-07-01", validTo: "2026-12-31", status: "Active" },
  { id: "RT-108", vendor: "Delta Docs LLP", origin: "Pune, India", destination: "Houston, USA", mode: "Ocean", group: "Documentation", charge: "BL + COO pack", currency: "INR", amount: 6200, validFrom: "2026-07-01", validTo: "2026-12-31", status: "Active" },
  { id: "RT-109", vendor: "PortServe Terminals", origin: "Houston, USA", destination: "Houston, USA", mode: "Ocean", group: "Destination", charge: "DTHC + delivery order", currency: "INR", amount: 42000, validFrom: "2026-07-01", validTo: "2026-12-31", status: "Active" },
  { id: "RT-110", vendor: "TransLine Haulage", origin: "Houston, USA", destination: "Houston, USA", mode: "Road", group: "Destination", charge: "Last mile to consignee", currency: "INR", amount: 36000, validFrom: "2026-08-01", validTo: "2026-12-31", transitDays: 1, status: "Active" },
  { id: "RT-111", vendor: "Harbor Logistics", origin: "Houston, USA", destination: "Houston, USA", mode: "Ocean", group: "Handling", charge: "Dest. handling", currency: "INR", amount: 14000, validFrom: "2026-07-01", validTo: "2026-12-31", status: "Active" },
  { id: "RT-112", vendor: "Meridian Ocean Freight", origin: "Pune, India", destination: "Houston, USA", mode: "Ocean", group: "Insurance", charge: "Cargo insurance 0.35%", currency: "INR", amount: 14700, validFrom: "2026-07-01", validTo: "2026-12-31", status: "Active" },
  { id: "RT-113", vendor: "SkyPort Air Cargo", origin: "Pune, India", destination: "New York, USA", mode: "Air", group: "Freight", charge: "Air freight priority", currency: "INR", amount: 186000, validFrom: "2026-09-01", validTo: "2026-11-30", transitDays: 3, status: "Active" },
  { id: "RT-114", vendor: "SkyPort Air Cargo", origin: "Pune, India", destination: "New York, USA", mode: "Air", group: "Freight", charge: "Air freight standard", currency: "INR", amount: 142000, validFrom: "2026-09-01", validTo: "2026-11-30", transitDays: 5, status: "Active" },
  { id: "RT-115", vendor: "ColdChain Reefer", origin: "Pune, India", destination: "New York, USA", mode: "Air", group: "Handling", charge: "Cool-chain handling", currency: "INR", amount: 22000, validFrom: "2026-08-01", validTo: "2026-12-31", status: "Active" },
  { id: "RT-116", vendor: "Meridian Ocean Freight", origin: "Shanghai, China", destination: "Rotterdam, Netherlands", mode: "Ocean", group: "Freight", charge: "Ocean freight 40HC", currency: "INR", amount: 198000, validFrom: "2026-09-01", validTo: "2026-12-31", transitDays: 32, status: "Active" },
  { id: "RT-117", vendor: "Harbor Logistics", origin: "Shanghai, China", destination: "Rotterdam, Netherlands", mode: "Ocean", group: "Freight", charge: "Ocean freight 40HC", currency: "INR", amount: 210000, validFrom: "2026-09-01", validTo: "2026-10-18", transitDays: 28, status: "Expiring Soon" },
  { id: "RT-118", vendor: "RailBridge ICD", origin: "Pune, India", destination: "Nhava Sheva, India", mode: "Rail", group: "Transport", charge: "ICD rail movement", currency: "INR", amount: 16500, validFrom: "2026-07-01", validTo: "2026-12-31", transitDays: 2, status: "Active" },
  { id: "RT-119", vendor: "Meridian Ocean Freight", origin: "Jebel Ali, UAE", destination: "Nhava Sheva, India", mode: "Ocean", group: "Freight", charge: "Ocean freight ISO", currency: "INR", amount: 155000, validFrom: "2026-06-01", validTo: "2026-09-30", transitDays: 8, status: "Expired" },
  { id: "RT-120", vendor: "PortServe Terminals", origin: "Nhava Sheva, India", destination: "Nhava Sheva, India", mode: "Ocean", group: "Port", charge: "Port dues", currency: "INR", amount: 9200, validFrom: "2026-07-01", validTo: "2026-12-31", status: "Active" },
  { id: "RT-121", vendor: "Delta Docs LLP", origin: "Pune, India", destination: "Houston, USA", mode: "Ocean", group: "Taxes", charge: "GST on services", currency: "INR", amount: 18400, validFrom: "2026-07-01", validTo: "2026-12-31", status: "Active" },
  { id: "RT-122", vendor: "TransLine Haulage", origin: "Pune, India", destination: "Jebel Ali, UAE", mode: "Road", group: "Transport", charge: "Factory pickup", currency: "INR", amount: 24000, validFrom: "2026-08-01", validTo: "2026-12-31", status: "Active" },
];

function ch(partial: Omit<QuoteCharge, "id"> & { id?: string }): QuoteCharge {
  return { id: partial.id ?? "qc-" + Math.random().toString(36).slice(2, 7), ...partial };
}

const optionA: QuoteOption = {
  id: "opt-a",
  name: "Option A",
  tag: "FASTEST",
  mode: "Ocean + Air feeder",
  transitDays: 11,
  charges: [
    ch({ id: "qa1", group: "Freight", vendor: "Harbor Logistics", cost: 268000, marginType: "pct", margin: 12, currency: "INR", rateId: "RT-102" }),
    ch({ id: "qa2", group: "Transport", vendor: "TransLine Haulage", cost: 28000, marginType: "pct", margin: 15, currency: "INR", rateId: "RT-104" }),
    ch({ id: "qa3", group: "Origin", vendor: "PortServe Terminals", cost: 18500, marginType: "pct", margin: 18, currency: "INR", rateId: "RT-106" }),
    ch({ id: "qa4", group: "Customs", vendor: "Gulf Gate Customs", cost: 8500, marginType: "pct", margin: 20, currency: "INR", rateId: "RT-107" }),
    ch({ id: "qa5", group: "Documentation", vendor: "Delta Docs LLP", cost: 6200, marginType: "fixed", margin: 1800, currency: "INR", rateId: "RT-108" }),
    ch({ id: "qa6", group: "Destination", vendor: "PortServe Terminals", cost: 42000, marginType: "pct", margin: 12, currency: "INR", rateId: "RT-109" }),
    ch({ id: "qa7", group: "Destination", vendor: "TransLine Haulage", cost: 36000, marginType: "pct", margin: 10, currency: "INR", rateId: "RT-110" }),
    ch({ id: "qa8", group: "Insurance", vendor: "Meridian Ocean Freight", cost: 14700, marginType: "pct", margin: 8, currency: "INR", rateId: "RT-112" }),
  ],
};

const optionB: QuoteOption = {
  id: "opt-b",
  name: "Option B",
  tag: "BALANCED",
  mode: "Ocean FCL + Road",
  transitDays: 14,
  charges: [
    ch({ id: "qb1", group: "Freight", vendor: "Meridian Ocean Freight", cost: 245000, marginType: "pct", margin: 14, currency: "INR", rateId: "RT-101" }),
    ch({ id: "qb2", group: "Transport", vendor: "TransLine Haulage", cost: 28000, marginType: "pct", margin: 15, currency: "INR", rateId: "RT-104" }),
    ch({ id: "qb3", group: "Origin", vendor: "PortServe Terminals", cost: 18500, marginType: "pct", margin: 18, currency: "INR", rateId: "RT-106" }),
    ch({ id: "qb4", group: "Customs", vendor: "Gulf Gate Customs", cost: 8500, marginType: "pct", margin: 20, currency: "INR", rateId: "RT-107" }),
    ch({ id: "qb5", group: "Documentation", vendor: "Delta Docs LLP", cost: 6200, marginType: "fixed", margin: 1800, currency: "INR", rateId: "RT-108" }),
    ch({ id: "qb6", group: "Destination", vendor: "PortServe Terminals", cost: 42000, marginType: "pct", margin: 12, currency: "INR", rateId: "RT-109" }),
    ch({ id: "qb7", group: "Handling", vendor: "Harbor Logistics", cost: 14000, marginType: "pct", margin: 15, currency: "INR", rateId: "RT-111" }),
    ch({ id: "qb8", group: "Insurance", vendor: "Meridian Ocean Freight", cost: 14700, marginType: "pct", margin: 8, currency: "INR", rateId: "RT-112" }),
  ],
};

const optionC: QuoteOption = {
  id: "opt-c",
  name: "Option C",
  tag: "ECONOMICAL",
  mode: "Ocean FCL (slow steamer)",
  transitDays: 18,
  charges: [
    ch({ id: "qc1", group: "Freight", vendor: "Atlas Breakbulk", cost: 232000, marginType: "pct", margin: 10, currency: "INR", rateId: "RT-103" }),
    ch({ id: "qc2", group: "Transport", vendor: "TransLine Haulage", cost: 28000, marginType: "pct", margin: 12, currency: "INR", rateId: "RT-104" }),
    ch({ id: "qc3", group: "Origin", vendor: "PortServe Terminals", cost: 18500, marginType: "pct", margin: 15, currency: "INR", rateId: "RT-106" }),
    ch({ id: "qc4", group: "Customs", vendor: "Gulf Gate Customs", cost: 8500, marginType: "pct", margin: 15, currency: "INR", rateId: "RT-107" }),
    ch({ id: "qc5", group: "Documentation", vendor: "Delta Docs LLP", cost: 6200, marginType: "fixed", margin: 1200, currency: "INR", rateId: "RT-108" }),
    ch({ id: "qc6", group: "Destination", vendor: "PortServe Terminals", cost: 42000, marginType: "pct", margin: 10, currency: "INR", rateId: "RT-109" }),
    ch({ id: "qc7", group: "Insurance", vendor: "Meridian Ocean Freight", cost: 14700, marginType: "pct", margin: 6, currency: "INR", rateId: "RT-112" }),
  ],
};

export const SEED_QUOTES: Quote[] = [
  {
    id: "SPG-QUO-000128",
    version: 2,
    rfqId: "SPG-RFQ-000128",
    customerId: "CUST-000001",
    options: [optionA, optionB, optionC],
    validUntil: "2026-10-28",
    status: "Awaiting Customer",
    owner: "N. Verghese",
    created: "10 Oct, 11:05",
    approvedBy: "Vikram Singh",
    locked: false,
    versions: [
      { version: 1, created: "09 Oct, 14:15", by: "N. Verghese", status: "Changes Requested" },
      { version: 2, created: "10 Oct, 11:05", by: "N. Verghese", status: "Awaiting Customer" },
    ],
  },
  {
    id: "SPG-QUO-000121",
    version: 1,
    rfqId: "SPG-RFQ-000121",
    customerId: "CUST-000002",
    options: [{ ...optionB, id: "opt-a", name: "Option A", tag: "BALANCED", mode: "Ocean FCL", transitDays: 32, charges: optionB.charges.slice(0, 5) }],
    validUntil: "2026-10-22",
    status: "Draft",
    owner: "R. Iyer",
    created: "10 Oct, 16:40",
    locked: false,
    versions: [{ version: 1, created: "10 Oct, 16:40", by: "R. Iyer", status: "Draft" }],
  },
  {
    id: "SPG-QUO-000118",
    version: 1,
    rfqId: "SPG-RFQ-000118",
    customerId: "CUST-000007",
    options: [{ id: "opt-a", name: "Option A", tag: "PRIORITY", mode: "Air", transitDays: 3, charges: [ch({ id: "air1", group: "Freight", vendor: "SkyPort Air Cargo", cost: 186000, marginType: "pct", margin: 18, currency: "INR", rateId: "RT-113" }), ch({ id: "air2", group: "Handling", vendor: "ColdChain Reefer", cost: 22000, marginType: "pct", margin: 15, currency: "INR", rateId: "RT-115" })] }],
    validUntil: "2026-10-16",
    status: "Awaiting Approval",
    owner: "K. Patel",
    created: "09 Oct, 18:02",
    locked: false,
    versions: [{ version: 1, created: "09 Oct, 18:02", by: "K. Patel", status: "Awaiting Approval" }],
  },
  {
    id: "SPG-QUO-000114",
    version: 1,
    rfqId: "SPG-RFQ-000114",
    customerId: "CUST-000003",
    options: [{ ...optionB, id: "opt-a", name: "Option A", tag: "STANDARD", transitDays: 8 }],
    validUntil: "2026-10-20",
    status: "Accepted",
    owner: "S. Khan",
    created: "04 Oct, 12:10",
    acceptedOptionId: "opt-a",
    locked: true,
    versions: [{ version: 1, created: "04 Oct, 12:10", by: "S. Khan", status: "Accepted" }],
  },
  {
    id: "SPG-QUO-000110",
    version: 1,
    rfqId: "SPG-RFQ-000110",
    customerId: "CUST-000004",
    options: [optionC],
    validUntil: "2026-10-18",
    status: "Sent",
    owner: "R. Iyer",
    created: "07 Oct, 09:00",
    locked: false,
    versions: [{ version: 1, created: "07 Oct, 09:00", by: "R. Iyer", status: "Sent" }],
  },
  {
    id: "SPG-QUO-000098",
    version: 1,
    rfqId: "SPG-RFQ-000098",
    customerId: "CUST-000008",
    options: [optionB],
    validUntil: "2026-10-22",
    status: "Accepted",
    owner: "A. Sharma",
    created: "24 Sep, 11:40",
    acceptedOptionId: "opt-b",
    locked: true,
    versions: [{ version: 1, created: "24 Sep, 11:40", by: "A. Sharma", status: "Accepted" }],
  },
  {
    id: "SPG-QUO-000094",
    version: 1,
    rfqId: "SPG-RFQ-000094",
    customerId: "CUST-000002",
    options: [{ id: "opt-a", name: "Option A", tag: "STANDARD", mode: "Air", transitDays: 4, charges: [ch({ group: "Freight", vendor: "SkyPort Air Cargo", cost: 42000, marginType: "pct", margin: 20, currency: "INR" })] }],
    validUntil: "2026-10-05",
    status: "Expired",
    owner: "N. Verghese",
    created: "29 Sep, 10:00",
    locked: true,
    versions: [{ version: 1, created: "29 Sep, 10:00", by: "N. Verghese", status: "Expired" }],
  },
  {
    id: "SPG-QUO-000086",
    version: 1,
    rfqId: "SPG-RFQ-000086",
    customerId: "CUST-000004",
    options: [optionA],
    validUntil: "2026-09-20",
    status: "Rejected by Customer",
    owner: "R. Iyer",
    created: "08 Sep, 14:20",
    rejectReason: "Price",
    locked: true,
    versions: [{ version: 1, created: "08 Sep, 14:20", by: "R. Iyer", status: "Rejected by Customer" }],
  },
];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: "SPG-BKG-000114",
    quoteId: "SPG-QUO-000114",
    optionId: "opt-a",
    customerId: "CUST-000003",
    rfqId: "SPG-RFQ-000114",
    confirmationDate: "2026-10-05",
    opsOwner: "A. Sharma",
    status: "Confirmed",
    bookingRef: "BRK-JA-441",
    plannedPickup: "2026-10-06",
    plannedDeparture: "2026-10-08",
    plannedArrival: "2026-10-16",
  },
  {
    id: "SPG-BKG-000098",
    quoteId: "SPG-QUO-000098",
    optionId: "opt-b",
    customerId: "CUST-000008",
    rfqId: "SPG-RFQ-000098",
    confirmationDate: "2026-09-25",
    opsOwner: "R. Iyer",
    status: "Ready for Operations",
    bookingRef: "BRK-HAM-218",
  },
];

export const SEED_TIMELINE: TimelineItem[] = [
  { id: "tl-1", entityType: "rfq", entityId: "SPG-RFQ-000128", time: "09 Oct, 10:12", text: "RFQ created from customer enquiry APX-HOU-24-09", by: "N. Verghese" },
  { id: "tl-2", entityType: "rfq", entityId: "SPG-RFQ-000128", time: "09 Oct, 11:40", text: "Rates evaluated — 3 ocean vendors compared", by: "N. Verghese" },
  { id: "tl-3", entityType: "quote", entityId: "SPG-QUO-000128", time: "09 Oct, 14:15", text: "Quotation V1 created with 3 options", by: "N. Verghese" },
  { id: "tl-4", entityType: "quote", entityId: "SPG-QUO-000128", time: "10 Oct, 09:20", text: "Changes requested — reduce Option B transit commitment", by: "Vikram Singh" },
  { id: "tl-5", entityType: "quote", entityId: "SPG-QUO-000128", time: "10 Oct, 11:05", text: "Quotation V2 approved and sent to customer", by: "Vikram Singh" },
  { id: "tl-6", entityType: "customer", entityId: "CUST-000001", time: "04 Jan, 09:00", text: "Customer onboarded with Net 30 terms", by: "N. Verghese" },
  { id: "tl-7", entityType: "booking", entityId: "SPG-BKG-000114", time: "05 Oct, 16:02", text: "Booking confirmed — ready for operations handoff", by: "A. Sharma" },
  { id: "tl-8", entityType: "quote", entityId: "SPG-QUO-000118", time: "09 Oct, 18:02", text: "Quote submitted for internal approval", by: "K. Patel" },
];

export const SEED_NOTES: CommNote[] = [
  { id: "cm-1", rfqId: "SPG-RFQ-000128", time: "09 Oct, 10:14", by: "N. Verghese", text: "Customer enquiry received for Pune factory to Houston DC, door-to-door.", visibility: "customer" },
  { id: "cm-2", rfqId: "SPG-RFQ-000128", time: "09 Oct, 10:40", by: "N. Verghese", text: "Requested pallet count confirmation — 48 confirmed.", visibility: "internal" },
  { id: "cm-3", rfqId: "SPG-RFQ-000128", time: "09 Oct, 11:12", by: "Priya Nair", text: "Cargo dimensions updated. Keep pallets upright, no stacking.", visibility: "customer" },
  { id: "cm-4", rfqId: "SPG-RFQ-000128", time: "09 Oct, 11:38", by: "N. Verghese", text: "Rate request sent internally to ocean desk.", visibility: "internal" },
  { id: "cm-5", rfqId: "SPG-RFQ-000128", time: "10 Oct, 11:10", by: "N. Verghese", text: "Quote V2 shared with three options.", visibility: "customer" },
];

export const SERVICE_COPY: Record<ServiceType, { title: string; blurb: string }> = {
  P2P: { title: "Port to Port", blurb: "Origin terminal to destination terminal. Customer handles first and last mile." },
  D2P: { title: "Door to Port", blurb: "Pickup at shipper, deliver to destination port. Last mile excluded." },
  P2D: { title: "Port to Door", blurb: "Origin port to consignee door. First mile excluded." },
  D2D: { title: "Door to Door", blurb: "Full movement from shipper door to consignee door." },
};

export const MODE_COPY: Record<ModeChoice, string> = {
  Recommend: "Let CargoOS propose the best combination of cost and transit.",
  Ocean: "Deep-sea FCL, LCL, reefer, breakbulk and ODC.",
  Air: "Priority or standard air freight with airport handling.",
  Road: "FTL, PTL, first mile and last mile.",
  Rail: "Container, ICD and port rail movement.",
  Multimodal: "Combine road, sea, air and rail as connected legs.",
};

export const REJECT_REASONS = ["Price", "Transit Time", "Service Scope", "Changed Requirement", "Competitor", "Other"];
