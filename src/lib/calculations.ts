import { getDaysInMonth } from 'date-fns';

export interface ExpenseInput {
  category: string;
  amount: number;
  isMonthly: boolean;
  manualAdjust?: number | null;
}

// Rateia valor mensal pelos dias do mês
export function prorateMonthly(amount: number, date: Date): number {
  const daysInMonth = getDaysInMonth(date);
  return amount / daysInMonth;
}

export function calculateDailyExpense(expense: ExpenseInput, date: Date): number {
  let base = expense.amount;
  if (expense.isMonthly) {
    base = prorateMonthly(expense.amount, date);
  }
  return base + (expense.manualAdjust ?? 0);
}

export function calculateROI(revenue: number, expense: number): number | null {
  if (expense <= 0) return null;
  return revenue / expense; // ROI em X (retorno por real gasto)
}
