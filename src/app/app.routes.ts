import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      // Feature lazy loading placeholders
      // { path: 'dashboard', loadChildren: () => import('@features/dashboard/dashboard.routes').then(m => m.dashboardRoutes) },
      // { path: 'patients', loadChildren: () => import('@features/patients/patients.routes').then(m => m.patientsRoutes) },
      // { path: 'appointments', loadChildren: () => import('@features/appointments/appointments.routes').then(m => m.appointmentsRoutes) },
      // { path: 'inventory', loadChildren: () => import('@features/inventory/inventory.routes').then(m => m.inventoryRoutes) },
      // { path: 'ai', loadChildren: () => import('@features/ai/ai.routes').then(m => m.aiRoutes) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('@layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      // { path: 'login', loadChildren: () => import('@features/auth/auth.routes').then(m => m.authRoutes) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
