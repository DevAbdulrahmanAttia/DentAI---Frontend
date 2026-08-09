import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Appointment } from '@core/models/appointment.model';
import {
  DelayActionType,
  DelayedAppointmentEntry,
  DelayKpis
} from '@core/models/delay-management.model';
import { AppointmentsService } from '@features/appointments/services/appointments.service';
import { DelayManagementService } from '@features/appointments/services/delay-management.service';
import { StaffService } from '@features/staff/services/staff.service';

interface TimelineBlock {
  appointment: Appointment;
  delayMin: number;
  isCurrent: boolean;
  /** How many minutes a now-finished visit ran past its own scheduled end — 0 if it isn't done, or finished on time/early. Purely historical: it never feeds the forward-looking delay KPIs or cascade. */
  lateFinishMin: number;
  /** Percent offset/width within the rendered working-hours window. */
  leftPct: number;
  widthPct: number;
}

const TIMELINE_START_HOUR = 8;
const TIMELINE_END_HOUR = 22;

@Component({
  selector: 'app-delays-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './delays.component.html',
  styleUrl: './delays.component.css'
})
export class DelaysComponent implements OnInit {
  private readonly delayService = inject(DelayManagementService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly staffService = inject(StaffService);

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly kpis = signal<DelayKpis | null>(null);
  protected readonly entries = signal<DelayedAppointmentEntry[]>([]);
  protected readonly doctors = signal<{ id: string; name: string }[]>([]);
  protected readonly selectedDoctorId = signal<string | null>(null);
  protected readonly timelineAppointments = signal<Appointment[]>([]);
  protected readonly actionBusyId = signal<string | null>(null);
  protected readonly actionError = signal('');

  /**
   * Visits the cascade has pushed past the doctor's finish time. Surfaced as
   * its own panel because these need a decision from a person today, unlike
   * an ordinary delay which usually just resolves itself.
   */
  protected readonly atRiskEntries = computed(() =>
    this.entries().filter((e) => e.atRiskAfterHours),
  );

  protected readonly delayByAppointmentId = computed(() => {
    const map = new Map<string, number>();
    for (const e of this.entries()) map.set(e.appointmentId, e.estimatedDelayMin);
    return map;
  });

  protected readonly timelineBlocks = computed<TimelineBlock[]>(() => {
    const delays = this.delayByAppointmentId();
    return this.timelineAppointments().map((appt) => ({
      appointment: appt,
      delayMin: delays.get(appt.id) ?? 0,
      isCurrent: appt.status === 'in_progress',
      lateFinishMin: this.lateFinishMin(appt),
      ...this.timelinePosition(appt)
    }));
  });

  /** Minutes a finished visit ran past its own scheduled end — purely historical, never feeds the forward-looking KPIs/cascade above. */
  private lateFinishMin(appt: Appointment): number {
    if (appt.status !== 'done' || !appt.actualEndAt) return 0;
    const scheduledEndMs = new Date(appt.scheduledAt).getTime() + appt.durationMin * 60000;
    const actualEndMs = new Date(appt.actualEndAt).getTime();
    return Math.max(0, Math.round((actualEndMs - scheduledEndMs) / 60000));
  }

  protected readonly timelineHours = Array.from(
    { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 },
    (_, i) => TIMELINE_START_HOUR + i
  );

  ngOnInit(): void {
    this.staffService.list().subscribe({
      next: (users) => {
        const doctors = users
          .filter((u): u is typeof u & { id: string } => !!u.id)
          .filter((u) => (u.isClinician ?? u.role === 'doctor') && u.isActive !== false)
          .map((u) => ({ id: u.id, name: u.name }));
        this.doctors.set(doctors);
        if (doctors.length > 0 && !this.selectedDoctorId()) {
          this.selectedDoctorId.set(doctors[0].id);
        }
        this.loadAll();
      },
      error: () => this.loadAll()
    });
  }

  selectDoctor(id: string): void {
    this.selectedDoctorId.set(id);
    this.loadTimeline();
  }

  act(entry: DelayedAppointmentEntry, action: DelayActionType): void {
    if (this.actionBusyId()) return;
    this.actionBusyId.set(entry.appointmentId);
    this.actionError.set('');

    this.delayService.recordAction(entry.appointmentId, { action }).subscribe({
      next: () => {
        this.actionBusyId.set(null);
        this.loadAll();
      },
      error: (err: { error?: { message?: string } }) => {
        this.actionBusyId.set(null);
        this.actionError.set(err?.error?.message ?? 'Could not record that action.');
      }
    });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private loadAll(): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.delayService.getKpis().subscribe({
      next: (kpis) => this.kpis.set(kpis)
    });

    this.delayService.getSchedule().subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
        this.loadTimeline();
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  private loadTimeline(): void {
    const doctorId = this.selectedDoctorId();
    if (!doctorId) return;

    const { from, to } = this.todayRange();
    this.appointmentsService.list({ doctorId, from, to }).subscribe({
      next: (appointments) => {
        this.timelineAppointments.set(
          [...appointments]
            .filter((a) => a.status !== 'cancelled')
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
        );
      }
    });
  }

  private timelinePosition(appt: Appointment): { leftPct: number; widthPct: number } {
    const windowStart = new Date();
    windowStart.setHours(TIMELINE_START_HOUR, 0, 0, 0);
    const windowMs = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 3600_000;

    const startMs = new Date(appt.scheduledAt).getTime() - windowStart.getTime();
    const widthMs = appt.durationMin * 60000;

    const leftPct = Math.max(0, Math.min(100, (startMs / windowMs) * 100));
    const widthPct = Math.max(1.5, Math.min(100 - leftPct, (widthMs / windowMs) * 100));
    return { leftPct, widthPct };
  }

  private todayRange(): { from: string; to: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return { from: start.toISOString(), to: end.toISOString() };
  }
}
