import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'auth',
    loadComponent: () => import('@layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      { path: '', loadChildren: () => import('@features/auth/routes/auth.routes').then((m) => m.authRoutes) }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('@layouts/dashboard-layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
