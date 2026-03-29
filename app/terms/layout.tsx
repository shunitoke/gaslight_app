import type { Metadata } from 'next';

import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Terms of Service',
  description: 'Terms of service for using Texts with My Ex and purchasing AI-generated relationship reports.',
  path: '/terms',
  keywords: ['terms of service', 'terms and conditions', 'usage policy', 'ai report terms'],
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
