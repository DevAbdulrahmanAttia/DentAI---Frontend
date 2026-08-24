import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/auth.model';
import { Patient } from '@core/models/patient.model';
import { ProcedureType } from '@core/models/procedure.model';
import { UsersService } from '@core/services/users.service';
import { PatientsService } from '@features/patients/services/patients.service';
import { ProceduresService } from '@features/appointments/services/procedures.service';
import { WaitlistEntry, WaitlistStatus } from '@core/models/waitlist.model';
import { WaitlistService } from '@features/waitlist/services/waitlist.service';
import { StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import { waitlistPriorityInfo, waitlistStatusInfo } from '@shared/utils/status-maps';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

type FilterOption = WaitlistStatus | 'all';

@Component({
  selector: 'app-waitlist-manager',
  standalone: true,
  imports: [ReactiveFormsModule, StatusPillComponent, TranslatePipe],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.css'
})
export class ManagerComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly i18n = inject(I18nService);
  private readonly waitlistService = inject(WaitlistService);
  private readonly patientsService = inject(PatientsService);
  private readonly usersService = inject(UsersService);
  private readonly proceduresService = inject(ProceduresService);
  protected readonly authService = inject(AuthService);

  protected readonly waitlistStatusInfo = waitlistStatusInfo;
  protected readonly waitlistPriorityInfo = waitlistPriorityInfo;

  protected readonly filters: { value: FilterOption; labelKey: string }[] = [
    { value: 'all', labelKey: 'common.all' },
    { value: 'waiting', labelKey: 'status.waiting' },
    { value: 'offered', labelKey: 'status.offered' },
    { value: 'filled', labelKey: 'status.filled' },
    { value: 'expired', labelKey: 'status.expired' }
  ];
  protected readonly activeFilter = signal<FilterOption>('all');

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly entries = signal<WaitlistEntry[]>([]);

  protected readonly doctors = signal<User[]>([]);
  protected readonly procedures = signal<ProcedureType[]>([]);

  // Add-to-waitlist form
  protected readonly showAddForm = signal(false);
  protected readonly searchControl = this.fb.control('');
  protected readonly searchResults = signal<Patient[]>([]);
  protected readonly searching = signal(false);
  protected readonly selectedPatient = signal<Patient | null>(null);
  protected readonly addForm = this.fb.nonNullable.group({
    preferredDateFrom: ['', Validators.required],
    preferredDateTo: [''],
    preferredTimeStart: [''],
    preferredTimeEnd: ['']
  });
  protected readonly adding = signal(false);
  protected readonly addError = signal('');

  protected readonly removingEntryId = signal<string | null>(null);

  // Accept-offer form
  protected readonly acceptingEntryId = signal<string | null>(null);
  protected readonly acceptForm = this.fb.nonNullable.group({
    doctorId: ['', Validators.required],
    procedureTypeId: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required]
  });
  protected readonly accepting = signal(false);
  protected readonly acceptError = signal('');

  ngOnInit(): void {
    this.usersService.listDoctors().subscribe({ next: (doctors) => this.doctors.set(doctors) });
    this.proceduresService.list().subscribe({ next: (procedures) => this.procedures.set(procedures) });
    this.loadEntries();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          const trimmed = (query ?? '').trim();
          if (trimmed.length < 2) {
            this.searching.set(false);
            return of<Patient[]>([]);
          }
          this.searching.set(true);
          return this.patientsService.search(trimmed);
        })
      )
      .subscribe({
        next: (results) => {
          this.searching.set(false);
          this.searchResults.set(results);
        },
        error: () => this.searching.set(false)
      });
  }

  setFilter(filter: FilterOption): void {
    this.activeFilter.set(filter);
    this.loadEntries();
  }

  loadEntries(): void {
    this.loading.set(true);
    this.loadError.set(false);
    const filter = this.activeFilter();

    this.waitlistService.list(filter === 'all' ? undefined : filter).subscribe({
      next: (entries) => {
        this.entries.set(
          [...entries].sort((a, b) => a.preferredDateFrom.localeCompare(b.preferredDateFrom))
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(this.i18n.intlLocale(), { weekday: 'short', month: 'short', day: 'numeric' });
  }

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
    this.selectedPatient.set(null);
    this.addForm.reset();
    this.addError.set('');
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.searchResults.set([]);
    this.searchControl.setValue('', { emitEvent: false });
  }

  clearSelectedPatient(): void {
    this.selectedPatient.set(null);
  }

  submitAdd(): void {
    const patient = this.selectedPatient();
    if (!patient || this.addForm.invalid || this.adding()) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.adding.set(true);
    this.addError.set('');
    const { preferredDateFrom, preferredDateTo, preferredTimeStart, preferredTimeEnd } =
      this.addForm.getRawValue();

    this.waitlistService
      .create({
        patientId: patient.id,
        preferredDateFrom,
        preferredDateTo: preferredDateTo || undefined,
        preferredTimeStart: preferredTimeStart || undefined,
        preferredTimeEnd: preferredTimeEnd || undefined
      })
      .subscribe({
        next: () => {
          this.adding.set(false);
          this.showAddForm.set(false);
          this.selectedPatient.set(null);
          this.addForm.reset();
          this.loadEntries();
        },
        error: (err) => {
          this.adding.set(false);
          this.addError.set(err?.error?.message || this.i18n.t('waitlist.addFailed'));
        }
      });
  }

  removeEntry(entry: WaitlistEntry): void {
    if (this.removingEntryId()) return;
    this.removingEntryId.set(entry.id);
    this.waitlistService.remove(entry.id).subscribe({
      next: () => {
        this.removingEntryId.set(null);
        this.loadEntries();
      },
      error: () => this.removingEntryId.set(null)
    });
  }

  changeStatus(entry: WaitlistEntry, status: WaitlistStatus): void {
    if (status === entry.status) return;
    this.waitlistService.updateStatus(entry.id, status).subscribe({
      next: () => this.loadEntries()
    });
  }

  startAccept(entry: WaitlistEntry): void {
    this.acceptingEntryId.set(entry.id);
    this.acceptError.set('');
    this.acceptForm.reset({ doctorId: '', procedureTypeId: '', date: '', time: '' });
  }

  cancelAccept(): void {
    this.acceptingEntryId.set(null);
  }

  submitAccept(entry: WaitlistEntry): void {
    if (this.acceptForm.invalid || this.accepting()) {
      this.acceptForm.markAllAsTouched();
      return;
    }

    this.accepting.set(true);
    this.acceptError.set('');
    const { doctorId, procedureTypeId, date, time } = this.acceptForm.getRawValue();
    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    this.waitlistService.accept(entry.id, { doctorId, procedureTypeId, scheduledAt }).subscribe({
      next: () => {
        this.accepting.set(false);
        this.acceptingEntryId.set(null);
        this.loadEntries();
      },
      error: (err) => {
        this.accepting.set(false);
        this.acceptError.set(err?.error?.message || this.i18n.t('waitlist.bookFailed'));
      }
    });
  }
}
