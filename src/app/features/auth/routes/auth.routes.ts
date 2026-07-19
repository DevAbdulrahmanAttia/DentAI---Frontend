import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../pages/login-page/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'forgot',
    loadComponent: () =>
      import('../pages/forgot-password-page/forgot-password-page.component').then(
        (m) => m.ForgotPasswordPageComponent
      )
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
