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

export interface StatusPillInfo {
  tone: PillTone;
  label: string;
}

export function appointmentStatusInfo(status: AppointmentStatus): StatusPillInfo {
  switch (status) {
    case 'booked':
      return { tone: 'teal', label: 'Booked' };
    case 'in_progress':
      return { tone: 'amber', label: 'In progress' };
    case 'done':
      return { tone: 'green', label: 'Done' };
    case 'cancelled':
      return { tone: 'grey', label: 'Cancelled' };
    case 'no_show':
      return { tone: 'red', label: 'No-show' };
  }
}

export function medicalSeverityInfo(severity: MedicalSeverity): StatusPillInfo {
  switch (severity) {
    case 'high':
      return { tone: 'red', label: 'High' };
    case 'medium':
      return { tone: 'amber', label: 'Medium' };
    case 'low':
      return { tone: 'grey', label: 'Low' };
  }
}

export function medicalTypeLabel(type: MedicalHistoryType): string {
  switch (type) {
    case 'allergy':
      return 'Allergy';
    case 'condition':
      return 'Condition';
    case 'medication':
      return 'Medication';
  }
}

export function riskLevelInfo(risk: RiskLevel | null): StatusPillInfo {
  switch (risk) {
    case 'high':
      return { tone: 'red', label: 'High risk' };
    case 'medium':
      return { tone: 'amber', label: 'Medium risk' };
    case 'low':
      return { tone: 'green', label: 'Low risk' };
    default:
      return { tone: 'grey', label: 'Unscored' };
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
      return { tone: 'red', label: 'Expiring soon' };
    }
  }
  if (Number(item.quantityInStock) <= Number(item.lowStockThreshold)) {
    return { tone: 'amber', label: 'Low stock' };
  }
  return { tone: 'green', label: 'In stock' };
}

export function alertTypeInfo(type: AlertType): StatusPillInfo {
  return type === 'near_expiry'
    ? { tone: 'red', label: 'Near expiry' }
    : { tone: 'amber', label: 'Low stock' };
}

export function reminderStatusInfo(status: ReminderStatus): StatusPillInfo {
  switch (status) {
    case 'queued':
      return { tone: 'grey', label: 'Queued' };
    case 'sent':
      return { tone: 'green', label: 'Sent' };
    case 'failed':
      return { tone: 'red', label: 'Failed' };
  }
}

export function invoiceStatusInfo(status: InvoiceStatus): StatusPillInfo {
  switch (status) {
    case 'draft':
      return { tone: 'grey', label: 'Draft' };
    case 'issued':
      return { tone: 'teal', label: 'Issued' };
    case 'partially_paid':
      return { tone: 'amber', label: 'Partially paid' };
    case 'paid':
      return { tone: 'green', label: 'Paid' };
    case 'cancelled':
      return { tone: 'red', label: 'Cancelled' };
  }
}

export function paymentStatusInfo(status: PaymentStatus): StatusPillInfo {
  switch (status) {
    case 'unpaid':
      return { tone: 'red', label: 'Unpaid' };
    case 'partially_paid':
      return { tone: 'amber', label: 'Partially paid' };
    case 'paid':
      return { tone: 'green', label: 'Paid' };
  }
}

export function waitlistStatusInfo(status: WaitlistStatus): StatusPillInfo {
  switch (status) {
    case 'waiting':
      return { tone: 'amber', label: 'Waiting' };
    case 'offered':
      return { tone: 'teal', label: 'Offered' };
    case 'filled':
      return { tone: 'green', label: 'Filled' };
    case 'expired':
      return { tone: 'grey', label: 'Expired' };
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
      return { tone: 'green', label: 'High priority' };
    case 'medium':
      return { tone: 'amber', label: 'Medium priority' };
    case 'high':
      return { tone: 'red', label: 'Low priority' };
  }
}
