'use client';

import { AlertTriangle } from 'lucide-react';
import { formatBRL } from '@/lib/utils';

interface BudgetAlertProps {
  dailyBudget: number;
  totalExpense: number;
  period: number;
}

export function BudgetAlert({ dailyBudget, totalExpense, period }: BudgetAlertProps) {
  const avgDailyExpense = totalExpense / period;
  const exceeded = avgDailyExpense > dailyBudget;
  const percentage = dailyBudget > 0 ? ((avgDailyExpense / dailyBudget) * 100).toFixed(1) : 0;

  if (!exceeded && avgDailyExpense < dailyBudget * 0.9) {
    return null; // Não mostrar alerta se está dentro do orçamento
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        exceeded
          ? 'border-destructive bg-destructive/10'
          : 'border-yellow-500 bg-yellow-500/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
            exceeded ? 'text-destructive' : 'text-yellow-600'
          }`}
        />
        <div className="flex-1">
          <h4 className={`font-semibold text-sm mb-1 ${exceeded ? 'text-destructive' : 'text-yellow-700'}`}>
            {exceeded ? 'Orçamento ultrapassado!' : 'Atenção ao orçamento'}
          </h4>
          <p className="text-sm text-muted-foreground">
            Gasto médio diário: <strong className="text-foreground">{formatBRL(avgDailyExpense)}</strong>
            {' / '}
            Orçamento diário: <strong className="text-foreground">{formatBRL(dailyBudget)}</strong>
            {' '}
            ({percentage}%)
          </p>
          {exceeded && (
            <p className="text-xs text-destructive mt-2">
              Você está gastando em média {formatBRL(avgDailyExpense - dailyBudget)} acima do orçamento diário.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
