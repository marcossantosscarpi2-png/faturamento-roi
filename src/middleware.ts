import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas (login)
const publicPaths = ['/', '/api/auth/login'];

export function middleware(request: NextRequest) {
  const session = request.cookies.get('faturamento_session');
  const path = request.nextUrl.pathname;

  // Se não tem senha configurada, deixa passar
  if (!process.env.APP_PASSWORD) {
    return NextResponse.next();
  }

  // Rotas públicas
  if (path === '/' || path.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  if (!session?.value) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
