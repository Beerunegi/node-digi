import { siteConfig, absoluteUrl } from './site-config';
import { routeMap } from './site-routes';

/**
 * Builds Next.js `metadata` for a marketing route from a single source of
 * truth, so title/description/canonical/OG can never drift apart the way they
 * did when every page hand-rolled its own object.
 */
export function buildPageMetadata(pathname, overrides = {}) {
  const route = routeMap[pathname] || {};
  const title = overrides.title || route.metaTitle || siteConfig.defaultTitle;
  const description =
    overrides.description || route.metaDescription || siteConfig.defaultDescription;
  const image = overrides.image || siteConfig.ogImage;

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    robots: route.noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: pathname,
      siteName: siteConfig.name,
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          type: image.type,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
    ...overrides.extra,
  };
}

/**
 * `Service` schema for a service page, tied back to the site-wide
 * Organization node by `@id` so AI systems resolve the provider to one entity
 * rather than treating each page as an unrelated business.
 */
export function serviceSchema(pathname) {
  const route = routeMap[pathname];
  if (!route || !route.service) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${absoluteUrl(pathname)}#service`,
    name: route.service,
    serviceType: route.serviceType || route.service,
    description: route.metaDescription,
    url: absoluteUrl(pathname),
    provider: { '@id': `${siteConfig.baseUrl}/#organization` },
    areaServed: [
      { '@type': 'City', name: 'Delhi' },
      { '@type': 'City', name: 'Noida' },
      { '@type': 'City', name: 'Gurugram' },
      { '@type': 'City', name: 'Ghaziabad' },
      { '@type': 'Country', name: 'India' },
    ],
    audience: {
      '@type': 'BusinessAudience',
      name: 'Small and medium businesses, D2C brands, and B2B companies',
    },
  };
}

/**
 * Retainer tiers published on /pricing. Kept here rather than parsed out of
 * the EJS because prices need to be exact -- but they must stay in step with
 * `views/pricing.ejs`, which is the visible source of truth.
 */
const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '14999',
    description:
      'SEO setup and optimization, Google Business Profile optimization, one ad platform managed, landing page recommendations, and a monthly performance report.',
  },
  {
    name: 'Growth',
    price: '29999',
    description:
      'SEO, AIO and GEO strategy, Google Ads and Meta Ads management, website conversion optimization, email automation setup, and bi-weekly strategy calls.',
  },
  {
    name: 'Scale',
    price: '59999',
    description:
      'Omnichannel marketing management, Shopify/WordPress development support, advanced analytics dashboard, CRO experiments, and weekly performance reviews.',
  },
];

/** `OfferCatalog` for /pricing, so published rates are machine-readable. */
export function pricingSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': `${absoluteUrl('/pricing')}#offers`,
    name: 'Digi Web Tech Monthly Retainer Plans',
    url: absoluteUrl('/pricing'),
    provider: { '@id': `${siteConfig.baseUrl}/#organization` },
    itemListElement: PRICING_TIERS.map((tier, index) => ({
      '@type': 'Offer',
      position: index + 1,
      name: tier.name,
      description: tier.description,
      price: tier.price,
      priceCurrency: 'INR',
      url: absoluteUrl('/pricing'),
      availability: 'https://schema.org/InStock',
      eligibleCustomerType: 'https://schema.org/Business',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: tier.price,
        priceCurrency: 'INR',
        unitCode: 'MON',
        billingDuration: 1,
        billingIncrement: 1,
      },
    })),
  };
}

/** `WebPage` node for industry pages, which previously carried no schema. */
export function webPageSchema(pathname) {
  const route = routeMap[pathname];
  if (!route) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(pathname)}#webpage`,
    name: route.metaTitle,
    description: route.metaDescription,
    url: absoluteUrl(pathname),
    isPartOf: { '@id': `${siteConfig.baseUrl}/#website` },
    about: route.about ? { '@type': 'Thing', name: route.about } : undefined,
    publisher: { '@id': `${siteConfig.baseUrl}/#organization` },
    inLanguage: 'en-IN',
  };
}

/**
 * FAQPage schema generated from the `<details><summary>` accordions already
 * rendered in the legacy EJS, so the markup can never contradict the visible
 * page (a Google structured-data policy requirement).
 */
export function faqSchemaFromHtml(html) {
  const items = [];
  const blockRe = /<details\b[^>]*>([\s\S]*?)<\/details>/gi;
  let block;

  while ((block = blockRe.exec(html))) {
    const inner = block[1];
    const summary = inner.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
    if (!summary) continue;

    const question = textOf(summary[1]);
    const answer = textOf(inner.replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, ''));
    if (!question || !answer) continue;

    items.push({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    });
  }

  if (!items.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items,
  };
}

function textOf(fragment) {
  return fragment
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#8377;/g, '₹')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}
