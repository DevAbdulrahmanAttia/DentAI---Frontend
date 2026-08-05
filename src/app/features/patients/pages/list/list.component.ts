import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { Patient } from '@core/models/patient.model';
import { PatientsService } from '@features/patients/services/patients.service';
import { PatientFormComponent } from '@features/patients/components/patient-form/patient-form.component';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { patientRiskBucket } from '@shared/utils/status-maps';

type RiskFilter = 'all' | 'low' | 'medium' | 'high';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PatientFormComponent, ModalComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly patientsService = inject(PatientsService);
  protected readonly authService = inject(AuthService);

  protected readonly searchControl = this.fb.control('');
  protected readonly patients = signal<Patient[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly riskFilter = signal<RiskFilter>('all');
  protected readonly filteredPatients = computed(() => {
    const filter = this.riskFilter();
    if (filter === 'all') return this.patients();
    return this.patients().filter((p) => patientRiskBucket(p.noShowRiskScore) === filter);
  });

  protected readonly pageSize = 15;
  protected readonly currentPage = signal(1);
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredPatients().length / this.pageSize))
  );
  protected readonly pagedPatients = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredPatients().slice(start, start + this.pageSize);
  });

  protected readonly showAddForm = signal(false);

  ngOnInit(): void {
    this.loadPatients('');

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          this.loading.set(true);
          this.loadError.set(false);
          return this.patientsService.search((query ?? '').trim());
        })
      )
      .subscribe({
        next: (results) => {
          this.setResults(results);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.loadError.set(true);
        }
      });
  }

  onRiskFilterChange(value: RiskFilter): void {
    this.riskFilter.set(value);
    this.currentPage.set(1);
  }

  goToPrevPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
  }

  onPatientAdded(patient: Patient): void {
    this.showAddForm.set(false);
    this.router.navigate(['/dashboard/patients', patient.id]);
  }

  private loadPatients(query: string): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.patientsService.search(query).subscribe({
      next: (results) => {
        this.setResults(results);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  private setResults(results: Patient[]): void {
    this.patients.set(results);
    this.currentPage.set(1);
  }
}
