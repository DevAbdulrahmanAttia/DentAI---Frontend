import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Invoice, InvoiceStatus } from '@core/models/billing.model';
import { BillingService } from '@features/billing/services/billing.service';
import { StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import { invoiceStatusInfo } from '@shared/utils/status-maps';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

type StatusFilter = 'all' | InvoiceStatus;

const PAGE_SIZE = 10;

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, StatusPillComponent, TranslatePipe],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css'
})
export class InvoicesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly billingService = inject(BillingService);
  private readonly i18n = inject(I18nService);

  protected readonly invoices = signal<Invoice[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly statuses: InvoiceStatus[] = ['draft', 'issued', 'partially_paid', 'paid', 'cancelled'];
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly searchControl = this.fb.control('');
  protected readonly page = signal(1);

  protected readonly invoiceStatusInfo = invoiceStatusInfo;

  ngOnInit(): void {
    this.load();
    this.searchControl.valueChanges.subscribe(() => this.page.set(1));
  }

  onStatusFilterChange(value: StatusFilter): void {
    this.statusFilter.set(value);
    this.page.set(1);
    this.load();
  }

  get filteredInvoices(): Invoice[] {
    const query = (this.searchControl.value ?? '').trim().toLowerCase();
    if (!query) return this.invoices();
    return this.invoices().filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.patient.name.toLowerCase().includes(query)
    );
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filteredInvoices.length / PAGE_SIZE));
  }

  get pagedInvoices(): Invoice[] {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filteredInvoices.slice(start, start + PAGE_SIZE);
  }

  goToPage(next: number): void {
    if (next < 1 || next > this.pageCount) return;
    this.page.set(next);
  }

  formatMoney(value: number | string): string {
    return `${this.i18n.t('common.egp')} ${Number(value).toFixed(0)}`;
  }

  /**
   * A quick items-only estimate for the list view (ignores invoice-level
   * discount and payments) — the authoritative total lives on the detail
   * page via InvoicesService.computeTotals on the backend.
   */
  itemsSubtotal(invoice: Invoice): number {
    return invoice.items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice) - Number(item.discountAmount),
      0
    );
  }

  private load(): void {
    this.loading.set(true);
    this.loadError.set(false);
    const status = this.statusFilter();
    this.billingService.findAll(status === 'all' ? {} : { status }).subscribe({
      next: (invoices) => {
        this.invoices.set(invoices);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }
}
