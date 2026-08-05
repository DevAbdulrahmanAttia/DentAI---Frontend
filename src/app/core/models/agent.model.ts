import { AlertItem, Kpis, ProfitByProcedureEntry, RevenueTrendPoint } from './analytics.model';

export type AgentTool =
  | 'book_appointment'
  | 'add_to_waitlist'
  | 'send_whatsapp_message'
  | 'create_patient'
  | 'reschedule_appointment'
  | 'cancel_appointment'
  | 'add_inventory_item'
  | 'update_appointment_status'
  | 'accept_waitlist_offer'
  | 'add_procedure_type'
  | 'create_staff_account'
  | 'deactivate_staff_account';

export interface AgentHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentAnalyticsSnapshot {
  kpis: Kpis;
  revenueTrend: RevenueTrendPoint[];
  topProcedures: ProfitByProcedureEntry[];
  alerts: AlertItem[];
}

export type AgentReply =
  | { type: 'action'; tool: AgentTool; arguments: Record<string, unknown>; summary: string }
  | { type: 'clarify'; message: string }
  | { type: 'message'; message: string }
  | { type: 'analytics'; message: string; data: AgentAnalyticsSnapshot }
  | { type: 'unavailable' };
