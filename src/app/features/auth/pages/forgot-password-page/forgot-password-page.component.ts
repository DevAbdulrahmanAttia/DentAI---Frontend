import { Component, inject, signal, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputFieldComponent } from '@shared/ui/input-field/input-field.component';
import { OtpInputComponent } from '@shared/ui/otp-input/otp-input.component';
import { StepTrackerComponent } from '@shared/ui/step-tracker/step-tracker.component';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    InputFieldComponent,
    OtpInputComponent,
    StepTrackerComponent,
    TranslatePipe
  ],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.css'
})
export class ForgotPasswordPageComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  requestForm: FormGroup = this.fb.group({
    phone: ['', [Validators.required]]
  });

  resetForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  activeStep = signal<number>(1);
  submittedPhone = signal<string>('');
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  timerSeconds = signal<number>(42);
  private timerInterval: ReturnType<typeof setInterval> | undefined;

  ngOnDestroy(): void {
    this.clearTimer();
  }

  startTimer(): void {
    this.clearTimer();
    this.timerSeconds.set(42);
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds() > 0) {
        this.timerSeconds.update(s => s - 1);
      } else {
        this.clearTimer();
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  get formattedTime(): string {
    const s = this.timerSeconds();
    return s < 10 ? `00:0${s}` : `00:${s}`;
  }

  onRequestSubmit(): void {
    if (this.requestForm.invalid || this.loading()) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { phone } = this.requestForm.value;

    this.authService.requestPasswordReset(phone).subscribe({
      next: () => {
        this.loading.set(false);
        this.submittedPhone.set(phone);
        this.activeStep.set(2);
        this.startTimer();
      },
      error: (err: { error?: { message?: string }; message?: string }) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || err?.message || this.i18n.t('auth.sendCodeFailed')
        );
      }
    });
  }

  resendCode(): void {
    if (this.timerSeconds() > 0 || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.requestPasswordReset(this.submittedPhone()).subscribe({
      next: () => {
        this.loading.set(false);
        this.startTimer();
      },
      error: (err: { error?: { message?: string }; message?: string }) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || err?.message || this.i18n.t('auth.resendFailed')
        );
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid || this.loading()) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { otp, newPassword } = this.resetForm.value;

    this.authService.resetPassword(this.submittedPhone(), otp, newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.activeStep.set(3); // Go to step 3 (Success)
      },
      error: (err: { error?: { message?: string }; message?: string }) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || err?.message || this.i18n.t('auth.resetFailed')
        );
      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
