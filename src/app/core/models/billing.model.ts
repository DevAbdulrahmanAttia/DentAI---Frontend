export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'cancelled';
export type DiscountType = 'percentage' | 'fixed';
export type InvoiceItemCategory =
  | 'consultation'
  | 'cleaning'
  | 'filling'
  | 'root_canal'
  | 'crown'
  | 'xray'
  | 'medication'
  | 'lab_fee'
  | 'other';
export type PaymentMethod = 'cash' | 'card' | 'instapay' | 'vodafone_cash' | 'bank_transfer';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface InvoiceItem {
  id: string;
  category: InvoiceItemCategory;
  description: string;
  quantity: string;
  unitPrice: string;
  discountAmount: string;
}

export interface Payment {
  id: string;
  amount: string;
  method: PaymentMethod;
  paidAt: string;
  notes: string | null;
  transactionReference: string | null;
  isRefund: boolean;
  recordedBy: { id: string; name: string } | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string | null;
  notes: string | null;
  discountType: DiscountType | null;
  discountValue: string | null;
  discountReason: string | null;
  patient: { id: string; name: string; phone: string };
  doctor: { id: string; name: string };
  appointment: { id: string; scheduledAt: string; status: string };
  items: InvoiceItem[];
  payments: Payment[];
  createdAt: string;
}

export interface InvoiceTotals {
  subtotal: number;
  itemDiscounts: number;
  invoiceDiscount: number;
  total: number;
  paidAmount: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
}

export interface InvoiceItemTotal {
  id: string;
  category: InvoiceItemCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  total: number;
}

export interface InvoiceDetail {
  invoice: Invoice;
  items: InvoiceItemTotal[];
  totals: InvoiceTotals;
}

export interface DailyClosingReport {
  date: string;
  cash: number;
  card: number;
  instapay: number;
  vodafoneCash: number;
  bankTransfer: number;
  refunds: number;
  outstandingBalance: number;
}

export interface PatientInvoiceSummary extends InvoiceTotals {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string | null;
  createdAt: string;
}

export interface PatientPaymentTimelineEntry {
  invoiceNumber: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  isRefund: boolean;
}

export interface PatientFinancialHistory {
  invoices: PatientInvoiceSummary[];
  totalOutstanding: number;
  paymentTimeline: PatientPaymentTimelineEntry[];
}

export interface AddInvoiceItemPayload {
  category: InvoiceItemCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
}

export interface ApplyDiscountPayload {
  discountType: DiscountType;
  discountValue: number;
  reason?: string;
}

export interface RecordPaymentPayload {
  amount: number;
  method: PaymentMethod;
  paidAt?: string;
  notes?: string;
  transactionReference?: string;
}
