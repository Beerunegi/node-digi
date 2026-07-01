/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  serverExternalPackages: ['mysql2'],
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
  async redirects() {
    return [
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
