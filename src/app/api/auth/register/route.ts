import { NextRequest, NextResponse } from 'next/server';
import { createUserSession, getAuthMode, registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    if (getAuthMode() !== 'users') {
      return NextResponse.json({ error: 'Registro não está habilitado' }, { status: 400 });
    }

    const { username, password } = await request.json();
    const { userId } = await registerUser(username ?? '', password ?? '');
    await createUserSession(userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao registrar';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

