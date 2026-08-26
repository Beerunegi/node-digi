import './globals.css';

import { siteConfig } from '@/lib/site-config';

/**
 * Runs synchronously in <head>, before anything paints.
 *
 * `.reveal` elements are only hidden once `js-reveal` is on <html>, so a
 * blocked or broken main.js can never leave the page body blank. Elements
 * already inside the viewport are revealed at DOMContentLoaded rather than
 * waiting for main.js -- IntersectionObserver does not fire in a hidden tab,
 * and an opacity-0 heading cannot be an LCP candidate.
 */
const REVEAL_BOOTSTRAP = `(function(){
  var doc = document, root = doc.documentElement;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.classList.add('js-reveal');
  function showInViewport() {
    var height = window.innerHeight || root.clientHeight || 0;
    var nodes = doc.querySelectorAll('.reveal:not(.show)');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].getBoundingClientRect().top < height) {
        nodes[i].classList.add('reveal-instant', 'show');
      }
    }
  }
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', showInViewport);
  } else {
    showInViewport();
  }
  // If main.js never takes over, stop hiding anything at all.
  setTimeout(function () {
    if (!window.__revealReady) root.classList.remove('js-reveal');
  }, 2500);
})();`;

export const metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/images/favicon.svg',
    shortcut: '/images/favicon.svg',
  },
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    url: '/',
    siteName: siteConfig.name,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: siteConfig.ogImage.url,
        width: siteConfig.ogImage.width,
        height: siteConfig.ogImage.height,
        type: siteConfig.ogImage.type,
        alt: siteConfig.defaultTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [siteConfig.ogImage.url],
  },
};

export default function RootLayout({ children }) {
  return (
    // The reveal bootstrap below adds a class to <html> before React hydrates,
    // which is exactly the case suppressHydrationWarning exists for.
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOTSTRAP }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        {/* Manrope was dropped: `body { font-family: Poppins }` later in
            style.css overrides it, so it rendered on zero elements while still
            costing four font downloads on every page. Sora and Poppins weights
            are trimmed to the ones the stylesheet actually declares. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/style.css?v=1.0.7" />
        {/* next-blog.css is loaded by the /blog and /admin layouts only -- it
            is 47KB of blog- and CMS-scoped rules that marketing pages never
            use, and it was previously render-blocking on every page. */}
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
