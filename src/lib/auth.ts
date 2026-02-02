import { cookies } from 'next/headers';

const SESSION_COOKIE = 'faturamento_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export async function getSession(): Promise<boolean> {
  if (!process.env.APP_PASSWORD) return true; // Sem senha = acesso liberado
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return !!session?.value;
}

export async function validatePassword(password: string): Promise<boolean> {
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) return true; // Sem senha configurada = acesso liberado
  return password === appPassword;
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
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
  cookieStore.delete(SESSION_COOKIE);
}
