import Script from 'next/script';

import { siteConfig } from '@/lib/site-config';

function activeClass(condition) {
  return condition ? 'active' : '';
}

function startsWithClass(currentPath, prefix) {
  return currentPath.startsWith(prefix) ? 'active' : '';
}

function homeSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.baseUrl}/#organization`,
        name: siteConfig.name,
        url: `${siteConfig.baseUrl}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.baseUrl}/images/favicon.svg`,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-9871264699',
          contactType: 'customer service',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi'],
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${siteConfig.baseUrl}/#localbusiness`,
        name: siteConfig.name,
        url: `${siteConfig.baseUrl}/`,
        image: `${siteConfig.baseUrl}/images/favicon.svg`,
        telephone: '+91-9871264699',
        priceRange: '₹₹',
        address: {
          '@type': 'PostalAddress',
          ...siteConfig.address,
        },
      },
    ],
  };
}

export default function SiteShell({ children, currentPath, schema }) {
  const schemas = [
    currentPath === '/' ? homeSchema() : null,
    ...(Array.isArray(schema) ? schema : schema ? [schema] : []),
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
              src="/images/favicon.svg"
              alt="Digi Web Tech logo | Top Digital Marketing Agency in Delhi NCR"
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
            <a className={`btn btn-sm ${activeClass(currentPath === '/contact')}`} href="/contact">
              Start a Project
            </a>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container footer-top">
          <div className="footer-brand-block">
            <a className="brand" href="/">
              <img
                src="/images/favicon.svg"
                alt="Digi Web Tech logo | Top Digital Marketing Agency in Delhi NCR"
                className="brand-logo"
              />
              <span style={{ color: '#fff', fontWeight: 800 }}>Digi Web Tech</span>
            </a>
            <p>
              We are a results-first digital agency empowering brands with technical SEO,
              performance marketing, and high-converting web experiences.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 9H16V6h-2.5C11.57 6 10 7.57 10 9.5V12H8v3h2v6h3v-6h2.2l.8-3H13V9.5c0-.28.22-.5.5-.5z" /></svg></a>
              <a href="#" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.75 6.5a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z" /></svg></a>
              <a href="#" aria-label="LinkedIn" title="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 8.5a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88zM5.5 9.75h2.88V18H5.5zm4.63 0h2.76v1.12h.04a3 3 0 0 1 2.7-1.48c2.88 0 3.41 1.9 3.41 4.37V18h-2.88v-3.77c0-.9-.02-2.06-1.26-2.06s-1.45.98-1.45 1.99V18h-2.88z" /></svg></a>
              <a href="#" aria-label="Twitter" title="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="/about">About Us</a>
            <a href="/case-studies">Success Stories</a>
            <a href="/pricing">Pricing Plans</a>
            <a href="/contact">Contact</a>
          </div>

          <div className="footer-col">
            <h4>Our Services</h4>
            <a href="/services/seo-services">SEO Consulting</a>
            <a href="/services/google-ads-services">PPC Management</a>
            <a href="/services/website-development-services">Web Development</a>
            <a href="/services/shopify-development-services">Shopify Solutions</a>
            <a href="/services/brand-strategy-services">Brand Strategy</a>
          </div>

          <div className="footer-col footer-contact-col">
            <h4>Get in Touch</h4>
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

      <Script src="/js/main.js" strategy="afterInteractive" />
    </>
  );
}
