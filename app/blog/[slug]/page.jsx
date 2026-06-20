import { notFound } from 'next/navigation';

import SiteShell from '@/components/SiteShell';
import { isMissingDatabaseConfigError } from '@/lib/db';
import { getPublishedPostBySlug, getPublishedSlugs, getPublishedPosts } from '@/lib/blog';
import { absoluteUrl, siteConfig } from '@/lib/site-config';
import { 
  ReadingProgressBar, 
  StickyTOC, 
  FaqAccordion,
  NewsletterWidget
} from '@/components/BlogInteractive';

export const revalidate = 300;

const RELATED_SERVICES = [
  { name: 'SEO Services', slug: 'seo-services', path: '/services/seo-services', icon: 'seo' },
  { name: 'Meta Ads Management', slug: 'meta-ads-management-services', path: '/services/meta-ads-management-services', icon: 'ads' },
  { name: 'Google Ads Services', slug: 'google-ads-services', path: '/services/google-ads-services', icon: 'ppc' },
  { name: 'Content Marketing', slug: 'content-marketing-services', path: '/services/content-marketing-services', icon: 'content' },
  { name: 'AIO Optimization', slug: 'aio-optimization-services', path: '/services/aio-optimization-services', icon: 'ai' },
  { name: 'Website Development', slug: 'website-development-services', path: '/services/website-development-services', icon: 'web' },
];

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function getAuthorInitials(name) {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAuthorBio(name) {
  if (name.toLowerCase().includes('digi web tech')) {
    return 'The Digi Web Tech Team is a group of seasoned digital marketers, search engine optimization experts, and web developers committed to helping businesses grow organic traffic and build high-converting web solutions.';
  }
  return `${name} is a Senior Growth Specialist and Content Strategist at Digi Web Tech. With years of experience in technical SEO, conversion rate optimization, and AI Search optimization, they help brands build authoritative web footprints.`;
}

function getServiceIcon(type) {
  switch(type) {
    case 'seo':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      );
    case 'ads':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
    case 'ppc':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      );
    case 'content':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      );
    case 'ai':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
        </svg>
      );
    case 'web':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      );
  }
}

function getCategoryFaqs(categories = [], title = '') {
  const isSeo = categories.some(
    (c) =>
      c.slug.toLowerCase().includes('seo') ||
      c.slug.toLowerCase().includes('marketing') ||
      c.slug.toLowerCase().includes('optimization')
  );
  const isDev = categories.some(
    (c) =>
      c.slug.toLowerCase().includes('web') ||
      c.slug.toLowerCase().includes('dev') ||
      c.slug.toLowerCase().includes('shopify') ||
      c.slug.toLowerCase().includes('wordpress')
  );

  if (isSeo) {
    return [
      {
        question: 'How long does it take to see results from SEO and digital marketing campaigns?',
        answer: 'Typically, SEO strategies show noticeable improvements in search engine rankings and organic traffic within 3 to 6 months. Paid advertising campaigns (such as Google Ads and Meta Ads) can drive immediate traffic and leads, but require ongoing refinement to maximize conversion values and lower acquisition costs.',
      },
      {
        question: 'What is the difference between SEO, AIO, and GEO?',
        answer: 'SEO (Search Engine Optimization) optimizes websites for traditional search crawlers like Google. AIO (AI Optimization) ensures content is featured inside AI-generated summaries (like ChatGPT Search and Google Gemini). GEO (Generative Engine Optimization) tailors content structure specifically for AI and generative engines by focusing on semantic clarity, direct answering, citation structures, and authoritativeness.',
      },
      {
        question: 'How does Digi Web Tech track and report digital marketing campaign success?',
        answer: 'We provide comprehensive monthly reports and live dashboards utilizing Google Analytics 4, Google Search Console, and keyword tracking suites. Rather than focusing purely on vanity traffic, we map and track conversions, direct phone calls, form completions, and cost-per-lead to demonstrate true business growth.',
      },
    ];
  } else if (isDev) {
    return [
      {
        question: 'How long does it take to build a custom website with Digi Web Tech?',
        answer: 'A standard custom website takes about 4 to 8 weeks from design to deployment. Larger WordPress systems, enterprise WooCommerce platforms, or custom Shopify stores might take 8 to 12 weeks. We execute projects using collaborative design review phases, agile frontend development, rigorous SEO audits, and speed-optimization checkups.',
      },
      {
        question: 'Will my new website be mobile-responsive and optimized for Core Web Vitals?',
        answer: 'Yes, absolutely. We prioritize building lightning-fast, responsive layouts that conform strictly to Google\'s Core Web Vitals guidelines. This includes optimizing image sizes, utilizing modern styling rules, leveraging caching mechanisms, and delivering clean, semantic HTML code that loads instantly on mobile devices.',
      },
      {
        question: 'Do you offer website maintenance and security support after launch?',
        answer: 'Yes, we provide ongoing maintenance and security support plans. These cover core version updates, automated daily backups, security scanning, speed monitoring, minor layout tweaks, and general troubleshooting so you can focus entirely on running your business.',
      },
    ];
  } else {
    return [
      {
        question: `How can the strategies in "${title}" help my business scale?`,
        answer: 'This guide outlines actionable steps, key takeaways, and industry best practices to help you optimize processes, increase search engine visibility, refine customer journeys, and boost your digital marketing performance.',
      },
      {
        question: 'Does Digi Web Tech offer tailored consultation services for my specific industry?',
        answer: 'Yes. We build custom marketing roadmaps and web solutions for clients across diverse sectors including Healthcare, Education, eCommerce, Real Estate, Technology/SaaS, and Automotive. We analyze your competitors and user intents to craft customized campaigns.',
      },
      {
        question: 'How do I get started with a project or request a digital audit?',
        answer: 'You can initiate a project by clicking "Start a Project" or calling us directly at +91 98712 64699. Our technical specialists will perform an initial audit of your current digital assets and set up a free 30-minute discovery consultation to discuss the path forward.',
      },
    ];
  }
}

