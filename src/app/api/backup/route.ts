import { NextResponse } from 'next/server';
import { getSession, getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  const operations = await prisma.operation.findMany({
    where: userId != null ? { userId } : {},
    orderBy: { name: 'asc' },
    include: {
      dailyEntries: {
        orderBy: { date: 'asc' },
        include: {
          expenses: true,
          revenues: true,
        },
      },
    },
  });

  const data = {
    exportedAt: new Date().toISOString(),
    version: 1,
    operations: operations.map((op) => ({
      id: op.id,
      name: op.name,
      dailyBudget: op.dailyBudget,
      pixAccount: op.pixAccount,
      expenseCategories: op.expenseCategories,
      createdAt: op.createdAt.toISOString(),
      updatedAt: op.updatedAt.toISOString(),
      dailyEntries: op.dailyEntries.map((e) => ({
        id: e.id,
        date: e.date.toISOString().slice(0, 10),
        observations: e.observations,
        expenses: e.expenses.map((x) => ({
          id: x.id,
          category: x.category,
          amount: x.amount,
          description: x.description,
          isMonthly: x.isMonthly,
          manualAdjust: x.manualAdjust,
          createdAt: x.createdAt.toISOString(),
        })),
        revenues: e.revenues.map((r) => ({
          id: r.id,
          amount: r.amount,
          description: r.description,
          time: r.time,
          createdAt: r.createdAt.toISOString(),
        })),
      })),
    })),
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="faturamento-roi-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
