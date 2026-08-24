import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgentAnalyticsSnapshot, AgentHistoryMessage, AgentTool } from '@core/models/agent.model';
import { AlertItem } from '@core/models/analytics.model';
import { AgentService } from '@features/agent/services/agent.service';
import { PillTone, StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import { alertTypeInfo } from '@shared/utils/status-maps';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

type ChatEntry =
  | { id: number; kind: 'user'; text: string }
  | { id: number; kind: 'agent-message'; text: string }
  | { id: number; kind: 'agent-clarify'; text: string }
  | { id: number; kind: 'agent-unavailable' }
  | { id: number; kind: 'agent-error' }
  | { id: number; kind: 'agent-analytics'; message: string; data: AgentAnalyticsSnapshot }
  | {
      id: number;
      kind: 'agent-draft';
      question: string;
      /** null when the drafting call was unavailable — staff answer directly. */
      text: string | null;
      copied: boolean;
    }
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
type DraftEntry = Extract<ChatEntry, { kind: 'agent-draft' }>;

const HISTORY_LIMIT = 10;

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [FormsModule, RouterLink, StatusPillComponent, TranslatePipe],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css'
})
export class AgentChatComponent {
  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;

  private readonly agentService = inject(AgentService);
  protected readonly i18n = inject(I18nService);
  private nextId = 1;

  protected readonly panelOpen = signal(false);
  protected readonly draft = signal('');
  protected readonly sending = signal(false);
  protected readonly entries = signal<ChatEntry[]>([
    { id: this.nextId++, kind: 'agent-message', text: this.i18n.t('agent.greeting') }
  ]);

  /** i18n keys, one per AgentTool — resolved in the template via the `t` pipe. */
  protected readonly toolLabels: Record<AgentTool, string> = {
    book_appointment: 'agent.tool.book_appointment',
    add_to_waitlist: 'agent.tool.add_to_waitlist',
    send_whatsapp_message: 'agent.tool.send_whatsapp_message',
    create_patient: 'agent.tool.create_patient',
    reschedule_appointment: 'agent.tool.reschedule_appointment',
    cancel_appointment: 'agent.tool.cancel_appointment',
    add_inventory_item: 'agent.tool.add_inventory_item',
    update_appointment_status: 'agent.tool.update_appointment_status',
    accept_waitlist_offer: 'agent.tool.accept_waitlist_offer',
    add_procedure_type: 'agent.tool.add_procedure_type',
    create_staff_account: 'agent.tool.create_staff_account',
    deactivate_staff_account: 'agent.tool.deactivate_staff_account'
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
          case 'draft':
            this.pushEntry({
              id: this.nextId++,
              kind: 'agent-draft',
              question: reply.question,
              text: reply.message,
              copied: false
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
    const args = this.resolveDraftArgument(entry);
    if (!args) {
      this.updateEntry(entry.id, {
        status: 'error',
        errorMessage: this.i18n.t('agent.draft.missingForSend')
      });
      return;
    }
    this.updateEntry(entry.id, { status: 'confirming' });
    this.agentService.executeAction(entry.tool, args).subscribe({
      next: (result) => this.updateEntry(entry.id, { status: 'confirmed', result }),
      error: (err: { error?: { message?: string } }) =>
        this.updateEntry(entry.id, {
          status: 'error',
          errorMessage: err?.error?.message ?? this.i18n.t('agent.actionFailed')
        })
    });
  }

  /**
   * Swaps a `useDraft: true` argument for the text of the most recent drafted
   * answer.
   *
   * The model is told to send drafts this way rather than copying the wording
   * into its JSON: re-emitting a long Arabic answer as \uXXXX escapes ate
   * the reply budget and came back truncated mid-escape, which broke the
   * whole turn. The transcript already holds the exact text, so the client
   * fills it in and the model never has to retype it. Returns null when there
   * is no draft to send, so the caller can say so instead of sending nothing.
   */
  private resolveDraftArgument(
    entry: ActionEntry
  ): Record<string, unknown> | null {
    if (entry.arguments['useDraft'] !== true) return entry.arguments;

    const lastDraft = [...this.entries()]
      .reverse()
      .find((e): e is DraftEntry => e.kind === 'agent-draft' && !!e.text);
    if (!lastDraft?.text) return null;

    const { useDraft: _useDraft, ...rest } = entry.arguments;
    return { ...rest, message: lastDraft.text };
  }

  /**
   * The wording a `useDraft` send will actually put on WhatsApp, so staff
   * confirm against the real text rather than a summary of it. Null for every
   * other action.
   */
  pendingDraftText(entry: ActionEntry): string | null {
    if (entry.arguments['useDraft'] !== true) return null;
    const args = this.resolveDraftArgument(entry);
    return typeof args?.['message'] === 'string' ? args['message'] : null;
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

  isDraft(entry: ChatEntry): entry is DraftEntry {
    return entry.kind === 'agent-draft';
  }

  copyDraft(entry: DraftEntry): void {
    if (!entry.text) return;
    void navigator.clipboard.writeText(entry.text).then(() => {
      this.updateEntry(entry.id, { copied: true });
      setTimeout(() => this.updateEntry(entry.id, { copied: false }), 2000);
    });
  }

  barHeight(value: number, max: number): string {
    return `${Math.max(4, Math.round((value / Math.max(1, max)) * 100))}%`;
  }

  maxRevenue(points: { revenue: number }[]): number {
    return Math.max(1, ...points.map((p) => p.revenue));
  }

  alertTone(type: AlertItem['type']): PillTone {
    return alertTypeInfo(type).tone;
  }

  alertLabel(type: AlertItem['type']): string {
    return alertTypeInfo(type).label;
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
      } else if (entry.kind === 'agent-draft' && entry.text) {
        // Carried so follow-ups land: "send that to Ahmed" can only become a
        // send_whatsapp_message action if the drafted wording is in context.
        history.push({ role: 'assistant', content: entry.text });
      }
    }
    return history.slice(-HISTORY_LIMIT);
  }

  private scrollToBottom(): void {
    this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}
