import dns from 'dns';
import nodemailer from 'nodemailer';

import {
  getLeadFailureMessage,
  normalizeWebsiteUrl,
  validateLeadSubmission,
} from './form-security';

const googleSheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTransporter() {
  const smtpPort = Number.parseInt(process.env.SMTP_PORT || '465', 10);
  const hasSmtpConfig = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.ADMIN_EMAIL,
  );

  if (!hasSmtpConfig) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    requireTLS: smtpPort !== 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      servername: process.env.SMTP_HOST,
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    family: 4,
  });
}

async function sendMailOrThrow(mailOptions, label) {
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error('SMTP transporter is not configured.');
  }

  try {
    await dns.promises.lookup(process.env.SMTP_HOST);
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`${label} failed:`, error.message);
    throw error;
  }
}

async function sendLeadToGoogleSheets(payload) {
  if (!googleSheetsWebhookUrl) {
    return false;
  }

  async function postLead(body, headers) {
    const response = await fetch(googleSheetsWebhookUrl, {
      method: 'POST',
      headers,
      body,
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
    } catch {
      return { success: true, raw: responseText };
    }
  }

  try {
    const result = await postLead(JSON.stringify(payload), {
      'Content-Type': 'application/json',
    });

    if (result.success === false) {
      throw new Error(result.error || 'Apps Script returned an unknown error.');
    }

    return true;
  } catch {
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
        payload: JSON.stringify(payload),
      }).toString();

      const retryResult = await postLead(formBody, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      if (retryResult.success === false) {
        throw new Error(retryResult.error || 'Apps Script retry returned an unknown error.');
      }

      return true;
    } catch (error) {
      console.error(`Google Sheets lead sync failed for ${payload.formType}:`, error.message);
      return false;
    }
  }
}

function sourceFromRequest(request) {
  return request.headers.get('referer') || request.url;
}

export async function submitAuditLead(request, body) {
  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim();
  const website = normalizeWebsiteUrl(body.website);

  if (!name || !email || !phone || !website) {
    return { ok: false, status: 400, message: 'Missing name, email, website, or mobile number.' };
  }

  const validation = validateLeadSubmission(request.headers, 'audit', body, {
    name,
    email,
    phone,
    website,
    message: 'website audit',
  });

  if (!validation.ok) {
    return {
      ok: false,
      status: 400,
      message: 'We could not verify this submission. Please refresh the page and try again.',
    };
  }

  const payload = {
    formType: 'Free Website Audit',
    name,
    email,
    phone,
    website,
    service: '',
    message: '',
    source: sourceFromRequest(request),
    submittedAt: new Date().toISOString(),
  };

  try {
    const sheetsSaved = await sendLeadToGoogleSheets(payload);
    let emailDelivered = false;

    if (getTransporter()) {
      await sendMailOrThrow(
        {
          from: `"Digi Web Tech Audit Bot" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: `New Free Audit Request from ${name}`,
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
          `,
        },
        'Audit admin email',
      );
      emailDelivered = true;

      try {
        await sendMailOrThrow(
          {
            from: `"Arjun Rawat from Digi Web Tech" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Thank you for requesting an audit, ${name}!`,
            text: `Hello ${name},\n\nThank you for reaching out to Digi Web Tech. We've received your request for a free website audit for ${website}.\n\nOur team will analyze your site's SEO, performance, and conversion metrics. You will receive a detailed report within 24-48 hours.\n\nBest Regards,\nArjun Rawat\nDigi Web Tech`,
            html: `
              <div style="margin:0; padding:24px; background:#f4f8fc; font-family:Arial,Helvetica,sans-serif; color:#16324f;">
                <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #dbe7f3; border-radius:24px; overflow:hidden; box-shadow:0 18px 44px rgba(16,39,67,0.08);">
                  <div style="padding:28px 32px; background:linear-gradient(135deg,#0f2f57 0%,#1f6fe5 55%,#19b6d2 100%); color:#ffffff;">
                    <div style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; opacity:0.82;">Free Website Audit</div>
                    <h2 style="margin:14px 0 8px; font-size:30px; line-height:1.15; color:#ffffff;">We've received your audit request.</h2>
                    <p style="margin:0; font-size:15px; line-height:1.7; color:rgba(255,255,255,0.88);">Hello ${escapeHtml(name)}, thanks for trusting Digi Web Tech with your website review.</p>
                  </div>
                  <div style="padding:30px 32px;">
                    <div style="padding:18px 20px; background:#f7fbff; border:1px solid #d9e8f7; border-radius:18px;">
                      <div style="font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#4c6784; margin-bottom:10px;">Website Submitted</div>
                      <div style="font-size:16px; line-height:1.7; color:#16324f;"><a href="${escapeHtml(website)}" style="color:#1f6fe5; text-decoration:none;">${escapeHtml(website)}</a></div>
                    </div>
                    <p style="margin:22px 0 14px; font-size:15px; line-height:1.8; color:#425b76;">Our team will review your site's search visibility, technical health, content opportunities, and conversion friction points. You can expect a clear response within 24-48 business hours.</p>
                    <div style="padding:18px 20px; background:#ffffff; border:1px solid #e3edf7; border-radius:18px;">
                      <div style="font-size:15px; font-weight:700; color:#16324f; margin-bottom:12px;">What we'll review</div>
                      <ul style="margin:0; padding-left:18px; color:#425b76; line-height:1.8; font-size:14px;">
                        <li>Technical SEO and performance readiness</li>
                        <li>Content and intent alignment opportunities</li>
                        <li>High-impact fixes for stronger lead generation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            `,
          },
          'Audit auto-reply',
        );
      } catch {
        console.warn('Audit form submitted, but auto-reply email could not be sent.');
      }
    }

    if (!sheetsSaved && !emailDelivered) {
      return { ok: false, status: 500, message: getLeadFailureMessage('audit') };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      status: 500,
      message: 'Mail service unavailable. Please contact us via WhatsApp on +91 98712 64699',
    };
  }
}

