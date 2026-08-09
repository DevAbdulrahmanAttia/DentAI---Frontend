export type UserRole = 'owner' | 'doctor' | 'receptionist';

export interface User {
  id?: string;
  email: string;
  name: string;
  /** What this person may administer — not whether they treat patients. */
  role: UserRole;
  /**
   * Whether this person treats patients. Separate from `role` so an owner can
   * also be a practising dentist without a second account; gate clinical UI
   * on this rather than on `role === 'doctor'`.
   */
  isClinician?: boolean;
  avatar?: string;
  phone?: string | null;
  isActive?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
