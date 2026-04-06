const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const compression = require('compression');

const app = express();
app.use(compression());

const defaultMetaDescription =
  'Digi Web Tech is a top Digital marketing and Web Agency in Delhi NCR offering SEO, AIO, GEO, Google Ads, social media, website design, website development, and growth-focused digital services.';

const brandMetaSuffix = 'Digi Web Tech';

function renderPage(res, view, title, metaTitle, metaDescription) {
  res.render(view, {
    title,
    layout: 'layout',
    metaTitle,
    metaDescription: metaDescription || defaultMetaDescription
  });
}

// EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Static files with 1 year cache configuration for better browser memory usage
app.use(express.static('public', { maxAge: '1y' }));

// Current path for active menu link
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Routes
app.get('/', (req, res) => {
  renderPage(
    res,
    'home',
    'Home',
    `Best SEO, AIO & Digital Marketing Company in Delhi NCR | ${brandMetaSuffix}`,
    'Digi Web Tech is a top Digital marketing and Web Agency in Delhi NCR helping businesses grow with SEO, AIO, GEO, paid ads, website design, and development services.'
  );
});

app.get('/home-sample', (req, res) => {
  renderPage(
    res,
    'home-sample',
    'Home Sample',
    `Modern Digital Marketing Website Sample in Delhi NCR | ${brandMetaSuffix}`,
    'Explore an alternative premium homepage concept for Digi Web Tech featuring a modern SaaS-style layout, trust signals, and SEO/AIO focused sections.'
  );
});
app.get('/about', (req, res) => {
  renderPage(
    res,
    'about',
    'About Us',
    `About Our Digital Marketing Agency in Delhi NCR | ${brandMetaSuffix}`,
    'Learn about Digi Web Tech, a top Digital marketing and Web Agency in Delhi NCR delivering performance-driven SEO, AIO, and web solutions.'
  );
});

app.get('/services', (req, res) => {
  renderPage(
    res,
    'services',
    'Services',
    `SEO, AIO & Web Development Services in Delhi NCR | ${brandMetaSuffix}`,
    'Explore complete digital marketing and web services including SEO, GEO, AIO, ads, automation, development, and strategy by Digi Web Tech in Delhi NCR.'
  );
});

