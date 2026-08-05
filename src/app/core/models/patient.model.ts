import { AppointmentStatus } from './appointment.model';

export interface PatientAppointmentSummary {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  procedureName: string;
  doctorName: string;
  finalPrice: string | null;
}

export interface AttendanceSummary {
  totalVisits: number;
  noShowCount: number;
  cancellationRate: number;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  dateOfBirth: string | null;
  medicalNotes: string | null;
  noShowRiskScore: number;
  createdAt: string;
  appointments?: PatientAppointmentSummary[];
  attendanceSummary?: AttendanceSummary;
}

export interface CreatePatientPayload {
  name: string;
  phone: string;
  email?: string;
}

export interface UpdatePatientPayload {
  name?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  medicalNotes?: string;
}
