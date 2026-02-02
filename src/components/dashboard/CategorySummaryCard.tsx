import { formatBRL } from '@/lib/utils';
import type { CategorySummaryItem } from '@/lib/data';
import { PieChart } from 'lucide-react';

interface CategorySummaryCardProps {
  items: CategorySummaryItem[];
  categoryLabels: Record<string, string>;
  total: number;
}

export function CategorySummaryCard({
  items,
  categoryLabels,
  total,
}: CategorySummaryCardProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4 animate-fade-in">
        <h3 className="mb-3 flex items-center gap-2 font-semibold" id="category-summary-heading">
          <PieChart className="h-4 w-4 text-muted-foreground" aria-hidden />
          Gastos por categoria
        </h3>
        <p className="text-sm text-muted-foreground">Nenhum gasto no período.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 animate-fade-in" aria-labelledby="category-summary-heading">
      <h3 className="mb-3 flex items-center gap-2 font-semibold" id="category-summary-heading">
        <PieChart className="h-4 w-4 text-muted-foreground" aria-hidden />
        Gastos por categoria
      </h3>
      <ul className="space-y-2 text-sm" role="list">
        {items.map(({ category, total: catTotal }) => {
          const pct = total > 0 ? ((catTotal / total) * 100).toFixed(0) : '0';
          const label = categoryLabels[category] ?? category;
          return (
            <li key={category} className="flex items-center justify-between gap-2">
              <span className="truncate">{label}</span>
              <span className="flex-shrink-0 font-medium">{formatBRL(catTotal)}</span>
              <span className="text-muted-foreground text-xs">({pct}%)</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
