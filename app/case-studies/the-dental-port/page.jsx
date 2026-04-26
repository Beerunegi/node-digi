import { renderMarketingPage } from '@/lib/marketing-pages';
import { routeMap } from '@/lib/site-routes';

const route = routeMap['/case-studies/the-dental-port'];

export const revalidate = 3600;

export const metadata = {
  title: route.metaTitle,
  description: route.metaDescription,
  alternates: {
    canonical: '/case-studies/the-dental-port',
  },
};

export default async function Page() {
  return renderMarketingPage('/case-studies/the-dental-port');
}
