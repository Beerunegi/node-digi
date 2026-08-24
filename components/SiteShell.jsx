import { Fragment } from 'react';
import Script from 'next/script';

import { siteConfig, absoluteUrl, socialProfiles } from '@/lib/site-config';
import { reviewsForPath } from '@/lib/reviews';
import { routeMap } from '@/lib/site-routes';

const SOCIAL_LINKS = [
  {
    key: 'facebook',
    label: 'Facebook',
    path: 'M13.5 9H16V6h-2.5C11.57 6 10 7.57 10 9.5V12H8v3h2v6h3v-6h2.2l.8-3H13V9.5c0-.28.22-.5.5-.5z',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.75 6.5a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    path: 'M6.94 8.5a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88zM5.5 9.75h2.88V18H5.5zm4.63 0h2.76v1.12h.04a3 3 0 0 1 2.7-1.48c2.88 0 3.41 1.9 3.41 4.37V18h-2.88v-3.77c0-.9-.02-2.06-1.26-2.06s-1.45.98-1.45 1.99V18h-2.88z',
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    path: 'M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z',
  },
];

function activeClass(condition) {
  return condition ? 'active' : '';
}

function startsWithClass(currentPath, prefix) {
  return currentPath.startsWith(prefix) ? 'active' : '';
}

/**
 * The site-wide entity graph.
 *
 * Emitted on every page, not just the homepage, so that `Service`, `WebPage`
 * and `BlogPosting` nodes elsewhere can point at a single `@id` instead of
 * each page describing an unrelated business. `sameAs` is what lets an AI
 * search system resolve "Digi Web Tech" to a verifiable real-world entity --
 * it is populated automatically from `siteConfig.social`.
 */
function organizationGraph(currentPath) {
  const reviews = reviewsForPath(currentPath);
  const profiles = socialProfiles();

  const organization = {
    '@type': 'Organization',
    '@id': `${siteConfig.baseUrl}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: `${siteConfig.baseUrl}/`,
    description: siteConfig.defaultDescription,
    foundingDate: siteConfig.foundingDate,
    logo: {
      '@type': 'ImageObject',
      '@id': `${siteConfig.baseUrl}/#logo`,
      url: `${siteConfig.baseUrl}/images/og-default.png`,
      width: 1200,
      height: 630,
      caption: siteConfig.name,
    },
    image: { '@id': `${siteConfig.baseUrl}/#logo` },
    email: siteConfig.email,
    telephone: siteConfig.phoneE164,
    address: {
      '@type': 'PostalAddress',
      ...siteConfig.address,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.phoneE164,
      email: siteConfig.email,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    knowsAbout: [
      'Search Engine Optimization',
      'AI Optimization (AIO)',
      'Generative Engine Optimization (GEO)',
      'Google Ads',
      'Meta Ads',
      'Website Design',
      'Website Development',
      'Shopify Development',
      'WordPress Development',
      'Content Marketing',
      'Conversion Rate Optimization',
      'Marketing Analytics',
    ],
  };

  if (profiles.length) {
    organization.sameAs = profiles;
  }

  const localBusiness = {
    '@type': 'ProfessionalService',
    '@id': `${siteConfig.baseUrl}/#localbusiness`,
    name: siteConfig.name,
    url: `${siteConfig.baseUrl}/`,
    image: { '@id': `${siteConfig.baseUrl}/#logo` },
    parentOrganization: { '@id': `${siteConfig.baseUrl}/#organization` },
    telephone: siteConfig.phoneE164,
    email: siteConfig.email,
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    address: {
      '@type': 'PostalAddress',
      ...siteConfig.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    areaServed: [
      { '@type': 'City', name: 'Delhi' },
      { '@type': 'City', name: 'Noida' },
      { '@type': 'City', name: 'Gurugram' },
      { '@type': 'City', name: 'Ghaziabad' },
      { '@type': 'Country', name: 'India' },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '19:00',
    },
  };

  if (profiles.length) {
    localBusiness.sameAs = profiles;
  }

  // Only attached on pages where the matching testimonials are actually
  // rendered, which Google's review-snippet policy requires.
  if (reviews) {
    localBusiness.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      ).toFixed(1),
      reviewCount: String(reviews.length),
      bestRating: '5',
    };
    localBusiness.review = reviews.map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.author },
      reviewRating: { '@type': 'Rating', ratingValue: String(review.rating), bestRating: '5' },
      reviewBody: review.body,
    }));
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${siteConfig.baseUrl}/#website`,
    url: `${siteConfig.baseUrl}/`,
    name: siteConfig.name,
    description: siteConfig.defaultDescription,
    publisher: { '@id': `${siteConfig.baseUrl}/#organization` },
    inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.baseUrl}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, localBusiness, website],
  };
}

