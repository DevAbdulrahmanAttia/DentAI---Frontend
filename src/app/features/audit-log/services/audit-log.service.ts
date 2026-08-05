import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import { AuditLogPage, AuditLogQuery } from '@core/models/audit-log.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;
  private readonly base = `${this.apiUrl}${API_ENDPOINTS.AUDIT_LOGS}`;

  findAll(query: AuditLogQuery = {}): Observable<AuditLogPage> {
    const params: Record<string, string> = {};
    if (query.method) params['method'] = query.method;
    if (query.action) params['action'] = query.action;
    if (query.from) params['from'] = query.from;
    // `createdAt` is a timestamp, so a bare "YYYY-MM-DD" upper bound would
    // exclude everything logged later that day — push it to day's end.
    if (query.to) params['to'] = query.to.length === 10 ? `${query.to}T23:59:59.999` : query.to;
    if (query.page) params['page'] = String(query.page);
    if (query.limit) params['limit'] = String(query.limit);
    return this.http.get<AuditLogPage>(this.base, { params });
  }
}
