export type UserRole = 'owner' | 'doctor' | 'receptionist' | 'Owner' | 'Doctor' | 'Reception';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginResponse {
  user: User;
  token: string;
}
