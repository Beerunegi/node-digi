const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const app = express();

const defaultMetaDescription =
  'Digi Web Tech is an India based Digital marketing and WebCompany offering SEO, Google Ads, social media, website design, website development, and growth-focused digital services.';

const brandMetaSuffix = 'India based Digital marketing and WebCompany';

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

// Static files
app.use(express.static('public'));

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
    `Best Digital Marketing Company in India | ${brandMetaSuffix}`,
    'Digi Web Tech is an India based Digital marketing and WebCompany helping businesses grow with SEO, paid ads, website design, and development services.'
  );
});

app.get('/home-sample', (req, res) => {
  renderPage(
    res,
    'home-sample',
    'Home Sample',
    `Modern Digital Marketing Website Sample | ${brandMetaSuffix}`,
    'Explore an alternative premium homepage concept for Digi Web Tech featuring a modern SaaS-style layout, trust signals, case studies, and conversion-focused sections.'
  );
});
app.get('/about', (req, res) => {
  renderPage(
    res,
    'about',
    'About Us',
    `About Digi Web Tech | ${brandMetaSuffix}`,
    'Learn about Digi Web Tech, an India based Digital marketing and WebCompany delivering performance-driven marketing and web solutions.'
  );
});

app.get('/services', (req, res) => {
  renderPage(
    res,
    'services',
    'Services',
    `Digital Marketing Services in India | ${brandMetaSuffix}`,
    'Explore complete digital marketing and web services including SEO, ads, automation, development, and strategy by Digi Web Tech in India.'
  );
});

app.get('/services/seo-services', (req, res) => {
  renderPage(res, 'seo-services', 'SEO Services', `SEO Services in India | ${brandMetaSuffix}`);
});

app.get('/services/seo-services-sample', (req, res) => {
  renderPage(
    res,
    'seo-services-sample',
    'SEO Services Sample',
    `SEO Services Sample Page | ${brandMetaSuffix}`,
    'Preview a sample SEO services page concept for Digi Web Tech, adapted to the current site theme with a premium long-form layout.'
  );
});

app.get('/services/aio-optimization-services', (req, res) => {
  renderPage(res, 'aio-optimization-services', 'AIO Optimization Services', `AIO Optimization Services in India | ${brandMetaSuffix}`);
});

app.get('/services/geo-optimization-services', (req, res) => {
  renderPage(res, 'geo-optimization-services', 'GEO Optimization Services', `GEO Optimization Services in India | ${brandMetaSuffix}`);
});

app.get('/services/google-ads-services', (req, res) => {
  renderPage(res, 'google-ads-services', 'Google Ads Services', `Google Ads Services in India | ${brandMetaSuffix}`);
});

app.get('/services/website-development-services', (req, res) => {
  renderPage(res, 'website-development-services', 'Website Development Services', `Website Development Services in India | ${brandMetaSuffix}`);
});

app.get('/services/website-design-services', (req, res) => {
  renderPage(res, 'website-design-services', 'Website Design Services', `Website Design Services in India | ${brandMetaSuffix}`);
});

app.get('/services/shopify-development-services', (req, res) => {
  renderPage(res, 'shopify-development-services', 'Shopify Development Services', `Shopify Development Services in India | ${brandMetaSuffix}`);
});

app.get('/services/wordpress-development-services', (req, res) => {
  renderPage(res, 'wordpress-development-services', 'WordPress Development Services', `WordPress Development Services in India | ${brandMetaSuffix}`);
});

app.get('/services/meta-ads-management-services', (req, res) => {
  renderPage(res, 'meta-ads-management-services', 'Meta Ads Management Services', `Meta Ads Management Services in India | ${brandMetaSuffix}`);
});

app.get('/services/content-marketing-services', (req, res) => {
  renderPage(res, 'content-marketing-services', 'Content Marketing Services', `Content Marketing Services in India | ${brandMetaSuffix}`);
});

app.get('/services/email-marketing-automation-services', (req, res) => {
  renderPage(res, 'email-marketing-automation-services', 'Email Marketing & Automation Services', `Email Marketing Services in India | ${brandMetaSuffix}`);
});

app.get('/services/conversion-rate-optimization-services', (req, res) => {
  renderPage(res, 'conversion-rate-optimization-services', 'Conversion Rate Optimization Services', `CRO Services in India | ${brandMetaSuffix}`);
});

app.get('/services/analytics-reporting-services', (req, res) => {
  renderPage(res, 'analytics-reporting-services', 'Analytics & Reporting Services', `Analytics and Reporting Services in India | ${brandMetaSuffix}`);
});

app.get('/services/brand-strategy-services', (req, res) => {
  renderPage(res, 'brand-strategy-services', 'Brand Strategy Services', `Brand Strategy Services in India | ${brandMetaSuffix}`);
});

app.get('/case-studies', (req, res) => {
  renderPage(
    res,
    'case-studies',
    'Case Studies',
    `Digital Marketing Case Studies | ${brandMetaSuffix}`,
    'Read real client success stories and measurable growth results delivered by Digi Web Tech, an India based Digital marketing and WebCompany.'
  );
});

app.get('/pricing', (req, res) => {
  renderPage(
    res,
    'pricing',
    'Pricing',
    `Digital Marketing Pricing Plans | ${brandMetaSuffix}`,
    'View affordable digital marketing and web service pricing plans from Digi Web Tech, an India based Digital marketing and WebCompany.'
  );
});

app.get('/contact', (req, res) => {
  renderPage(
    res,
    'contact',
    'Contact Us',
    `Contact Digi Web Tech | ${brandMetaSuffix}`,
    'Contact Digi Web Tech in India for SEO, ads, social media, website design, and web development services for your business growth.'
  );
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});



