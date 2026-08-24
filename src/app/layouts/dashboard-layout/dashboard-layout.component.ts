import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/auth.model';
import { AlertItem } from '@core/models/analytics.model';
import { AnalyticsService } from '@features/analytics/services/analytics.service';
import { AgentChatComponent } from '@features/agent/components/agent-chat/agent-chat.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LanguageSwitcherComponent } from '@shared/ui/language-switcher/language-switcher.component';

export interface NavItem {
  /** i18n key — resolved in the template via the `t` pipe. */
  labelKey: string;
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
  labelKey: string;
  items: NavItem[];
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LogoComponent,
    AgentChatComponent,
    TranslatePipe,
    LanguageSwitcherComponent
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayoutComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly analyticsService = inject(AnalyticsService);
  protected readonly i18n = inject(I18nService);

  protected readonly alerts = signal<AlertItem[]>([]);
  protected readonly showAlertsPanel = signal(false);
  protected readonly alertsViewed = signal(false);

  readonly navGroups: NavGroup[] = [
    {
      labelKey: 'nav.group.overview',
      items: [
        { labelKey: 'nav.dashboard', path: '/dashboard', icon: 'grid' },
        { labelKey: 'nav.appointments', path: '/dashboard/appointments', icon: 'calendar' },
        { labelKey: 'nav.waitlist', path: '/dashboard/waitlist', icon: 'list' },
        { labelKey: 'nav.delays', path: '/dashboard/delays', icon: 'clock' }
      ]
    },
    {
      labelKey: 'nav.group.clinic',
      items: [
        { labelKey: 'nav.patients', path: '/dashboard/patients', icon: 'users' },
        { labelKey: 'nav.billing', path: '/dashboard/billing', icon: 'wallet', roles: ['owner', 'receptionist'] },
        { labelKey: 'nav.inventory', path: '/dashboard/inventory', icon: 'box', roles: ['owner', 'receptionist'] },
        { labelKey: 'nav.analytics', path: '/dashboard/analytics', icon: 'chart', roles: ['owner'] }
      ]
    },
    {
      labelKey: 'nav.group.system',
      items: [
        { labelKey: 'nav.staff', path: '/dashboard/staff', icon: 'staff', roles: ['owner'] },
        { labelKey: 'nav.availability', path: '/dashboard/availability', icon: 'schedule', roles: ['owner'] },
        { labelKey: 'nav.auditLog', path: '/dashboard/audit-log', icon: 'shield', roles: ['owner'] },
        { labelKey: 'nav.settings', path: '/dashboard/settings', icon: 'gear' }
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
    return this.i18n.t(`role.${role}`);
  }

  logout(): void {
    this.authService.logout();
  }
}
