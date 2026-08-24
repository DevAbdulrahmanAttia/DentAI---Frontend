import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { DepositPolicyPreview, DepositType } from '@core/models/settings.model';
import {
  ChangePasswordPayload,
  SettingsService,
  UpdateProfilePayload
} from '@features/settings/services/settings.service';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

type SettingsTab = 'clinic' | 'scheduling' | 'deposits' | 'notifications' | 'account';

interface DepositTypeOption {
  value: DepositType;
  labelKey: string;
}

const DEPOSIT_TYPE_OPTIONS: DepositTypeOption[] = [
  { value: 'fixed', labelKey: 'settings.depositType.fixed' },
  { value: 'percentage', labelKey: 'settings.depositType.percentage' },
  { value: 'consultation_fee', labelKey: 'settings.depositType.consultationFee' }
];

interface GranularityOption {
  value: number;
  labelKey: string;
}

const GRANULARITY_OPTIONS: GranularityOption[] = [
  { value: 5, labelKey: 'settings.every5Min' },
  { value: 10, labelKey: 'settings.every10Min' },
  { value: 15, labelKey: 'settings.every15Min' },
  { value: 20, labelKey: 'settings.every20Min' },
  { value: 30, labelKey: 'settings.every30Min' },
  { value: 60, labelKey: 'settings.everyHour' }
];

interface WeekdayOption {
  value: string;
  labelKey: string;
}

