import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import {
  DiscountType,
  InvoiceDetail,
  InvoiceItemCategory,
  PaymentMethod
} from '@core/models/billing.model';
import { BillingService } from '@features/billing/services/billing.service';
import { StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import { invoiceStatusInfo } from '@shared/utils/status-maps';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, StatusPillComponent, TranslatePipe],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.css'
})
export class InvoiceDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly billingService = inject(BillingService);
  protected readonly authService = inject(AuthService);
  private readonly i18n = inject(I18nService);

  protected readonly invoiceId = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly detail = signal<InvoiceDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly busy = signal(false);
  protected readonly actionError = signal('');

  protected readonly invoiceStatusInfo = invoiceStatusInfo;

  protected readonly categories: InvoiceItemCategory[] = [
    'consultation',
    'cleaning',
    'filling',
    'root_canal',
    'crown',
    'xray',
    'medication',
    'lab_fee',
    'other'
  ];
  protected readonly paymentMethods: PaymentMethod[] = [
    'cash',
    'card',
    'instapay',
    'vodafone_cash',
    'bank_transfer'
  ];

  protected readonly showAddItem = signal(false);
  protected readonly itemForm = this.fb.nonNullable.group({
    category: ['other' as InvoiceItemCategory, Validators.required],
    description: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    discountAmount: [0, [Validators.min(0)]]
  });

  protected readonly showDiscount = signal(false);
  protected readonly discountForm = this.fb.nonNullable.group({
    discountType: ['percentage' as DiscountType, Validators.required],
    discountValue: [0, [Validators.required, Validators.min(0)]],
    reason: ['']
  });

  protected readonly showPayment = signal(false);
  protected readonly paymentForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    method: ['cash' as PaymentMethod, Validators.required],
    notes: ['']
  });

  protected readonly showRefund = signal(false);
  protected readonly refundForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    method: ['cash' as PaymentMethod, Validators.required],
    notes: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  formatMoney(value: number): string {
    return `${this.i18n.t('common.egp')} ${value.toFixed(2)}`;
  }

  /** Replaces Angular's `date` pipe (locked to the static `LOCALE_ID`) so payment dates follow the active app language. */
  formatPaymentDate(iso: string): string {
    return new Date(iso).toLocaleString(this.i18n.intlLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleAddItem(): void {
    this.showAddItem.set(!this.showAddItem());
  }

  submitAddItem(): void {
    if (this.itemForm.invalid || this.busy()) {
      this.itemForm.markAllAsTouched();
      return;
    }
    const raw = this.itemForm.getRawValue();
    this.runAction(
      this.billingService.addItem(this.invoiceId, {
        category: raw.category,
        description: raw.description,
        quantity: raw.quantity,
        unitPrice: raw.unitPrice,
        discountAmount: raw.discountAmount
      }),
      () => {
        this.showAddItem.set(false);
        this.itemForm.reset({ category: 'other', description: '', quantity: 1, unitPrice: 0, discountAmount: 0 });
      }
    );
  }

  removeItem(itemId: string): void {
    if (this.busy()) return;
    if (!confirm(this.i18n.t('billing.confirmRemoveItem'))) return;
    this.runAction(this.billingService.removeItem(this.invoiceId, itemId));
  }

  toggleDiscount(): void {
    this.showDiscount.set(!this.showDiscount());
  }

  submitDiscount(): void {
    if (this.discountForm.invalid || this.busy()) {
      this.discountForm.markAllAsTouched();
      return;
    }
    const raw = this.discountForm.getRawValue();
    this.runAction(
      this.billingService.applyDiscount(this.invoiceId, {
        discountType: raw.discountType,
        discountValue: raw.discountValue,
        reason: raw.reason || undefined
      }),
      () => this.showDiscount.set(false)
    );
  }

  issueInvoice(): void {
    if (this.busy()) return;
    if (!confirm(this.i18n.t('billing.confirmIssue'))) return;
    this.runAction(this.billingService.issue(this.invoiceId));
  }

  cancelInvoice(): void {
    if (this.busy()) return;
    if (!confirm(this.i18n.t('billing.confirmCancel'))) return;
    this.runAction(this.billingService.cancel(this.invoiceId));
  }

  togglePayment(): void {
    this.showPayment.set(!this.showPayment());
  }

  submitPayment(): void {
    if (this.paymentForm.invalid || this.busy()) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const raw = this.paymentForm.getRawValue();
    this.runAction(
      this.billingService.recordPayment(this.invoiceId, {
        amount: raw.amount,
        method: raw.method,
        notes: raw.notes || undefined
      }),
      () => {
        this.showPayment.set(false);
        this.paymentForm.reset({ amount: 0, method: 'cash', notes: '' });
      }
    );
  }

  toggleRefund(): void {
    this.showRefund.set(!this.showRefund());
  }

  submitRefund(): void {
    if (this.refundForm.invalid || this.busy()) {
      this.refundForm.markAllAsTouched();
      return;
    }
    const raw = this.refundForm.getRawValue();
    this.runAction(
      this.billingService.recordRefund(this.invoiceId, {
        amount: raw.amount,
        method: raw.method,
        notes: raw.notes || undefined
      }),
      () => {
        this.showRefund.set(false);
        this.refundForm.reset({ amount: 0, method: 'cash', notes: '' });
      }
    );
  }

  private load(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.billingService.getDetail(this.invoiceId).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  /** Shared plumbing for every mutating action: refresh the detail view afterwards since totals may have shifted. */
  private runAction<T>(request: Observable<T>, onSuccess?: () => void): void {
    this.busy.set(true);
    this.actionError.set('');
    request.subscribe({
      next: () => {
        this.busy.set(false);
        onSuccess?.();
        this.load();
      },
      error: (err: { error?: { message?: string | string[] } }) => {
        this.busy.set(false);
        const message = err?.error?.message;
        this.actionError.set(
          Array.isArray(message) ? message.join(', ') : message ?? this.i18n.t('billing.actionFailed')
        );
      }
    });
  }
}
