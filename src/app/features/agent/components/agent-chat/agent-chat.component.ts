import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgentAnalyticsSnapshot, AgentHistoryMessage, AgentTool } from '@core/models/agent.model';
import { AlertItem } from '@core/models/analytics.model';
import { AgentService } from '@features/agent/services/agent.service';
import { PillTone, StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';

type ChatEntry =
  | { id: number; kind: 'user'; text: string }
  | { id: number; kind: 'agent-message'; text: string }
  | { id: number; kind: 'agent-clarify'; text: string }
  | { id: number; kind: 'agent-unavailable' }
  | { id: number; kind: 'agent-error' }
  | { id: number; kind: 'agent-analytics'; message: string; data: AgentAnalyticsSnapshot }
  | {
      id: number;
      kind: 'agent-action';
      tool: AgentTool;
      arguments: Record<string, unknown>;
      summary: string;
      status: 'pending' | 'confirming' | 'confirmed' | 'cancelled' | 'error';
      errorMessage?: string;
      result?: unknown;
    };

type ActionEntry = Extract<ChatEntry, { kind: 'agent-action' }>;

const HISTORY_LIMIT = 10;
const GREETING =
  "Hi! I can help with appointments, waitlist, patients, WhatsApp messages, and more — owners get inventory, procedures, staff, and analytics too. What would you like to do?";

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [FormsModule, RouterLink, StatusPillComponent],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css'
})
export class AgentChatComponent {
  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;

  private readonly agentService = inject(AgentService);
  private nextId = 1;

  protected readonly panelOpen = signal(false);
  protected readonly draft = signal('');
  protected readonly sending = signal(false);
  protected readonly entries = signal<ChatEntry[]>([
    { id: this.nextId++, kind: 'agent-message', text: GREETING }
  ]);

  protected readonly toolLabels: Record<AgentTool, string> = {
    book_appointment: 'Book appointment',
    add_to_waitlist: 'Add to waitlist',
    send_whatsapp_message: 'Send WhatsApp message',
    create_patient: 'Add patient',
    reschedule_appointment: 'Reschedule appointment',
    cancel_appointment: 'Cancel appointment',
    add_inventory_item: 'Add inventory item',
    update_appointment_status: 'Update appointment status',
    accept_waitlist_offer: 'Accept waitlist offer',
    add_procedure_type: 'Add procedure type',
    create_staff_account: 'Create staff account',
    deactivate_staff_account: 'Deactivate staff account'
  };

  togglePanel(): void {
    this.panelOpen.update((open) => !open);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  send(): void {
    const text = this.draft().trim();
    if (!text || this.sending()) return;

    this.draft.set('');
    this.pushEntry({ id: this.nextId++, kind: 'user', text });
    this.sending.set(true);

    this.agentService.sendMessage(text, this.buildHistory()).subscribe({
      next: (reply) => {
        this.sending.set(false);
        switch (reply.type) {
          case 'action':
            this.pushEntry({
              id: this.nextId++,
              kind: 'agent-action',
              tool: reply.tool,
              arguments: reply.arguments,
              summary: reply.summary,
              status: 'pending'
            });
            break;
          case 'clarify':
            this.pushEntry({ id: this.nextId++, kind: 'agent-clarify', text: reply.message });
            break;
          case 'message':
            this.pushEntry({ id: this.nextId++, kind: 'agent-message', text: reply.message });
            break;
          case 'analytics':
            this.pushEntry({
              id: this.nextId++,
              kind: 'agent-analytics',
              message: reply.message,
              data: reply.data
            });
            break;
          case 'unavailable':
            this.pushEntry({ id: this.nextId++, kind: 'agent-unavailable' });
            break;
        }
      },
      error: () => {
        this.sending.set(false);
        this.pushEntry({ id: this.nextId++, kind: 'agent-unavailable' });
      }
    });
  }

  confirmAction(entry: ActionEntry): void {
    this.updateEntry(entry.id, { status: 'confirming' });
    this.agentService.executeAction(entry.tool, entry.arguments).subscribe({
      next: (result) => this.updateEntry(entry.id, { status: 'confirmed', result }),
      error: (err: { error?: { message?: string } }) =>
        this.updateEntry(entry.id, {
          status: 'error',
          errorMessage: err?.error?.message ?? 'Something went wrong — please try again.'
        })
    });
  }

  cancelAction(entry: ActionEntry): void {
    this.updateEntry(entry.id, { status: 'cancelled' });
  }

  toolIcon(
    tool: AgentTool
  ): 'calendar' | 'clock' | 'whatsapp' | 'user-plus' | 'refresh' | 'cancel' | 'box' | 'check' | 'plus-square' | 'briefcase' | 'user-minus' {
    if (tool === 'book_appointment') return 'calendar';
    if (tool === 'add_to_waitlist') return 'clock';
    if (tool === 'send_whatsapp_message') return 'whatsapp';
    if (tool === 'create_patient') return 'user-plus';
    if (tool === 'reschedule_appointment') return 'refresh';
    if (tool === 'cancel_appointment') return 'cancel';
    if (tool === 'add_inventory_item') return 'box';
    if (tool === 'update_appointment_status') return 'check';
    if (tool === 'accept_waitlist_offer') return 'clock';
    if (tool === 'add_procedure_type') return 'plus-square';
    if (tool === 'create_staff_account') return 'briefcase';
    return 'user-minus';
  }

  isAction(entry: ChatEntry): entry is ActionEntry {
    return entry.kind === 'agent-action';
  }

  isAnalytics(entry: ChatEntry): entry is Extract<ChatEntry, { kind: 'agent-analytics' }> {
    return entry.kind === 'agent-analytics';
  }

  barHeight(value: number, max: number): string {
    return `${Math.max(4, Math.round((value / Math.max(1, max)) * 100))}%`;
  }

  maxRevenue(points: { revenue: number }[]): number {
    return Math.max(1, ...points.map((p) => p.revenue));
  }

  alertTone(type: AlertItem['type']): PillTone {
    return type === 'near_expiry' ? 'red' : 'amber';
  }

  alertLabel(type: AlertItem['type']): string {
    return type === 'near_expiry' ? 'Near expiry' : 'Low stock';
  }

  getTempPassword(entry: ActionEntry): string | null {
    if (entry.tool !== 'create_staff_account' || !entry.result) {
      return null;
    }
    const result = entry.result as { temporaryPassword?: unknown };
    return typeof result.temporaryPassword === 'string' ? result.temporaryPassword : null;
  }

  private pushEntry(entry: ChatEntry): void {
    this.entries.update((current) => [...current, entry]);
    queueMicrotask(() => this.scrollToBottom());
  }

  private updateEntry(id: number, patch: Partial<ChatEntry>): void {
    this.entries.update((current) =>
      current.map((e) => (e.id === id ? ({ ...e, ...patch } as ChatEntry) : e))
    );
  }

  private buildHistory(): AgentHistoryMessage[] {
    const history: AgentHistoryMessage[] = [];
    for (const entry of this.entries()) {
      if (entry.kind === 'user') {
        history.push({ role: 'user', content: entry.text });
      } else if (entry.kind === 'agent-message' || entry.kind === 'agent-clarify') {
        history.push({ role: 'assistant', content: entry.text });
      }
    }
    return history.slice(-HISTORY_LIMIT);
  }

  private scrollToBottom(): void {
    this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}
