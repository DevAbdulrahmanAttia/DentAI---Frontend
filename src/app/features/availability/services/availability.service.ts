import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import {
  AddExceptionPayload,
  DoctorAvailabilityException,
  DoctorOverview,
  DoctorWorkingHours,
  SetWeeklyHoursPayload,
  Weekday
} from '@core/models/availability.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;
  private readonly base = `${this.apiUrl}${API_ENDPOINTS.AVAILABILITY}`;

  getOverview(date?: string): Observable<DoctorOverview[]> {
    return this.http.get<DoctorOverview[]>(`${this.base}/overview`, {
      params: date ? { date } : {}
    });
  }

  getWeeklyHours(doctorId: string): Observable<DoctorWorkingHours[]> {
    return this.http.get<DoctorWorkingHours[]>(`${this.base}/doctors/${doctorId}/weekly`);
  }

  setWeeklyHour(doctorId: string, payload: SetWeeklyHoursPayload): Observable<DoctorWorkingHours> {
    return this.http.post<DoctorWorkingHours>(`${this.base}/doctors/${doctorId}/weekly`, payload);
  }

  removeWeeklyHour(doctorId: string, weekday: Weekday): Observable<void> {
    return this.http.delete<void>(`${this.base}/doctors/${doctorId}/weekly/${weekday}`);
  }

  getExceptions(doctorId: string): Observable<DoctorAvailabilityException[]> {
    return this.http.get<DoctorAvailabilityException[]>(`${this.base}/doctors/${doctorId}/exceptions`);
  }

  addException(doctorId: string, payload: AddExceptionPayload): Observable<DoctorAvailabilityException> {
    return this.http.post<DoctorAvailabilityException>(`${this.base}/doctors/${doctorId}/exceptions`, payload);
  }

  removeException(doctorId: string, exceptionId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/doctors/${doctorId}/exceptions/${exceptionId}`);
  }
}
