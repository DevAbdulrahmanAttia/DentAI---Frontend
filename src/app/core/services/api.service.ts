/**
 * API Service
 *
 * Shared HTTP infrastructure service for API communication.
 * Features will be extended as business requirements are identified.
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
}
