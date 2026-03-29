import type { Metadata } from 'next';

import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Privacy Policy',
  description:
    'Read how Texts with My Ex handles chat exports, personal data, payment details, and retention policies.',
  path: '/privacy',
  keywords: ['privacy policy', 'data retention', 'chat export privacy', 'ai privacy policy'],
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
