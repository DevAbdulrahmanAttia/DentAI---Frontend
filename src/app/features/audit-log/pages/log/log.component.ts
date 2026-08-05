import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuditLog } from '@core/models/audit-log.model';
import { AuditLogService } from '@features/audit-log/services/audit-log.service';
import { PillTone, StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';

const PAGE_SIZE = 25;

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, StatusPillComponent],
  templateUrl: './log.component.html',
  styleUrl: './log.component.css'
})
export class LogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auditLogService = inject(AuditLogService);

  protected readonly logs = signal<AuditLog[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly expandedId = signal<string | null>(null);

  protected readonly methods = ['POST', 'PATCH', 'PUT', 'DELETE'];
  protected readonly methodFilter = signal<string>('all');
  protected readonly actionControl = this.fb.control('');
  protected readonly fromControl = this.fb.control('');
  protected readonly toControl = this.fb.control('');

  ngOnInit(): void {
    this.load();
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.total() / PAGE_SIZE));
  }

  onMethodFilterChange(value: string): void {
    this.methodFilter.set(value);
    this.page.set(1);
    this.load();
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  clearFilters(): void {
    this.methodFilter.set('all');
    this.actionControl.setValue('');
    this.fromControl.setValue('');
    this.toControl.setValue('');
    this.page.set(1);
    this.load();
  }

  goToPage(next: number): void {
    if (next < 1 || next > this.pageCount) return;
    this.page.set(next);
    this.load();
  }

  toggleExpanded(log: AuditLog): void {
    this.expandedId.set(this.expandedId() === log.id ? null : log.id);
  }

  statusTone(statusCode: number): PillTone {
    if (statusCode >= 500) return 'red';
    if (statusCode >= 400) return 'amber';
    return 'green';
  }

  actorLabel(log: AuditLog): string {
    return log.actor?.name ?? 'Unauthenticated';
  }

  formatDetail(value: Record<string, unknown> | null): string {
    return value ? JSON.stringify(value, null, 2) : '—';
  }

  private load(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.auditLogService
      .findAll({
        method: this.methodFilter() === 'all' ? undefined : this.methodFilter(),
        action: this.actionControl.value?.trim() || undefined,
        from: this.fromControl.value || undefined,
        to: this.toControl.value || undefined,
        page: this.page(),
        limit: PAGE_SIZE
      })
      .subscribe({
        next: (result) => {
          this.logs.set(result.data);
          this.total.set(result.total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.loadError.set(true);
        }
      });
  }
}
