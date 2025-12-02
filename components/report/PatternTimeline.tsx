'use client';

import React from 'react';

import type { PatternTimeline as PatternTimelineType } from '../../features/analysis/timelines';

type PatternTimelineProps = {
  timeline: PatternTimelineType;
  onBinClick?: (binIndex: number) => void;
};

export const PatternTimeline = ({ timeline, onBinClick }: PatternTimelineProps) => {
  const maxScore = Math.max(...timeline.bins.map((b) => b.gaslightingScore + b.conflictScore), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text">{timeline.patternName}</h3>
        <span className="text-sm text-text/70">
          Overall: {(timeline.overallScore * 100).toFixed(0)}%
        </span>
      </div>

      <div className="relative h-24 w-full">
        {/* Background grid */}
        <div className="absolute inset-0 flex items-end gap-1">
          {timeline.bins.map((bin, index) => {
            const height = ((bin.gaslightingScore + bin.conflictScore) / maxScore) * 100;
            const date = new Date(bin.startDate);
            const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <button
                key={index}
                type="button"
                onClick={() => onBinClick?.(index)}
                className="group relative flex-1 rounded-t border border-accent/20 bg-gradient-to-t from-accent/40 to-primary/30 transition-all hover:from-accent/60 hover:to-primary/50 hover:shadow-md"
                style={{ height: `${Math.max(height, 5)}%` }}
                aria-label={`Time period ${dateLabel}: ${bin.messageCount} messages, ${bin.evidenceCount} evidence points`}
              >
                <div className="absolute -top-6 left-0 right-0 text-[10px] text-text/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {dateLabel}
                </div>
                <div className="absolute -bottom-5 left-0 right-0 text-[9px] text-text/40">
                  {bin.messageCount}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-text/60">
        <span>{timeline.bins.length} time periods</span>
        <span>{timeline.bins.reduce((sum, b) => sum + b.messageCount, 0)} total messages</span>
      </div>
    </div>
  );
};






