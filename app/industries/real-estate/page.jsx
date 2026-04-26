import { renderMarketingPage } from '@/lib/marketing-pages';
import { routeMap } from '@/lib/site-routes';

const route = routeMap['/industries/real-estate'];

export const revalidate = 3600;

export const metadata = {
  title: route.metaTitle,
  description: route.metaDescription,
  alternates: {
    canonical: '/industries/real-estate',
  },
};

export default async function Page() {
  return renderMarketingPage('/industries/real-estate');
}
