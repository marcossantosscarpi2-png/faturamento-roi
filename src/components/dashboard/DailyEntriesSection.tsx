import { prisma } from '@/lib/prisma';
import { subDays, startOfDay } from 'date-fns';
import { DailyEntriesSectionClient } from './DailyEntriesSectionClient';

export async function DailyEntriesSection({
  operationId,
  period,
  expenseCategories,
}: {
  operationId: string;
  period: number;
  expenseCategories: { value: string; label: string }[];
}) {
  const endDate = startOfDay(new Date());
  const startDate = period === 1 ? endDate : subDays(endDate, period - 1);

  const entries = await prisma.dailyEntry.findMany({
    where: {
      operationId,
      date: { gte: startDate, lte: endDate },
    },
    include: {
      expenses: true,
      revenues: true,
    },
    orderBy: { date: 'desc' },
  });

  return (
    <DailyEntriesSectionClient
      entries={entries as any}
      operationId={operationId}
      period={period}
      expenseCategories={expenseCategories}
    />
  );
}
