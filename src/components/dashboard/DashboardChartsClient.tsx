'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { formatBRL } from '@/lib/utils';
import type { DayStats } from '@/lib/data';
import { Checkbox } from '@/components/ui/Checkbox';
import { Filter } from 'lucide-react';

interface DashboardChartsClientProps {
  days: DayStats[];
}

type CategoryFilter = 'all' | 'revenue' | 'expense' | 'profit' | 'roi';

export function DashboardChartsClient({ days }: DashboardChartsClientProps) {
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const chartData = useMemo(() => {
    return days.map((d) => ({
      ...d,
      dateShort: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }));
  }, [days]);

  // Calcular linha de tendência simples (média móvel)
  const chartDataWithTrend = useMemo(() => {
    if (!showTrendLine || chartData.length < 2) {
      return chartData;
    }
    
    const windowSize = Math.min(3, Math.floor(chartData.length / 2));
    return chartData.map((d, index) => {
      const start = Math.max(0, index - windowSize);
      const end = Math.min(chartData.length, index + windowSize + 1);
      const slice = chartData.slice(start, end);
      
      const avgProfit = slice.reduce((s, d) => s + d.profit, 0) / slice.length;
      const rois = slice.map(d => d.roi).filter((r): r is number => r !== null);
      const avgRoi = rois.length > 0 ? rois.reduce((a, b) => a + b, 0) / rois.length : null;
      
      return {
        ...d,
        trendProfit: avgProfit,
        trendRoi: avgRoi,
      };
    });
  }, [chartData, showTrendLine]);

  const filteredChartData = useMemo(() => {
    const data = categoryFilter === 'all' ? chartDataWithTrend : chartDataWithTrend.filter((d) => {
      switch (categoryFilter) {
        case 'revenue':
          return d.totalRevenue > 0;
        case 'expense':
          return d.totalExpense > 0;
        case 'profit':
          return d.profit !== 0;
        case 'roi':
          return d.roi !== null;
        default:
          return true;
      }
    });
    return data;
  }, [chartDataWithTrend, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={categoryFilter === 'all'}
              onChange={() => setCategoryFilter('all')}
              className="h-4 w-4"
            />
            Todos
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={categoryFilter === 'revenue'}
              onChange={() => setCategoryFilter('revenue')}
              className="h-4 w-4"
            />
            Com receita
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={categoryFilter === 'expense'}
              onChange={() => setCategoryFilter('expense')}
              className="h-4 w-4"
            />
            Com gastos
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showTrendLine}
              onChange={(e) => setShowTrendLine(e.target.checked)}
              className="h-4 w-4"
            />
            Linha de tendência
          </label>
        </div>
      </div>

      {/* Gráfico Receita x Gasto */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-4 font-semibold">Receita x Gasto</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateShort" />
              <YAxis tickFormatter={(v) => `R$ ${v}`} />
              <Tooltip
                formatter={(v: number) => formatBRL(v)}
                labelFormatter={(_, items) =>
                  items?.[0]?.payload?.date &&
                  new Date(items[0].payload.date).toLocaleDateString('pt-BR')
                }
              />
              <Legend />
              <Bar dataKey="totalRevenue" name="Receita" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalExpense" name="Gasto" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos Lucro e ROI */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-4 font-semibold">Lucro</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateShort" />
                <YAxis tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip
                  formatter={(v: number) => formatBRL(v)}
                  labelFormatter={(_, items) =>
                    items?.[0]?.payload?.date &&
                    new Date(items[0].payload.date).toLocaleDateString('pt-BR')
                  }
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Lucro"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                {showTrendLine && (
                  <Line
                    type="monotone"
                    dataKey="trendProfit"
                    name="Tendência"
                    stroke="#059669"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-4 font-semibold">ROI ao longo do tempo</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateShort" />
                <YAxis tickFormatter={(v) => `${v}x`} />
                <Tooltip
                  formatter={(v: number | null) => (v !== null ? `${v.toFixed(2)}x` : '—')}
                  labelFormatter={(_, items) =>
                    items?.[0]?.payload?.date &&
                    new Date(items[0].payload.date).toLocaleDateString('pt-BR')
                  }
                />
                <Line
                  type="monotone"
                  dataKey="roi"
                  name="ROI"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                {showTrendLine && (
                  <Line
                    type="monotone"
                    dataKey="trendRoi"
                    name="Tendência"
                    stroke="#2563eb"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
