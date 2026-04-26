import { renderMarketingPage } from '@/lib/marketing-pages';
import { routeMap } from '@/lib/site-routes';

const route = routeMap['/services/seo-services-sample'];

export const revalidate = 3600;

export const metadata = {
  title: route.metaTitle,
  description: route.metaDescription,
  alternates: {
    canonical: '/services/seo-services-sample',
  },
};

export default async function Page() {
  return renderMarketingPage('/services/seo-services-sample');
}
