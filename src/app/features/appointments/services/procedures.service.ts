import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import { ProcedureType } from '@core/models/procedure.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ProceduresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  list(): Observable<ProcedureType[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.PROCEDURES}`;
    return this.http.get<ProcedureType[]>(url);
  }
}
