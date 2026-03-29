import type { Metadata } from 'next';

import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Analysis Report',
  description: 'Relationship analysis report page.',
  path: '/analysis',
  noIndex: true,
});

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
