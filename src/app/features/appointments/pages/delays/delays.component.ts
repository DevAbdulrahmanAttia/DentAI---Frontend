import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
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
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

interface TimelineBlock {
  appointment: Appointment;
  delayMin: number;
  isCurrent: boolean;
  /** How many minutes a now-finished visit ran past its own scheduled end — 0 if it isn't done, or finished on time/early. Purely historical: it never feeds the forward-looking delay KPIs or cascade. */
  lateFinishMin: number;
  /** Percent offset/width within the rendered working-hours window. */
  leftPct: number;
  widthPct: number;
  /** Pre-formatted for the block label, e.g. "09:00 – 09:40". */
  startLabel: string;
  endLabel: string;
}

/**
 * Fallback frame when the doctor has nothing booked. The real frame is derived
 * from the day's own appointments — a fixed 08:00-22:00 window squeezed a
 * 09:00-18:00 clinic into a third of the width and left the rest empty, which
 * made every block too small to read and every gap impossible to judge.
 */
const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 18;

/** Never render a frame narrower than this, so one lone visit can't fill the day. */
const MIN_WINDOW_HOURS = 4;

/** How often the "now" marker re-renders. */
const NOW_TICK_MS = 30_000;

@Component({
  selector: 'app-delays-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './delays.component.html',
  styleUrl: './delays.component.css'
})
export class DelaysComponent implements OnInit, OnDestroy {
  private readonly delayService = inject(DelayManagementService);
  protected readonly i18n = inject(I18nService);
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
   * Drives the "now" marker. The delay figures are recomputed server-side on
   * every load, but the marker has to keep moving between loads or the
   * timeline looks frozen while you are presenting from it.
   */
  private readonly now = signal(Date.now());
  private nowTimer?: ReturnType<typeof setInterval>;

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

  /**
   * The hour range actually drawn, derived from the day rather than fixed.
   *
   * Floors to the hour before the first visit and ceils to the hour after the
   * last one ends, so the frame is only ever as wide as the day really is.
   */
  protected readonly timelineWindow = computed<{ startHour: number; endHour: number }>(() => {
    const appointments = this.timelineAppointments();
    if (appointments.length === 0) {
      return { startHour: DEFAULT_START_HOUR, endHour: DEFAULT_END_HOUR };
    }

    let earliest = Number.POSITIVE_INFINITY;
    let latest = Number.NEGATIVE_INFINITY;
    for (const appt of appointments) {
      const start = new Date(appt.scheduledAt);
      const startHour = start.getHours() + start.getMinutes() / 60;
      earliest = Math.min(earliest, startHour);
      latest = Math.max(latest, startHour + appt.durationMin / 60);
    }

    let startHour = Math.floor(earliest);
    let endHour = Math.ceil(latest);
    // Widen symmetrically rather than from one side, so a short day still
    // sits in the middle of the frame instead of hugging an edge.
    while (endHour - startHour < MIN_WINDOW_HOURS) {
      if (startHour > 0) startHour--;
      if (endHour - startHour < MIN_WINDOW_HOURS && endHour < 24) endHour++;
    }
    return { startHour, endHour };
  });

  protected readonly timelineHours = computed<{ hour: number; leftPct: number }[]>(() => {
    const { startHour, endHour } = this.timelineWindow();
    const span = endHour - startHour;
    return Array.from({ length: span + 1 }, (_, i) => ({
      hour: startHour + i,
      leftPct: (i / span) * 100
    }));
  });

  /** Percent position of the current time, or null when it falls outside the frame. */
  protected readonly nowPct = computed<number | null>(() => {
    const { startHour, endHour } = this.timelineWindow();
    const now = new Date(this.now());
    const hours = now.getHours() + now.getMinutes() / 60;
    if (hours < startHour || hours > endHour) return null;
    return ((hours - startHour) / (endHour - startHour)) * 100;
  });

  protected readonly nowLabel = computed(() => this.clock(new Date(this.now())));

  protected readonly timelineBlocks = computed<TimelineBlock[]>(() => {
    const delays = this.delayByAppointmentId();
    return this.timelineAppointments().map((appt) => {
      const start = new Date(appt.scheduledAt);
      const end = new Date(start.getTime() + appt.durationMin * 60000);
      return {
        appointment: appt,
        delayMin: delays.get(appt.id) ?? 0,
        isCurrent: appt.status === 'in_progress',
        lateFinishMin: this.lateFinishMin(appt),
        startLabel: this.clock(start),
        endLabel: this.clock(end),
        ...this.timelinePosition(appt)
      };
    });
  });

  private clock(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  /** Minutes a finished visit ran past its own scheduled end — purely historical, never feeds the forward-looking KPIs/cascade above. */
  private lateFinishMin(appt: Appointment): number {
    if (appt.status !== 'done' || !appt.actualEndAt) return 0;
    const scheduledEndMs = new Date(appt.scheduledAt).getTime() + appt.durationMin * 60000;
    const actualEndMs = new Date(appt.actualEndAt).getTime();
    return Math.max(0, Math.round((actualEndMs - scheduledEndMs) / 60000));
  }

  ngOnInit(): void {
    this.nowTimer = setInterval(() => this.now.set(Date.now()), NOW_TICK_MS);
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

  ngOnDestroy(): void {
    clearInterval(this.nowTimer);
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
        this.actionError.set(err?.error?.message ?? this.i18n.t('delays.actionFailed'));
      }
    });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString(this.i18n.intlLocale(), { hour: '2-digit', minute: '2-digit' });
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
    const { startHour, endHour } = this.timelineWindow();
    const windowStart = new Date(appt.scheduledAt);
    windowStart.setHours(startHour, 0, 0, 0);
    const windowMs = (endHour - startHour) * 3600_000;

    const startMs = new Date(appt.scheduledAt).getTime() - windowStart.getTime();
    const widthMs = appt.durationMin * 60000;

    const leftPct = Math.max(0, Math.min(100, (startMs / windowMs) * 100));
    const widthPct = Math.max(2, Math.min(100 - leftPct, (widthMs / windowMs) * 100));
    return { leftPct, widthPct };
  }

  private todayRange(): { from: string; to: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return { from: start.toISOString(), to: end.toISOString() };
  }
}
