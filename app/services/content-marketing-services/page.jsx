import { renderMarketingPage } from '@/lib/marketing-pages';
import { routeMap } from '@/lib/site-routes';

const route = routeMap['/services/content-marketing-services'];

export const revalidate = 3600;

export const metadata = {
  title: route.metaTitle,
  description: route.metaDescription,
  alternates: {
    canonical: '/services/content-marketing-services',
  },
};

export default async function Page() {
  return renderMarketingPage('/services/content-marketing-services');
}
