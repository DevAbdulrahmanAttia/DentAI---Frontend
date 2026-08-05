import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import {
  CreateMedicalHistoryEntryPayload,
  MedicalHistoryEntry
} from '@core/models/appointment.model';
import { CreatePatientPayload, Patient, UpdatePatientPayload } from '@core/models/patient.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  search(query: string): Observable<Patient[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.PATIENTS}`;
    return this.http.get<Patient[]>(url, { params: query ? { search: query } : {} });
  }

  getOne(id: string): Observable<Patient> {
    const url = `${this.apiUrl}${API_ENDPOINTS.PATIENTS}/${id}`;
    return this.http.get<Patient>(url);
  }

  create(payload: CreatePatientPayload): Observable<Patient> {
    const url = `${this.apiUrl}${API_ENDPOINTS.PATIENTS}`;
    return this.http.post<Patient>(url, payload);
  }

  update(id: string, payload: UpdatePatientPayload): Observable<Patient> {
    const url = `${this.apiUrl}${API_ENDPOINTS.PATIENTS}/${id}`;
    return this.http.patch<Patient>(url, payload);
  }

  getTreatmentSummary(id: string): Observable<{ summary: string | null }> {
    const url = `${this.apiUrl}${API_ENDPOINTS.PATIENTS}/${id}/treatment-summary`;
    return this.http.get<{ summary: string | null }>(url);
  }

  getMedicalHistory(id: string): Observable<MedicalHistoryEntry[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.PATIENTS}/${id}/medical-history`;
    return this.http.get<MedicalHistoryEntry[]>(url);
  }

  addMedicalHistoryEntry(
    id: string,
    payload: CreateMedicalHistoryEntryPayload
  ): Observable<MedicalHistoryEntry> {
    const url = `${this.apiUrl}${API_ENDPOINTS.PATIENTS}/${id}/medical-history`;
    return this.http.post<MedicalHistoryEntry>(url, payload);
  }

  deactivateMedicalHistoryEntry(
    id: string,
    entryId: string
  ): Observable<MedicalHistoryEntry> {
    const url = `${this.apiUrl}${API_ENDPOINTS.PATIENTS}/${id}/medical-history/${entryId}/deactivate`;
    return this.http.patch<MedicalHistoryEntry>(url, {});
  }
}
