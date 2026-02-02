'use client';

import { Search, ArrowUpDown, X } from 'lucide-react';

export type SortOption = 'date-desc' | 'date-asc' | 'revenue-desc' | 'revenue-asc' | 'expense-desc' | 'expense-asc' | 'profit-desc' | 'profit-asc';

export type CategoryFilterValue = 'all' | string;

interface DailyEntriesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  categoryFilter: CategoryFilterValue;
  onCategoryFilterChange: (value: CategoryFilterValue) => void;
  categoryOptions: { value: string; label: string }[];
}

export function DailyEntriesFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
}: DailyEntriesFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por data, observações..."
          className="w-full rounded-lg border bg-background pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] sm:min-h-0"
          aria-label="Buscar lançamentos"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <label className="sr-only" htmlFor="filter-category">Filtrar por categoria</label>
      <select
        id="filter-category"
        value={categoryFilter}
        onChange={(e) => onCategoryFilterChange(e.target.value as CategoryFilterValue)}
        className="rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] sm:min-h-0 w-full sm:w-auto"
        aria-label="Filtrar por categoria de gasto"
      >
        <option value="all">Todas as categorias</option>
        {categoryOptions.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <div className="relative w-full sm:w-auto">
        <label className="sr-only" htmlFor="filter-sort">Ordenar por</label>
        <select
          id="filter-sort"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="appearance-none rounded-lg border bg-background px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] sm:min-h-0 w-full sm:w-auto"
          aria-label="Ordenar lançamentos por"
        >
          <option value="date-desc">Data (mais recente)</option>
          <option value="date-asc">Data (mais antiga)</option>
          <option value="revenue-desc">Receita (maior)</option>
          <option value="revenue-asc">Receita (menor)</option>
          <option value="expense-desc">Gasto (maior)</option>
          <option value="expense-asc">Gasto (menor)</option>
          <option value="profit-desc">Lucro (maior)</option>
          <option value="profit-asc">Lucro (menor)</option>
        </select>
        <ArrowUpDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-muted-foreground" aria-hidden />
      </div>
    </div>
  );
}
