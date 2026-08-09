import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { User, UserRole } from '@core/models/auth.model';
import { StaffService } from '@features/staff/services/staff.service';
import { StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';

@Component({
  selector: 'app-staff-roster',
  standalone: true,
  imports: [ReactiveFormsModule, StatusPillComponent],
  templateUrl: './roster.component.html',
  styleUrl: './roster.component.css'
})
export class RosterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly staffService = inject(StaffService);
  protected readonly authService = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly staff = signal<User[]>([]);

  protected readonly showAddForm = signal(false);
  protected readonly addForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['receptionist' as UserRole, Validators.required],
    phone: [''],
    isClinician: [false]
  });
  protected readonly adding = signal(false);
  protected readonly addError = signal('');

  /**
   * Mirrors the role control so the template can reveal the "also treats
   * patients" option — that choice only exists for owners, since doctors
   * always practise and receptionists never do.
   */
  protected readonly selectedRole = signal<UserRole>('receptionist');

  protected readonly updatingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStaff();
    this.addForm.controls.role.valueChanges.subscribe((role) =>
      this.selectedRole.set(role)
    );
  }

  /** Doctors are clinicians by definition; only an owner's is a real choice. */
  treatsPatients(user: User): boolean {
    return user.isClinician ?? user.role === 'doctor';
  }

  canToggleClinician(user: User): boolean {
    return user.role === 'owner';
  }

  toggleClinician(user: User): void {
    if (!user.id || this.updatingId()) return;

    this.updatingId.set(user.id);
    this.staffService.update(user.id, { isClinician: !this.treatsPatients(user) }).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.loadStaff();
      },
      error: () => {
        this.updatingId.set(null);
      }
    });
  }

  loadStaff(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.staffService.list().subscribe({
      next: (staff) => {
        this.staff.set(staff);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
    this.addForm.reset({ role: 'receptionist', isClinician: false });
    this.selectedRole.set('receptionist');
    this.addError.set('');
  }

  submitAdd(): void {
    if (this.addForm.invalid || this.adding()) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.adding.set(true);
    this.addError.set('');
    const { name, email, password, role, phone, isClinician } = this.addForm.getRawValue();

    this.staffService
      .create({
        name,
        email,
        password,
        role,
        phone: phone || undefined,
        // Only sent for owners — the backend forces the right value for the
        // other two roles regardless of what we ask for.
        isClinician: role === 'owner' ? isClinician : undefined
      })
      .subscribe({
        next: () => {
          this.adding.set(false);
          this.showAddForm.set(false);
          this.addForm.reset({ role: 'receptionist', isClinician: false });
          this.selectedRole.set('receptionist');
          this.loadStaff();
        },
        error: (err) => {
          this.adding.set(false);
          this.addError.set(err?.error?.message || 'Could not create this staff account.');
        }
      });
  }

  isSelf(user: User): boolean {
    return user.id === this.authService.getUser()?.id;
  }

  toggleActive(user: User): void {
    if (!user.id || this.updatingId()) return;

    this.updatingId.set(user.id);
    this.staffService.update(user.id, { isActive: !user.isActive }).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.loadStaff();
      },
      error: () => {
        this.updatingId.set(null);
      }
    });
  }
}
