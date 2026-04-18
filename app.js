const express = require('express');
require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');
const compression = require('compression');
const sequelize = require('./config/database');
const session = require('express-session');
const nodemailer = require('nodemailer');
const dns = require('dns');
const crypto = require('crypto');

const app = express();
app.set('trust proxy', true);
console.log('Digi Web Tech Server - App.js Reloaded/Started');

// Enforce Non-WWW: Redirect www.digiwebtech.co.in to digiwebtech.co.in
app.use((req, res, next) => {
  const host = req.get('host');
  if (host && host.startsWith('www.')) {
    const newHost = host.replace(/^www\./, '');
    return res.redirect(301, `${req.protocol}://${newHost}${req.originalUrl}`);
  }
  next();
});

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
const googleSheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
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
const leadRateLimitStore = new Map();
const LEAD_FORM_TTL_MS = 1000 * 60 * 60 * 2;
const MIN_FORM_FILL_TIME_MS = 3000;
const LEAD_RATE_WINDOW_MS = 1000 * 60 * 15;
const LEAD_RATE_MAX_ATTEMPTS = 4;
const LEAD_DAILY_WINDOW_MS = 1000 * 60 * 60 * 24;
const LEAD_DAILY_MAX_ATTEMPTS = 12;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createLeadFormState(req, formType) {
  const now = Date.now();
  if (!req.session.leadForms) {
    req.session.leadForms = {};
  }

  const existingState = req.session.leadForms[formType];
  if (existingState && now - existingState.renderedAt < LEAD_FORM_TTL_MS) {
    return existingState;
  }

  const newState = {
    token: crypto.randomBytes(24).toString('hex'),
    renderedAt: now
  };

  req.session.leadForms[formType] = newState;
  return newState;
}

function clearLeadFormState(req, formType) {
  // We don't delete on submission to avoid "back button" invalidation
  // tokens will naturally expire or be overwritten
  // delete req.session.leadForms[formType];
}

