import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateUser,
  createSession,
  createUserSession,
  getAuthMode,
  validatePassword,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const mode = getAuthMode();
    const body = await request.json();

    if (mode === 'users') {
      const { username, password } = body ?? {};
      const auth = await authenticateUser(username ?? '', password ?? '');
      if (!auth) {
        return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 });
      }
      await createUserSession(auth.userId);
      return NextResponse.json({ success: true });
    }

    // Modo legado: senha única (APP_PASSWORD)
    const { password } = body ?? {};
    const valid = await validatePassword(password ?? '');
    if (!valid) {
      return NextResponse.json({ error: 'Senha inválida' }, { status: 401 });
    }
    await createSession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao autenticar' }, { status: 500 });
  }
}
