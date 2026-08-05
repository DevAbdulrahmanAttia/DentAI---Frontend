export type ReminderChannel = 'whatsapp' | 'sms';
export type ReminderStatus = 'queued' | 'sent' | 'failed';

export interface ReminderEntry {
  id: string;
  channel: ReminderChannel;
  sendAt: string;
  status: ReminderStatus;
  sentAt: string | null;
}
