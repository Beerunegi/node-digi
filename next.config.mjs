/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * A build and a dev server cannot share one output directory. A build
   * overwrites the dev server's webpack chunks, and the running dev server
   * then dies with "Cannot find module './NNNN.js'" from webpack-runtime.
   *
   * Setting NEXT_DIST_DIR points a build at a different folder, so a
   * verification build can run while "npm run dev" is live. See the
   * build:verify script in package.json.
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  serverExternalPackages: ['mysql2', 'ejs'],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        // Cache-busted via the ?v= query string in app/layout.jsx, so these
        // are safe to serve immutable instead of revalidating on every view.
        source: '/css/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/js/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
  async redirects() {
    return [
      {
        // Consolidated into /services/seo-services -- the two pages were
        // byte-identical duplicates competing for the same term.
        source: '/services/seo-services-sample',
        destination: '/services/seo-services',
        permanent: true,
      },
      {
        source: '/admin',
        destination: 'https://wp.digiwebtech.co.in/wp-admin',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: 'https://wp.digiwebtech.co.in/wp-admin/:path*',
        permanent: false,
      },
      {
        source: '/the-seo-waiting-game-why-patience-is-a-necessity-for-results',
        destination: '/',
        permanent: true,
      },
      {
        source: '/portfolio/trekker-essentials',
        destination: '/',
        permanent: true,
      },
      {
        source: '/author/seo-admin',
        destination: '/',
        permanent: true,
      },
      {
        source: '/social-media-marketing-smm',
        destination: '/',
        permanent: true,
      },
      {
        source: '/mobile-app-development-driving-force-behind-the-digital-transformation',
        destination: '/',
        permanent: true,
      },
      {
        source: '/video-marketing',
        destination: '/',
        permanent: true,
      },
      {
        source: '/freelancers-vs-agencies-vs-in-house-teams-finding-the-best-fit-for-your-website-needs',
        destination: '/',
        permanent: true,
      },
      {
        source: '/pay-per-click-ppc',
        destination: '/',
        permanent: true,
      },
      {
        source: '/what-is-the-benefits-of-hiring-a-web-development-company',
        destination: '/',
        permanent: true,
      },
      {
        source: '/organic-ranking-results-how-google-search-works',
        destination: '/',
        permanent: true,
      },
      {
        source: '/influencer-marketing',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ui-ux',
        destination: '/',
        permanent: true,
      },
      {
        source: '/affiliate-marketing',
        destination: '/',
        permanent: true,
      },
      {
        source: '/app-development-for-startups-turning-ideas-into-reality',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-content/:path*',
        destination: 'https://wp.digiwebtech.co.in/wp-content/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
