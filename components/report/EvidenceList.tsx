'use client';

import React from 'react';

import type { EvidenceSnippet } from '../../features/analysis/types';
import { Card } from '../ui/card';

type EvidenceListProps = {
  evidence: EvidenceSnippet[];
  title?: string;
  onEvidenceClick?: (evidence: EvidenceSnippet, index: number) => void;
};

export const EvidenceList = ({ evidence, title = 'Evidence', onEvidenceClick }: EvidenceListProps) => {
  if (evidence.length === 0) {
    return (
      <div className="text-center py-8 text-text/60">
        <p>No evidence available for this pattern.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <div className="space-y-3">
        {evidence.map((item, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => onEvidenceClick?.(item, index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEvidenceClick?.(item, index);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <Card className="transition-all hover:shadow-md hover:border-accent/40">
            <div className="space-y-2">
              <div className="border-l-4 border-accent pl-4">
                <p className="italic text-text/90 mb-2">&ldquo;{item.excerpt}&rdquo;</p>
                <p className="text-sm text-text/70">{item.explanation}</p>
              </div>
              {item.messageId && (
                <div className="text-xs text-text/50 mt-2">
                  Message ID: {item.messageId.substring(0, 8)}...
                </div>
              )}
            </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

