import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import { User, UserRole } from '@core/models/auth.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  list(role?: UserRole): Observable<User[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.USERS}`;
    return this.http.get<User[]>(url, { params: role ? { role } : {} });
  }

  /**
   * Everyone who treats patients, which is what a doctor picker wants —
   * filtering by `role=doctor` would drop an owner who also practises.
   */
  listDoctors(): Observable<User[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.USERS}`;
    return this.http.get<User[]>(url, { params: { clinician: true } });
  }
}
