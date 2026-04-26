import { renderMarketingPage } from '@/lib/marketing-pages';
import { routeMap } from '@/lib/site-routes';

const route = routeMap['/services/email-marketing-automation-services'];

export const revalidate = 3600;

export const metadata = {
  title: route.metaTitle,
  description: route.metaDescription,
  alternates: {
    canonical: '/services/email-marketing-automation-services',
  },
};

export default async function Page() {
  return renderMarketingPage('/services/email-marketing-automation-services');
}
