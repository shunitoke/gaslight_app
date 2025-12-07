'use client';

import dynamic from 'next/dynamic';

const HomePageClient = dynamic(() => import('@/components/home/HomePageClient'), {
  ssr: false,
  loading: () => <div className="min-h-screen" />
});

export function HomePageShell() {
  return <HomePageClient />;
}




