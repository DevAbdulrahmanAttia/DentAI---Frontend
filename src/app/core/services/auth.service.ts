/**
 * Authentication Service
 *
 * Core service managing authentication logic, JWT storage,
 * and user role signals state using Angular Standalone APIs and Signals.
 */

import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { StorageService } from '@core/services/storage.service';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { API_URL } from '@core/tokens/api-url.token';
import { AuthResponse, LoginCredentials, User, UserRole } from '@core/models/auth.model';
import { environment } from '@env/environment';

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
   * Executes authentication request against the backend endpoint,
   * stores JWT token and user details via StorageService, and updates reactive state.
   * Accepts LoginCredentials object or (email, role, password).
   */
  login(
    credentialsOrEmail: LoginCredentials | string,
    role?: UserRole,
    password?: string
  ): Observable<AuthResponse> {
    let credentials: LoginCredentials;
    if (typeof credentialsOrEmail === 'string') {
      credentials = {
        email: credentialsOrEmail,
        role: role ?? 'owner',
        password: password ?? 'password123'
      };
    } else {
      credentials = credentialsOrEmail;
    }

    const endpointUrl = `${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`;

    return this.http.post<AuthResponse>(endpointUrl, credentials).pipe(
      tap((response) => {
        this.setSession(response.token, response.user);
      }),
      catchError((error) => {
        // Fallback for development if backend server is not running
        if (!environment.production && (error.status === 0 || error.status === 404)) {
          const roleStr = String(credentials.role || 'owner').toLowerCase();
          const mockUser: User = {
            id: 'usr_' + Math.random().toString(36).substring(2, 9),
            email: credentials.email,
            role: credentials.role ?? 'owner',
            name: roleStr.includes('doc')
              ? 'Dr. Zaki'
              : roleStr.includes('recept')
                ? 'Receptionist User'
                : 'Amina Hassan'
          };
          const mockToken = `mock-jwt-token-${mockUser.role}-${Date.now()}`;
          const mockResponse: AuthResponse = { token: mockToken, user: mockUser };
          this.setSession(mockResponse.token, mockResponse.user);
          return of(mockResponse);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Clears authentication token and user data, resetting reactive signals and redirecting to login.
   */
  logout(): void {
    this.storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    this.storageService.removeItem(STORAGE_KEYS.USER_DATA);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
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