app.get('/services/seo-services', (req, res) => {
  renderPage(res, 'seo-services', 'SEO Services', `Expert SEO Search Optimization Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/seo-services-sample', (req, res) => {
  renderPage(
    res,
    'seo-services-sample',
    'SEO Services Sample',
    `SEO Services Sample Page in Delhi NCR | ${brandMetaSuffix}`,
    'Preview a sample SEO services page concept for Digi Web Tech, adapted to the current site theme with a premium long-form layout.'
  );
});

app.get('/services/aio-optimization-services', (req, res) => {
  renderPage(res, 'aio-optimization-services', 'AIO Optimization Services', `AIO Optimization Agency in Delhi NCR | AI Search Ranking | ${brandMetaSuffix}`);
});

app.get('/services/geo-optimization-services', (req, res) => {
  renderPage(res, 'geo-optimization-services', 'GEO Optimization Services', `GEO Target Marketing & Optimization Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/google-ads-services', (req, res) => {
  renderPage(res, 'google-ads-services', 'Google Ads Services', `Google Ads Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/website-development-services', (req, res) => {
  renderPage(res, 'website-development-services', 'Website Development Services', `Custom Website Development Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/website-design-services', (req, res) => {
  renderPage(res, 'website-design-services', 'Website Design Services', `Website Design Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/shopify-development-services', (req, res) => {
  renderPage(res, 'shopify-development-services', 'Shopify Development Services', `Shopify Development Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/wordpress-development-services', (req, res) => {
  renderPage(res, 'wordpress-development-services', 'WordPress Development Services', `WordPress Development Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/meta-ads-management-services', (req, res) => {
  renderPage(res, 'meta-ads-management-services', 'Meta Ads Management Services', `Meta Ads Management Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/content-marketing-services', (req, res) => {
  renderPage(res, 'content-marketing-services', 'Content Marketing Services', `Content Marketing Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/email-marketing-automation-services', (req, res) => {
  renderPage(res, 'email-marketing-automation-services', 'Email Marketing & Automation Services', `Email Marketing Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/conversion-rate-optimization-services', (req, res) => {
  renderPage(res, 'conversion-rate-optimization-services', 'Conversion Rate Optimization Services', `CRO Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/analytics-reporting-services', (req, res) => {
  renderPage(res, 'analytics-reporting-services', 'Analytics & Reporting Services', `Analytics and Reporting Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/services/brand-strategy-services', (req, res) => {
  renderPage(res, 'brand-strategy-services', 'Brand Strategy Services', `Brand Strategy Services in Delhi NCR | ${brandMetaSuffix}`);
});

app.get('/industries', (req, res) => {
  renderPage(
    res,
    'industries',
    'Industries',
    `Industry Specific Digital Marketing Solutions in Delhi NCR | ${brandMetaSuffix}`,
    'Explore specialized digital marketing and web solutions tailored for healthcare, education, ecommerce, real estate, technology, and automotive sectors by Digi Web Tech.'
  );
});

app.get('/industries/health', (req, res) => {
  renderPage(res, 'industry-health', 'Healthcare Marketing', `Healthcare Digital Marketing Services in Delhi NCR | ${brandMetaSuffix}`, 'Specialized digital marketing for health clinics, hospitals, and wellness brands including patient acquisition and medical SEO.');
});

app.get('/industries/education', (req, res) => {
  renderPage(res, 'industry-education', 'Education Marketing', `Education Sector Marketing Services in Delhi NCR | ${brandMetaSuffix}`, 'Strategic growth marketing for schools, universities, and EdTech platforms focusing on student enrollment and brand authority.');
});

app.get('/industries/ecommerce', (req, res) => {
  renderPage(res, 'industry-ecommerce', 'Ecommerce Growth', `Ecommerce Marketing & Development Services in Delhi NCR | ${brandMetaSuffix}`, 'End-to-end growth solutions for online stores, including Shopify mastery, D2C performance ads, and conversion optimization.');
});

app.get('/industries/real-estate', (req, res) => {
  renderPage(res, 'industry-real-estate', 'Real Estate Marketing', `Real Estate Digital Marketing Services in Delhi NCR | ${brandMetaSuffix}`, 'Lead generation and digital branding for real estate developers, property portals, and local agents.');
});

app.get('/industries/technology', (req, res) => {
  renderPage(res, 'industry-technology', 'Technology & SaaS Marketing', `Technology Sector Marketing Services in Delhi NCR | ${brandMetaSuffix}`, 'Growth hacking and performance marketing for SaaS, software houses, and tech startups looking to scale globally.');
});

app.get('/industries/automotive', (req, res) => {
  renderPage(res, 'industry-automotive', 'Automotive Marketing', `Automotive Digital Marketing Services in Delhi NCR | ${brandMetaSuffix}`, 'Comprehensive digital marketing for car dealerships, auto parts brands, and automotive service centers.');
});

app.get('/case-studies', (req, res) => {
  renderPage(
    res,
    'case-studies',
    'Case Studies',
    `Digital Marketing Case Studies in Delhi NCR | ${brandMetaSuffix}`,
    'Read real client success stories and measurable SEO/AIO growth results delivered by Digi Web Tech, a top Digital Marketing Agency in Delhi NCR.'
  );
});

app.get('/case-studies/the-dental-port', (req, res) => {
  renderPage(
    res,
    'case-study-dental-port',
    'The Dental Port Case Study | Dental Marketing',
    `The Dental Port Case Study - 30% Growth in Delhi NCR | ${brandMetaSuffix}`,
    'Read how Digi Web Tech transformed The Dental Port\'s digital presence, resulting in 30% organic traffic growth and page 1 rankings for key local search terms.'
  );
});

app.get('/case-studies/krisshna-dental', (req, res) => {
  renderPage(
    res,
    'case-study-krisshna-dental',
    'Krisshna Dental Case Study | Dental SEO',
    `Krisshna Dental Case Study - Top rankings in 3 Months | ${brandMetaSuffix}`,
    'Read how Digi Web Tech transformed Krisshna Dental\'s digital presence, resulting in 10 keywords in the top 10 in 3 months and a 30% traffic increase in 6 months.'
  );
});

app.get('/case-studies/eco-luxe-decor', (req, res) => {
  renderPage(
    res,
    'case-study-eco-luxe-decor',
    'Eco Luxe Decor Case Study | Shopify SEO',
    `Eco Luxe Decor Case Study - 0 to $3,000 Sales in Delhi NCR | ${brandMetaSuffix}`,
    'Read how Digi Web Tech scaled Eco Luxe Decor from zero to $3,000 in monthly sales through Shopify optimization and International SEO.'
  );
});

app.get('/case-studies/ankur-pharma', (req, res) => {
  renderPage(
    res,
    'case-study-ankur-pharma',
    'Ankur Pharmaceuticals Case Study | Pharma SEO',
    `Ankur Pharmaceuticals Case Study - 0 to 90,000 Sales | ${brandMetaSuffix}`,
    'Read how Digi Web Tech transformed Ankur Pharmaceuticals\' digital presence, scaling from zero to 90,000 in sales volume through WordPress/WooCommerce and International SEO.'
  );
});

app.get('/pricing', (req, res) => {
  renderPage(
    res,
    'pricing',
    'Pricing',
    `Digital Marketing Pricing Plans in Delhi NCR | ${brandMetaSuffix}`,
    'View affordable digital marketing, SEO, AIO, and web service pricing plans from Digi Web Tech, a top Digital Marketing Agency in Delhi NCR.'
  );
});

app.get('/contact', (req, res) => {
  renderPage(
    res,
    'contact',
    'Contact Us',
    `Contact Top Digital Marketing Agency in Delhi NCR | ${brandMetaSuffix}`,
    'Contact Digi Web Tech in Delhi NCR for SEO, AIO, GEO, ads, social media, website design, and web development services for your business growth.'
  );
});

// Dynamic Sitemap Generator
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = 'https://digiwebtech.co.in';
  
  let paths = [];
  try {
    const stack = (app.router && app.router.stack) || (app._router && app._router.stack) || [];
    paths = stack
      .filter(r => r.route && r.route.path && typeof r.route.path === 'string')
      .map(r => r.route.path)
      .filter(path => {
        // Exclude utility paths, samples, and error pages
        if (['/sitemap.xml', '/robots.txt', '/404'].includes(path)) return false;
        if (path.includes('sample')) return false; // Any sample routes
        if (path.includes('*')) return false; // Catch-all wildcard
        return true;
      });
  } catch (err) {
    // Fallback to core routes if router stack access fails
    paths = ['/', '/about', '/services', '/industries', '/case-studies', '/pricing', '/contact'];
  }

  const uniquePaths = [...new Set(paths)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${uniquePaths.map(path => `
  <url>
    <loc>${baseUrl}${path === '/' ? '' : path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${path === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.status(200).send(sitemap);
});

// Robots.txt Generator
app.get('/robots.txt', (req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /home-sample
Disallow: /404

Sitemap: https://digiwebtech.co.in/sitemap.xml`;

  res.header('Content-Type', 'text/plain');
  res.status(200).send(robots);
});

// 404 Handler - Catch-all for undefined routes
app.use((req, res) => {
  res.status(404);
  renderPage(
    res,
    '404',
    'Page Not Found',
    `404 - Page Not Found | ${brandMetaSuffix}`,
    'The page you are looking for does not exist. Explore our services or return home to grow your business.'
  );
});

// Server
const PORT = process.env.PORT || 3000;
/*app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

const req = { url: '/sitemap.xml', method: 'GET' };
const res = {
  header: () => {},
  status: (code) => res,
  send: (data) => console.log('DATA:', data)
};
const routeLayer = app.router.stack.find(r => r.route && r.route.path === '/sitemap.xml');
routeLayer.route.stack[0].handle(req, res, () => {});
