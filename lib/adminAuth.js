import { SignJWT, jwtVerify } from 'jose';

// Menggantikan ADMIN_SECRET statis di edge function lama (verify-login/db-write).
// Set ADMIN_JWT_SECRET di env (server-side only, jangan pakai prefix NEXT_PUBLIC_).
const secret = () => new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

const EXPIRES_IN = '12h';
export const ADMIN_COOKIE_NAME = 'naposo_admin_session';

export async function signAdminToken({ username, role }) {
  return await new SignJWT({ role: role || 'admin_naposo' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret());
}

export async function verifyAdminToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload; // { sub: username, role, iat, exp }
  } catch {
    return null; // expired, tampered, or invalid signature
  }
}
