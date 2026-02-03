import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';
import Link from 'next/link';

export async function OperationsList() {
  const userId = await getCurrentUserId();
  const operations = await prisma.operation.findMany({
    where: userId != null ? { userId } : {},
    orderBy: { name: 'asc' },
  });

  if (operations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground mb-4">Nenhuma operação cadastrada.</p>
        <Link
          href="/operacoes/nova"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Criar primeira operação
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {operations.map((op) => (
        <Link
          key={op.id}
          href={`/operacoes/${op.id}`}
          className="block rounded-xl border bg-card p-6 shadow-sm transition-smooth hover:shadow-md hover:scale-[1.02] animate-fade-in"
        >
          <h3 className="font-semibold text-lg">{op.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Orçamento diário: {Number(op.dailyBudget).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="mt-1 text-xs text-muted-foreground truncate">PIX: {op.pixAccount}</p>
        </Link>
      ))}
    </div>
  );
}
