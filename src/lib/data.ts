import { prisma } from './prisma';
import { subDays, startOfDay, differenceInDays } from 'date-fns';
import { calculateDailyExpense } from './calculations';

export interface DayStats {
  date: string;
  totalExpense: number;
  totalRevenue: number;
  profit: number;
  roi: number | null;
}

function getStatsFromEntries(
  entries: Awaited<ReturnType<typeof prisma.dailyEntry.findMany>>,
  startDate: Date,
  endDate: Date
) {
  const daysMap = new Map<string, DayStats>();
  const numDays = Math.max(1, differenceInDays(endDate, startDate) + 1);
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    if (d > endDate) break;
    const key = d.toISOString().slice(0, 10);
    daysMap.set(key, {
      date: key,
      totalExpense: 0,
      totalRevenue: 0,
      profit: 0,
      roi: null,
    });
  }

  for (const entry of entries) {
    const key = entry.date.toISOString().slice(0, 10);
    const stats = daysMap.get(key);
    if (!stats) continue;

    let totalExp = 0;
    for (const exp of entry.expenses) {
      totalExp += calculateDailyExpense(
        {
          category: exp.category,
          amount: Number(exp.amount),
          isMonthly: exp.isMonthly,
          manualAdjust: exp.manualAdjust ? Number(exp.manualAdjust) : null,
        },
        entry.date
      );
    }
    const totalRev = entry.revenues.reduce((s, r) => s + Number(r.amount), 0);
    const profit = totalRev - totalExp;
    const roi = totalExp > 0 ? totalRev / totalExp : null;

    stats.totalExpense = totalExp;
    stats.totalRevenue = totalRev;
    stats.profit = profit;
    stats.roi = roi;
  }

  const daysList = Array.from(daysMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => v);

  const totalRevenue = daysList.reduce((s, d) => s + d.totalRevenue, 0);
  const totalExpense = daysList.reduce((s, d) => s + d.totalExpense, 0);
  const totalProfit = totalRevenue - totalExpense;
  const rois = daysList.map((d) => d.roi).filter((r): r is number => r !== null);
  const avgRoi = rois.length > 0 ? rois.reduce((a, b) => a + b, 0) / rois.length : null;

  return { days: daysList, totalRevenue, totalExpense, totalProfit, avgRoi };
}

export async function getOperationStatsByRange(
  operationId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  days: DayStats[];
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  avgRoi: number | null;
}> {
  const entries = await prisma.dailyEntry.findMany({
    where: {
      operationId,
      date: { gte: startDate, lte: endDate },
    },
    include: { expenses: true, revenues: true },
    orderBy: { date: 'asc' },
  });

  return getStatsFromEntries(entries, startDate, endDate);
}

export async function getOperationStats(
  operationId: string,
  days: number
): Promise<{
  days: DayStats[];
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  avgRoi: number | null;
}> {
  const endDate = startOfDay(new Date());
  const startDate = days === 1 ? endDate : subDays(endDate, days - 1);

  const entries = await prisma.dailyEntry.findMany({
    where: {
      operationId,
      date: { gte: startDate, lte: endDate },
    },
    include: {
      expenses: true,
      revenues: true,
    },
    orderBy: { date: 'asc' },
  });

  return getStatsFromEntries(entries, startDate, endDate);
}

export function getInsightsFromDayStats(dayStats: DayStats[]) {
  const rois = dayStats.map((d) => d.roi).filter((r): r is number => r !== null);
  const expenses = dayStats.map((d) => d.totalExpense);

  const avgExpense = expenses.length ? expenses.reduce((a, b) => a + b, 0) / expenses.length : 0;
  const daysAboveAvg = dayStats.filter((d) => d.totalExpense > avgExpense && avgExpense > 0);

  let roiVariation: number | null = null;
  if (rois.length >= 2) {
    const first = rois.slice(0, Math.floor(rois.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(rois.length / 2);
    const second = rois.slice(Math.floor(rois.length / 2)).reduce((a, b) => a + b, 0) / (rois.length - Math.floor(rois.length / 2));
    roiVariation = first !== 0 ? ((second - first) / Math.abs(first)) * 100 : null;
  }

  return {
    roiVariation,
    daysAboveAvg: daysAboveAvg.length,
    avgExpense,
  };
}

export async function getInsights(operationId: string, days: number) {
  const { days: dayStats } = await getOperationStats(operationId, days);
  return getInsightsFromDayStats(dayStats);
}

export interface CategorySummaryItem {
  category: string;
  total: number;
}

export async function getExpenseSummaryByCategory(
  operationId: string,
  days: number
): Promise<CategorySummaryItem[]> {
  const endDate = startOfDay(new Date());
  const startDate = days === 1 ? endDate : subDays(endDate, days - 1);
  return getExpenseSummaryByRange(operationId, startDate, endDate);
}

export async function getExpenseSummaryByRange(
  operationId: string,
  startDate: Date,
  endDate: Date
): Promise<CategorySummaryItem[]> {
  const entries = await prisma.dailyEntry.findMany({
    where: {
      operationId,
      date: { gte: startDate, lte: endDate },
    },
    include: { expenses: true },
    orderBy: { date: 'asc' },
  });

  const byCategory = new Map<string, number>();

  for (const entry of entries) {
    for (const exp of entry.expenses) {
      const dailyAmount = calculateDailyExpense(
        {
          category: exp.category,
          amount: Number(exp.amount),
          isMonthly: exp.isMonthly,
          manualAdjust: exp.manualAdjust ? Number(exp.manualAdjust) : null,
        },
        entry.date
      );
      const cur = byCategory.get(exp.category) ?? 0;
      byCategory.set(exp.category, cur + dailyAmount);
    }
  }

  return Array.from(byCategory.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}
