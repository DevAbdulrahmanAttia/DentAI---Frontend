import { UserRole } from './auth.model';

export interface AuditLogActor {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuditLog {
  id: string;
  actor: AuditLogActor | null;
  actorRole: UserRole | null;
  method: string;
  path: string;
  action: string;
  statusCode: number;
  params: Record<string, unknown> | null;
  body: Record<string, unknown> | null;
  ipAddress: string | null;
  durationMs: number;
  createdAt: string;
}

export interface AuditLogPage {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogQuery {
  actorId?: string;
  method?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