function generateKeyTakeaways(post) {
  const title = post.title;
  return [
    `Understand the critical role that ${title.toLowerCase().replace(/how to|what is|guide to/gi, '').trim()} plays in boosting modern digital presence and search footprint.`,
    `Implement the step-by-step methodologies covered in this guide to optimize site speed, readability, user flow, and overall conversion rate optimization.`,
    `Partner with the Digi Web Tech growth team to execute a specialized, data-backed optimization strategy designed specifically for your target audience.`
  ];
}

function injectInlineCta(contentHtml) {
  if (!contentHtml) return '';
  const paragraphs = contentHtml.split('</p>');

  if (paragraphs.length >= 3) {
    const ctaHtml = `
      <div class="inline-cta-card">
        <h3>Accelerate Your Search Rankings & ROI</h3>
        <p>Struggling to drive organic leads? Digi Web Tech's dedicated SEO and growth optimization team can design a performance-first strategy to scale your search visibility.</p>
        <a href="/contact" class="btn">Get Your Free Growth Audit &rarr;</a>
      </div>
    `;
    paragraphs.splice(3, 0, ctaHtml);
    return paragraphs.join('</p>');
  }

  return contentHtml;
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

  // Fetch related posts from the same category
  let relatedPosts = [];
  try {
    const categorySlug = post.categories[0]?.slug;
    if (categorySlug) {
      const allPostsInCat = await getPublishedPosts({ category: categorySlug });
      relatedPosts = allPostsInCat
        .filter((p) => p.slug !== post.slug)
        .slice(0, 2);
    }
    
    // Fallback if there are not enough category-matched posts
    if (relatedPosts.length < 2) {
      const fallbackPosts = await getPublishedPosts();
      const extraPosts = fallbackPosts
        .filter((p) => p.slug !== post.slug && !relatedPosts.some(rp => rp.slug === p.slug))
        .slice(0, 2 - relatedPosts.length);
      relatedPosts = [...relatedPosts, ...extraPosts];
    }
  } catch (err) {
    console.error('Failed to load related posts:', err);
  }

  const faqs = getCategoryFaqs(post.categories, post.title);
  const takeaways = generateKeyTakeaways(post);
  const contentWithCta = injectInlineCta(post.contentHtml);

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
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    }
  ];

  const primaryCategory = post.categories[0];

  return (
    <SiteShell currentPath="/blog" schema={schema}>
      <ReadingProgressBar />
      
      <article className="section-gap blog-post-shell">
        <div className="container blog-post-layout">
          
          {/* Header Section */}
          <div className="blog-post-header">
            <div className="blog-breadcrumbs">
              <a href="/">Home</a>
              <span className="sep">/</span>
              <a href="/blog">Blog</a>
              {primaryCategory ? (
                <>
                  <span className="sep">/</span>
                  <a href={`/blog/category/${primaryCategory.slug}`}>{primaryCategory.name}</a>
                </>
              ) : null}
              <span className="sep">/</span>
              <span className="current">{post.title}</span>
            </div>
            
            <div className="blog-post-categories">
              {post.categories.map((category) => (
                <a key={category.slug} href={`/blog/category/${category.slug}`} className="category-pill">
                  {category.name}
                </a>
              ))}
            </div>

            <h1>{post.title}</h1>
            
            {post.excerpt ? (
              <p className="blog-post-excerpt">{post.excerpt}</p>
            ) : null}

            <div className="blog-post-author-meta">
              <div className="author-avatar-initials">
                {getAuthorInitials(post.authorName)}
              </div>
              <div className="author-info-text">
                <a href="#author-box" className="author-name-link">{post.authorName}</a>
                <div className="post-meta-details">
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                  <span className="meta-dot">•</span>
                  <span>{post.readingTimeMinutes} min read</span>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.coverImage ? (
            <div className="blog-post-cover">
              <img src={post.coverImage} alt={post.coverImageAlt || post.title} />
            </div>
          ) : null}

          {/* Two Column Layout Grid */}
          <div className="blog-layout-wrapper">
            
            {/* Left/Main Column */}
            <div className="blog-main-content-column">
              {/* Table of Contents (Mobile/Tablet Only) */}
              <StickyTOC />

              {/* Key Takeaways */}
              <div className="key-takeaways-card">
                <h4 className="key-takeaways-title">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--brand)'}}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Key Takeaways
                </h4>
                <ul className="key-takeaways-list">
                  {takeaways.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Rich HTML Content */}
              <div
                className="blog-article-content"
                dangerouslySetInnerHTML={{ __html: contentWithCta }}
              />

              {/* FAQs Accordion */}
              <FaqAccordion faqs={faqs} />

              {/* Author Bio Box */}
              <div id="author-box" className="author-bio-card">
                <div className="author-bio-avatar">
                  {getAuthorInitials(post.authorName)}
                </div>
                <div className="author-bio-info">
                  <h4 className="author-bio-name">{post.authorName}</h4>
                  <div className="author-bio-role">Senior Contributor</div>
                  <p className="author-bio-desc">{getAuthorBio(post.authorName)}</p>
                </div>
              </div>

              {/* Related Posts Section */}
              {relatedPosts.length > 0 ? (
                <div className="related-posts-section">
                  <h3 className="related-posts-title">Related Articles</h3>
                  <div className="related-posts-grid">
                    {relatedPosts.map((relatedPost) => (
                      <a key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="related-post-card">
                        {relatedPost.coverImage ? (
                          <div className="related-post-image">
                            <img src={relatedPost.coverImage} alt={relatedPost.coverImageAlt || relatedPost.title} />
                          </div>
                        ) : null}
                        <div className="related-post-body">
                          <div className="related-post-meta">
                            <span>{formatDate(relatedPost.publishedAt || relatedPost.createdAt)}</span>
                            <span>•</span>
                            <span>{relatedPost.readingTimeMinutes} min read</span>
                          </div>
                          <h4 className="related-post-title">{relatedPost.title}</h4>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

            </div>

            {/* Right Column / Sticky Sidebar */}
            <aside className="blog-sidebar-column">
              <div className="blog-sidebar-wrapper">
                
                {/* Table of Contents */}
                <StickyTOC />

                {/* Related Services */}
                <div className="related-services-widget">
                  <h4 className="widget-title">Related Services</h4>
                  <div className="service-widget-list">
                    {RELATED_SERVICES.map((service) => (
                      <a key={service.slug} href={service.path} className="service-widget-item">
                        <span className="service-widget-icon">
                          {getServiceIcon(service.icon)}
                        </span>
                        <span className="service-widget-name">{service.name}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Newsletter Signup */}
                <NewsletterWidget />

              </div>
            </aside>

          </div>

          {/* Footer CTA Section */}
          <div className="footer-cta-section">
            <div className="footer-cta-content">
              <span className="footer-cta-badge">Free Consultation</span>
              <h2>Ready to Scale Your Organic Search Rankings?</h2>
              <p>Get a comprehensive search engine and technical SEO audit for your website. No obligation, just pure actionable advice from our growth specialists.</p>
              <div className="footer-cta-actions">
                <a href="/contact" className="btn-primary">Claim Your Free Audit</a>
                <a href="tel:+919871264699" className="btn-secondary">Talk to an Expert</a>
              </div>
            </div>
          </div>

        </div>
      </article>
    </SiteShell>
  );
}
