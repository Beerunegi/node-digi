import { NextResponse } from 'next/server';

import { submitContactLead } from '@/lib/lead';

export async function POST(request) {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const result = await submitContactLead(request, body);

  if (!result.ok) {
    return new NextResponse(result.message, { status: result.status });
  }

  return NextResponse.redirect(new URL('/thank-you', request.url), 303);
}
