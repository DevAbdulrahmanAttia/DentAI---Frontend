import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import {
  AcceptWaitlistEntryPayload,
  CreateWaitlistEntryPayload,
  WaitlistEntry,
  WaitlistOfferPreview,
  WaitlistStatus
} from '@core/models/waitlist.model';
import { Appointment } from '@core/models/appointment.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  list(status?: WaitlistStatus): Observable<WaitlistEntry[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.WAITLIST}`;
    return this.http.get<WaitlistEntry[]>(url, { params: status ? { status } : {} });
  }

  getOne(id: string): Observable<WaitlistEntry> {
    const url = `${this.apiUrl}${API_ENDPOINTS.WAITLIST}/${id}`;
    return this.http.get<WaitlistEntry>(url);
  }

  create(payload: CreateWaitlistEntryPayload): Observable<WaitlistEntry> {
    const url = `${this.apiUrl}${API_ENDPOINTS.WAITLIST}`;
    return this.http.post<WaitlistEntry>(url, payload);
  }

  updateStatus(id: string, status: WaitlistStatus): Observable<WaitlistEntry> {
    const url = `${this.apiUrl}${API_ENDPOINTS.WAITLIST}/${id}/status`;
    return this.http.patch<WaitlistEntry>(url, { status });
  }

  accept(id: string, payload: AcceptWaitlistEntryPayload): Observable<Appointment> {
    const url = `${this.apiUrl}${API_ENDPOINTS.WAITLIST}/${id}/accept`;
    return this.http.post<Appointment>(url, payload);
  }

  remove(id: string): Observable<void> {
    const url = `${this.apiUrl}${API_ENDPOINTS.WAITLIST}/${id}`;
    return this.http.delete<void>(url);
  }

  getOfferPreview(id: string, token: string): Observable<WaitlistOfferPreview> {
    const url = `${this.apiUrl}${API_ENDPOINTS.WAITLIST}/${id}/offer`;
    return this.http.get<WaitlistOfferPreview>(url, { params: { token } });
  }

  confirmOffer(id: string, token: string): Observable<Appointment> {
    const url = `${this.apiUrl}${API_ENDPOINTS.WAITLIST}/${id}/confirm`;
    return this.http.post<Appointment>(url, { token });
  }
}
