import type { MetadataRoute } from 'next';

import { ARTICLE_PATHS, PUBLIC_SITE_PATHS, absoluteUrl } from '@/lib/seo';

const ALL_INDEXABLE_PATHS = [...PUBLIC_SITE_PATHS, ...ARTICLE_PATHS];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ALL_INDEXABLE_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/articles/') ? 0.7 : 0.6,
  }));
}
