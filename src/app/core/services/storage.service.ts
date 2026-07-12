/**
 * Storage Service
 *
 * Manages local/session storage operations.
 * Provides a centralized interface for storage access.
 * Extend with storage methods as features are implemented.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /**
   * Retrieves an item from local storage.
   * @param key The storage key.
   * @returns The parsed item or null.
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  /**
   * Stores an item in local storage.
   * @param key The storage key.
   * @param value The value to store.
   */
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Handle storage quota exceeded or other errors if needed
    }
  }

  /**
   * Removes an item from local storage.
   * @param key The storage key.
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clears all items in local storage.
   */
  clear(): void {
    localStorage.clear();
  }
}
