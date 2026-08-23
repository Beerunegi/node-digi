import { renderMarketingPage } from '@/lib/marketing-pages';
import { buildPageMetadata } from '@/lib/page-metadata';

export const revalidate = 3600;

export const metadata = buildPageMetadata('/about-wireframe');

export default async function Page() {
  return renderMarketingPage('/about-wireframe');
}
