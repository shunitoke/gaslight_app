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
}

export function AnalysisRadarChart({ analysis, variant = "default" }: AnalysisRadarChartProps) {
  const { t } = useLanguage()
  const isCompact = variant === "compact"

  // Prepare chart data from analysis scores with color coding
  // Scores are 0-1, convert to 0-100 for display
  const chartData = [
    {
      metric: t('gaslightingRisk'),
      score: Math.round(analysis.gaslightingRiskScore * 100),
      color: analysis.gaslightingRiskScore >= 0.7 ? 'hsl(var(--destructive))' :
             analysis.gaslightingRiskScore >= 0.4 ? 'hsl(25 95% 53%)' : // amber
             'hsl(142 76% 36%)', // emerald
    },
    {
      metric: t('conflictIntensity'),
      score: Math.round(analysis.conflictIntensityScore * 100),
      color: analysis.conflictIntensityScore >= 0.7 ? 'hsl(var(--destructive))' :
             analysis.conflictIntensityScore >= 0.4 ? 'hsl(25 95% 53%)' :
             'hsl(142 76% 36%)',
    },
    {
      metric: t('supportiveness'),
      score: Math.round(analysis.supportivenessScore * 100),
      color: analysis.supportivenessScore >= 0.7 ? 'hsl(142 76% 36%)' :
             analysis.supportivenessScore >= 0.4 ? 'hsl(25 95% 53%)' :
             'hsl(var(--destructive))',
    },
    {
      metric: t('apologyFrequency'),
      score: Math.round(analysis.apologyFrequencyScore * 100),
      color: analysis.apologyFrequencyScore >= 0.7 ? 'hsl(142 76% 36%)' :
             analysis.apologyFrequencyScore >= 0.4 ? 'hsl(25 95% 53%)' :
             'hsl(var(--destructive))',
    },
  ]

  const chartConfig = {
    score: {
      label: t('score'),
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <div className={cn("w-full flex flex-col", isCompact && "")}>
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
              ? "max-w-full min-h-[180px] sm:min-h-[220px]"
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
                fontSize: isCompact ? 9 : 11,
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
              dot={{ fill: 'var(--color-score)', r: isCompact ? 3 : 4 }}
            />
          </RadarChart>
        </ChartContainer>
      </div>
    </div>
  )
}

