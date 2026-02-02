export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'ADS', label: 'Ads' },
  { id: 'IA', label: 'IA' },
  { id: 'CHIPS', label: 'Chips' },
  { id: 'VARIAVEL', label: 'Gastos variáveis' },
] as const;

export type ExpenseCategoryItem = { id: string; label: string };

export function getExpenseCategories(operation: { expenseCategories: string | null } | null): ExpenseCategoryItem[] {
  if (!operation?.expenseCategories) {
    return [...DEFAULT_EXPENSE_CATEGORIES];
  }
  try {
    const parsed = JSON.parse(operation.expenseCategories) as ExpenseCategoryItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_EXPENSE_CATEGORIES];
  } catch {
    return [...DEFAULT_EXPENSE_CATEGORIES];
  }
}

export function getExpenseCategoriesForSelect(operation: { expenseCategories: string | null } | null): { value: string; label: string }[] {
  return getExpenseCategories(operation).map((c) => ({ value: c.id, label: c.label }));
}
