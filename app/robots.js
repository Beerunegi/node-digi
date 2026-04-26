import { siteConfig } from '@/lib/site-config';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/home-sample', '/404', '/admin'],
    },
    sitemap: `${siteConfig.baseUrl}/sitemap.xml`,
  };
}
