import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import {
  Appointment,
  AppointmentReadiness,
  SettableAppointmentStatus
} from '@core/models/appointment.model';
import { InvoiceDetail } from '@core/models/billing.model';
import { ReminderEntry } from '@core/models/reminder.model';
import { AppointmentsService } from '@features/appointments/services/appointments.service';
import { NotificationsService } from '@features/appointments/services/notifications.service';
import { BillingService } from '@features/billing/services/billing.service';
import { ProcedureVisitComponent } from '@features/inventory/components/procedure-visit/procedure-visit.component';
import { StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import {
  appointmentStatusInfo,
  invoiceStatusInfo,
  medicalSeverityInfo,
  reminderStatusInfo,
  riskLevelInfo
} from '@shared/utils/status-maps';

const EXTENSION_CHOICES = [15, 30, 45];

@Component({
  selector: 'app-appointment-details-panel',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, StatusPillComponent, ProcedureVisitComponent],
  templateUrl: './appointment-details-panel.component.html',
  styleUrl: './appointment-details-panel.component.css'
})
export class AppointmentDetailsPanelComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly billingService = inject(BillingService);
  protected readonly authService = inject(AuthService);

  appointmentId = input.required<string>();
  updated = output<Appointment>();

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly appointment = signal<Appointment | null>(null);
  protected readonly updating = signal(false);
  protected readonly updateError = signal('');

  protected readonly reminders = signal<ReminderEntry[]>([]);
  protected readonly remindersLoading = signal(true);

  protected readonly riskExplanation = signal<string | null | undefined>(undefined);
  protected readonly riskExplanationLoading = signal(false);

  protected readonly appointmentStatusInfo = appointmentStatusInfo;
  protected readonly riskLevelInfo = riskLevelInfo;
  protected readonly reminderStatusInfo = reminderStatusInfo;
  protected readonly medicalSeverityInfo = medicalSeverityInfo;
  protected readonly invoiceStatusInfo = invoiceStatusInfo;

  protected readonly invoice = signal<InvoiceDetail | null>(null);
  protected readonly invoiceLoading = signal(false);
  protected readonly invoiceCreating = signal(false);

  protected readonly readiness = signal<AppointmentReadiness | null>(null);
  protected readonly readinessLoading = signal(false);
  protected readonly lifecycleBusy = signal(false);
  protected readonly lifecycleError = signal('');
  protected readonly acknowledged = signal(false);
  protected readonly extensionChoices = EXTENSION_CHOICES;

  /** Minutes late, or null when on time / not yet arrived. */
  protected readonly lateByMinutes = computed(() => {
    const current = this.appointment();
    if (!current?.arrivedAt) return null;
    const diffMs =
      new Date(current.arrivedAt).getTime() - new Date(current.scheduledAt).getTime();
    const minutes = Math.round(diffMs / 60000);
    return minutes > 0 ? minutes : null;
  });

  /** Real treatment duration once the visit has both timestamps. */
  protected readonly actualDurationMinutes = computed(() => {
    const current = this.appointment();
    if (!current?.actualStartAt || !current?.actualEndAt) return null;
    return Math.max(
      1,
      Math.round(
        (new Date(current.actualEndAt).getTime() -
          new Date(current.actualStartAt).getTime()) /
          60000
      )
    );
  });

  protected readonly showReschedule = signal(false);
  protected readonly rescheduling = signal(false);
  protected readonly rescheduleError = signal('');
  protected readonly rescheduleForm = this.fb.nonNullable.group({
    date: ['', Validators.required],
    time: ['', Validators.required]
  });

  ngOnInit(): void {
    this.appointmentsService.getOne(this.appointmentId()).subscribe({
      next: (appointment) => {
        this.appointment.set(appointment);
        this.loading.set(false);
        // The pre-procedure check only matters while the visit can still be
        // started; skip the extra request once it's resolved.
        if (appointment.status === 'booked') {
          this.loadReadiness();
        }
        if (appointment.status === 'done') {
          this.loadInvoice();
        }
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });

    this.notificationsService.getReminders(this.appointmentId()).subscribe({
      next: (reminders) => {
        this.reminders.set(reminders);
        this.remindersLoading.set(false);
      },
      error: () => this.remindersLoading.set(false)
    });
  }

  explainRisk(): void {
    const current = this.appointment();
    if (!current || this.riskExplanationLoading()) return;

    this.riskExplanationLoading.set(true);
    this.appointmentsService.getRiskExplanation(current.id).subscribe({
      next: ({ explanation }) => {
        this.riskExplanationLoading.set(false);
        this.riskExplanation.set(explanation);
      },
      error: () => {
        this.riskExplanationLoading.set(false);
        this.riskExplanation.set(null);
      }
    });
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(finalPrice: string | null): string {
    return finalPrice ? `EGP ${Number(finalPrice).toFixed(0)}` : 'Not finalized';
  }

  loadInvoice(): void {
    this.invoiceLoading.set(true);
    this.billingService.getByAppointment(this.appointmentId()).subscribe({
      next: (detail) => {
        this.invoice.set(detail);
        this.invoiceLoading.set(false);
      },
      // No invoice exists yet for this appointment (404) — offer to create one instead of erroring.
      error: () => {
        this.invoice.set(null);
        this.invoiceLoading.set(false);
      }
    });
  }

  createInvoice(): void {
    if (this.invoiceCreating()) return;
    this.invoiceCreating.set(true);
    this.billingService.createFromAppointment(this.appointmentId()).subscribe({
      next: () => {
        this.invoiceCreating.set(false);
        this.loadInvoice();
      },
      error: () => this.invoiceCreating.set(false)
    });
  }

  loadReadiness(): void {
    this.readinessLoading.set(true);
    this.appointmentsService.getReadiness(this.appointmentId()).subscribe({
      next: (readiness) => {
        this.readiness.set(readiness);
        this.readinessLoading.set(false);
      },
      error: () => this.readinessLoading.set(false)
    });
  }

  checkIn(): void {
    this.runLifecycleAction(this.appointmentsService.checkIn(this.appointmentId()));
  }

  startVisit(): void {
    this.runLifecycleAction(
      this.appointmentsService.start(this.appointmentId(), this.acknowledged())
    );
  }

  completeVisit(): void {
    this.runLifecycleAction(this.appointmentsService.complete(this.appointmentId()));
  }

  extendVisit(minutes: number): void {
    this.runLifecycleAction(
      this.appointmentsService.extend(this.appointmentId(), minutes)
    );
  }

  /**
   * Shared plumbing for every lifecycle call: they all resolve to the updated
   * appointment, surface backend validation messages verbatim (the readiness
   * failures are written to be read by staff), and re-run the readiness check
   * afterwards since stock and status may both have moved.
   */
  private runLifecycleAction(
    request: ReturnType<AppointmentsService['checkIn']>
  ): void {
    if (this.lifecycleBusy()) return;

    this.lifecycleBusy.set(true);
    this.lifecycleError.set('');

    request.subscribe({
      next: (updated) => {
        this.lifecycleBusy.set(false);
        this.appointment.set(updated);
        this.updated.emit(updated);
        if (updated.status === 'booked') {
          this.loadReadiness();
        }
      },
      error: (err: { error?: { message?: string } }) => {
        this.lifecycleBusy.set(false);
        this.lifecycleError.set(
          err?.error?.message ?? 'Could not complete that action.'
        );
        this.loadReadiness();
      }
    });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  updateStatus(status: SettableAppointmentStatus): void {
    const current = this.appointment();
    if (!current || this.updating()) return;

    this.updating.set(true);
    this.updateError.set('');

    this.appointmentsService.updateStatus(current.id, status).subscribe({
      next: (updated) => {
        this.appointment.set(updated);
        this.updating.set(false);
        this.updated.emit(updated);
      },
      error: (err) => {
        this.updating.set(false);
        this.updateError.set(err?.error?.message || 'Could not update the appointment status.');
      }
    });
  }

  toggleReschedule(): void {
    const current = this.appointment();
    if (!current) return;

    if (!this.showReschedule()) {
      const scheduled = new Date(current.scheduledAt);
      this.rescheduleForm.setValue({
        date: scheduled.toISOString().slice(0, 10),
        time: scheduled.toTimeString().slice(0, 5)
      });
    }
    this.rescheduleError.set('');
    this.showReschedule.set(!this.showReschedule());
  }

  submitReschedule(): void {
    const current = this.appointment();
    if (!current || this.rescheduleForm.invalid || this.rescheduling()) {
      this.rescheduleForm.markAllAsTouched();
      return;
    }

    this.rescheduling.set(true);
    this.rescheduleError.set('');
    const { date, time } = this.rescheduleForm.getRawValue();
    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    this.appointmentsService.reschedule(current.id, scheduledAt).subscribe({
      next: (updated) => {
        this.rescheduling.set(false);
        this.showReschedule.set(false);
        this.appointment.set(updated);
        this.updated.emit(updated);
      },
      error: (err) => {
        this.rescheduling.set(false);
        this.rescheduleError.set(
          err?.error?.message || 'Could not reschedule. That slot may already be taken.'
        );
      }
    });
  }
}
