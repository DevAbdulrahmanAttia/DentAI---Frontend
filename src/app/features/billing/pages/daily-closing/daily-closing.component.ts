import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DailyClosingReport } from '@core/models/billing.model';
import { BillingService } from '@features/billing/services/billing.service';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

function todayIso(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

@Component({
  selector: 'app-daily-closing',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './daily-closing.component.html',
  styleUrl: './daily-closing.component.css'
})
export class DailyClosingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly billingService = inject(BillingService);
  private readonly i18n = inject(I18nService);

  protected readonly dateControl = this.fb.nonNullable.control(todayIso());
  protected readonly report = signal<DailyClosingReport | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  ngOnInit(): void {
    this.load();
  }

  onDateChange(): void {
    this.load();
  }

  totalCollected(report: DailyClosingReport): number {
    return report.cash + report.card + report.instapay + report.vodafoneCash + report.bankTransfer;
  }

  formatMoney(value: number): string {
    return `${this.i18n.t('common.egp')} ${value.toFixed(2)}`;
  }

  private load(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.billingService.getDailyClosing(this.dateControl.value).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }
}