function generateBreadcrumbs(pathname) {
  if (!pathname || pathname === '/' || pathname === '/404') {
    return [];
  }

  // Remove trailing slashes and split
  const cleanPath = pathname.replace(/\/+$/, '');
  const segments = cleanPath.split('/').filter(Boolean);

  const items = [{ label: 'Home', url: '/' }];
  let accumulatedPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    accumulatedPath += `/${segment}`;

    // Lookup in routeMap first
    let label = '';
    const route = routeMap[accumulatedPath];
    if (route && route.title) {
      label = route.title.split(' | ')[0].split(' - ')[0];
    } else {
      // Fallback: format segment slug
      label = segment
        .split('-')
        .map(word => {
          const lower = word.toLowerCase();
          if (lower === 'seo') return 'SEO';
          if (lower === 'aio') return 'AIO';
          if (lower === 'geo') return 'GEO';
          if (lower === 'cro') return 'CRO';
          if (lower === 'ppc') return 'PPC';
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
    }

    // Leaf node has no URL (current page)
    const isLast = i === segments.length - 1;
    items.push({
      label,
      url: isLast ? undefined : accumulatedPath,
    });
  }

  return items;
}

export default function SiteShell({ children, currentPath, schema, customBreadcrumbs, hideBreadcrumbs }) {
  // Only render icons for profiles that actually exist -- an href="#" is a
  // dead link on every page and gives the entity graph nothing to point at.
  const socialLinks = SOCIAL_LINKS.filter((item) => siteConfig.social[item.key]).map((item) => ({
    ...item,
    href: siteConfig.social[item.key],
  }));

  const breadcrumbs = customBreadcrumbs || generateBreadcrumbs(currentPath);
  const showBreadcrumbs = !hideBreadcrumbs && currentPath !== '/' && currentPath !== '/404' && breadcrumbs.length > 0;


  // Emitted whenever the page has a real trail, not only when this component
  // draws it. Service and industry pages render their own breadcrumb inside
  // the hero and pass hideBreadcrumbs, which previously stripped the
  // BreadcrumbList markup from 21 pages that visibly show a breadcrumb.
  const hasBreadcrumbTrail =
    currentPath !== '/' && currentPath !== '/404' && breadcrumbs.length > 0;

  const breadcrumbSchemaItem = hasBreadcrumbTrail
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': item.label,
          'item': absoluteUrl(item.url || currentPath),
        })),
      }
    : null;

  const schemas = [
    organizationGraph(currentPath),
    ...(Array.isArray(schema) ? schema : schema ? [schema] : []),
    breadcrumbSchemaItem,
  ].filter(Boolean);

  return (
    <>
      <Script id="gtm-loader" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WT6KXGHB');`}
      </Script>
      {schemas.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-WT6KXGHB"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>

      <header className="site-header">
        <div className="container nav-wrap">
          <a className="brand" href="/">
            <img
              width={256}
              height={256}
              src="/images/favicon.svg"
              alt="Digi Web Tech logo"
              className="brand-logo"
            />
          </a>
          <a className="mobile-header-cta" href="/contact">
            Get Free Consultant
          </a>
          <button
            className="menu-toggle"
            aria-label="Toggle navigation menu"
            aria-controls="topNav"
            aria-expanded="false"
          >
            Menu
          </button>
          <nav className="top-nav" id="topNav">
            <a className={activeClass(currentPath === '/')} href="/">
              Home
            </a>
            <a className={activeClass(currentPath === '/about')} href="/about">
              About Us
            </a>
            <div className={`nav-dropdown mega-menu-dropdown ${startsWithClass(currentPath, '/services')}`}>
              <a className={`nav-dropdown-toggle ${startsWithClass(currentPath, '/services')}`} href="/services">
                Services
              </a>
              <div className="mega-menu">
                <div className="mega-menu-grid">
                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                      <span>Digital Marketing</span>
                    </div>
                    <ul className="mega-menu-list">
                      <li><a className={activeClass(currentPath === '/services/seo-services')} href="/services/seo-services">SEO Services</a></li>
                      <li><a className={activeClass(currentPath === '/services/meta-ads-management-services')} href="/services/meta-ads-management-services">Meta Ads Management</a></li>
                      <li><a className={activeClass(currentPath === '/services/google-ads-services')} href="/services/google-ads-services">Google Ads</a></li>
                      <li><a className={activeClass(currentPath === '/services/content-marketing-services')} href="/services/content-marketing-services">Content Marketing</a></li>
                      <li><a className={activeClass(currentPath === '/services/geo-optimization-services')} href="/services/geo-optimization-services">GEO Optimization</a></li>
                      <li><a className={activeClass(currentPath === '/services/aio-optimization-services')} href="/services/aio-optimization-services">AIO Optimization</a></li>
                    </ul>
                  </div>
                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                      <span>Web Development</span>
                    </div>
                    <ul className="mega-menu-list">
                      <li><a className={activeClass(currentPath === '/services/website-development-services')} href="/services/website-development-services">Website Development</a></li>
                      <li><a className={activeClass(currentPath === '/services/website-design-services')} href="/services/website-design-services">Website Design</a></li>
                      <li><a className={activeClass(currentPath === '/services/shopify-development-services')} href="/services/shopify-development-services">Shopify Development</a></li>
                      <li><a className={activeClass(currentPath === '/services/wordpress-development-services')} href="/services/wordpress-development-services">WordPress Development</a></li>
                    </ul>
                  </div>
                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      <span>Growth & Automation</span>
                    </div>
                    <ul className="mega-menu-list">
                      <li><a className={activeClass(currentPath === '/services/email-marketing-automation-services')} href="/services/email-marketing-automation-services">Email Marketing</a></li>
                      <li><a className={activeClass(currentPath === '/services/conversion-rate-optimization-services')} href="/services/conversion-rate-optimization-services">CRO Services</a></li>
                      <li><a className={activeClass(currentPath === '/services/analytics-reporting-services')} href="/services/analytics-reporting-services">Analytics & Reporting</a></li>
                    </ul>
                  </div>
                  <div className="mega-menu-col">
                    <div className="mega-menu-heading">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span>Branding</span>
                    </div>
                    <ul className="mega-menu-list">
                      <li><a className={activeClass(currentPath === '/services/brand-strategy-services')} href="/services/brand-strategy-services">Brand Strategy</a></li>
                    </ul>
                    <div className="mega-menu-footer">
                      <a href="/services" className="all-services-link">
                        View All Services &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`nav-dropdown ${startsWithClass(currentPath, '/industries')}`}>
              <a className={`nav-dropdown-toggle ${startsWithClass(currentPath, '/industries')}`} href="/industries">
                Industries
              </a>
              <div className="nav-dropdown-menu">
                <a className={activeClass(currentPath === '/industries/health')} href="/industries/health">Healthcare</a>
                <a className={activeClass(currentPath === '/industries/education')} href="/industries/education">Education</a>
                <a className={activeClass(currentPath === '/industries/ecommerce')} href="/industries/ecommerce">Ecommerce</a>
                <a className={activeClass(currentPath === '/industries/real-estate')} href="/industries/real-estate">Real Estate</a>
                <a className={activeClass(currentPath === '/industries/technology')} href="/industries/technology">Technology & SaaS</a>
                <a className={activeClass(currentPath === '/industries/automotive')} href="/industries/automotive">Automotive</a>
              </div>
            </div>
            <a className={activeClass(currentPath === '/case-studies')} href="/case-studies">
              Case Studies
            </a>
            <a className={activeClass(currentPath === '/blog' || currentPath.startsWith('/blog/'))} href="/blog">
              Blog
            </a>
            <a className={activeClass(currentPath === '/pricing')} href="/pricing">
              Pricing
            </a>
            <a className={activeClass(currentPath === '/free-website-audit')} href="/free-website-audit">
              Free Audit
            </a>
            <a className={`btn btn-sm ${activeClass(currentPath === '/contact')}`} href="/contact">
              Contact Us
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {showBreadcrumbs && (
          <div className="site-breadcrumb-wrapper">
            <div className="container">
              <nav className="site-breadcrumbs" aria-label="Breadcrumb">
                {breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <Fragment key={index}>
                      {index > 0 && <span className="sep">/</span>}
                      {isLast ? (
                        <span className="current" aria-current="page">
                          {item.label}
                        </span>
                      ) : (
                        <a href={item.url}>
                          {index === 0 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                              <svg
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ marginRight: '4px', marginTop: '-2px' }}
                              >
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                              </svg>
                              {item.label}
                            </span>
                          ) : (
                            item.label
                          )}
                        </a>
                      )}
                    </Fragment>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
        {children}
      </main>

      <footer className="site-footer">
        <div className="container footer-top">
          <div className="footer-brand-block">
            <a className="brand" href="/">
              <img
                width={256}
                height={256}
                src="/images/favicon.svg"
                alt="Digi Web Tech logo"
                className="brand-logo"
              />
              <span style={{ color: '#fff', fontWeight: 800 }}>Digi Web Tech</span>
            </a>
            <p>
              We are a results-first digital agency empowering brands with technical SEO,
              performance marketing, and high-converting web experiences.
            </p>
            {socialLinks.length > 0 && (
              <div className="footer-socials">
                {socialLinks.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    aria-label={item.label}
                    title={item.label}
                    target="_blank"
                    rel="noopener noreferrer me"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={item.path} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="footer-col">
            <h2 className="footer-col-title">Company</h2>
            <a href="/about">About Us</a>
            <a href="/case-studies">Success Stories</a>
            <a href="/pricing">Pricing Plans</a>
            <a href="/contact">Contact</a>
          </div>

          <div className="footer-col">
            <h2 className="footer-col-title">Our Services</h2>
            <a href="/services/seo-services">SEO Consulting</a>
            <a href="/services/google-ads-services">PPC Management</a>
            <a href="/services/website-development-services">Web Development</a>
            <a href="/services/shopify-development-services">Shopify Solutions</a>
            <a href="/services/brand-strategy-services">Brand Strategy</a>
          </div>

          <div className="footer-col footer-contact-col">
            <h2 className="footer-col-title">Get in Touch</h2>
            <p>3rd Floor, A-303, Sector 5, Rajendra Nagar, Ghaziabad, Uttar Pradesh 201005</p>
            <p><a href="mailto:info@digiwebtech.co.in">info@digiwebtech.co.in</a></p>
            <p><a href="tel:+919871264699" className="footer-phone">+91 98712 64699</a></p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <p>&copy; 2026 Digi Web Tech. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms-of-service">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      <div className="mobile-sticky-bar">
        <a className="sticky-btn sticky-call" href="tel:+919871264699">Call Now</a>
        <a
          className="sticky-btn sticky-whatsapp"
          href="https://wa.me/919871264699?text=Hello%20Digi%20Web%20Tech%2C%20I%20need%20digital%20marketing%20services."
          target="_blank"
          rel="noopener"
        >
          WhatsApp
        </a>
      </div>

      {/* Versioned: /js/* is served with a one-year immutable cache header, so
          without a query string a script change would never reach a returning
          visitor. Bump this whenever main.js changes. */}
      <Script src="/js/main.js?v=1.0.6" strategy="afterInteractive" />
    </>
  );
}
