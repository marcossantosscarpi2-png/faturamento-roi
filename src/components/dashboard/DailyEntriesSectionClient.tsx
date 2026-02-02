'use client';

import { useState, useMemo } from 'react';
import { DailyEntryCard } from './DailyEntryCard';
import { AddDayForm } from './AddDayForm';
import { DailyEntriesFilters, type SortOption, type CategoryFilterValue } from './DailyEntriesFilters';
import { formatBRL } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import { subDays, startOfDay } from 'date-fns';
import { calculateDailyExpense } from '@/lib/calculations';

interface Expense {
  id: string;
  category: string;
  amount: number | { toNumber?: () => number };
  description: string | null;
  isMonthly: boolean;
  manualAdjust: number | { toNumber?: () => number } | null;
}

interface Revenue {
  id: string;
  amount: number | { toNumber?: () => number };
  description: string | null;
}

interface DailyEntry {
  id: string;
  date: Date;
  observations: string | null;
  expenses: Expense[];
  revenues: Revenue[];
}

function toNum(v: number | { toNumber?: () => number } | null): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  return v.toNumber?.() ?? Number(v);
}

function calculateEntryTotals(entry: DailyEntry) {
  const totalExpense = entry.expenses.reduce((s, e) => {
    const amt = toNum(e.amount);
    const adj = toNum(e.manualAdjust);
    const expense = calculateDailyExpense(
      {
        category: e.category,
        amount: amt,
        isMonthly: e.isMonthly,
        manualAdjust: adj || null,
      },
      new Date(entry.date)
    );
    return s + expense;
  }, 0);
  const totalRevenue = entry.revenues.reduce((s, r) => s + toNum(r.amount), 0);
  const profit = totalRevenue - totalExpense;
  return { totalExpense, totalRevenue, profit };
}

export function DailyEntriesSectionClient({
  entries: initialEntries,
  operationId,
  period,
  expenseCategories,
}: {
  entries: DailyEntry[];
  operationId: string;
  period: number;
  expenseCategories: { value: string; label: string }[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>('all');

  const endDate = startOfDay(new Date());
  const startDate = period === 1 ? endDate : subDays(endDate, period - 1);

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...initialEntries];

    // Filtro por categoria de gasto
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((entry) =>
        entry.expenses.some((e) => e.category === categoryFilter)
      );
    }

    // Aplicar busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) => {
        const dateStr = new Date(entry.date).toLocaleDateString('pt-BR');
        const observations = (entry.observations || '').toLowerCase();
        return dateStr.includes(query) || observations.includes(query);
      });
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      const aTotals = calculateEntryTotals(a);
      const bTotals = calculateEntryTotals(b);

      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'revenue-desc':
          return bTotals.totalRevenue - aTotals.totalRevenue;
        case 'revenue-asc':
          return aTotals.totalRevenue - bTotals.totalRevenue;
        case 'expense-desc':
          return bTotals.totalExpense - aTotals.totalExpense;
        case 'expense-asc':
          return aTotals.totalExpense - bTotals.totalExpense;
        case 'profit-desc':
          return bTotals.profit - aTotals.profit;
        case 'profit-asc':
          return aTotals.profit - bTotals.profit;
        default:
          return 0;
      }
    });

    return filtered;
  }, [initialEntries, searchQuery, sortBy, categoryFilter]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lançamentos diários</h3>
        <AddDayForm operationId={operationId} startDate={startDate} endDate={endDate} />
      </div>

      <DailyEntriesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categoryOptions={expenseCategories}
      />

      {filteredAndSortedEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 p-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-2">
            {searchQuery ? 'Nenhum lançamento encontrado com essa busca.' : 'Nenhum lançamento diário ainda.'}
          </p>
          {!searchQuery && (
            <p className="text-sm text-muted-foreground">Adicione um novo dia para começar a registrar seus lançamentos.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedEntries.map((entry) => (
            <DailyEntryCard
              key={entry.id}
              entry={entry}
              operationId={operationId}
              categories={expenseCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
}