const WEEKDAYS: WeekdayOption[] = [
  { value: 'mon', labelKey: 'weekday.monShort' },
  { value: 'tue', labelKey: 'weekday.tueShort' },
  { value: 'wed', labelKey: 'weekday.wedShort' },
  { value: 'thu', labelKey: 'weekday.thuShort' },
  { value: 'fri', labelKey: 'weekday.friShort' },
  { value: 'sat', labelKey: 'weekday.satShort' },
  { value: 'sun', labelKey: 'weekday.sunShort' }
];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  protected readonly authService = inject(AuthService);
  protected readonly i18n = inject(I18nService);

  protected readonly weekdays = WEEKDAYS;
  protected readonly granularityOptions = GRANULARITY_OPTIONS;
  protected readonly depositTypeOptions = DEPOSIT_TYPE_OPTIONS;
  protected readonly activeTab = signal<SettingsTab>('account');

  protected readonly clinicLoading = signal(true);
  protected readonly clinicLoadError = signal(false);
  protected readonly clinicSaving = signal(false);
  protected readonly clinicSaveError = signal('');
  protected readonly clinicSaved = signal(false);

  protected readonly schedulingSaving = signal(false);
  protected readonly schedulingSaveError = signal('');
  protected readonly schedulingSaved = signal(false);

  protected readonly depositsSaving = signal(false);
  protected readonly depositsSaveError = signal('');
  protected readonly depositsSaved = signal(false);

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

  protected readonly schedulingForm = this.fb.nonNullable.group({
    slotGranularityMin: [15, Validators.required],
    closingBufferMin: [15, [Validators.required, Validators.min(0), Validators.max(120)]],
    appointmentBufferMin: [5, [Validators.required, Validators.min(0), Validators.max(60)]],
    useLearnedDurations: [true]
  });

  protected readonly depositsForm = this.fb.nonNullable.group({
    requireDepositForHighRisk: [false],
    depositType: ['fixed' as DepositType, Validators.required],
    depositAmount: [200, [Validators.required, Validators.min(0)]],
    depositMaxPercentOfPrice: [
      50,
      [Validators.required, Validators.min(1), Validators.max(100)]
    ],
    defaultConsultationFee: [250, [Validators.required, Validators.min(0)]],
    consultationCreditedToTreatment: [true]
  });

  /** The saved policy priced across every dentist and procedure. */
  protected readonly policyPreview = signal<DepositPolicyPreview | null>(null);
  protected readonly policyPreviewLoading = signal(false);

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
    // Fetched on first open rather than at startup — it prices every dentist
    // against every procedure, which is wasted work for anyone who never
    // opens this tab.
    if (tab === 'deposits' && !this.policyPreview() && !this.policyPreviewLoading()) {
      this.loadPolicyPreview();
    }
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
        this.schedulingForm.setValue({
          slotGranularityMin: settings.slotGranularityMin,
          closingBufferMin: settings.closingBufferMin,
          appointmentBufferMin: settings.appointmentBufferMin,
          useLearnedDurations: settings.useLearnedDurations
        });
        this.notificationsForm.setValue({
          standardReminderLeadHours: settings.standardReminderLeadHours.join(', '),
          highRiskReminderLeadHours: settings.highRiskReminderLeadHours.join(', ')
        });
        this.depositsForm.setValue({
          requireDepositForHighRisk: settings.requireDepositForHighRisk,
          depositType: settings.depositType,
          depositAmount: Number(settings.depositAmount),
          depositMaxPercentOfPrice: Number(settings.depositMaxPercentOfPrice),
          defaultConsultationFee: Number(settings.defaultConsultationFee),
          consultationCreditedToTreatment: settings.consultationCreditedToTreatment
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
          this.clinicSaveError.set(err?.error?.message || this.i18n.t('settings.saveClinicFailed'));
        }
      });
  }

  saveScheduling(): void {
    if (this.schedulingForm.invalid || this.schedulingSaving()) {
      this.schedulingForm.markAllAsTouched();
      return;
    }

    this.schedulingSaving.set(true);
    this.schedulingSaveError.set('');
    this.schedulingSaved.set(false);
    const { slotGranularityMin, closingBufferMin, appointmentBufferMin, useLearnedDurations } =
      this.schedulingForm.getRawValue();

    this.settingsService
      .updateClinicSettings({
        slotGranularityMin: Number(slotGranularityMin),
        closingBufferMin,
        appointmentBufferMin,
        useLearnedDurations
      })
      .subscribe({
        next: () => {
          this.schedulingSaving.set(false);
          this.schedulingSaved.set(true);
        },
        error: (err) => {
          this.schedulingSaving.set(false);
          this.schedulingSaveError.set(err?.error?.message || this.i18n.t('settings.saveSchedulingFailed'));
        }
      });
  }

  saveDeposits(): void {
    if (this.depositsForm.invalid || this.depositsSaving()) {
      this.depositsForm.markAllAsTouched();
      return;
    }

    this.depositsSaving.set(true);
    this.depositsSaveError.set('');
    this.depositsSaved.set(false);
    const {
      requireDepositForHighRisk,
      depositType,
      depositAmount,
      depositMaxPercentOfPrice,
      defaultConsultationFee,
      consultationCreditedToTreatment
    } = this.depositsForm.getRawValue();

    this.settingsService
      .updateClinicSettings({
        requireDepositForHighRisk,
        depositType,
        depositAmount,
        depositMaxPercentOfPrice,
        defaultConsultationFee,
        consultationCreditedToTreatment
      })
      .subscribe({
        next: () => {
          this.depositsSaving.set(false);
          this.depositsSaved.set(true);
          // The grid prices the *saved* policy, so it is only meaningful once
          // the save lands — refreshing before this would show the old figures.
          this.loadPolicyPreview();
        },
        error: (err) => {
          this.depositsSaving.set(false);
          this.depositsSaveError.set(
            typeof err?.error?.message === 'string'
              ? err.error.message
              : Array.isArray(err?.error?.message)
                ? err.error.message.join(' ')
                : this.i18n.t('settings.saveDepositsFailed')
          );
        }
      });
  }

  loadPolicyPreview(): void {
    this.policyPreviewLoading.set(true);
    this.settingsService.getDepositPolicyPreview().subscribe({
      next: (preview) => {
        this.policyPreview.set(preview);
        this.policyPreviewLoading.set(false);
      },
      // Silent on failure: this is an explanatory aid beside the form, and a
      // broken preview must not read as a broken deposit policy.
      error: () => {
        this.policyPreview.set(null);
        this.policyPreviewLoading.set(false);
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
            err?.error?.message || this.i18n.t('settings.saveNotificationsFailed')
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
        this.accountSaveError.set(err?.error?.message || this.i18n.t('settings.saveAccountFailed'));
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
      this.passwordSaveError.set(this.i18n.t('settings.passwordsDoNotMatch'));
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
        this.passwordSaveError.set(err?.error?.message || this.i18n.t('settings.changePasswordFailed'));
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
