import { getAllCategories, getPublishedPosts } from '@/lib/blog';
import { indexableMarketingPaths } from '@/lib/site-routes';
import { siteConfig } from '@/lib/site-config';

/**
 * Only indexable URLs belong here. Sample/staging/utility routes are filtered
 * out via `indexableMarketingPaths`, and `/blog/tag/*` is excluded entirely --
 * those pages are `noindex` because most hold a single post.
 *
 * `lastModified` is deliberately omitted for static marketing pages. Stamping
 * every page with the current build time is a false freshness signal, and
 * Google discounts sitemaps that do it.
 */
function priorityFor(pathname) {
  if (pathname === '/') return 1;
  if (pathname === '/services' || pathname === '/contact') return 0.9;
  if (pathname.startsWith('/services/')) return 0.85;
  if (pathname.startsWith('/case-studies') || pathname.startsWith('/industries')) return 0.7;
  if (pathname === '/privacy-policy' || pathname === '/terms-of-service') return 0.3;
  return 0.6;
}

export default async function sitemap() {
  const now = new Date();

  const baseEntries = indexableMarketingPaths.map((pathname) => ({
    url: `${siteConfig.baseUrl}${pathname === '/' ? '' : pathname}`,
    changeFrequency: pathname === '/' ? 'weekly' : 'monthly',
    priority: priorityFor(pathname),
  }));

  const blogIndex = {
    url: `${siteConfig.baseUrl}/blog`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  };

  try {
    const [posts, categories] = await Promise.all([getPublishedPosts(), getAllCategories()]);

    return [
      ...baseEntries,
      blogIndex,
      ...posts.map((post) => ({
        url: `${siteConfig.baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt || now,
        changeFrequency: 'monthly',
        priority: 0.7,
      })),
      ...categories.map((category) => ({
        url: `${siteConfig.baseUrl}/blog/category/${category.slug}`,
        changeFrequency: 'weekly',
        priority: 0.5,
      })),
    ];
  } catch {
    return [...baseEntries, blogIndex];
  }
}
