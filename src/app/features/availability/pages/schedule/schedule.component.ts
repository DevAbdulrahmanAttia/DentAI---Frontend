import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { User } from '@core/models/auth.model';
import {
  AvailabilityExceptionType,
  DoctorAvailabilityException,
  DoctorWorkingHours,
  Weekday
} from '@core/models/availability.model';
import { UsersService } from '@core/services/users.service';
import { AvailabilityService } from '@features/availability/services/availability.service';

interface DayRow {
  weekday: Weekday;
  label: string;
  configured: DoctorWorkingHours | null;
  startTime: string;
  endTime: string;
}

const WEEKDAYS: { weekday: Weekday; label: string }[] = [
  { weekday: 'mon', label: 'Monday' },
  { weekday: 'tue', label: 'Tuesday' },
  { weekday: 'wed', label: 'Wednesday' },
  { weekday: 'thu', label: 'Thursday' },
  { weekday: 'fri', label: 'Friday' },
  { weekday: 'sat', label: 'Saturday' },
  { weekday: 'sun', label: 'Sunday' }
];

@Component({
  selector: 'app-availability-schedule',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly availabilityService = inject(AvailabilityService);

  protected readonly doctors = signal<User[]>([]);
  protected readonly selectedDoctorId = signal<string | null>(null);
  protected readonly days = signal<DayRow[]>(WEEKDAYS.map((d) => ({ ...d, configured: null, startTime: '', endTime: '' })));
  protected readonly hasCustomSchedule = signal(false);
  protected readonly exceptions = signal<DoctorAvailabilityException[]>([]);
  protected readonly loading = signal(false);
  protected readonly savingDay = signal<Weekday | null>(null);
  protected readonly dayError = signal('');

  protected readonly exceptionTypes: AvailabilityExceptionType[] = ['time_off', 'custom_hours'];
  protected readonly showExceptionForm = signal(false);
  protected readonly exceptionForm = this.fb.nonNullable.group({
    date: [''],
    type: ['time_off' as AvailabilityExceptionType],
    startTime: [''],
    endTime: [''],
    reason: ['']
  });
  protected readonly addingException = signal(false);
  protected readonly exceptionError = signal('');

  ngOnInit(): void {
    this.usersService.listDoctors().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        if (doctors.length > 0 && doctors[0].id) {
          this.selectDoctor(doctors[0].id);
        }
      }
    });
  }

  selectDoctor(doctorId: string): void {
    this.selectedDoctorId.set(doctorId);
    this.loadSchedule(doctorId);
  }

  onDoctorChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    if (id) this.selectDoctor(id);
  }

  saveDay(day: DayRow): void {
    const doctorId = this.selectedDoctorId();
    if (!doctorId || !day.startTime || !day.endTime) return;
    if (day.startTime >= day.endTime) {
      this.dayError.set('Start time must be before end time.');
      return;
    }

    this.dayError.set('');
    this.savingDay.set(day.weekday);
    this.availabilityService
      .setWeeklyHour(doctorId, { weekday: day.weekday, startTime: day.startTime, endTime: day.endTime })
      .subscribe({
        next: () => {
          this.savingDay.set(null);
          this.loadSchedule(doctorId);
        },
        error: (err) => {
          this.savingDay.set(null);
          this.dayError.set(err?.error?.message || 'Could not save this day.');
        }
      });
  }

  clearDay(day: DayRow): void {
    const doctorId = this.selectedDoctorId();
    if (!doctorId || !day.configured) return;

    this.savingDay.set(day.weekday);
    this.availabilityService.removeWeeklyHour(doctorId, day.weekday).subscribe({
      next: () => {
        this.savingDay.set(null);
        this.loadSchedule(doctorId);
      },
      error: () => this.savingDay.set(null)
    });
  }

  toggleExceptionForm(): void {
    this.showExceptionForm.set(!this.showExceptionForm());
    this.exceptionForm.reset({ type: 'time_off' });
    this.exceptionError.set('');
  }

  submitException(): void {
    const doctorId = this.selectedDoctorId();
    if (!doctorId || this.addingException()) return;

    const { date, type, startTime, endTime, reason } = this.exceptionForm.getRawValue();
    if (!date) {
      this.exceptionError.set('Pick a date.');
      return;
    }
    if (type === 'custom_hours' && (!startTime || !endTime)) {
      this.exceptionError.set('Custom hours need both a start and end time.');
      return;
    }

    this.addingException.set(true);
    this.exceptionError.set('');
    this.availabilityService
      .addException(doctorId, {
        date,
        type,
        startTime: type === 'custom_hours' ? startTime : undefined,
        endTime: type === 'custom_hours' ? endTime : undefined,
        reason: reason || undefined
      })
      .subscribe({
        next: () => {
          this.addingException.set(false);
          this.showExceptionForm.set(false);
          this.exceptionForm.reset({ type: 'time_off' });
          this.loadExceptions(doctorId);
        },
        error: (err) => {
          this.addingException.set(false);
          this.exceptionError.set(err?.error?.message || 'Could not add this exception.');
        }
      });
  }

  removeException(exception: DoctorAvailabilityException): void {
    const doctorId = this.selectedDoctorId();
    if (!doctorId) return;
    this.availabilityService.removeException(doctorId, exception.id).subscribe({
      next: () => this.loadExceptions(doctorId)
    });
  }

  private loadSchedule(doctorId: string): void {
    this.loading.set(true);
    this.availabilityService.getWeeklyHours(doctorId).subscribe({
      next: (hours) => {
        this.hasCustomSchedule.set(hours.length > 0);
        this.days.set(
          WEEKDAYS.map((d) => {
            const configured = hours.find((h) => h.weekday === d.weekday) ?? null;
            return {
              ...d,
              configured,
              startTime: configured?.startTime ?? '',
              endTime: configured?.endTime ?? ''
            };
          })
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
    this.loadExceptions(doctorId);
  }

  private loadExceptions(doctorId: string): void {
    this.availabilityService.getExceptions(doctorId).subscribe({
      next: (exceptions) => this.exceptions.set(exceptions)
    });
  }
}
