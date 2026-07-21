import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Angular Signals for reactive component state management
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedRole = signal<UserRole>('owner');
  readonly hidePassword = signal<boolean>(true);

  // Form definition with strict validation
  readonly loginForm: FormGroup = this.fb.nonNullable.group({
    email: ['dr.amina@brightsmile.clinic', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required, Validators.minLength(8)]],
    keepMeSignedIn: [true]
  });

  /**
   * Selects the active login role and fills the email field with a standard placeholder
   * for faster clinic operations testing.
   */
  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    
    // Auto-update placeholders based on selection to assist clinical team testing
    if (role === 'owner') {
      this.loginForm.patchValue({ email: 'dr.amina@brightsmile.clinic' });
    } else if (role === 'doctor') {
      this.loginForm.patchValue({ email: 'dr.zaki@brightsmile.clinic' });
    } else {
      this.loginForm.patchValue({ email: 'receptionist@brightsmile.clinic' });
    }
  }

  /**
   * Toggles password input visibility (show/hide password).
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update((val: boolean) => !val);
  }

  /**
   * Submits the authentication request, validating fields and setting loading / error state signals.
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();
    const role = this.selectedRole();

    this.authService.login({ email, password, role }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || err?.message || 'Invalid clinic credentials. Please verify and retry.');
      }
    });
  }
}
