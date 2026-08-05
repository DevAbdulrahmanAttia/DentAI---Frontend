import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import {
  Appointment,
  AppointmentReadiness,
  CreateAppointmentPayload,
  QueryAppointmentsParams,
  SettableAppointmentStatus
} from '@core/models/appointment.model';
import { environment } from '@env/environment';

function cleanParams<T extends object>(params: T): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      result[key] = String(value);
    }
  }
  return result;
}

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  list(query: QueryAppointmentsParams = {}): Observable<Appointment[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}`;
    return this.http.get<Appointment[]>(url, { params: cleanParams(query) });
  }

  getOne(id: string): Observable<Appointment> {
    const url = `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}/${id}`;
    return this.http.get<Appointment>(url);
  }

  book(payload: CreateAppointmentPayload): Observable<Appointment> {
    const url = `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}`;
    return this.http.post<Appointment>(url, payload);
  }

  updateStatus(id: string, status: SettableAppointmentStatus): Observable<Appointment> {
    const url = `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}/${id}/status`;
    return this.http.patch<Appointment>(url, { status });
  }

  getReadiness(id: string): Observable<AppointmentReadiness> {
    const url = `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}/${id}/readiness`;
    return this.http.get<AppointmentReadiness>(url);
  }

  checkIn(id: string): Observable<Appointment> {
    const url = `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}/${id}/check-in`;
    return this.http.post<Appointment>(url, {});
  }

  start(id: string, acknowledgeWarnings = false): Observable<Appointment> {
    const url = `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}/${id}/start`;
    return this.http.post<Appointment>(url, { acknowledgeWarnings });
  }

  complete(id: string): Observable<Appointment> {
    const url = `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}/${id}/complete`;
    return this.http.post<Appointment>(url, {});
  }

  extend(id: string, additionalMinutes: number): Observable<Appointment> {
    const url = `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}/${id}/extend`;
    return this.http.patch<Appointment>(url, { additionalMinutes });
  }

  reschedule(id: string, scheduledAt: string): Observable<Appointment> {
    const url = `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}/${id}/reschedule`;
    return this.http.patch<Appointment>(url, { scheduledAt });
  }

  getRiskExplanation(id: string): Observable<{ explanation: string | null }> {
    const url = `${this.apiUrl}${API_ENDPOINTS.APPOINTMENTS}/${id}/risk-explanation`;
    return this.http.get<{ explanation: string | null }>(url);
  }
}
