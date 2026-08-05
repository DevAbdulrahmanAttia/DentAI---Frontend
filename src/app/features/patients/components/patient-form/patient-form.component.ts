import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Patient } from '@core/models/patient.model';
import { PatientsService } from '@features/patients/services/patients.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.css'
})
export class PatientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly patientsService = inject(PatientsService);

  mode = input<'add' | 'edit'>('add');
  initialValue = input<Patient | undefined>(undefined);

  saved = output<Patient>();

  protected saveError = '';
  protected isSaving = false;

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    dateOfBirth: [''],
    medicalNotes: ['']
  });

  ngOnInit(): void {
    const patient = this.initialValue();
    if (this.mode() === 'edit' && patient) {
      this.form.setValue({
        name: patient.name,
        phone: patient.phone,
        email: patient.email ?? '',
        dateOfBirth: patient.dateOfBirth ?? '',
        medicalNotes: patient.medicalNotes ?? ''
      });
    }
  }

  get submitLabel(): string {
    if (this.isSaving) return this.mode() === 'add' ? 'Adding...' : 'Saving...';
    return this.mode() === 'add' ? 'Add patient' : 'Save changes';
  }

  submit(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.saveError = '';
    const { name, phone, email, dateOfBirth, medicalNotes } = this.form.getRawValue();
    const payload = {
      name,
      phone,
      email: email || undefined,
      dateOfBirth: dateOfBirth || undefined,
      medicalNotes: medicalNotes || undefined
    };

    const request =
      this.mode() === 'add'
        ? this.patientsService.create(payload)
        : this.patientsService.update(this.initialValue()!.id, payload);

    request.subscribe({
      next: (patient) => {
        this.isSaving = false;
        this.saved.emit(patient);
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err?.error?.message || 'Could not save this patient.';
      }
    });
  }
}
