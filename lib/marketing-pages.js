import { notFound } from 'next/navigation';

import LegacyHtml from '@/components/LegacyHtml';
import SiteShell from '@/components/SiteShell';
import { renderLegacyView } from '@/lib/legacy-content';
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

  return (
    <SiteShell currentPath={pathname}>
      <LegacyHtml html={html} />
    </SiteShell>
  );
}
