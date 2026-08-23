import { renderMarketingPage } from '@/lib/marketing-pages';
import { buildPageMetadata } from '@/lib/page-metadata';

export const revalidate = 3600;

export const metadata = buildPageMetadata('/services/aio-optimization-services');

export default async function Page() {
  return renderMarketingPage('/services/aio-optimization-services');
}
