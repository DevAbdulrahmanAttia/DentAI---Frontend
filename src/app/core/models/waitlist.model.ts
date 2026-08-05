import { User } from './auth.model';
import { Patient } from './patient.model';
import { ProcedureType } from './procedure.model';

export type WaitlistStatus = 'waiting' | 'offered' | 'filled' | 'expired';

export interface WaitlistEntry {
  id: string;
  patient: Patient;
  preferredDateFrom: string;
  preferredDateTo: string | null;
  preferredTimeStart: string | null;
  preferredTimeEnd: string | null;
  status: WaitlistStatus;
  offeredAt: string | null;
  offeredDoctor: User | null;
  offeredProcedureType: ProcedureType | null;
  offeredScheduledAt: string | null;
  createdAt: string;
}

export interface CreateWaitlistEntryPayload {
  patientId: string;
  preferredDateFrom: string;
  preferredDateTo?: string;
  preferredTimeStart?: string;
  preferredTimeEnd?: string;
}

export interface AcceptWaitlistEntryPayload {
  doctorId: string;
  procedureTypeId: string;
  scheduledAt: string;
}

export interface WaitlistOfferPreview {
  patientName: string;
  doctorName: string;
  procedureName: string;
  scheduledAt: string;
}
