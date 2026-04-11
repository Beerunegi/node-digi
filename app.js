const express = require('express');
require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');
const compression = require('compression');
const sequelize = require('./config/database');
const session = require('express-session');
const nodemailer = require('nodemailer');
const dns = require('dns');

const app = express();
console.log('Digi Web Tech Server - App.js Reloaded/Started');
app.use(compression());

// Request Body Parsers
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// MySQL Connection & Sync
sequelize.authenticate()
  .then(() => {
    console.log('MySQL Connected correctly via Sequelize');
    return sequelize.sync({ alter: true });
  })
  .then(() => console.log('Database synced successfully.'))
  .catch(err => {
    // Silencing database error log to focus on form delivery
    console.log('Database (Local MySQL) not running. System using SMTP for lead delivery only.');
  });

// Express Session setup
app.use(session({
  secret: 'digiweb_super_secret_blog_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

const smtpPort = Number.parseInt(process.env.SMTP_PORT, 10) || 465;
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  requireTLS: smtpPort !== 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    servername: process.env.SMTP_HOST,
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
  family: 4
};

const hasSmtpConfig = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.ADMIN_EMAIL
);

const transporter = hasSmtpConfig ? nodemailer.createTransport(smtpConfig) : null;

function normalizeWebsiteUrl(value) {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function verifySmtpConnection() {
  if (!transporter) {
    console.warn('SMTP disabled: missing SMTP_HOST, SMTP_USER, SMTP_PASS, or ADMIN_EMAIL.');
    return false;
  }

  try {
    await dns.promises.lookup(process.env.SMTP_HOST);
    await transporter.verify();
    console.log('SMTP Server is ready to take messages');
    return true;
  } catch (error) {
    console.error('SMTP Connection Error:', error.message);
    if (error.code) console.error('SMTP Error Code:', error.code);
    if (error.command) console.error('SMTP Command:', error.command);
    return false;
  }
}

verifySmtpConnection();

async function sendMailOrThrow(mailOptions, label) {
  if (!transporter) {
    throw new Error('SMTP transporter is not configured.');
  }

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`${label} failed:`, error.message);
    if (error.code) console.error(`${label} code:`, error.code);
    if (error.command) console.error(`${label} command:`, error.command);
    throw error;
  }
}

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

// Handling Free Website Audit Form (Placed at top for priority)
app.post('/submit-audit', async (req, res) => {
  console.log('--- RECEIVED AUDIT FORM SUBMISSION ---');
  console.log('Body Data:', req.body);
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const phone = req.body.phone?.trim();
  const website = normalizeWebsiteUrl(req.body.website);
  console.log(`Captured: ${name}, ${email}, ${phone}, ${website}`);

  if (!name || !email || !website || !phone) {
    console.warn('Submission blocked: Missing fields');
    return res.status(400).send('Missing name, email, website, or mobile number');
  }

  if (!transporter) {
    console.error('Audit form blocked: SMTP transporter is not configured.');
    return res.status(500).send('Mail service is not configured right now. Please contact us via WhatsApp on +91 98712 64699');
  }

  try {
    // 1. Send Email to Admin
    await sendMailOrThrow({
      from: `"Digi Web Tech Audit Bot" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🔥 New Free Audit Request from ${name}`,
      text: `New Lead Details:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nWebsite: ${website}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #f4f7fb; border: 1px solid #e0e0e0; border-radius: 12px;">
          <h2 style="color: #01a09d;">New Lead Alert!</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Website:</strong> <a href="${website}">${website}</a></p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #666;">This enquiry was submitted via the "Free Website Audit" bar on the homepage.</p>
        </div>
      `
    }, 'Audit admin email');

    // 2. Auto-reply to User
    try {
      await sendMailOrThrow({
        from: `"Birendra from Digi Web Tech" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Thank you for requesting an audit, ${name}!`,
        text: `Hello ${name},\n\nThank you for reaching out to Digi Web Tech. We've received your request for a free website audit for ${website}.\n\nOur team will analyze your site's SEO, performance, and conversion metrics. You will receive a detailed report within 24-48 hours.\n\nBest Regards,\nBirendra Singh\nDigi Web Tech`,
        html: `
          <div style="font-family: sans-serif; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #01a09d;">Hello ${name},</h2>
            <p>Thanks for choosing <strong>Digi Web Tech</strong> for your website audit!</p>
            <p>We have received your request for <strong>${website}</strong>. Our SEO experts are already on it and will prepare a comprehensive audit report for you.</p>
            <p><strong>What was analyzed?</strong></p>
            <ul style="color: #444;">
              <li>Site Audit (Speed, Technical SEO, AIO Readiness)</li>
              <li>Market Competitor Analysis</li>
              <li>Custom Growth Action Plan</li>
            </ul>
            <p>Expect your report in your inbox within 24-48 business hours.</p>
            <p>Best Regards,<br/><strong>Birendra Singh</strong><br/>Founder, Digi Web Tech</p>
          </div>
        `
      }, 'Audit auto-reply');
    } catch (autoReplyError) {
      console.warn('Audit form submitted, but auto-reply email could not be sent.');
    }

    console.log('--- AUDIT SUBMISSION EMAILS SENT ---');
    res.redirect('/thank-you');

  } catch (error) {
    console.error('--- CRITICAL SMTP ERROR (AUDIT FORM) ---');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    if (error.command) console.error('SMTP Command:', error.command);
    
    // Fallback: Notify user to use WhatsApp if mail fails
    res.status(500).send('Mail service unavailable. Please contact us via WhatsApp on +91 98712 64699');
  }
});

