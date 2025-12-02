'use client';

import React from 'react';

import type { MediaArtifact } from '../../features/analysis/types';
import { Card } from '../ui/card';

type MediaEvidenceProps = {
  artifacts: MediaArtifact[];
  onArtifactClick?: (artifact: MediaArtifact) => void;
};

export const MediaEvidence = ({ artifacts, onArtifactClick }: MediaEvidenceProps) => {
  if (artifacts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-text">Media Evidence</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {artifacts.map((artifact) => (
          <div
            key={artifact.id}
            className="cursor-pointer"
            onClick={() => onArtifactClick?.(artifact)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onArtifactClick?.(artifact);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <Card className="transition-all hover:shadow-md hover:border-accent/40 p-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-accent uppercase">
                {artifact.type}
              </div>
              {artifact.originalFilename && (
                <div className="text-xs text-text/70 truncate">
                  {artifact.originalFilename}
                </div>
              )}
              {artifact.labels && artifact.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {artifact.labels.slice(0, 3).map((label, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-text/70"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
              {artifact.sentimentHint && artifact.sentimentHint !== 'unknown' && (
                <div className="text-xs text-text/60">
                  Sentiment: {artifact.sentimentHint}
                </div>
              )}
              {artifact.notes && (
                <div className="text-xs text-text/50 italic">{artifact.notes}</div>
              )}
            </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

