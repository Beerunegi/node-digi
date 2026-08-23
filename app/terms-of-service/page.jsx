import { renderMarketingPage } from '@/lib/marketing-pages';
import { buildPageMetadata } from '@/lib/page-metadata';

export const revalidate = 3600;

export const metadata = buildPageMetadata('/terms-of-service');

export default async function Page() {
  return renderMarketingPage('/terms-of-service');
}
