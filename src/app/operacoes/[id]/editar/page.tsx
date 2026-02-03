import { redirect, notFound } from 'next/navigation';
import { getSession, getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { OperationEditForm } from '@/components/operations/OperationEditForm';

export default async function EditarOperacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/operacoes/${id}`} className="text-primary hover:underline">← Voltar</Link>
          <h1 className="text-xl font-bold">Editar Operação</h1>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <OperationEditForm operation={operation} />
      </div>
    </main>
  );
}
