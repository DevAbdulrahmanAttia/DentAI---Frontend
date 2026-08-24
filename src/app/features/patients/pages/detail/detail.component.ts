import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Patient } from '@core/models/patient.model';
import { PatientsService } from '@features/patients/services/patients.service';
import { FinancialHistoryComponent } from '@features/patients/components/financial-history/financial-history.component';
import { MedicalHistoryComponent } from '@features/patients/components/medical-history/medical-history.component';
import { PatientFormComponent } from '@features/patients/components/patient-form/patient-form.component';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import { appointmentStatusInfo } from '@shared/utils/status-maps';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    RouterLink,
    PatientFormComponent,
    ModalComponent,
    StatusPillComponent,
    MedicalHistoryComponent,
    FinancialHistoryComponent,
    TranslatePipe
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);
  private readonly patientsService = inject(PatientsService);
  protected readonly authService = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly patient = signal<Patient | null>(null);
  protected readonly editing = signal(false);

  protected readonly appointmentStatusInfo = appointmentStatusInfo;

  protected readonly treatmentSummary = signal<string | null | undefined>(undefined);
  protected readonly treatmentSummaryLoading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.loadError.set(true);
      return;
    }

    this.patientsService.getOne(id).subscribe({
      next: (patient) => {
        this.patient.set(patient);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(this.i18n.intlLocale(), { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatPrice(price: string | null): string {
    return price ? `${this.i18n.t('common.egp')} ${Number(price).toFixed(0)}` : '—';
  }

  generateSummary(): void {
    const current = this.patient();
    if (!current || this.treatmentSummaryLoading()) return;

    this.treatmentSummaryLoading.set(true);
    this.patientsService.getTreatmentSummary(current.id).subscribe({
      next: ({ summary }) => {
        this.treatmentSummaryLoading.set(false);
        this.treatmentSummary.set(summary);
      },
      error: () => {
        this.treatmentSummaryLoading.set(false);
        this.treatmentSummary.set(null);
      }
    });
  }

  onPatientUpdated(updated: Patient): void {
    // The update response is a plain Patient (no `appointments`/
    // `attendanceSummary` — those only come back from GET /patients/:id), so
    // merge onto the existing detail rather than replacing it wholesale.
    this.patient.update((current) => (current ? { ...current, ...updated } : current));
    this.editing.set(false);
  }
}
