import SiteShell from '@/components/SiteShell';

export const metadata = {
  title: '404 - Page Not Found | Digi Web Tech',
  description:
    'The page you are looking for does not exist. Explore our services or return home to grow your business.',
  // Without this the 404 inherits the root layout's `canonical: '/'`, telling
  // search engines every missing URL is the homepage.
  alternates: { canonical: null },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <SiteShell currentPath="/404">
      <section className="section-gap">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow">404</span>
          <h1>Page not found.</h1>
          <p>
            The page you are looking for does not exist. Explore our services or head
            back home.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <a href="/" className="btn">
              Return Home
            </a>
            <a href="/services" className="btn btn-secondary">
              View Services
            </a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
