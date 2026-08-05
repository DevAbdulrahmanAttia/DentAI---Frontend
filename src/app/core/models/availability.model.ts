export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type AvailabilityExceptionType = 'time_off' | 'custom_hours';

export interface DoctorWorkingHours {
  id: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
}

export interface DoctorAvailabilityException {
  id: string;
  date: string;
  type: AvailabilityExceptionType;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  createdAt: string;
}

export interface DoctorOverview {
  doctorId: string;
  doctorName: string;
  date: string;
  working: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
}

export interface SetWeeklyHoursPayload {
  weekday: Weekday;
  startTime: string;
  endTime: string;
}

export interface AddExceptionPayload {
  date: string;
  type: AvailabilityExceptionType;
  startTime?: string;
  endTime?: string;
  reason?: string;
}
