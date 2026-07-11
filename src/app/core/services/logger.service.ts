/**
 * Logger Service
 *
 * Application-wide logging service.
 * Provides centralized logging methods for different severity levels.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  log(_message: string, _data?: unknown): never {
    throw new Error('LoggerService is not implemented yet.');
  }

  warn(_message: string, _data?: unknown): never {
    throw new Error('LoggerService is not implemented yet.');
  }

  error(_message: string, _error?: unknown): never {
    throw new Error('LoggerService is not implemented yet.');
  }
}
