import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  SEED_EXCEPTIONS,
  SEED_EXEC,
  SEED_EXEC_ACTIVITY,
  nextShipmentId,
  nowExec,
  type ExcStatus,
  type ExceptionX,
  type ExecActivity,
  type ExecShipment,
  type ExecStage,
  type Leg,
  type MilestoneX,
} from "@/lib/execution";
import { useApp } from "./AppContext";

interface ExecState {
  shipments: ExecShipment[];
  exceptions: ExceptionX[];
  activity: ExecActivity[];
  byId: (id: string) => ExecShipment | undefined;
  activityFor: (id: string) => ExecActivity[];
  exceptionsFor: (id: string) => ExceptionX[];
  createShipment: (s: Omit<ExecShipment, "id">) => ExecShipment;
  patchShipment: (id: string, p: Partial<ExecShipment>) => void;
  addLeg: (sid: string, leg: Omit<Leg, "id" | "seq">) => void;
  patchLeg: (sid: string, legId: string, p: Partial<Leg>) => void;
  removeLeg: (sid: string, legId: string) => void;
  moveLeg: (sid: string, legId: string, dir: -1 | 1) => void;
  addMilestone: (sid: string, m: Omit<MilestoneX, "id">) => void;
  patchMilestone: (sid: string, mid: string, p: Partial<MilestoneX>) => void;
  addNote: (sid: string, text: string, legId?: string) => void;
  setStage: (sid: string, stage: ExecStage) => void;
  cancelShipment: (sid: string, reason: string, note?: string) => void;
  reportException: (e: Omit<ExceptionX, "id" | "opened" | "status">) => void;
  patchException: (id: string, p: Partial<ExceptionX>) => void;
  resolveException: (id: string, resolution: string, rootCause?: string) => void;
  log: (sid: string, action: string, summary: string) => void;
  nextId: () => string;
}

