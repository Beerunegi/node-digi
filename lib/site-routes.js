import { siteConfig } from './site-config';

const brandMetaSuffix = siteConfig.name;

/**
 * Route table for every legacy-EJS marketing page.
 *
 * Fields:
 *  - `metaTitle` / `metaDescription`: must be unique per page. Titles are kept
 *    under ~60 characters so they do not truncate in SERPs; descriptions sit
 *    in the 120-158 character band.
 *  - `noindex`: staging/sample/utility pages that must stay crawlable (so the
 *    directive is seen) but out of the index. These are also excluded from
 *    the sitemap.
 *  - `service`: emits `Service` schema on service pages.
 *  - `serviceType` / `about`: entity hints for AI retrieval.
 */
export const routeMap = {
  '/': {
    view: 'home',
    title: 'Home',
    metaTitle: `Digital Marketing Agency in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Digi Web Tech is a digital marketing and web agency in Delhi NCR helping businesses grow with SEO, AIO, GEO, paid ads, website design, and development.',
  },
  '/home-sample': {
    view: 'home-sample',
    title: 'Home Sample',
    metaTitle: `Home Sample | ${brandMetaSuffix}`,
    metaDescription: 'Internal design sample page. Not part of the public site.',
    noindex: true,
  },
  '/about': {
    view: 'about',
    title: 'About Us',
    metaTitle: `About Digi Web Tech | Delhi NCR Digital Agency`,
    metaDescription:
      'Meet the team behind Digi Web Tech, a results-first digital agency in Delhi NCR delivering SEO, performance marketing, and web development since 2019.',
  },
  '/about-wireframe': {
    view: 'about-wireframe',
    title: 'About Wireframe',
    metaTitle: `About Wireframe | ${brandMetaSuffix}`,
    metaDescription: 'Internal design wireframe. Not part of the public site.',
    noindex: true,
  },
  '/services': {
    view: 'services',
    title: 'Services',
    metaTitle: `Digital Marketing & Web Services | ${brandMetaSuffix}`,
    metaDescription:
      'Explore complete digital marketing and web services including SEO, GEO, AIO, paid ads, automation, development, and brand strategy by Digi Web Tech.',
  },
  '/services/seo-services': {
    view: 'seo-services',
    title: 'SEO Services',
    metaTitle: `SEO Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Technical audits, on-page optimization, content, and link acquisition that move commercial keywords. SEO services for Delhi NCR and global brands.',
    service: 'SEO Services',
    serviceType: 'Search Engine Optimization',
  },
  '/services/aio-optimization-services': {
    view: 'aio-optimization-services',
    title: 'AIO Optimization Services',
    metaTitle: `AIO Optimization Services | AI Search | ${brandMetaSuffix}`,
    metaDescription:
      'Entity optimization, answer-first content, and schema built to earn visibility in Google AI Overviews and answer engines, not just classic rankings.',
    service: 'AIO Optimization Services',
    serviceType: 'AI Optimization',
  },
  '/services/geo-optimization-services': {
    view: 'geo-optimization-services',
    title: 'GEO Optimization Services',
    metaTitle: `Generative Engine Optimization (GEO) | ${brandMetaSuffix}`,
    metaDescription:
      'Get cited, recommended, and linked inside AI answers. GEO services for ChatGPT Search, Perplexity, Google AI Overviews, Gemini, and Copilot.',
    service: 'Generative Engine Optimization Services',
    serviceType: 'Generative Engine Optimization',
  },
  '/services/google-ads-services': {
    view: 'google-ads-services',
    title: 'Google Ads Services',
    metaTitle: `Google Ads Management in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Search, Shopping, Display, and YouTube campaigns managed for return on ad spend. Google Ads services with transparent reporting from Digi Web Tech.',
    service: 'Google Ads Management',
    serviceType: 'Pay Per Click Advertising',
  },
  '/services/website-development-services': {
    view: 'website-development-services',
    title: 'Website Development Services',
    metaTitle: `Website Development Services | ${brandMetaSuffix}`,
    metaDescription:
      'Custom websites and web applications built for speed, Core Web Vitals, and conversion. Full-stack development from Digi Web Tech in Delhi NCR.',
    service: 'Website Development Services',
    serviceType: 'Web Development',
  },
  '/services/website-design-services': {
    view: 'website-design-services',
    title: 'Website Design Services',
    metaTitle: `Website Design Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Conversion-focused UI/UX design, responsive layouts, and brand-led interfaces that turn website visitors into qualified enquiries.',
    service: 'Website Design Services',
    serviceType: 'Web Design',
  },
  '/services/shopify-development-services': {
    view: 'shopify-development-services',
    title: 'Shopify Development Services',
    metaTitle: `Shopify Development Services | ${brandMetaSuffix}`,
    metaDescription:
      'Shopify store builds, theme customization, app integration, and speed work for D2C brands that need their storefront to actually convert.',
    service: 'Shopify Development Services',
    serviceType: 'Ecommerce Development',
  },
  '/services/wordpress-development-services': {
    view: 'wordpress-development-services',
    title: 'WordPress Development Services',
    metaTitle: `WordPress Development Services | ${brandMetaSuffix}`,
    metaDescription:
      'Custom WordPress themes and plugins, WooCommerce builds, security hardening, and ongoing maintenance from an experienced Delhi NCR team.',
    service: 'WordPress Development Services',
    serviceType: 'WordPress Development',
  },
  '/services/meta-ads-management-services': {
    view: 'meta-ads-management-services',
    title: 'Meta Ads Management Services',
    metaTitle: `Meta Ads Management Services | ${brandMetaSuffix}`,
    metaDescription:
      'Facebook and Instagram advertising built around audience segmentation, creative testing, and funnel tracking that ties spend to revenue.',
    service: 'Meta Ads Management Services',
    serviceType: 'Social Media Advertising',
  },
  '/services/content-marketing-services': {
    view: 'content-marketing-services',
    title: 'Content Marketing Services',
    metaTitle: `Content Marketing Services | ${brandMetaSuffix}`,
    metaDescription:
      'Search-intent led content strategy, pillar articles, and conversion copy that earns rankings, AI citations, and qualified enquiries.',
    service: 'Content Marketing Services',
    serviceType: 'Content Marketing',
  },
  '/services/email-marketing-automation-services': {
    view: 'email-marketing-automation-services',
    title: 'Email Marketing & Automation Services',
    metaTitle: `Email Marketing & Automation | ${brandMetaSuffix}`,
    metaDescription:
      'Lifecycle drip campaigns, retention flows, list segmentation, and reporting that turns your existing audience into repeat revenue.',
    service: 'Email Marketing and Automation Services',
    serviceType: 'Email Marketing',
  },
  '/services/conversion-rate-optimization-services': {
    view: 'conversion-rate-optimization-services',
    title: 'Conversion Rate Optimization Services',
    metaTitle: `Conversion Rate Optimization (CRO) | ${brandMetaSuffix}`,
    metaDescription:
      'Landing page optimization, heatmap and session analysis, and structured A/B testing that lifts conversion rate on the traffic you already have.',
    service: 'Conversion Rate Optimization Services',
    serviceType: 'Conversion Rate Optimization',
  },
  '/services/analytics-reporting-services': {
    view: 'analytics-reporting-services',
    title: 'Analytics & Reporting Services',
    metaTitle: `Analytics & Reporting Services | ${brandMetaSuffix}`,
    metaDescription:
      'GA4 setup, server-side tracking, attribution modelling, and KPI dashboards so every marketing rupee can be traced to an outcome.',
    service: 'Analytics and Reporting Services',
    serviceType: 'Marketing Analytics',
  },
  '/services/brand-strategy-services': {
    view: 'brand-strategy-services',
    title: 'Brand Strategy Services',
    metaTitle: `Brand Strategy Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Positioning frameworks, messaging architecture, and visual identity that give your brand a clear reason to be chosen over the alternative.',
    service: 'Brand Strategy Services',
    serviceType: 'Brand Strategy',
  },
  '/industries': {
    view: 'industries',
    title: 'Industries',
    metaTitle: `Industry Digital Marketing Solutions | ${brandMetaSuffix}`,
    metaDescription:
      'Digital marketing and web solutions tailored for healthcare, education, ecommerce, real estate, technology, and automotive businesses.',
  },
  '/industries/health': {
    view: 'industry-health',
    title: 'Healthcare Marketing',
    metaTitle: `Healthcare Digital Marketing | ${brandMetaSuffix}`,
    metaDescription:
      'Patient acquisition for clinics, hospitals and specialists: medical SEO, Google Business Profile, and appointment-led websites built for local search.',
    about: 'Healthcare marketing',
  },
  '/industries/education': {
    view: 'industry-education',
    title: 'Education Marketing',
    metaTitle: `Education Sector Marketing | ${brandMetaSuffix}`,
    metaDescription:
      'Enrolment marketing for schools, colleges and EdTech: programme SEO, admissions landing pages, and enquiry flows timed to your intake calendar.',
    about: 'Education marketing',
  },
  '/industries/ecommerce': {
    view: 'industry-ecommerce',
    title: 'Ecommerce Growth',
    metaTitle: `Ecommerce Marketing & Development | ${brandMetaSuffix}`,
    metaDescription:
      'Ecommerce marketing for D2C brands and online stores, focused on conversion rate, acquisition cost and repeat purchase rather than raw traffic.',
    about: 'Ecommerce marketing',
  },
  '/industries/real-estate': {
    view: 'industry-real-estate',
    title: 'Real Estate Marketing',
    metaTitle: `Real Estate Digital Marketing | ${brandMetaSuffix}`,
    metaDescription:
      'Real estate marketing for developers and brokers: locality SEO, RERA-compliant project pages, and qualified enquiries your sales team will actually call.',
    about: 'Real estate marketing',
  },
  '/industries/technology': {
    view: 'industry-technology',
    title: 'Technology & SaaS Marketing',
    metaTitle: `Technology & SaaS Marketing | ${brandMetaSuffix}`,
    metaDescription:
      'SaaS and technology marketing: category and comparison SEO, demo funnels that qualify, and reporting that follows revenue rather than demo count.',
    about: 'Technology and SaaS marketing',
  },
  '/industries/automotive': {
    view: 'industry-automotive',
    title: 'Automotive Marketing',
    metaTitle: `Automotive Digital Marketing | ${brandMetaSuffix}`,
    metaDescription:
      'Automotive marketing for dealerships and workshops: local model search, test drive enquiries, and service retention that keeps the workshop full.',
    about: 'Automotive marketing',
  },
  '/case-studies': {
    view: 'case-studies',
    title: 'Case Studies',
    metaTitle: `Digital Marketing Case Studies | ${brandMetaSuffix}`,
    metaDescription:
      'Read real client success stories and measurable SEO and AIO growth results delivered by Digi Web Tech for brands in Delhi NCR and abroad.',
  },
  '/case-studies/the-dental-port': {
    view: 'case-study-dental-port',
    title: 'The Dental Port Case Study | Dental Marketing',
    metaTitle: `The Dental Port Case Study | ${brandMetaSuffix}`,
    metaDescription:
      "How Digi Web Tech grew The Dental Port's organic traffic 30% and won page 1 rankings for its key local dental search terms.",
  },
  '/case-studies/krisshna-dental': {
    view: 'case-study-krisshna-dental',
    title: 'Krisshna Dental Case Study | Dental SEO',
    metaTitle: `Krisshna Dental Case Study | ${brandMetaSuffix}`,
    metaDescription:
      "How Krisshna Dental reached 10 top-10 keyword rankings in 3 months and a 30% traffic increase over 6 months with Digi Web Tech.",
  },
  '/case-studies/eco-luxe-decor': {
    view: 'case-study-eco-luxe-decor',
    title: 'Eco Luxe Decor Case Study | Shopify SEO',
    metaTitle: `Eco Luxe Decor Case Study | ${brandMetaSuffix}`,
    metaDescription:
      'How Digi Web Tech scaled Eco Luxe Decor from zero to $3,000 in monthly sales through Shopify optimization and international SEO.',
  },
  '/case-studies/ankur-pharma': {
    view: 'case-study-ankur-pharma',
    title: 'Ankur Pharmaceuticals Case Study | Pharma SEO',
    metaTitle: `Ankur Pharmaceuticals Case Study | ${brandMetaSuffix}`,
    metaDescription:
      'How Ankur Pharmaceuticals scaled from zero to 90,000 in sales volume through a WooCommerce rebuild and international SEO.',
  },
  '/pricing': {
    view: 'pricing',
    title: 'Pricing',
    metaTitle: `Digital Marketing Pricing Plans | ${brandMetaSuffix}`,
    metaDescription:
      'Transparent monthly pricing for SEO, AIO, GEO, paid media, and web development, with clear deliverables at every tier.',
  },
  '/free-website-audit': {
    view: 'free-website-audit',
    title: 'Free Website Audit',
    metaTitle: `Free SEO, AIO & GEO Website Audit | ${brandMetaSuffix}`,
    metaDescription:
      'Request a free website audit covering technical SEO, AI search readiness, and generative engine citation performance. No obligation.',
  },
  '/contact': {
    view: 'contact',
    title: 'Contact Us',
    metaTitle: `Contact Digi Web Tech | Delhi NCR`,
    metaDescription:
      'Talk to Digi Web Tech about SEO, AIO, GEO, paid ads, website design, and development. Call +91 88512 50846 or send us your project brief.',
  },
  '/thank-you': {
    view: 'thank-you',
    title: 'Thank You!',
    metaTitle: `Thank You | ${brandMetaSuffix}`,
    metaDescription: 'We have received your enquiry and will get back to you shortly.',
    noindex: true,
  },
  '/privacy-policy': {
    view: 'privacy-policy',
    title: 'Privacy Policy',
    metaTitle: `Privacy Policy | ${brandMetaSuffix}`,
    metaDescription:
      'How Digi Web Tech collects, uses, stores, and protects the personal information you share with us.',
  },
  '/terms-of-service': {
    view: 'terms-of-service',
    title: 'Terms of Service',
    metaTitle: `Terms of Service | ${brandMetaSuffix}`,
    metaDescription:
      'The terms that govern your use of the Digi Web Tech website and the services we provide.',
  },
};

export const staticMarketingPaths = Object.keys(routeMap);

/** Paths that belong in sitemap.xml -- public, indexable pages only. */
export const indexableMarketingPaths = staticMarketingPaths.filter(
  (pathname) => !routeMap[pathname].noindex,
);
