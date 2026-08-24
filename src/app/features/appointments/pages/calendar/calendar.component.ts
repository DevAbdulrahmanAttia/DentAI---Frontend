import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { UsersService } from '@core/services/users.service';
import { User } from '@core/models/auth.model';
import { Appointment, RiskLevel } from '@core/models/appointment.model';
import { AppointmentsService } from '@features/appointments/services/appointments.service';
import { BookAppointmentFormComponent } from '@features/appointments/components/book-appointment-form/book-appointment-form.component';
import { AppointmentDetailsPanelComponent } from '@features/appointments/components/appointment-details-panel/appointment-details-panel.component';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import { appointmentStatusInfo, riskLevelInfo } from '@shared/utils/status-maps';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

type ViewMode = 'day' | 'week' | 'month';
type RiskFilter = 'all' | RiskLevel;

interface MonthCell {
  date: Date;
  inCurrentMonth: boolean;
}

@Component({
  selector: 'app-appointments-calendar',
  standalone: true,
  imports: [BookAppointmentFormComponent, AppointmentDetailsPanelComponent, ModalComponent, StatusPillComponent, TranslatePipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  protected readonly i18n = inject(I18nService);
  private readonly usersService = inject(UsersService);
  protected readonly authService = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly doctors = signal<User[]>([]);
  protected readonly selectedDate = signal<Date>(this.startOfDay(new Date()));
  protected readonly selectedDoctorId = signal<string>('');
  protected readonly selectedRiskLevel = signal<RiskFilter>('all');
  protected readonly viewMode = signal<ViewMode>('day');

  protected readonly showBookModal = signal(false);
  protected readonly selectedAppointmentId = signal<string | null>(null);

  protected readonly appointmentStatusInfo = appointmentStatusInfo;
  protected readonly riskLevelInfo = riskLevelInfo;

  protected readonly dateLabel = computed(() => {
    const mode = this.viewMode();
    const date = this.selectedDate();

    if (mode === 'day') {
      return date.toLocaleDateString(this.i18n.intlLocale(), { weekday: 'long', month: 'long', day: 'numeric' });
    }
    if (mode === 'week') {
      const days = this.weekDays();
      const startLabel = days[0].toLocaleDateString(this.i18n.intlLocale(), { month: 'short', day: 'numeric' });
      const endLabel = days[6].toLocaleDateString(this.i18n.intlLocale(), { month: 'short', day: 'numeric' });
      return `${startLabel} – ${endLabel}`;
    }
    return date.toLocaleDateString(this.i18n.intlLocale(), { month: 'long', year: 'numeric' });
  });

  protected readonly visibleAppointments = computed(() => {
    const doctorId = this.selectedDoctorId();
    const riskLevel = this.selectedRiskLevel();
    return this.appointments().filter((a) => {
      const matchesDoctor = !doctorId || a.doctor.id === doctorId;
      const matchesRisk = riskLevel === 'all' || a.riskLevel === riskLevel;
      return matchesDoctor && matchesRisk;
    });
  });

  protected readonly appointmentsByDay = computed(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of this.visibleAppointments()) {
      const key = new Date(appt.scheduledAt).toDateString();
      const existing = map.get(key);
      if (existing) existing.push(appt);
      else map.set(key, [appt]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    }
    return map;
  });

  protected readonly weekDays = computed(() => {
    const start = this.startOfWeek(this.selectedDate());
    return Array.from({ length: 7 }, (_, i) => this.addDays(start, i));
  });

  /** Short weekday headers for the month grid, localized instead of a hardcoded English Sun–Sat list. */
  protected readonly weekdayLabels = computed(() => {
    const start = this.startOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) =>
      this.addDays(start, i).toLocaleDateString(this.i18n.intlLocale(), { weekday: 'short' })
    );
  });

  protected readonly monthGrid = computed<MonthCell[]>(() => {
    const anchor = this.selectedDate();
    const month = anchor.getMonth();
    const firstOfMonth = new Date(anchor.getFullYear(), month, 1);
    const gridStart = this.startOfWeek(firstOfMonth);
    return Array.from({ length: 42 }, (_, i) => {
      const date = this.addDays(gridStart, i);
      return { date, inCurrentMonth: date.getMonth() === month };
    });
  });

  ngOnInit(): void {
    this.usersService.listDoctors().subscribe({ next: (doctors) => this.doctors.set(doctors) });
    this.loadRange();
  }

  setView(mode: ViewMode): void {
    if (this.viewMode() === mode) return;
    this.viewMode.set(mode);
    this.loadRange();
  }

  goToPrev(): void {
    this.selectedDate.set(this.startOfDay(this.stepDate(this.selectedDate(), -1)));
    this.loadRange();
  }

  goToNext(): void {
    this.selectedDate.set(this.startOfDay(this.stepDate(this.selectedDate(), 1)));
    this.loadRange();
  }

  goToToday(): void {
    this.selectedDate.set(this.startOfDay(new Date()));
    this.loadRange();
  }

  onDoctorFilterChange(doctorId: string): void {
    this.selectedDoctorId.set(doctorId);
  }

  onRiskFilterChange(riskLevel: RiskFilter): void {
    this.selectedRiskLevel.set(riskLevel);
  }

  appointmentsFor(date: Date): Appointment[] {
    return this.appointmentsByDay().get(date.toDateString()) ?? [];
  }

  openDay(date: Date): void {
    this.selectedDate.set(this.startOfDay(date));
    this.viewMode.set('day');
    this.loadRange();
  }

  openAppointment(appointment: Appointment): void {
    this.selectedAppointmentId.set(appointment.id);
  }

  closeAppointmentSheet(): void {
    this.selectedAppointmentId.set(null);
  }

  onAppointmentUpdated(): void {
    this.loadRange();
  }

  onBooked(appointment: Appointment): void {
    this.showBookModal.set(false);
    this.viewMode.set('day');
    this.selectedDate.set(this.startOfDay(new Date(appointment.scheduledAt)));
    this.loadRange();
    this.selectedAppointmentId.set(appointment.id);
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString(this.i18n.intlLocale(), { hour: '2-digit', minute: '2-digit' });
  }

  private stepDate(date: Date, direction: 1 | -1): Date {
    const mode = this.viewMode();
    if (mode === 'day') return this.addDays(date, direction);
    if (mode === 'week') return this.addDays(date, direction * 7);
    const next = new Date(date);
    next.setMonth(next.getMonth() + direction);
    return next;
  }

  private loadRange(): void {
    this.loading.set(true);
    this.loadError.set(false);

    const { from, to } = this.currentRange();

    this.appointmentsService.list({ from: from.toISOString(), to: to.toISOString() }).subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  private currentRange(): { from: Date; to: Date } {
    const mode = this.viewMode();
    const date = this.selectedDate();

    if (mode === 'day') {
      return { from: date, to: this.addDays(date, 1) };
    }
    if (mode === 'week') {
      const from = this.startOfWeek(date);
      return { from, to: this.addDays(from, 7) };
    }

    const from = new Date(date.getFullYear(), date.getMonth(), 1);
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return { from, to };
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private startOfWeek(date: Date): Date {
    return this.addDays(this.startOfDay(date), -date.getDay());
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
