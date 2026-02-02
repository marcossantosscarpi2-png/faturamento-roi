import { cookies } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'faturamento_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export type AuthMode = 'open' | 'app_password' | 'users';

export function getAuthMode(): AuthMode {
  const raw = (process.env.AUTH_MODE || '').trim().toLowerCase();
  if (raw === 'users') return 'users';
  if (raw === 'open' || raw === 'none') return 'open';
  if (raw === 'app_password' || raw === 'password') return 'app_password';
  // Padrão novo: usuário/senha (para uso local)
  return 'users';
}

function sha256Base64Url(value: string): string {
  return crypto.createHash('sha256').update(value).digest('base64url');
}

function randomToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function pbkdf2Async(password: string, salt: Buffer, iterations: number, keylen: number) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

const PASSWORD_KDF = {
  name: 'pbkdf2_sha256',
  iterations: 120_000,
  saltBytes: 16,
  keylen: 32,
} as const;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(PASSWORD_KDF.saltBytes);
  const dk = await pbkdf2Async(password, salt, PASSWORD_KDF.iterations, PASSWORD_KDF.keylen);
  return `${PASSWORD_KDF.name}$${PASSWORD_KDF.iterations}$${salt.toString('base64')}$${dk.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [name, iterStr, saltB64, hashB64] = stored.split('$');
    if (name !== PASSWORD_KDF.name) return false;
    const iterations = parseInt(iterStr, 10);
    if (!iterations || iterations < 10_000) return false;
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const actual = await pbkdf2Async(password, salt, iterations, expected.length);
    // timing-safe
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export async function getSession(): Promise<boolean> {
  const mode = getAuthMode();
  if (mode === 'open') return true;

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return false;

  if (mode === 'app_password') return true;

  // mode === 'users'
  const tokenHash = sha256Base64Url(session.value);
  const found = await prisma.session.findUnique({
    where: { tokenHash },
    select: { id: true, expiresAt: true },
  });
  if (!found) return false;
  if (found.expiresAt.getTime() <= Date.now()) return false;
  return true;
}

export async function validatePassword(password: string): Promise<boolean> {
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) return true; // Sem senha configurada = acesso liberado (modo antigo)
  return password === appPassword;
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  const mode = getAuthMode();

  if (mode === 'users') {
    throw new Error('Use createUserSession(userId) no modo AUTH_MODE=users');
  }

  cookieStore.set(SESSION_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const mode = getAuthMode();
  const cur = cookieStore.get(SESSION_COOKIE)?.value;

  if (mode === 'users' && cur) {
    const tokenHash = sha256Base64Url(cur);
    await prisma.session.deleteMany({ where: { tokenHash } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUserId(): Promise<string | null> {
  const mode = getAuthMode();
  if (mode !== 'users') return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = sha256Base64Url(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: { userId: true, expiresAt: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;
  return session.userId;
}

export async function createUserSession(userId: string): Promise<void> {
  const mode = getAuthMode();
  if (mode !== 'users') throw new Error('createUserSession só é válido no modo AUTH_MODE=users');

  const token = randomToken();
  const tokenHash = sha256Base64Url(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await prisma.session.create({
    data: { tokenHash, userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function registerUser(username: string, password: string): Promise<{ userId: string }> {
  const normalized = (username || '').trim().toLowerCase();
  if (!normalized) throw new Error('Usuário é obrigatório');
  if (!password || password.length < 8) throw new Error('Senha deve ter pelo menos 8 caracteres');

  const existing = await prisma.user.findUnique({ where: { username: normalized }, select: { id: true } });
  if (existing) throw new Error('Usuário já cadastrado');

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username: normalized, passwordHash },
    select: { id: true },
  });
  return { userId: user.id };
}

export async function authenticateUser(username: string, password: string): Promise<{ userId: string } | null> {
  const normalized = (username || '').trim().toLowerCase();
  if (!normalized || !password) return null;

  const user = await prisma.user.findUnique({
    where: { username: normalized },
    select: { id: true, passwordHash: true },
  });
  if (!user) return null;

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { userId: user.id };
}
