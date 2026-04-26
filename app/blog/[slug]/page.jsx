import { notFound } from 'next/navigation';

import SiteShell from '@/components/SiteShell';
import { isMissingDatabaseConfigError } from '@/lib/db';
import { getPublishedPostBySlug, getPublishedSlugs } from '@/lib/blog';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

export const revalidate = 300;

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let post;

  try {
    post = await getPublishedPostBySlug(slug);
  } catch (error) {
    if (isMissingDatabaseConfigError(error)) {
      return {};
    }

    throw error;
  }

  if (!post) {
    return {};
  }

  const canonical = `/blog/${post.slug}`;

  return {
    title: post.metaTitle || `${post.title} | ${siteConfig.name}`,
    description: post.metaDescription || post.excerpt,
    alternates: {
      canonical,
    },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      url: absoluteUrl(canonical),
      type: 'article',
      publishedTime: post.publishedAt,
      images: post.coverImage ? [{ url: post.coverImage, alt: post.coverImageAlt || post.title }] : [],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  let post;

  try {
    post = await getPublishedPostBySlug(slug);
  } catch (error) {
    if (isMissingDatabaseConfigError(error)) {
      notFound();
    }

    throw error;
  }

  if (!post) {
    notFound();
  }

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      image: post.coverImage ? [post.coverImage] : undefined,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: {
        '@type': 'Person',
        name: post.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: absoluteUrl('/images/favicon.svg'),
        },
      },
      mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
        { '@type': 'ListItem', position: 3, name: post.title, item: absoluteUrl(`/blog/${post.slug}`) },
      ],
    },
  ];

  return (
    <SiteShell currentPath="/blog" schema={schema}>
      <article className="section-gap blog-post-shell">
        <div className="container blog-post-layout">
          <div className="blog-post-header">
            <div className="blog-breadcrumbs">
              <a href="/blog">Blog</a>
              <span>/</span>
              <span>{post.title}</span>
            </div>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
            <div className="blog-post-meta">
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              <span>{post.readingTimeMinutes} min read</span>
            </div>
            <div className="blog-card-taxonomy">
              {post.categories.map((category) => (
                <a key={category.slug} href={`/blog/category/${category.slug}`}>
                  {category.name}
                </a>
              ))}
              {post.tags.map((tag) => (
                <a key={tag.slug} href={`/blog/tag/${tag.slug}`}>
                  #{tag.name}
                </a>
              ))}
            </div>
          </div>

          {post.coverImage ? (
            <div className="blog-post-cover">
              <img src={post.coverImage} alt={post.coverImageAlt || post.title} />
            </div>
          ) : null}

          <div
            className="blog-article-content"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>
      </article>
    </SiteShell>
  );
}
