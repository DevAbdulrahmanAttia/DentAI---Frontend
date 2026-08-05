import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import { User } from '@core/models/auth.model';
import { ClinicSettings, UpdateClinicSettings } from '@core/models/settings.model';
import { environment } from '@env/environment';

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  getClinicSettings(): Observable<ClinicSettings> {
    return this.http.get<ClinicSettings>(`${this.apiUrl}${API_ENDPOINTS.SETTINGS}`);
  }

  updateClinicSettings(dto: UpdateClinicSettings): Observable<ClinicSettings> {
    return this.http.patch<ClinicSettings>(`${this.apiUrl}${API_ENDPOINTS.SETTINGS}`, dto);
  }

  updateProfile(dto: UpdateProfilePayload): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}${API_ENDPOINTS.AUTH.ME}`, dto);
  }

  changePassword(dto: ChangePasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}${API_ENDPOINTS.AUTH.CHANGE_PASSWORD}`, dto);
  }
}
