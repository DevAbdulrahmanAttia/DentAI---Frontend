/**
 * Authentication Service
 *
 * Core service managing authentication logic, JWT storage,
 * and user role signals state using Angular Standalone APIs and Signals.
 */

import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageService } from '@core/services/storage.service';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { API_URL } from '@core/tokens/api-url.token';
import { AuthResponse, LoginCredentials, User, UserRole } from '@core/models/auth.model';
import { environment } from '@env/environment';

export interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  // Angular Signals for Authentication State
  readonly currentUser = signal<User | null>(this.getInitialUser());
  readonly token = signal<string | null>(this.getInitialToken());
  readonly isAuthenticated = computed<boolean>(() => !!this.token());
  readonly userRole = computed<UserRole | null>(() => this.currentUser()?.role ?? null);
  /**
   * Whether the signed-in user treats patients — an owner-dentist included.
   * Sessions stored before this field existed fall back to the old rule so a
   * cached login doesn't lose clinical UI until the token expires.
   */
  readonly isClinician = computed<boolean>(() => {
    const user = this.currentUser();
    if (!user) return false;
    return user.isClinician ?? user.role === 'doctor';
  });

  /**
   * Executes authentication request against the backend endpoint,
   * stores JWT token and user details via StorageService, and updates reactive state.
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const endpointUrl = `${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`;

    return this.http.post<AuthResponse>(endpointUrl, credentials).pipe(
      tap((response) => {
        this.setSession(response.accessToken, response.user);
      })
    );
  }

  /**
   * Requests a password-reset code (delivered over WhatsApp by the backend)
   * for the account registered under this phone number.
   */
  requestPasswordReset(phone: string): Observable<MessageResponse> {
    const endpointUrl = `${this.apiUrl}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`;
    return this.http.post<MessageResponse>(endpointUrl, { phone });
  }

  /**
   * Completes a password reset using the WhatsApp-delivered code.
   */
  resetPassword(phone: string, code: string, newPassword: string): Observable<MessageResponse> {
    const endpointUrl = `${this.apiUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`;
    return this.http.post<MessageResponse>(endpointUrl, { phone, code, newPassword });
  }

  /**
   * Clears authentication token and user data, resetting reactive signals and redirecting to login.
   */
  logout(): void {
    this.storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    this.storageService.removeItem(STORAGE_KEYS.USER_DATA);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Checks if the currently authenticated user has the specified role(s).
   */
  hasRole(roles: UserRole | UserRole[]): boolean {
    const currentRole = this.userRole();
    if (!currentRole) return false;
    if (Array.isArray(roles)) {
      return roles.includes(currentRole);
    }
    return currentRole === roles;
  }

  getToken(): string | null {
    return this.token();
  }

  getUser(): User | null {
    return this.currentUser();
  }

  /**
   * Refreshes the stored user + signal after a self-service profile edit,
   * without touching the token (unlike setSession, which is login-only).
   */
  updateStoredUser(user: User): void {
    this.storageService.setItem(STORAGE_KEYS.USER_DATA, user);
    this.currentUser.set(user);
  }

  private setSession(token: string, user: User): void {
    this.storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    this.storageService.setItem(STORAGE_KEYS.USER_DATA, user);
    this.token.set(token);
    this.currentUser.set(user);
  }

  private getInitialToken(): string | null {
    return this.storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  private getInitialUser(): User | null {
    return this.storageService.getItem<User>(STORAGE_KEYS.USER_DATA);
  }
}
