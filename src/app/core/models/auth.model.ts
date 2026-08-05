export type UserRole = 'owner' | 'doctor' | 'receptionist';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
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
