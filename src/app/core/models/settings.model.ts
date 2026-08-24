export type DepositType = 'fixed' | 'percentage' | 'consultation_fee';

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
  requireDepositForHighRisk: boolean;
  depositType: DepositType;
  depositAmount: number;
  /** Hard ceiling on any deposit, as a percentage of the procedure's price. */
  depositMaxPercentOfPrice: number;
  /** Used for any dentist with no consultation fee of their own. */
  defaultConsultationFee: number;
  consultationCreditedToTreatment: boolean;
}

/** One cell of the deposit-policy grid — see GET /deposits/policy-preview. */
export interface DepositPolicyPreviewRow {
  doctorName: string;
  procedureName: string;
  procedurePrice: number;
  depositEgp: number;
  percentOfPrice: number;
  /** True where the ceiling reduced what the policy would otherwise ask. */
  cappedByLimit: boolean;
}

export interface DepositPolicyPreview {
  depositType: DepositType;
  maxPercentOfPrice: number;
  rows: DepositPolicyPreviewRow[];
}

export type UpdateClinicSettings = Partial<Omit<ClinicSettings, 'id'>>;
