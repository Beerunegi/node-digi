import LegacyHtml from '@/components/LegacyHtml';
import SiteShell from '@/components/SiteShell';
import { renderLegacyView } from '@/lib/legacy-content';
import { routeMap } from '@/lib/site-routes';

const homeRoute = routeMap['/'];

export const revalidate = 3600;

export const metadata = {
  title: homeRoute.metaTitle,
  description: homeRoute.metaDescription,
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const html = await renderLegacyView({
    view: homeRoute.view,
    title: homeRoute.title,
    currentPath: '/',
  });

  return (
    <SiteShell currentPath="/">
      <LegacyHtml html={html} />
    </SiteShell>
  );
}
