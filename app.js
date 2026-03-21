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

app.get('/industries', (req, res) => {
  renderPage(
    res,
    'industries',
    'Industries',
    `Industry Specific Digital Marketing Solutions | ${brandMetaSuffix}`,
    'Explore specialized digital marketing and web solutions tailored for healthcare, education, ecommerce, real estate, technology, and automotive sectors by Digi Web Tech.'
  );
});

app.get('/industries/health', (req, res) => {
  renderPage(res, 'industry-health', 'Healthcare Marketing', `Healthcare Digital Marketing Services | ${brandMetaSuffix}`, 'Specialized digital marketing for health clinics, hospitals, and wellness brands including patient acquisition and medical SEO.');
});

app.get('/industries/education', (req, res) => {
  renderPage(res, 'industry-education', 'Education Marketing', `Education Sector Marketing Services | ${brandMetaSuffix}`, 'Strategic growth marketing for schools, universities, and EdTech platforms focusing on student enrollment and brand authority.');
});

app.get('/industries/ecommerce', (req, res) => {
  renderPage(res, 'industry-ecommerce', 'Ecommerce Growth', `Ecommerce Marketing & Development Services | ${brandMetaSuffix}`, 'End-to-end growth solutions for online stores, including Shopify mastery, D2C performance ads, and conversion optimization.');
});

app.get('/industries/real-estate', (req, res) => {
  renderPage(res, 'industry-real-estate', 'Real Estate Marketing', `Real Estate Digital Marketing Services | ${brandMetaSuffix}`, 'Lead generation and digital branding for real estate developers, property portals, and local agents.');
});

app.get('/industries/technology', (req, res) => {
  renderPage(res, 'industry-technology', 'Technology & SaaS Marketing', `Technology Sector Marketing Services | ${brandMetaSuffix}`, 'Growth hacking and performance marketing for SaaS, software houses, and tech startups looking to scale globally.');
});

app.get('/industries/automotive', (req, res) => {
  renderPage(res, 'industry-automotive', 'Automotive Marketing', `Automotive Digital Marketing Services | ${brandMetaSuffix}`, 'Comprehensive digital marketing for car dealerships, auto parts brands, and automotive service centers.');
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
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});



