import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  suggestFaqResponse(question: string): Observable<{ suggestedResponse: string | null }> {
    const url = `${this.apiUrl}${API_ENDPOINTS.SUPPORT}/faq-response`;
    return this.http.post<{ suggestedResponse: string | null }>(url, { question });
  }
}
