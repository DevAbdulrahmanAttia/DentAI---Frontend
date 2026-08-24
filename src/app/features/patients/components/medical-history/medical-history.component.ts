import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MedicalHistoryEntry,
  MedicalHistoryType,
  MedicalSeverity
} from '@core/models/appointment.model';
import { AuthService } from '@core/services/auth.service';
import { PatientsService } from '@features/patients/services/patients.service';
import { StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import { medicalSeverityInfo, medicalTypeLabel } from '@shared/utils/status-maps';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [ReactiveFormsModule, StatusPillComponent, TranslatePipe],
  templateUrl: './medical-history.component.html',
  styleUrl: './medical-history.component.css'
})
export class MedicalHistoryComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly i18n = inject(I18nService);
  private readonly patientsService = inject(PatientsService);
  protected readonly authService = inject(AuthService);

  patientId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly entries = signal<MedicalHistoryEntry[]>([]);
  protected readonly showForm = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal('');

  protected readonly activeEntries = computed(() =>
    this.entries().filter((e) => e.isActive)
  );
  protected readonly retiredEntries = computed(() =>
    this.entries().filter((e) => !e.isActive)
  );

  protected readonly medicalSeverityInfo = medicalSeverityInfo;
  protected readonly medicalTypeLabel = medicalTypeLabel;

  protected readonly types: MedicalHistoryType[] = [
    'allergy',
    'condition',
    'medication'
  ];
  protected readonly severities: MedicalSeverity[] = ['low', 'medium', 'high'];

  protected readonly form = this.fb.nonNullable.group({
    type: ['allergy' as MedicalHistoryType, Validators.required],
    name: ['', [Validators.required, Validators.minLength(2)]],
    severity: ['medium' as MedicalSeverity, Validators.required],
    anesthesiaRelevant: [false],
    notes: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.patientsService.getMedicalHistory(this.patientId()).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  toggleForm(): void {
    this.saveError.set('');
    this.form.reset({
      type: 'allergy',
      name: '',
      severity: 'medium',
      anesthesiaRelevant: false,
      notes: ''
    });
    this.showForm.set(!this.showForm());
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saveError.set('');
    const value = this.form.getRawValue();

    this.patientsService
      .addMedicalHistoryEntry(this.patientId(), {
        type: value.type,
        name: value.name.trim(),
        severity: value.severity,
        anesthesiaRelevant: value.anesthesiaRelevant,
        notes: value.notes.trim() || undefined
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.load();
        },
        error: (err: { error?: { message?: string } }) => {
          this.saving.set(false);
          this.saveError.set(err?.error?.message ?? this.i18n.t('patients.saveEntryFailed'));
        }
      });
  }

  retire(entry: MedicalHistoryEntry): void {
    this.patientsService
      .deactivateMedicalHistoryEntry(this.patientId(), entry.id)
      .subscribe({ next: () => this.load() });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(this.i18n.intlLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
