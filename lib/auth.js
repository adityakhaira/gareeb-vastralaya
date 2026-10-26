import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_SESSION_COOKIE = 'gv_admin_session';
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const secret = process.env.ADMIN_SESSION_SECRET || 'development-admin-secret-change-me';

function signPayload(payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function createAdminSessionToken() {
  const payload = JSON.stringify({
    sub: 'admin',
    exp: Date.now() + ADMIN_SESSION_TTL_MS,
    iat: Date.now()
  });

  const encoded = Buffer.from(payload, 'utf8').toString('base64url');
  return `${encoded}.${signPayload(encoded)}`;
}

export function verifyAdminSessionToken(token) {
  if (!token) return null;

  const index = token.lastIndexOf('.');
  if (index <= 0) return null;

  const encoded = token.slice(0, index);
  const signature = token.slice(index + 1);
  const expected = signPayload(encoded);

  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload || !payload.sub || payload.sub !== 'admin') return null;
    if (payload.exp && payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setAdminSessionCookie(response) {
  const token = createAdminSessionToken();
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000)
  });
  return token;
}

export function clearAdminSessionCookie(response) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

export function getAdminSessionFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const value = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  const token = value ? value.slice(ADMIN_SESSION_COOKIE.length + 1) : null;
  if (!token) return null;
  return verifyAdminSessionToken(decodeURIComponent(token));
}

export function requireAdminSession() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifyAdminSessionToken(token);
  if (!session) redirect('/admin/login');
  return session;
}

export function isAdminAuthenticated() {
  return Boolean(verifyAdminSessionToken(cookies().get(ADMIN_SESSION_COOKIE)?.value));
}
