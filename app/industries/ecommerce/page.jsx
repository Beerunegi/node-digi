import { renderMarketingPage } from '@/lib/marketing-pages';
import { routeMap } from '@/lib/site-routes';

const route = routeMap['/industries/ecommerce'];

export const revalidate = 3600;

export const metadata = {
  title: route.metaTitle,
  description: route.metaDescription,
  alternates: {
    canonical: '/industries/ecommerce',
  },
  openGraph: {
    title: route.metaTitle,
    description: route.metaDescription,
    url: '/industries/ecommerce',
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
  return renderMarketingPage('/industries/ecommerce');
}
