import { User } from './auth.model';
import { Patient } from './patient.model';
import { ProcedureType } from './procedure.model';

export type AppointmentStatus =
  | 'booked'
  | 'in_progress'
  | 'done'
  | 'cancelled'
  | 'no_show';
export type RiskLevel = 'low' | 'medium' | 'high';

/** Statuses staff can set directly; in_progress goes through start(). */
export type SettableAppointmentStatus = Exclude<
  AppointmentStatus,
  'booked' | 'in_progress'
>;

/**
 * Right after booking, `doctor` may only carry `{ id }` (the create response
 * isn't re-fetched with relations) — everywhere else (list/get) it's a full
 * User. Type as partial-but-guaranteed-id to cover both safely.
 */
export type AppointmentDoctor = Partial<User> & { id: string };

export interface Appointment {
  id: string;
  patient: Patient;
  doctor: AppointmentDoctor;
  procedureType: ProcedureType;
  scheduledAt: string;
  status: AppointmentStatus;
  riskLevel: RiskLevel | null;
  riskScore: number | null;
  finalPrice: string | null;
  createdAt: string;
  durationMin: number;
  arrivedAt: string | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
}

export type ReadinessWarningCode =
  | 'medical_high'
  | 'medical_other'
  | 'insufficient_stock'
  | 'expired_material'
  | 'assistant_recommended'
  | 'no_bill_of_materials';

export interface ReadinessWarning {
  code: ReadinessWarningCode;
  message: string;
}

export interface MaterialReadiness {
  inventoryItemId: string;
  name: string;
  unit: string;
  required: number;
  inStock: number;
  sufficient: boolean;
  expiryDate: string | null;
  expired: boolean;
}

export interface AppointmentReadiness {
  appointmentId: string;
  procedureName: string;
  requiresAnesthesia: boolean;
  requiresAssistant: boolean;
  canStart: boolean;
  requiresAcknowledgement: boolean;
  blockers: ReadinessWarning[];
  warnings: ReadinessWarning[];
  materials: MaterialReadiness[];
  medicalWarnings: MedicalHistoryEntry[];
}

export type MedicalHistoryType = 'allergy' | 'condition' | 'medication';
export type MedicalSeverity = 'low' | 'medium' | 'high';

export interface MedicalHistoryEntry {
  id: string;
  type: MedicalHistoryType;
  name: string;
  severity: MedicalSeverity;
  anesthesiaRelevant: boolean;
  notes: string | null;
  isActive: boolean;
  recordedAt: string;
}

export interface CreateMedicalHistoryEntryPayload {
  type: MedicalHistoryType;
  name: string;
  severity?: MedicalSeverity;
  anesthesiaRelevant?: boolean;
  notes?: string;
}

export interface CreateAppointmentPayload {
  patientId: string;
  doctorId: string;
  procedureTypeId: string;
  scheduledAt: string;
}

export interface QueryAppointmentsParams {
  from?: string;
  to?: string;
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
}
