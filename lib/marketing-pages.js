import { notFound } from 'next/navigation';

import LegacyHtml from '@/components/LegacyHtml';
import SiteShell from '@/components/SiteShell';
import { renderLegacyView } from '@/lib/legacy-content';
import {
  faqSchemaFromHtml,
  pricingSchema,
  serviceSchema,
  webPageSchema,
} from '@/lib/page-metadata';
import { routeMap } from '@/lib/site-routes';

function getMarketingRoute(pathname) {
  return routeMap[pathname];
}

export async function renderMarketingPage(pathname) {
  const route = getMarketingRoute(pathname);

  if (!route) {
    notFound();
  }

  const html = await renderLegacyView({
    view: route.view,
    title: route.title,
    currentPath: pathname,
  });

  const hasLocalBreadcrumbs = pathname.startsWith('/services/') || pathname.startsWith('/industries/');

  // Schema is derived from the rendered HTML rather than hand-maintained, so
  // the FAQ markup always matches the accordion actually on the page.
  const schema = [
    webPageSchema(pathname),
    serviceSchema(pathname),
    pathname === '/pricing' ? pricingSchema() : null,
    faqSchemaFromHtml(html),
  ].filter(Boolean);

  return (
    <SiteShell currentPath={pathname} hideBreadcrumbs={hasLocalBreadcrumbs} schema={schema}>
      <LegacyHtml html={html} />
    </SiteShell>
  );
}
