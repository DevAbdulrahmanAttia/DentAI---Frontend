import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import {
  ChangePasswordPayload,
  SettingsService,
  UpdateProfilePayload
} from '@features/settings/services/settings.service';

type SettingsTab = 'clinic' | 'notifications' | 'account';

interface WeekdayOption {
  value: string;
  label: string;
}

const WEEKDAYS: WeekdayOption[] = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' }
];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  protected readonly authService = inject(AuthService);

  protected readonly weekdays = WEEKDAYS;
  protected readonly activeTab = signal<SettingsTab>('account');

  protected readonly clinicLoading = signal(true);
  protected readonly clinicLoadError = signal(false);
  protected readonly clinicSaving = signal(false);
  protected readonly clinicSaveError = signal('');
  protected readonly clinicSaved = signal(false);

  protected readonly notificationsSaving = signal(false);
  protected readonly notificationsSaveError = signal('');
  protected readonly notificationsSaved = signal(false);

  protected readonly accountSaving = signal(false);
  protected readonly accountSaveError = signal('');
  protected readonly accountSaved = signal(false);

  protected readonly passwordSaving = signal(false);
  protected readonly passwordSaveError = signal('');
  protected readonly passwordSaved = signal(false);

  protected readonly clinicForm = this.fb.nonNullable.group({
    clinicName: ['', Validators.required],
    address: [''],
    phone: [''],
    workingHoursStart: ['09:00', Validators.required],
    workingHoursEnd: ['18:00', Validators.required]
  });
  protected readonly selectedWorkingDays = signal<string[]>([]);

  protected readonly notificationsForm = this.fb.nonNullable.group({
    standardReminderLeadHours: ['24', Validators.required],
    highRiskReminderLeadHours: ['48, 24, 3', Validators.required]
  });

  protected readonly accountForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.accountForm.setValue({
        name: user.name,
        email: user.email,
        phone: user.phone ?? ''
      });
    }

    if (this.authService.hasRole('owner')) {
      this.loadClinicSettings();
    } else {
      this.clinicLoading.set(false);
    }
  }

  setTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }

  isWorkingDaySelected(day: string): boolean {
    return this.selectedWorkingDays().includes(day);
  }

  toggleWorkingDay(day: string): void {
    this.selectedWorkingDays.update((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day]
    );
  }

  private loadClinicSettings(): void {
    this.clinicLoading.set(true);
    this.clinicLoadError.set(false);
    this.settingsService.getClinicSettings().subscribe({
      next: (settings) => {
        this.clinicForm.setValue({
          clinicName: settings.clinicName,
          address: settings.address ?? '',
          phone: settings.phone ?? '',
          workingHoursStart: settings.workingHoursStart,
          workingHoursEnd: settings.workingHoursEnd
        });
        this.selectedWorkingDays.set(settings.workingDays);
        this.notificationsForm.setValue({
          standardReminderLeadHours: settings.standardReminderLeadHours.join(', '),
          highRiskReminderLeadHours: settings.highRiskReminderLeadHours.join(', ')
        });
        this.clinicLoading.set(false);
      },
      error: () => {
        this.clinicLoading.set(false);
        this.clinicLoadError.set(true);
      }
    });
  }

  saveClinicProfile(): void {
    if (this.clinicForm.invalid || this.clinicSaving()) {
      this.clinicForm.markAllAsTouched();
      return;
    }

    this.clinicSaving.set(true);
    this.clinicSaveError.set('');
    this.clinicSaved.set(false);
    const { clinicName, address, phone, workingHoursStart, workingHoursEnd } =
      this.clinicForm.getRawValue();

    this.settingsService
      .updateClinicSettings({
        clinicName,
        address: address || undefined,
        phone: phone || undefined,
        workingDays: this.selectedWorkingDays(),
        workingHoursStart,
        workingHoursEnd
      })
      .subscribe({
        next: () => {
          this.clinicSaving.set(false);
          this.clinicSaved.set(true);
        },
        error: (err) => {
          this.clinicSaving.set(false);
          this.clinicSaveError.set(err?.error?.message || 'Could not save clinic profile.');
        }
      });
  }

  saveNotificationPreferences(): void {
    if (this.notificationsForm.invalid || this.notificationsSaving()) {
      this.notificationsForm.markAllAsTouched();
      return;
    }

    const { standardReminderLeadHours, highRiskReminderLeadHours } =
      this.notificationsForm.getRawValue();
    const standard = this.parseHours(standardReminderLeadHours);
    const highRisk = this.parseHours(highRiskReminderLeadHours);

    if (!standard.length || !highRisk.length) {
      this.notificationsSaveError.set('Enter comma-separated whole numbers of hours (e.g. 24 or 48, 24, 3).');
      return;
    }

    this.notificationsSaving.set(true);
    this.notificationsSaveError.set('');
    this.notificationsSaved.set(false);

    this.settingsService
      .updateClinicSettings({
        standardReminderLeadHours: standard,
        highRiskReminderLeadHours: highRisk
      })
      .subscribe({
        next: () => {
          this.notificationsSaving.set(false);
          this.notificationsSaved.set(true);
        },
        error: (err) => {
          this.notificationsSaving.set(false);
          this.notificationsSaveError.set(
            err?.error?.message || 'Could not save notification preferences.'
          );
        }
      });
  }

  saveAccount(): void {
    if (this.accountForm.invalid || this.accountSaving()) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.accountSaving.set(true);
    this.accountSaveError.set('');
    this.accountSaved.set(false);
    const { name, email, phone } = this.accountForm.getRawValue();
    const payload: UpdateProfilePayload = { name, email, phone: phone || undefined };

    this.settingsService.updateProfile(payload).subscribe({
      next: (user) => {
        this.accountSaving.set(false);
        this.accountSaved.set(true);
        this.authService.updateStoredUser(user);
      },
      error: (err) => {
        this.accountSaving.set(false);
        this.accountSaveError.set(err?.error?.message || 'Could not save your profile.');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.passwordSaving()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.passwordSaveError.set('New password and confirmation do not match.');
      return;
    }

    this.passwordSaving.set(true);
    this.passwordSaveError.set('');
    this.passwordSaved.set(false);
    const payload: ChangePasswordPayload = { currentPassword, newPassword };

    this.settingsService.changePassword(payload).subscribe({
      next: () => {
        this.passwordSaving.set(false);
        this.passwordSaved.set(true);
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordSaving.set(false);
        this.passwordSaveError.set(err?.error?.message || 'Could not change your password.');
      }
    });
  }

  private parseHours(value: string): number[] {
    return value
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);
  }
}