export async function submitContactLead(request, body) {
  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim();
  const service = body.service?.trim();
  const message = body.message?.trim();
  const website = normalizeWebsiteUrl(body.website);
  const sourcePage = body.sourcePage?.trim() || sourceFromRequest(request);

  if (!name || !email || !phone || !message) {
    return { ok: false, status: 400, message: 'Missing name, email, phone, or message.' };
  }

  const validation = validateLeadSubmission(request.headers, 'contact', body, {
    name,
    email,
    phone,
    website,
    service,
    message,
  });

  if (!validation.ok) {
    return {
      ok: false,
      status: 400,
      message: 'We could not verify this submission. Please refresh the page and try again.',
    };
  }

  const payload = {
    formType: 'Contact Form',
    name,
    email,
    phone: phone || '',
    website: website || '',
    service: service || '',
    message,
    source: sourcePage,
    submittedAt: new Date().toISOString(),
  };

  try {
    const sheetsSaved = await sendLeadToGoogleSheets(payload);
    let emailDelivered = false;

    if (getTransporter()) {
      await sendMailOrThrow(
        {
          from: `"Digi Web Tech Contact Bot" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: `New Contact Inquiry from ${name}`,
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
            </div>
          `,
        },
        'Contact admin email',
      );
      emailDelivered = true;

      try {
        await sendMailOrThrow(
          {
            from: `"Arjun Rawat from Digi Web Tech" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `We've received your inquiry, ${name}!`,
            text: `Hello ${name},\n\nThank you for reaching out to us. We've received your query regarding ${service || 'our services'} and Arjun Rawat will get back to you shortly.\n\nWebsite: ${website || 'Not shared'}\n\nSummary of your message:\n${message}\n\nBest Regards,\nDigi Web Tech`,
            html: `
              <div style="margin:0; padding:24px; background:#f4f8fc; font-family:Arial,Helvetica,sans-serif; color:#16324f;">
                <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #dbe7f3; border-radius:24px; overflow:hidden; box-shadow:0 18px 44px rgba(16,39,67,0.08);">
                  <div style="padding:28px 32px; background:linear-gradient(135deg,#0f2f57 0%,#1f6fe5 55%,#19b6d2 100%); color:#ffffff;">
                    <div style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; opacity:0.82;">New Enquiry Received</div>
                    <h2 style="margin:14px 0 8px; font-size:30px; line-height:1.15; color:#ffffff;">We've received your message.</h2>
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
                  </div>
                </div>
              </div>
            `,
          },
          'Contact auto-reply',
        );
      } catch {
        console.warn('Contact form submitted, but auto-reply email could not be sent.');
      }
    }

    if (!sheetsSaved && !emailDelivered) {
      return { ok: false, status: 500, message: getLeadFailureMessage('contact') };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      status: 500,
      message:
        'Something went wrong with our mail server. Please try again later or call us at +91 98712 64699',
    };
  }
}
