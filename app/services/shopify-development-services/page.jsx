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
};

export default async function Page() {
  return renderMarketingPage('/services/shopify-development-services');
}
