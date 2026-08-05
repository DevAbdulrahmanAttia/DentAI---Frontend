export interface SlotRecoveryStats {
  recoveredCount: number;
  totalOffers: number;
  fillRate: number;
}

export interface Kpis {
  revenue: number;
  outstandingBalance: number;
  averageInvoiceValue: number;
  doneCount: number;
  noShowCount: number;
  noShowRate: number;
  avgAppointmentsPerDay: number;
  activeAlertsCount: number;
  slotRecovery: SlotRecoveryStats;
}

export interface TopDoctorRevenueEntry {
  doctorId: string;
  name: string;
  appointmentCount: number;
  revenue: number;
}

export interface RevenueTrendPoint {
  period: string;
  revenue: number;
  appointmentCount: number;
}

export interface ProfitByProcedureEntry {
  procedureTypeId: string;
  name: string;
  appointmentCount: number;
  revenue: number;
  materialsCost: number;
  overheadCost: number;
  totalCost: number;
  profit: number;
  marginPercent: number;
}

export interface NoShowRateTrendPoint {
  period: string;
  noShowRate: number;
}

export interface NoShowInsights {
  riskDistribution: Record<string, number>;
  noShowRateTrend: NoShowRateTrendPoint[];
}

export type AlertType = 'low_stock' | 'near_expiry';

export interface AlertItem {
  type: AlertType;
  itemId: string;
  itemName: string;
  detail: string;
}

export interface ForecastPeriod {
  period: string;
  revenue: number;
  appointmentCount: number;
}

export interface ForecastProjection extends ForecastPeriod {
  revenueLow: number;
  revenueHigh: number;
  appointmentCountLow: number;
  appointmentCountHigh: number;
}

export interface RevenueForecast {
  history: ForecastPeriod[];
  forecast: ForecastProjection[];
  insufficientData: boolean;
}
