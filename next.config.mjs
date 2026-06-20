/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
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
    ];
  },
};

export default nextConfig;
