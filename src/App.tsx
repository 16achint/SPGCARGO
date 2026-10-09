import { lazy, Suspense, useEffect, type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { AppProvider, homeFor, useApp } from "@/state/AppContext";
import { DashboardSkeleton } from "@/components/app/shared/primitives";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import AuthSuccessPage from "@/pages/AuthSuccessPage";

const AppShell = lazy(() => import("@/components/app/AppShell"));
const OverviewPage = lazy(() => import("@/pages/app/OverviewPage"));
const ManagementOverview = lazy(() => import("@/pages/app/ManagementOverview"));
const CustomerOverview = lazy(() => import("@/pages/app/CustomerOverview"));
const VendorOverview = lazy(() => import("@/pages/app/VendorOverview"));
const PlaceholderPage = lazy(() => import("@/pages/app/PlaceholderPage"));

const CustomersPage = lazy(() => import("@/pages/commercial/customers"));
const CustomerNewPage = lazy(() =>
  import("@/pages/commercial/customers").then((m) => ({ default: m.CustomerNewPage })),
);
const Customer360Page = lazy(() =>
  import("@/pages/commercial/customers").then((m) => ({ default: m.Customer360Page })),
);
const RfqsPage = lazy(() => import("@/pages/commercial/rfqs"));
const RfqNewPage = lazy(() =>
  import("@/pages/commercial/rfqs").then((m) => ({ default: m.RfqNewPage })),
);
const RfqDetailPage = lazy(() =>
  import("@/pages/commercial/rfqs").then((m) => ({ default: m.RfqDetailPage })),
);
const RatesPage = lazy(() => import("@/pages/commercial/rates"));
const RateEvalPage = lazy(() =>
  import("@/pages/commercial/rates").then((m) => ({ default: m.RateEvalPage })),
);
const QuotesPage = lazy(() => import("@/pages/commercial/quotes"));
const QuoteBuilderPage = lazy(() =>
  import("@/pages/commercial/quotes").then((m) => ({ default: m.QuoteBuilderPage })),
);
const QuoteApprovalPage = lazy(() =>
  import("@/pages/commercial/quotes").then((m) => ({ default: m.QuoteApprovalPage })),
);
const QuotePreviewPage = lazy(() =>
  import("@/pages/commercial/quotes").then((m) => ({ default: m.QuotePreviewPage })),
);
const CustomerQuotesPage = lazy(() =>
  import("@/pages/commercial/quotes").then((m) => ({ default: m.CustomerQuotesPage })),
);
const CustomerRfqsPage = lazy(() =>
  import("@/pages/commercial/quotes").then((m) => ({ default: m.CustomerRfqsPage })),
);
const BookingsPage = lazy(() => import("@/pages/commercial/bookings"));
const BookingNewPage = lazy(() =>
  import("@/pages/commercial/bookings").then((m) => ({ default: m.BookingNewPage })),
);
const BookingDetailPage = lazy(() =>
  import("@/pages/commercial/bookings").then((m) => ({ default: m.BookingDetailPage })),
);
const ShipmentsPage = lazy(() => import("@/pages/execution/shipments"));
const ShipmentNewPage = lazy(() =>
  import("@/pages/execution/shipments").then((m) => ({ default: m.ShipmentNewPage })),
);
const Shipment360Page = lazy(() =>
  import("@/pages/execution/shipments").then((m) => ({ default: m.Shipment360Page })),
);
const JourneyPage = lazy(() => import("@/pages/execution/journey"));
const MilestonesPage = lazy(() =>
  import("@/pages/execution/journey").then((m) => ({ default: m.MilestonesPage })),
);
const ControlTowerPage = lazy(() => import("@/pages/execution/controlTower"));
const ExceptionCenterPage = lazy(() =>
  import("@/pages/execution/controlTower").then((m) => ({ default: m.ExceptionCenterPage })),
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = pathname.startsWith("/app")
      ? "CargoOS Workspace"
      : pathname === "/login"
        ? "Sign in — SPG CargoOS"
        : "SPG CargoOS — The Operating System for Global Logistics";
  }, [pathname]);
  return null;
}

function AppGuard({ children }: { children: ReactNode }) {
  const { session } = useApp();
  if (!session) return <Navigate to="/login?reason=expired" replace />;
  return <>{children}</>;
}

function RoleHome() {
  const { session } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    navigate(homeFor(session?.role ?? "operations"), { replace: true });
  }, [navigate, session]);
  return null;
}

function Fall() {
  return (
    <div className="p-6">
      <DashboardSkeleton />
    </div>
  );
}

function S({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Fall />}>{children}</Suspense>;
}

export default function App() {
  usePrefersReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth-success" element={<AuthSuccessPage />} />
            <Route
              path="/app"
              element={
                <AppGuard>
                  <S>
                    <AppShell />
                  </S>
                </AppGuard>
              }
            >
              <Route index element={<RoleHome />} />
              <Route path="overview" element={<S><OverviewPage /></S>} />
              <Route path="management" element={<S><ManagementOverview /></S>} />
              <Route path="customer" element={<S><CustomerOverview /></S>} />
              <Route path="vendor" element={<S><VendorOverview /></S>} />

              <Route path="customers" element={<S><CustomersPage /></S>} />
              <Route path="customers/new" element={<S><CustomerNewPage /></S>} />
              <Route path="customers/:customerId" element={<S><Customer360Page /></S>} />

              <Route path="rfqs" element={<S><RfqsPage /></S>} />
              <Route path="rfqs/new" element={<S><RfqNewPage /></S>} />
              <Route path="rfqs/:rfqId" element={<S><RfqDetailPage /></S>} />
              <Route path="rfqs/:rfqId/rates" element={<S><RateEvalPage /></S>} />
              <Route path="rfqs/:rfqId/quote" element={<S><QuoteBuilderPage /></S>} />

              <Route path="rates" element={<S><RatesPage /></S>} />

              <Route path="quotes" element={<S><QuotesPage /></S>} />
              <Route path="quotes/new" element={<S><QuoteBuilderPage /></S>} />
              <Route path="quotes/:quoteId" element={<S><QuoteBuilderPage /></S>} />
              <Route path="quotes/:quoteId/approval" element={<S><QuoteApprovalPage /></S>} />
              <Route path="quotes/:quoteId/preview" element={<S><QuotePreviewPage /></S>} />

              <Route path="bookings" element={<S><BookingsPage /></S>} />
              <Route path="bookings/new" element={<S><BookingNewPage /></S>} />
              <Route path="bookings/:bookingId" element={<S><BookingDetailPage /></S>} />

              <Route path="shipments" element={<S><ShipmentsPage /></S>} />
              <Route path="shipments/new" element={<S><ShipmentNewPage /></S>} />
              <Route path="shipments/:shipmentId" element={<S><Shipment360Page /></S>} />
              <Route path="shipments/:shipmentId/journey" element={<S><JourneyPage /></S>} />
              <Route path="shipments/:shipmentId/milestones" element={<S><MilestonesPage /></S>} />

              <Route path="control-tower" element={<S><ControlTowerPage /></S>} />
              <Route path="control-tower/exceptions" element={<S><ExceptionCenterPage /></S>} />

              <Route path="customer/rfqs" element={<S><CustomerRfqsPage /></S>} />
              <Route path="customer/quotes" element={<S><CustomerQuotesPage /></S>} />
              <Route path="customer/quotes/:quoteId" element={<S><QuotePreviewPage /></S>} />

              <Route path="*" element={<S><PlaceholderPage /></S>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </MotionConfig>
  );
}
