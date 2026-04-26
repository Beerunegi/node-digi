import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const CMS_COOKIE_NAME = 'digiwebtech_admin_session';
const cookieMaxAge = 60 * 60 * 12;

function getJwtSecret() {
  return new TextEncoder().encode(process.env.CMS_JWT_SECRET || 'replace-this-too');
}

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch {
    return null;
  }
}

export async function validateAdminCredentials(username, password) {
  const expectedUsername = process.env.CMS_ADMIN_USERNAME;
  const expectedHash = process.env.CMS_ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !expectedHash) {
    throw new Error('CMS admin credentials are not configured.');
  }

  if (username !== expectedUsername) {
    return false;
  }

  return bcrypt.compare(password, expectedHash);
}

export async function createAdminSession(username) {
  return new SignJWT({ sub: username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${cookieMaxAge}s`)
    .sign(getJwtSecret());
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CMS_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function requireAdminPageSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  return session;
}

export async function verifyAdminRequest(request) {
  const token = request.cookies.get(CMS_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export function getAdminCookieName() {
  return CMS_COOKIE_NAME;
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: cookieMaxAge,
  };
}
