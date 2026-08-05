import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: 'auth',
    loadComponent: () => import('@layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      { path: '', loadChildren: () => import('@features/auth/routes/auth.routes').then((m) => m.authRoutes) }
    ]
  },
  {
    path: 'confirm/:id',
    loadComponent: () =>
      import('@features/waitlist/pages/confirm/confirm.component').then((m) => m.ConfirmComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('@layouts/dashboard-layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('@features/dashboard/pages/overview/overview.component').then((m) => m.OverviewComponent)
      },
      {
        path: 'appointments',
        pathMatch: 'full',
        loadComponent: () =>
          import('@features/appointments/pages/calendar/calendar.component').then((m) => m.CalendarComponent)
      },
      {
        path: 'appointments/:id',
        loadComponent: () =>
          import('@features/appointments/pages/details/details.component').then((m) => m.DetailsComponent)
      },
      {
        path: 'waitlist',
        loadComponent: () =>
          import('@features/waitlist/pages/manager/manager.component').then((m) => m.ManagerComponent)
      },
      {
        path: 'delays',
        loadComponent: () =>
          import('@features/appointments/pages/delays/delays.component').then((m) => m.DelaysComponent)
      },
      {
        path: 'patients',
        pathMatch: 'full',
        loadComponent: () =>
          import('@features/patients/pages/list/list.component').then((m) => m.ListComponent)
      },
      {
        path: 'patients/:id',
        loadComponent: () =>
          import('@features/patients/pages/detail/detail.component').then((m) => m.DetailComponent)
      },
      {
        path: 'inventory',
        canActivate: [roleGuard(['owner', 'receptionist'])],
        loadComponent: () =>
          import('@features/inventory/pages/list/list.component').then((m) => m.ListComponent)
      },
      {
        path: 'analytics',
        canActivate: [roleGuard(['owner'])],
        loadComponent: () =>
          import('@features/analytics/pages/overview/overview.component').then((m) => m.OverviewComponent)
      },
      {
        path: 'billing',
        pathMatch: 'full',
        loadComponent: () =>
          import('@features/billing/pages/invoices/invoices.component').then((m) => m.InvoicesComponent)
      },
      {
        path: 'billing/daily-closing',
        loadComponent: () =>
          import('@features/billing/pages/daily-closing/daily-closing.component').then(
            (m) => m.DailyClosingComponent
          )
      },
      {
        path: 'billing/:id',
        loadComponent: () =>
          import('@features/billing/pages/invoice-detail/invoice-detail.component').then(
            (m) => m.InvoiceDetailComponent
          )
      },
      {
        path: 'staff',
        canActivate: [roleGuard(['owner'])],
        loadComponent: () =>
          import('@features/staff/pages/roster/roster.component').then((m) => m.RosterComponent)
      },
      {
        path: 'support',
        loadComponent: () =>
          import('@features/support/pages/faq-assistant/faq-assistant.component').then((m) => m.FaqAssistantComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('@features/settings/pages/settings/settings.component').then((m) => m.SettingsComponent)
      },
      {
        path: 'audit-log',
        canActivate: [roleGuard(['owner'])],
        loadComponent: () =>
          import('@features/audit-log/pages/log/log.component').then((m) => m.LogComponent)
      },
      {
        path: 'availability',
        canActivate: [roleGuard(['owner'])],
        loadComponent: () =>
          import('@features/availability/pages/schedule/schedule.component').then((m) => m.ScheduleComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
