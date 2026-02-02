import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
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
