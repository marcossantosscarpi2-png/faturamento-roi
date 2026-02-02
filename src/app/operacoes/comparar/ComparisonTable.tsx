'use client';

import Link from 'next/link';
import { formatBRL, formatROIx } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';

interface OpStats {
  id: string;
  name: string;
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  avgRoi: number | null;
}

interface ComparisonTableProps {
  statsByOp: OpStats[];
  currentPeriod: number;
}

const PERIODS = [
  { value: 1, label: 'Hoje' },
  { value: 7, label: '7 dias' },
  { value: 15, label: '15 dias' },
  { value: 30, label: '30 dias' },
];

export function ComparisonTable({ statsByOp, currentPeriod }: ComparisonTableProps) {
  if (statsByOp.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden />
        <p className="text-muted-foreground mb-2">Nenhuma operação cadastrada.</p>
        <Link
          href="/operacoes/nova"
          className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Criar primeira operação
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Período:</span>
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={`/operacoes/comparar?period=${p.value}`}
            className={`min-h-[44px] sm:min-h-0 rounded-lg px-3 py-2 text-sm font-medium transition flex items-center ${
              currentPeriod === p.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            aria-current={currentPeriod === p.value ? 'page' : undefined}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm" aria-label="Comparativo de operações">
          <thead>
            <tr className="border-b bg-muted/50">
              <th scope="col" className="text-left p-4 font-semibold">Operação</th>
              <th scope="col" className="text-right p-4 font-semibold">Receita</th>
              <th scope="col" className="text-right p-4 font-semibold">Gastos</th>
              <th scope="col" className="text-right p-4 font-semibold">Lucro</th>
              <th scope="col" className="text-right p-4 font-semibold">ROI médio</th>
              <th scope="col" className="text-left p-4 font-semibold w-20">Ação</th>
            </tr>
          </thead>
          <tbody>
            {statsByOp.map((op) => (
              <tr key={op.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">
                  <Link href={`/operacoes/${op.id}`} className="text-primary hover:underline">
                    {op.name}
                  </Link>
                </td>
                <td className="p-4 text-right text-emerald-600 font-medium">{formatBRL(op.totalRevenue)}</td>
                <td className="p-4 text-right text-destructive font-medium">{formatBRL(op.totalExpense)}</td>
                <td className={`p-4 text-right font-medium ${op.totalProfit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                  {formatBRL(op.totalProfit)}
                </td>
                <td className="p-4 text-right font-medium">
                  {op.avgRoi !== null ? formatROIx(op.avgRoi) : '—'}
                </td>
                <td className="p-4">
                  <Link
                    href={`/operacoes/${op.id}`}
                    className="text-primary hover:underline text-xs font-medium"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
