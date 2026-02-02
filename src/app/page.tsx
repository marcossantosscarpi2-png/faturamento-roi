import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { OperationsList } from '@/components/operations/OperationsList';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Link from 'next/link';

export default async function HomePage() {
  const hasPassword = !!process.env.APP_PASSWORD;
  const session = await getSession();

  if (hasPassword && !session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-800">Faturamento & ROI</h1>
            <p className="text-muted-foreground mt-2">Gestão de faturamento e ROI para sua empresa</p>
          </div>
          <LoginForm />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Faturamento & ROI</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold">Operações</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/operacoes/comparar"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted min-h-[44px] sm:min-h-0 flex items-center"
            >
              Comparar operações
            </Link>
            <a
              href="/api/backup"
              download
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted min-h-[44px] sm:min-h-0 flex items-center"
            >
              Exportar backup (JSON)
            </a>
            <Link
              href="/operacoes/nova"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 min-h-[44px] sm:min-h-0 flex items-center"
            >
              Nova Operação
            </Link>
          </div>
        </div>
        <OperationsList />
      </div>
    </main>
  );
}