// Handling Main Contact Form Submission
app.post('/submit-contact', async (req, res) => {
  console.log('--- RECEIVED CONTACT FORM SUBMISSION ---');
  console.log('Body Data:', req.body);
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const phone = req.body.phone?.trim();
  const service = req.body.service?.trim();
  const message = req.body.message?.trim();

  if (!name || !email || !message) {
    console.warn('Submission blocked: Missing required fields');
    return res.status(400).send('Missing name, email, or message.');
  }

  if (!transporter) {
    console.error('Contact form blocked: SMTP transporter is not configured.');
    return res.status(500).send('Mail service is not configured right now. Please call us at +91 98712 64699');
  }

  try {
    // 1. Send Email to Admin
    await sendMailOrThrow({
      from: `"Digi Web Tech Contact Bot" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `📧 New Contact Inquiry from ${name}`,
      text: `New Lead Details:\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nService: ${service || 'None Specified'}\nMessage: ${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 25px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; color: #333;">
          <h2 style="color: #01a09d; margin-top: 0;">New Project Inquiry</h2>
          <p style="margin-bottom: 20px;">You have received a new message via the Contact Us page.</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Requested Service:</strong> ${service || 'Not specified'}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line; color: #555;">${message}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;"/>
          <p style="font-size: 13px; color: #888;">Digi Web Tech Lead Console</p>
        </div>
      `
    }, 'Contact admin email');

    // 2. Auto-reply to User
    try {
      await sendMailOrThrow({
        from: `"Birendra from Digi Web Tech" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `We've received your inquiry, ${name}!`,
        text: `Hello ${name},\n\nThank you for reaching out to us. We've received your query regarding ${service || 'our services'} and Birendra Singh will get back to you shortly.\n\nSummary of your message:\n${message}\n\nBest Regards,\nDigi Web Tech`,
        html: `
          <div style="font-family: sans-serif; padding: 40px; border: 1px solid #eee; border-radius: 16px; max-width: 600px; margin: 0 auto; color: #444;">
            <h2 style="color: #01a09d;">Hello ${name},</h2>
            <p>Thank you for reaching out to <strong>Digi Web Tech</strong>. We've received your inquiry and are excited to learn more about your project.</p>
            <p>Our founder, <strong>Birendra Singh</strong>, or one of our senior strategy experts will review your requirements and reach out to you within 24 hours.</p>
            <p><strong>Next Steps:</strong></p>
            <ul style="color: #555; line-height: 1.6;">
              <li>Project Feasibility Review</li>
              <li>Consultation Call Scheduling</li>
              <li>Custom Proposal & Roadmap</li>
            </ul>
            <p style="margin-top: 25px;">Looking forward to driving hyper-growth for your brand!</p>
            <p style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
              Best Regards,<br/>
              <strong>Birendra Singh</strong><br/>
              Founder, Digi Web Tech<br/>
              <a href="tel:+919871264699" style="color: #01a09d; text-decoration: none;">+91 98712 64699</a>
            </p>
          </div>
        `
      }, 'Contact auto-reply');
    } catch (autoReplyError) {
      console.warn('Contact form submitted, but auto-reply email could not be sent.');
    }

    console.log('--- CONTACT SUBMISSION EMAILS SENT ---');
    res.redirect('/thank-you');

  } catch (error) {
    console.error('--- CRITICAL SMTP ERROR (CONTACT FORM) ---');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    
    res.status(500).send('Something went wrong with our mail server. Please try again later or call us at +91 98712 64699');
  }
});
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

app.get('/thank-you', (req, res) => {
  renderPage(
    res,
    'thank-you',
    'Thank You!',
    `Thank You for Your Interest | ${brandMetaSuffix}`,
    'We have received your enquiry and our team will get back to you shortly. Thank you for choosing Digi Web Tech.'
  );
});



// Dynamic Sitemap Generator

app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = 'https://digiwebtech.co.in';
  
  let paths = [];
  try {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
    
    // Extrapolate all route maps defined in this file securely
    const matches = [...code.matchAll(/app\.get\(['"`](.*?)['"`]/g)];
    paths = matches.map(m => m[1]);

    paths = paths.filter(route => {
      // Exclude utility paths, samples, and error pages
      if (['/sitemap.xml', '/robots.txt', '/404'].includes(route)) return false;
      if (route.includes('sample')) return false; // Any sample routes
      if (route.includes('*')) return false; // Catch-all wildcard
      return true;
    });

  } catch (err) {
    // Fallback to core routes if reflection extraction fails
    paths = ['/', '/about', '/services', '/industries', '/case-studies', '/pricing', '/contact'];
    console.error('Sitemap Error:', err);
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
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
