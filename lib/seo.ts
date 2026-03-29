import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://textswithmyex.com';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
export const SITE_NAME = 'Texts with My Ex';
export const SITE_TITLE = 'Texts with My Ex - AI Gaslight Detection';
export const SITE_DESCRIPTION =
  'Upload Telegram or WhatsApp chats to receive an impartial AI-powered relationship analysis. Detect gaslighting patterns, communication issues, and relationship dynamics.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon-v2.png?v=2`;
export const X_HANDLE = '@textswithmyex';

export const PUBLIC_SITE_PATHS = ['/', '/pricing', '/privacy', '/refund', '/terms'] as const;

export const ARTICLE_PATHS = [
  '/articles/covert-narcissism',
  '/articles/grief-guide',
  '/articles/healthy-relationships-dont-exist',
  '/articles/letting-go',
  '/articles/manipulation-types',
  '/articles/practical-steps',
  '/articles/psychological-consequences',
  '/articles/relationship-chances',
  '/articles/toxic-signs',
] as const;

export function absoluteUrl(path = '/') {
  return path === '/' ? SITE_URL : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [
        {
          url: image,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: X_HANDLE,
      site: X_HANDLE,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : undefined,
  };
}
