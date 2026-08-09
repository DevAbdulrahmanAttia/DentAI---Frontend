export type DelayVisitStatus =
  | 'not_arrived'
  | 'checked_in'
  | 'waiting'
  | 'notified'
  | 'called'
  | 'ignored';

export interface DelayedAppointmentEntry {
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  procedureName: string;
  originalScheduledAt: string;
  estimatedDelayMin: number;
  /** originalScheduledAt + estimatedDelayMin — when the visit is actually expected to begin. */
  estimatedStartAt: string;
  visitStatus: DelayVisitStatus;
  /**
   * The cascade has pushed this visit past the doctor's closing time, so it
   * can no longer finish inside the working day. Advisory only — the system
   * never cancels or moves anything on its own; this exists so the front
   * desk can decide (offer a new slot, ask the doctor to stay, or call).
   */
  atRiskAfterHours: boolean;
  /** The doctor's closing time (HH:MM) for that date, when they have one. */
  closesAt: string | null;
}

export interface DelayKpis {
  delayedCount: number;
  averageDelayMin: number;
  longestDelayMin: number;
  atRiskAfterHoursCount: number;
}

export type DelayActionType = 'marked_waiting' | 'notified' | 'called' | 'ignored';

export interface RecordDelayActionPayload {
  action: DelayActionType;
  notes?: string;
}

export interface AppointmentDelayAction {
  id: string;
  action: DelayActionType;
  notes: string | null;
  performedAt: string;
}
