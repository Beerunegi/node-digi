import { renderMarketingPage } from '@/lib/marketing-pages';
import { buildPageMetadata } from '@/lib/page-metadata';

export const revalidate = 3600;

export const metadata = buildPageMetadata('/privacy-policy');

export default async function Page() {
  return renderMarketingPage('/privacy-policy');
}
