import { renderMarketingPage } from '@/lib/marketing-pages';
import { routeMap } from '@/lib/site-routes';

const route = routeMap['/services/shopify-development-services'];

export const revalidate = 3600;

export const metadata = {
  title: route.metaTitle,
  description: route.metaDescription,
  alternates: {
    canonical: '/services/shopify-development-services',
  },
  openGraph: {
    title: route.metaTitle,
    description: route.metaDescription,
    url: '/services/shopify-development-services',
    siteName: 'Digi Web Tech',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/images/logo.svg',
        width: 1200,
        height: 630,
        alt: route.metaTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: route.metaTitle,
    description: route.metaDescription,
    images: ['/images/logo.svg'],
  },
};

export default async function Page() {
  return renderMarketingPage('/services/shopify-development-services');
}
