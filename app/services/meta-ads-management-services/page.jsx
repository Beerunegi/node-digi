import { renderMarketingPage } from '@/lib/marketing-pages';
import { routeMap } from '@/lib/site-routes';

const route = routeMap['/services/meta-ads-management-services'];

export const revalidate = 3600;

export const metadata = {
  title: route.metaTitle,
  description: route.metaDescription,
  alternates: {
    canonical: '/services/meta-ads-management-services',
  },
};

export default async function Page() {
  return renderMarketingPage('/services/meta-ads-management-services');
}
