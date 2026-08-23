import SiteShell from '@/components/SiteShell';
import { isMissingDatabaseConfigError } from '@/lib/db';
import {
  getAllTags,
  getPublishedPosts,
} from '@/lib/blog';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

export const revalidate = 300;

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export async function generateStaticParams() {
  try {
    const tags = await getAllTags();
    return tags.map((tag) => ({ slug: tag.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let tags = [];

  try {
    tags = await getAllTags();
  } catch (error) {
    if (!isMissingDatabaseConfigError(error)) {
      throw error;
    }
  }

  const tag = tags.find((item) => item.slug === slug);
  const name = tag?.name || 'Tag';
  const title = `${name} Posts | ${siteConfig.name}`;
  const description = `Browse blog posts tagged ${name} from ${siteConfig.name}.`;
  const canonical = `/blog/tag/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    // Most tags hold a single post, so these are thin duplicates of the posts
    // themselves. Kept crawlable for link discovery, kept out of the index.
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: siteConfig.ogImage.url,
          width: siteConfig.ogImage.width,
          height: siteConfig.ogImage.height,
          type: siteConfig.ogImage.type,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.ogImage.url],
    },
  };
}

export default async function BlogTagPage({ params }) {
  const { slug } = await params;
  let databaseUnavailable = false;
  let posts = [];
  let tags = [];

  try {
    [posts, tags] = await Promise.all([
      getPublishedPosts({ tag: slug }),
      getAllTags(),
    ]);
  } catch (error) {
    if (!isMissingDatabaseConfigError(error)) {
      throw error;
    }

    databaseUnavailable = true;
  }

  const tag = tags.find((item) => item.slug === slug);
  const heading = tag?.name || 'Tag';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${heading} Posts`,
    url: absoluteUrl(`/blog/tag/${slug}`),
  };

  const breadcrumbItems = [
    { label: 'Home', url: '/' },
    { label: 'Blog', url: '/blog' },
    { label: `#${heading}` }
  ];

  return (
    <SiteShell currentPath={`/blog/tag/${slug}`} schema={schema} customBreadcrumbs={breadcrumbItems}>
      <section className="section-gap blog-taxonomy-shell">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Tag</span>
            <h1>#{heading}</h1>
            <p>
              {databaseUnavailable
                ? 'Add your MySQL connection values to load tagged posts.'
                : `${posts.length} published article${posts.length === 1 ? '' : 's'} with this tag.`}
            </p>
          </div>

          <div className="blog-post-grid">
            {posts.map((post) => (
              <article key={post.id} className="blog-card">
                {post.coverImage ? (
                  <a href={`/blog/${post.slug}`} className="blog-card-media">
                    <img
                      src={post.coverImage}
                      alt={post.coverImageAlt || post.title}
                      width={post.coverImageWidth || 1200}
                      height={post.coverImageHeight || 675}
                      loading="lazy"
                    />
                  </a>
                ) : null}
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    <span>{post.readingTimeMinutes} min read</span>
                  </div>
                  <h2><a href={`/blog/${post.slug}`}>{post.title}</a></h2>
                  <p>{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
