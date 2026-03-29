import type { MetadataRoute } from 'next';

import { ARTICLE_PATHS, PUBLIC_SITE_PATHS, SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [...PUBLIC_SITE_PATHS, ...ARTICLE_PATHS],
        disallow: ['/admin', '/analysis', '/api', '/_next', '/private'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
