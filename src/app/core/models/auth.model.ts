export type UserRole = 'Owner' | 'Doctor' | 'Reception';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
