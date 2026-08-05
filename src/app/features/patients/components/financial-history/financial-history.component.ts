import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PatientFinancialHistory } from '@core/models/billing.model';
import { BillingService } from '@features/billing/services/billing.service';
import { StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import { invoiceStatusInfo } from '@shared/utils/status-maps';

@Component({
  selector: 'app-financial-history',
  standalone: true,
  imports: [RouterLink, StatusPillComponent],
  templateUrl: './financial-history.component.html',
  styleUrl: './financial-history.component.css'
})
export class FinancialHistoryComponent implements OnInit {
  private readonly billingService = inject(BillingService);

  patientId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly history = signal<PatientFinancialHistory | null>(null);

  protected readonly invoiceStatusInfo = invoiceStatusInfo;

  ngOnInit(): void {
    this.billingService.getPatientFinancialHistory(this.patientId()).subscribe({
      next: (history) => {
        this.history.set(history);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  formatMoney(value: number): string {
    return `EGP ${value.toFixed(0)}`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
