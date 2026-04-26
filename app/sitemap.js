import { getAllCategories, getAllTags, getPublishedPosts } from '@/lib/blog';
import { staticMarketingPaths } from '@/lib/site-routes';
import { siteConfig } from '@/lib/site-config';

export default async function sitemap() {
  const now = new Date();
  const baseEntries = staticMarketingPaths
    .filter((pathname) => pathname !== '/home-sample')
    .map((pathname) => ({
      url: `${siteConfig.baseUrl}${pathname === '/' ? '' : pathname}`,
      lastModified: now,
      changeFrequency: pathname === '/' ? 'daily' : 'weekly',
      priority: pathname === '/' ? 1 : 0.8,
    }));

  try {
    const [posts, categories, tags] = await Promise.all([
      getPublishedPosts(),
      getAllCategories(),
      getAllTags(),
    ]);

    return [
      ...baseEntries,
      ...posts.map((post) => ({
        url: `${siteConfig.baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt || now,
        changeFrequency: 'weekly',
        priority: 0.75,
      })),
      ...categories.map((category) => ({
        url: `${siteConfig.baseUrl}/blog/category/${category.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.65,
      })),
      ...tags.map((tag) => ({
        url: `${siteConfig.baseUrl}/blog/tag/${tag.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      })),
      {
        url: `${siteConfig.baseUrl}/blog`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.85,
      },
    ];
  } catch {
    return baseEntries;
  }
}
