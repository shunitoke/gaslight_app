"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { AnalysisResult } from "../../features/analysis/types"
import { useLanguage } from "../../features/i18n"
import { cn } from "@/lib/utils"

type AnalysisRadarChartProps = {
  analysis: AnalysisResult
  /**
   * default – full card with title and description (used in dashboard / standalone)
   * compact – small inline chart without its own heading (used inside other cards)
   */
  variant?: "default" | "compact"
  /**
   * Primary metric color - used to color the radar chart polygon
   * If not provided, uses the color of the metric with highest score
   */
  primaryMetricColor?: string
  /**
   * Optional className for the outer container (useful for mobile sizing)
   */
  className?: string
}

export function AnalysisRadarChart({ analysis, variant = "default", primaryMetricColor, className }: AnalysisRadarChartProps) {
  const { t, locale } = useLanguage()
  const isCompact = variant === "compact"

  // Helper function to get color based on percentage (for negative metrics)
  const getNegativeColor = (percentage: number): string => {
    if (percentage < 20) return 'hsl(142 76% 36%)'; // green
    if (percentage < 40) return 'hsl(142 76% 45%)'; // light green
    if (percentage < 50) return 'hsl(45 93% 47%)'; // yellow
    if (percentage < 60) return 'hsl(38 92% 50%)'; // dark yellow
    if (percentage < 70) return 'hsl(25 95% 53%)'; // orange
    if (percentage < 80) return 'hsl(20 90% 48%)'; // dark orange
    if (percentage < 90) return 'hsl(0 84% 60%)'; // light red
    return 'hsl(var(--destructive))'; // red
  };

  // Helper function to get color based on percentage (for positive metrics)
  const getPositiveColor = (percentage: number): string => {
    if (percentage < 20) return 'hsl(var(--destructive))'; // red
    if (percentage < 40) return 'hsl(0 84% 60%)'; // light red
    if (percentage < 50) return 'hsl(25 95% 53%)'; // orange
    if (percentage < 60) return 'hsl(30 95% 58%)'; // light orange
    if (percentage < 70) return 'hsl(45 93% 47%)'; // yellow
    if (percentage < 80) return 'hsl(50 95% 52%)'; // light yellow
    if (percentage < 90) return 'hsl(142 76% 45%)'; // light green
    return 'hsl(142 76% 36%)'; // green
  };

  // Prepare chart data from analysis scores with color coding
  // Scores are 0-1, convert to 0-100 for display
  const gaslightingScore = Math.round(analysis.gaslightingRiskScore * 100);
  const conflictScore = Math.round(analysis.conflictIntensityScore * 100);
  const supportScore = Math.round(analysis.supportivenessScore * 100);
  const resolutionScore = Math.round(analysis.communicationStats?.resolutionRate ?? 0);

  const chartData = [
    {
      metric: t('gaslightingRisk'),
      score: gaslightingScore,
      color: getNegativeColor(gaslightingScore),
    },
    {
      metric: t('conflictIntensity'),
      score: conflictScore,
      color: getNegativeColor(conflictScore),
    },
    {
      metric: t('supportiveness'),
      score: supportScore,
      color: getPositiveColor(supportScore),
    },
    {
      metric: locale === 'ru' ? 'Разрешение конфликтов' : 'Conflict Resolution',
      score: resolutionScore,
      color: getPositiveColor(resolutionScore),
    },
  ];

  // Use primary metric color if provided, otherwise use the metric with the highest score
  const maxScoreMetric = chartData.reduce((max, item) => 
    item.score > max.score ? item : max
  );
  
  // Primary metric is gaslightingRiskScore - use its color for the radar
  const radarColor = primaryMetricColor || maxScoreMetric.color;

  const chartConfig = {
    score: {
      label: t('score'),
      color: radarColor,
    },
  } satisfies ChartConfig

  return (
    <div className={cn("w-full flex flex-col", isCompact && "", className)}>
      {!isCompact && (
        <div className="text-center mb-2 sm:mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            {t('analysisReport')}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t('exportScores')}
          </p>
        </div>
      )}
      <div
        className={cn(
          "flex-1 flex items-center justify-center min-h-0 py-2",
          isCompact && "py-0"
        )}
      >
        <ChartContainer
          config={chartConfig}
          className={cn(
            "aspect-square w-full h-auto",
            isCompact
              ? "max-w-full min-h-[240px] sm:min-h-[280px]"
              : "max-w-md min-h-[220px] sm:min-h-[260px]"
          )}
        >
          <RadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <PolarGrid
              className="fill-[var(--color-score)] opacity-20"
              gridType="circle"
            />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ 
                fill: 'hsl(var(--foreground))', 
                fontSize: isCompact ? 10 : 11,
                textAnchor: 'middle',
                dy: 4
              }}
              tickFormatter={(value) => {
                // Shorten long labels for compact view
                if (isCompact) {
                  const maxLength = 12;
                  if (value.length > maxLength) {
                    return value.substring(0, maxLength) + '...';
                  }
                }
                return value;
              }}
            />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.4}
              stroke="var(--color-score)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-score)', r: isCompact ? 4 : 4 }}
            />
          </RadarChart>
        </ChartContainer>
      </div>
    </div>
  )
}