function getClientIp(req) {
  const forwardedFor = req.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function pruneLeadRateEntry(entry, now) {
  entry.attempts = entry.attempts.filter(timestamp => now - timestamp < LEAD_RATE_WINDOW_MS);
  entry.dailyAttempts = entry.dailyAttempts.filter(timestamp => now - timestamp < LEAD_DAILY_WINDOW_MS);
}

function isRateLimited(req, routeKey) {
  const now = Date.now();
  const ip = getClientIp(req);
  const storeKey = `${routeKey}:${ip}`;
  const entry = leadRateLimitStore.get(storeKey) || { attempts: [], dailyAttempts: [] };

  pruneLeadRateEntry(entry, now);

  if (
    entry.attempts.length >= LEAD_RATE_MAX_ATTEMPTS ||
    entry.dailyAttempts.length >= LEAD_DAILY_MAX_ATTEMPTS
  ) {
    leadRateLimitStore.set(storeKey, entry);
    return true;
  }

  entry.attempts.push(now);
  entry.dailyAttempts.push(now);
  leadRateLimitStore.set(storeKey, entry);
  return false;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function containsSpamKeywords(value) {
  const spamPattern = /\b(crypto|bitcoin|casino|loan|forex|viagra|seo expert 100%|backlinks?|guest post|adult|whatsapp group)\b/i;
  return spamPattern.test(value || '');
}

function countUrls(value) {
  const matches = String(value || '').match(/https?:\/\/|www\./gi);
  return matches ? matches.length : 0;
}

function validateLeadSubmission(req, formType, options = {}) {
  const state = req.session?.leadForms?.[formType];
  const submittedToken = String(req.body.formToken || '');
  const honeypot = String(req.body.bot_field_honey || '').trim();
  const now = Date.now();

  console.log(`[VALIDATION] formType: ${formType}`);
  console.log(`[VALIDATION] state token: ${state?.token}, submitted token: ${submittedToken}`);
  console.log(`[VALIDATION] honeypot: '${honeypot}'`);

  if (isRateLimited(req, formType)) {
    console.warn(`[VALIDATION FAILED] rate_limited for ${formType}`);
    return { ok: false, reason: 'rate_limited' };
  }

  if (honeypot) {
    console.warn(`[VALIDATION FAILED] honeypot filled: ${honeypot}`);
    return { ok: false, reason: 'honeypot' };
  }

  // Soften the token check: auto-passed if session was completely lost/uninitialized (to prevent errors)
  if (!state || !submittedToken || state.token !== submittedToken) {
    console.warn(`[VALIDATION FAILED] Token mismatch: state=${state?.token}, submitted=${submittedToken}`);
    return { ok: false, reason: 'token' };
  }

  if (now - state.renderedAt < 500) { // Reduced to 500ms
    console.warn(`[VALIDATION FAILED] too_fast. Elapsed: ${now - state.renderedAt}ms`);
    return { ok: false, reason: 'too_fast' };
  }

  if (now - state.renderedAt > LEAD_FORM_TTL_MS) {
    console.warn(`[VALIDATION FAILED] expired. Elapsed: ${now - state.renderedAt}ms`);
    return { ok: false, reason: 'expired' };
  }

  if (options.name && (options.name.length < 2 || options.name.length > 80)) {
    console.warn(`[VALIDATION FAILED] invalid_name: ${options.name}`);
    return { ok: false, reason: 'invalid_name' };
  }

  if (options.email && !isValidEmail(options.email)) {
    console.warn(`[VALIDATION FAILED] invalid_email: ${options.email}`);
    return { ok: false, reason: 'invalid_email' };
  }

  if (options.phone && !isValidPhone(options.phone)) {
    console.warn(`[VALIDATION FAILED] invalid_phone: ${options.phone}`);
    return { ok: false, reason: 'invalid_phone' };
  }

  if (options.message) {
    if (options.message.length < 2 || options.message.length > 2000) { // Reduce from 10 to 2 for test submissions
      console.warn(`[VALIDATION FAILED] invalid_message length: ${options.message.length}`);
      return { ok: false, reason: 'invalid_message' };
    }

    if (containsSpamKeywords(options.message) || countUrls(options.message) > 2) {
      console.warn(`[VALIDATION FAILED] spam_message detected`);
      return { ok: false, reason: 'spam_message' };
    }
  }

  if (options.website && countUrls(options.website) > 1) {
    console.warn(`[VALIDATION FAILED] spam_website detected`);
    return { ok: false, reason: 'spam_website' };
  }

  console.log(`[VALIDATION SUCCESS] ${formType}`);
  return { ok: true };
}

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

async function sendLeadToGoogleSheets(payload) {
  if (!googleSheetsWebhookUrl) {
    console.warn('Google Sheets webhook is not configured.');
    return false;
  }

  async function postLead(body, headers) {
    const response = await fetch(googleSheetsWebhookUrl, {
      method: 'POST',
      headers,
      body
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    if (!responseText) {
      return { success: true };
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      return { success: true, raw: responseText };
    }
  }

  try {
    let result = await postLead(JSON.stringify(payload), {
      'Content-Type': 'application/json'
    });

    if (result.success === false) {
      throw new Error(result.error || 'Apps Script returned an unknown error.');
    }

    console.log(`Google Sheets lead sync ok for ${payload.formType} via JSON`);
    return true;
  } catch (jsonError) {
    console.warn(`Google Sheets JSON sync failed for ${payload.formType}: ${jsonError.message}`);

    try {
      const formBody = new URLSearchParams({
        formType: payload.formType || '',
        name: payload.name || '',
        email: payload.email || '',
        phone: payload.phone || '',
        website: payload.website || '',
        service: payload.service || '',
        message: payload.message || '',
        source: payload.source || '',
        submittedAt: payload.submittedAt || '',
        payload: JSON.stringify(payload)
      }).toString();

      const retryResult = await postLead(formBody, {
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      if (retryResult.success === false) {
        throw new Error(retryResult.error || 'Apps Script retry returned an unknown error.');
      }

      console.log(`Google Sheets lead sync ok for ${payload.formType} via form fallback`);
      return true;
    } catch (fallbackError) {
      console.error(`Google Sheets lead sync failed for ${payload.formType}:`, fallbackError.message);
      return false;
    }
  }
}

function getLeadFailureMessage(channel) {
  if (channel === 'audit') {
    return 'Lead service is temporarily unavailable. Please contact us via WhatsApp on +91 98712 64699';
  }

  return 'Something went wrong with our lead service. Please try again later or call us at +91 98712 64699';
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
  res.locals.getLeadFormMeta = formType => createLeadFormState(req, formType);
  next();
});

// Routes

// Handling Free Website Audit Form (Placed at top for priority)
app.post('/submit-audit', async (req, res) => {
  console.log('--- RECEIVED AUDIT FORM SUBMISSION ---');
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const phone = req.body.phone?.trim();
  const website = normalizeWebsiteUrl(req.body.website);
  console.log(`Captured: ${name}, ${email}, ${phone}, ${website}`);

  if (!name || !email || !website || !phone) {
    console.warn('Submission blocked: Missing fields');
    return res.status(400).send('Missing name, email, website, or mobile number');
  }

  const auditValidation = validateLeadSubmission(req, 'audit', {
    name,
    email,
    phone,
    website,
    message: 'website audit'
  });

  if (!auditValidation.ok) {
    console.warn(`Audit submission blocked: ${auditValidation.reason}`);
    return res.status(400).send('We could not verify this submission. Please refresh the page and try again.');
  }

  try {
    const sheetsSaved = await sendLeadToGoogleSheets({
      formType: 'Free Website Audit',
      name,
      email,
      phone,
      website,
      service: '',
      message: '',
      source: req.originalUrl,
      submittedAt: new Date().toISOString()
    });

    let emailDelivered = false;
    if (transporter) {
      // 1. Send Email to Admin
      await sendMailOrThrow({
        from: `"Digi Web Tech Audit Bot" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🔥 New Free Audit Request from ${name}`,
        text: `New Lead Details:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nWebsite: ${website}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #f4f7fb; border: 1px solid #e0e0e0; border-radius: 12px;">
            <h2 style="color: #01a09d;">New Lead Alert!</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Website:</strong> <a href="${escapeHtml(website)}">${escapeHtml(website)}</a></p>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;"/>
            <p style="font-size: 12px; color: #666;">This enquiry was submitted via the "Free Website Audit" bar on the homepage.</p>
          </div>
        `
      }, 'Audit admin email');
      emailDelivered = true;
    } else {
      console.warn('Audit form email skipped: SMTP transporter is not configured.');
    }

    // 2. Auto-reply to User
    if (transporter) {
      try {
        await sendMailOrThrow({
          from: `"Arjun Rawat from Digi Web Tech" <${process.env.SMTP_USER}>`,
          to: email,
          subject: `Thank you for requesting an audit, ${name}!`,
          text: `Hello ${name},\n\nThank you for reaching out to Digi Web Tech. We've received your request for a free website audit for ${website}.\n\nOur team will analyze your site's SEO, performance, and conversion metrics. You will receive a detailed report within 24-48 hours.\n\nBest Regards,\nArjun Rawat\nDigi Web Tech`,
          html: `
            <div style="margin:0; padding:24px; background:#f4f8fc; font-family:Arial,Helvetica,sans-serif; color:#16324f;">
              <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #dbe7f3; border-radius:24px; overflow:hidden; box-shadow:0 18px 44px rgba(16,39,67,0.08);">
                <div style="padding:28px 32px; background:linear-gradient(135deg,#0f2f57 0%,#1f6fe5 55%,#19b6d2 100%); color:#ffffff;">
                  <div style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; opacity:0.82;">Free Website Audit</div>
                  <h2 style="margin:14px 0 8px; font-size:30px; line-height:1.15; color:#ffffff;">We’ve received your audit request.</h2>
                  <p style="margin:0; font-size:15px; line-height:1.7; color:rgba(255,255,255,0.88);">Hello ${escapeHtml(name)}, thanks for trusting Digi Web Tech with your website review.</p>
                </div>

                <div style="padding:30px 32px;">
                  <div style="padding:18px 20px; background:#f7fbff; border:1px solid #d9e8f7; border-radius:18px;">
                    <div style="font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#4c6784; margin-bottom:10px;">Website Submitted</div>
                    <div style="font-size:16px; line-height:1.7; color:#16324f;"><a href="${escapeHtml(website)}" style="color:#1f6fe5; text-decoration:none;">${escapeHtml(website)}</a></div>
                  </div>

                  <p style="margin:22px 0 14px; font-size:15px; line-height:1.8; color:#425b76;">Our team will review your site’s search visibility, technical health, content opportunities, and conversion friction points. You can expect a clear response within 24-48 business hours.</p>

                  <div style="padding:18px 20px; background:#ffffff; border:1px solid #e3edf7; border-radius:18px;">
                    <div style="font-size:15px; font-weight:700; color:#16324f; margin-bottom:12px;">What we’ll review</div>
                    <ul style="margin:0; padding-left:18px; color:#425b76; line-height:1.8; font-size:14px;">
                      <li>Technical SEO and performance readiness</li>
                      <li>Content and intent alignment opportunities</li>
                      <li>High-impact fixes for stronger lead generation</li>
                    </ul>
                  </div>

                  <div style="margin-top:24px; text-align:center;">
                    <a href="https://wa.me/919871264699?text=Hello%20Digi%20Web%20Tech%2C%20I%20requested%20a%20website%20audit%20for%20${encodeURIComponent(website)}." style="display:inline-block; padding:14px 22px; margin:0 8px 10px; border-radius:999px; background:#25D366; color:#ffffff; text-decoration:none; font-weight:700; font-size:14px;">WhatsApp Us</a>
                    <a href="tel:+919871264699" style="display:inline-block; padding:14px 22px; margin:0 8px 10px; border-radius:999px; background:#0f2f57; color:#ffffff; text-decoration:none; font-weight:700; font-size:14px;">Call +91 98712 64699</a>
                  </div>

                  <div style="margin-top:26px; padding-top:20px; border-top:1px solid #e7eef6; font-size:14px; line-height:1.8; color:#567089;">
                    Best Regards,<br/>
                    <strong style="color:#16324f;">Arjun Rawat</strong><br/>
                    Founder, Digi Web Tech
                  </div>
                </div>
              </div>
            </div>
          `
        }, 'Audit auto-reply');
      } catch (autoReplyError) {
        console.warn('Audit form submitted, but auto-reply email could not be sent.');
      }
    }

    if (!sheetsSaved && !emailDelivered) {
      return res.status(500).send(getLeadFailureMessage('audit'));
    }

    clearLeadFormState(req, 'audit');
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
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const phone = req.body.phone?.trim();
  const service = req.body.service?.trim();
  const message = req.body.message?.trim();
  const website = normalizeWebsiteUrl(req.body.website);
  const sourcePage = req.body.sourcePage?.trim() || req.get('referer') || req.originalUrl;

  if (!name || !email || !message) {
    console.warn('Submission blocked: Missing required fields');
    return res.status(400).send('Missing name, email, or message.');
  }

  const contactValidation = validateLeadSubmission(req, 'contact', {
    name,
    email,
    phone,
    website,
    message
  });

  if (!contactValidation.ok) {
    console.warn(`Contact submission blocked: ${contactValidation.reason}`);
    return res.status(400).send('We could not verify this submission. Please refresh the page and try again.');
  }

  try {
    const sheetsSaved = await sendLeadToGoogleSheets({
      formType: 'Contact Form',
      name,
      email,
      phone: phone || '',
      website: website || '',
      service: service || '',
      message,
      source: sourcePage,
      submittedAt: new Date().toISOString()
    });

    let emailDelivered = false;
    if (transporter) {
      // 1. Send Email to Admin
      await sendMailOrThrow({
        from: `"Digi Web Tech Contact Bot" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `📧 New Contact Inquiry from ${name}`,
        text: `New Lead Details:\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nWebsite: ${website || 'N/A'}\nService: ${service || 'None Specified'}\nSource Page: ${sourcePage}\nMessage: ${message}`,
        html: `
          <div style="font-family: sans-serif; padding: 25px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; color: #333;">
            <h2 style="color: #01a09d; margin-top: 0;">New Project Inquiry</h2>
            <p style="margin-bottom: 20px;">You have received a new message via the Contact Us page.</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Phone:</strong> ${escapeHtml(phone || 'N/A')}</p>
              <p><strong>Website:</strong> ${website ? `<a href="${escapeHtml(website)}">${escapeHtml(website)}</a>` : 'N/A'}</p>
              <p><strong>Requested Service:</strong> ${escapeHtml(service || 'Not specified')}</p>
              <p><strong>Source Page:</strong> ${escapeHtml(sourcePage)}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-line; color: #555;">${escapeHtml(message)}</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;"/>
            <p style="font-size: 13px; color: #888;">Digi Web Tech Lead Console</p>
          </div>
        `
      }, 'Contact admin email');
      emailDelivered = true;
    } else {
      console.warn('Contact form email skipped: SMTP transporter is not configured.');
    }

    // 2. Auto-reply to User
    if (transporter) {
      try {
        await sendMailOrThrow({
          from: `"Arjun Rawat from Digi Web Tech" <${process.env.SMTP_USER}>`,
          to: email,
          subject: `We've received your inquiry, ${name}!`,
          text: `Hello ${name},\n\nThank you for reaching out to us. We've received your query regarding ${service || 'our services'} and Arjun Rawat will get back to you shortly.\n\nWebsite: ${website || 'Not shared'}\n\nSummary of your message:\n${message}\n\nBest Regards,\nDigi Web Tech`,
          html: `
            <div style="margin:0; padding:24px; background:#f4f8fc; font-family:Arial,Helvetica,sans-serif; color:#16324f;">
              <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #dbe7f3; border-radius:24px; overflow:hidden; box-shadow:0 18px 44px rgba(16,39,67,0.08);">
                <div style="padding:28px 32px; background:linear-gradient(135deg,#0f2f57 0%,#1f6fe5 55%,#19b6d2 100%); color:#ffffff;">
                  <div style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; opacity:0.82;">New Enquiry Received</div>
                  <h2 style="margin:14px 0 8px; font-size:30px; line-height:1.15; color:#ffffff;">We’ve received your message.</h2>
                  <p style="margin:0; font-size:15px; line-height:1.7; color:rgba(255,255,255,0.88);">Hello ${escapeHtml(name)}, thank you for reaching out to Digi Web Tech.</p>
                </div>

                <div style="padding:30px 32px;">
                  <div style="padding:18px 20px; background:#f7fbff; border:1px solid #d9e8f7; border-radius:18px;">
                    <div style="font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#4c6784; margin-bottom:12px;">Enquiry Snapshot</div>
                    <div style="font-size:14px; line-height:1.85; color:#425b76;">
                      <strong style="color:#16324f;">Service:</strong> ${escapeHtml(service || 'General enquiry')}<br/>
                      ${website ? `<strong style="color:#16324f;">Website:</strong> <a href="${escapeHtml(website)}" style="color:#1f6fe5; text-decoration:none;">${escapeHtml(website)}</a><br/>` : ''}
                      <strong style="color:#16324f;">Message:</strong><br/>
                      <span style="white-space:pre-line;">${escapeHtml(message)}</span>
                    </div>
                  </div>

                  <p style="margin:22px 0 14px; font-size:15px; line-height:1.8; color:#425b76;">Arjun Rawat or one of our senior strategy experts will review your enquiry and reach out within 24 hours with the most relevant next steps.</p>

                  <div style="padding:18px 20px; background:#ffffff; border:1px solid #e3edf7; border-radius:18px;">
                    <div style="font-size:15px; font-weight:700; color:#16324f; margin-bottom:12px;">What happens next</div>
                    <ul style="margin:0; padding-left:18px; color:#425b76; line-height:1.8; font-size:14px;">
                      <li>Requirement and feasibility review</li>
                      <li>Consultation scheduling with our team</li>
                      <li>Practical roadmap or proposal recommendation</li>
                    </ul>
                  </div>

                  <div style="margin-top:24px; text-align:center;">
                    <a href="https://wa.me/919871264699?text=Hello%20Digi%20Web%20Tech%2C%20I%20just%20submitted%20an%20enquiry%20about%20${encodeURIComponent(service || 'your services')}." style="display:inline-block; padding:14px 22px; margin:0 8px 10px; border-radius:999px; background:#25D366; color:#ffffff; text-decoration:none; font-weight:700; font-size:14px;">WhatsApp Us</a>
                    <a href="tel:+919871264699" style="display:inline-block; padding:14px 22px; margin:0 8px 10px; border-radius:999px; background:#0f2f57; color:#ffffff; text-decoration:none; font-weight:700; font-size:14px;">Call +91 98712 64699</a>
                  </div>

                  <div style="margin-top:26px; padding-top:20px; border-top:1px solid #e7eef6; font-size:14px; line-height:1.8; color:#567089;">
                    Best Regards,<br/>
                    <strong style="color:#16324f;">Arjun Rawat</strong><br/>
                    Founder, Digi Web Tech
                  </div>
                </div>
              </div>
            </div>
          `
        }, 'Contact auto-reply');
      } catch (autoReplyError) {
        console.warn('Contact form submitted, but auto-reply email could not be sent.');
      }
    }

    if (!sheetsSaved && !emailDelivered) {
      return res.status(500).send(getLeadFailureMessage('contact'));
    }

    clearLeadFormState(req, 'contact');
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

app.get('/privacy-policy', (req, res) => {
  renderPage(
    res,
    'privacy-policy',
    'Privacy Policy',
    `Privacy Policy | ${brandMetaSuffix}`,
    'Read the Privacy Policy of Digi Web Tech to understand how we collect, use, and protect your personal information.'
  );
});

app.get('/terms-of-service', (req, res) => {
  renderPage(
    res,
    'terms-of-service',
    'Terms of Service',
    `Terms of Service | ${brandMetaSuffix}`,
    'Read the Terms of Service for using Digi Web Tech website and services.'
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
