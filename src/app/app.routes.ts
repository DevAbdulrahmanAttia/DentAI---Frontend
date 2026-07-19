import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: 'auth',
    loadComponent: () => import('@layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: '', loadChildren: () => import('@features/auth/routes/auth.routes').then(m => m.authRoutes) }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
