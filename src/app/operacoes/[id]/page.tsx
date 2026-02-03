import { redirect, notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getSession, getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { OperationDashboard } from '@/components/dashboard/OperationDashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export default async function OperacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ period?: string; start?: string; end?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  if (!session) redirect('/');

  const userId = await getCurrentUserId();
  const { id } = await params;
  const where: { id: string; userId?: string | null } = { id };
  if (userId != null) where.userId = userId;

  const operation = await prisma.operation.findFirst({
    where,
  });

  if (!operation) notFound();

  const periodParam = sp?.period ? parseInt(sp.period, 10) : 7;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <Breadcrumb
              items={[
                { label: 'Operações', href: '/' },
                { label: operation.name },
              ]}
            />
            <h1 className="text-xl font-bold truncate">{operation.name}</h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <Link
              href={`/operacoes/${id}/editar`}
              className="text-sm text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center"
            >
              Editar
            </Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <OperationDashboard operationId={id} period={periodParam} />
        </Suspense>
      </div>
    </main>
  );
}