const Ctx = createContext<ExecState | null>(null);

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const { user, pushToast, addNotification } = useApp();
  const [shipments, setShipments] = useState(SEED_EXEC);
  const [exceptions, setExceptions] = useState(SEED_EXCEPTIONS);
  const [activity, setActivity] = useState(SEED_EXEC_ACTIVITY);

  const log = useCallback(
    (sid: string, action: string, summary: string) => {
      setActivity((prev) => [
        { id: "ea-" + Math.random().toString(36).slice(2, 8), shipmentId: sid, time: nowExec(), by: user.name, action, summary },
        ...prev,
      ]);
    },
    [user.name],
  );

  const byId = useCallback((id: string) => shipments.find((s) => s.id === id), [shipments]);
  const activityFor = useCallback((id: string) => activity.filter((a) => a.shipmentId === id), [activity]);
  const exceptionsFor = useCallback((id: string) => exceptions.filter((e) => e.shipmentId === id), [exceptions]);

  const patchShipment = useCallback((id: string, p: Partial<ExecShipment>) => {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)));
  }, []);

  const createShipment = useCallback(
    (s: Omit<ExecShipment, "id">) => {
      const id = nextShipmentId(shipments.map((x) => x.id));
      const full = { ...s, id };
      setShipments((prev) => [full, ...prev]);
      log(id, "Shipment created", `Master shipment created${s.bookingId ? ` from booking ${s.bookingId}` : ""}.`);
      addNotification({ type: "arrival", title: "Shipment created", record: id, desc: `${s.origin} → ${s.destination}`, href: `/app/shipments/${id}` });
      pushToast("success", "Shipment created", id);
      return full;
    },
    [shipments, log, addNotification, pushToast],
  );

  const addLeg = useCallback(
    (sid: string, legIn: Omit<Leg, "id" | "seq">) => {
      setShipments((prev) =>
        prev.map((s) => {
          if (s.id !== sid) return s;
          const leg: Leg = { ...legIn, id: "L" + (s.legs.length + 1) + "-" + Math.random().toString(36).slice(2, 5), seq: s.legs.length + 1 };
          return { ...s, legs: [...s.legs, leg] };
        }),
      );
      log(sid, "Leg added", `${legIn.mode} · ${legIn.origin} → ${legIn.destination}`);
    },
    [log],
  );

  const patchLeg = useCallback(
    (sid: string, legId: string, p: Partial<Leg>) => {
      setShipments((prev) =>
        prev.map((s) =>
          s.id === sid ? { ...s, legs: s.legs.map((l) => (l.id === legId ? { ...l, ...p } : l)) } : s,
        ),
      );
    },
    [],
  );

  const removeLeg = useCallback(
    (sid: string, legId: string) => {
      setShipments((prev) =>
        prev.map((s) =>
          s.id === sid
            ? { ...s, legs: s.legs.filter((l) => l.id !== legId).map((l, i) => ({ ...l, seq: i + 1 })) }
            : s,
        ),
      );
      log(sid, "Leg removed", "Planned leg deleted from journey.");
    },
    [log],
  );

  const moveLeg = useCallback((sid: string, legId: string, dir: -1 | 1) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== sid) return s;
        const i = s.legs.findIndex((l) => l.id === legId);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= s.legs.length) return s;
        const legs = [...s.legs];
        [legs[i], legs[j]] = [legs[j], legs[i]];
        return { ...s, legs: legs.map((l, k) => ({ ...l, seq: k + 1 })) };
      }),
    );
  }, []);

  const addMilestone = useCallback(
    (sid: string, m: Omit<MilestoneX, "id">) => {
      setShipments((prev) =>
        prev.map((s) =>
          s.id === sid
            ? { ...s, milestones: [...s.milestones, { ...m, id: "M" + Math.random().toString(36).slice(2, 7) }] }
            : s,
        ),
      );
      log(sid, "Milestone added", `${m.name} planned ${m.planned}.`);
    },
    [log],
  );

  const patchMilestone = useCallback(
    (sid: string, mid: string, p: Partial<MilestoneX>) => {
      setShipments((prev) =>
        prev.map((s) =>
          s.id === sid
            ? { ...s, milestones: s.milestones.map((m) => (m.id === mid ? { ...m, ...p } : m)) }
            : s,
        ),
      );
    },
    [],
  );

  const addNote = useCallback(
    (sid: string, text: string, legId?: string) => {
      setShipments((prev) =>
        prev.map((s) =>
          s.id === sid
            ? { ...s, notes: [{ id: "nt-" + Math.random().toString(36).slice(2, 7), time: nowExec(), by: user.name, text, legId }, ...s.notes] }
            : s,
        ),
      );
      log(sid, "Note added", text.slice(0, 80));
    },
    [user.name, log],
  );

  const setStage = useCallback(
    (sid: string, stage: ExecStage) => {
      patchShipment(sid, { stage });
      log(sid, "Status changed", `Shipment stage moved to ${stage}.`);
      pushToast("success", "Status updated", stage);
    },
    [patchShipment, log, pushToast],
  );

  const cancelShipment = useCallback(
    (sid: string, reason: string, note?: string) => {
      patchShipment(sid, { stage: "Cancelled", cancelled: { reason, note } });
      log(sid, "Shipment cancelled", reason);
      pushToast("error", "Shipment cancelled", reason);
    },
    [patchShipment, log, pushToast],
  );

  const reportException = useCallback(
    (e: Omit<ExceptionX, "id" | "opened" | "status">) => {
      const id = "EXC-" + (300 + exceptions.length + Math.floor(Math.random() * 40));
      setExceptions((prev) => [{ ...e, id, opened: nowExec(), status: "Open" }, ...prev]);
      setShipments((prev) => prev.map((s) => (s.id === e.shipmentId ? { ...s, exception: true } : s)));
      log(e.shipmentId, "Exception reported", `${e.type} (${id}) · ${e.severity}`);
      addNotification({ type: "delayed", title: "Exception reported", record: e.shipmentId, desc: `${e.type} · ${e.severity}`, href: `/app/control-tower/exceptions` });
      pushToast("error", "Exception reported", `${e.type} · ${e.severity}`);
    },
    [exceptions.length, log, addNotification, pushToast],
  );

  const patchException = useCallback(
    (id: string, p: Partial<ExceptionX>) => {
      setExceptions((prev) => prev.map((e) => (e.id === id ? { ...e, ...p } : e)));
      const exc = exceptions.find((e) => e.id === id);
      if (exc && p.owner) log(exc.shipmentId, "Exception assigned", `${id} assigned to ${p.owner}.`);
      if (exc && p.status && !p.owner) log(exc.shipmentId, "Exception updated", `${id} → ${p.status}.`);
    },
    [exceptions, log],
  );

  const resolveException = useCallback(
    (id: string, resolution: string, rootCause?: string) => {
      const exc = exceptions.find((e) => e.id === id);
      setExceptions((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "Resolved" as ExcStatus, resolution, rootCause } : e)),
      );
      if (exc) {
        const stillOpen = exceptions.some((e) => e.shipmentId === exc.shipmentId && e.id !== id && e.status !== "Resolved" && e.status !== "Closed");
        setShipments((prev) => prev.map((s) => (s.id === exc.shipmentId ? { ...s, exception: stillOpen } : s)));
        log(exc.shipmentId, "Exception resolved", `${id} resolved — ${resolution.slice(0, 70)}`);
        pushToast("success", "Exception resolved", id);
      }
    },
    [exceptions, log, pushToast],
  );

  const nextId = useCallback(() => nextShipmentId(shipments.map((s) => s.id)), [shipments]);

  const value = useMemo<ExecState>(
    () => ({
      shipments, exceptions, activity, byId, activityFor, exceptionsFor,
      createShipment, patchShipment, addLeg, patchLeg, removeLeg, moveLeg,
      addMilestone, patchMilestone, addNote, setStage, cancelShipment,
      reportException, patchException, resolveException, log, nextId,
    }),
    [shipments, exceptions, activity, byId, activityFor, exceptionsFor, createShipment, patchShipment, addLeg, patchLeg, removeLeg, moveLeg, addMilestone, patchMilestone, addNote, setStage, cancelShipment, reportException, patchException, resolveException, log, nextId],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExecution() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useExecution must be used within ExecutionProvider");
  return ctx;
}
