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
  visitStatus: DelayVisitStatus;
}

export interface DelayKpis {
  delayedCount: number;
  averageDelayMin: number;
  longestDelayMin: number;
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
