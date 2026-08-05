import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import {
  AlertItem,
  Kpis,
  NoShowInsights,
  ProfitByProcedureEntry,
  RevenueForecast,
  RevenueTrendPoint,
  TopDoctorRevenueEntry
} from '@core/models/analytics.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  getKpis(from?: string, to?: string): Observable<Kpis> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ANALYTICS}/kpis`;
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http.get<Kpis>(url, { params });
  }

  getRevenueTrend(granularity?: 'month' | 'week', periods?: number): Observable<RevenueTrendPoint[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ANALYTICS}/revenue-trend`;
    const params: Record<string, string> = {};
    if (granularity) params['granularity'] = granularity;
    if (periods) params['periods'] = String(periods);
    return this.http.get<RevenueTrendPoint[]>(url, { params });
  }

  getProfitByProcedure(from?: string, to?: string): Observable<ProfitByProcedureEntry[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ANALYTICS}/profit-by-procedure`;
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http.get<ProfitByProcedureEntry[]>(url, { params });
  }

  getTopDoctorsByRevenue(from?: string, to?: string): Observable<TopDoctorRevenueEntry[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ANALYTICS}/top-doctors`;
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http.get<TopDoctorRevenueEntry[]>(url, { params });
  }

  getNoShowInsights(): Observable<NoShowInsights> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ANALYTICS}/no-show-insights`;
    return this.http.get<NoShowInsights>(url);
  }

  getAlerts(): Observable<AlertItem[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ANALYTICS}/alerts`;
    return this.http.get<AlertItem[]>(url);
  }

  getForecast(months?: number): Observable<RevenueForecast> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ANALYTICS}/forecast`;
    const params: Record<string, string> = {};
    if (months) params['months'] = String(months);
    return this.http.get<RevenueForecast>(url, { params });
  }
}
