import { redirect } from 'next/navigation';
import { getSession, getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOperationStats } from '@/lib/data';
import { formatBRL, formatROIx } from '@/lib/utils';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ComparisonTable } from './ComparisonTable';

export default async function CompararPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/');

  const userId = await getCurrentUserId();
  const sp = await searchParams;
  const period = sp?.period ? parseInt(sp.period, 10) : 7;
  const validPeriod = [1, 7, 15, 30].includes(period) ? period : 7;

  const operations = await prisma.operation.findMany({
    where: userId != null ? { userId } : {},
    orderBy: { name: 'asc' },
  });

  const statsByOp = await Promise.all(
    operations.map(async (op) => {
      const stats = await getOperationStats(op.id, validPeriod);
      return {
        id: op.id,
        name: op.name,
        ...stats,
      };
    })
  );

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Breadcrumb
              items={[
                { label: 'Operações', href: '/' },
                { label: 'Comparar operações' },
              ]}
            />
            <h1 className="text-xl font-bold">Comparar operações</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground min-h-[44px] sm:min-h-0 flex items-center"
            >
              ← Voltar
            </Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <ComparisonTable
          statsByOp={statsByOp}
          currentPeriod={validPeriod}
        />
      </div>
    </main>
  );
}
