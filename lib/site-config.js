export const siteConfig = {
  name: 'Digi Web Tech',
  legalName: 'Digi Web Tech',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://digiwebtech.co.in',
  defaultTitle: 'Digi Web Tech',
  defaultDescription:
    'Digi Web Tech is a top Digital marketing and Web Agency in Delhi NCR offering SEO, AIO, GEO, Google Ads, social media, website design, website development, and growth-focused digital services.',
  phone: '+91 98712 34699',
  phoneE164: '+919871234699',
  email: 'info@digiwebtech.co.in',
  foundingDate: '2019',
  address: {
    streetAddress: '3rd Floor, A-303, Sector 5, Rajendra Nagar',
    addressLocality: 'Ghaziabad',
    addressRegion: 'Uttar Pradesh',
    postalCode: '201005',
    addressCountry: 'IN',
  },
  geo: {
    latitude: 28.6692,
    longitude: 77.4538,
  },
  /**
   * Social and third-party profile URLs.
   *
   * These drive both the footer icons and the `sameAs` array in the
   * Organization schema. `sameAs` is the strongest signal an AI search system
   * has for resolving "Digi Web Tech" to a real, verifiable entity, so filling
   * these in is high-value. Entries left empty are skipped everywhere -- no
   * dead `href="#"` links are rendered.
   */
  social: {
    facebook: 'https://www.facebook.com/digiwebtech.co.in/',
    instagram: 'https://www.instagram.com/digiwebtech/',
    linkedin: 'https://www.linkedin.com/company/digiwebtech/',
    twitter: 'https://x.com/digiwebtech',
    youtube: 'https://www.youtube.com/@digiwebtech',
    googleBusinessProfile: '',
    clutch: '',
  },
  /** 1200x630 raster. SVG is rejected as og:image by every major platform. */
  ogImage: {
    url: '/images/og-default.png',
    width: 1200,
    height: 630,
    type: 'image/png',
  },
};

export function absoluteUrl(pathname = '/') {
  return new URL(pathname, siteConfig.baseUrl).toString();
}

/** Non-empty social profile URLs, for schema.org `sameAs`. */
export function socialProfiles() {
  return Object.values(siteConfig.social).filter(Boolean);
}
