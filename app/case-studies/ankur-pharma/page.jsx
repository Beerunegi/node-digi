import { renderMarketingPage } from '@/lib/marketing-pages';
import { routeMap } from '@/lib/site-routes';

const route = routeMap['/case-studies/ankur-pharma'];

export const revalidate = 3600;

export const metadata = {
  title: route.metaTitle,
  description: route.metaDescription,
  alternates: {
    canonical: '/case-studies/ankur-pharma',
  },
  openGraph: {
    title: route.metaTitle,
    description: route.metaDescription,
    url: '/case-studies/ankur-pharma',
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
  return renderMarketingPage('/case-studies/ankur-pharma');
}
