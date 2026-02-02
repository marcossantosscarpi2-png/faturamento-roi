import { formatBRL } from '@/lib/utils';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

interface Insights {
  roiVariation: number | null;
  daysAboveAvg: number;
  avgExpense: number;
}

export function InsightsSection({ insights }: { insights: Insights }) {
  return (
    <div className="rounded-xl border bg-card p-6 animate-fade-in" aria-labelledby="insights-heading">
      <h3 className="mb-4 flex items-center gap-2 font-semibold" id="insights-heading">
        <Lightbulb className="h-4 w-4 text-muted-foreground" aria-hidden />
        Insights
      </h3>
      <div className="space-y-4">
        {insights.roiVariation !== null && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
              Variação de ROI
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {insights.roiVariation >= 0 ? '+' : ''}
              {insights.roiVariation.toFixed(1)}% (comparando primeira e segunda metade do período)
            </p>
          </div>
        )}
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
            Dias com gastos acima da média
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {insights.daysAboveAvg} dia(s) (média: {formatBRL(insights.avgExpense)})
          </p>
        </div>
      </div>
    </div>
  );
}
