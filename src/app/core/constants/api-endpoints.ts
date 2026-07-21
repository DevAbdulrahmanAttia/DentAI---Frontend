/**
 * API Endpoints
 *
 * Centralized API endpoint paths.
 * Endpoints will be added only when real business requirements emerge.
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me'
  }
} as const;
