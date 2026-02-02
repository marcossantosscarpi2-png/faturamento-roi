import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('faturamento_session');
  const path = request.nextUrl.pathname;

  const mode = (process.env.AUTH_MODE || '').trim().toLowerCase();
  const isUsersMode = mode === 'users';
  const isOpenMode = mode === 'open' || mode === 'none';

  // Acesso livre
  if (isOpenMode) {
    return NextResponse.next();
  }

  // Padrão: users (username/senha). Página inicial e /api/auth/* são públicas.
  if (!isUsersMode) {
    // Se não setar AUTH_MODE, assumimos users (compatível com getAuthMode()).
  }
  if (path === '/' || path.startsWith('/api/auth/')) return NextResponse.next();
  if (!session?.value) return NextResponse.redirect(new URL('/', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
