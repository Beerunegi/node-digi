/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/wp-blog/wp-admin',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: '/wp-blog/wp-admin/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
