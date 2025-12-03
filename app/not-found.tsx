import Link from 'next/link';
import React from 'react';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-border/30 backdrop-blur-lg" style={{ backgroundColor: 'hsl(var(--card) / 0.85)', willChange: 'background-color, opacity', backfaceVisibility: 'hidden' }}>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/analysis">
            <Button variant="outline">View Analysis</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

