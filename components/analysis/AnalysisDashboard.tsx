'use client';

import React, { useMemo, useState } from 'react';
import type { Locale as DateFnsLocale } from 'date-fns';
import { de, enUS, es, fr, pt, ru } from 'date-fns/locale';
import { Calendar } from '../ui/calendar';
import { Card } from '../ui/card';
import { ChartContainer } from '../ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { Formatter } from 'recharts/types/component/DefaultTooltipContent';
import type { AnalysisResult, ImportantDate } from '../../features/analysis/types';
import { useLanguage } from '../../features/i18n';

type DailyActivity = {
  date: string;
  messageCount: number;
  isImportant?: boolean;
  severity?: number;
};

type AnalysisDashboardProps = {
  analysis: AnalysisResult;
  activityByDay: DailyActivity[];
  importantDates?: ImportantDate[];
  conversationLanguage: string;
  locale: 'ru' | 'en' | 'fr' | 'de' | 'es' | 'pt';
  onDateSelect?: (date: ImportantDate) => void;
};

export function AnalysisDashboard({
  analysis,
  activityByDay,
  importantDates = [],
  conversationLanguage,
  locale,
  onDateSelect
}: AnalysisDashboardProps) {
  const { t } = useLanguage();

  const resolvedActivityByDay = useMemo(() => {
    if (activityByDay && activityByDay.length > 0) return activityByDay;
    if (importantDates.length > 0) {
      return importantDates.map((d) => ({
        date: d.date,
        messageCount: 1,
        isImportant: true,
        severity: d.severity ?? 0.7
      }));
    }
    return [];
  }, [activityByDay, importantDates]);

  const intlLocale = useMemo(() => {
    const map: Record<AnalysisDashboardProps['locale'], string> = {
      en: 'en-US',
      ru: 'ru-RU',
      fr: 'fr-FR',
      de: 'de-DE',
      es: 'es-ES',
      pt: 'pt-PT'
    };
    return map[locale] ?? 'en-US';
  }, [locale]);

  const dayPickerLocale = useMemo<DateFnsLocale>(() => {
    const map: Record<AnalysisDashboardProps['locale'], DateFnsLocale> = {
      en: enUS,
      ru,
      fr,
      de,
      es,
      pt
    };
    return map[locale] ?? enUS;
  }, [locale]);

  // Create a map of important dates for quick lookup
  const importantDatesMap = useMemo(() => {
    const map = new Map<string, ImportantDate>();
    importantDates.forEach((d) => {
      map.set(d.date, d);
    });
    return map;
  }, [importantDates]);

  // Prepare activity chart data with important date markers
  const activityChartData = useMemo(() => {
    if (!resolvedActivityByDay || resolvedActivityByDay.length === 0) return [];
    return resolvedActivityByDay.map((day) => {
      const important = importantDatesMap.get(day.date);
      return {
        dateLabel: new Date(day.date).toLocaleDateString(
          intlLocale,
          { month: 'short', day: 'numeric', year: 'numeric' }
        ),
        messageCount: day.messageCount,
        isImportant: !!important,
        severity: important?.severity ?? 0
      };
    });
  }, [activityByDay, importantDatesMap, locale]);

  // Prepare heatmap data (grouped by month/week)
  const heatmapData = useMemo(() => {
    if (!resolvedActivityByDay || resolvedActivityByDay.length === 0) return [];
    
    // Group by week for heatmap
    const weeks = new Map<string, { date: string; count: number; severity: number }>();
    
    resolvedActivityByDay.forEach((day) => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const existing = weeks.get(weekKey);
      const important = importantDatesMap.get(day.date);
      const severity = important?.severity ?? 0;
      const maxSeverity = Math.max(existing?.severity ?? 0, severity);
      
      weeks.set(weekKey, {
        date: weekKey,
        count: (existing?.count ?? 0) + day.messageCount,
        severity: maxSeverity
      });
    });
    
    return Array.from(weeks.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((week, index) => ({
        week: `Week ${index + 1}`,
        count: week.count,
        severity: week.severity,
        isImportant: week.severity > 0.5
      }));
  }, [activityByDay, importantDatesMap]);

  // Get date range for calendar
  const dateRange = useMemo(() => {
    if (!resolvedActivityByDay || resolvedActivityByDay.length === 0) return null;
    const dates = resolvedActivityByDay.map((d) => new Date(d.date).getTime()).sort((a, b) => a - b);
    return {
      from: new Date(dates[0]),
      to: new Date(dates[dates.length - 1])
    };
  }, [resolvedActivityByDay]);

  // Prepare calendar modifiers with different colors for different date types
  const calendarModifiers = useMemo(() => {
    // Create maps for quick lookup
    const allImportantDates = new Map<string, ImportantDate>();
    const criticalDates = new Set<string>(); // gaslighting, conflict, or high severity
    const regularImportantDates = new Set<string>(); // other important dates
    
    importantDates.forEach((d) => {
      allImportantDates.set(d.date, d);
      // Red for gaslighting, conflict, or high severity (>0.7)
      if (
        d.sectionId === 'gaslighting' || 
        d.sectionId === 'conflict' || 
        (d.severity !== undefined && d.severity > 0.7)
      ) {
        criticalDates.add(d.date);
      } else if (d.sectionId) {
        // Blue/green for other dates with sectionId (linked to quotes)
        regularImportantDates.add(d.date);
      }
    });

    return {
      critical: (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return criticalDates.has(dateStr);
      },
      important: (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return regularImportantDates.has(dateStr);
      },
      hasQuote: (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return allImportantDates.has(dateStr);
      }
    };
  }, [importantDates]);

  const calendarModifierClassNames = {
    critical: '!bg-red-500/40 !text-red-900 dark:!text-red-100 font-bold !border-2 !border-red-600 dark:!border-red-500 hover:!bg-red-500/50',
    important: '!bg-blue-500/30 !text-blue-900 dark:!text-blue-100 font-semibold !border !border-blue-600 dark:!border-blue-400 hover:!bg-blue-500/40',
    hasQuote: '!bg-primary/20 !text-primary-foreground !border !border-primary/50 hover:!bg-primary/30'
  };

  // Prepare weekly aggregated data for wave view
  const weeklyWaveData = useMemo(() => {
    if (!resolvedActivityByDay || resolvedActivityByDay.length === 0) return [];

    const weeks = new Map<
      string,
      { date: string; label: string; count: number; severity: number }
    >();

    resolvedActivityByDay.forEach((day) => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];

      const existing = weeks.get(weekKey);
      const important = importantDatesMap.get(day.date);
      const severity = important?.severity ?? 0;
      const maxSeverity = Math.max(existing?.severity ?? 0, severity);

      const label = weekStart.toLocaleDateString(
        intlLocale,
        { month: 'short', day: 'numeric', year: 'numeric' }
      );

      weeks.set(weekKey, {
        date: weekKey,
        label,
        count: (existing?.count ?? 0) + day.messageCount,
        severity: maxSeverity
      });
    });

    return Array.from(weeks.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((week) => ({
        dateKey: week.date,
        dateLabel: week.label,
        messageCount: week.count,
        isImportant: week.severity > 0.5,
        severity: week.severity
      }));
  }, [resolvedActivityByDay, importantDatesMap, locale]);

  // Wave chart mode: 'day' or 'week'
  const [waveMode, setWaveMode] = useState<'day' | 'week'>('day');

  const waveData = waveMode === 'day' ? activityChartData : weeklyWaveData;

  const waveTooltipFormatter: Formatter<any, any> = (value, _name, props) => {
    if (props && 'payload' in props && props.payload && (props.payload as any).isImportant) {
      const payload: any = props.payload;
      const dateKey =
        waveMode === 'day'
          ? resolvedActivityByDay.find(
              (d) =>
                new Date(d.date).toLocaleDateString(
                  intlLocale,
                  { month: 'short', day: 'numeric', year: 'numeric' }
                ) === payload.dateLabel
            )?.date
          : payload.dateKey;

      const important = dateKey ? importantDatesMap.get(dateKey) : undefined;

      if (important) {
        return [important.reason || t('important_date'), t('important_date')];
      }
    }

    return [value, t('activity_chart_messages_label')];
  };

  const [showAllDates, setShowAllDates] = useState(false);

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card className="p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          {t('dashboard_title')}
        </h2>
        
        <div className="space-y-4">
          {/* Activity charts */}
          <div className="space-y-3 sm:space-y-4">
            {/* Wave Activity Chart (day/week toggle) */}
            {waveData.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      {t('activity_chart_title')}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {t('activity_chart_description')}
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-border/60 bg-background/70 p-0.5 text-[10px] sm:text-xs">
                    <button
                      type="button"
                      onClick={() => setWaveMode('day')}
                      className={`px-2 py-0.5 rounded-full transition-all ${
                        waveMode === 'day'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {locale === 'ru' ? 'По дням' : 'By day'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaveMode('week')}
                      className={`px-2 py-0.5 rounded-full transition-all ${
                        waveMode === 'week'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {locale === 'ru' ? 'По неделям' : 'By week'}
                    </button>
                  </div>
                </div>
                <div className="h-40 sm:h-44">
                  <ChartContainer
                    config={{
                      messages: {
                        label: t('activity_chart_messages_label'),
                        color: 'hsl(var(--primary))'
                      },
                      important: {
                        label: t('important_dates_label'),
                        color: 'hsl(var(--destructive))'
                      }
                    }}
                    className="w-full h-full"
                  >
                    <AreaChart data={waveData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="dateLabel"
                        tick={{ fontSize: 9 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 9 }}
                        allowDecimals={false}
                        width={24}
                      />
                      <Tooltip
                        content={(props: TooltipProps<any, any>) => {
                          if (!props?.active || !props.payload?.length) return null;

                          const payload = props.payload as any[];
                          const importantEntry = payload.find((p) => p?.payload?.isImportant);
                          const target = importantEntry ?? payload[0];

                          const [value, name] = importantEntry
                            ? (waveTooltipFormatter(
                                target.value,
                                target.name,
                                target,
                                0,
                                payload
                              ) as [string | number, string])
                            : ([target.value, t('activity_chart_messages_label')] as [
                                string | number,
                                string
                              ]);

                          const color = importantEntry
                            ? 'hsl(var(--destructive))'
                            : target?.color ||
                              target?.payload?.fill ||
                              'var(--color-messages, hsl(var(--primary)))';

                          const labelText =
                            typeof props.label === 'string'
                              ? `${props.label} — ${t('activity_chart_color_hint')}`
                              : t('activity_chart_color_hint');

                          return (
                            <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                              <div className="font-medium">{labelText}</div>
                              <div className="flex w-full items-center gap-2">
                                <span
                                  className="inline-block h-2.5 w-2.5 rounded-full"
                                  style={{ background: color }}
                                />
                                <span className="text-muted-foreground">{name}</span>
                                <span className="font-semibold text-foreground">{value}</span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="messageCount"
                        stroke="var(--color-messages, hsl(var(--primary)))"
                        fill="var(--color-messages, hsl(var(--primary) / 0.2))"
                        strokeWidth={2}
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey={(d: (typeof waveData)[0]) =>
                          d.isImportant ? d.messageCount : 0
                        }
                        stroke="hsl(var(--destructive))"
                        fill="hsl(var(--destructive) / 0.5)"
                        strokeWidth={3}
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </div>
            )}
          </div>
          {/* Calendar under charts (desktop and mobile) */}
          {dateRange && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">
                  {t('calendar_title')}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('calendar_description')}
                </p>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  locale={dayPickerLocale}
                  defaultMonth={dateRange.from}
                  numberOfMonths={2}
                  yearFrom={dateRange.from.getFullYear()}
                  yearTo={dateRange.to.getFullYear()}
                  forceDropdownCaption
                  selected={undefined}
                  onSelect={(date) => {
                    if (!date || !onDateSelect) return;
                    const dateStr = date.toISOString().split('T')[0];
                    const important = importantDates.find((d) => d.date === dateStr);
                    if (important) {
                      onDateSelect(important);
                    }
                  }}
                  modifiers={calendarModifiers}
                  modifiersClassNames={calendarModifierClassNames}
                  className="w-fit max-w-xl rounded-lg border shadow-sm [--cell-size:1.7rem] sm:[--cell-size:1.9rem]"
                  disabled={(date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    return !activityByDay.some((d) => d.date === dateStr);
                  }}
                />
              </div>
              {importantDates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    {t('important_dates_list_title')}:
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {importantDates.slice(0, 3).map((d, idx) => (
                      <li key={`first-${idx}`} className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {new Date(d.date).toLocaleDateString(intlLocale, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span>— {d.reason}</span>
                      </li>
                    ))}
                    {showAllDates &&
                      importantDates.slice(3).map((d, idx) => (
                        <li
                          key={`extra-${idx}`}
                          className="flex items-start gap-2 animate-in slide-in-from-bottom-1 duration-300 ease-out"
                        >
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {new Date(d.date).toLocaleDateString(intlLocale, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span>— {d.reason}</span>
                        </li>
                      ))}
                  </ul>
                  {importantDates.length > 3 && !showAllDates && (
                    <button
                      type="button"
                      onClick={() => setShowAllDates(true)}
                      className="text-xs text-muted-foreground/80 hover:text-foreground transition-colors"
                    >
                      +{importantDates.length - 3} {t('more_dates')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

