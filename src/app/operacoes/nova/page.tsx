import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { OperationForm } from '@/components/operations/OperationForm';
import Link from 'next/link';

export default async function NovaOperacaoPage() {
  const session = await getSession();
  if (!session) redirect('/');

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-primary hover:underline">← Voltar</Link>
          <h1 className="text-xl font-bold">Nova Operação</h1>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <OperationForm />
      </div>
    </main>
  );
}
