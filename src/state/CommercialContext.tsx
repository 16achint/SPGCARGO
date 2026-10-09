import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  SEED_BOOKINGS,
  SEED_CUSTOMERS,
  SEED_NOTES,
  SEED_QUOTES,
  SEED_RATES,
  SEED_RFQS,
  SEED_TIMELINE,
  nextNum,
  nowStamp,
  optionTotals,
  rateStatus,
  type Booking,
  type CommNote,
  type Customer,
  type Quote,
  type Rate,
  type Rfq,
  type TimelineItem,
} from "@/lib/commercial";
import { useApp } from "./AppContext";

interface CommercialState {
  customers: Customer[];
  rfqs: Rfq[];
  rates: Rate[];
  quotes: Quote[];
  bookings: Booking[];
  timeline: TimelineItem[];
  notes: CommNote[];
  customerById: (id: string) => Customer | undefined;
  rfqById: (id: string) => Rfq | undefined;
  quoteById: (id: string) => Quote | undefined;
  bookingById: (id: string) => Booking | undefined;
  rfqsFor: (customerId: string) => Rfq[];
  quotesFor: (customerId: string) => Quote[];
  bookingsFor: (customerId: string) => Booking[];
  timelineFor: (type: TimelineItem["entityType"], id: string) => TimelineItem[];
  addCustomer: (c: Customer) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  addRfq: (r: Rfq) => Rfq;
  updateRfq: (id: string, patch: Partial<Rfq>) => void;
  addNote: (n: Omit<CommNote, "id" | "time" | "by">) => void;
  addRate: (r: Rate) => void;
  updateRate: (id: string, patch: Partial<Rate>) => void;
  addQuote: (q: Quote) => Quote;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  saveQuote: (q: Quote) => void;
  requestApproval: (id: string) => void;
  approveQuote: (id: string) => void;
  rejectQuote: (id: string, comment: string) => void;
  requestChanges: (id: string, comment: string) => void;
  sendQuote: (id: string) => void;
  acceptQuote: (id: string, optionId: string) => void;
  rejectByCustomer: (id: string, reason: string, comment?: string) => void;
  newQuoteVersion: (id: string) => Quote;
  addBooking: (b: Booking) => Booking;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  confirmBooking: (id: string) => void;
  nextCustomerId: () => string;
  nextRfqId: () => string;
  nextQuoteId: () => string;
  nextBookingId: () => string;
  nextRateId: () => string;
  log: (item: Omit<TimelineItem, "id" | "time" | "by">) => void;
}

const Ctx = createContext<CommercialState | null>(null);

