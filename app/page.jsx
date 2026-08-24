import LegacyHtml from '@/components/LegacyHtml';
import SiteShell from '@/components/SiteShell';
import { getPublishedPosts } from '@/lib/blog';
import { renderLegacyView } from '@/lib/legacy-content';
import { buildPageMetadata, faqSchemaFromHtml } from '@/lib/page-metadata';
import { routeMap } from '@/lib/site-routes';

const homeRoute = routeMap['/'];

export const revalidate = 3600;

export const metadata = buildPageMetadata('/');

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/**
 * Three most recent posts for the homepage strip.
 *
 * `getPublishedPosts` already swallows a WordPress outage and returns an empty
 * array, and the template skips the whole section when the list is empty --
 * so the homepage never breaks because the blog backend is down.
 */
async function getLatestPosts() {
  const posts = await getPublishedPosts();

  if (!posts.length) {
    // Loud on purpose. The section hides itself when the blog backend is
    // unreachable, which is the right runtime behaviour but means a build run
    // during an outage silently ships a homepage with no blog strip.
    console.warn(
      '[Homepage] No blog posts returned - the "Latest from the blog" section ' +
        'will be omitted from this build. Check the WordPress API is reachable, ' +
        'then rebuild.',
    );
  }

  return posts.slice(0, 3).map((post) => ({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    coverImageAlt: post.coverImageAlt || post.title,
    coverImageWidth: post.coverImageWidth || 1200,
    coverImageHeight: post.coverImageHeight || 675,
    category: post.categories?.[0]?.name || 'Insights',
    readingTimeMinutes: post.readingTimeMinutes,
    publishedAt: post.publishedAt,
    publishedLabel: post.publishedAt ? dateFormatter.format(new Date(post.publishedAt)) : '',
  }));
}

export default async function HomePage() {
  const latestPosts = await getLatestPosts();

  const html = await renderLegacyView({
    view: homeRoute.view,
    title: homeRoute.title,
    currentPath: '/',
    locals: { latestPosts },
  });

  const schema = [faqSchemaFromHtml(html)].filter(Boolean);

  return (
    <SiteShell currentPath="/" schema={schema}>
      <LegacyHtml html={html} />
    </SiteShell>
  );
}
