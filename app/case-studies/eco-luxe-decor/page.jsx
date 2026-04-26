import { renderMarketingPage } from '@/lib/marketing-pages';
import { routeMap } from '@/lib/site-routes';

const route = routeMap['/case-studies/eco-luxe-decor'];

export const revalidate = 3600;

export const metadata = {
  title: route.metaTitle,
  description: route.metaDescription,
  alternates: {
    canonical: '/case-studies/eco-luxe-decor',
  },
};

export default async function Page() {
  return renderMarketingPage('/case-studies/eco-luxe-decor');
}