export function CommercialProvider({ children }: { children: ReactNode }) {
  const { user, pushToast, addNotification } = useApp();
  const [customers, setCustomers] = useState(SEED_CUSTOMERS);
  const [rfqs, setRfqs] = useState(SEED_RFQS);
  const [rates, setRates] = useState(SEED_RATES);
  const [quotes, setQuotes] = useState(SEED_QUOTES);
  const [bookings, setBookings] = useState(SEED_BOOKINGS);
  const [timeline, setTimeline] = useState(SEED_TIMELINE);
  const [notes, setNotes] = useState(SEED_NOTES);

  const log = useCallback(
    (item: Omit<TimelineItem, "id" | "time" | "by">) => {
      setTimeline((prev) => [
        {
          id: "tl-" + Math.random().toString(36).slice(2, 8),
          time: nowStamp(),
          by: user.name,
          ...item,
        },
        ...prev,
      ]);
    },
    [user.name],
  );

  const customerById = useCallback((id: string) => customers.find((c) => c.id === id), [customers]);
  const rfqById = useCallback((id: string) => rfqs.find((r) => r.id === id), [rfqs]);
  const quoteById = useCallback((id: string) => quotes.find((q) => q.id === id), [quotes]);
  const bookingById = useCallback((id: string) => bookings.find((b) => b.id === id), [bookings]);
  const rfqsFor = useCallback((id: string) => rfqs.filter((r) => r.customerId === id), [rfqs]);
  const quotesFor = useCallback((id: string) => quotes.filter((q) => q.customerId === id), [quotes]);
  const bookingsFor = useCallback((id: string) => bookings.filter((b) => b.customerId === id), [bookings]);
  const timelineFor = useCallback(
    (type: TimelineItem["entityType"], id: string) =>
      timeline.filter((t) => t.entityType === type && t.entityId === id),
    [timeline],
  );

  const addCustomer = useCallback(
    (c: Customer) => {
      setCustomers((p) => [c, ...p]);
      log({ entityType: "customer", entityId: c.id, text: `Customer ${c.company} created` });
      pushToast("success", "Customer created", c.id);
    },
    [log, pushToast],
  );

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setCustomers((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const addRfq = useCallback(
    (r: Rfq) => {
      setRfqs((p) => [r, ...p]);
      log({ entityType: "rfq", entityId: r.id, text: `RFQ created · ${r.origin} → ${r.destination}` });
      addNotification({
        type: "quote",
        title: "New RFQ assigned",
        record: r.id,
        desc: `${r.origin} → ${r.destination}`,
        href: `/app/rfqs/${r.id}`,
      });
      return r;
    },
    [log, addNotification],
  );

  const updateRfq = useCallback((id: string, patch: Partial<Rfq>) => {
    setRfqs((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const addNote = useCallback(
    (n: Omit<CommNote, "id" | "time" | "by">) => {
      const note: CommNote = {
        ...n,
        id: "cm-" + Math.random().toString(36).slice(2, 8),
        time: nowStamp(),
        by: user.name,
      };
      setNotes((p) => [note, ...p]);
      log({ entityType: "rfq", entityId: n.rfqId, text: `Note added · ${n.visibility}` });
    },
    [user.name, log],
  );

  const addRate = useCallback(
    (r: Rate) => {
      const status = rateStatus(r.validTo);
      setRates((p) => [{ ...r, status }, ...p]);
      pushToast("success", "Rate added", r.charge);
    },
    [pushToast],
  );

  const updateRate = useCallback((id: string, patch: Partial<Rate>) => {
    setRates((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const addQuote = useCallback(
    (q: Quote) => {
      setQuotes((p) => [q, ...p]);
      log({ entityType: "quote", entityId: q.id, text: `Quotation V${q.version} created` });
      updateRfq(q.rfqId, { status: "Quote Preparation" });
      return q;
    },
    [log, updateRfq],
  );

  const updateQuote = useCallback((id: string, patch: Partial<Quote>) => {
    setQuotes((p) => p.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }, []);

  const saveQuote = useCallback(
    (q: Quote) => {
      setQuotes((p) => {
        const i = p.findIndex((x) => x.id === q.id);
        if (i === -1) return [q, ...p];
        const next = [...p];
        next[i] = q;
        return next;
      });
      pushToast("success", "Draft saved", `${q.id} · V${q.version}`);
    },
    [pushToast],
  );

  const requestApproval = useCallback(
    (id: string) => {
      setQuotes((p) =>
        p.map((q) => (q.id === id ? { ...q, status: "Awaiting Approval" } : q)),
      );
      const q = quotes.find((x) => x.id === id);
      log({ entityType: "quote", entityId: id, text: "Submitted for internal approval" });
      addNotification({
        type: "quote",
        title: "Quote awaiting approval",
        record: id,
        desc: q ? `${q.id} V${q.version} needs review` : "Internal approval required",
        href: `/app/quotes/${id}/approval`,
      });
      pushToast("info", "Sent for approval", id);
    },
    [quotes, log, addNotification, pushToast],
  );

  const approveQuote = useCallback(
    (id: string) => {
      setQuotes((p) =>
        p.map((q) =>
          q.id === id ? { ...q, status: "Approved", approvedBy: user.name } : q,
        ),
      );
      log({ entityType: "quote", entityId: id, text: "Quote approved" });
      addNotification({
        type: "quote",
        title: "Quote approved",
        record: id,
        desc: "Ready to send to the customer",
        href: `/app/quotes/${id}`,
      });
      pushToast("success", "Quote approved", id);
    },
    [user.name, log, addNotification, pushToast],
  );

  const rejectQuote = useCallback(
    (id: string, comment: string) => {
      setQuotes((p) =>
        p.map((q) => (q.id === id ? { ...q, status: "Rejected", rejectComment: comment } : q)),
      );
      log({ entityType: "quote", entityId: id, text: `Quote rejected · ${comment}` });
      addNotification({
        type: "quote",
        title: "Quote rejected",
        record: id,
        desc: comment,
        href: `/app/quotes/${id}`,
      });
      pushToast("error", "Quote rejected", comment);
    },
    [log, addNotification, pushToast],
  );

  const requestChanges = useCallback(
    (id: string, comment: string) => {
      setQuotes((p) =>
        p.map((q) =>
          q.id === id ? { ...q, status: "Changes Requested", changeComment: comment } : q,
        ),
      );
      log({ entityType: "quote", entityId: id, text: `Changes requested · ${comment}` });
      pushToast("info", "Changes requested", comment);
    },
    [log, pushToast],
  );

  const sendQuote = useCallback(
    (id: string) => {
      setQuotes((p) =>
        p.map((q) => (q.id === id ? { ...q, status: "Awaiting Customer" } : q)),
      );
      const q = quotes.find((x) => x.id === id);
      if (q) updateRfq(q.rfqId, { status: "Awaiting Customer" });
      log({ entityType: "quote", entityId: id, text: "Quote sent to customer" });
      addNotification({
        type: "quote",
        title: "Quote awaiting customer",
        record: id,
        desc: "Customer can now review options",
        href: `/app/customer/quotes/${id}`,
      });
      pushToast("success", "Quote sent", id);
    },
    [quotes, updateRfq, log, addNotification, pushToast],
  );

  const acceptQuote = useCallback(
    (id: string, optionId: string) => {
      setQuotes((p) =>
        p.map((q) =>
          q.id === id
            ? { ...q, status: "Accepted", acceptedOptionId: optionId, locked: true }
            : q,
        ),
      );
      const q = quotes.find((x) => x.id === id);
      if (q) updateRfq(q.rfqId, { status: "Won" });
      log({ entityType: "quote", entityId: id, text: `Customer accepted ${optionId}` });
      addNotification({
        type: "quote",
        title: "Quote accepted",
        record: id,
        desc: "Ready to confirm booking",
        href: `/app/bookings/new?quote=${id}`,
      });
      pushToast("success", "Quote accepted", "Booking can now be confirmed.");
    },
    [quotes, updateRfq, log, addNotification, pushToast],
  );

  const rejectByCustomer = useCallback(
    (id: string, reason: string, comment?: string) => {
      setQuotes((p) =>
        p.map((q) =>
          q.id === id
            ? { ...q, status: "Rejected by Customer", rejectReason: reason, rejectComment: comment, locked: true }
            : q,
        ),
      );
      const q = quotes.find((x) => x.id === id);
      if (q) updateRfq(q.rfqId, { status: "Lost" });
      log({ entityType: "quote", entityId: id, text: `Customer rejected · ${reason}` });
      pushToast("info", "Quote rejected", reason);
    },
    [quotes, updateRfq, log, pushToast],
  );

  const newQuoteVersion = useCallback(
    (id: string) => {
      const src = quotes.find((q) => q.id === id);
      if (!src) throw new Error("missing quote");
      const version = src.version + 1;
      const next: Quote = {
        ...src,
        version,
        status: "Draft",
        locked: false,
        acceptedOptionId: undefined,
        rejectReason: undefined,
        rejectComment: undefined,
        changeComment: undefined,
        approvedBy: undefined,
        created: nowStamp(),
        versions: [
          ...src.versions,
          { version, created: nowStamp(), by: user.name, status: "Draft" },
        ],
      };
      setQuotes((p) => p.map((q) => (q.id === id ? next : q)));
      log({ entityType: "quote", entityId: id, text: `Version ${version} created` });
      pushToast("success", `Version ${version} created`, id);
      return next;
    },
    [quotes, user.name, log, pushToast],
  );

  const addBooking = useCallback(
    (b: Booking) => {
      setBookings((p) => [b, ...p]);
      log({ entityType: "booking", entityId: b.id, text: "Booking created from accepted quote" });
      return b;
    },
    [log],
  );

  const updateBooking = useCallback((id: string, patch: Partial<Booking>) => {
    setBookings((p) => p.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const confirmBooking = useCallback(
    (id: string) => {
      setBookings((p) =>
        p.map((b) =>
          b.id === id ? { ...b, status: "Confirmed", confirmationDate: new Date().toISOString().slice(0, 10) } : b,
        ),
      );
      log({ entityType: "booking", entityId: id, text: "Booking confirmed — ready for shipment setup" });
      addNotification({
        type: "arrival",
        title: "Booking confirmed",
        record: id,
        desc: "Commercial handoff is ready for shipment setup.",
        href: `/app/bookings/${id}`,
      });
      pushToast("success", "Booking confirmed", id);
    },
    [log, addNotification, pushToast],
  );

  const nextCustomerId = useCallback(() => nextNum(customers.map((c) => c.id), "CUST-"), [customers]);
  const nextRfqId = useCallback(() => nextNum(rfqs.map((r) => r.id), "SPG-RFQ-"), [rfqs]);
  const nextQuoteId = useCallback(() => nextNum(quotes.map((q) => q.id), "SPG-QUO-"), [quotes]);
  const nextBookingId = useCallback(() => nextNum(bookings.map((b) => b.id), "SPG-BKG-"), [bookings]);
  const nextRateId = useCallback(() => nextNum(rates.map((r) => r.id), "RT-"), [rates]);

  const value = useMemo<CommercialState>(
    () => ({
      customers,
      rfqs,
      rates,
      quotes,
      bookings,
      timeline,
      notes,
      customerById,
      rfqById,
      quoteById,
      bookingById,
      rfqsFor,
      quotesFor,
      bookingsFor,
      timelineFor,
      addCustomer,
      updateCustomer,
      addRfq,
      updateRfq,
      addNote,
      addRate,
      updateRate,
      addQuote,
      updateQuote,
      saveQuote,
      requestApproval,
      approveQuote,
      rejectQuote,
      requestChanges,
      sendQuote,
      acceptQuote,
      rejectByCustomer,
      newQuoteVersion,
      addBooking,
      updateBooking,
      confirmBooking,
      nextCustomerId,
      nextRfqId,
      nextQuoteId,
      nextBookingId,
      nextRateId,
      log,
    }),
    [
      customers, rfqs, rates, quotes, bookings, timeline, notes,
      customerById, rfqById, quoteById, bookingById, rfqsFor, quotesFor, bookingsFor, timelineFor,
      addCustomer, updateCustomer, addRfq, updateRfq, addNote, addRate, updateRate,
      addQuote, updateQuote, saveQuote, requestApproval, approveQuote, rejectQuote, requestChanges,
      sendQuote, acceptQuote, rejectByCustomer, newQuoteVersion, addBooking, updateBooking, confirmBooking,
      nextCustomerId, nextRfqId, nextQuoteId, nextBookingId, nextRateId, log,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCommercial() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCommercial must be used within CommercialProvider");
  return ctx;
}

export { optionTotals };
