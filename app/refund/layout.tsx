import type { Metadata } from 'next';

import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Refund Policy',
  description: 'Refund policy and purchase support information for Texts with My Ex reports.',
  path: '/refund',
  keywords: ['refund policy', 'purchase support', 'report refund', 'payment support'],
});

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
