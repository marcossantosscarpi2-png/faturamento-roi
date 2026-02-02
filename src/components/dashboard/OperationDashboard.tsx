import { prisma } from '@/lib/prisma';
import { getOperationStats, getInsights, getExpenseSummaryByCategory } from '@/lib/data';
import { formatBRL, formatROIx } from '@/lib/utils';
import { getExpenseCategoriesForSelect, getExpenseCategories } from '@/lib/expenseCategories';
import { PeriodSelector } from './PeriodSelector';
import { DashboardCharts } from './DashboardCharts';
import { DailyEntriesSection } from './DailyEntriesSection';
import { InsightsSection } from './InsightsSection';
import { ExportButtons } from './ExportButtons';
import { BudgetAlert } from './BudgetAlert';
import { CategorySummaryCard } from './CategorySummaryCard';
import { TrendingUp, Wallet, DollarSign, BarChart3 } from 'lucide-react';

export async function OperationDashboard({
  operationId,
  period = 7,
}: {
  operationId: string;
  period?: number;
}) {
  const [operation, stats, insights, categorySummary] = await Promise.all([
    prisma.operation.findUnique({ where: { id: operationId } }),
    getOperationStats(operationId, period),
    getInsights(operationId, period),
    getExpenseSummaryByCategory(operationId, period),
  ]);

  if (!operation) return null;

  const categoryLabels: Record<string, string> = {};
  getExpenseCategories(operation).forEach((c) => {
    categoryLabels[c.id] = c.label;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PeriodSelector operationId={operationId} currentPeriod={period} />
        <ExportButtons operationId={operationId} period={period} />
      </div>

      <BudgetAlert
        dailyBudget={operation.dailyBudget}
        totalExpense={stats.totalExpense}
        period={period}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 animate-fade-in transition-smooth hover:shadow-md flex items-start gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2" aria-hidden>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-2xl font-bold text-emerald-600">{formatBRL(stats.totalRevenue)}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 animate-fade-in transition-smooth hover:shadow-md flex items-start gap-3">
          <div className="rounded-lg bg-destructive/10 p-2" aria-hidden>
            <Wallet className="h-5 w-5 text-destructive" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Gastos Totais</p>
            <p className="text-2xl font-bold text-destructive">{formatBRL(stats.totalExpense)}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 animate-fade-in transition-smooth hover:shadow-md flex items-start gap-3">
          <div className={`rounded-lg p-2 ${stats.totalProfit >= 0 ? 'bg-emerald-500/10' : 'bg-destructive/10'}`} aria-hidden>
            <DollarSign className={`h-5 w-5 ${stats.totalProfit >= 0 ? 'text-emerald-600' : 'text-destructive'}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Lucro</p>
            <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
              {formatBRL(stats.totalProfit)}
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 animate-fade-in transition-smooth hover:shadow-md flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2" aria-hidden>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">ROI Médio</p>
            <p className="text-2xl font-bold">
              {stats.avgRoi !== null ? formatROIx(stats.avgRoi) : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightsSection insights={insights} />
        <CategorySummaryCard
          items={categorySummary}
          categoryLabels={categoryLabels}
          total={stats.totalExpense}
        />
      </div>

      <DailyEntriesSection
        operationId={operationId}
        period={period}
        expenseCategories={getExpenseCategoriesForSelect(operation)}
      />

      <DashboardCharts days={stats.days} />
    </div>
  );
}
