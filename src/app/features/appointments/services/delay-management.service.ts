import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import {
  AppointmentDelayAction,
  DelayedAppointmentEntry,
  DelayKpis,
  RecordDelayActionPayload
} from '@core/models/delay-management.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class DelayManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  getSchedule(date?: string, doctorId?: string): Observable<DelayedAppointmentEntry[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.DELAY_MANAGEMENT}/schedule`;
    const params: Record<string, string> = {};
    if (date) params['date'] = date;
    if (doctorId) params['doctorId'] = doctorId;
    return this.http.get<DelayedAppointmentEntry[]>(url, { params });
  }

  getKpis(date?: string): Observable<DelayKpis> {
    const url = `${this.apiUrl}${API_ENDPOINTS.DELAY_MANAGEMENT}/kpis`;
    return this.http.get<DelayKpis>(url, { params: date ? { date } : {} });
  }

  recordAction(
    appointmentId: string,
    payload: RecordDelayActionPayload
  ): Observable<AppointmentDelayAction> {
    const url = `${this.apiUrl}${API_ENDPOINTS.DELAY_MANAGEMENT}/${appointmentId}/actions`;
    return this.http.post<AppointmentDelayAction>(url, payload);
  }
}
