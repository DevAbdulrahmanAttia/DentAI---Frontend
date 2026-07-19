import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputFieldComponent } from '@shared/ui/input-field/input-field.component';
import { OtpInputComponent } from '@shared/ui/otp-input/otp-input.component';
import { StepTrackerComponent } from '@shared/ui/step-tracker/step-tracker.component';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    InputFieldComponent,
    OtpInputComponent,
    StepTrackerComponent
  ],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.css'
})
export class ForgotPasswordPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  resetForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  activeStep = signal<number>(2); // Start at step 2 to match design reference visual
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  
  timerSeconds = signal<number>(42);
  private timerInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this.startTimer();
  }

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

  resendCode(): void {
    if (this.timerSeconds() > 0 || this.loading()) return;
    this.startTimer();
  }

  onSubmit(): void {
    if (this.resetForm.invalid || this.loading()) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { newPassword } = this.resetForm.value;

    this.authService.resetPassword(newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.activeStep.set(3); // Go to step 3 (Success)
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Failed to reset password. Please check the code.');
      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
