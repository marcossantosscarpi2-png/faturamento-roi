'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PERIODS = [
  { value: 1, label: 'Hoje' },
  { value: 7, label: '7 dias' },
  { value: 15, label: '15 dias' },
  { value: 30, label: '30 dias' },
];

export function PeriodSelector({
  operationId,
  currentPeriod,
}: {
  operationId: string;
  currentPeriod: number;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: botões em linha */}
      <div className="hidden sm:flex gap-2 flex-wrap">
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={`/operacoes/${operationId}?period=${p.value}`}
            className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium transition flex items-center ${
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
      {/* Mobile: select */}
      <div className="sm:hidden w-full max-w-[180px]">
        <label htmlFor="period-select" className="sr-only">Período</label>
        <select
          id="period-select"
          value={currentPeriod}
          onChange={(e) => {
            const val = e.target.value;
            window.location.href = `${pathname}?period=${val}`;
          }}
          className="w-full rounded-lg border bg-background px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] appearance-none"
          aria-label="Selecionar período"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
