import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import {
  AddInvoiceItemPayload,
  ApplyDiscountPayload,
  DailyClosingReport,
  Invoice,
  InvoiceDetail,
  InvoiceStatus,
  PatientFinancialHistory,
  Payment,
  RecordPaymentPayload
} from '@core/models/billing.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;
  private readonly base = `${this.apiUrl}${API_ENDPOINTS.INVOICES}`;

  findAll(filters: { patientId?: string; status?: InvoiceStatus; from?: string; to?: string } = {}): Observable<Invoice[]> {
    const params: Record<string, string> = {};
    if (filters.patientId) params['patientId'] = filters.patientId;
    if (filters.status) params['status'] = filters.status;
    if (filters.from) params['from'] = filters.from;
    if (filters.to) params['to'] = filters.to;
    return this.http.get<Invoice[]>(this.base, { params });
  }

  getDetail(id: string): Observable<InvoiceDetail> {
    return this.http.get<InvoiceDetail>(`${this.base}/${id}`);
  }

  getPayments(id: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}/${id}/payments`);
  }

  getDailyClosing(date?: string): Observable<DailyClosingReport> {
    return this.http.get<DailyClosingReport>(`${this.base}/daily-closing`, {
      params: date ? { date } : {}
    });
  }

  createFromAppointment(appointmentId: string): Observable<Invoice> {
    return this.http.post<Invoice>(
      `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/invoice`,
      {}
    );
  }

  getByAppointment(appointmentId: string): Observable<InvoiceDetail> {
    return this.http.get<InvoiceDetail>(
      `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/invoice`
    );
  }

  addItem(invoiceId: string, payload: AddInvoiceItemPayload): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.base}/${invoiceId}/items`, payload);
  }

  removeItem(invoiceId: string, itemId: string): Observable<Invoice> {
    return this.http.delete<Invoice>(`${this.base}/${invoiceId}/items/${itemId}`);
  }

  applyDiscount(invoiceId: string, payload: ApplyDiscountPayload): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.base}/${invoiceId}/discount`, payload);
  }

  issue(invoiceId: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.base}/${invoiceId}/issue`, {});
  }

  cancel(invoiceId: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.base}/${invoiceId}/cancel`, {});
  }

  recordPayment(invoiceId: string, payload: RecordPaymentPayload): Observable<Payment> {
    return this.http.post<Payment>(`${this.base}/${invoiceId}/payments`, payload);
  }

  recordRefund(invoiceId: string, payload: RecordPaymentPayload): Observable<Payment> {
    return this.http.post<Payment>(`${this.base}/${invoiceId}/refunds`, payload);
  }

  getPatientFinancialHistory(patientId: string): Observable<PatientFinancialHistory> {
    return this.http.get<PatientFinancialHistory>(
      `${this.apiUrl}/patients/${patientId}/financial-history`
    );
  }
}
