import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Appointment } from '@core/models/appointment.model';
import { DoctorOverview } from '@core/models/availability.model';
import { DelayKpis } from '@core/models/delay-management.model';
import { WaitlistEntry } from '@core/models/waitlist.model';
import { AppointmentsService } from '@features/appointments/services/appointments.service';
import { DelayManagementService } from '@features/appointments/services/delay-management.service';
import { AvailabilityService } from '@features/availability/services/availability.service';
import { WaitlistService } from '@features/waitlist/services/waitlist.service';
import { StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import { appointmentStatusInfo, riskLevelInfo, waitlistStatusInfo } from '@shared/utils/status-maps';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [RouterLink, StatusPillComponent, TranslatePipe],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  protected readonly i18n = inject(I18nService);
  private readonly waitlistService = inject(WaitlistService);
  private readonly delayManagementService = inject(DelayManagementService);
  private readonly availabilityService = inject(AvailabilityService);
  protected readonly authService = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly todaysAppointments = signal<Appointment[]>([]);
  protected readonly waitlistEntries = signal<WaitlistEntry[]>([]);
  protected readonly delayKpis = signal<DelayKpis | null>(null);
  protected readonly doctorsToday = signal<DoctorOverview[]>([]);

  protected readonly totalTodayCount = computed(() => this.todaysAppointments().length);
  protected readonly doneTodayCount = computed(
    () => this.todaysAppointments().filter((a) => a.status === 'done').length
  );
  protected readonly highRiskCount = computed(
    () => this.todaysAppointments().filter((a) => a.status === 'booked' && a.riskLevel === 'high').length
  );
  protected readonly waitingCount = computed(() => this.waitlistEntries().length);

  protected readonly appointmentStatusInfo = appointmentStatusInfo;
  protected readonly riskLevelInfo = riskLevelInfo;
  protected readonly waitlistStatusInfo = waitlistStatusInfo;

  get greetingName(): string {
    return this.authService.getUser()?.name ?? 'there';
  }

  ngOnInit(): void {
    const { from, to } = this.todayRange();

    this.appointmentsService.list({ from, to }).subscribe({
      next: (appointments) => {
        this.todaysAppointments.set(
          [...appointments].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });

    this.waitlistService.list('waiting').subscribe({
      next: (entries) => this.waitlistEntries.set(entries)
    });

    this.delayManagementService.getKpis().subscribe({
      next: (kpis) => this.delayKpis.set(kpis)
    });

    // Backend-side owner/receptionist-only endpoint — skip the call entirely for other roles.
    if (this.authService.hasRole(['owner', 'receptionist'])) {
      this.availabilityService.getOverview().subscribe({
        next: (overview) => this.doctorsToday.set(overview)
      });
    }
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString(this.i18n.intlLocale(), { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(this.i18n.intlLocale(), { month: 'short', day: 'numeric' });
  }

  private todayRange(): { from: string; to: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return { from: start.toISOString(), to: end.toISOString() };
  }
}
