import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { User, UserRole } from '../models/auth.model';
import { delay, Observable, of, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly TOKEN_KEY = 'dentai_token';
  private readonly USER_KEY = 'dentai_user';

  private readonly _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    const token = this.storage.getItem<string>(this.TOKEN_KEY);
    const user = this.storage.getItem<User>(this.USER_KEY);
    if (token && user) {
      this._currentUser.set(user);
    }
  }

  login(email: string, role: UserRole): Observable<User> {
    // Mock user details matching design specs
    let name = 'Dr. Amina Hassan';
    let initials = 'AH';
    
    if (role === 'Doctor') {
      name = 'Dr. Omar Zaki';
      initials = 'OZ';
    } else if (role === 'Reception') {
      name = 'Sara Ahmed';
      initials = 'SA';
    }

    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      name,
      role,
      avatar: initials
    };

    const response = {
      user: mockUser,
      token: 'mock_jwt_token_' + Date.now()
    };

    return of(response).pipe(
      delay(1200), // Simulate network latency
      tap(res => {
        this.storage.setItem(this.TOKEN_KEY, res.token);
        this.storage.setItem(this.USER_KEY, res.user);
        this._currentUser.set(res.user);
      }),
      map(res => res.user)
    );
  }

  resetPassword(_newPassword: string): Observable<boolean> {
    // Simulate reset latency
    return of(true).pipe(
      delay(1500)
    );
  }

  logout(): void {
    this.storage.removeItem(this.TOKEN_KEY);
    this.storage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
  }

  getToken(): string | null {
    return this.storage.getItem<string>(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
