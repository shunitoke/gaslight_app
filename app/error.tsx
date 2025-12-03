'use client';

import Link from 'next/link';
import React from 'react';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-border/30 backdrop-blur-lg" style={{ backgroundColor: 'hsl(var(--card) / 0.85)', willChange: 'background-color, opacity', backfaceVisibility: 'hidden' }}>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-destructive">Error</h1>
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred'}
          </p>
          {process.env.NODE_ENV === 'development' && error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}



