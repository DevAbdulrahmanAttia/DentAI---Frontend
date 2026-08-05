import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/auth.model';
import { AlertItem } from '@core/models/analytics.model';
import { AnalyticsService } from '@features/analytics/services/analytics.service';
import { AgentChatComponent } from '@features/agent/components/agent-chat/agent-chat.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';

export interface NavItem {
  label: string;
  path: string;
  icon:
    | 'grid'
    | 'calendar'
    | 'list'
    | 'users'
    | 'box'
    | 'chart'
    | 'gear'
    | 'staff'
    | 'sparkle'
    | 'clock'
    | 'wallet'
    | 'shield'
    | 'schedule';
  disabled?: boolean;
  badge?: number;
  /** When set, the item is hidden entirely (not greyed) for users without one of these roles. */
  roles?: UserRole[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent, AgentChatComponent],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayoutComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly analyticsService = inject(AnalyticsService);

  protected readonly alerts = signal<AlertItem[]>([]);
  protected readonly showAlertsPanel = signal(false);
  protected readonly alertsViewed = signal(false);

  readonly navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
        { label: 'Appointments', path: '/dashboard/appointments', icon: 'calendar' },
        { label: 'Waitlist', path: '/dashboard/waitlist', icon: 'list' },
        { label: 'Delayed Schedule', path: '/dashboard/delays', icon: 'clock' }
      ]
    },
    {
      label: 'Clinic',
      items: [
        { label: 'Patients', path: '/dashboard/patients', icon: 'users' },
        { label: 'Billing', path: '/dashboard/billing', icon: 'wallet', roles: ['owner', 'receptionist'] },
        { label: 'Inventory', path: '/dashboard/inventory', icon: 'box', roles: ['owner', 'receptionist'] },
        { label: 'Analytics', path: '/dashboard/analytics', icon: 'chart', roles: ['owner'] },
        { label: 'AI Assistant', path: '/dashboard/support', icon: 'sparkle' }
      ]
    },
    {
      label: 'System',
      items: [
        { label: 'Staff', path: '/dashboard/staff', icon: 'staff', roles: ['owner'] },
        { label: 'Doctor Schedules', path: '/dashboard/availability', icon: 'schedule', roles: ['owner'] },
        { label: 'Audit Log', path: '/dashboard/audit-log', icon: 'shield', roles: ['owner'] },
        { label: 'Settings', path: '/dashboard/settings', icon: 'gear' }
      ]
    }
  ];

  ngOnInit(): void {
    // The alerts feed is Owner-only backend-side (@Roles(OWNER) on
    // GET /analytics/alerts), so only fetch it for Owner sessions.
    if (this.authService.hasRole('owner')) {
      this.analyticsService.getAlerts().subscribe({ next: (alerts) => this.alerts.set(alerts) });
    }
  }

  isVisible(item: NavItem): boolean {
    return !item.roles || this.authService.hasRole(item.roles);
  }

  toggleAlertsPanel(): void {
    const next = !this.showAlertsPanel();
    this.showAlertsPanel.set(next);
    if (next) {
      this.alertsViewed.set(true);
    }
  }

  /** All current alerts are inventory-flagged items — jump to Inventory pre-filtered to the item. */
  goToAlert(alert: AlertItem): void {
    this.showAlertsPanel.set(false);
    void this.router.navigate(['/dashboard/inventory'], { queryParams: { q: alert.itemName } });
  }

  get initials(): string {
    const name = this.authService.getUser()?.name ?? '?';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  get displayName(): string {
    return this.authService.getUser()?.name ?? '';
  }

  get roleLabel(): string {
    const role = this.authService.userRole();
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  logout(): void {
    this.authService.logout();
  }
}
