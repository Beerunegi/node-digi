import { siteConfig } from './site-config';

const brandMetaSuffix = siteConfig.name;

export const routeMap = {
  '/': {
    view: 'home',
    title: 'Home',
    metaTitle: `Top Digital Marketing Agency in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Digi Web Tech is a top Digital marketing and Web Agency in Delhi NCR helping businesses grow with SEO, AIO, GEO, paid ads, website design, and development services.',
  },
  '/home-sample': {
    view: 'home-sample',
    title: 'Home Sample',
    metaTitle: `Home Sample | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/about': {
    view: 'about',
    title: 'About Us',
    metaTitle: `About Digi Web Tech | ${brandMetaSuffix}`,
    metaDescription:
      'Learn more about Digi Web Tech, a results-first digital marketing and web agency serving brands in Delhi NCR with SEO, performance marketing, and development expertise.',
  },
  '/about-wireframe': {
    view: 'about-wireframe',
    title: 'About Wireframe',
    metaTitle: `About Wireframe | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services': {
    view: 'services',
    title: 'Services',
    metaTitle: `SEO, AIO & Web Development Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Explore complete digital marketing and web services including SEO, GEO, AIO, ads, automation, development, and strategy by Digi Web Tech in Delhi NCR.',
  },
  '/services/seo-services': {
    view: 'seo-services',
    title: 'SEO Services',
    metaTitle: `Expert SEO Search Optimization Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/seo-services-sample': {
    view: 'seo-services-sample',
    title: 'SEO Services Sample',
    metaTitle: `SEO Services Sample Page in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Preview a sample SEO services page concept for Digi Web Tech, adapted to the current site theme with a premium long-form layout.',
  },
  '/services/aio-optimization-services': {
    view: 'aio-optimization-services',
    title: 'AIO Optimization Services',
    metaTitle: `AIO Optimization Agency in Delhi NCR | AI Search Ranking | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/geo-optimization-services': {
    view: 'geo-optimization-services',
    title: 'GEO Optimization Services',
    metaTitle: `GEO Target Marketing & Optimization Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/google-ads-services': {
    view: 'google-ads-services',
    title: 'Google Ads Services',
    metaTitle: `Google Ads Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/website-development-services': {
    view: 'website-development-services',
    title: 'Website Development Services',
    metaTitle: `Custom Website Development Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/website-design-services': {
    view: 'website-design-services',
    title: 'Website Design Services',
    metaTitle: `Website Design Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/shopify-development-services': {
    view: 'shopify-development-services',
    title: 'Shopify Development Services',
    metaTitle: `Shopify Development Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/wordpress-development-services': {
    view: 'wordpress-development-services',
    title: 'WordPress Development Services',
    metaTitle: `WordPress Development Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/meta-ads-management-services': {
    view: 'meta-ads-management-services',
    title: 'Meta Ads Management Services',
    metaTitle: `Meta Ads Management Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/content-marketing-services': {
    view: 'content-marketing-services',
    title: 'Content Marketing Services',
    metaTitle: `Content Marketing Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/email-marketing-automation-services': {
    view: 'email-marketing-automation-services',
    title: 'Email Marketing & Automation Services',
    metaTitle: `Email Marketing Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/conversion-rate-optimization-services': {
    view: 'conversion-rate-optimization-services',
    title: 'Conversion Rate Optimization Services',
    metaTitle: `CRO Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/analytics-reporting-services': {
    view: 'analytics-reporting-services',
    title: 'Analytics & Reporting Services',
    metaTitle: `Analytics and Reporting Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/services/brand-strategy-services': {
    view: 'brand-strategy-services',
    title: 'Brand Strategy Services',
    metaTitle: `Brand Strategy Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription: siteConfig.defaultDescription,
  },
  '/industries': {
    view: 'industries',
    title: 'Industries',
    metaTitle: `Industry Specific Digital Marketing Solutions in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Explore specialized digital marketing and web solutions tailored for healthcare, education, ecommerce, real estate, technology, and automotive sectors by Digi Web Tech.',
  },
  '/industries/health': {
    view: 'industry-health',
    title: 'Healthcare Marketing',
    metaTitle: `Healthcare Digital Marketing Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Specialized digital marketing for health clinics, hospitals, and wellness brands including patient acquisition and medical SEO.',
  },
  '/industries/education': {
    view: 'industry-education',
    title: 'Education Marketing',
    metaTitle: `Education Sector Marketing Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Strategic growth marketing for schools, universities, and EdTech platforms focusing on student enrollment and brand authority.',
  },
  '/industries/ecommerce': {
    view: 'industry-ecommerce',
    title: 'Ecommerce Growth',
    metaTitle: `Ecommerce Marketing & Development Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'End-to-end growth solutions for online stores, including Shopify mastery, D2C performance ads, and conversion optimization.',
  },
  '/industries/real-estate': {
    view: 'industry-real-estate',
    title: 'Real Estate Marketing',
    metaTitle: `Real Estate Digital Marketing Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Lead generation and digital branding for real estate developers, property portals, and local agents.',
  },
  '/industries/technology': {
    view: 'industry-technology',
    title: 'Technology & SaaS Marketing',
    metaTitle: `Technology Sector Marketing Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Growth hacking and performance marketing for SaaS, software houses, and tech startups looking to scale globally.',
  },
  '/industries/automotive': {
    view: 'industry-automotive',
    title: 'Automotive Marketing',
    metaTitle: `Automotive Digital Marketing Services in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Comprehensive digital marketing for car dealerships, auto parts brands, and automotive service centers.',
  },
  '/case-studies': {
    view: 'case-studies',
    title: 'Case Studies',
    metaTitle: `Digital Marketing Case Studies in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Read real client success stories and measurable SEO/AIO growth results delivered by Digi Web Tech, a top Digital Marketing Agency in Delhi NCR.',
  },
  '/case-studies/the-dental-port': {
    view: 'case-study-dental-port',
    title: 'The Dental Port Case Study | Dental Marketing',
    metaTitle: `The Dental Port Case Study - 30% Growth in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      "Read how Digi Web Tech transformed The Dental Port's digital presence, resulting in 30% organic traffic growth and page 1 rankings for key local search terms.",
  },
  '/case-studies/krisshna-dental': {
    view: 'case-study-krisshna-dental',
    title: 'Krisshna Dental Case Study | Dental SEO',
    metaTitle: `Krisshna Dental Case Study - Top rankings in 3 Months | ${brandMetaSuffix}`,
    metaDescription:
      "Read how Digi Web Tech transformed Krisshna Dental's digital presence, resulting in 10 keywords in the top 10 in 3 months and a 30% traffic increase in 6 months.",
  },
  '/case-studies/eco-luxe-decor': {
    view: 'case-study-eco-luxe-decor',
    title: 'Eco Luxe Decor Case Study | Shopify SEO',
    metaTitle: `Eco Luxe Decor Case Study - 0 to $3,000 Sales in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Read how Digi Web Tech scaled Eco Luxe Decor from zero to $3,000 in monthly sales through Shopify optimization and International SEO.',
  },
  '/case-studies/ankur-pharma': {
    view: 'case-study-ankur-pharma',
    title: 'Ankur Pharmaceuticals Case Study | Pharma SEO',
    metaTitle: `Ankur Pharmaceuticals Case Study - 0 to 90,000 Sales | ${brandMetaSuffix}`,
    metaDescription:
      "Read how Digi Web Tech transformed Ankur Pharmaceuticals' digital presence, scaling from zero to 90,000 in sales volume through WordPress/WooCommerce and International SEO.",
  },
  '/pricing': {
    view: 'pricing',
    title: 'Pricing',
    metaTitle: `Digital Marketing Pricing Plans in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'View affordable digital marketing, SEO, AIO, and web service pricing plans from Digi Web Tech, a top Digital Marketing Agency in Delhi NCR.',
  },
  '/contact': {
    view: 'contact',
    title: 'Contact Us',
    metaTitle: `Contact Top Digital Marketing Agency in Delhi NCR | ${brandMetaSuffix}`,
    metaDescription:
      'Contact Digi Web Tech in Delhi NCR for SEO, AIO, GEO, ads, social media, website design, and web development services for your business growth.',
  },
  '/thank-you': {
    view: 'thank-you',
    title: 'Thank You!',
    metaTitle: `Thank You for Your Interest | ${brandMetaSuffix}`,
    metaDescription:
      'We have received your enquiry and our team will get back to you shortly. Thank you for choosing Digi Web Tech.',
  },
  '/privacy-policy': {
    view: 'privacy-policy',
    title: 'Privacy Policy',
    metaTitle: `Privacy Policy | ${brandMetaSuffix}`,
    metaDescription:
      'Read the Privacy Policy of Digi Web Tech to understand how we collect, use, and protect your personal information.',
  },
  '/terms-of-service': {
    view: 'terms-of-service',
    title: 'Terms of Service',
    metaTitle: `Terms of Service | ${brandMetaSuffix}`,
    metaDescription: 'Read the Terms of Service for using Digi Web Tech website and services.',
  },
};

export const staticMarketingPaths = Object.keys(routeMap);
