import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { connectToDatabase } from '../db';
import { accounts, authRateLimits, profiles, sessions } from '../db/schema';

const COOKIE = 'campus_session';
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const WINDOW_SECONDS = 15 * 60;
// scrypt: 32 MiB of memory, with three passes. Passwords are never stored directly.
const SCRYPT_OPTIONS = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

export class AuthError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function hashText(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64, SCRYPT_OPTIONS).toString('hex');
  return `scrypt$32768$8$3$${salt}$${key}`;
}

function verifyPassword(password: string, stored?: string) {
  const parts = stored?.split('$');
  const valid = parts?.length === 6 && parts.slice(0, 4).join('$') === 'scrypt$32768$8$3';
  // An unknown email still performs the same password calculation.
  const salt = valid ? parts[4] : '00000000000000000000000000000000';
  const expected = Buffer.from(valid ? parts[5] : '00'.repeat(64), 'hex');
  const actual = scryptSync(password, salt, 64, SCRYPT_OPTIONS);
  return !!valid && actual.length === expected.length && timingSafeEqual(actual, expected);
}

function readSessionToken(req: Request) {
  const value = req.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(COOKIE + '='))
    ?.slice(COOKIE.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

function makeSessionCookie(req: Request, token: string, maxAge = SESSION_SECONDS) {
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function sendSessionResponse(req: Request, token: string, status = 200) {
  return Response.json(
    { ok: true },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'Set-Cookie': makeSessionCookie(req, token, token ? SESSION_SECONDS : 0),
      },
    },
  );
}

export async function findSignedInStudent(req: Request) {
  const token = readSessionToken(req);
  if (!token) return null;
  const rows = await connectToDatabase()
    .select({ userId: accounts.id, email: accounts.email })
    .from(sessions)
    .innerJoin(accounts, eq(sessions.userId, accounts.id))
    .where(
      and(
        eq(sessions.tokenHash, hashText(token)),
        gt(sessions.expiresAt, Math.floor(Date.now() / 1000)),
      ),
    );
  return rows[0] ?? null;
}

async function checkRequestLimit(key: string, maximum: number) {
  const db = connectToDatabase();
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / WINDOW_SECONDS);
  const recordKey = hashText(`${key}:${window}`);
  const rows = await db
    .insert(authRateLimits)
    .values({ key: recordKey, attempts: 1, expiresAt: (window + 1) * WINDOW_SECONDS })
    .onConflictDoUpdate({
      target: authRateLimits.key,
      set: { attempts: sql`${authRateLimits.attempts} + 1` },
    })
    .returning({ attempts: authRateLimits.attempts });
  if (rows[0].attempts > maximum)
    throw new AuthError('Too many attempts. Please wait 15 minutes and try again.', 429);
}

async function createStudentSession(req: Request, userId: string) {
  const db = connectToDatabase();
  const previous = readSessionToken(req);
  const token = randomBytes(32).toString('hex');
  const now = Math.floor(Date.now() / 1000);
  await db.batch([
    db.delete(sessions).where(lt(sessions.expiresAt, now)),
    db.delete(authRateLimits).where(lt(authRateLimits.expiresAt, now)),
    db.delete(sessions).where(eq(sessions.tokenHash, previous ? hashText(previous) : 'none')),
    db
      .insert(sessions)
      .values({ tokenHash: hashText(token), userId, expiresAt: now + SESSION_SECONDS }),
  ]);
  return token;
}

export async function handleStudentAuthentication(req: Request, path: string, input: Record<string, unknown>) {
  const db = connectToDatabase();
  if (path === 'auth/logout') {
    const token = readSessionToken(req);
    if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashText(token)));
    return sendSessionResponse(req, '');
  }
  if (!['auth/login', 'auth/register'].includes(path)) throw new AuthError('Not found.', 404);

  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = input.password;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthError('Enter a valid email address.');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new AuthError('Use a password with 8–128 characters.');
  }
  // Cloudflare supplies this header in production; local development shares a bucket.
  await checkRequestLimit('ip:' + (req.headers.get('cf-connecting-ip') || 'local'), 60);
  await checkRequestLimit(path + ':' + email, 10);

  const existing = (await db.select().from(accounts).where(eq(accounts.email, email)))[0];
  if (path === 'auth/login') {
    if (!verifyPassword(password, existing?.passwordHash))
      throw new AuthError('Email or password is incorrect.', 401);
    return sendSessionResponse(req, await createStudentSession(req, existing.id));
  }

  const displayName = typeof input.displayName === 'string' ? input.displayName.trim() : '';
  if (displayName.length < 2 || displayName.length > 50)
    throw new AuthError('Your name must contain 2–50 characters.');
  if (input.confirmPassword !== password) throw new AuthError('The passwords do not match.');
  if (!['incoming', 'current'].includes(String(input.studentType)))
    throw new AuthError('Choose your student type.');
  if (existing) throw new AuthError('An account already uses this email. Log in instead.', 409);

  const id = crypto.randomUUID();
  const hash = hashPassword(password);
  try {
    await db.batch([
      db
        .insert(accounts)
        .values({ id, email, passwordHash: hash, createdAt: new Date().toISOString() }),
      db
        .insert(profiles)
        .values({ userId: id, displayName, studentType: String(input.studentType) }),
    ]);
  } catch (error) {
    // Handle two simultaneous registrations without leaving a partial profile.
    if ((await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.email, email)))[0]) {
      throw new AuthError('An account already uses this email. Log in instead.', 409);
    }
    throw error;
  }
  return sendSessionResponse(req, await createStudentSession(req, id), 201);
}
