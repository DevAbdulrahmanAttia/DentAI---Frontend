import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/auth.model';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputFieldComponent } from '@shared/ui/input-field/input-field.component';
import { MolarScannerComponent } from '../../components/molar-scanner/molar-scanner.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LogoComponent,
    ButtonComponent,
    InputFieldComponent,
    MolarScannerComponent
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    role: ['Owner', [Validators.required]],
    email: ['dr.amina@brightsmile.clinic', [Validators.required, Validators.email]],
    password: ['••••••••••', [Validators.required]],
    rememberMe: [true]
  });

  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  roles: UserRole[] = ['Owner', 'Doctor', 'Reception'];

  selectRole(role: UserRole): void {
    if (this.loading()) return;
    this.loginForm.patchValue({ role });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, role } = this.loginForm.value;

    this.authService.login(email, role).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Authentication failed. Please check your credentials.');
      }
    });
  }
}
