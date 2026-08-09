export interface ClinicSettings {
  id: string;
  clinicName: string;
  address: string | null;
  phone: string | null;
  workingDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  standardReminderLeadHours: number[];
  highRiskReminderLeadHours: number[];
  slotGranularityMin: number;
  closingBufferMin: number;
  appointmentBufferMin: number;
  useLearnedDurations: boolean;
}

export type UpdateClinicSettings = Partial<Omit<ClinicSettings, 'id'>>;
