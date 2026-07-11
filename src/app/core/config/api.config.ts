/**
 * API Configuration
 *
 * Central configuration for API settings.
 * Values are sourced from the environment configuration.
 */

import { environment } from '@env/environment';

export const apiConfig = {
  baseUrl: environment.apiUrl,
  version: environment.version
} as const;

