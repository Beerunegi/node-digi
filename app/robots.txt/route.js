import { siteConfig } from '@/lib/site-config';
import { routeMap } from '@/lib/site-routes';

/**
 * Hand-built as a route handler rather than the `robots.js` metadata export so
 * the file can advertise `/llms.txt`, which the metadata API cannot express.
 *
 * Indexation strategy: `Disallow` stops crawling, it does not deindex. Staging
 * pages are left crawlable for the default agent and carry a `noindex` robots
 * meta tag instead (see `routeMap[...].noindex`) -- a URL blocked in robots.txt
 * can still be indexed, just without a snippet.
 *
 * AI crawlers are named explicitly. An explicit `Allow` is the conventional
 * signal that generative engines may retrieve and cite this content, and
 * `llms.txt` gives them a curated map of the site.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
];

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  const noindexPaths = Object.keys(routeMap).filter((path) => routeMap[path].noindex);

  const lines = [
    '# Digi Web Tech',
    '# Curated site map for AI and LLM agents: /llms.txt',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
  ];

  for (const agent of AI_CRAWLERS) {
    lines.push(`User-agent: ${agent}`);
    lines.push('Allow: /');
    lines.push('Disallow: /admin');
    lines.push('Disallow: /api/');
    for (const path of noindexPaths) {
      lines.push(`Disallow: ${path}`);
    }
    lines.push('');
  }

  lines.push(`Sitemap: ${siteConfig.baseUrl}/sitemap.xml`);
  lines.push(`Host: ${siteConfig.baseUrl}`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
}
