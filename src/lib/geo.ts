export type GeoNode = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: "port" | "hub" | "factory" | "customer";
};

export const MAP = { w: 1000, h: 500 };

export function project(lat: number, lng: number, w = MAP.w, h = MAP.h) {
  const x = ((lng + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
}

export const NODES: GeoNode[] = [
  { id: "pune", name: "Pune", lat: 18.52, lng: 73.86, kind: "factory" },
  { id: "nhava", name: "Nhava Sheva", lat: 18.95, lng: 72.95, kind: "port" },
  { id: "singapore", name: "Singapore", lat: 1.35, lng: 103.82, kind: "port" },
  { id: "houston", name: "Houston", lat: 29.76, lng: -95.37, kind: "port" },
  { id: "rotterdam", name: "Rotterdam", lat: 51.92, lng: 4.48, kind: "port" },
  { id: "shanghai", name: "Shanghai", lat: 31.23, lng: 121.47, kind: "port" },
  { id: "dubai", name: "Jebel Ali", lat: 25.01, lng: 55.06, kind: "port" },
  { id: "la", name: "Los Angeles", lat: 33.74, lng: -118.27, kind: "port" },
  { id: "hamburg", name: "Hamburg", lat: 53.55, lng: 9.99, kind: "port" },
  { id: "santos", name: "Santos", lat: -23.96, lng: -46.33, kind: "port" },
  { id: "busan", name: "Busan", lat: 35.1, lng: 129.04, kind: "port" },
  { id: "ny", name: "New York", lat: 40.68, lng: -74.02, kind: "port" },
];

export const PRIMARY_ROUTE = ["pune", "nhava", "singapore", "houston"] as const;

export const AMBIENT_ROUTES: string[][] = [
  ["shanghai", "rotterdam"],
  ["busan", "la"],
  ["hamburg", "ny"],
  ["dubai", "santos"],
  ["shanghai", "singapore"],
  ["rotterdam", "houston"],
];

export function arcPath(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const lift = Math.min(Math.max(dist * 0.18, 18), 90);
  const cx = (a.x + b.x) / 2;
  const cy = Math.min(a.y, b.y) - lift;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export function routePath(ids: readonly string[], w = MAP.w, h = MAP.h) {
  const pts = ids
    .map((id) => NODES.find((n) => n.id === id))
    .filter(Boolean)
    .map((n) => project(n!.lat, n!.lng, w, h));
  if (pts.length < 2) return "";
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    d += (d ? " " : "") + arcPath(pts[i], pts[i + 1]);
  }
  return d;
}

export const DEMO_SHIPMENT = {
  id: "SPG-SHP-001284",
  origin: "Pune",
  destination: "Houston",
  status: "IN TRANSIT",
  eta: "18 OCT",
  legs: 4,
};
