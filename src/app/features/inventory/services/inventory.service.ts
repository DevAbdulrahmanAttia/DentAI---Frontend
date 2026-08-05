import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import {
  CreateInventoryItemPayload,
  InventoryItem,
  LogMaterialUsagePayload,
  MaterialUsageEntry
} from '@core/models/inventory-item.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  listItems(): Observable<InventoryItem[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.INVENTORY}/items`;
    return this.http.get<InventoryItem[]>(url);
  }

  getItem(id: string): Observable<InventoryItem> {
    const url = `${this.apiUrl}${API_ENDPOINTS.INVENTORY}/items/${id}`;
    return this.http.get<InventoryItem>(url);
  }

  createItem(payload: CreateInventoryItemPayload): Observable<InventoryItem> {
    const url = `${this.apiUrl}${API_ENDPOINTS.INVENTORY}/items`;
    return this.http.post<InventoryItem>(url, payload);
  }

  updateItem(id: string, payload: Partial<CreateInventoryItemPayload>): Observable<InventoryItem> {
    const url = `${this.apiUrl}${API_ENDPOINTS.INVENTORY}/items/${id}`;
    return this.http.patch<InventoryItem>(url, payload);
  }

  deleteItem(id: string): Observable<void> {
    const url = `${this.apiUrl}${API_ENDPOINTS.INVENTORY}/items/${id}`;
    return this.http.delete<void>(url);
  }

  logUsage(payload: LogMaterialUsagePayload): Observable<MaterialUsageEntry> {
    const url = `${this.apiUrl}${API_ENDPOINTS.INVENTORY}/usage`;
    return this.http.post<MaterialUsageEntry>(url, payload);
  }

  getUsageForAppointment(appointmentId: string): Observable<MaterialUsageEntry[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.INVENTORY}/usage`;
    return this.http.get<MaterialUsageEntry[]>(url, { params: { appointmentId } });
  }
}
