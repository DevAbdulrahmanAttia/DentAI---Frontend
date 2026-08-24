import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import { User, UserRole } from '@core/models/auth.model';
import { environment } from '@env/environment';

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  /** Only meaningful for owners — doctors are always clinicians, receptionists never. */
  isClinician?: boolean;
}

export interface UpdateStaffPayload {
  name?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  isClinician?: boolean;
  /**
   * What this dentist charges to examine a patient. Null clears it, falling
   * back to the clinic default — which also sizes the deposit when the clinic
   * bills deposits as a consultation fee.
   */
  consultationFee?: number | null;
}

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  list(): Observable<User[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.USERS}`;
    return this.http.get<User[]>(url);
  }

  create(payload: CreateStaffPayload): Observable<User> {
    const url = `${this.apiUrl}${API_ENDPOINTS.USERS}`;
    return this.http.post<User>(url, payload);
  }

  update(id: string, payload: UpdateStaffPayload): Observable<User> {
    const url = `${this.apiUrl}${API_ENDPOINTS.USERS}/${id}`;
    return this.http.patch<User>(url, payload);
  }
}
