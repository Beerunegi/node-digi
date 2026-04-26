import crypto from 'crypto';

const leadRateLimitStore = new Map();
const LEAD_FORM_TTL_MS = 1000 * 60 * 60 * 2;
const MIN_FORM_FILL_TIME_MS = 3000;
const LEAD_RATE_WINDOW_MS = 1000 * 60 * 15;
const LEAD_RATE_MAX_ATTEMPTS = 4;
const LEAD_DAILY_WINDOW_MS = 1000 * 60 * 60 * 24;
const LEAD_DAILY_MAX_ATTEMPTS = 12;

const trustedHosts = new Set([
  'digiwebtech.co.in',
  'www.digiwebtech.co.in',
  'localhost',
  '127.0.0.1',
]);

function getLeadSecret() {
  return process.env.LEAD_FORM_SECRET || 'replace-this-in-production';
}

function signLeadForm(formType, renderedAt) {
  return crypto
    .createHmac('sha256', getLeadSecret())
    .update(`${formType}:${renderedAt}`)
    .digest('hex');
}

function getClientIp(headers) {
  const forwardedFor = headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return headers.get('x-real-ip') || 'unknown';
}

function pruneLeadRateEntry(entry, now) {
  entry.attempts = entry.attempts.filter((timestamp) => now - timestamp < LEAD_RATE_WINDOW_MS);
  entry.dailyAttempts = entry.dailyAttempts.filter(
    (timestamp) => now - timestamp < LEAD_DAILY_WINDOW_MS,
  );
}

function isRateLimited(headers, routeKey) {
  const now = Date.now();
  const ip = getClientIp(headers);
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

function isSuspiciousText(value) {
  return /https?:\/\/|www\.|<[^>]+>|\b(?:telegram|whatsapp group)\b/i.test(String(value || ''));
}

function containsSpamKeywords(value) {
  const spamPattern =
    /\b(crypto|bitcoin|casino|loan|forex|viagra|seo expert 100%|backlinks?|guest post|adult|whatsapp group|betting|gambling|porn|payday loan)\b/i;
  return spamPattern.test(value || '');
}

function countUrls(value) {
  const matches = String(value || '').match(/https?:\/\/|www\./gi);
  return matches ? matches.length : 0;
}

function hasTrustedFormOrigin(headers) {
  const hostHeader = (headers.get('host') || '').split(':')[0].toLowerCase();
  const originHeader = headers.get('origin');
  const refererHeader = headers.get('referer');

  const isTrustedUrl = (value) => {
    if (!value) {
      return true;
    }

    try {
      const parsed = new URL(value);
      const hostname = parsed.hostname.toLowerCase();
      return trustedHosts.has(hostname) || hostname === hostHeader;
    } catch {
      return false;
    }
  };

  return isTrustedUrl(originHeader) && isTrustedUrl(refererHeader);
}

export function createLeadFormMeta(formType) {
  const renderedAt = Date.now();

  return {
    token: signLeadForm(formType, renderedAt),
    renderedAt,
  };
}

export function normalizeWebsiteUrl(value) {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function validateLeadSubmission(headers, formType, body = {}, options = {}) {
  const submittedToken = String(body.formToken || '');
  const honeypot = String(body.bot_field_honey || body.company || '').trim();
  const submittedRenderedAt = Number.parseInt(body.formRenderedAt, 10);
  const now = Date.now();

  if (isRateLimited(headers, formType)) {
    return { ok: false, reason: 'rate_limited' };
  }

  if (honeypot) {
    return { ok: false, reason: 'honeypot' };
  }

  if (!hasTrustedFormOrigin(headers)) {
    return { ok: false, reason: 'origin' };
  }

  if (!Number.isFinite(submittedRenderedAt)) {
    return { ok: false, reason: 'timestamp' };
  }

  const expectedToken = signLeadForm(formType, submittedRenderedAt);
  if (!submittedToken || submittedToken !== expectedToken) {
    return { ok: false, reason: 'token' };
  }

  if (now - submittedRenderedAt < MIN_FORM_FILL_TIME_MS) {
    return { ok: false, reason: 'too_fast' };
  }

  if (now - submittedRenderedAt > LEAD_FORM_TTL_MS) {
    return { ok: false, reason: 'expired' };
  }

  if (options.name && (options.name.length < 2 || options.name.length > 80)) {
    return { ok: false, reason: 'invalid_name' };
  }

  if (options.name && isSuspiciousText(options.name)) {
    return { ok: false, reason: 'invalid_name' };
  }

  if (options.email && !isValidEmail(options.email)) {
    return { ok: false, reason: 'invalid_email' };
  }

  if (options.phone && !isValidPhone(options.phone)) {
    return { ok: false, reason: 'invalid_phone' };
  }

  if (options.message) {
    if (options.message.length < 2 || options.message.length > 2000) {
      return { ok: false, reason: 'invalid_message' };
    }

    if (containsSpamKeywords(options.message) || countUrls(options.message) > 1) {
      return { ok: false, reason: 'spam_message' };
    }
  }

  if (options.service && isSuspiciousText(options.service)) {
    return { ok: false, reason: 'invalid_service' };
  }

  if (options.website && countUrls(options.website) > 1) {
    return { ok: false, reason: 'spam_website' };
  }

  return { ok: true };
}

export function getLeadFailureMessage(channel) {
  if (channel === 'audit') {
    return 'Lead service is temporarily unavailable. Please contact us via WhatsApp on +91 98712 64699';
  }

  return 'Something went wrong with our lead service. Please try again later or call us at +91 98712 64699';
}
