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
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  USERS: '/users',
  PATIENTS: '/patients',
  PROCEDURES: '/procedures',
  APPOINTMENTS: '/appointments',
  WAITLIST: '/waitlist',
  ANALYTICS: '/analytics',
  INVENTORY: '/inventory',
  NOTIFICATIONS: '/notifications',
  SUPPORT: '/support',
  AGENT: '/agent',
  SETTINGS: '/settings',
  DELAY_MANAGEMENT: '/delay-management',
  INVOICES: '/invoices',
  AUDIT_LOGS: '/audit-logs',
  AVAILABILITY: '/availability'
} as const;
