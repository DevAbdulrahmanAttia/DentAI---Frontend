/**
 * API URL Injection Token
 *
 * Typed InjectionToken for API base URL configuration.
 * Can be provided at application or feature level for dependency injection.
 */

import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('API_URL');
