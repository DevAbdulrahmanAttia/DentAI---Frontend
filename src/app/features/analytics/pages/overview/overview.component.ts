import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertItem,
  Kpis,
  NoShowInsights,
  ProfitByProcedureEntry,
  RevenueForecast,
  RevenueTrendPoint,
  TopDoctorRevenueEntry
} from '@core/models/analytics.model';
import { AnalyticsService } from '@features/analytics/services/analytics.service';
import { PillTone, StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import { alertTypeInfo } from '@shared/utils/status-maps';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

export type DateRangePreset = 'all-time' | 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Monday-based week start, matching the clinic's working-days convention. */
function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function startOfMonth(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

function endOfMonth(date: Date): Date {
  const d = startOfMonth(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

@Component({
  selector: 'app-analytics-overview',
  standalone: true,
  imports: [FormsModule, StatusPillComponent, TranslatePipe],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly i18n = inject(I18nService);

  protected readonly datePresets: { value: DateRangePreset; labelKey: string }[] = [
    { value: 'all-time', labelKey: 'analytics.allTime' },
    { value: 'today', labelKey: 'analytics.today' },
    { value: 'yesterday', labelKey: 'analytics.yesterday' },
    { value: 'this-week', labelKey: 'analytics.thisWeek' },
    { value: 'last-week', labelKey: 'analytics.lastWeek' },
    { value: 'this-month', labelKey: 'analytics.thisMonth' },
    { value: 'last-month', labelKey: 'analytics.lastMonth' },
    { value: 'custom', labelKey: 'analytics.custom' }
  ];
  protected readonly selectedPreset = signal<DateRangePreset>('all-time');
  protected readonly customFrom = signal('');
  protected readonly customTo = signal('');
  protected readonly rangeLabel = signal<string | null>(null);

  protected readonly kpisLoading = signal(true);
  protected readonly kpisError = signal(false);
  protected readonly kpis = signal<Kpis | null>(null);

  protected readonly trendLoading = signal(true);
  protected readonly trendError = signal(false);
  protected readonly revenueTrend = signal<RevenueTrendPoint[]>([]);
  protected readonly maxTrendRevenue = computed(() =>
    Math.max(1, ...this.revenueTrend().map((point) => point.revenue))
  );

  protected readonly profitLoading = signal(true);
  protected readonly profitError = signal(false);
  protected readonly profitByProcedure = signal<ProfitByProcedureEntry[]>([]);

  protected readonly topDoctorsLoading = signal(true);
  protected readonly topDoctorsError = signal(false);
  protected readonly topDoctors = signal<TopDoctorRevenueEntry[]>([]);

  protected readonly noShowLoading = signal(true);
  protected readonly noShowError = signal(false);
  protected readonly noShowInsights = signal<NoShowInsights | null>(null);
  protected readonly maxRiskCount = computed(() => {
    const dist = this.noShowInsights()?.riskDistribution;
    if (!dist) return 1;
    return Math.max(1, ...Object.values(dist));
  });

  protected readonly alertsLoading = signal(true);
  protected readonly alertsError = signal(false);
  protected readonly alerts = signal<AlertItem[]>([]);

  protected readonly forecastLoading = signal(true);
  protected readonly forecastUnavailable = signal(false);
  protected readonly forecast = signal<RevenueForecast | null>(null);
  protected readonly maxForecastRevenue = computed(() => {
    const f = this.forecast();
    if (!f) return 1;
    const values = [...f.history, ...f.forecast].map((p) => p.revenue);
    return Math.max(1, ...values);
  });

  ngOnInit(): void {
    this.loadRangeScoped();

    this.analyticsService.getRevenueTrend().subscribe({
      next: (trend) => {
        this.revenueTrend.set(trend);
        this.trendLoading.set(false);
      },
      error: () => {
        this.trendLoading.set(false);
        this.trendError.set(true);
      }
    });

    this.analyticsService.getNoShowInsights().subscribe({
      next: (insights) => {
        this.noShowInsights.set(insights);
        this.noShowLoading.set(false);
      },
      error: () => {
        this.noShowLoading.set(false);
        this.noShowError.set(true);
      }
    });

    this.analyticsService.getAlerts().subscribe({
      next: (alerts) => {
        this.alerts.set(alerts);
        this.alertsLoading.set(false);
      },
      error: () => {
        this.alertsLoading.set(false);
        this.alertsError.set(true);
      }
    });

    this.analyticsService.getForecast().subscribe({
      next: (forecast) => {
        this.forecast.set(forecast);
        this.forecastLoading.set(false);
      },
      error: () => {
        this.forecastLoading.set(false);
        this.forecastUnavailable.set(true);
      }
    });
  }

  selectPreset(preset: DateRangePreset): void {
    this.selectedPreset.set(preset);
    if (preset === 'custom') {
      // Wait for the owner to pick both dates and press Apply.
      return;
    }

    const now = new Date();
    switch (preset) {
      case 'all-time':
        this.rangeLabel.set(null);
        this.loadRangeScoped();
        return;
      case 'today':
        this.rangeLabel.set(this.i18n.t('analytics.today'));
        this.loadRangeScoped(startOfDay(now).toISOString(), endOfDay(now).toISOString());
        return;
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        this.rangeLabel.set(this.i18n.t('analytics.yesterday'));
        this.loadRangeScoped(startOfDay(yesterday).toISOString(), endOfDay(yesterday).toISOString());
        return;
      }
      case 'this-week':
        this.rangeLabel.set(this.i18n.t('analytics.thisWeek'));
        this.loadRangeScoped(startOfWeek(now).toISOString(), endOfDay(now).toISOString());
        return;
      case 'last-week': {
        const thisWeekStart = startOfWeek(now);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
        this.rangeLabel.set(this.i18n.t('analytics.lastWeek'));
        this.loadRangeScoped(lastWeekStart.toISOString(), endOfDay(lastWeekEnd).toISOString());
        return;
      }
      case 'this-month':
        this.rangeLabel.set(this.i18n.t('analytics.thisMonth'));
        this.loadRangeScoped(startOfMonth(now).toISOString(), endOfDay(now).toISOString());
        return;
      case 'last-month': {
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        this.rangeLabel.set(this.i18n.t('analytics.lastMonth'));
        this.loadRangeScoped(startOfMonth(lastMonth).toISOString(), endOfMonth(lastMonth).toISOString());
        return;
      }
    }
  }

  applyCustomRange(): void {
    const from = this.customFrom();
    const to = this.customTo();
    if (!from || !to) return;

    this.rangeLabel.set(`${from} – ${to}`);
    this.loadRangeScoped(
      startOfDay(new Date(from)).toISOString(),
      endOfDay(new Date(to)).toISOString()
    );
  }

  /**
   * Reloads everything that's period-scoped by nature. The revenue trend,
   * no-show insights, alerts and forecast are deliberately excluded — a trend
   * is a multi-period series, alerts are current stock state, and the
   * forecast is forward-looking, so none of them mean anything clipped to a
   * single selected window.
   */
  private loadRangeScoped(from?: string, to?: string): void {
    this.kpisLoading.set(true);
    this.kpisError.set(false);
    this.analyticsService.getKpis(from, to).subscribe({
      next: (kpis) => {
        this.kpis.set(kpis);
        this.kpisLoading.set(false);
      },
      error: () => {
        this.kpisLoading.set(false);
        this.kpisError.set(true);
      }
    });

    this.profitLoading.set(true);
    this.profitError.set(false);
    this.analyticsService.getProfitByProcedure(from, to).subscribe({
      next: (entries) => {
        this.profitByProcedure.set(entries);
        this.profitLoading.set(false);
      },
      error: () => {
        this.profitLoading.set(false);
        this.profitError.set(true);
      }
    });

    this.topDoctorsLoading.set(true);
    this.topDoctorsError.set(false);
    this.analyticsService.getTopDoctorsByRevenue(from, to).subscribe({
      next: (entries) => {
        this.topDoctors.set(entries);
        this.topDoctorsLoading.set(false);
      },
      error: () => {
        this.topDoctorsLoading.set(false);
        this.topDoctorsError.set(true);
      }
    });
  }

  barHeight(value: number, max: number): string {
    return `${Math.max(4, Math.round((value / max) * 100))}%`;
  }

  riskTone(riskKey: string): PillTone {
    switch (riskKey) {
      case 'high':
        return 'red';
      case 'medium':
        return 'amber';
      case 'low':
        return 'green';
      default:
        return 'grey';
    }
  }

  alertTone(type: AlertItem['type']): PillTone {
    return alertTypeInfo(type).tone;
  }

  alertLabel(type: AlertItem['type']): string {
    return alertTypeInfo(type).label;
  }

  /** i18n key for a no-show risk bucket (`high`/`medium`/`low`/anything else = unscored) — mirrors [[riskLevelInfo]]'s labels. */
  riskLabelKey(riskKey: string): string {
    switch (riskKey) {
      case 'high':
        return 'status.riskHigh';
      case 'medium':
        return 'status.riskMedium';
      case 'low':
        return 'status.riskLow';
      default:
        return 'status.riskUnscored';
    }
  }

  riskDistributionEntries(): [string, number][] {
    const dist = this.noShowInsights()?.riskDistribution;
    return dist ? Object.entries(dist) : [];
  }
}
