import { NextResponse } from 'next/server';

import {
  createAdminSession,
  getAdminCookieName,
  getAdminCookieOptions,
  validateAdminCredentials,
} from '@/lib/auth';

export async function POST(request) {
  const body = await request.json();
  const username = String(body?.username || '');
  const password = String(body?.password || '');

  try {
    const isValid = await validateAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }

    const token = await createAdminSession(username);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(getAdminCookieName(), token, getAdminCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
