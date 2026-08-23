import { NextResponse } from 'next/server';

import { submitAuditLead } from '@/lib/lead';
import { absoluteUrl } from '@/lib/site-config';

export async function POST(request) {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const result = await submitAuditLead(request, body);

  if (!result.ok) {
    return new NextResponse(result.message, { status: result.status });
  }

  const host = request.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const redirectUrl = isLocal ? new URL('/thank-you', request.url) : absoluteUrl('/thank-you');

  return NextResponse.redirect(redirectUrl, 303);
}
