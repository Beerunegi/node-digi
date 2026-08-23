import { renderMarketingPage } from '@/lib/marketing-pages';
import { buildPageMetadata } from '@/lib/page-metadata';

export const revalidate = 3600;

export const metadata = buildPageMetadata('/services/geo-optimization-services');

export default async function Page() {
  return renderMarketingPage('/services/geo-optimization-services');
}
