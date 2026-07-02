import { renderMarketingPage } from '@/lib/marketing-pages';
import { routeMap } from '@/lib/site-routes';

const route = routeMap['/services/aio-optimization-services'];

export const revalidate = 3600;
export const metadata = {
  title: route.metaTitle,
  description: route.metaDescription,
  alternates: {
    canonical: '/services/aio-optimization-services',
  },
  openGraph: {
    title: route.metaTitle,
    description: 'AIO optimization services from Digi Web Tech — entity clarity, answer-ready content, and schema structuring so your service pages perform in AI-driven search, not just traditional SERPs.',
    url: '/services/aio-optimization-services',
    siteName: 'Digi Web Tech',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/images/services/aio-og.png',
        width: 1200,
        height: 630,
        alt: route.metaTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: route.metaTitle,
    description: 'AIO optimization services from Digi Web Tech — entity clarity, answer-ready content, and schema structuring so your service pages perform in AI-driven search, not just traditional SERPs.',
    images: ['/images/services/aio-og.png'],
  },
};
export default async function Page() {
  return renderMarketingPage('/services/aio-optimization-services');
}
