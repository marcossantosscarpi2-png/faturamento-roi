import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { operationId, date } = await request.json();
  if (!operationId || !date) {
    return NextResponse.json({ error: 'operationId e date são obrigatórios' }, { status: 400 });
  }

  // Parse YYYY-MM-DD como data local (evita problema de timezone - new Date("2025-02-02") interpreta como UTC)
  const [y, m, day] = date.split('-').map(Number);
  const d = new Date(y, m - 1, day);

  const entry = await prisma.dailyEntry.upsert({
    where: {
      operationId_date: { operationId, date: d },
    },
    create: { operationId, date: d },
    update: {},
  });
  return NextResponse.json({ success: true, entryId: entry.id });
}
