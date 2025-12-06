'use client';

import dynamic from 'next/dynamic';

const ConditionalBackgroundAnimation = dynamic(
  () =>
    import('./ConditionalBackgroundAnimation').then((m) => ({
      default: m.ConditionalBackgroundAnimation
    })),
  { ssr: false, loading: () => null }
);

export function ConditionalBackgroundClient() {
  return <ConditionalBackgroundAnimation />;
}


