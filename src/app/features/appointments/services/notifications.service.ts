import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import { ReminderEntry } from '@core/models/reminder.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  getReminders(appointmentId: string): Observable<ReminderEntry[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.NOTIFICATIONS}/reminders`;
    return this.http.get<ReminderEntry[]>(url, { params: { appointmentId } });
  }
}
