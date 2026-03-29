import type { Metadata } from 'next';

import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Pricing',
  description:
    'Compare free and premium AI relationship analysis plans for Telegram and WhatsApp chat exports.',
  path: '/pricing',
  keywords: ['pricing', 'relationship analysis pricing', 'ai report pricing', 'chat analysis premium'],
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
