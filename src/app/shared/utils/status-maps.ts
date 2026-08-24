import { AlertType } from '@core/models/analytics.model';
import {
  AppointmentStatus,
  MedicalHistoryType,
  MedicalSeverity,
  RiskLevel
} from '@core/models/appointment.model';
import { InvoiceStatus, PaymentStatus } from '@core/models/billing.model';
import { InventoryItem } from '@core/models/inventory-item.model';
import { ReminderStatus } from '@core/models/reminder.model';
import { WaitlistStatus } from '@core/models/waitlist.model';
import { PillTone } from '@shared/ui/status-pill/status-pill.component';

const NEAR_EXPIRY_WINDOW_DAYS = 30;

/**
 * `label` is an i18n key (`status.*`, see `en.ts`/`ar.ts`), not display text —
 * every call site pipes it through `| t` (templates) or `I18nService.t()`
 * (component code) before showing it.
 */
export interface StatusPillInfo {
  tone: PillTone;
  label: string;
}

export function appointmentStatusInfo(status: AppointmentStatus): StatusPillInfo {
  switch (status) {
    case 'booked':
      return { tone: 'teal', label: 'status.booked' };
    case 'in_progress':
      return { tone: 'amber', label: 'status.inProgress' };
    case 'done':
      return { tone: 'green', label: 'status.done' };
    case 'cancelled':
      return { tone: 'grey', label: 'status.cancelled' };
    case 'no_show':
      return { tone: 'red', label: 'status.noShow' };
  }
}

export function medicalSeverityInfo(severity: MedicalSeverity): StatusPillInfo {
  switch (severity) {
    case 'high':
      return { tone: 'red', label: 'status.severityHigh' };
    case 'medium':
      return { tone: 'amber', label: 'status.severityMedium' };
    case 'low':
      return { tone: 'grey', label: 'status.severityLow' };
  }
}

export function medicalTypeLabel(type: MedicalHistoryType): string {
  switch (type) {
    case 'allergy':
      return 'status.medicalAllergy';
    case 'condition':
      return 'status.medicalCondition';
    case 'medication':
      return 'status.medicalMedication';
  }
}

export function riskLevelInfo(risk: RiskLevel | null): StatusPillInfo {
  switch (risk) {
    case 'high':
      return { tone: 'red', label: 'status.riskHigh' };
    case 'medium':
      return { tone: 'amber', label: 'status.riskMedium' };
    case 'low':
      return { tone: 'green', label: 'status.riskLow' };
    default:
      return { tone: 'grey', label: 'status.riskUnscored' };
  }
}

/**
 * Buckets a patient's `noShowRiskScore` (0-100) into the same low/medium/high
 * tiers the ML service uses for per-appointment risk (LOW_RISK_THRESHOLD=30,
 * MEDIUM_RISK_THRESHOLD=60 in ml-service/app/model.py), so "risk" means the
 * same thing everywhere in the app.
 */
export function patientRiskBucket(score: number): RiskLevel {
  if (score < 30) return 'low';
  if (score < 60) return 'medium';
  return 'high';
}

export function patientRiskInfo(score: number): StatusPillInfo {
  return riskLevelInfo(patientRiskBucket(score));
}

/**
 * Same 30-day near-expiry window InventoryAlertsService already uses for the
 * daily low-stock/expiry digest, so the badge on the list page matches what
 * actually triggers an alert.
 */
export function stockStatusInfo(item: InventoryItem): StatusPillInfo {
  if (item.expiryDate) {
    const daysUntilExpiry = Math.ceil(
      (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry <= NEAR_EXPIRY_WINDOW_DAYS) {
      return { tone: 'red', label: 'status.expiringSoon' };
    }
  }
  if (Number(item.quantityInStock) <= Number(item.lowStockThreshold)) {
    return { tone: 'amber', label: 'status.lowStock' };
  }
  return { tone: 'green', label: 'status.inStock' };
}

export function alertTypeInfo(type: AlertType): StatusPillInfo {
  return type === 'near_expiry'
    ? { tone: 'red', label: 'status.nearExpiry' }
    : { tone: 'amber', label: 'status.lowStock' };
}

export function reminderStatusInfo(status: ReminderStatus): StatusPillInfo {
  switch (status) {
    case 'queued':
      return { tone: 'grey', label: 'status.queued' };
    case 'sent':
      return { tone: 'green', label: 'status.sent' };
    case 'failed':
      return { tone: 'red', label: 'status.failed' };
  }
}

export function invoiceStatusInfo(status: InvoiceStatus): StatusPillInfo {
  switch (status) {
    case 'draft':
      return { tone: 'grey', label: 'status.draft' };
    case 'issued':
      return { tone: 'teal', label: 'status.issued' };
    case 'partially_paid':
      return { tone: 'amber', label: 'status.partiallyPaid' };
    case 'paid':
      return { tone: 'green', label: 'status.paid' };
    case 'cancelled':
      return { tone: 'red', label: 'status.cancelled' };
  }
}

export function paymentStatusInfo(status: PaymentStatus): StatusPillInfo {
  switch (status) {
    case 'unpaid':
      return { tone: 'red', label: 'status.unpaid' };
    case 'partially_paid':
      return { tone: 'amber', label: 'status.partiallyPaid' };
    case 'paid':
      return { tone: 'green', label: 'status.paid' };
  }
}

export function waitlistStatusInfo(status: WaitlistStatus): StatusPillInfo {
  switch (status) {
    case 'waiting':
      return { tone: 'amber', label: 'status.waiting' };
    case 'offered':
      return { tone: 'teal', label: 'status.offered' };
    case 'filled':
      return { tone: 'green', label: 'status.filled' };
    case 'expired':
      return { tone: 'grey', label: 'status.expired' };
  }
}

/**
 * Waitlist "priority" is patient reliability: a lower `noShowRiskScore`
 * (same [[patientRiskBucket]] tiers) means the slot is more likely to
 * actually get used, so it's offered first. Tone-inverted vs. risk — low
 * risk reads as high priority here.
 */
export function waitlistPriorityInfo(riskScore: number): StatusPillInfo {
  switch (patientRiskBucket(riskScore)) {
    case 'low':
      return { tone: 'green', label: 'status.priorityHigh' };
    case 'medium':
      return { tone: 'amber', label: 'status.priorityMedium' };
    case 'high':
      return { tone: 'red', label: 'status.priorityLow' };
  }
}
