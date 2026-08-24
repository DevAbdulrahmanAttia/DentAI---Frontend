import { Component, OnInit, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { User } from '@core/models/auth.model';
import { Patient } from '@core/models/patient.model';
import { ProcedureType } from '@core/models/procedure.model';
import { Appointment } from '@core/models/appointment.model';
import { UsersService } from '@core/services/users.service';
import { AppointmentsService } from '@features/appointments/services/appointments.service';
import { PatientsService } from '@features/patients/services/patients.service';
import { ProceduresService } from '@features/appointments/services/procedures.service';
import { InputFieldComponent } from '@shared/ui/input-field/input-field.component';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-book-appointment-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputFieldComponent, TranslatePipe],
  templateUrl: './book-appointment-form.component.html',
  styleUrl: './book-appointment-form.component.css'
})
export class BookAppointmentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly patientsService = inject(PatientsService);
  private readonly proceduresService = inject(ProceduresService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly i18n = inject(I18nService);

  booked = output<Appointment>();

  protected readonly doctors = signal<User[]>([]);
  protected readonly procedures = signal<ProcedureType[]>([]);

  protected readonly searchControl = this.fb.control('');
  protected readonly searchResults = signal<Patient[]>([]);
  protected readonly searching = signal(false);
  protected readonly selectedPatient = signal<Patient | null>(null);
  protected readonly showNewPatientForm = signal(false);

  protected readonly newPatientForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', Validators.required]
  });

  protected readonly bookingForm = this.fb.nonNullable.group({
    doctorId: ['', Validators.required],
    procedureTypeId: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    notes: ['']
  });

  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly creatingPatient = signal(false);

  protected readonly canSubmit = computed(
    () => !!this.selectedPatient() || (this.showNewPatientForm() && this.newPatientForm.valid)
  );

  ngOnInit(): void {
    this.usersService.listDoctors().subscribe({ next: (doctors) => this.doctors.set(doctors) });
    this.proceduresService.list().subscribe({ next: (procedures) => this.procedures.set(procedures) });

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

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.searchResults.set([]);
    this.searchControl.setValue('', { emitEvent: false });
    this.showNewPatientForm.set(false);
  }

  clearSelectedPatient(): void {
    this.selectedPatient.set(null);
  }

  toggleNewPatientForm(): void {
    this.showNewPatientForm.set(!this.showNewPatientForm());
    this.selectedPatient.set(null);
  }

  formatPrice(procedure: ProcedureType): string {
    return `${this.i18n.t('common.egp')} ${Number(procedure.basePrice).toFixed(0)}`;
  }

  submit(): void {
    if (this.bookingForm.invalid || !this.canSubmit() || this.submitting()) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.submitError.set('');
    this.submitting.set(true);

    if (this.selectedPatient()) {
      this.bookAppointment(this.selectedPatient()!.id);
      return;
    }

    this.creatingPatient.set(true);
    const { name, phone } = this.newPatientForm.getRawValue();
    this.patientsService.create({ name, phone }).subscribe({
      next: (patient) => {
        this.creatingPatient.set(false);
        this.bookAppointment(patient.id);
      },
      error: (err) => {
        this.creatingPatient.set(false);
        this.submitting.set(false);
        this.submitError.set(err?.error?.message || this.i18n.t('appointments.createPatientFailed'));
      }
    });
  }

  private bookAppointment(patientId: string): void {
    const { doctorId, procedureTypeId, date, time } = this.bookingForm.getRawValue();
    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    this.appointmentsService.book({ patientId, doctorId, procedureTypeId, scheduledAt }).subscribe({
      next: (appointment) => {
        this.submitting.set(false);
        this.booked.emit(appointment);
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(
          err?.error?.message || this.i18n.t('appointments.bookFailed')
        );
      }
    });
  }
}
